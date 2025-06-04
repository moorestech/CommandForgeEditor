# コンポーネント構成詳細

## 概要

CommandForgeEditorのUIは、React componentsで構築されています。コンポーネントは機能別に整理され、再利用性と保守性を重視した設計になっています。

## コンポーネント階層

```
App
├── MainLayout
│   ├── SkitList (左サイドバー)
│   ├── CommandList (中央パネル)
│   │   ├── Toolbar
│   │   └── DraggableCommand[]
│   ├── CommandEditor (右パネル)
│   └── ValidationLog (下部パネル)
└── Providers
    ├── DndProvider
    └── Toaster
```

## 主要コンポーネント

### 1. App.tsx

アプリケーションのルートコンポーネント。初期化とプロバイダー設定を担当。

```typescript
function App() {
  const { loadProject, projectPath } = useSkitStore();
  
  useEffect(() => {
    // 初期化処理
    const initializeApp = async () => {
      const lastProjectPath = localStorage.getItem('lastProjectPath');
      if (lastProjectPath) {
        await loadProject(lastProjectPath);
      }
    };
    initializeApp();
  }, []);
  
  return (
    <DndProvider>
      <MainLayout />
      <Toaster />
    </DndProvider>
  );
}
```

### 2. MainLayout.tsx

メインレイアウトを構成。Resizableパネルを使用して柔軟なレイアウトを実現。

```typescript
export function MainLayout() {
  return (
    <div className="flex flex-col h-screen">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={20} minSize={15}>
          <SkitList />
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={40}>
          <CommandList />
        </ResizablePanel>
        
        <ResizableHandle />
        
        <ResizablePanel defaultSize={40}>
          <CommandEditor />
        </ResizablePanel>
      </ResizablePanelGroup>
      
      <ValidationLog />
    </div>
  );
}
```

### 3. SkitList.tsx

スキット一覧の表示と管理。

**主な機能:**
- スキット一覧表示
- 新規作成/選択
- 削除確認ダイアログ
- 未保存変更の警告

```typescript
export function SkitList() {
  const { skits, currentSkitId, createSkit, selectSkit } = useSkitStore();
  
  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">スキット</h2>
        <Button size="sm" onClick={handleCreateSkit}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {Object.entries(skits).map(([id, skit]) => (
          <SkitItem
            key={id}
            skit={skit}
            isActive={id === currentSkitId}
            onClick={() => selectSkit(id)}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
```

### 4. CommandList.tsx

コマンドリストの表示とドラッグ＆ドロップ管理。

**主な機能:**
- コマンド一覧表示
- ドラッグ＆ドロップ並び替え
- マルチセレクト
- グループ折りたたみ
- コンテキストメニュー

```typescript
export function CommandList() {
  const { currentSkit, selectedCommandIds } = useSkitStore();
  const { handleDragEnd } = useDndSortable();
  
  return (
    <div className="h-full flex flex-col">
      <Toolbar />
      
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={sortableItems}>
          <ScrollArea className="flex-1 p-4">
            {renderCommands(commands)}
          </ScrollArea>
        </SortableContext>
      </DndContext>
    </div>
  );
}
```

### 5. DraggableCommand.tsx

個別のコマンド表示とインタラクション。

**主な機能:**
- コマンド情報表示
- 選択状態管理
- ドラッグハンドル
- ネストレベル表示

```typescript
export const DraggableCommand = React.memo(({ 
  command, 
  isSelected, 
  nestLevel 
}: Props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id: command.id,
  });
  
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        marginLeft: `${nestLevel * 20}px`,
      }}
      className={cn(
        "flex items-center gap-2 p-2 rounded",
        isSelected && "ring-2 ring-primary",
        isDragging && "opacity-50"
      )}
    >
      <div {...attributes} {...listeners}>
        <GripVertical className="h-4 w-4" />
      </div>
      
      <CommandContent command={command} />
    </div>
  );
});
```

### 6. CommandEditor.tsx

選択されたコマンドのプロパティ編集。

**主な機能:**
- 動的フォーム生成
- マルチセレクト編集
- リアルタイム検証
- カスタムエディタ

