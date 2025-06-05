# CommandForgeEditor ドキュメント

このディレクトリには、CommandForgeEditorの包括的なドキュメントが含まれています。AIや新しく参加したエンジニアが、プロジェクトの全体像から詳細な実装まで理解できるように構成されています。

## ドキュメント構成

### 1. [概要](./01-overview.md)
プロジェクトの概要、主な特徴、技術スタックの紹介

### 2. [アーキテクチャ詳細](./02-architecture.md)
システム構成、コアモジュール、拡張性、セキュリティの詳細

### 3. [データモデル](./03-data-models.md)
コマンド定義、スキット、検証システムのデータ構造

### 4. [コンポーネント構成](./04-components.md)
UIコンポーネントの階層、主要コンポーネントの詳細、カスタムフック

### 5. [状態管理](./05-state-management.md)
Zustand + Immerによる状態管理の実装詳細

### 6. [ファイルシステム統合](./06-file-system-integration.md)
Tauri APIを使用したファイル操作とプロジェクト管理

### 7. [テスト戦略](./07-testing-strategy.md)
単体テスト、統合テスト、E2Eテストの実装方法

### 8. [開発ガイド](./08-development-guide.md)
セットアップ手順、コーディング規約、新機能の追加方法

### 9. [APIリファレンス](./09-api-reference.md)
Store API、ユーティリティ関数、型定義の詳細

### 10. [トラブルシューティング](./10-troubleshooting.md)
よくある問題と解決方法、デバッグ手法

## クイックスタート

### 開発環境のセットアップ

```bash
# リポジトリをクローン
git clone https://github.com/your-org/CommandForgeEditor.git
cd CommandForgeEditor

# 依存関係をインストール
cd frontend
npm install

# 開発サーバーを起動
npm run dev  # Webブラウザで開発
# または
npm run tauri:dev  # デスクトップアプリとして開発
```

### 主要なコマンド

```bash
# テスト実行
npm run test
npm run test:e2e

# コード品質チェック
npm run lint

# ビルド
npm run build          # Webビルド
npm run tauri:build   # デスクトップアプリビルド
```

## プロジェクト構造

```
CommandForgeEditor/
├── frontend/              # Reactアプリケーション
│   ├── src/
│   │   ├── components/   # UIコンポーネント
│   │   ├── store/       # Zustand状態管理
│   │   ├── types/       # TypeScript型定義
│   │   └── utils/       # ユーティリティ関数
│   └── src-tauri/       # Tauriバックエンド
├── memory-bank/         # プロジェクトドキュメント
│   └── doc/            # このドキュメント
└── specification/       # 仕様書
```

## アーキテクチャの要点

- **フロントエンド**: React + TypeScript + Vite
- **状態管理**: Zustand + Immer
- **UIライブラリ**: Shadcn UI + Tailwind CSS
- **デスクトップ統合**: Tauri (Rust)
- **データ形式**: YAML (コマンド定義) + JSON (スキット)

## 主な機能

1. **ビジュアルスクリプティング**: ドラッグ&ドロップでコマンドを配置
2. **リアルタイム検証**: JSON Schemaによる入力検証
3. **柔軟なコマンドシステム**: YAMLで定義可能なカスタムコマンド
4. **生産性機能**: アンドゥ/リドゥ、コピー/ペースト、マルチセレクト

## 貢献方法

1. このドキュメントを読んで、プロジェクトの全体像を理解
2. [開発ガイド](./08-development-guide.md)に従って環境をセットアップ
3. Issueを確認し、取り組みたいタスクを選択
4. featureブランチで開発し、テストを追加
5. プルリクエストを作成

## ドキュメントの更新

このドキュメントは、プロジェクトの変更に合わせて継続的に更新される必要があります。大きな機能追加や変更を行った場合は、関連するドキュメントも更新してください。

## お問い合わせ

- **バグ報告**: GitHubのIssueで報告
- **機能提案**: GitHubのDiscussionsで議論
- **セキュリティ問題**: メンテナーに直接連絡