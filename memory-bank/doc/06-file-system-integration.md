# ファイルシステム統合とTauri API

## 概要

CommandForgeEditorは、Tauriを使用してネイティブファイルシステムにアクセスします。開発環境と本番環境で異なる実装を使用し、シームレスな開発体験を提供します。

## アーキテクチャ

### 抽象化レイヤー

```typescript
// utils/fileSystem.ts
export interface FileSystemAPI {
  readTextFile: (path: string) => Promise<string>;
  writeTextFile: (path: string, content: string) => Promise<void>;
  readDir: (path: string) => Promise<FileEntry[]>;
  createDir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
  exists: (path: string) => Promise<boolean>;
  removeFile: (path: string) => Promise<void>;
  removeDir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
}

export interface FileEntry {
  path: string;
  name?: string;
  children?: FileEntry[];
}
```

### 環境別実装

#### 本番環境 (Tauri)

```typescript
// utils/fileSystem.ts
import { 
  readTextFile as tauriReadTextFile,
  writeTextFile as tauriWriteTextFile,
  readDir as tauriReadDir,
  createDir as tauriCreateDir,
  exists as tauriExists,
  removeFile as tauriRemoveFile,
  removeDir as tauriRemoveDir
} from '@tauri-apps/api/fs';

const productionFileSystem: FileSystemAPI = {
  readTextFile: tauriReadTextFile,
  writeTextFile: tauriWriteTextFile,
  readDir: tauriReadDir,
  createDir: tauriCreateDir,
  exists: tauriExists,
  removeFile: tauriRemoveFile,
  removeDir: tauriRemoveDir,
};
```

#### 開発環境 (Mock)

```typescript
// utils/devFileSystem.ts
const DEV_BASE_URL = '/src/sample';

export const devFileSystem: FileSystemAPI = {
  readTextFile: async (path: string) => {
    // サンプルファイルをfetchで読み込み
    const normalizedPath = path.replace(/\\/g, '/');
    
    if (normalizedPath.includes('commands.yaml')) {
      const response = await fetch(`${DEV_BASE_URL}/commands.yaml`);
      return response.text();
    }
    
    if (normalizedPath.includes('skits/') && normalizedPath.endsWith('.json')) {
      const fileName = normalizedPath.split('/').pop();
      const response = await fetch(`${DEV_BASE_URL}/skits/${fileName}`);
      return response.text();
    }
    
    throw new Error(`File not found: ${path}`);
  },
  
  writeTextFile: async (path: string, content: string) => {
    console.log(`[Dev] Writing to ${path}:`, content);
    // 開発環境では実際の書き込みは行わない
  },
  
  readDir: async (path: string) => {
    if (path.includes('skits')) {
      // ハードコードされたサンプルファイルリスト
      return [
        { path: 'sample_skit.json', name: 'sample_skit.json' }
      ];
    }
    return [];
  },
  
  createDir: async () => {
    console.log('[Dev] Directory creation simulated');
  },
  
  exists: async () => true,
  
  removeFile: async (path: string) => {
    console.log(`[Dev] File removal simulated: ${path}`);
  },
  
  removeDir: async (path: string) => {
    console.log(`[Dev] Directory removal simulated: ${path}`);
  }
};
```

### 統一インターフェース

```typescript
// utils/fileSystem.ts
export const fileSystem: FileSystemAPI = 
  typeof window !== 'undefined' && window.__TAURI__
    ? productionFileSystem
    : devFileSystem;
```

## Tauri API の使用

### 1. ダイアログAPI

```typescript
import { open } from '@tauri-apps/api/dialog';

// プロジェクトフォルダの選択
export async function selectProjectFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
    title: 'プロジェクトフォルダを選択'
  });
  
  return selected as string | null;
}

// ファイル保存ダイアログ
export async function saveFileDialog(
  defaultPath?: string
): Promise<string | null> {
  const filePath = await save({
    filters: [{
      name: 'JSON Files',
      extensions: ['json']
    }],
    defaultPath
  });
  
  return filePath;
}
```

### 2. パスAPI

```typescript
import { 
  appDataDir, 
  join, 
  dirname, 
  basename 
} from '@tauri-apps/api/path';

// アプリケーションデータディレクトリの取得
export async function getAppDataPath(): Promise<string> {
  return await appDataDir();
}

// パスの結合
export async function joinPath(...segments: string[]): Promise<string> {
  return await join(...segments);
}

// ディレクトリ名の取得
export async function getDirname(path: string): Promise<string> {
  return await dirname(path);
}

// ファイル名の取得
export async function getBasename(path: string): Promise<string> {
  return await basename(path);
}
```

### 3. プロジェクト構造の管理

