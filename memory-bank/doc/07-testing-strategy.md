# テスト戦略

## 概要

CommandForgeEditorは、単体テスト、統合テスト、E2Eテストの3層構造でテストを実装しています。品質保証と開発効率の両立を目指しています。

## テストフレームワーク

### 使用ツール
- **Vitest**: 単体テスト・統合テスト
- **Playwright**: E2Eテスト
- **React Testing Library**: コンポーネントテスト
- **MSW (Mock Service Worker)**: APIモック

## 1. 単体テスト

### ユーティリティ関数のテスト

```typescript
// utils/commandFormatting.test.ts
import { describe, it, expect } from 'vitest';
import { formatCommandLabel } from './commandFormatting';

describe('formatCommandLabel', () => {
  it('プレースホルダーを正しく置換する', () => {
    const command = {
      id: 1,
      type: 'show_text',
      characterName: '太郎',
      text: 'こんにちは'
    };
    
    const definition = {
      commandListLabelFormat: '{characterName}: {text}'
    };
    
    const result = formatCommandLabel(command, definition);
    expect(result).toBe('太郎: こんにちは');
  });
  
  it('存在しないプレースホルダーは空文字に置換', () => {
    const command = { id: 1, type: 'test' };
    const definition = {
      commandListLabelFormat: '{missing}: テスト'
    };
    
    const result = formatCommandLabel(command, definition);
    expect(result).toBe(': テスト');
  });
});
```

### Storeのテスト

```typescript
// store/skitStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSkitStore } from './skitStore';

describe('SkitStore', () => {
  beforeEach(() => {
    // Storeをリセット
    useSkitStore.setState({
      skits: {},
      currentSkitId: null,
      selectedCommandIds: [],
      commandDefinitions: [],
      validationErrors: [],
      hasUnsavedChanges: false,
      history: { past: [], future: [] }
    });
  });
  
  describe('addCommand', () => {
    it('新しいコマンドを追加できる', () => {
      const { result } = renderHook(() => useSkitStore());
      
      // スキットを作成
      act(() => {
        result.current.createSkit('テストスキット');
      });
      
      // コマンド定義を追加
      act(() => {
        useSkitStore.setState({
          commandDefinitions: [{
            id: 'test_command',
            label: 'テストコマンド',
            properties: {}
          }]
        });
      });
      
      // コマンドを追加
      act(() => {
        result.current.addCommand('test_command');
      });
      
      expect(result.current.currentSkit?.commands).toHaveLength(1);
      expect(result.current.currentSkit?.commands[0].type).toBe('test_command');
      expect(result.current.hasUnsavedChanges).toBe(true);
    });
  });
  
  describe('undo/redo', () => {
    it('操作を元に戻せる', () => {
      const { result } = renderHook(() => useSkitStore());
      
      // 初期状態を設定
      act(() => {
        result.current.createSkit('テスト');
        result.current.addCommand('test_command');
      });
      
      const initialCommandCount = result.current.currentSkit?.commands.length;
      
      // 新しいコマンドを追加
      act(() => {
        result.current.addCommand('test_command');
      });
      
      expect(result.current.currentSkit?.commands).toHaveLength(initialCommandCount! + 1);
      
      // Undo
      act(() => {
        result.current.undo();
      });
      
      expect(result.current.currentSkit?.commands).toHaveLength(initialCommandCount!);
      expect(result.current.canRedo).toBe(true);
      
      // Redo
      act(() => {
        result.current.redo();
      });
      
      expect(result.current.currentSkit?.commands).toHaveLength(initialCommandCount! + 1);
    });
  });
});
```

## 2. コンポーネントテスト

```typescript
// components/skit/CommandList.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandList } from './CommandList';
import { useSkitStore } from '@/store/skitStore';

vi.mock('@/store/skitStore');

describe('CommandList', () => {
  it('コマンドリストを表示する', () => {
    const mockStore = {
      currentSkit: {
        meta: { title: 'テスト' },
        commands: [
          { id: 1, type: 'show_text', text: 'Hello' },
          { id: 2, type: 'show_text', text: 'World' }
        ]
      },
      selectedCommandIds: [1],
      selectCommand: vi.fn()
    };
    
    vi.mocked(useSkitStore).mockReturnValue(mockStore);
    
    render(<CommandList />);
    
    expect(screen.getByText(/Hello/)).toBeInTheDocument();
    expect(screen.getByText(/World/)).toBeInTheDocument();
  });
  
  it('コマンドクリックで選択される', () => {
    const selectCommand = vi.fn();
    const mockStore = {
      currentSkit: {
        commands: [{ id: 1, type: 'test', text: 'クリックテスト' }]
      },
      selectedCommandIds: [],
      selectCommand
    };
    
    vi.mocked(useSkitStore).mockReturnValue(mockStore);
    
    render(<CommandList />);
    
    fireEvent.click(screen.getByText(/クリックテスト/));
    
    expect(selectCommand).toHaveBeenCalledWith(1, false);
  });
});
```

## 3. E2Eテスト

