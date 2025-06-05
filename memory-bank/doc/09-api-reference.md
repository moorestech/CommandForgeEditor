# API リファレンス

## Store API

### useSkitStore

Zustandストアへのアクセスを提供するフック。

```typescript
import { useSkitStore } from '@/store/skitStore';
```

#### State

##### skits
```typescript
skits: Record<string, Skit>
```
すべてのスキットを格納するオブジェクト。キーはスキットID。

##### currentSkitId
```typescript
currentSkitId: string | null
```
現在選択されているスキットのID。

##### selectedCommandIds
```typescript
selectedCommandIds: number[]
```
選択されているコマンドのIDリスト。

##### commandDefinitions
```typescript
commandDefinitions: CommandDefinition[]
```
利用可能なコマンド定義のリスト。

##### validationErrors
```typescript
validationErrors: ValidationError[]
```
現在の検証エラーのリスト。

#### Computed Values

##### currentSkit
```typescript
currentSkit: Skit | null
```
現在選択されているスキットオブジェクト。

##### selectedCommands
```typescript
selectedCommands: SkitCommand[]
```
選択されているコマンドオブジェクトのリスト。

#### Actions

##### loadProject
```typescript
loadProject(path: string): Promise<void>
```
プロジェクトフォルダを読み込み、コマンド定義とスキットを初期化。

##### createSkit
```typescript
createSkit(title: string): void
```
新しいスキットを作成。

##### addCommand
```typescript
addCommand(type: string, afterId?: number): void
```
新しいコマンドを追加。`afterId`が指定された場合、そのコマンドの後に挿入。

##### updateCommand
```typescript
updateCommand(id: number, updates: Partial<SkitCommand>): void
```
指定されたコマンドを更新。

##### deleteCommands
```typescript
deleteCommands(ids: number[]): void
```
指定されたコマンドを削除。

##### moveCommand
```typescript
moveCommand(id: number, targetId: number, position: 'before' | 'after'): void
```
コマンドを移動。

##### selectCommand
```typescript
selectCommand(id: number, multi?: boolean): void
```
コマンドを選択。`multi`が`true`の場合はトグル選択。

##### copyCommands / cutCommands / pasteCommands
```typescript
copyCommands(): void
cutCommands(): void
pasteCommands(afterId?: number): void
```
クリップボード操作。

##### undo / redo
```typescript
undo(): void
redo(): void
```
履歴操作。

## ユーティリティ関数

### コマンドフォーマット

#### formatCommandLabel
```typescript
formatCommandLabel(
  command: SkitCommand,
  definition: CommandDefinition
): string
```
コマンドのラベルをフォーマット。プレースホルダーを実際の値に置換。

```typescript
// 使用例
const label = formatCommandLabel(
  { id: 1, type: 'show_text', text: 'Hello' },
  { commandListLabelFormat: 'Text: {text}' }
);
// => "Text: Hello"
```

#### applyDefaults
```typescript
applyDefaults(
  command: Partial<SkitCommand>,
  definition: CommandDefinition
): SkitCommand
```
コマンド定義のデフォルト値を適用。

### 検証

#### validateCommand
```typescript
validateCommand(
  command: SkitCommand,
  definition: CommandDefinition
): ValidationError[]
```
単一のコマンドを検証。

#### generateSchema
```typescript
generateSchema(definition: CommandDefinition): object
```
コマンド定義からJSON Schemaを生成。

### ファイルシステム

#### fileSystem
```typescript
interface FileSystemAPI {
  readTextFile(path: string): Promise<string>
  writeTextFile(path: string, content: string): Promise<void>
  readDir(path: string): Promise<FileEntry[]>
  createDir(path: string, options?: { recursive?: boolean }): Promise<void>
  exists(path: string): Promise<boolean>
  removeFile(path: string): Promise<void>
  removeDir(path: string, options?: { recursive?: boolean }): Promise<void>
}
```

#### ProjectManager
```typescript
class ProjectManager {
  constructor(projectPath: string)
  
  initialize(): Promise<void>
  loadCommands(): Promise<CommandDefinition[]>
  loadSkits(): Promise<Record<string, Skit>>
  saveSkit(id: string, skit: Skit): Promise<void>
  deleteSkit(id: string): Promise<void>
}
```

## React Hooks

