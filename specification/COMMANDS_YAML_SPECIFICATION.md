# Commands.yaml 仕様書

## 概要

`commands.yaml`は、CommandForgeEditorで利用可能なすべてのコマンドを定義する設定ファイルです。このファイルは、ユーザーがスキットに追加できるコマンドと、それらのコマンドがビジュアルスクリプティングインターフェースでどのように動作するかを決定します。

## ファイル構造

### トップレベル構造

```yaml
version: 1
commands:
  - id: <コマンドID>
    label: <表示名>
    description: <コマンドの説明>
    commandListLabelFormat: <フォーマット文字列>
    defaultBackgroundColor: <16進数カラー>  # オプション
    properties:
      <プロパティ名>:
        type: <プロパティタイプ>
        required: <真偽値>
        # プロパティタイプによって追加フィールドが異なる
```

### 必須フィールド

#### コマンドレベル
- `version`: ファイルフォーマットバージョン（現在は`1`）
- `commands`: コマンド定義の配列
- `id`: コマンドの一意識別子（文字列）
- `label`: UIに表示される表示名（文字列）
- `description`: コマンドの目的を説明するヘルプテキスト（文字列）
- `properties`: コマンドのプロパティを定義するオブジェクト

#### プロパティレベル
- `type`: プロパティのデータ型（プロパティタイプのセクションを参照）
- `required`: このプロパティに値が必要かどうか（真偽値）

### オプションフィールド

#### コマンドレベル
- `commandListLabelFormat`: リストでコマンドを表示するためのフォーマット文字列（文字列）
  - プロパティ値を含めるために`{propertyName}`プレースホルダーを使用
  - 例: `"{character}「{body}」"`は`CharacterA「こんにちは！」`のように表示される
- `defaultBackgroundColor`: リスト内のコマンドの背景色（16進数カラー文字列）
  - 例: 緑色の背景には`"#57e317"`

#### プロパティレベル
- `default`: プロパティのデフォルト値（プロパティタイプと一致する必要がある）
- `description`: プロパティのヘルプテキスト（文字列）
- `multiline`: `string`タイプの場合、複数行テキスト入力を有効にする（真偽値）
- `options`: `enum`タイプの場合、利用可能なオプションの配列（string[]）
- `optionsFrom`: `options`の代替、動的オプションのために別のプロパティを参照（文字列）
- `commandTypes`: `command`タイプの場合、許可されるコマンドタイプの配列（string[]）
- `constraints`: バリデーション制約オブジェクト
  - `min`: `number`タイプの最小値
  - `max`: `number`タイプの最大値
  - `pattern`: `string`タイプのバリデーション用正規表現パターン

## プロパティタイプ

### 基本タイプ

#### string
テキスト入力フィールド
```yaml
type: string
multiline: true      # オプション: テキストエリアを有効にする
constraints:         # オプション: バリデーション
  pattern: "^[A-Z]"  # 正規表現パターン
```

#### number
数値入力フィールド
```yaml
type: number
default: 0.5         # オプション: デフォルト値
constraints:         # オプション: 最小/最大制限
  min: 0
  max: 1.0
```

#### boolean
はい/いいえドロップダウン
```yaml
type: boolean
default: false       # オプション: デフォルト値
```

#### enum
事前定義されたオプションを持つドロップダウン
```yaml
type: enum
options: ["オプション1", "オプション2", "オプション3"]
default: "オプション1"   # オプション: デフォルト選択
```

#### asset
アセットパス用のテキスト入力
```yaml
type: asset
```

### ベクタータイプ

すべてのベクタータイプは座標入力フィールドとして表示されます：

#### vector2
2D浮動小数点ベクター [x, y]
```yaml
type: vector2
```

#### vector3
3D浮動小数点ベクター [x, y, z]
```yaml
type: vector3
```

#### vector4
4D浮動小数点ベクター [x, y, z, w]
```yaml
type: vector4
```

#### vector2Int
2D整数ベクター [x, y]
```yaml
type: vector2Int
```

#### vector3Int
3D整数ベクター [x, y, z]
```yaml
type: vector3Int
```

