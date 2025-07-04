# Text Assets Integration Plan - CommandForgeEditor & mooreseditor

## 概要
mooreseditorで管理するテキストアセット（テキストID、テキスト内容、ボイスID）をCommandForgeEditorで利用できるようにする連携機能の実装計画。

## 実装目標
- mooreseditorでテキストアセットを一元管理
- CommandForgeEditorでテキストIDを選択してメッセージ表示
- ファイルベースの自動同期機能
- 開発効率を向上させるプレビュー機能

## アーキテクチャ

### システム構成図
```
mooreseditor（マスターデータ管理）
    ├── テキストアセット編集UI
    ├── カテゴリ/タグ管理
    └── エクスポート機能
            ↓
        text_assets.json
            ↓
CommandForgeEditor（読み込み専用）
    ├── テキストアセット読み込み
    ├── TextIdSelectorコンポーネント
    └── リアルタイムプレビュー
```

### データフロー
1. mooreseditorでテキストアセットを作成・編集
2. text_assets.jsonとしてエクスポート
3. CommandForgeEditorが自動検知して読み込み
4. show_messageコマンドでテキストIDを選択
5. スキットファイルにはテキストIDのみ保存

## データ仕様

### text_assets.json
```json
{
  "$version": "1.0.0",
  "$schema": "text-assets-schema-v1",
  "$exportedAt": "2025-07-04T10:00:00Z",
  "$exportedBy": "mooreseditor v0.5.1",
  "assets": {
    "T_HELLO_001": {
      "text": "こんにちは、冒険者よ。",
      "voiceId": "voice_001",
      "category": "greeting",
      "tags": ["npc", "village"],
      "description": "村人の挨拶",
      "variables": [],
      "lastModified": "2025-07-04T09:00:00Z"
    },
    "T_QUEST_START_001": {
      "text": "新しいクエストが始まりました。",
      "voiceId": "voice_sys_010",
      "category": "system",
      "tags": ["quest", "notification"],
      "description": "クエスト開始通知",
      "variables": [],
      "lastModified": "2025-07-04T09:30:00Z"
    },
    "T_ITEM_GET_001": {
      "text": "{itemName}を{count}個手に入れた！",
      "voiceId": "voice_sys_021",
      "category": "system",
      "tags": ["item", "notification"],
      "description": "アイテム取得メッセージ",
      "variables": ["itemName", "count"],
      "lastModified": "2025-07-04T09:45:00Z"
    }
  }
}
```

### スキットファイルの変更
```json
// Before
{
  "id": "cmd_1",
  "command": "show_message",
  "properties": {
    "text": "こんにちは、冒険者よ。"
  }
}

// After
{
  "id": "cmd_1",
  "command": "show_message",
  "properties": {
    "textId": "T_HELLO_001",
    "variables": {}
  }
}
```

## 実装タスク

### Phase 1: 基本機能（MVP）

#### 1-1. CommandForgeEditor - データ読み込み機能
- [ ] text_assets.jsonの型定義作成
- [ ] ファイル読み込み機能の実装
- [ ] Zustandストアへのテキストアセット状態追加
- [ ] エラーハンドリング（ファイル不在、形式エラー）

#### 1-2. CommandForgeEditor - UI実装
- [ ] TextIdSelectorコンポーネントの作成
  - [ ] ドロップダウンUI
  - [ ] 検索機能
  - [ ] プレビュー表示
- [ ] commands.yamlの修正（show_messageコマンド）
- [ ] CommandEditorコンポーネントの拡張

#### 1-3. mooreseditor - エクスポート機能
- [ ] テキストアセット管理画面の設計
- [ ] エクスポート機能の実装
- [ ] ファイル保存ダイアログ
- [ ] バージョン情報の付与

### Phase 2: 自動同期機能

#### 2-1. ファイル監視システム
- [ ] Tauri file watcherプラグインの導入
- [ ] ファイル変更検知の実装
- [ ] 自動リロード機能
- [ ] 変更通知UI

#### 2-2. 検証機能
- [ ] 存在しないテキストIDの検出
- [ ] 検証エラーの表示
- [ ] フォールバック処理

### Phase 3: 高度な機能

#### 3-1. 変数システム
- [ ] 変数定義のサポート
- [ ] 変数入力UI
- [ ] プレビューでの変数展開

