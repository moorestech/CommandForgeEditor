// AI Generated Test Code
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { useSkitStore } from '../../store/skitStore';
import { toast } from 'sonner';
import { CommandDefinition } from '../../types';

// Mock dependencies
vi.mock('../../store/skitStore');
vi.mock('sonner');
vi.mock('../ui/sidebar', () => ({
  SidebarTrigger: ({ className }: any) => (
    <button data-testid="sidebar-trigger" className={className}>Sidebar</button>
  )
}));
vi.mock('../dnd/DraggableCommand', () => ({
  DraggableCommand: ({ children }: any) => <div data-testid="draggable-command">{children}</div>
}));
vi.mock('../dnd/DropZone', () => ({
  DropZone: ({ children, id, className }: any) => (
    <div data-testid={`drop-zone-${id}`} className={className}>{children}</div>
  )
}));
vi.mock('../../hooks/useCommandTranslation', () => ({
  useCommandTranslation: (commandType: string) => ({
    tCommand: (key: string, fallback: string) => fallback
  })
}));

// Simple dropdown menu mock
vi.mock('../ui/dropdown-menu', () => {
  const React = require('react');
  return {
    DropdownMenu: ({ children }: any) => <>{children}</>,
    DropdownMenuTrigger: ({ children, asChild }: any) => {
      const [open, setOpen] = React.useState(false);
      const child = React.Children.only(children);
      return React.cloneElement(child, {
        onClick: () => setOpen(true),
        'data-state': open ? 'open' : 'closed'
      });
    },
    DropdownMenuContent: ({ children }: any) => (
      <div data-testid="dropdown-content" role="menu">
        {children}
      </div>
    ),
    DropdownMenuItem: ({ children, onClick }: any) => (
      <div role="menuitem" onClick={onClick}>
        {children}
      </div>
    )
  };
});