### 特殊タイプ

#### command
他のコマンドへの参照
```yaml
type: command
required: true
commandTypes: ["text", "narration"]  # オプション: コマンドタイプでフィルタリング
```

## 完全な例

```yaml
version: 1
commands:
  # テキスト会話コマンド
  - id: text
    label: テキスト
    description: 会話を表示
    commandListLabelFormat: "{character}「{body}」"
    properties:
      character:
        type: enum
        options: ["キャラクターA", "キャラクターB", "キャラクターC"]
        required: true
      body:
        type: string
        multiline: true
        required: true

  # カスタム背景色を持つ待機コマンド
  - id: wait
    label: 待機
    description: 指定秒数待機
    commandListLabelFormat: "待機: {seconds}秒"
    defaultBackgroundColor: '#57e317'
    properties:
      seconds:
        type: number
        default: 0.5
        constraints:
          min: 0

  # ベクターを使用したカメラ位置コマンド
  - id: characterPosition
    label: カメラ位置
    description: カメラの位置
    commandListLabelFormat: "カメラ移動 {position}"
    properties:
      position:
        type: vector3Int
        required: true

  # コマンド参照を持つ分岐コマンド
  - id: branch
    label: 分岐
    description: 他のコマンドを参照する分岐
    commandListLabelFormat: "分岐: ターゲット {targetCommand}"
    defaultBackgroundColor: "#f9f0ff"
    properties:
      targetCommand:
        type: command
        required: true
        commandTypes: ["text", "narration"]
      condition:
        type: string
        required: true
        multiline: true

  # 複数のプロパティタイプを持つ複雑なコマンド
  - id: choice
    label: 選択肢
    description: 選択肢を表示
    commandListLabelFormat: "選択肢: {options}"
    properties:
      options:
        type: string
        multiline: true
        description: "1行に1つの選択肢"
        required: true
      timeout:
        type: number
        default: 0
        description: "自動選択タイムアウト秒数（0で無制限）"
        constraints:
          min: 0
```

## 予約済みコマンド

以下のコマンドはシステムに組み込まれており、`commands.yaml`で定義する必要はありません：
- `group_start`: 折りたたみ可能なコマンドグループを開始
- `group_end`: コマンドグループを終了

これらはアプリケーションの読み込み時に、ユーザー定義のコマンドと自動的にマージされます。

## バリデーション

コマンドは3つのレベルで検証されます：

1. **スキーマ検証**: YAMLファイル構造が正しいことを確認
2. **定義検証**: すべての必須フィールドが存在し、プロパティタイプが有効であることを確認
3. **ランタイム検証**: コマンドインスタンスが必須プロパティを持ち、正しいタイプであることを確認

## ベストプラクティス

1. **一意のID**: 各コマンドはグローバルに一意な`id`を持つ必要があります
2. **明確なラベル**: コマンドの目的を明確に示す説明的なラベルを使用
3. **フォーマット文字列**: 視認性を高めるために`commandListLabelFormat`に主要なプロパティ値を含める
4. **必須プロパティ**: コマンドが機能するために不可欠な場合のみプロパティを必須にマーク
5. **デフォルト値**: オプションのプロパティには適切なデフォルト値を提供
6. **制約**: 無効なデータ入力を防ぐために制約を使用
7. **説明**: 複雑なプロパティには役立つ説明を追加
8. **背景色**: 特殊なコマンドを強調するために`defaultBackgroundColor`を控えめに使用

## 国際化

コマンドラベルとプロパティ名はi18nシステムを使用して翻訳できます：
- 翻訳キーは次のパターンに従います: `command.<commandId>.property.<propertyKey>.name`
- 翻訳ファイルをプロジェクトの`i18n/`ディレクトリに配置
- システムは利用可能な場合、自動的に翻訳を使用します

## 将来の拡張性

`version`フィールドにより、後方互換性を維持しながら将来のスキーマ変更が可能です。スキーマを拡張する場合：
- 破壊的変更にはバージョン番号を増やす
- 非破壊的な追加には新しいオプションフィールドを追加
- 既存のコマンド定義の移行パスを文書化