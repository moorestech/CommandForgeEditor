# Text Assets Integration Plan - CommandForgeEditor & mooreseditor

## 概要
mooreseditor（/Users/katsumi.sato/WebstormProjects/mooreseditor）で管理するマスターデータをCommandForgeEditorで外部キー参照として利用できるようにする連携機能の実装計画。

## 実装目標
- mooreseditorでマスターデータ（テキスト、ボイスID等）を管理
- CommandForgeEditorでForeignKey機能を使用してマスターデータのIDを参照
- config.yamlによるプロジェクトパス設定
- mooreseditorのForeignKey仕様に準拠した実装

## アーキテクチャ

### システム構成図
```
mooreseditor（マスターデータ管理）
    ├── JSONマスターデータの編集
    └── 各種マスターファイル（texts.json, voices.json等）
            ↓
    CommandForgeEditor.config.yamlで
    プロジェクトパスを指定
            ↓
CommandForgeEditor（外部キー参照）
    ├── マスターデータ読み込み
    ├── ForeignKeySelectorコンポーネント
    └── リアルタイムプレビュー
```

### データフロー
1. mooreseditorでマスターデータ（texts.json等）を作成・編集
2. CommandForgeEditor.config.yamlでmooreseditorプロジェクトパスを設定
3. CommandForgeEditorがconfig.yamlを読み込み、指定されたパスからマスターデータを取得
4. コマンドプロパティでForeignKey設定を使用してマスターIDを選択
5. スキットファイルには選択されたID（外部キー）のみ保存

## データ仕様

### mooreseditorのマスターデータ形式
mooreseditorは配列形式のJSONマスターデータを使用します。

#### texts.json（例）
```json
[
  {
    "id": "T_HELLO_001",
    "text": "こんにちは、冒険者よ。",
    "voiceId": "voice_001",
    "category": "greeting"
  },
  {
    "id": "T_QUEST_START_001", 
    "text": "新しいクエストが始まりました。",
    "voiceId": "voice_sys_010",
    "category": "system"
  }
]
```

### CommandForgeEditor.config.yaml
```yaml
# プロジェクト設定
masterDataProject: /Users/katsumi.sato/WebstormProjects/mooreseditor/project_name
```

### commands.yamlのForeignKey定義
mooreseditorのForeignKey仕様に準拠：
```yaml
- id: show_message
  name: メッセージ表示
  properties:
    - key: textId
      type: uuid  # mooreseditorではuuid型でForeignKeyを定義
      name: テキストID
      foreignKey:
        schemaId: texts  # マスターファイル名（.json除く）
        foreignKeyIdPath: /[*]/id  # 配列内のidフィールド
        displayElementPath: /[*]/text  # 表示用のtextフィールド
```

### スキットファイルの保存形式
```json
{
  "id": "cmd_1",
  "command": "show_message",
  "properties": {
    "textId": "T_HELLO_001"
  }
}
```

## 実装タスク

### Phase 1: 基本機能（MVP）

#### 1-1. CommandForgeEditor - 設定ファイル機能
- [ ] CommandForgeEditor.config.yamlの型定義
- [ ] config.yaml読み込み機能の実装
- [ ] マスターデータプロジェクトパスの解決

#### 1-2. CommandForgeEditor - ForeignKey機能実装
- [ ] mooreseditorのForeignKeyResolver相当の実装
- [ ] ForeignKeySelectorコンポーネントの作成
  - [ ] ドロップダウンUI
  - [ ] 検索機能
  - [ ] ID/表示値のペア表示
- [ ] commands.yamlへのforeignKey定義追加
- [ ] CommandEditorでのForeignKey対応

#### 1-3. CommandForgeEditor - マスターデータ読み込み
- [ ] 指定パスからのJSONファイル読み込み
- [ ] パス解決機能（/[*]/形式の対応）
- [ ] エラーハンドリング（ファイル不在、形式エラー）

### Phase 2: 高度な機能

#### 2-1. ファイル監視システム
- [ ] Tauri file watcherによるマスターファイル変更検知
- [ ] 自動リロード機能
- [ ] 変更通知UI

#### 2-2. 検証機能
- [ ] 存在しない外部キーの検出
- [ ] 検証エラーの表示
- [ ] 未解決IDのハイライト

#### 2-3. 複数マスターファイル対応
- [ ] 複数のschemaId（texts, voices, items等）の管理
- [ ] スキーマ間の依存関係解決

### Phase 3: 開発体験向上

#### 3-1. パフォーマンス最適化
- [ ] 大量データ対応（遅延読み込み）
- [ ] キャッシュ機構
- [ ] インクリメンタル検索

#### 3-2. 開発ツール
- [ ] 使用状況分析（どのIDが使われているか）
- [ ] 未使用ID検出
- [ ] リファクタリング支援

## 技術的実装詳細

### CommandForgeEditor側の実装

#### 1. 型定義（types/index.ts）
```typescript
// mooreseditorのForeignKeyConfigと同じ
export interface ForeignKeyConfig {
  schemaId: string;
  foreignKeyIdPath: string;
  displayElementPath: string;
}

export interface MasterDataConfig {
  masterDataProject: string;
}
```

#### 2. ForeignKeyResolver実装
mooreseditorの`foreignKeyResolver.ts`をベースに実装：
- パス展開機能（/[*]/形式）
- ID/表示値のペアリング
- 配列インデックスの管理

#### 3. ストア拡張（store/skitStore.ts）
```typescript
interface SkitStore {
  // 新規追加
  masterDataConfig: MasterDataConfig | null;
  masterDataCache: Map<string, any[]>;  // schemaId -> データ配列
  
  // 新規アクション
  loadMasterDataConfig: () => Promise<void>;
  loadMasterData: (schemaId: string) => Promise<void>;
  resolveForeignKey: (config: ForeignKeyConfig, value: any) => string | null;
}
```

#### 4. ForeignKeySelectorコンポーネント
```typescript
interface ForeignKeySelectorProps {
  value: string;
  onChange: (value: string) => void;
  foreignKeyConfig: ForeignKeyConfig;
}
```

## リスク管理

### 技術的リスク
1. **パス解決の複雑性**
   - 対策: mooreseditorのパス解決ロジックを再利用

2. **大量データでのパフォーマンス**
   - 対策: 必要時のみ読み込み、キャッシュ活用

3. **ファイルアクセスエラー**
   - 対策: 適切なエラーハンドリングとフォールバック

### 運用リスク
1. **プロジェクト間の依存**
   - 対策: config.yamlによる疎結合化

2. **スキーマ変更の影響**
   - 対策: 検証機能による早期発見

## スケジュール目安

- Phase 1: 1週間（基本機能の実装）
- Phase 2: 1週間（高度な機能）
- Phase 3: 3日（開発体験向上）

合計: 約2.5週間

## 成功指標

1. **機能面**
   - mooreseditorのマスターデータをCommandForgeEditorで参照可能
   - ForeignKey機能が正常に動作
   - パス解決が正確

2. **開発効率**
   - マスターデータの一元管理
   - ID入力ミスの削減
   - 変更の自動反映

3. **品質**
   - 外部キー参照エラーの早期発見
   - テストカバレッジ80%以上

## 次のステップ

1. config.yamlの詳細仕様策定
2. ForeignKeyResolver実装
3. プロトタイプによる検証
4. 本実装の開始

## 参考資料

- mooreseditorのForeignKey実装（foreignKeyResolver.ts）
- [Tauri File System API](https://tauri.app/v1/api/js/fs/)
- [JSON Path仕様](https://goessner.net/articles/JsonPath/)