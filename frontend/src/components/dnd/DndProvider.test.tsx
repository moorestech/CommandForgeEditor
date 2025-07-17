// AI Generated Test Code
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
  Active,
  Over,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core';

// Mock types for DndContext
type DndContextProps = {
  children?: React.ReactNode;
  sensors?: SensorDescriptor<SensorOptions>[];
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  collisionDetection?: (args: unknown) => unknown;
};

// Mock dependencies
vi.mock('../../store/skitStore');
vi.mock('@dnd-kit/core', () => ({
  DndContext: vi.fn((props: DndContextProps) => <div data-testid="dnd-context">{props.children}</div>),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
}));

describe('DndProvider', () => {
  const mockAddCommand = vi.fn();
  const mockRemoveCommand = vi.fn();
  const mockDuplicateCommand = vi.fn();
  const mockSensors: SensorDescriptor<SensorOptions>[] = [];
  const originalConsoleLog = console.log;

  beforeEach(() => {
    vi.clearAllMocks();
    console.log = vi.fn();
    
    vi.mocked(useSkitStore).mockReturnValue({
      addCommand: mockAddCommand,
      removeCommand: mockRemoveCommand,
      duplicateCommand: mockDuplicateCommand,
    } as unknown as ReturnType<typeof useSkitStore>);
    
    vi.mocked(useSensors).mockReturnValue(mockSensors);
    vi.mocked(useSensor).mockReturnValue({} as SensorDescriptor<SensorOptions>);
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
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragStart?: (event: DragStartEvent) => void };
      capturedOnDragStart = typedProps.onDragStart;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockActive: Active = {
      id: 'test-id',
      data: {
        current: { type: 'command', commandType: 'text' }
      },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockEvent: DragStartEvent = {
      active: mockActive,
      activatorEvent: new MouseEvent('mousedown')
    };

    capturedOnDragStart!(mockEvent);
    expect(console.log).toHaveBeenCalledWith('Drag start:', 'test-id', { type: 'command', commandType: 'text' });
  });

  it('should handle drag over event', () => {
    let capturedOnDragOver: ((event: DragOverEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragOver?: (event: DragOverEvent) => void };
      capturedOnDragOver = typedProps.onDragOver;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockActive: Active = {
      id: 'active-id',
      data: { current: {} },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockOver: Over = {
      id: 'over-id',
      disabled: false,
      data: { current: {} },
      rect: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
    };

    const mockEvent: DragOverEvent = {
      active: mockActive,
      over: mockOver,
      activatorEvent: new MouseEvent('mousedown'),
      collisions: null,
      delta: { x: 0, y: 0 }
    };

    capturedOnDragOver!(mockEvent);
    expect(console.log).toHaveBeenCalledWith('Drag over:', 'active-id', 'over', 'over-id');
  });

  it('should not log when over is null in drag over', () => {
    let capturedOnDragOver: ((event: DragOverEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragOver?: (event: DragOverEvent) => void };
      capturedOnDragOver = typedProps.onDragOver;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockActive: Active = {
      id: 'active-id',
      data: { current: {} },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockEvent: DragOverEvent = {
      active: mockActive,
      over: null,
      activatorEvent: new MouseEvent('mousedown'),
      collisions: null,
      delta: { x: 0, y: 0 }
    };

    capturedOnDragOver!(mockEvent);
    expect(console.log).not.toHaveBeenCalled();
  });

  it('should add command when dragging command type to command list', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragEnd = typedProps.onDragEnd;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockActive: Active = {
      id: 'command-text',
      data: {
        current: { type: 'command', commandType: 'text' }
      },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockOver: Over = {
      id: 'command-list',
      disabled: false,
      data: { current: {} },
      rect: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
    };

    const mockEvent: DragEndEvent = {
      active: mockActive,
      over: mockOver,
      activatorEvent: new MouseEvent('mousedown'),
      collisions: null,
      delta: { x: 0, y: 0 }
    };

    capturedOnDragEnd!(mockEvent);
    expect(mockAddCommand).toHaveBeenCalledWith({ type: 'text' });
  });

  it('should remove command when dragging to trash zone', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragEnd = typedProps.onDragEnd;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockActive: Active = {
      id: 'command-item-123',
      data: { current: {} },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockOver: Over = {
      id: 'trash-zone',
      disabled: false,
      data: { current: {} },
      rect: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
    };

    const mockEvent: DragEndEvent = {
      active: mockActive,
      over: mockOver,
      activatorEvent: new MouseEvent('mousedown'),
      collisions: null,
      delta: { x: 0, y: 0 }
    };

    capturedOnDragEnd!(mockEvent);
    expect(mockRemoveCommand).toHaveBeenCalledWith(123);
  });

  it('should duplicate command when dragging to copy zone', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragEnd = typedProps.onDragEnd;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockActive: Active = {
      id: 'command-item-456',
      data: { current: {} },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockOver: Over = {
      id: 'copy-zone',
      disabled: false,
      data: { current: {} },
      rect: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
    };

    const mockEvent: DragEndEvent = {
      active: mockActive,
      over: mockOver,
      activatorEvent: new MouseEvent('mousedown'),
      collisions: null,
      delta: { x: 0, y: 0 }
    };

    capturedOnDragEnd!(mockEvent);
    expect(mockDuplicateCommand).toHaveBeenCalledWith(456);
  });

  it('should not do anything when over is null in drag end', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragEnd = typedProps.onDragEnd;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockActive: Active = {
      id: 'command-item-123',
      data: { current: {} },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockEvent: DragEndEvent = {
      active: mockActive,
      over: null,
      activatorEvent: new MouseEvent('mousedown'),
      collisions: null,
      delta: { x: 0, y: 0 }
    };

    capturedOnDragEnd!(mockEvent);
    expect(mockAddCommand).not.toHaveBeenCalled();
    expect(mockRemoveCommand).not.toHaveBeenCalled();
    expect(mockDuplicateCommand).not.toHaveBeenCalled();
  });

  it('should handle drag end with unrecognized drop target', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragEnd = typedProps.onDragEnd;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    const mockActive: Active = {
      id: 'command-item-123',
      data: { current: {} },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockOver: Over = {
      id: 'unknown-zone',
      disabled: false,
      data: { current: {} },
      rect: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
    };

    const mockEvent: DragEndEvent = {
      active: mockActive,
      over: mockOver,
      activatorEvent: new MouseEvent('mousedown'),
      collisions: null,
      delta: { x: 0, y: 0 }
    };

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
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragEnd = typedProps.onDragEnd;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <DndProvider>
        <div>Content</div>
      </DndProvider>
    );

    // Test with multi-digit id
    const mockActive: Active = {
      id: 'command-item-999999',
      data: { current: {} },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockOver: Over = {
      id: 'trash-zone',
      disabled: false,
      data: { current: {} },
      rect: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
    };

    const mockEvent: DragEndEvent = {
      active: mockActive,
      over: mockOver,
      activatorEvent: new MouseEvent('mousedown'),
      collisions: null,
      delta: { x: 0, y: 0 }
    };

    capturedOnDragEnd!(mockEvent);
    expect(mockRemoveCommand).toHaveBeenCalledWith(999999);
  });
});