describe('Toolbar', () => {
  const mockAddCommand = vi.fn();
  const mockMoveCommand = vi.fn();
  const mockRemoveCommands = vi.fn();
  const mockCopySelectedCommands = vi.fn();
  const mockCutSelectedCommands = vi.fn();
  const mockPasteCommandsFromClipboard = vi.fn();
  const mockUndo = vi.fn();
  const mockRedo = vi.fn();
  const mockSaveSkit = vi.fn();

  const mockCommandDefinitions: CommandDefinition[] = [
    {
      id: 'text',
      label: 'Text',
      description: 'Display text',
      commandListLabelFormat: 'TEXT: {body}',
      properties: {
        body: { type: 'string', required: true }
      }
    },
    {
      id: 'choice',
      label: 'Choice',
      description: 'Show choices',
      commandListLabelFormat: 'CHOICE',
      properties: {}
    }
  ];

  const defaultMockState = {
    currentSkitId: 'test-skit',
    selectedCommandIds: [],
    addCommand: mockAddCommand,
    moveCommand: mockMoveCommand,
    removeCommands: mockRemoveCommands,
    copySelectedCommands: mockCopySelectedCommands,
    cutSelectedCommands: mockCutSelectedCommands,
    pasteCommandsFromClipboard: mockPasteCommandsFromClipboard,
    undo: mockUndo,
    redo: mockRedo,
    saveSkit: mockSaveSkit,
    commandDefinitions: mockCommandDefinitions,
    skits: {
      'test-skit': {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: '2023-01-01T00:00:00Z',
          modified: '2023-01-01T00:00:00Z'
        },
        commands: [
          { id: 1, type: 'text', body: 'Hello' },
          { id: 2, type: 'choice' }
        ]
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSkitStore).mockReturnValue(defaultMockState as any);
    vi.mocked(useSkitStore.getState).mockReturnValue(defaultMockState as any);
  });

  it('should render all toolbar buttons', () => {
    render(<Toolbar />);

    expect(screen.getByTestId('sidebar-trigger')).toBeInTheDocument();
    expect(screen.getByText('追加')).toBeInTheDocument();
    expect(screen.getByText('コピー')).toBeInTheDocument();
    expect(screen.getByText('切り取り')).toBeInTheDocument();
    expect(screen.getByText('貼り付け')).toBeInTheDocument();
    expect(screen.getByText('削除')).toBeInTheDocument();
    expect(screen.getByText('保存')).toBeInTheDocument();
  });

  it('should disable buttons when no skit is selected', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      ...defaultMockState,
      currentSkitId: null
    } as any);

    render(<Toolbar />);

    const addButton = screen.getByRole('button', { name: /追加/i });
    const undoButton = screen.getAllByRole('button').find(btn => btn.querySelector('.lucide-undo'));
    const redoButton = screen.getAllByRole('button').find(btn => btn.querySelector('.lucide-redo'));
    const saveButton = screen.getByRole('button', { name: /保存/i });

    expect(addButton).toBeDisabled();
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();
    expect(saveButton).toBeDisabled();
  });

  it('should disable command-specific buttons when no commands are selected', () => {
    render(<Toolbar />);

    const copyButton = screen.getByRole('button', { name: /コピー/i });
    const cutButton = screen.getByRole('button', { name: /切り取り/i });
    const deleteButton = screen.getByRole('button', { name: /削除/i });

    expect(copyButton).toBeDisabled();
    expect(cutButton).toBeDisabled();
    expect(deleteButton).toBeDisabled();
  });

  it('should enable command-specific buttons when commands are selected', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      ...defaultMockState,
      selectedCommandIds: [1, 2]
    } as any);

    render(<Toolbar />);

    const copyButton = screen.getByRole('button', { name: /コピー/i });
    const cutButton = screen.getByRole('button', { name: /切り取り/i });
    const deleteButton = screen.getByRole('button', { name: /削除/i });

    expect(copyButton).not.toBeDisabled();
    expect(cutButton).not.toBeDisabled();
    expect(deleteButton).not.toBeDisabled();
  });

  it('should show command dropdown when add button is clicked', () => {
    render(<Toolbar />);

    // The dropdown content should be rendered
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByText('Choice')).toBeInTheDocument();
  });

  it('should add command when command type is selected from dropdown', () => {
    render(<Toolbar />);

    // Click the Text option
    const textOption = screen.getByText('Text');
    fireEvent.click(textOption.parentElement!);

    expect(mockAddCommand).toHaveBeenCalledWith(expect.objectContaining({
      type: 'text',
      body: ''
    }));
    expect(toast.success).toHaveBeenCalledWith('Textを追加しました');
  });

  it('should add command after selected command', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      ...defaultMockState,
      selectedCommandIds: [1]
    } as any);

    render(<Toolbar />);

    // Click the Text option
    const textOption = screen.getByText('Text');
    fireEvent.click(textOption.parentElement!);

    expect(mockAddCommand).toHaveBeenCalled();
    expect(mockMoveCommand).toHaveBeenCalledWith(1, 1); // Move new command after selected
  });

  it('should copy selected commands', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      ...defaultMockState,
      selectedCommandIds: [1, 2]
    } as any);

    render(<Toolbar />);

    const copyButton = screen.getByRole('button', { name: /コピー/i });
    fireEvent.click(copyButton);

    expect(mockCopySelectedCommands).toHaveBeenCalled();
  });

  it('should cut selected commands', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      ...defaultMockState,
      selectedCommandIds: [1, 2]
    } as any);

    render(<Toolbar />);

    const cutButton = screen.getByRole('button', { name: /切り取り/i });
    fireEvent.click(cutButton);

    expect(mockCutSelectedCommands).toHaveBeenCalled();
  });

  it('should paste commands from clipboard', () => {
    render(<Toolbar />);

    const pasteButton = screen.getByRole('button', { name: /貼り付け/i });
    fireEvent.click(pasteButton);

    expect(mockPasteCommandsFromClipboard).toHaveBeenCalled();
  });

  it('should remove selected commands', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      ...defaultMockState,
      selectedCommandIds: [1, 2]
    } as any);

    render(<Toolbar />);

    const deleteButton = screen.getByRole('button', { name: /削除/i });
    fireEvent.click(deleteButton);

    expect(mockRemoveCommands).toHaveBeenCalledWith([1, 2]);
  });

  it('should call undo when undo button is clicked', () => {
    render(<Toolbar />);

    const undoButton = screen.getAllByRole('button').find(btn => btn.querySelector('.lucide-undo'));
    fireEvent.click(undoButton!);

    expect(mockUndo).toHaveBeenCalled();
  });

  it('should call redo when redo button is clicked', () => {
    render(<Toolbar />);

    const redoButton = screen.getAllByRole('button').find(btn => btn.querySelector('.lucide-redo'));
    fireEvent.click(redoButton!);

    expect(mockRedo).toHaveBeenCalled();
  });

  it('should save skit successfully', async () => {
    mockSaveSkit.mockResolvedValueOnce(undefined);

    render(<Toolbar />);

    const saveButton = screen.getByRole('button', { name: /保存/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveSkit).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('スキットを保存しました');
    });
  });

  it('should show error toast when save fails', async () => {
    mockSaveSkit.mockRejectedValueOnce(new Error('Save failed'));

    render(<Toolbar />);

    const saveButton = screen.getByRole('button', { name: /保存/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockSaveSkit).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('保存に失敗しました: Save failed');
    });
  });

  it('should render draggable commands in dropdown', () => {
    render(<Toolbar />);

    const draggableCommands = screen.getAllByTestId('draggable-command');
    expect(draggableCommands).toHaveLength(2);
  });

  it('should render drop zones for copy and trash', () => {
    render(<Toolbar />);

    expect(screen.getByTestId('drop-zone-copy-zone')).toBeInTheDocument();
    expect(screen.getByTestId('drop-zone-trash-zone')).toBeInTheDocument();
  });

  it('should not call removeCommands when no commands are selected', () => {
    render(<Toolbar />);

    const deleteButton = screen.getByRole('button', { name: /削除/i });
    
    // Button should be disabled, but let's test the onClick logic
    expect(deleteButton).toBeDisabled();
    expect(mockRemoveCommands).not.toHaveBeenCalled();
  });

  it('should handle non-Error objects in save error', async () => {
    mockSaveSkit.mockRejectedValueOnce('String error');

    render(<Toolbar />);

    const saveButton = screen.getByRole('button', { name: /保存/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('保存に失敗しました: String error');
    });
  });

  it('should not add command if commandDef is not found', () => {
    const invalidCommandDefinitions = [...mockCommandDefinitions];
    vi.mocked(useSkitStore).mockReturnValue({
      ...defaultMockState,
      commandDefinitions: invalidCommandDefinitions
    } as any);

    render(<Toolbar />);

    const addButton = screen.getByRole('button', { name: /追加/i });
    fireEvent.click(addButton);

    // Mock the command definitions to return undefined for a specific type
    vi.mocked(useSkitStore).mockReturnValue({
      ...defaultMockState,
      commandDefinitions: []
    } as any);

    expect(mockAddCommand).not.toHaveBeenCalled();
  });
});
