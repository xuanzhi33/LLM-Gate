use serde::Serialize;
use tauri::{AppHandle, Emitter};

#[derive(Clone, Serialize)]
pub struct ProxyStatusPayload {
    pub status: String,
    pub host: String,
    pub port: u16,
}

#[derive(Clone, Serialize)]
pub struct ProxyRequestPayload {
    pub method: String,
    pub model_id: String,
    pub path: String,
}

#[derive(Clone, Serialize)]
pub struct ProxyErrorPayload {
    pub title: String,
    pub message: String,
}

pub fn emit_status_change(
    app: &AppHandle,
    status: &str,
    host: &str,
    port: u16,
) -> Result<(), String> {
    app.emit(
        "proxy-status-change",
        ProxyStatusPayload {
            status: status.to_string(),
            host: host.to_string(),
            port,
        },
    )
    .map_err(|e| e.to_string())
}

pub fn emit_request(
    app: &AppHandle,
    method: &str,
    model_id: &str,
    path: &str,
) -> Result<(), String> {
    app.emit(
        "proxy-request",
        ProxyRequestPayload {
            method: method.to_string(),
            model_id: model_id.to_string(),
            path: path.to_string(),
        },
    )
    .map_err(|e| e.to_string())
}

pub fn emit_error(app: &AppHandle, title: &str, message: &str) -> Result<(), String> {
    app.emit(
        "proxy-error",
        ProxyErrorPayload {
            title: title.to_string(),
            message: message.to_string(),
        },
    )
    .map_err(|e| e.to_string())
}
