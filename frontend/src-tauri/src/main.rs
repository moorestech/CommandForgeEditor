// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_commands_path(app_handle: tauri::AppHandle) -> Result<String, String> {
    // ここでcommands.yamlのパスを決定するロジックを実装します。
    // 例: アプリケーションのデータディレクトリから取得、または設定ファイルから読み込む
    // 今回は、ユーザーが指定したパスを直接返すようにします。
    // 実際には、プロジェクトのロード/保存時にパスを保持する仕組みが必要です。
    // ここでは仮のパスを返します。
    // TODO: 実際のプロジェクトパスを動的に取得するロジックに置き換える必要があります。
    let commands_path = "/Users/katsumi.sato/moorestech/moorestech_client/Assets/AddressableResources/Skit/commands.yaml";
    Ok(commands_path.to_string())
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
    .invoke_handler(tauri::generate_handler![get_commands_path]) // ここでコマンドを登録
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
