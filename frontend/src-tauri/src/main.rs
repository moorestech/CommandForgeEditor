// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, State};
use std::sync::Mutex;
use std::path::PathBuf;
use arboard::Clipboard;

// State to hold the current project path
struct ProjectState {
    path: Mutex<Option<String>>,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_commands_path(state: State<ProjectState>) -> Result<String, String> {
    let project_path = state.path.lock().unwrap();
    
    match &*project_path {
        Some(path) => {
            // Return the commands.yaml path within the project directory
            let commands_path = PathBuf::from(path).join("commands.yaml");
            Ok(commands_path.to_string_lossy().to_string())
        },
        None => {
            // No project path set, return error
            Err("No project path set".to_string())
        }
    }
}

#[tauri::command]
fn set_project_path(state: State<ProjectState>, path: String) -> Result<(), String> {
    let mut project_path = state.path.lock().unwrap();
    *project_path = Some(path);
    Ok(())
}

#[tauri::command]
fn get_project_path(state: State<ProjectState>) -> Result<Option<String>, String> {
    let project_path = state.path.lock().unwrap();
    Ok(project_path.clone())
}

#[tauri::command]
fn read_clipboard_text() -> Result<String, String> {
    let mut clipboard = Clipboard::new().map_err(|e| e.to_string())?;
    clipboard.get_text().map_err(|e| e.to_string())
}

#[tauri::command]
fn open_project_directory(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }
    
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| format!("Failed to open directory: {}", e))?;
    }
    
    #[cfg(target_os = "linux")]
    {
        // Try common file managers
        let file_managers = ["xdg-open", "nautilus", "dolphin", "thunar", "pcmanfm"];
        let mut opened = false;
        
        for fm in &file_managers {
            if let Ok(_) = std::process::Command::new(fm)
                .arg(&path)
                .spawn()
            {
                opened = true;
                break;
            }
        }
        
        if !opened {
            return Err("Failed to open directory: No suitable file manager found".to_string());
        }
    }
    
    Ok(())
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
        #[cfg(debug_assertions)] // only in development
        {
            app.get_window("main").unwrap().open_devtools();
        }
        Ok(())
    })
    .manage(ProjectState {
        path: Mutex::new(None),
    })
    .invoke_handler(tauri::generate_handler![
        get_commands_path,
        set_project_path,
        get_project_path,
        read_clipboard_text,
        open_project_directory
    ]) // Register all commands
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
