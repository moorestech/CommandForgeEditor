// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandList } from './CommandList';
import { useSkitStore } from '../../store/skitStore';
import React from 'react';
import i18n from '../../i18n/config';

vi.mock('../../store/skitStore', () => ({
  useSkitStore: vi.fn(),
  getGroupCommandIndices: vi.fn((commands, startIndex) => {
    // Simple mock implementation
    const indices = [startIndex];
    let level = 0;
    for (let i = startIndex; i < commands.length; i++) {
      if (commands[i].type === 'group_start') {
        if (i !== startIndex) level++;
      } else if (commands[i].type === 'group_end') {
        if (level === 0) {
          indices.push(i);
          break;
        }
        level--;
      }
      if (i !== startIndex) indices.push(i);
    }
    return indices;
  }),
  getTopLevelGroups: vi.fn((commands, indices) => {
    // Simple mock implementation - return group_start indices
    return indices.filter((i: number) => commands[i]?.type === 'group_start');
  }),
}));

vi.mock('../dnd/SortableList', () => ({
  SortableList: ({ children, onReorder }: { children: React.ReactNode, onReorder: (from: number, to: number) => void }) => {
    // Capture onReorder for testing
    (window as any).mockOnReorder = onReorder;
    return <div data-testid="sortable-list">{children}</div>;
  },
}));

vi.mock('../dnd/SortableItem', () => ({
  SortableItem: ({ children, id }: { children: React.ReactNode, id: string | number }) => (
    <div data-testid="sortable-item" data-id={id}>{children}</div>
  ),
}));

vi.mock('../dnd/DropZone', () => ({
  DropZone: ({ children, id }: { children: React.ReactNode, id: string }) => (
    <div data-testid="drop-zone" data-id={id}>{children}</div>
  ),
}));

vi.mock('../dnd/DraggableCommand', () => ({
  DraggableCommand: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="draggable-command">{children}</div>
  ),
}));

vi.mock('../../hooks/useCommandTranslation', () => ({
  useCommandTranslation: () => ({
    tCommand: (_key: string, fallback?: string) => fallback || _key,
    tProperty: (_prop: string, _key: string, fallback?: string) => fallback || `${_prop}.${_key}`,
    tEnum: (_prop: string, _value: string, fallback?: string) => fallback || _value,
  }),
}));

// Mock context menu components
vi.mock('../ui/context-menu', () => ({
  ContextMenu: ({ children }: any) => <>{children}</>,
  ContextMenuContent: ({ children }: any) => <div>{children}</div>,
  ContextMenuItem: ({ children, onClick }: any) => (
    <div onClick={onClick}>{children}</div>
  ),
  ContextMenuSeparator: () => <hr />,
  ContextMenuSub: ({ children }: any) => <>{children}</>,
  ContextMenuSubContent: ({ children }: any) => <div>{children}</div>,
  ContextMenuSubTrigger: ({ children }: any) => <div>{children}</div>,
  ContextMenuTrigger: ({ children }: any) => <>{children}</>
}));

// Mock CategoryMenuRenderer
vi.mock('../common/CategoryMenuRenderer', () => ({
  CategoryMenuRenderer: ({ categoryNode, onSelectCommand }: any) => (
    <div data-testid="category-menu-renderer">
      {categoryNode.commands?.map((cmd: any) => (
        <div key={cmd.id} onClick={() => onSelectCommand(cmd.id)}>
          {cmd.label}
        </div>
      ))}
    </div>
  )
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'editor.noSkitSelected': 'スキットが選択されていません',
      };
      return translations[key] || key;
    },
    i18n: {
      changeLanguage: vi.fn(),
      language: 'ja',
    },
  }),
  initReactI18next: {
    type: '3rdParty',
    init: vi.fn(),
  },
}));

