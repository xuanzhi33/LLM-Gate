use serde::{Deserialize, Serialize};
use std::fs;
use tauri::{AppHandle, Manager, path::BaseDirectory};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelConfig {
    pub id: String,
    pub model: Option<String>,
    pub base_url: Option<String>,
    pub api_key: Option<String>,
}

pub fn load_model_config(app: &AppHandle) -> Result<Vec<ModelConfig>, String> {
    let config_path = app.path().resolve("model-config.json", BaseDirectory::AppLocalData)
        .map_err(|e| format!("Failed to resolve config path: {}", e))?;

    if !config_path.exists() {
        return Ok(Vec::new());
    }

    let content = fs::read_to_string(&config_path)
        .map_err(|e| format!("Failed to read config file: {}", e))?;

    let configs: Vec<ModelConfig> = serde_json::from_str(&content)
        .map_err(|e| format!("Failed to parse config file: {}", e))?;

    Ok(configs)
}
