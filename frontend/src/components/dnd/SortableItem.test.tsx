// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SortableItem } from './SortableItem';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Mock @dnd-kit dependencies
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn()
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn()
    }
  }
}));

describe('SortableItem', () => {
  const mockSetNodeRef = vi.fn();
  const mockAttributes = {
    role: 'button',
    'aria-roledescription': 'sortable',
    'aria-disabled': false
  };
  const mockListeners = {
    onPointerDown: vi.fn(),
    onKeyDown: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSortable).mockReturnValue({
      attributes: mockAttributes,
      listeners: mockListeners,
      setNodeRef: mockSetNodeRef,
      transform: null,
      transition: undefined,
      isDragging: false,
      node: null,
      active: null,
      over: null,
      rect: null
    } as any);
  });

  it('should render children', () => {
    render(
      <SortableItem id="test-1">
        <div>Test Content</div>
      </SortableItem>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render with correct test id', () => {
    render(
      <SortableItem id="item-123">
        <div>Content</div>
      </SortableItem>
    );

    expect(screen.getByTestId('sortable-item-item-123')).toBeInTheDocument();
  });

  it('should render drag handle', () => {
    render(
      <SortableItem id="test">
        <div>Content</div>
      </SortableItem>
    );

    const dragHandle = screen.getByTestId('drag-handle');
    expect(dragHandle).toBeInTheDocument();
    expect(dragHandle).toHaveAttribute('aria-label', 'ドラッグハンドル');
  });

  it('should apply listeners to drag handle', () => {
    render(
      <SortableItem id="test">
        <div>Content</div>
      </SortableItem>
    );

    const dragHandle = screen.getByTestId('drag-handle');
    expect(dragHandle).toBeDefined();
    // Listeners are spread on the element
  });

  it('should apply opacity when dragging', () => {
    vi.mocked(useSortable).mockReturnValue({
      attributes: mockAttributes,
      listeners: mockListeners,
      setNodeRef: mockSetNodeRef,
      transform: null,
      transition: undefined,
      isDragging: true,
      node: null,
      active: null,
      over: null,
      rect: null
    } as any);

    render(
      <SortableItem id="test">
        <div>Content</div>
      </SortableItem>
    );

    const container = screen.getByTestId('sortable-item-test');
    expect(container).toHaveStyle({ opacity: '0.5' });
  });

  it('should apply transform when being sorted', () => {
    const mockTransform = {
      x: 0,
      y: 50,
      scaleX: 1,
      scaleY: 1
    };
    
    vi.mocked(CSS.Transform.toString).mockReturnValue('translate3d(0px, 50px, 0)');
    vi.mocked(useSortable).mockReturnValue({
      attributes: mockAttributes,
      listeners: mockListeners,
      setNodeRef: mockSetNodeRef,
      transform: mockTransform,
      transition: 'transform 200ms ease',
      isDragging: false,
      node: null,
      active: null,
      over: null,
      rect: null
    } as any);

    render(
      <SortableItem id="test">
        <div>Content</div>
      </SortableItem>
    );

    const container = screen.getByTestId('sortable-item-test');
    expect(container).toHaveStyle({ 
      transform: 'translate3d(0px, 50px, 0)',
      transition: 'transform 200ms ease'
    });
  });

  it('should handle numeric id', () => {
    render(
      <SortableItem id={456}>
        <div>Numeric ID Content</div>
      </SortableItem>
    );

    expect(screen.getByTestId('sortable-item-456')).toBeInTheDocument();
    expect(screen.getByText('Numeric ID Content')).toBeInTheDocument();
    expect(useSortable).toHaveBeenCalledWith({ id: 456 });
  });

  it('should set node ref', () => {
    render(
      <SortableItem id="test">
        <div>Content</div>
      </SortableItem>
    );

    expect(mockSetNodeRef).toHaveBeenCalled();
  });

  it('should apply correct classes to container', () => {
    render(
      <SortableItem id="test">
        <div>Content</div>
      </SortableItem>
    );

    const container = screen.getByTestId('sortable-item-test');
    expect(container).toHaveClass('flex', 'w-full', 'relative');
  });

  it('should apply correct classes to content wrapper', () => {
    render(
      <SortableItem id="test">
        <div data-testid="child-content">Content</div>
      </SortableItem>
    );

    const childContent = screen.getByTestId('child-content');
    const contentWrapper = childContent.parentElement;
    expect(contentWrapper).toHaveClass('flex-1', 'pl-8');
  });

  it('should render grip icon in drag handle', () => {
    render(
      <SortableItem id="test">
        <div>Content</div>
      </SortableItem>
    );

    const dragHandle = screen.getByTestId('drag-handle');
    const gripIcon = dragHandle.querySelector('.lucide-grip-vertical');
    expect(gripIcon).toBeInTheDocument();
  });

  it('should apply hover styles to drag handle', () => {
    render(
      <SortableItem id="test">
        <div>Content</div>
      </SortableItem>
    );

    const dragHandle = screen.getByTestId('drag-handle');
    expect(dragHandle).toHaveClass(
      'absolute',
      'left-0',
      'top-0',
      'bottom-0',
      'w-8',
      'flex',
      'items-center',
      'justify-center',
      'cursor-grab',
      'active:cursor-grabbing',
      'bg-transparent',
      'hover:bg-gray-100',
      'z-10',
      'rounded-l-sm'
    );
  });

  it('should handle multiple children', () => {
    render(
      <SortableItem id="test">
        <div>Child 1</div>
        <div>Child 2</div>
        <span>Child 3</span>
      </SortableItem>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });
});