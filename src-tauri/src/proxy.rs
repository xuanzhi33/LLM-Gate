use axum::{
    body::Body,
    extract::{Path, State},
    http::{HeaderMap, HeaderValue, Method, StatusCode},
    response::Response,
    routing::any,
    Router,
};
use bytes::Bytes;
use futures::future::AbortHandle;
use http_body_util::BodyExt;
use log::{debug, error};
use reqwest::Client;
use std::future::IntoFuture;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, State as TauriState};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

use crate::{
    config::load_model_config,
    events::{emit_request, emit_status_change},
};

#[derive(Clone)]
struct AppState {
    app_handle: AppHandle,
    client: Client,
}

pub struct ProxyState {
    pub server_handle: Arc<Mutex<Option<AbortHandle>>>,
}

impl ProxyState {
    pub fn new() -> Self {
        Self {
            server_handle: Arc::new(Mutex::new(None)),
        }
    }
}

#[tauri::command]
pub async fn start_proxy_server(
    app_handle: AppHandle,
    proxy_state: TauriState<'_, ProxyState>,
    host: String,
    port: u16,
) -> Result<String, String> {
    {
        let handle_guard = proxy_state
            .server_handle
            .lock()
            .map_err(|e| e.to_string())?;

        if handle_guard.is_some() {
            return Err("Proxy server is already running".to_string());
        }
    }

    let addr_str = format!("{}:{}", host, port);
    let addr = addr_str.clone(); // Clone for logging/return inside closure

    let state = AppState {
        app_handle: app_handle.clone(),
        client: Client::new(),
    };

    let app = Router::new()
        .route("/{model_id}/v1/{*path}", any(proxy_handler))
        .layer(CorsLayer::permissive())
        .with_state(state);

    debug!("Attempting to start proxy on {}", addr_str);

    let listener = TcpListener::bind(&addr_str)
        .await
        .map_err(|e| format!("Failed to bind to {}: {}", addr_str, e))?;

    let (abort_handle, abort_registration) = AbortHandle::new_pair();

    {
        let mut handle_guard = proxy_state
            .server_handle
            .lock()
            .map_err(|e| e.to_string())?;

        // Double check to handle race conditions
        if handle_guard.is_some() {
            return Err("Proxy server started by another request".to_string());
        }

        // Store the abort handle
        *handle_guard = Some(abort_handle);
    }

    // Spawn the server task
    tauri::async_runtime::spawn(async move {
        // Use future::abortable to allow cancellation
        let serve_future = axum::serve(listener, app).into_future();

        // Wrap with Abortable
        let abortable_future = futures::future::Abortable::new(serve_future, abort_registration);

        match abortable_future.await {
            Ok(result) => {
                if let Err(e) = result {
                    error!("Proxy server error: {}", e);
                } else {
                    debug!("Proxy server stopped gracefully.");
                }
            }
            Err(_) => {
                debug!("Proxy server aborted.");
            }
        }
    });

    emit_status_change(&app_handle, "running", &host, port)?;

    Ok(format!("Proxy server started on {}", addr))
}

#[tauri::command]
pub async fn stop_proxy_server(
    app_handle: AppHandle,
    proxy_state: TauriState<'_, ProxyState>,
) -> Result<String, String> {
    let mut handle_guard = proxy_state
        .server_handle
        .lock()
        .map_err(|e| e.to_string())?;

    if let Some(handle) = handle_guard.take() {
        handle.abort();
        debug!("Proxy server stop signal sent.");

        emit_status_change(&app_handle, "stopped", "", 0)?;

        Ok("Proxy server stopped".to_string())
    } else {
        Err("Proxy server is not running".to_string())
    }
}

async fn proxy_handler(
    State(state): State<AppState>,
    Path((model_id, path)): Path<(String, String)>,
    method: Method,
    headers: HeaderMap,
    body: Body,
) -> Result<Response, StatusCode> {
    // Emit request event
    if let Err(e) = emit_request(&state.app_handle, method.as_str(), &model_id, &path) {
        debug!("Failed to emit proxy request event: {}", e);
    }

    debug!("Incoming request: {} /{}/v1/{}", method, model_id, path);

    // 1. Load config
    let configs = load_model_config(&state.app_handle).map_err(|e| {
        error!("Failed to load config: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let config = match configs.into_iter().find(|c| c.id == model_id) {
        Some(c) => c,
        None => {
            debug!("Model ID not found in config: {}", model_id);
            return Err(StatusCode::NOT_FOUND);
        }
    };

    let base_url = match config.base_url {
        Some(url) => url.trim_end_matches('/').to_string(),
        None => {
            debug!("Base URL missing for model: {}", model_id);
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    // Construct target URL
    let target_url = format!("{}/{}", base_url, path);
    debug!("Target URL: {}", target_url);

    // 2. Prepare Headers
    let mut req_headers = headers.clone();
    req_headers.remove("host");
    req_headers.remove("content-length");

    if let Some(api_key) = config.api_key {
        if !api_key.is_empty() {
            let auth_value = format!("Bearer {}", api_key);
            if let Ok(val) = HeaderValue::from_str(&auth_value) {
                req_headers.insert("authorization", val);
                debug!("Injected Authorization header for model: {}", model_id);
            }
        }
    }

    // 3. Prepare Body
    let body_bytes = match body.collect().await {
        Ok(collected) => collected.to_bytes(),
        Err(e) => {
            debug!("Failed to read request body: {}", e);
            return Err(StatusCode::BAD_REQUEST);
        }
    };

    let mut final_body = body_bytes;

    // Check if we need to modify body to override model name
    let is_chat_or_messages = path.ends_with("chat/completions") || path.ends_with("messages");
    if is_chat_or_messages && method == Method::POST {
        if let Some(model_name) = config.model {
            if !model_name.is_empty() {
                // Try to parse as JSON
                if let Ok(mut json) = serde_json::from_slice::<serde_json::Value>(&final_body) {
                    if let Some(obj) = json.as_object_mut() {
                        debug!("Overriding model name to: {}", model_name);
                        obj.insert("model".to_string(), serde_json::Value::String(model_name));
                        if let Ok(new_bytes) = serde_json::to_vec(obj) {
                            final_body = Bytes::from(new_bytes);
                        }
                    }
                } else {
                    debug!("Failed to parse body as JSON for model override");
                }
            }
        }
    }

    // 4. Send Request
    let req = state
        .client
        .request(method.clone(), &target_url)
        .headers(req_headers)
        .body(final_body);

    debug!("Forwarding {} request to upstream: {}", method, target_url);

    let res = req.send().await.map_err(|e| {
        debug!("Upstream request failed: {}", e);
        StatusCode::BAD_GATEWAY
    })?;

    // 5. Build Response
    let status = res.status();
    debug!("Upstream response status: {}", status);

    let res_headers = res.headers().clone();

    // Stream the body
    let stream = res.bytes_stream();
    let body = Body::from_stream(stream);

    let mut response_builder = Response::builder().status(status);

    // Copy headers
    if let Some(headers_mut) = response_builder.headers_mut() {
        *headers_mut = res_headers;
    }

    response_builder.body(body).map_err(|e| {
        error!("Failed to build response: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })
}
