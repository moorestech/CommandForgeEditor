# CommandForgeEditor 国際化(i18n)仕様書

## 1. 概要

CommandForgeEditorは、ゲーム開発者向けのビジュアルスクリプティングツールであり、多言語対応により世界中のユーザーが母国語で使用できることを目指します。本仕様書では、エディタUIとユーザー定義コマンドの両方を対象とした包括的な国際化システムを定義します。

### 1.1 対象範囲

- **エディタUI**: メニュー、ボタン、ダイアログなどの固定要素
- **ユーザー定義要素**: commands.yamlで定義されるコマンド名、プロパティ名、enum値などの動的要素

### 1.2 基本方針

- 翻訳ラベル（キー）による間接参照方式を採用
- 英語を基準言語とし、他言語への翻訳を提供
- 開発者とエンドユーザーの両方が翻訳を追加・編集可能

## 2. 翻訳ラベルの分類

### 2.1 固定翻訳ラベル（エディタUI）

エディタ本体のUI要素に使用される翻訳ラベルです。これらはソースコード内に直接記述されます。

#### ラベル体系
```
editor.menu.file
editor.menu.file.new
editor.menu.file.open
editor.menu.file.save
editor.menu.file.saveAs
editor.menu.edit
editor.menu.edit.undo
editor.menu.edit.redo
editor.menu.edit.cut
editor.menu.edit.copy
editor.menu.edit.paste
editor.toolbar.addCommand
editor.toolbar.deleteCommand
editor.panel.commandList
editor.panel.commandEditor
editor.panel.validation
editor.dialog.unsavedChanges
editor.dialog.confirmDelete
editor.error.fileNotFound
editor.error.invalidCommand
```

### 2.2 動的翻訳ラベル（ユーザー定義要素）

commands.yamlで定義される要素に対して、特定のルールに基づいて生成される翻訳ラベルです。

#### ラベル生成ルール

##### コマンド名
```
command.<commandId>.name
command.<commandId>.description
```

##### プロパティ名
```
command.<commandId>.property.<propertyKey>.name
command.<commandId>.property.<propertyKey>.description
command.<commandId>.property.<propertyKey>.placeholder
```

##### Enum値
```
command.<commandId>.property.<propertyKey>.enum.<enumValue>
```

#### 例
commands.yamlに以下の定義がある場合：
```yaml
commands:
  - id: dialogue
    properties:
      - key: speaker
        type: string
      - key: emotion
        type: enum
        enum: [happy, sad, angry]
```

生成される翻訳ラベル：
```
command.dialogue.name
command.dialogue.description
command.dialogue.property.speaker.name
command.dialogue.property.speaker.description
command.dialogue.property.emotion.name
command.dialogue.property.emotion.enum.happy
command.dialogue.property.emotion.enum.sad
command.dialogue.property.emotion.enum.angry
```

## 3. 翻訳ファイル構造

### 3.1 ファイル配置

```
project-root/
├── commands.yaml
└── i18n/
    ├── english.json      # デフォルト言語
    ├── japanese.json
    ├── chinese.json
    ├── spanish.json
    └── ...
```

### 3.2 ファイルフォーマット

#### english.json
```json
{
  "locale": "en",
  "name": "English",
  "translations": {
    "command.dialogue.name": "Dialogue",
    "command.dialogue.description": "Display character dialogue",
    "command.dialogue.property.speaker.name": "Speaker",
    "command.dialogue.property.speaker.description": "Character name who speaks",
    "command.dialogue.property.speaker.placeholder": "Enter character name",
    "command.dialogue.property.emotion.name": "Emotion",
    "command.dialogue.property.emotion.enum.happy": "Happy",
    "command.dialogue.property.emotion.enum.sad": "Sad",
    "command.dialogue.property.emotion.enum.angry": "Angry"
  }
}
```

#### japanese.json
```json
{
  "locale": "ja",
  "name": "日本語",
  "translations": {
    "command.dialogue.name": "ダイアログ",
    "command.dialogue.description": "キャラクターの会話を表示",
    "command.dialogue.property.speaker.name": "話者",
    "command.dialogue.property.speaker.description": "話すキャラクターの名前",
    "command.dialogue.property.speaker.placeholder": "キャラクター名を入力",
    "command.dialogue.property.emotion.name": "感情",
    "command.dialogue.property.emotion.enum.happy": "喜び",
    "command.dialogue.property.emotion.enum.sad": "悲しみ",
    "command.dialogue.property.emotion.enum.angry": "怒り"
  }
}
```

