# サブルーチン機能 仕様書

## 1. 概要

本機能は、Moore's Command Editorにサブルーチン（一連のコマンド群を再利用可能な単位として定義・呼び出しできる機能）を導入するものです。これにより、複雑なスキットの作成効率と可読性を向上させます。

## 2. 機能要件

### 2.1. サブルーチン定義

#### サブルーチン定義コマンド
- 新しい予約済みコマンドとして「`subroutine_definition`」を導入します。
- このコマンドは、サブルーチンの開始点を示します。
- プロパティとして以下を持ちます:
  - `subroutineName` (string, required): サブルーチンの名前。UIで表示される。
  - `description` (string, optional): サブルーチンの説明。
  - `arguments` (array, optional): サブルーチンの引数定義のリスト。
    - 各引数オブジェクトは以下のプロパティを持ちます:
      - `name` (string, required): 引数名。
      - `type` (PropertyType, required): 引数の型（例: 'string', 'number', 'boolean'）。既存の `PropertyType` を利用。
      - `defaultValue` (any, optional): 引数のデフォルト値。
      - `description` (string, optional): 引数の説明。

#### サブルーチン定義の範囲
- 「`subroutine_definition`」コマンドから、次の「`subroutine_definition`」コマンド、またはスキットの終端までをサブルーチンの本体とします。
- または、既存の `group_end` のような「`subroutine_end`」コマンドを導入することも検討します。

#### 引数設定UI
- 「`subroutine_definition`」コマンドが選択された際、`CommandEditor` にて引数（`arguments` プロパティ）を動的に追加・編集・削除できるUIを提供します。
  - 各引数について、名前、型、デフォルト値、説明を入力できるようにします。
  - 引数の型はドロップダウンで選択できるようにします。

### 2.2. サブルーチン呼び出し

#### サブルーチン呼び出しコマンド
- 新しいコマンドタイプとして「`call_subroutine`」を導入します。これは `commands.yaml` で定義可能とするか、予約済みコマンドとするか検討が必要です。
  - `commands.yaml` で定義する場合の例:
    ```yaml
    commands:
      - id: call_my_subroutine_A
        label: "サブルーチンAを実行"
        description: "特定の処理を行うサブルーチンAを呼び出します。"
        properties:
          targetSubroutineId: { type: 'subroutine_id', required: true } # 新しいPropertyTypeの検討
          arg1_name: { type: 'string' } # サブルーチン定義に合わせて動的に変化
          arg2_name: { type: 'number' }
    ```
- プロパティとして以下を持ちます:
  - `targetSubroutineId` (string, required): 呼び出すサブルーチンのID（または名前）。
  - その他、呼び出すサブルーチンに定義された引数に対応するプロパティ。これらのプロパティは、`targetSubroutineId` が選択された際に動的に `CommandEditor` に表示されます。

#### サブルーチン選択UI
- 「`call_subroutine`」コマンドの `targetSubroutineId` プロパティを編集する際、ドロップダウンリストを提供します。
- このドロップダウンリストは、現在のプロジェクト内に定義されている全てのサブルーチン（「`subroutine_definition`」コマンドで定義されたもの）を一覧表示します。
- UIの見た目と挙動は、サイドバーのスキット一覧（`SkitList.tsx`）と同様の形式とします。つまり、サブルーチン名がリストされ、選択すると `targetSubroutineId` が設定されます。

#### 引数入力UI
- 呼び出すサブルーチンが選択されると、そのサブルーチンに定義されている引数に基づいて、`CommandEditor` に入力フィールドが動的に生成されます。
- 各引数フィールドでは、対応する型の値を入力できます。

### 2.3. サブルーチンの管理

#### 保存場所
- サブルーチン定義は、各スキットファイル（`.json`）内に、コマンドの一部として保存されます。
- または、プロジェクト単位でサブルーチンを管理する別ファイル（例: `subroutines.yaml` や `project.json` の一部）を導入することも検討します。ユーザー要望の「サイドバーから選択できるスキット一覧と同様」を考慮すると、プロジェクト単位での管理が自然かもしれません。その場合、`skitStore` にサブルーチンを管理する新しいstateを追加します。

#### 一覧表示
- サイドバーに「サブルーチン」セクションを新設し、プロジェクト内のサブルーチン定義を一覧表示します。
- スキット一覧と同様に、クリックで該当のサブルーチン定義箇所にジャンプする機能を検討します。

## 3. 型定義の変更案 (`frontend/src/types/index.ts`)

### PropertyType
サブルーチンIDを選択するための `'subroutine_id'` を追加検討。
```typescript
export type PropertyType = 'string' | 'number' | 'boolean' | 'enum' | 'asset' | 'command' | 'subroutine_id';
```

