# 状態管理詳細

## 概要

CommandForgeEditorの状態管理は、Zustand + Immerを使用して実装されています。この組み合わせにより、シンプルなAPIと不変性を保った状態更新を実現しています。

## Zustand Store設計

### Store構造

```typescript
// store/skitStore.ts
interface SkitStore {
  // === State ===
  // スキットデータ
  skits: Record<string, Skit>;
  currentSkitId: string | null;
  
  // UI状態
  selectedCommandIds: number[];
  clipboard: SkitCommand[] | null;
  
  // コマンド定義
  commandDefinitions: CommandDefinition[];
  
  // 検証
  validationErrors: ValidationError[];
  
  // プロジェクト
  projectPath: string;
  hasUnsavedChanges: boolean;
  
  // 履歴管理
  history: {
    past: HistoryEntry[];
    future: HistoryEntry[];
  };
  
  // === Computed Values ===
  currentSkit: Skit | null;
  selectedCommands: SkitCommand[];
  canUndo: boolean;
  canRedo: boolean;
  
  // === Actions ===
  // プロジェクト管理
  loadProject: (path: string) => Promise<void>;
  saveProject: () => Promise<void>;
  
  // スキット操作
  createSkit: (title: string) => void;
  deleteSkit: (id: string) => void;
  selectSkit: (id: string) => void;
  
  // コマンド操作
  addCommand: (type: string, afterId?: number) => void;
  updateCommand: (id: number, updates: Partial<SkitCommand>) => void;
  deleteCommands: (ids: number[]) => void;
  moveCommand: (id: number, targetId: number, position: 'before' | 'after') => void;
  
  // 選択操作
  selectCommand: (id: number, multi?: boolean) => void;
  selectCommandRange: (id: number) => void;
  clearSelection: () => void;
  
  // クリップボード
  copyCommands: () => void;
  cutCommands: () => void;
  pasteCommands: (afterId?: number) => void;
  
  // 履歴
  undo: () => void;
  redo: () => void;
  
  // 検証
  validateCurrentSkit: () => void;
}
```

### Storeの実装