describe('CommandList', () => {
  const mockSelectCommand = vi.fn();
  const mockMoveCommand = vi.fn();
  const mockMoveCommands = vi.fn();
  const mockToggleGroupCollapse = vi.fn();
  const mockAddCommandAtIndex = vi.fn();
  const mockAddCommand = vi.fn();
  const mockRemoveCommand = vi.fn();
  const mockRemoveCommands = vi.fn();
  const mockCreateGroup = vi.fn();
  const mockUngroupCommands = vi.fn();

  const defaultCommandDefs = [
    { 
      id: 'text',
      type: 'text', 
      label: 'テキスト',
      commandListLabelFormat: '{character}: {body}',
      defaultBackgroundColor: '#ffeeee' 
    },
    { 
      id: 'choice',
      type: 'choice',
      label: '選択肢',
      commandListLabelFormat: '選択肢: {choices}'
    },
    { id: 'group_start', type: 'group_start', label: 'グループ開始' },
    { id: 'group_end', type: 'group_end', label: 'グループ終了' },
  ];

  const defaultCommandsMap = new Map([
    ['text', { 
      id: 'text',
      type: 'text', 
      label: 'テキスト',
      commandListLabelFormat: '{character}: {body}',
      defaultBackgroundColor: '#ffeeee' 
    }],
    ['choice', { 
      id: 'choice',
      type: 'choice',
      label: '選択肢',
      commandListLabelFormat: '選択肢: {choices}'
    }],
    ['group_start', { id: 'group_start', type: 'group_start', label: 'グループ開始' }],
    ['group_end', { id: 'group_end', type: 'group_end', label: 'グループ終了' }],
  ]);

  beforeEach(async () => {
    vi.clearAllMocks();
    delete (window as any).mockOnReorder;
    
    // Initialize i18n
    if (!i18n.isInitialized) {
      await i18n.init();
    }
  });

  it('renders empty state when no skit is selected', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {},
      currentSkitId: null,
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    expect(screen.getByText('スキットが選択されていません')).toBeInTheDocument();
  });

  it('renders commands when a skit is selected', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'text',
              character: 'CharacterA',
              body: 'こんにちは',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    expect(screen.getByText('CharacterA: こんにちは')).toBeInTheDocument();
  });

  it('renders command with custom background color', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'text',
              character: 'CharacterA',
              body: 'Dark background',
              backgroundColor: '#333333',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    const commandItem = screen.getByText('CharacterA: Dark background').closest('div[data-testid^="command-item"]');
    expect(commandItem).toHaveClass('text-white');
  });

  it('handles command click', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'text',
              character: 'CharacterA',
              body: 'Click me',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    const commandItem = screen.getByText('CharacterA: Click me').closest('div[data-testid^="command-item"]');
    fireEvent.click(commandItem!);
    
    expect(mockSelectCommand).toHaveBeenCalledWith(1, false, false);
  });

  it('handles command click with shift key', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'text',
              character: 'CharacterA',
              body: 'Shift click',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    const commandItem = screen.getByText('CharacterA: Shift click').closest('div[data-testid^="command-item"]');
    fireEvent.click(commandItem!, { shiftKey: true });
    
    expect(mockSelectCommand).toHaveBeenCalledWith(1, false, true);
  });

  it('handles command click with ctrl/cmd key', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'text',
              character: 'CharacterA',
              body: 'Ctrl click',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    const commandItem = screen.getByText('CharacterA: Ctrl click').closest('div[data-testid^="command-item"]');
    fireEvent.click(commandItem!, { ctrlKey: true });
    
    expect(mockSelectCommand).toHaveBeenCalledWith(1, true, false);
  });

  it('renders nested group commands', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'group_start',
              groupName: 'Test Group',
            },
            {
              id: 2,
              type: 'text',
              character: 'CharacterA',
              body: 'Inside group',
            },
            {
              id: 3,
              type: 'group_end',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    expect(screen.getByText('Test Group')).toBeInTheDocument();
    expect(screen.getByText('CharacterA: Inside group')).toBeInTheDocument();
    expect(screen.getByText('グループ終了')).toBeInTheDocument();
  });

  it('handles collapsed groups', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'group_start',
              groupName: 'Collapsed Group',
              isCollapsed: true,
            },
            {
              id: 2,
              type: 'text',
              character: 'CharacterA',
              body: 'Hidden',
            },
            {
              id: 3,
              type: 'group_end',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    expect(screen.getByText('Collapsed Group')).toBeInTheDocument();
    expect(screen.queryByText('CharacterA: Hidden')).not.toBeInTheDocument();
    expect(screen.queryByText('グループ終了')).not.toBeInTheDocument();
  });

  it('toggles group collapse when chevron is clicked', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'group_start',
              groupName: 'Toggle Group',
              isCollapsed: false,
            },
            {
              id: 2,
              type: 'group_end',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    const chevron = document.querySelector('.lucide-chevron-down');
    fireEvent.click(chevron!);
    
    expect(mockToggleGroupCollapse).toHaveBeenCalledWith(1);
  });

  it('handles command reordering', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'text',
              character: 'A',
              body: 'First',
            },
            {
              id: 2,
              type: 'text',
              character: 'B',
              body: 'Second',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    
    // Call the captured onReorder function
    const onReorder = (window as any).mockOnReorder;
    onReorder(0, 1);
    
    expect(mockMoveCommand).toHaveBeenCalledWith(0, 1);
  });

  it('renders drop zones between commands', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'text',
              character: 'A',
              body: 'First',
            },
            {
              id: 2,
              type: 'text',
              character: 'B',
              body: 'Second',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    
    const dropZones = screen.getAllByTestId('drop-zone');
    expect(dropZones.length).toBeGreaterThan(0);
    // The first drop zone is the command-list wrapper
    expect(dropZones[0]).toHaveAttribute('data-id', 'command-list');
  });

  it('shows command indices', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'text',
              character: 'A',
              body: 'First',
            },
            {
              id: 2,
              type: 'text',
              character: 'B',
              body: 'Second',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders command without format', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'unknown',
              data: 'some data',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: [],
      commandsMap: new Map(),
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    
    expect(screen.getByText('unknown')).toBeInTheDocument();
    // Without format, the command should still show the type
    expect(screen.getByText('unknown')).toBeInTheDocument();
  });

  it('applies selected styles to selected commands', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'text',
              character: 'A',
              body: 'Selected',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [1],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    
    const commandItem = screen.getByText('A: Selected').closest('div[data-testid^="command-item"]');
    expect(commandItem).toHaveClass('bg-blue-500');
  });

  it('handles empty command list', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    
    // Should render at least one drop zone
    const dropZones = screen.getAllByTestId('drop-zone');
    expect(dropZones.length).toBe(1);
  });

  it('handles complex nested groups with multi-selection', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            { id: 1, type: 'group_start', groupName: 'Outer Group' },
            { id: 2, type: 'text', character: 'A', body: 'Text 1' },
            { id: 3, type: 'group_start', groupName: 'Inner Group' },
            { id: 4, type: 'text', character: 'B', body: 'Text 2' },
            { id: 5, type: 'group_end' },
            { id: 6, type: 'text', character: 'C', body: 'Text 3' },
            { id: 7, type: 'group_end' },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [2, 4, 6],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    
    // Check that all commands are rendered with correct nesting
    expect(screen.getByText('Outer Group')).toBeInTheDocument();
    expect(screen.getByText('Inner Group')).toBeInTheDocument();
    expect(screen.getByText('A: Text 1')).toBeInTheDocument();
    expect(screen.getByText('B: Text 2')).toBeInTheDocument();
    expect(screen.getByText('C: Text 3')).toBeInTheDocument();
  });


  it('handles dragging a group_start command', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            { id: 1, type: 'text', character: 'A', body: 'Before' },
            { id: 2, type: 'group_start', groupName: 'Group' },
            { id: 3, type: 'text', character: 'B', body: 'Inside' },
            { id: 4, type: 'group_end' },
            { id: 5, type: 'text', character: 'C', body: 'After' },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    
    // Simulate dragging the group_start from index 1 to index 4
    const onReorder = (window as any).mockOnReorder;
    onReorder(1, 3); // Visible indices 1->3 (group_start to after group_end)
    
    expect(mockMoveCommands).toHaveBeenCalled();
  });

  it('uses translated command labels when available', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'text',
              character: 'CharacterA',
              body: 'テスト',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    
    // The command should be rendered with the formatted label
    expect(screen.getByText('CharacterA: テスト')).toBeInTheDocument();
  });

  it('renders command with commandListLabelFormat', () => {
    const customCommandDefs = [
      ...defaultCommandDefs,
      {
        id: 'custom',
        type: 'custom',
        label: 'カスタム',
        commandListLabelFormat: 'Custom: {title}',
      },
    ];

    const customCommandsMap = new Map([
      ...defaultCommandsMap.entries(),
      ['custom', {
        id: 'custom',
        type: 'custom',
        label: 'カスタム',
        commandListLabelFormat: 'Custom: {title}',
      }],
    ]);

    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'custom',
              title: 'My Custom Command',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: customCommandDefs,
      commandsMap: customCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    
    // Should use the commandListLabelFormat
    expect(screen.getByText('Custom: My Custom Command')).toBeInTheDocument();
  });

  it('handles group_start with groupName and format', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      skits: {
        'test-skit': {
          meta: {
            title: 'Test Skit',
            version: 1,
            created: '2025-05-10T12:00:00+09:00',
            modified: '2025-05-10T12:34:56+09:00',
          },
          commands: [
            {
              id: 1,
              type: 'group_start',
              groupName: 'My Group Name',
            },
            {
              id: 2,
              type: 'group_end',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: mockSelectCommand,
      moveCommand: mockMoveCommand,
      moveCommands: mockMoveCommands,
      commandDefinitions: defaultCommandDefs,
      commandsMap: defaultCommandsMap,
      toggleGroupCollapse: mockToggleGroupCollapse,
      addCommandAtIndex: mockAddCommandAtIndex,
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      removeCommands: mockRemoveCommands,
      createGroup: mockCreateGroup,
      ungroupCommands: mockUngroupCommands,
    } as any);

    render(<CommandList />);
    
    // Should display the groupName instead of the type
    expect(screen.getByText('My Group Name')).toBeInTheDocument();
  });
});
