# アーキテクチャ詳細

## システム構成

CommandForgeEditorは、モダンなWebテクノロジーとネイティブデスクトップ機能を組み合わせた2層アーキテクチャを採用しています。

### レイヤー構成

```
┌─────────────────────────────────────────────┐
│          Presentation Layer (React)          │
│  - Components                                │
│  - Hooks                                     │
│  - UI Libraries (Shadcn, Tailwind)         │
├─────────────────────────────────────────────┤
│         State Management (Zustand)           │
│  - Application State                         │
│  - History Management                        │
│  - Persistence                              │
├─────────────────────────────────────────────┤
│           Business Logic Layer               │
│  - Validation                                │
│  - Command Processing                        │
│  - File Operations                           │
├─────────────────────────────────────────────┤
│        Desktop Integration (Tauri)           │
│  - File System Access                        │
│  - Native Dialogs                            │
│  - Window Management                         │
└─────────────────────────────────────────────┘
```

## コアモジュール

### 1. フロントエンドアーキテクチャ

#### エントリーポイント
- `main.tsx`: アプリケーションのエントリーポイント
- `App.tsx`: ルートコンポーネント、プロバイダー設定

#### コンポーネント構成
```
components/
├── layout/
│   └── MainLayout.tsx      # メインレイアウト
├── skit/
│   ├── SkitList.tsx       # スキット一覧
│   ├── CommandList.tsx    # コマンドリスト
│   ├── CommandEditor.tsx  # プロパティエディタ
│   ├── Toolbar.tsx        # ツールバー
│   └── ValidationLog.tsx  # 検証ログ
├── dnd/
│   ├── DndProvider.tsx    # DnDコンテキスト
│   ├── DraggableCommand.tsx
│   └── DropZone.tsx
└── ui/                    # Shadcn UIコンポーネント
```

### 2. 状態管理アーキテクチャ

#### Zustand Store構造
```typescript
interface SkitStore {
  // State
  skits: Record<string, Skit>
  currentSkitId: string | null
  selectedCommandIds: number[]
  commandDefinitions: CommandDefinition[]
  validationErrors: ValidationError[]
  projectPath: string
  hasUnsavedChanges: boolean
  history: HistoryState
  
  // Actions
  loadProject: (path: string) => Promise<void>
  createSkit: (title: string) => void
  updateCommand: (id: number, updates: Partial<SkitCommand>) => void
  // ... その他のアクション
}
```

#### 状態更新フロー
1. **アクション呼び出し**: UIコンポーネントからアクションを呼び出し
2. **Immerによる更新**: イミュータブルな状態更新
3. **履歴記録**: undoableアクションの場合、履歴に記録
4. **検証実行**: 更新後の状態を検証
5. **UI再レンダリング**: Reactの再レンダリング

### 3. ファイルシステム統合

#### 抽象化レイヤー
```typescript
// fileSystem.ts - 本番環境用
export interface FileSystemAPI {
  readTextFile: (path: string) => Promise<string>
  writeTextFile: (path: string, content: string) => Promise<void>
  readDir: (path: string) => Promise<FileEntry[]>
  createDir: (path: string) => Promise<void>
  exists: (path: string) => Promise<boolean>
}

// devFileSystem.ts - 開発環境用
export const devFileSystem: FileSystemAPI = {
  // fetchを使用したモック実装
}
```

#### Tauri統合
- **ファイル操作**: `@tauri-apps/api/fs`
- **ダイアログ**: `@tauri-apps/api/dialog`
- **パス操作**: `@tauri-apps/api/path`

### 4. コマンドシステム

#### コマンド定義の読み込み
```yaml
# commands.yaml
commands:
  - id: "show_text"
    label: "テキスト表示"
    description: "画面にテキストを表示"
    commandListLabelFormat: "{characterName}: {text}"
    properties:
      text:
        type: "string"
        label: "テキスト"
        required: true
```

#### 予約コマンド
- `group_start`: グループ開始
- `group_end`: グループ終了
- システムで特別な処理が必要なコマンド

### 5. ドラッグ＆ドロップシステム

#### dnd-kit統合
```typescript
// DnDコンテキスト
<DndContext onDragEnd={handleDragEnd}>
  <SortableContext items={sortableItems}>
    {commands.map(cmd => (
      <SortableItem key={cmd.id} id={cmd.id}>
        <DraggableCommand command={cmd} />
      </SortableItem>
    ))}
  </SortableContext>
</DndContext>
```

#### ドロップゾーン計算
- グループ内外の判定
- 有効なドロップ位置の計算
- ネストレベルの管理

## パフォーマンス最適化

### 1. コンポーネント最適化
- `React.memo`による再レンダリング抑制
- `useCallback`/`useMemo`の適切な使用
- 仮想スクロールの実装（大量コマンド対応）

### 2. 状態管理最適化
- セレクター関数による部分購読
- バッチ更新によるレンダリング最適化
- Map/Setを使用した高速ルックアップ

### 3. ファイルI/O最適化
- 非同期処理によるUIブロッキング回避
- 差分更新による書き込み最小化
- キャッシング戦略

## セキュリティ考慮事項

### 1. ファイルアクセス制限
- プロジェクトフォルダ内のみアクセス可能
- 相対パス解決によるディレクトリトラバーサル防止

### 2. 入力検証
- YAMLパース時のサニタイズ
- JSONスキーマによる型検証
- XSS対策（React自動エスケープ）

### 3. Tauri設定
```json
{
  "tauri": {
    "allowlist": {
      "fs": {
        "scope": ["$APP/*"]
      }
    }
  }
}
```

## 拡張性

### 1. コマンドタイプの追加
- YAMLファイルに新しいコマンド定義を追加
- 必要に応じてカスタムプロパティタイプを実装

### 2. UIコンポーネントの拡張
- Shadcn UIコンポーネントの追加
- カスタムエディタコンポーネントの実装

### 3. プラグインシステム（将来）
- コマンドプロバイダーインターフェース
- カスタムバリデーター
- エクスポート形式の追加