```typescript
export function CommandEditor() {
  const { selectedCommands, updateCommand } = useSkitStore();
  
  if (selectedCommands.length === 0) {
    return <EmptyState />;
  }
  
  if (selectedCommands.length > 1) {
    return <MultiSelectEditor commands={selectedCommands} />;
  }
  
  const command = selectedCommands[0];
  const definition = getCommandDefinition(command.type);
  
  return (
    <div className="h-full p-4 overflow-auto">
      <Form>
        {Object.entries(definition.properties).map(([key, prop]) => (
          <PropertyEditor
            key={key}
            name={key}
            definition={prop}
            value={command[key]}
            onChange={(value) => updateCommand(command.id, { [key]: value })}
          />
        ))}
      </Form>
    </div>
  );
}
```

### 7. PropertyEditor

プロパティタイプに応じた編集UIを提供。

```typescript
function PropertyEditor({ name, definition, value, onChange }: Props) {
  switch (definition.type) {
    case 'string':
      return (
        <FormField>
          <FormLabel>{definition.label}</FormLabel>
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        </FormField>
      );
      
    case 'number':
      return (
        <FormField>
          <FormLabel>{definition.label}</FormLabel>
          <Input
            type="number"
            value={value || 0}
            min={definition.min}
            max={definition.max}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </FormField>
      );
      
    case 'boolean':
      return (
        <FormField>
          <FormLabel>{definition.label}</FormLabel>
          <Switch
            checked={value || false}
            onCheckedChange={onChange}
          />
        </FormField>
      );
      
    case 'enum':
      return (
        <FormField>
          <FormLabel>{definition.label}</FormLabel>
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {definition.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      );
      
    case 'vector2':
      return <VectorInput dimensions={2} value={value} onChange={onChange} />;
      
    // その他のタイプ...
  }
}
```

### 8. Toolbar.tsx

コマンド操作のツールバー。

**主な機能:**
- コマンド追加
- コピー/カット/ペースト
- 削除
- アンドゥ/リドゥ
- 保存

```typescript
export function Toolbar() {
  const { 
    addCommand, 
    copyCommands, 
    pasteCommands, 
    canUndo, 
    canRedo,
    undo,
    redo,
    save
  } = useSkitStore();
  
  // キーボードショートカット
  useKeyboardShortcuts({
    'ctrl+z': undo,
    'ctrl+y': redo,
    'ctrl+s': save,
    'ctrl+c': copyCommands,
    'ctrl+v': pasteCommands,
  });
  
  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <CommandAddDropdown onAdd={addCommand} />
      
      <Separator orientation="vertical" />
      
      <Button size="sm" variant="ghost" onClick={copyCommands}>
        <Copy className="h-4 w-4" />
      </Button>
      
      <Button size="sm" variant="ghost" onClick={pasteCommands}>
        <Clipboard className="h-4 w-4" />
      </Button>
      
      <Separator orientation="vertical" />
      
      <Button size="sm" variant="ghost" onClick={undo} disabled={!canUndo}>
        <Undo className="h-4 w-4" />
      </Button>
      
      <Button size="sm" variant="ghost" onClick={redo} disabled={!canRedo}>
        <Redo className="h-4 w-4" />
      </Button>
      
      <div className="ml-auto">
        <Button size="sm" onClick={save}>
          <Save className="h-4 w-4 mr-2" />
          保存
        </Button>
      </div>
    </div>
  );
}
```

### 9. ValidationLog.tsx

検証エラーの表示。

```typescript
export function ValidationLog() {
  const { validationErrors } = useSkitStore();
  
  if (validationErrors.length === 0) return null;
  
  return (
    <div className="border-t bg-destructive/10 p-2 max-h-32 overflow-auto">
      {validationErrors.map((error, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span>
            コマンド {error.commandId}: {error.message}
          </span>
        </div>
      ))}
    </div>
  );
}
```

## カスタムフック

### useKeyboardShortcuts

キーボードショートカットの管理。

```typescript
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = getKeyCombo(e);
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
```

### useDndSortable

ドラッグ＆ドロップのロジック。

```typescript
export function useDndSortable() {
  const { moveCommand } = useSkitStore();
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      moveCommand(
        Number(active.id),
        Number(over.id),
        event.collisions?.[0]?.data?.dropPosition || 'after'
      );
    }
  };
  
  return { handleDragEnd };
}
```

## UIコンポーネントライブラリ

Shadcn UIをベースにしたコンポーネント群：

- **Button**: 各種ボタン
- **Input**: テキスト入力
- **Select**: ドロップダウン選択
- **Dialog**: モーダルダイアログ
- **Toast**: 通知メッセージ
- **ScrollArea**: スクロール領域
- **Separator**: 区切り線
- **Form**: フォーム要素

各コンポーネントは`components/ui/`に配置され、統一されたデザインシステムを提供。