# 変数機能 仕様書

## 1. 概要
Moore's Command Editor に変数機能を導入し、スキット内で値を保存・参照・演算できるようにします。

## 2. 機能要件
### 2.1 変数の定義
- 予約済みコマンド `variable_definition` を追加します。
- プロパティ:
  - `variableName` (string, required): 変数名。
  - `valueType` (`PropertyType`, required): 値の型。
  - `initialValue` (string | number | boolean, optional): 初期値。
- このコマンドより後に登場するコマンドから参照できます。

### 2.2 変数の使用
- 任意のコマンドのプロパティで `{{variableName}}` というプレースホルダーを記述すると、その場で変数値に展開されます。

### 2.3 変数の演算・セット
- `set_variable` コマンドを導入します。
- プロパティ:
  - `target` (string, required): 更新対象の変数名。
  - `expression` (string, required): `+`, `-`, `*`, `/` と変数参照を含む式文字列。
- コマンド実行時に `expression` を評価し、結果を `target` に格納します。

## 3. JSON 例
```json
{
  "id": 1,
  "type": "variable_definition",
  "variableName": "score",
  "valueType": "number",
  "initialValue": 0
},
{
  "id": 2,
  "type": "set_variable",
  "target": "score",
  "expression": "score + 10"
}
```

## 4. 型定義変更案
`frontend/src/types/index.ts` に `'variable'` を追加し、変数参照を表す型を導入します。

```typescript
export type PropertyType = 'string' | 'number' | 'boolean' | 'enum' | 'asset' | 'command' | 'variable';

export interface VariableReference {
  variableName: string;
}
```
