# i18n 仕様書（Moore's Command Editor）

本仕様はエディタ UI とプロジェクト（コマンド定義）で利用する翻訳データの構造、配置パス、読み込み規約を定義します。既存実装（frontend/src/i18n 配下）に準拠しています。

## 目的と適用範囲
- エディタ UI 固定文言（アプリ内に同梱。必要に応じて上書き可能）
- プロジェクト側のコマンド／プロパティ名・説明・プレースホルダー・列挙値
- 実行時の読み込み元と優先順位、ファイル命名規則

## 実行時の挙動（概要）
- 初期化: `frontend/src/i18n/config.ts` で i18next を初期化。
  - 既定言語: 日本語（`lng: 'ja'`）／フォールバック: 英語（`fallbackLng: 'en'`）
  - React: Suspense 無効（`useSuspense: false`）
- 動的ロード: `frontend/src/i18n/translationLoader.ts` の `loadTranslations()` がプロジェクト翻訳を追加ロード。
  - Tauri 以外（開発／テスト）: `frontend/src/sample/i18n/*.json` をフェッチ
  - Tauri 実行時: `projectPath/i18n/*.json` をファイル I/O で読み込み
- マージ優先度: アプリ内固定リソース → プロジェクト翻訳で上書き（同一キー）

## 置き場所（JSON パス）
- 開発・テスト用サンプル
  - `frontend/src/sample/i18n/english.json`
  - `frontend/src/sample/i18n/japanese.json`
- プロダクション（Tauri 実行時のプロジェクト）
  - `<projectPath>/i18n/english.json`
  - `<projectPath>/i18n/japanese.json`
  - `<projectPath>/i18n/chinese.json`
  - `<projectPath>/i18n/spanish.json`

備考:
- 実際に言語コードとして使用されるのは各 JSON の `locale` フィールドです（ファイル名は検出対象の候補）。
- `projectPath` はアプリのストアで選択されたプロジェクトルートです（`useSkitStore.getState().projectPath`）。

## JSON フォーマット（厳密定義）
TypeScript による型定義（参考）:

```ts
// 言語コードは BCP 47 推奨（例: 'en', 'ja', 'zh', 'es' など）
export type LocaleCode = string;

export interface TranslationFile {
  locale: LocaleCode;            // 必須: 使用する言語コード
  name: string;                  // 必須: 言語表示名（例: "English", "日本語"）
  translations: Record<string, string>; // 必須: 翻訳キー → 文字列
}
```

必須キー:
- `locale`: 例 `"en"`, `"ja"`
- `name`: 例 `"English"`, `"Japanese"`
- `translations`: 平坦（フラット）なキーの辞書。値はすべて文字列。

## 翻訳キー設計（命名規則）
- UI 固定文言（アプリ同梱; プロジェクトで上書き可）
  - `editor.*`（メニュー、ツールバー、パネル、ダイアログ、バリデーション、共通ラベル）
  - `language.*`（言語 UI 用のラベル群）
  - `skitList.*`
- コマンド関連（プロジェクト側が提供）
  - 基本:
    - `command.{commandId}.name`
    - `command.{commandId}.description`
  - プロパティ:
    - `command.{commandId}.property.{propKey}.name`
    - `command.{commandId}.property.{propKey}.description`
    - `command.{commandId}.property.{propKey}.placeholder`
  - 列挙値（enum がある場合）:
    - `command.{commandId}.property.{propKey}.enum.{EnumValue}`

生成ヘルパー: `generateCommandTranslationKeys(command)` が上記パターンのキー一覧を生成。

注意:
- キーはドット区切りのフラット文字列。入れ子 JSON は使用しません。
- `{EnumValue}` は元定義の値と完全一致（大文字小文字・スペース含む）。

## 文字列の書式と補間
- 補間（i18next 互換 Mustache 形式）: `{{name}}`, `{{count}}` など
  - 例: `editor.toolbar.commandAdded: "{{command}} added"`
- HTML は原則含めない（エスケープに依存しない安全な表現を推奨）
- 改行が必要な場合は `\n` を利用

## 言語の検出・選択
- 既定: 日本語（`ja`）
- フォールバック: 英語（`en`）
- 開発モードでは `localStorage.i18nextLng` を `ja` に設定（`src/main.tsx`）
- 利用可能言語の一覧はロード済みリソースから算出（`getAvailableLanguages()`）

## マージと優先度
1. アプリ内固定翻訳（`config.ts` の `editorTranslations`）が初期ロード
2. プロジェクト翻訳（`translationLoader.ts`）を同一 `namespace: 'translation'` に追加入力
3. 同一キーが存在する場合、プロジェクト側で上書き

## バリデーション・品質チェック
- JSON が妥当（コメント不可・UTF-8 推奨）
- `locale` が正しい（BCP 47 準拠を推奨、例: `en`, `ja`）
- `translations` の値はすべて非空文字列
- 重複キーなし（同一ファイル内）
- 列挙値キーの末尾 `{EnumValue}` は元データ定義と完全一致
- 必要キー（`name`, `description` 等）が網羅されていること（`generateCommandTranslationKeys` で検出可）

## 拡張と追加言語
- 新しい言語を追加するには `<projectPath>/i18n/{languageName}.json` を作成し、`locale` に適切なコードを設定
- ローダーはファイル名 `english|japanese|chinese|spanish` を探索しますが、実際の適用言語は JSON 内の `locale` に従います
- 追加の言語ファイル拡張を行う場合は、ローダー側の探索リスト拡張が必要です

## 例（最小）
`english.json`
```json
{
  "locale": "en",
  "name": "English",
  "translations": {
    "command.text.name": "Text",
    "command.text.description": "Display dialogue",
    "command.text.property.body.name": "Body",
    "command.text.property.body.description": "Dialogue content",
    "command.text.property.body.placeholder": "Enter dialogue text"
  }
}
```

`japanese.json`
```json
{
  "locale": "ja",
  "name": "日本語",
  "translations": {
    "command.text.name": "テキスト",
    "command.text.description": "セリフを表示",
    "command.text.property.body.name": "本文",
    "command.text.property.body.description": "セリフ内容",
    "command.text.property.body.placeholder": "セリフを入力"
  }
}
```

## 関連ソース
- 設定: `frontend/src/i18n/config.ts`
- ローダー: `frontend/src/i18n/translationLoader.ts`
- 初期化: `frontend/src/main.tsx`
- サンプル: `frontend/src/sample/i18n/*.json`

## 運用メモ
- プロジェクト翻訳で UI 固定キー（`editor.*` 等）を定義すると同梱文言を上書き可能。ただし、推奨はコマンド関連キーの提供。
- JSON 変更の反映にはアプリの再読み込みが必要。
- 型の観点から、`translations` は `Record<string, string>` を維持し、曖昧な `any` の使用は避けること。