```typescript
export const useSkitStore = create<SkitStore>()(
  immer((set, get) => ({
    // === Initial State ===
    skits: {},
    currentSkitId: null,
    selectedCommandIds: [],
    clipboard: null,
    commandDefinitions: [],
    validationErrors: [],
    projectPath: '',
    hasUnsavedChanges: false,
    history: {
      past: [],
      future: []
    },
    
    // === Computed Values ===
    get currentSkit() {
      const { skits, currentSkitId } = get();
      return currentSkitId ? skits[currentSkitId] : null;
    },
    
    get selectedCommands() {
      const { currentSkit, selectedCommandIds } = get();
      if (!currentSkit) return [];
      return currentSkit.commands.filter(cmd => 
        selectedCommandIds.includes(cmd.id)
      );
    },
    
    get canUndo() {
      return get().history.past.length > 0;
    },
    
    get canRedo() {
      return get().history.future.length > 0;
    },
    
    // === Actions Implementation ===
    loadProject: async (path: string) => {
      try {
        // コマンド定義の読み込み
        const commandsYaml = await readTextFile(`${path}/commands.yaml`);
        const definitions = parseYaml(commandsYaml);
        
        // スキットファイルの読み込み
        const skitFiles = await readDir(`${path}/skits`);
        const skits: Record<string, Skit> = {};
        
        for (const file of skitFiles) {
          if (file.name?.endsWith('.json')) {
            const content = await readTextFile(file.path);
            const skit = JSON.parse(content) as Skit;
            const id = file.name.replace('.json', '');
            skits[id] = skit;
          }
        }
        
        set(state => {
          state.commandDefinitions = mergeWithReservedCommands(definitions);
          state.skits = skits;
          state.projectPath = path;
          state.currentSkitId = Object.keys(skits)[0] || null;
          state.hasUnsavedChanges = false;
        });
        
        // 初期検証
        get().validateCurrentSkit();
      } catch (error) {
        console.error('Failed to load project:', error);
        toast.error('プロジェクトの読み込みに失敗しました');
      }
    },
    
    addCommand: (type: string, afterId?: number) => {
      const definition = get().commandDefinitions.find(d => d.id === type);
      if (!definition) return;
      
      set(state => {
        const skit = state.currentSkit;
        if (!skit) return;
        
        // 履歴に記録
        recordHistory(state);
        
        // 新しいコマンドを作成
        const newCommand: SkitCommand = {
          id: generateCommandId(),
          type,
          backgroundColor: definition.defaultBackgroundColor,
          ...applyDefaults({}, definition)
        };
        
        // 挿入位置を決定
        if (afterId !== undefined) {
          const index = skit.commands.findIndex(c => c.id === afterId);
          skit.commands.splice(index + 1, 0, newCommand);
        } else {
          skit.commands.push(newCommand);
        }
        
        state.hasUnsavedChanges = true;
        state.selectedCommandIds = [newCommand.id];
      });
      
      get().validateCurrentSkit();
    },
    
    updateCommand: (id: number, updates: Partial<SkitCommand>) => {
      set(state => {
        const skit = state.currentSkit;
        if (!skit) return;
        
        recordHistory(state);
        
        const command = skit.commands.find(c => c.id === id);
        if (command) {
          Object.assign(command, updates);
          state.hasUnsavedChanges = true;
        }
      });
      
      get().validateCurrentSkit();
    },
    
    moveCommand: (id: number, targetId: number, position: 'before' | 'after') => {
      set(state => {
        const skit = state.currentSkit;
        if (!skit) return;
        
        recordHistory(state);
        
        // コマンドを移動
        const commands = skit.commands;
        const sourceIndex = commands.findIndex(c => c.id === id);
        const targetIndex = commands.findIndex(c => c.id === targetId);
        
        if (sourceIndex === -1 || targetIndex === -1) return;
        
        const [removed] = commands.splice(sourceIndex, 1);
        const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
        commands.splice(insertIndex, 0, removed);
        
        state.hasUnsavedChanges = true;
      });
    },
    
    undo: () => {
      set(state => {
        if (state.history.past.length === 0) return;
        
        const previous = state.history.past[state.history.past.length - 1];
        state.history.past.pop();
        
        // 現在の状態を未来履歴に保存
        state.history.future.push(createHistoryEntry(state));
        
        // 前の状態を復元
        restoreFromHistory(state, previous);
      });
      
      get().validateCurrentSkit();
    },
    
    validateCurrentSkit: () => {
      const { currentSkit, commandDefinitions } = get();
      if (!currentSkit) return;
      
      const errors: ValidationError[] = [];
      
      currentSkit.commands.forEach(command => {
        const definition = commandDefinitions.find(d => d.id === command.type);
        if (!definition) {
          errors.push({
            commandId: command.id,
            message: `未知のコマンドタイプ: ${command.type}`,
            severity: 'error'
          });
          return;
        }
        
        // JSON Schema検証
        const schema = generateSchema(definition);
        const valid = ajv.validate(schema, command);
        
        if (!valid && ajv.errors) {
          ajv.errors.forEach(error => {
            errors.push({
              commandId: command.id,
              property: error.instancePath.replace('/', ''),
              message: error.message || 'Validation error',
              severity: 'error'
            });
          });
        }
      });
      
      set(state => {
        state.validationErrors = errors;
      });
    }
  }))
);
```

## 状態更新パターン

### 1. Immerによる不変更新

```typescript
// 直接的な更新が可能
set(state => {
  state.skits[id].meta.title = newTitle;
  state.hasUnsavedChanges = true;
});

// 配列操作も簡潔に
set(state => {
  state.currentSkit.commands.push(newCommand);
  state.selectedCommandIds = [newCommand.id];
});
```