```typescript
// e2e/basic.spec.ts
import { test, expect } from '@playwright/test';

test.describe('基本操作', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  
  test('新しいスキットを作成できる', async ({ page }) => {
    // 新規作成ボタンをクリック
    await page.getByRole('button', { name: /新規作成/ }).click();
    
    // ダイアログでタイトルを入力
    await page.getByPlaceholder('スキット名').fill('E2Eテストスキット');
    await page.getByRole('button', { name: '作成' }).click();
    
    // スキットが作成されたことを確認
    await expect(page.getByText('E2Eテストスキット')).toBeVisible();
  });
  
  test('コマンドを追加・編集できる', async ({ page }) => {
    // コマンド追加ボタンをクリック
    await page.getByRole('button', { name: /コマンド追加/ }).click();
    
    // ドロップダウンからコマンドタイプを選択
    await page.getByRole('menuitem', { name: 'テキスト表示' }).click();
    
    // コマンドが追加されたことを確認
    await expect(page.getByText(/テキスト表示/)).toBeVisible();
    
    // プロパティを編集
    await page.getByLabel('テキスト').fill('Hello E2E!');
    
    // 変更が反映されたことを確認
    await expect(page.getByText('Hello E2E!')).toBeVisible();
  });
  
  test('ドラッグ&ドロップでコマンドを並び替えできる', async ({ page }) => {
    // 2つのコマンドを追加
    await page.getByRole('button', { name: /コマンド追加/ }).click();
    await page.getByRole('menuitem', { name: 'テキスト表示' }).click();
    
    await page.getByRole('button', { name: /コマンド追加/ }).click();
    await page.getByRole('menuitem', { name: 'テキスト表示' }).click();
    
    // ドラッグ&ドロップ
    const firstCommand = page.locator('.command-item').first();
    const secondCommand = page.locator('.command-item').nth(1);
    
    await firstCommand.dragTo(secondCommand);
    
    // 順序が入れ替わったことを確認
    // スクリーンショットで検証
    await expect(page).toHaveScreenshot('command-reordered.png');
  });
});
```

## 4. 統合テスト

```typescript
// integration/file-operations.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProjectManager } from '@/utils/projectManager';
import { mockFileSystem } from '@/test/mocks/fileSystem';

describe('ファイル操作の統合テスト', () => {
  let projectManager: ProjectManager;
  
  beforeEach(() => {
    // ファイルシステムをモック
    vi.mock('@/utils/fileSystem', () => ({
      fileSystem: mockFileSystem
    }));
    
    projectManager = new ProjectManager('/test/project');
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  it('プロジェクトの初期化と読み込み', async () => {
    // プロジェクトを初期化
    await projectManager.initialize();
    
    // ディレクトリが作成されたことを確認
    expect(mockFileSystem.createDir).toHaveBeenCalledWith(
      '/test/project/skits',
      { recursive: true }
    );
    
    // コマンド定義を読み込み
    const commands = await projectManager.loadCommands();
    expect(commands).toHaveLength(1);
    expect(commands[0].id).toBe('show_text');
    
    // スキットを読み込み
    const skits = await projectManager.loadSkits();
    expect(Object.keys(skits)).toHaveLength(1);
  });
  
  it('スキットの保存と削除', async () => {
    const testSkit = {
      meta: {
        title: 'テストスキット',
        version: 1,
        created: new Date().toISOString(),
        modified: new Date().toISOString()
      },
      commands: []
    };
    
    // スキットを保存
    await projectManager.saveSkit('test-skit', testSkit);
    
    expect(mockFileSystem.writeTextFile).toHaveBeenCalledWith(
      '/test/project/skits/test-skit.json',
      JSON.stringify(testSkit, null, 2)
    );
    
    // スキットを削除
    await projectManager.deleteSkit('test-skit');
    
    expect(mockFileSystem.removeFile).toHaveBeenCalledWith(
      '/test/project/skits/test-skit.json'
    );
  });
});
```

## テストユーティリティ

### カスタムレンダラー

```typescript
// test/utils/render.tsx
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { DndProvider } from '@/components/dnd/DndProvider';

function AllTheProviders({ children }: { children: React.ReactNode }) {
  return (
    <DndProvider>
      {children}
    </DndProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}
```

### モックファクトリー

```typescript
// test/factories/index.ts
export function createMockSkit(overrides?: Partial<Skit>): Skit {
  return {
    meta: {
      title: 'Mock Skit',
      version: 1,
      created: '2024-01-01T00:00:00Z',
      modified: '2024-01-01T00:00:00Z',
      ...overrides?.meta
    },
    commands: overrides?.commands || []
  };
}

export function createMockCommand(overrides?: Partial<SkitCommand>): SkitCommand {
  return {
    id: Math.random(),
    type: 'show_text',
    text: 'Mock text',
    ...overrides
  };
}

export function createMockCommandDefinition(
  overrides?: Partial<CommandDefinition>
): CommandDefinition {
  return {
    id: 'mock_command',
    label: 'Mock Command',
    description: 'A mock command for testing',
    commandListLabelFormat: '{text}',
    properties: {},
    ...overrides
  };
}
```

## CI/CD統合

### GitHub Actions設定

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: |
        cd frontend
        npm ci
        
    - name: Run unit tests
      run: |
        cd frontend
        npm run test
        
    - name: Run E2E tests
      run: |
        cd frontend
        npx playwright install --with-deps
        npm run test:e2e
        
    - name: Upload test results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: |
          frontend/coverage/
          frontend/test-results/
          frontend/playwright-report/
```

## テストカバレッジ

### カバレッジ目標
- 全体: 80%以上
- ユーティリティ関数: 95%以上
- Store: 90%以上
- コンポーネント: 70%以上

### カバレッジレポート設定

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        'src/components/ui/**', // Shadcn UIコンポーネントは除外
      ]
    }
  }
});
```