```typescript
export class ProjectManager {
  private projectPath: string;
  
  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }
  
  async initialize(): Promise<void> {
    // 必要なディレクトリ構造を作成
    const skitsDir = await join(this.projectPath, 'skits');
    
    if (!await exists(skitsDir)) {
      await createDir(skitsDir, { recursive: true });
    }
    
    // commands.yamlが存在しない場合はテンプレートを作成
    const commandsPath = await join(this.projectPath, 'commands.yaml');
    if (!await exists(commandsPath)) {
      await this.createDefaultCommandsYaml(commandsPath);
    }
  }
  
  private async createDefaultCommandsYaml(path: string): Promise<void> {
    const defaultContent = `
commands:
  - id: "show_text"
    label: "テキスト表示"
    description: "画面にテキストを表示"
    commandListLabelFormat: "{text}"
    properties:
      text:
        type: "string"
        label: "テキスト"
        required: true
`;
    
    await writeTextFile(path, defaultContent);
  }
  
  async loadCommands(): Promise<CommandDefinition[]> {
    const path = await join(this.projectPath, 'commands.yaml');
    const content = await readTextFile(path);
    return parseYaml(content).commands;
  }
  
  async loadSkits(): Promise<Record<string, Skit>> {
    const skitsDir = await join(this.projectPath, 'skits');
    const files = await readDir(skitsDir);
    const skits: Record<string, Skit> = {};
    
    for (const file of files) {
      if (file.name?.endsWith('.json')) {
        const content = await readTextFile(file.path);
        const skit = JSON.parse(content) as Skit;
        const id = file.name.replace('.json', '');
        skits[id] = skit;
      }
    }
    
    return skits;
  }
  
  async saveSkit(id: string, skit: Skit): Promise<void> {
    const path = await join(this.projectPath, 'skits', `${id}.json`);
    const content = JSON.stringify(skit, null, 2);
    await writeTextFile(path, content);
  }
  
  async deleteSkit(id: string): Promise<void> {
    const path = await join(this.projectPath, 'skits', `${id}.json`);
    await removeFile(path);
  }
}
```

## ファイル監視とホットリロード

```typescript
import { watchImmediate } from '@tauri-apps/api/fs';

export class FileWatcher {
  private unwatchers: Map<string, () => void> = new Map();
  
  async watchCommandsFile(
    projectPath: string, 
    onChange: () => void
  ): Promise<void> {
    const commandsPath = await join(projectPath, 'commands.yaml');
    
    // 既存の監視を停止
    this.stopWatching(commandsPath);
    
    // 新しい監視を開始
    const unwatch = await watchImmediate(
      commandsPath,
      (event) => {
        if (event.type === 'modify') {
          onChange();
        }
      }
    );
    
    this.unwatchers.set(commandsPath, unwatch);
  }
  
  stopWatching(path: string): void {
    const unwatch = this.unwatchers.get(path);
    if (unwatch) {
      unwatch();
      this.unwatchers.delete(path);
    }
  }
  
  stopAllWatching(): void {
    this.unwatchers.forEach(unwatch => unwatch());
    this.unwatchers.clear();
  }
}
```

## エラーハンドリング

```typescript
export class FileSystemError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'PERMISSION_DENIED' | 'INVALID_PATH' | 'UNKNOWN',
    public path?: string
  ) {
    super(message);
    this.name = 'FileSystemError';
  }
}

export async function safeReadFile(path: string): Promise<string | null> {
  try {
    return await readTextFile(path);
  } catch (error) {
    if (error.message?.includes('No such file')) {
      throw new FileSystemError(
        `ファイルが見つかりません: ${path}`,
        'NOT_FOUND',
        path
      );
    }
    
    if (error.message?.includes('Permission denied')) {
      throw new FileSystemError(
        `ファイルへのアクセスが拒否されました: ${path}`,
        'PERMISSION_DENIED',
        path
      );
    }
    
    throw new FileSystemError(
      `ファイルの読み込みに失敗しました: ${error.message}`,
      'UNKNOWN',
      path
    );
  }
}
```

## セキュリティ設定

### Tauri設定 (tauri.conf.json)

```json
{
  "tauri": {
    "allowlist": {
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "createDir": true,
        "removeFile": true,
        "removeDir": true,
        "exists": true,
        "scope": [
          "$DOCUMENT/*",
          "$DOWNLOAD/*",
          "$HOME/CommandForgeProjects/**"
        ]
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      },
      "path": {
        "all": true
      }
    }
  }
}
```

## ベストプラクティス

### 1. パスの正規化

```typescript
export function normalizePath(path: string): string {
  // Windows/Unix パスの統一
  return path.replace(/\\/g, '/');
}
```

### 2. 非同期処理の適切な管理

```typescript
export async function batchFileOperations<T>(
  operations: Array<() => Promise<T>>
): Promise<T[]> {
  // 並列実行で高速化
  return Promise.all(operations.map(op => op()));
}
```

### 3. ファイルロックの考慮

```typescript
export class FileLock {
  private locks = new Set<string>();
  
  async withLock<T>(
    path: string, 
    operation: () => Promise<T>
  ): Promise<T> {
    // ロックを待機
    while (this.locks.has(path)) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    this.locks.add(path);
    try {
      return await operation();
    } finally {
      this.locks.delete(path);
    }
  }
}
```