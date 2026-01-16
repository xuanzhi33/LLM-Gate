use log::info;
use tauri::Manager;

pub mod config;
pub mod proxy;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .level(tauri_plugin_log::log::LevelFilter::Info)
                .build(),
        )
        .plugin(tauri_plugin_fs::init())
        .manage(proxy::ProxyState::new())
        .invoke_handler(tauri::generate_handler![
            proxy::start_proxy_server,
            proxy::stop_proxy_server
        ])
        .setup(|app| {
            let _ = app.get_webview_window("main").unwrap();
            if cfg!(debug_assertions) {
                info!("App started in debug mode");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
