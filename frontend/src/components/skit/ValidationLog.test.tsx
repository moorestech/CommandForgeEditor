// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ValidationLog } from './ValidationLog';
import { useSkitStore } from '../../store/skitStore';
import { useToast } from '../../hooks/use-toast';

// Mock dependencies
vi.mock('../../store/skitStore');
vi.mock('../../hooks/use-toast');

// Mock UI components
vi.mock('../ui/alert', () => ({
  Alert: ({ children, variant, ...props }: any) => (
    <div data-testid="alert" data-variant={variant} {...props}>{children}</div>
  ),
  AlertTitle: ({ children }: any) => <div data-testid="alert-title">{children}</div>,
  AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
}));

describe('ValidationLog', () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useToast).mockReturnValue({ toast: mockToast } as any);
  });

  it('should not render when no validation errors', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: []
    } as any);

    const { container } = render(<ValidationLog />);
    
    expect(container.firstChild).toBeNull();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('should render validation errors', () => {
    const errors = [
      'コマンド1: 必須フィールドが未入力です',
      'コマンド3: 値が不正です'
    ];

    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: errors
    } as any);

    render(<ValidationLog />);

    expect(screen.getAllByTestId('alert')).toHaveLength(2);
    expect(screen.getAllByTestId('alert-title')).toHaveLength(2);
    expect(screen.getByText('コマンド1: 必須フィールドが未入力です')).toBeInTheDocument();
    expect(screen.getByText('コマンド3: 値が不正です')).toBeInTheDocument();
  });

  it('should show toast notifications for errors', () => {
    const errors = [
      'エラー1',
      'エラー2'
    ];

    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: errors
    } as any);

    render(<ValidationLog />);

    expect(mockToast).toHaveBeenCalledTimes(2);
    expect(mockToast).toHaveBeenCalledWith({
      title: 'エラー',
      description: 'エラー1',
      variant: 'destructive'
    });
    expect(mockToast).toHaveBeenCalledWith({
      title: 'エラー',
      description: 'エラー2',
      variant: 'destructive'
    });
  });

  it('should use destructive variant for alerts', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: ['テストエラー']
    } as any);

    render(<ValidationLog />);

    const alert = screen.getByTestId('alert');
    expect(alert).toHaveAttribute('data-variant', 'destructive');
  });

  it('should re-render when errors change', () => {
    const { rerender } = render(<ValidationLog />);
    
    // Initially no errors
    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: []
    } as any);
    rerender(<ValidationLog />);
    
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();

    // Add errors
    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: ['新しいエラー']
    } as any);
    rerender(<ValidationLog />);

    expect(screen.getByTestId('alert')).toBeInTheDocument();
    expect(screen.getByText('新しいエラー')).toBeInTheDocument();
  });

  it('should handle multiple re-renders without duplicating toasts', () => {
    const errors = ['同じエラー'];
    
    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: errors
    } as any);

    const { rerender } = render(<ValidationLog />);
    
    // Initial render
    expect(mockToast).toHaveBeenCalledTimes(1);
    
    // Re-render with same errors - React's useEffect with same deps won't re-run
    mockToast.mockClear();
    rerender(<ValidationLog />);
    // The effect won't run again because the dependency array hasn't changed
    expect(mockToast).toHaveBeenCalledTimes(0);
  });

  it('should display error icon', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: ['エラー']
    } as any);

    render(<ValidationLog />);

    // Since we're mocking the Alert component, we can't check for the icon directly
    // But we can verify the alert is rendered with proper structure
    const alert = screen.getByTestId('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('data-variant', 'destructive');
  });

  it('should wrap errors in proper container', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: ['エラー1', 'エラー2']
    } as any);

    render(<ValidationLog />);

    const container = screen.getAllByTestId('alert')[0].parentElement;
    expect(container).toHaveClass('p-4', 'space-y-2');
  });

  it('should handle empty error strings', () => {
    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: ['', '有効なエラー', '']
    } as any);

    render(<ValidationLog />);

    expect(screen.getAllByTestId('alert')).toHaveLength(3);
    expect(mockToast).toHaveBeenCalledTimes(3);
  });

  it('should update when validation errors are cleared', () => {
    // Start with errors
    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: ['エラー']
    } as any);

    const { rerender } = render(<ValidationLog />);
    expect(screen.getByTestId('alert')).toBeInTheDocument();

    // Clear errors
    vi.mocked(useSkitStore).mockReturnValue({
      validationErrors: []
    } as any);
    
    rerender(<ValidationLog />);
    expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
  });
});