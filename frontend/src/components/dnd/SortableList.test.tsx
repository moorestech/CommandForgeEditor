// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SortableList } from './SortableList';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useSensor,
  useSensors,
  Active,
  Over,
  SensorDescriptor,
  SensorOptions,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

// Mock @dnd-kit dependencies
vi.mock('@dnd-kit/core', () => ({
  DndContext: vi.fn((props: { children?: React.ReactNode; [key: string]: unknown }) => <div data-testid="dnd-context">{props.children}</div>),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: vi.fn((props: { children?: React.ReactNode; [key: string]: unknown }) => <div data-testid="sortable-context">{props.children}</div>),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
}));

describe('SortableList', () => {
  const mockOnReorder = vi.fn();
  const mockOnDragStart = vi.fn();
  const mockOnDragEnd = vi.fn();
  const mockSensors: SensorDescriptor<SensorOptions>[] = [];

  interface TestItem {
    id: number;
    name: string;
  }

  const testItems: TestItem[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSensors).mockReturnValue(mockSensors);
    vi.mocked(useSensor).mockReturnValue({} as SensorDescriptor<SensorOptions>);
  });

  it('should render children', () => {
    render(
      <SortableList
        items={testItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
      >
        <div>Test Children</div>
      </SortableList>
    );

    expect(screen.getByText('Test Children')).toBeInTheDocument();
  });

  it('should render DndContext and SortableContext', () => {
    render(
      <SortableList
        items={testItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
      >
        <div>Content</div>
      </SortableList>
    );

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    expect(screen.getByTestId('sortable-context')).toBeInTheDocument();
  });

  it('should set up sensors', () => {
    render(
      <SortableList
        items={testItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
      >
        <div>Content</div>
      </SortableList>
    );

    expect(useSensors).toHaveBeenCalled();
    expect(useSensor).toHaveBeenCalledTimes(2);
  });

  it('should pass item ids to SortableContext', () => {
    render(
      <SortableList
        items={testItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
      >
        <div>Content</div>
      </SortableList>
    );

    expect(SortableContext).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [1, 2, 3],
        strategy: expect.any(Function),
      }),
      expect.anything()
    );
  });

  it('should handle drag start event', () => {
    let capturedOnDragStart: ((event: DragStartEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragStart?: (event: DragStartEvent) => void; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragStart = typedProps.onDragStart;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <SortableList
        items={testItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
        onDragStart={mockOnDragStart}
      >
        <div>Content</div>
      </SortableList>
    );

    // Simulate drag start
    const mockActive: Active = {
      id: 2,
      data: { current: {} },
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
    expect(mockOnDragStart).toHaveBeenCalledWith(2);
  });

  it('should handle drag end event with reorder', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragStart?: (event: DragStartEvent) => void; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragEnd = typedProps.onDragEnd;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <SortableList
        items={testItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
        onDragEnd={mockOnDragEnd}
      >
        <div>Content</div>
      </SortableList>
    );

    // Simulate drag end
    const mockActive: Active = {
      id: 1,
      data: { current: {} },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockOver: Over = {
      id: 3,
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
    
    expect(mockOnReorder).toHaveBeenCalledWith(0, 2); // Index 0 to index 2
    expect(mockOnDragEnd).toHaveBeenCalled();
  });

  it('should not reorder when active and over ids are the same', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragStart?: (event: DragStartEvent) => void; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragEnd = typedProps.onDragEnd;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <SortableList
        items={testItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
      >
        <div>Content</div>
      </SortableList>
    );

    // Simulate drag end with same id
    const mockActive: Active = {
      id: 2,
      data: { current: {} },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockOver: Over = {
      id: 2,
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
    
    expect(mockOnReorder).not.toHaveBeenCalled();
  });

  it('should not reorder when over is null', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragStart?: (event: DragStartEvent) => void; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragEnd = typedProps.onDragEnd;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <SortableList
        items={testItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
      >
        <div>Content</div>
      </SortableList>
    );

    // Simulate drag end with null over
    const mockActive: Active = {
      id: 1,
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
    
    expect(mockOnReorder).not.toHaveBeenCalled();
  });

  it('should handle string ids', () => {
    const stringItems = [
      { id: 'a', value: 1 },
      { id: 'b', value: 2 },
      { id: 'c', value: 3 },
    ];

    render(
      <SortableList
        items={stringItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
      >
        <div>Content</div>
      </SortableList>
    );

    expect(SortableContext).toHaveBeenCalledWith(
      expect.objectContaining({
        items: ['a', 'b', 'c'],
      }),
      expect.anything()
    );
  });

  it('should handle drag when item not found', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragStart?: (event: DragStartEvent) => void; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragEnd = typedProps.onDragEnd;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <SortableList
        items={testItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
      >
        <div>Content</div>
      </SortableList>
    );

    // Simulate drag end with non-existent id
    const mockActive: Active = {
      id: 999,
      data: { current: {} },
      rect: {
        current: {
          initial: null,
          translated: null,
        }
      }
    };

    const mockOver: Over = {
      id: 1,
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
    
    expect(mockOnReorder).not.toHaveBeenCalled();
  });

  it('should work without onDragStart and onDragEnd callbacks', () => {
    let capturedOnDragStart: ((event: DragStartEvent) => void) | undefined;
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation((props: unknown) => {
      const typedProps = props as { children?: React.ReactNode; onDragStart?: (event: DragStartEvent) => void; onDragEnd?: (event: DragEndEvent) => void };
      capturedOnDragStart = typedProps.onDragStart;
      capturedOnDragEnd = typedProps.onDragEnd;
      return <div data-testid="dnd-context">{typedProps.children}</div>;
    });

    render(
      <SortableList
        items={testItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
      >
        <div>Content</div>
      </SortableList>
    );

    // Should not throw when callbacks are not provided
    expect(() => {
      const mockActiveStart: Active = {
        id: 1,
        data: { current: {} },
        rect: {
          current: {
            initial: null,
            translated: null,
          }
        }
      };
      
      const mockStartEvent: DragStartEvent = {
        active: mockActiveStart,
        activatorEvent: new MouseEvent('mousedown')
      };
      
      capturedOnDragStart!(mockStartEvent);
      
      const mockActiveEnd: Active = {
        id: 1,
        data: { current: {} },
        rect: {
          current: {
            initial: null,
            translated: null,
          }
        }
      };

      const mockOver: Over = {
        id: 2,
        disabled: false,
        data: { current: {} },
        rect: { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 }
      };

      const mockEndEvent: DragEndEvent = {
        active: mockActiveEnd,
        over: mockOver,
        activatorEvent: new MouseEvent('mousedown'),
        collisions: null,
        delta: { x: 0, y: 0 }
      };
      
      capturedOnDragEnd!(mockEndEvent);
    }).not.toThrow();
  });

  it('should pass collision detection to DndContext', () => {
    render(
      <SortableList
        items={testItems}
        getItemId={(item) => item.id}
        onReorder={mockOnReorder}
      >
        <div>Content</div>
      </SortableList>
    );

    expect(DndContext).toHaveBeenCalledWith(
      expect.objectContaining({
        collisionDetection: expect.any(Function),
      }),
      expect.anything()
    );
  });

  it('should handle empty items array', () => {
    render(
      <SortableList
        items={[]}
        getItemId={(item: never) => (item as { id: string | number }).id}
        onReorder={mockOnReorder}
      >
        <div>Empty List</div>
      </SortableList>
    );

    expect(screen.getByText('Empty List')).toBeInTheDocument();
    expect(SortableContext).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [],
      }),
      expect.anything()
    );
  });
});