### PropertyDefinition
- サブルーチン引数を定義するために、`arguments` プロパティを追加検討（`CommandDefinition` 側で持つ方が適切か要検討）。
- `subroutine_id` 型の場合、利用可能なサブルーチンをフィルタリングするためのオプションを追加検討。

### CommandDefinition
`subroutine_definition` コマンドの場合:
```typescript
interface SubroutineArgumentDefinition {
  name: string;
  type: PropertyType;
  defaultValue?: any;
  description?: string;
}

// CommandDefinition.properties に以下のような定義を追加
// properties: {
//   subroutineName: { type: 'string', required: true },
//   description: { type: 'string' },
//   arguments: { type: 'array', itemType: 'object', itemSchema: SubroutineArgumentDefinition } // 新しい型表現の検討
// }
```

より具体的には、`arguments` プロパティを `PropertyDefinition` の一種として定義し、その編集UIを `CommandEditor` で特別にハンドリングする方法が考えられます。

### SkitCommand
- `subroutine_definition` コマンドの場合、`arguments` プロパティ（上記 `SubroutineArgumentDefinition` の配列）を持つ。
- `call_subroutine` コマンドの場合、`targetSubroutineId` プロパティと、呼び出すサブルーチンの引数に対応するプロパティを持つ。

## 4. 状態管理の変更案 (`frontend/src/store/skitStore.ts`)

### SkitState への追加
- `subroutineDefinitions: Record<string, SubroutineDefinitionFromStore>`: プロジェクト全体のサブルーチン定義を保持（サブルーチンをプロジェクト単位で管理する場合）。`SubroutineDefinitionFromStore` はサブルーチン名、引数定義、それが定義されているスキットIDなどを含む型。

### アクションの追加
- `loadSubroutines`: プロジェクト内のサブルーチン定義をロードする。
- `addArgumentToSubroutineDefinition`: サブルーチン定義に引数を追加する。
- `updateArgumentInSubroutineDefinition`: サブルーチン定義の引数を更新する。
- `removeArgumentFromSubroutineDefinition`: サブルーチン定義から引数を削除する。

## 5. UIコンポーネントへの影響

### SkitList.tsx と同様のサブルーチン一覧コンポーネント
- サイドバーに配置し、プロジェクト内のサブルーチンを表示・選択できるようにします。

### CommandEditor.tsx
- `subroutine_definition` コマンド選択時: 引数定義UIを表示。
- `call_subroutine` コマンド選択時:
  - `targetSubroutineId` の選択ドロップダウンを表示。
  - 選択されたサブルーチンに基づいて、引数入力フィールドを動的に表示。

### コマンドリスト (CommandList.tsx)
- `subroutine_definition` コマンドと `call_subroutine` コマンドを適切に表示。

## 6. 予約済みコマンド (`frontend/src/utils/reservedCommands.ts`)

`subroutine_definition` を予約済みコマンドとして追加することを推奨。
```typescript
{
  id: 'subroutine_definition',
  label: 'サブルーチン定義',
  description: '再利用可能なコマンドシーケンスを定義します。',
  commandListLabelFormat: 'サブルーチン: {subroutineName}',
  properties: {
    subroutineName: { type: 'string', required: true, default: '新しいサブルーチン' },
    description: { type: 'string', multiline: true },
    // arguments プロパティの扱いは CommandEditor 側で特別処理
  }
}
```

`call_subroutine` を予約済みコマンドとするか、`commands.yaml` でユーザーが定義できるようにするかは、さらなる検討が必要です。柔軟性を考えると `commands.yaml` で定義可能とし、`targetSubroutineId` プロパティの型として新しい `PropertyType`（例: `'subroutine_selector'`）を導入し、これに対して特別なUIを提供するのが良いかもしれません。

## 7. 今後の検討事項

- サブルーチンのネスト（サブルーチン内で別のサブルーチンを呼び出す）を許可するかどうか。
- サブルーチン定義のスコープ（スキットローカルかプロジェクトグローバルか）。仕様書案ではプロジェクトグローバルを推奨。
- エラーハンドリング（存在しないサブルーチンを呼び出そうとした場合など）。
- サブルーチン呼び出し時の引数のバリデーション。
- UI/UXの詳細（特に引数定義UIとサブルーチン選択UI）。

## 8. 実装の優先順位

1. **Phase 1**: 基本的なサブルーチン定義機能
   - `subroutine_definition` コマンドの追加
   - 基本的な引数定義UI
   - 型定義の拡張

2. **Phase 2**: サブルーチン呼び出し機能
   - `call_subroutine` コマンドの追加
   - サブルーチン選択UI
   - 引数入力UI

3. **Phase 3**: 管理機能の強化
   - サブルーチン一覧表示
   - プロジェクト単位での管理
   - バリデーション機能

---

この仕様書案は、現時点での情報とユーザー様の要望に基づいたものです。実際の開発を進める中で、さらに詳細な検討や調整が必要になる場合があります。