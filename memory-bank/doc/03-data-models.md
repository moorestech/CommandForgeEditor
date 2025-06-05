# データモデル詳細

## 概要

CommandForgeEditorのデータモデルは、ゲームシナリオの構造を表現するために設計されています。主要なエンティティは「コマンド定義」「コマンド」「スキット」の3つです。

## 1. コマンド定義 (Command Definition)

コマンド定義は、利用可能なコマンドタイプとそのプロパティを定義します。

### データ構造

```typescript
// types/index.ts
export interface CommandDefinition {
  id: string;                    // 一意識別子
  label: string;                 // UI表示名
  description: string;           // 説明文
  commandListLabelFormat: string; // リスト表示フォーマット
  defaultBackgroundColor?: string; // デフォルト背景色
  properties: Record<string, PropertyDefinition>;
}

export interface PropertyDefinition {
  type: PropertyType;            // プロパティタイプ
  label: string;                 // UI表示名
  required?: boolean;            // 必須フラグ
  default?: unknown;             // デフォルト値
  options?: Array<{ value: string; label: string }>; // enum用
  min?: number;                  // 数値最小値
  max?: number;                  // 数値最大値
  elementType?: PropertyType;    // 配列要素タイプ
}

export type PropertyType = 
  | "string" 
  | "number" 
  | "boolean" 
  | "enum" 
  | "array"
  | "object" 
  | "commandReference" 
  | "vector2" 
  | "vector3";
```

### YAML定義例

```yaml
commands:
  - id: "show_text"
    label: "テキスト表示"
    description: "画面にテキストを表示します"
    commandListLabelFormat: "{characterName}: {text}"
    defaultBackgroundColor: "#4A5568"
    properties:
      characterName:
        type: "string"
        label: "キャラクター名"
        required: true
      text:
        type: "string"
        label: "テキスト"
        required: true
      duration:
        type: "number"
        label: "表示時間（秒）"
        default: 2
        min: 0.1
        max: 10
```

## 2. コマンド (Command)

実際のスキットで使用されるコマンドインスタンスです。

### データ構造

```typescript
export interface SkitCommand {
  id: number;                    // インスタンスID
  type: string;                  // コマンドタイプ（定義ID）
  backgroundColor?: string;      // カスタム背景色
  
  // グループコマンド用
  isCollapsed?: boolean;         // 折りたたみ状態
  groupName?: string;            // グループ名
  
  // 動的プロパティ
  [key: string]: unknown;        // コマンド定義に基づくプロパティ
}
```

### 特殊コマンド

#### group_start / group_end
```typescript
// グループ開始
{
  id: 1,
  type: "group_start",
  groupName: "戦闘シーン",
  isCollapsed: false,
  backgroundColor: "#2D3748"
}

// グループ終了
{
  id: 5,
  type: "group_end"
}
```

## 3. スキット (Skit)

コマンドの集合とメタデータを含むシナリオファイルです。

### データ構造

```typescript
export interface Skit {
  meta: SkitMetadata;
  commands: SkitCommand[];
}

export interface SkitMetadata {
  title: string;                 // スキットタイトル
  version: number;               // バージョン番号
  created: string;               // 作成日時（ISO 8601）
  modified: string;              // 更新日時（ISO 8601）
  description?: string;          // 説明（オプション）
  tags?: string[];              // タグ（オプション）
}
```

### JSONファイル例

```json
{
  "meta": {
    "title": "チュートリアル",
    "version": 1,
    "created": "2024-01-01T00:00:00Z",
    "modified": "2024-01-15T10:30:00Z",
    "description": "ゲーム開始時のチュートリアル",
    "tags": ["tutorial", "intro"]
  },
  "commands": [
    {
      "id": 1,
      "type": "show_text",
      "characterName": "ナレーター",
      "text": "ようこそ、冒険者よ！",
      "duration": 3
    },
    {
      "id": 2,
      "type": "group_start",
      "groupName": "移動チュートリアル",
      "isCollapsed": false
    },
    {
      "id": 3,
      "type": "show_text",
      "characterName": "ガイド",
      "text": "まずは移動方法を覚えましょう"
    },
    {
      "id": 4,
      "type": "group_end"
    }
  ]
}
```

## 4. 検証エラー (Validation Error)

データ検証時のエラー情報です。

```typescript
export interface ValidationError {
  commandId: number;             // エラーのあるコマンドID
  property?: string;             // エラーのあるプロパティ
  message: string;               // エラーメッセージ
  severity: "error" | "warning"; // 重要度
}
```

## 5. アプリケーション状態

Zustand storeで管理される全体の状態です。

```typescript
interface SkitStore {
  // スキットデータ
  skits: Record<string, Skit>;
  currentSkitId: string | null;
  
  // UI状態
  selectedCommandIds: number[];
  clipboard: SkitCommand[] | null;
  
  // 定義データ
  commandDefinitions: CommandDefinition[];
  
  // 検証
  validationErrors: ValidationError[];
  
  // プロジェクト
  projectPath: string;
  hasUnsavedChanges: boolean;
  
  // 履歴
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };
}
```

## データ変換とシリアライゼーション

### コマンドラベルフォーマット

```typescript
// utils/commandFormatting.ts
export function formatCommandLabel(
  command: SkitCommand,
  definition: CommandDefinition
): string {
  let label = definition.commandListLabelFormat;
  
  // プレースホルダーを実際の値に置換
  Object.keys(command).forEach(key => {
    const placeholder = `{${key}}`;
    if (label.includes(placeholder)) {
      label = label.replace(placeholder, String(command[key] || ''));
    }
  });
  
  return label;
}
```

### デフォルト値の適用

```typescript
// utils/commandDefaults.ts
export function applyDefaults(
  command: Partial<SkitCommand>,
  definition: CommandDefinition
): SkitCommand {
  const result = { ...command };
  
  Object.entries(definition.properties).forEach(([key, prop]) => {
    if (!(key in result) && 'default' in prop) {
      result[key] = prop.default;
    }
  });
  
  return result as SkitCommand;
}
```

## データ検証

### JSON Schema生成

```typescript
// utils/validation.ts
export function generateSchema(
  definition: CommandDefinition
): object {
  const properties: Record<string, any> = {};
  const required: string[] = ['id', 'type'];
  
  Object.entries(definition.properties).forEach(([key, prop]) => {
    properties[key] = generatePropertySchema(prop);
    if (prop.required) {
      required.push(key);
    }
  });
  
  return {
    type: 'object',
    properties: {
      id: { type: 'number' },
      type: { type: 'string', const: definition.id },
      ...properties
    },
    required,
    additionalProperties: true
  };
}
```

## データマイグレーション

将来のバージョンアップに備えた設計：

```typescript
interface Migration {
  fromVersion: number;
  toVersion: number;
  migrate: (skit: Skit) => Skit;
}

const migrations: Migration[] = [
  {
    fromVersion: 1,
    toVersion: 2,
    migrate: (skit) => {
      // バージョン1から2への変換ロジック
      return {
        ...skit,
        meta: { ...skit.meta, version: 2 }
      };
    }
  }
];
```