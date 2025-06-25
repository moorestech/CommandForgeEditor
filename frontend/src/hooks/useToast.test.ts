// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast } from './useToast';
import { toast } from 'sonner';

// Mock sonner
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    error: vi.fn(),
  }),
}));

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return showToast function', () => {
    const { result } = renderHook(() => useToast());
    
    expect(result.current.showToast).toBeDefined();
    expect(typeof result.current.showToast).toBe('function');
  });

  it('should show default toast with message', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Test message');
    });
    
    expect(toast).toHaveBeenCalledWith('Test message', {
      duration: 3000,
    });
  });

  it('should show default toast when type is explicitly default', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Default message', 'default');
    });
    
    expect(toast).toHaveBeenCalledWith('Default message', {
      duration: 3000,
    });
  });

  it('should show error toast when type is error', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Error message', 'error');
    });
    
    expect(toast.error).toHaveBeenCalledWith('Error message', {
      duration: 5000,
    });
  });

  it('should not call regular toast when showing error', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Error message', 'error');
    });
    
    expect(toast).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('should maintain stable function reference', () => {
    const { result, rerender } = renderHook(() => useToast());
    
    const firstShowToast = result.current.showToast;
    
    rerender();
    
    const secondShowToast = result.current.showToast;
    
    expect(firstShowToast).toBe(secondShowToast);
  });

  it('should handle multiple toast calls', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('First message');
      result.current.showToast('Second message');
      result.current.showToast('Error message', 'error');
    });
    
    expect(toast).toHaveBeenCalledTimes(2);
    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('should use different durations for default and error toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('Default toast');
    });
    
    expect(toast).toHaveBeenCalledWith('Default toast', {
      duration: 3000,
    });
    
    act(() => {
      result.current.showToast('Error toast', 'error');
    });
    
    expect(toast.error).toHaveBeenCalledWith('Error toast', {
      duration: 5000,
    });
  });

  it('should handle empty string messages', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.showToast('');
    });
    
    expect(toast).toHaveBeenCalledWith('', {
      duration: 3000,
    });
  });

  it('should handle long messages', () => {
    const { result } = renderHook(() => useToast());
    const longMessage = 'This is a very long message '.repeat(10);
    
    act(() => {
      result.current.showToast(longMessage);
    });
    
    expect(toast).toHaveBeenCalledWith(longMessage, {
      duration: 3000,
    });
  });

  it('should handle special characters in messages', () => {
    const { result } = renderHook(() => useToast());
    const specialMessage = '特殊文字 & <symbols> "quotes" \'apostrophes\'';
    
    act(() => {
      result.current.showToast(specialMessage);
    });
    
    expect(toast).toHaveBeenCalledWith(specialMessage, {
      duration: 3000,
    });
  });

  it('should work when called in rapid succession', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.showToast(`Message ${i}`);
      }
    });
    
    expect(toast).toHaveBeenCalledTimes(10);
  });

  it('should handle unicode messages', () => {
    const { result } = renderHook(() => useToast());
    const unicodeMessage = '🎉 Success! 成功しました！ ✨';
    
    act(() => {
      result.current.showToast(unicodeMessage);
    });
    
    expect(toast).toHaveBeenCalledWith(unicodeMessage, {
      duration: 3000,
    });
  });
});