### 2. 履歴管理

```typescript
function recordHistory(state: SkitStore) {
  // 現在の状態をスナップショット
  const entry: HistoryEntry = {
    skits: JSON.parse(JSON.stringify(state.skits)),
    currentSkitId: state.currentSkitId,
    selectedCommandIds: [...state.selectedCommandIds]
  };
  
  state.history.past.push(entry);
  state.history.future = []; // Redo履歴をクリア
  
  // 履歴の最大数を制限
  if (state.history.past.length > MAX_HISTORY_SIZE) {
    state.history.past.shift();
  }
}
```

### 3. 選択状態の管理

```typescript
selectCommand: (id: number, multi?: boolean) => {
  set(state => {
    if (multi) {
      // マルチセレクト（トグル）
      const index = state.selectedCommandIds.indexOf(id);
      if (index >= 0) {
        state.selectedCommandIds.splice(index, 1);
      } else {
        state.selectedCommandIds.push(id);
      }
    } else {
      // シングルセレクト
      state.selectedCommandIds = [id];
    }
  });
},

selectCommandRange: (id: number) => {
  set(state => {
    const skit = state.currentSkit;
    if (!skit || state.selectedCommandIds.length === 0) {
      state.selectedCommandIds = [id];
      return;
    }
    
    // 範囲選択ロジック
    const lastSelected = state.selectedCommandIds[state.selectedCommandIds.length - 1];
    const commands = skit.commands;
    const startIndex = commands.findIndex(c => c.id === lastSelected);
    const endIndex = commands.findIndex(c => c.id === id);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const [start, end] = startIndex < endIndex 
      ? [startIndex, endIndex] 
      : [endIndex, startIndex];
    
    state.selectedCommandIds = commands
      .slice(start, end + 1)
      .map(c => c.id);
  });
}
```

## パフォーマンス最適化

### 1. セレクターの使用

```typescript
// 特定の部分だけを購読
const currentSkit = useSkitStore(state => state.currentSkit);
const selectedCommands = useSkitStore(state => state.selectedCommands);

// 複数の値を効率的に取得
const { addCommand, updateCommand } = useSkitStore(
  state => ({ 
    addCommand: state.addCommand, 
    updateCommand: state.updateCommand 
  }),
  shallow // 浅い比較で再レンダリングを最適化
);
```

### 2. メモ化

```typescript
// 計算結果のメモ化
const commandMap = useMemo(() => {
  return new Map(currentSkit?.commands.map(c => [c.id, c]) || []);
}, [currentSkit?.commands]);

// コールバックのメモ化
const handleCommandUpdate = useCallback((id: number, updates: any) => {
  updateCommand(id, updates);
}, [updateCommand]);
```

### 3. バッチ更新

```typescript
// 複数の更新を一度に実行
set(state => {
  // 複数のコマンドを一度に更新
  updates.forEach(({ id, changes }) => {
    const command = state.currentSkit.commands.find(c => c.id === id);
    if (command) {
      Object.assign(command, changes);
    }
  });
  
  state.hasUnsavedChanges = true;
});
```

## デバッグとDevtools

### Zustand DevTools統合

```typescript
export const useSkitStore = create<SkitStore>()(
  devtools(
    immer((set, get) => ({
      // store implementation
    })),
    {
      name: 'skit-store',
    }
  )
);
```

### ロギングミドルウェア

```typescript
const logger = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('Previous state:', get());
      set(...args);
      console.log('New state:', get());
    },
    get,
    api
  );
```

## 永続化

### LocalStorage統合

```typescript
// プロジェクトパスの永続化
useEffect(() => {
  if (projectPath) {
    localStorage.setItem('lastProjectPath', projectPath);
  }
}, [projectPath]);

// ユーザー設定の永続化
const persist = {
  name: 'skit-editor-settings',
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    recentProjects: state.recentProjects,
    preferences: state.preferences,
  }),
};
```