import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CommandList } from './CommandList';
import { useSkitStore } from '../../store/skitStore';
import React from 'react';

vi.mock('../../store/skitStore', () => ({
  useSkitStore: vi.fn(),
}));

vi.mock('../dnd/SortableList', () => ({
  SortableList: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-list">{children}</div>,
}));

vi.mock('../dnd/SortableItem', () => ({
  SortableItem: ({ children }: { children: React.ReactNode }) => <div data-testid="sortable-item">{children}</div>,
}));

vi.mock('../dnd/DropZone', () => ({
  DropZone: ({ children }: { children: React.ReactNode }) => <div data-testid="drop-zone">{children}</div>,
}));

describe('CommandList', () => {
  it('renders empty state when no skit is selected', () => {
    (useSkitStore as any).mockReturnValue({
      skits: {},
      currentSkitId: null,
      selectedCommandIds: [],
      selectCommand: vi.fn(),
      moveCommand: vi.fn(),
    });

    render(<CommandList />);
    expect(screen.getByText('スキットが選択されていません')).toBeInTheDocument();
  });

  it('renders commands when a skit is selected', () => {
    (useSkitStore as any).mockReturnValue({
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
              character: 'キャラA',
              body: 'こんにちは',
            },
          ],
        },
      },
      currentSkitId: 'test-skit',
      selectedCommandIds: [],
      selectCommand: vi.fn(),
      moveCommand: vi.fn(),
    });

    render(<CommandList />);
    expect(screen.getByText('text')).toBeInTheDocument();
    expect(screen.getByText('キャラA')).toBeInTheDocument();
  });
});
