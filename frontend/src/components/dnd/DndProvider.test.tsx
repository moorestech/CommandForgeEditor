// AI Generated Test Code
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndProvider } from './DndProvider';
import { useSkitStore } from '../../store/skitStore';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

// Mock dependencies
vi.mock('../../store/skitStore');
vi.mock('@dnd-kit/core', () => ({
  DndContext: vi.fn(({ children }) => <div data-testid="dnd-context">{children}</div>),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
}));

describe('DndProvider', () => {
  const mockAddCommand = vi.fn();
  const mockRemoveCommand = vi.fn();
  const mockDuplicateCommand = vi.fn();
  const mockSensors = { sensors: [] };
  const originalConsoleLog = console.log;

  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    
    vi.mocked(useSkitStore).mockReturnValue({
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      duplicateCommand: mockDuplicateCommand,
    } as any);
    
    vi.mocked(useSensors).mockReturnValue(mockSensors as any);
    vi.mocked(useSensor).mockReturnValue({} as any);
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  it('should render children', () => {
    render(
      <DndProvider>
        <div>Test Content</div>
      </DndProvider>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render DndContext', () => {
    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
  });

  it('should set up pointer sensor with activation constraint', () => {
    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    expect(useSensor).toHaveBeenCalledWith(
      expect.any(Function),
      {
        activationConstraint: {
          distance: 5,
        },
      }
    );
  });

  it('should handle drag start event', () => {
    let capturedOnDragStart: ((event: DragStartEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragStart, children }: any) => {
      capturedOnDragStart = onDragStart;
      return <div data-testid="dnd-context">{children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockEvent: DragStartEvent = {
      active: {
        id: 'test-id',
        data: {
          current: { type: 'command', commandType: 'text' }
        }
      }
    } as any;

    capturedOnDragStart!(mockEvent);
    expect(console.log).toHaveBeenCalledWith('Drag start:', 'test-id', { type: 'command', commandType: 'text' });
  });

  it('should handle drag over event', () => {
    let capturedOnDragOver: ((event: DragOverEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragOver, children }: any) => {
      capturedOnDragOver = onDragOver;
      return <div data-testid="dnd-context">{children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockEvent: DragOverEvent = {
      active: { id: 'active-id' },
      over: { id: 'over-id' }
    } as any;

    capturedOnDragOver!(mockEvent);
    expect(console.log).toHaveBeenCalledWith('Drag over:', 'active-id', 'over', 'over-id');
  });

  it('should not log when over is null in drag over', () => {
    let capturedOnDragOver: ((event: DragOverEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragOver, children }: any) => {
      capturedOnDragOver = onDragOver;
      return <div data-testid="dnd-context">{children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockEvent: DragOverEvent = {
      active: { id: 'active-id' },
      over: null
    } as any;

    capturedOnDragOver!(mockEvent);
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should add command when dragging command type to command list', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragEnd, children }: any) => {
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockEvent: DragEndEvent = {
      active: {
        id: 'command-text',
        data: {
          current: { type: 'command', commandType: 'text' }
        }
      },
      over: { id: 'command-list' }
    } as any;

    capturedOnDragEnd!(mockEvent);
    expect(mockAddCommand).toHaveBeenCalledWith({ type: 'text' });
  });

  it('should remove command when dragging to trash zone', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragEnd, children }: any) => {
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockEvent: DragEndEvent = {
      active: {
        id: 'command-item-123',
        data: { current: {} }
      },
      over: { id: 'trash-zone' }
    } as any;

    capturedOnDragEnd!(mockEvent);
    expect(mockRemoveCommand).toHaveBeenCalledWith(123);
  });

  it('should duplicate command when dragging to copy zone', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragEnd, children }: any) => {
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockEvent: DragEndEvent = {
      active: {
        id: 'command-item-456',
        data: { current: {} }
      },
      over: { id: 'copy-zone' }
    } as any;

    capturedOnDragEnd!(mockEvent);
    expect(mockDuplicateCommand).toHaveBeenCalledWith(456);
  });

  it('should not do anything when over is null in drag end', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragEnd, children }: any) => {
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockEvent: DragEndEvent = {
      active: {
        id: 'command-item-123',
        data: { current: {} }
      },
      over: null
    } as any;

    capturedOnDragEnd!(mockEvent);
    expect(mockAddCommand).not.toHaveBeenCalled();
    expect(mockRemoveCommand).not.toHaveBeenCalled();
    expect(mockDuplicateCommand).not.toHaveBeenCalled();
  });

  it('should handle drag end with unrecognized drop target', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragEnd, children }: any) => {
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockEvent: DragEndEvent = {
      active: {
        id: 'command-item-123',
        data: { current: {} }
      },
      over: { id: 'unknown-zone' }
    } as any;

    capturedOnDragEnd!(mockEvent);
    expect(mockAddCommand).not.toHaveBeenCalled();
    expect(mockRemoveCommand).not.toHaveBeenCalled();
    expect(mockDuplicateCommand).not.toHaveBeenCalled();
  });

  it('should pass all event handlers to DndContext', () => {
    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    expect(DndContext).toHaveBeenCalledWith(
      expect.objectContaining({
        sensors: mockSensors,
        onDragStart: expect.any(Function),
        onDragOver: expect.any(Function),
        onDragEnd: expect.any(Function),
      }),
      expect.anything()
    );
  });

  it('should handle command-item with complex id format', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragEnd, children }: any) => {
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    // Test with multi-digit id
    const mockEvent: DragEndEvent = {
      active: {
        id: 'command-item-999999',
        data: { current: {} }
      },
      over: { id: 'trash-zone' }
    } as any;

    capturedOnDragEnd!(mockEvent);
    expect(mockRemoveCommand).toHaveBeenCalledWith(999999);
  });
});