### 3.3 フォールバック仕様

1. 指定された言語の翻訳が存在しない場合は、英語（english.json）にフォールバック
2. 英語の翻訳も存在しない場合は、ラベルのキーをそのまま表示（開発時のデバッグ用）
3. 動的ラベルで翻訳が見つからない場合は、元のcommands.yamlの値を使用

## 4. 実装詳細

### 4.1 技術スタック

- **i18nライブラリ**: react-i18next
- **ファイル読み込み**: Tauri File System API
- **状態管理**: Zustand storeに現在の言語設定を保持

### 4.2 初期化フロー

1. アプリケーション起動時に、システムのロケール設定を検出
2. エディタUI用の固定翻訳を読み込み
3. commands.yamlのパスから`i18n`フォルダを特定
4. 利用可能な言語ファイルを検出
5. ユーザー設定または検出されたロケールに基づいて言語を選択
6. 選択された言語の翻訳ファイルを読み込み

### 4.3 動的ラベルの処理

1. commands.yamlが読み込まれた時点で、定義されている全要素の翻訳ラベルを生成
2. 生成されたラベルに対応する翻訳をi18nファイルから検索
3. 翻訳が見つかった場合は適用、見つからない場合はフォールバック処理

### 4.4 言語切り替え

1. ユーザーが言語を切り替えた場合、新しい言語の翻訳ファイルを読み込み
2. 全てのUI要素を再レンダリング
3. 設定をローカルストレージに保存し、次回起動時に復元

## 5. API設計

### 5.1 React Hooks

```typescript
// 翻訳フック
function useTranslation() {
  const t = (key: string, fallback?: string) => string;
  const i18n = {
    language: string;
    changeLanguage: (lang: string) => Promise<void>;
    languages: string[];
  };
  return { t, i18n };
}

// コマンド翻訳フック
function useCommandTranslation(commandId: string) {
  const tCommand = (suffix: string, fallback?: string) => string;
  const tProperty = (propertyKey: string, suffix: string, fallback?: string) => string;
  const tEnum = (propertyKey: string, enumValue: string, fallback?: string) => string;
  return { tCommand, tProperty, tEnum };
}
```

### 5.2 翻訳ヘルパー関数

```typescript
// 動的ラベル生成
function generateTranslationKey(type: 'command' | 'property' | 'enum', ...args: string[]): string;

// フォールバック処理
function getTranslationWithFallback(key: string, translations: Record<string, string>, fallback?: string): string;

// 言語ファイル検出
function detectAvailableLanguages(i18nPath: string): Promise<Language[]>;
```

## 6. UI統合

### 6.1 言語選択UI

- ツールバーまたは設定画面に言語選択ドロップダウンを配置
- 利用可能な言語を動的に表示
- 現在の言語をハイライト表示

### 6.2 翻訳エディター（将来的な拡張）

- 開発者向けの翻訳編集UIの提供
- 未翻訳項目のハイライト表示
- 翻訳の一括エクスポート/インポート機能

## 7. 開発ガイドライン

### 7.1 新しい固定ラベルの追加

1. 適切な階層構造のラベルキーを決定
2. ソースコード内で`t('editor.new.label')`として使用
3. 全ての言語ファイルに翻訳を追加

### 7.2 commands.yaml更新時の対応

1. 新しいコマンドやプロパティが追加された場合、自動的に翻訳ラベルが生成される
2. 対応する翻訳をi18nファイルに追加することで、翻訳が適用される
3. 翻訳がない場合は、commands.yamlの値がそのまま使用される

## 8. テスト戦略

### 8.1 単体テスト

- 翻訳ラベル生成ロジックのテスト
- フォールバック処理のテスト
- 言語切り替え機能のテスト

### 8.2 統合テスト

- 各言語でのUI表示確認
- 動的要素の翻訳適用確認
- ファイル読み込みエラー時の挙動確認

## 9. パフォーマンス考慮事項

- 翻訳ファイルは起動時に一度だけ読み込み、メモリにキャッシュ
- 言語切り替え時のみ再読み込み
- 大量の動的ラベルに対応するため、翻訳検索を効率化

## 10. 今後の拡張計画

- 右から左に記述する言語（RTL）のサポート
- 翻訳の自動検証ツール
- コミュニティによる翻訳貢献システム
- プラグインシステムとの統合