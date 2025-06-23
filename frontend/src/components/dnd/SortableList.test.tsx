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
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';

// Mock @dnd-kit dependencies
vi.mock('@dnd-kit/core', () => ({
  DndContext: vi.fn(({ children }) => <div data-testid="dnd-context">{children}</div>),
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: vi.fn(({ children }) => <div data-testid="sortable-context">{children}</div>),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
}));

describe('SortableList', () => {
  const mockOnReorder = vi.fn();
  const mockOnDragStart = vi.fn();
  const mockOnDragEnd = vi.fn();
  const mockSensors = { sensors: [] };

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
    vi.mocked(useSensors).mockReturnValue(mockSensors as any);
    vi.mocked(useSensor).mockReturnValue({} as any);
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
    
    vi.mocked(DndContext).mockImplementation(({ onDragStart, children }: any) => {
      capturedOnDragStart = onDragStart;
      return <div data-testid="dnd-context">{children}</div>;
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
    capturedOnDragStart!({ active: { id: 2 } } as DragStartEvent);
    expect(mockOnDragStart).toHaveBeenCalledWith(2);
  });

  it('should handle drag end event with reorder', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragEnd, children }: any) => {
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
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
    capturedOnDragEnd!({ 
      active: { id: 1 }, 
      over: { id: 3 } 
    } as DragEndEvent);
    
    expect(mockOnReorder).toHaveBeenCalledWith(0, 2); // Index 0 to index 2
    expect(mockOnDragEnd).toHaveBeenCalled();
  });

  it('should not reorder when active and over ids are the same', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragEnd, children }: any) => {
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
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
    capturedOnDragEnd!({ 
      active: { id: 2 }, 
      over: { id: 2 } 
    } as DragEndEvent);
    
    expect(mockOnReorder).not.toHaveBeenCalled();
  });

  it('should not reorder when over is null', () => {
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragEnd, children }: any) => {
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
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
    capturedOnDragEnd!({ 
      active: { id: 1 }, 
      over: null 
    } as DragEndEvent);
    
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
    
    vi.mocked(DndContext).mockImplementation(({ onDragEnd, children }: any) => {
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
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
    capturedOnDragEnd!({ 
      active: { id: 999 }, 
      over: { id: 1 } 
    } as DragEndEvent);
    
    expect(mockOnReorder).not.toHaveBeenCalled();
  });

  it('should work without onDragStart and onDragEnd callbacks', () => {
    let capturedOnDragStart: ((event: DragStartEvent) => void) | undefined;
    let capturedOnDragEnd: ((event: DragEndEvent) => void) | undefined;
    
    vi.mocked(DndContext).mockImplementation(({ onDragStart, onDragEnd, children }: any) => {
      capturedOnDragStart = onDragStart;
      capturedOnDragEnd = onDragEnd;
      return <div data-testid="dnd-context">{children}</div>;
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
      capturedOnDragStart!({ active: { id: 1 } } as DragStartEvent);
      capturedOnDragEnd!({ 
        active: { id: 1 }, 
        over: { id: 2 } 
      } as DragEndEvent);
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
        getItemId={(item: any) => item.id}
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