### useKeyboardShortcuts
```typescript
useKeyboardShortcuts(shortcuts: Record<string, () => void>): void
```
キーボードショートカットを登録。

```typescript
// 使用例
useKeyboardShortcuts({
  'ctrl+s': () => save(),
  'ctrl+z': () => undo(),
  'ctrl+y': () => redo(),
});
```

### useDndSortable
```typescript
interface UseDndSortableReturn {
  handleDragEnd: (event: DragEndEvent) => void
}

useDndSortable(): UseDndSortableReturn
```
ドラッグ&ドロップのハンドラーを提供。

### useToast
```typescript
interface Toast {
  id: string
  title: string
  description?: string
  action?: ToastAction
  duration?: number
}

interface UseToastReturn {
  toast: (props: ToastProps) => void
  toasts: Toast[]
  dismiss: (toastId?: string) => void
}

useToast(): UseToastReturn
```
トースト通知を管理。

## 型定義

### コマンド関連

```typescript
interface SkitCommand {
  id: number
  type: string
  backgroundColor?: string
  isCollapsed?: boolean  // group_start用
  groupName?: string     // group_start用
  [key: string]: unknown // 動的プロパティ
}

interface CommandDefinition {
  id: string
  label: string
  description: string
  commandListLabelFormat: string
  defaultBackgroundColor?: string
  properties: Record<string, PropertyDefinition>
}

interface PropertyDefinition {
  type: PropertyType
  label: string
  required?: boolean
  default?: unknown
  options?: Array<{ value: string; label: string }>
  min?: number
  max?: number
  elementType?: PropertyType
}

type PropertyType = 
  | "string" 
  | "number" 
  | "boolean" 
  | "enum" 
  | "array"
  | "object" 
  | "commandReference" 
  | "vector2" 
  | "vector3"
```

### スキット関連

```typescript
interface Skit {
  meta: SkitMetadata
  commands: SkitCommand[]
}

interface SkitMetadata {
  title: string
  version: number
  created: string    // ISO 8601
  modified: string   // ISO 8601
  description?: string
  tags?: string[]
}
```

### 検証関連

```typescript
interface ValidationError {
  commandId: number
  property?: string
  message: string
  severity: "error" | "warning"
}
```

## コンポーネントProps

### CommandList
```typescript
interface CommandListProps {
  // 内部でstoreから取得するため、propsなし
}
```

### CommandEditor
```typescript
interface CommandEditorProps {
  // 内部でstoreから取得するため、propsなし
}
```

### DraggableCommand
```typescript
interface DraggableCommandProps {
  command: SkitCommand
  isSelected: boolean
  nestLevel: number
  onSelect: (id: number, multi: boolean) => void
  onContextMenu: (e: React.MouseEvent) => void
}
```

### PropertyEditor
```typescript
interface PropertyEditorProps {
  name: string
  definition: PropertyDefinition
  value: unknown
  onChange: (value: unknown) => void
  disabled?: boolean
}
```

## イベント

### Store イベント

Zustand storeは自動的に購読者に変更を通知します。

```typescript
// 特定の状態を購読
const unsubscribe = useSkitStore.subscribe(
  state => state.currentSkitId,
  (currentSkitId) => {
    console.log('Current skit changed:', currentSkitId);
  }
);
```

### ドラッグ&ドロップ イベント

```typescript
interface DragEndEvent {
  active: {
    id: string | number
  }
  over: {
    id: string | number
  } | null
  collisions: Array<{
    data?: {
      dropPosition?: 'before' | 'after'
    }
  }>
}
```

## エラーハンドリング

### FileSystemError
```typescript
class FileSystemError extends Error {
  constructor(
    message: string,
    code: 'NOT_FOUND' | 'PERMISSION_DENIED' | 'INVALID_PATH' | 'UNKNOWN',
    path?: string
  )
}
```

### 使用例
```typescript
try {
  await fileSystem.readTextFile(path);
} catch (error) {
  if (error instanceof FileSystemError) {
    switch (error.code) {
      case 'NOT_FOUND':
        toast.error('ファイルが見つかりません');
        break;
      case 'PERMISSION_DENIED':
        toast.error('アクセスが拒否されました');
        break;
      default:
        toast.error('ファイルの読み込みに失敗しました');
    }
  }
}
```