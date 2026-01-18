use log::info;
use tauri::Manager;

pub mod config;
pub mod events;
pub mod proxy;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
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
                // In debug mode, set log level to Debug
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Debug)
                        .build(),
                )?;
            } else {
                // In release mode, set log level to Info
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