#### 3-2. カテゴリ/タグ機能
- [ ] フィルタリングUI
- [ ] カテゴリ別表示
- [ ] タグ検索

#### 3-3. パフォーマンス最適化
- [ ] 大量データ対応（仮想スクロール）
- [ ] キャッシュ機構
- [ ] インクリメンタル検索

### Phase 4: 開発体験向上

#### 4-1. 開発ツール
- [ ] マイグレーションツール（既存テキストからの変換）
- [ ] 一括置換機能
- [ ] 使用状況分析

#### 4-2. ドキュメント
- [ ] ユーザーガイド作成
- [ ] API仕様書
- [ ] トラブルシューティングガイド

## 技術的実装詳細

### CommandForgeEditor側の実装

#### 1. 型定義（types/textAssets.ts）
```typescript
export interface TextAsset {
  text: string;
  voiceId: string;
  category: string;
  tags: string[];
  description: string;
  variables: string[];
  lastModified: string;
}

export interface TextAssetsFile {
  $version: string;
  $schema: string;
  $exportedAt: string;
  $exportedBy: string;
  assets: Record<string, TextAsset>;
}
```

#### 2. ストア拡張（store/skitStore.ts）
```typescript
interface SkitStore {
  // 新規追加
  textAssets: Record<string, TextAsset> | null;
  textAssetsLoadError: string | null;
  textAssetsVersion: string | null;
  
  // 新規アクション
  loadTextAssets: () => Promise<void>;
  reloadTextAssets: () => Promise<void>;
  getTextAsset: (id: string) => TextAsset | undefined;
}
```

#### 3. TextIdSelectorコンポーネント
```typescript
interface TextIdSelectorProps {
  value: string;
  onChange: (value: string) => void;
  variables?: Record<string, string>;
  onVariablesChange?: (variables: Record<string, string>) => void;
}
```

### mooreseditor側の実装

#### 1. テキストアセット管理スキーマ
```yaml
# schema/textAssets.yml
type: object
properties:
  id:
    type: string
    pattern: "^T_[A-Z0-9_]+$"
    description: "テキストID（T_で始まる大文字英数字）"
  text:
    type: string
    description: "表示テキスト"
  voiceId:
    type: string
    description: "ボイスファイルID"
  category:
    type: string
    enum: ["greeting", "system", "dialogue", "narration", "ui"]
  tags:
    type: array
    items:
      type: string
  description:
    type: string
  variables:
    type: array
    items:
      type: string
```

## リスク管理

### 技術的リスク
1. **大量データでのパフォーマンス低下**
   - 対策: 遅延読み込み、仮想化、インデックス作成

2. **ファイル同期の競合**
   - 対策: ファイルロック、トランザクション処理

3. **後方互換性の破壊**
   - 対策: セマンティックバージョニング、マイグレーションツール

### 運用リスク
1. **両アプリ間の依存関係**
   - 対策: 明確なインターフェース定義、疎結合設計

2. **開発フローの複雑化**
   - 対策: 自動化ツール、明確なドキュメント

## スケジュール目安

- Phase 1: 2週間（基本機能の実装）
- Phase 2: 1週間（自動同期機能）
- Phase 3: 2週間（高度な機能）
- Phase 4: 1週間（開発体験向上）

合計: 約6週間

## 成功指標

1. **機能面**
   - テキストアセットの作成から使用までの一連の流れが動作
   - 1000件以上のテキストアセットでも快適に動作
   - ファイル変更の自動検知と反映

2. **開発効率**
   - テキスト変更にかかる時間を50%削減
   - テキストの重複を排除
   - ローカライズ対応の準備完了

3. **品質**
   - テキストIDの参照エラーゼロ
   - 自動テストカバレッジ80%以上
   - ユーザードキュメント完備

## 次のステップ

1. この実装計画のレビューと承認
2. Phase 1の詳細設計
3. プロトタイプ実装
4. ユーザーフィードバックの収集
5. 本実装の開始

## 参考資料

- [Tauri File System API](https://tauri.app/v1/api/js/fs/)
- [Tauri File Watcher Plugin](https://github.com/tauri-apps/plugins-workspace/tree/v1/plugins/fs-watch)
- [JSON Schema Specification](https://json-schema.org/)
- [Semantic Versioning](https://semver.org/)