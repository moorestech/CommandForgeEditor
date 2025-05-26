import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { useSkitStore } from '../../store/skitStore';

vi.mock('../../store/skitStore', () => ({
  useSkitStore: vi.fn(),
}));

vi.mock('../dnd/DraggableCommand', () => ({
  DraggableCommand: ({ children }: { children: React.ReactNode }) => <div data-testid="draggable-command">{children}</div>,
}));

vi.mock('../dnd/DropZone', () => ({
  DropZone: ({ children }: { children: React.ReactNode }) => <div data-testid="drop-zone">{children}</div>,
}));

describe('Toolbar', () => {
  it('renders disabled buttons when no skit is selected', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      currentSkitId: null,
      selectedCommandIds: [],
      addCommand: vi.fn(),
      removeCommand: vi.fn(),
      duplicateCommand: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      saveSkit: vi.fn(),
      commandDefinitions: [],
      commandsMap: new Map(),
    });

    render(<Toolbar />);
    
    const addButton = screen.getByText('追加').closest('button');
    expect(addButton).toBeDisabled();
    
    const saveButton = screen.getByText('保存').closest('button');
    expect(saveButton).toBeDisabled();
  });

  it('renders enabled buttons when a skit is selected', () => {
    const testCommands = [
      {
        id: "text",
        label: "テキスト",
        description: "台詞を表示",
        commandListLabelFormat: "TEXT: {character}, {body}",
        properties: {
          character: {
            type: "enum",
            options: ["キャラA", "キャラB"],
            required: true
          },
          body: {
            type: "string",
            multiline: true,
            required: true
          }
        }
      }
    ];
    
    const commandsMap = new Map();
    commandsMap.set("text", testCommands[0]);
    
    vi.mocked(useSkitStore).mockReturnValue({
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      addCommand: vi.fn(),
      removeCommand: vi.fn(),
      duplicateCommand: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      saveSkit: vi.fn(),
      commandDefinitions: testCommands,
      commandsMap: commandsMap,
    });

    render(<Toolbar />);
    
    const addButton = screen.getByText('追加').closest('button');
    expect(addButton).not.toBeDisabled();
    
    const saveButton = screen.getByText('保存').closest('button');
    expect(saveButton).not.toBeDisabled();
  });
});
