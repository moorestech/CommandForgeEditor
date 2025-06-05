# トラブルシューティングガイド

## よくある問題と解決方法

### 開発環境のセットアップ

#### 問題: npm installでエラーが発生する
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解決方法:**
```bash
# package-lock.jsonを削除して再インストール
rm package-lock.json
npm install

# または、legacy-peer-depsオプションを使用
npm install --legacy-peer-deps
```

#### 問題: Tauriアプリが起動しない
```
Error: failed to run custom build command for `app`
```

**解決方法:**
1. Rustがインストールされているか確認
```bash
rustc --version
# インストールされていない場合
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

2. Tauri CLIを再インストール
```bash
npm uninstall @tauri-apps/cli
npm install --save-dev @tauri-apps/cli
```

3. Rust依存関係を更新
```bash
cd src-tauri
cargo update
cargo build
```

### ランタイムエラー

#### 問題: ファイルの読み込みに失敗する
```
Error: No such file or directory (os error 2)
```

**原因と解決方法:**
1. **ファイルパスの確認**
   - 絶対パスを使用しているか確認
   - Windowsの場合、バックスラッシュをスラッシュに変換

```typescript
// Bad
const path = "commands.yaml";

// Good
const path = await join(projectPath, "commands.yaml");
```

2. **ファイルの存在確認**
```typescript
if (!await exists(filePath)) {
  console.error(`File not found: ${filePath}`);
  return;
}
```

3. **権限の確認**
   - Tauri設定でファイルアクセス権限を確認

#### 問題: コマンドが表示されない
**原因:**
- commands.yamlの構文エラー
- YAMLのインデントが正しくない

**解決方法:**
1. YAMLの構文を検証
```yaml
# 正しい例
commands:
  - id: "show_text"
    label: "テキスト表示"
    properties:
      text:
        type: "string"
        label: "テキスト"
```

2. ブラウザコンソールでエラーを確認
```typescript
// デバッグログを追加
console.log('Loaded commands:', commandDefinitions);
```

#### 問題: ドラッグ&ドロップが動作しない
**原因:**
- DndContextが正しく設定されていない
- コマンドIDが重複している

**解決方法:**
1. コンポーネントがDndProvider内にあるか確認
2. コマンドIDの一意性を確認
```typescript
// IDの重複をチェック
const ids = commands.map(c => c.id);
const hasDuplicates = ids.length !== new Set(ids).size;
if (hasDuplicates) {
  console.error('Duplicate command IDs found');
}
```

### パフォーマンス問題

#### 問題: UIが重い・反応が遅い
**原因:**
- 大量のコマンドで再レンダリングが頻発
- 不要なStore購読

**解決方法:**
1. **React.memoを使用**
```typescript
export const DraggableCommand = React.memo(({ command }: Props) => {
  // コンポーネント実装
}, (prevProps, nextProps) => {
  // カスタム比較ロジック
  return prevProps.command.id === nextProps.command.id &&
         prevProps.isSelected === nextProps.isSelected;
});
```

2. **セレクターで必要な部分のみ購読**
```typescript
// Bad
const store = useSkitStore();

// Good
const commands = useSkitStore(state => state.currentSkit?.commands);
```

3. **仮想スクロールの実装を検討**
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={commands.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>
      <DraggableCommand command={commands[index]} />
    </div>
  )}
</FixedSizeList>
```

### 保存関連の問題

#### 問題: 変更が保存されない
**原因:**
- hasUnsavedChangesフラグが正しく更新されていない
- ファイル書き込みエラー

**解決方法:**
1. Store状態を確認
```typescript
// デバッグ用
useEffect(() => {
  console.log('hasUnsavedChanges:', hasUnsavedChanges);
}, [hasUnsavedChanges]);
```

2. 保存処理のエラーハンドリング
```typescript
try {
  await saveProject();
  toast.success('保存しました');
} catch (error) {
  console.error('Save failed:', error);
  toast.error('保存に失敗しました: ' + error.message);
}
```

### ビルド関連の問題

#### 問題: TypeScriptのビルドエラー
```
Type error: Property 'X' does not exist on type 'Y'
```

**解決方法:**
1. 型定義を確認・更新
2. tsconfig.jsonの設定を確認
```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true
  }
}
```

#### 問題: Tauriビルドが失敗する
**解決方法:**
1. ターゲットプラットフォームの確認
```bash
rustup target list --installed
# 必要なターゲットを追加
rustup target add x86_64-pc-windows-msvc
```

2. 依存関係のクリーンビルド
```bash
cd src-tauri
cargo clean
cargo build --release
```

### デバッグ手法

#### 1. Storeのデバッグ
```typescript
// Zustand DevToolsを有効化
import { devtools } from 'zustand/middleware';

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

#### 2. ネットワークリクエストのデバッグ
```typescript
// 開発環境でのfetchインターセプト
if (import.meta.env.DEV) {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    console.log('Fetch:', args);
    const response = await originalFetch(...args);
    console.log('Response:', response);
    return response;
  };
}
```

#### 3. コンポーネントレンダリングの追跡
```typescript
// レンダリング回数の確認
function CommandList() {
  const renderCount = useRef(0);
  renderCount.current++;
  
  if (import.meta.env.DEV) {
    console.log(`CommandList rendered ${renderCount.current} times`);
  }
  
  // ...
}
```

### エラーレポート

エラーが解決しない場合は、以下の情報を含めて報告してください：

1. **環境情報**
```bash
# システム情報を取得
npx envinfo --system --browsers --npmPackages --binaries
```

2. **再現手順**
   - 問題が発生するまでの具体的な操作手順
   - 使用したデータ（可能であれば）

3. **エラーログ**
   - ブラウザコンソールのエラー
   - Tauriコンソールの出力
   - ビルドログ（ビルドエラーの場合）

4. **期待される動作と実際の動作**

### よくある質問

#### Q: 開発環境と本番環境で動作が異なる
A: ファイルシステムAPIの実装が異なるため。開発環境ではモックデータを使用。

#### Q: マルチプラットフォーム対応は？
A: Tauriが対応するすべてのプラットフォーム（Windows, macOS, Linux）で動作。

#### Q: データのバックアップは？
A: 現在は手動でプロジェクトフォルダをバックアップ。将来的に自動バックアップ機能を検討。

#### Q: 大量のコマンドでパフォーマンスが低下する
A: 仮想スクロールの実装、またはページネーションの導入を検討。

#### Q: カスタムコマンドタイプを追加したい
A: commands.yamlに定義を追加し、必要に応じてカスタムエディタコンポーネントを実装。