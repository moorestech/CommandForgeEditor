# 開発ガイド

## セットアップ

### 必要な環境
- Node.js 18以上
- Rust (Tauriビルド用)
- Git

### 初期セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-org/CommandForgeEditor.git
cd CommandForgeEditor

# フロントエンドの依存関係をインストール
cd frontend
npm install

# Rust依存関係をインストール (初回のみ)
cd src-tauri
cargo build
```

## 開発コマンド

### 開発サーバー起動

```bash
cd frontend

# Webブラウザで開発 (サンプルデータ使用)
npm run dev

# Tauriアプリとして開発 (実際のファイルシステム使用)
npm run tauri:dev
```

### テスト実行

```bash
# 単体テスト
npm run test

# テストをウォッチモードで実行
npm run test:watch

# E2Eテスト
npm run test:e2e

# カバレッジ付きテスト
npm run test:coverage
```

### コード品質チェック

```bash
# ESLint実行
npm run lint

# TypeScriptの型チェック
npm run build # ビルドプロセスで型チェックを実行
```

## アーキテクチャガイドライン

### ディレクトリ構成

```
frontend/src/
├── components/      # UIコンポーネント
│   ├── dnd/        # ドラッグ&ドロップ関連
│   ├── layout/     # レイアウトコンポーネント
│   ├── skit/       # スキット関連コンポーネント
│   └── ui/         # 基本UIコンポーネント
├── hooks/          # カスタムReactフック
├── store/          # Zustand store
├── types/          # TypeScript型定義
└── utils/          # ユーティリティ関数
```

### コーディング規約

#### TypeScript
- 明示的な型定義を優先
- `any`型の使用を避ける
- インターフェースは`I`プレフィックスなし
- 型は`Type`サフィックスなし

```typescript
// Good
interface CommandDefinition {
  id: string;
  label: string;
}

// Bad
interface ICommandDefinition { ... }
type CommandDefinitionType = { ... }
```

#### React
- 関数コンポーネントを使用
- カスタムフックは`use`プレフィックス
- PropsはコンポーネントごとにPropsインターフェース定義

```typescript
// Good
interface CommandListProps {
  commands: SkitCommand[];
  onSelect: (id: number) => void;
}

export function CommandList({ commands, onSelect }: CommandListProps) {
  // ...
}
```

#### 状態管理
- Zustand storeは機能ごとに分割
- 複雑な更新ロジックはアクション内に実装
- セレクターで必要な部分のみ購読

```typescript
// Good - 必要な部分のみ購読
const { addCommand, updateCommand } = useSkitStore(
  state => ({ 
    addCommand: state.addCommand, 
    updateCommand: state.updateCommand 
  }),
  shallow
);

// Bad - Store全体を購読
const store = useSkitStore();
```

## 新機能の追加

### 1. 新しいコマンドタイプの追加

1. `commands.yaml`に定義を追加:
```yaml
- id: "new_command"
  label: "新しいコマンド"
  description: "説明"
  commandListLabelFormat: "{property1}"
  properties:
    property1:
      type: "string"
      label: "プロパティ1"
      required: true
```

2. 必要に応じてカスタムエディタを実装:
```typescript
// components/skit/editors/NewCommandEditor.tsx
export function NewCommandEditor({ command, onChange }: Props) {
  // カスタムUI実装
}
```

### 2. 新しいプロパティタイプの追加

1. 型定義を更新:
```typescript
// types/index.ts
export type PropertyType = 
  | "string" 
  | "number"
  | "newType"; // 新しいタイプ
```

2. エディタコンポーネントを追加:
```typescript
// components/skit/PropertyEditor.tsx
case 'newType':
  return <NewTypeEditor {...props} />;
```

3. 検証ロジックを追加:
```typescript
// utils/validation.ts
function generatePropertySchema(prop: PropertyDefinition) {
  switch (prop.type) {
    case 'newType':
      return { /* JSON Schema */ };
  }
}
```

## デバッグ

### React DevTools
- コンポーネントツリーの確認
- Propsとステートの検査
- パフォーマンスプロファイリング

### Zustand DevTools
```typescript
// store/skitStore.ts
export const useSkitStore = create<SkitStore>()(
  devtools(
    immer((set, get) => ({
      // store implementation
    })),
    {
      name: 'skit-store',
    }
  )
);
```

### ログ出力
```typescript
// 開発環境のみでログ出力
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

## ビルドとデプロイ

### 開発ビルド

```bash
cd frontend
npm run build
```

### 本番ビルド

```bash
cd frontend

# すべてのプラットフォーム
npm run tauri:build

# 特定のプラットフォーム
npm run tauri:build -- --target x86_64-pc-windows-msvc
npm run tauri:build -- --target x86_64-apple-darwin
npm run tauri:build -- --target x86_64-unknown-linux-gnu
```

### リリースプロセス

1. バージョン更新:
```json
// frontend/package.json
{
  "version": "1.2.3"
}

// frontend/src-tauri/tauri.conf.json
{
  "package": {
    "version": "1.2.3"
  }
}
```

2. 変更履歴を更新
3. タグを作成してプッシュ
4. GitHub Actionsで自動ビルド

## トラブルシューティング

### よくある問題

#### Tauriビルドエラー
```bash
# Rust toolchainを更新
rustup update

# ターゲットを追加
rustup target add x86_64-pc-windows-msvc
```

#### 開発サーバーが起動しない
```bash
# node_modulesをクリア
rm -rf node_modules package-lock.json
npm install
```

#### TypeScriptエラー
```bash
# 型定義を再生成
npm run build
```

## パフォーマンス最適化

### React最適化
- `React.memo`で不要な再レンダリングを防止
- `useMemo`/`useCallback`で値の再計算を防止
- 大量のリストは仮想スクロールを検討

### Store最適化
- セレクターで必要な部分のみ購読
- バッチ更新で複数の状態変更をまとめる
- 大きなデータは正規化して保存

### ビルド最適化
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/*'],
        }
      }
    }
  }
});
```

## セキュリティ考慮事項

### CSP設定
```json
// tauri.conf.json
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; script-src 'self'"
    }
  }
}
```

### ファイルアクセス制限
- プロジェクトフォルダ外へのアクセスを制限
- ユーザー入力のサニタイズ
- パストラバーサル攻撃の防止

## 貢献ガイドライン

### ブランチ戦略
- `main`: 安定版
- `develop`: 開発版
- `feature/*`: 新機能
- `fix/*`: バグ修正

### コミットメッセージ
```
type(scope): subject

body

footer
```

例:
```
feat(commands): add new animation command type

- Added fade-in and fade-out animation options
- Updated command editor to support duration property

Closes #123
```

### プルリクエスト
1. featureブランチを作成
2. テストを追加/更新
3. ドキュメントを更新
4. プルリクエストを作成
5. レビューを受ける
6. マージ