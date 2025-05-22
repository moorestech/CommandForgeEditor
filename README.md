[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/moorestech/moores-command-editor)

# スキット編集ツール

ゲーム用の「シナリオ + 演出」スクリプト（＝ **スキット**）を、ノーコードで作成・管理できるデスクトップアプリです。

## 機能

- コマンドを組み合わせてスキットを構築
- コマンドの追加・並べ替え・削除に加え、コピー・切り取り・貼り付けをドラッグ & ドロップやショートカットで実行
- コマンド固有のプロパティを右側ペインで編集
- 「1 スキット = 1 JSON ファイル」でバージョン管理しやすい構造

## 技術スタック

- **フロントエンド**: React + Vite + TypeScript + Tailwind CSS
- **デスクトップ**: Tauri (Rust + webview)
- **状態管理**: Zustand + Immer
- **ドラッグ&ドロップ**: dnd-kit
- **バリデーション**: ajv (JSON Schema)
- **テスト**: Vitest + Playwright

## 開発環境のセットアップ

```bash
# フロントエンドの依存関係をインストール
cd frontend
npm install

# 開発サーバーを起動
npm run dev

# Tauriアプリを開発モードで起動
npm run tauri dev
```

## テスト

```bash
# ユニットテストを実行
cd frontend
npm run test

# ユニットテストをウォッチモードで実行
npm run test:watch

# ユニットテストをUIモードで実行
npm run test:ui

# E2Eテストを実行
npm run test:e2e
```

## ビルド

```bash
# フロントエンドをビルド
cd frontend
npm run build

# Tauriアプリをビルド
npm run tauri build
```

## プロジェクト構造

```
projectRoot/
├─ commands.yaml          # コマンド定義（設計者が随時更新）
└─ skits/                 # ここ以下はツールが自動生成
    ├─ script1.json
    ├─ script2.json
    └─ …
```

## コマンド定義

コマンドは `commands.yaml` ファイルで定義されています。例：

```yaml
version: 1
commands:
  - id: text
    label: テキスト
    description: 台詞を表示
    format: "TEXT: {character}, {body}"
    properties:
      character:
        type: enum
        options: ["キャラA", "キャラB"]
        required: true
      body:
        type: string
        multiline: true
        required: true
```

## スキットJSON仕様

```json
{
  "meta": {
    "title": "script1",
    "version": 1,
    "created": "2025-05-10T12:00:00+09:00",
    "modified": "2025-05-10T12:34:56+09:00"
  },
  "commands": [
    {
      "id": 1,
      "type": "text",
      "character": "キャラA",
      "body": "こんにちは"
    },
    {
      "id": 2,
      "type": "emote",
      "character": "キャラA",
      "emotion": "笑顔"
    }
  ]
}
```
