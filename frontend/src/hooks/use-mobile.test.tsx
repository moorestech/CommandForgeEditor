// AI Generated Test Code
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  let mockMatchMedia: any;
  let listeners: Array<{ event: string; handler: Function }> = [];

  beforeEach(() => {
    listeners = [];
    
    mockMatchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((_event: string, handler: Function) => {
        listeners.push({ event: _event, handler });
      }),
      removeEventListener: vi.fn((_event: string, handler: Function) => {
        listeners = listeners.filter(l => l.event !== _event || l.handler !== handler);
      }),
    }));
    
    window.matchMedia = mockMatchMedia;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return false initially when window width is greater than mobile breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('should return true when window width is less than mobile breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 500,
      writable: true,
      configurable: true,
    });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should return true when window width equals mobile breakpoint minus 1', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 767,
      writable: true,
      configurable: true,
    });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(true);
  });

  it('should return false when window width equals mobile breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 768,
      writable: true,
      configurable: true,
    });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
  });

  it('should create media query with correct breakpoint', () => {
    renderHook(() => useIsMobile());
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('should add change event listener', () => {
    const mockAddEventListener = vi.fn();
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '',
      addEventListener: mockAddEventListener,
      removeEventListener: vi.fn(),
    });
    
    renderHook(() => useIsMobile());
    
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should remove event listener on unmount', () => {
    const mockRemoveEventListener = vi.fn();
    const mockAddEventListener = vi.fn();
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '',
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    });
    
    const { unmount } = renderHook(() => useIsMobile());
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update when window is resized', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
    
    const { result } = renderHook(() => useIsMobile());
    
    expect(result.current).toBe(false);
    
    // Simulate window resize
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        writable: true,
        configurable: true,
      });
      
      // Trigger the change event
      listeners.forEach(l => {
        if (l.event === 'change') {
          l.handler();
        }
      });
    });
    
    expect(result.current).toBe(true);
  });

  it('should handle multiple resize events', () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
    
    const { result } = renderHook(() => useIsMobile());
    
    // Start as desktop
    expect(result.current).toBe(false);
    
    // Resize to mobile
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        writable: true,
        configurable: true,
      });
      listeners.forEach(l => l.event === 'change' && l.handler());
    });
    
    expect(result.current).toBe(true);
    
    // Resize back to desktop
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        writable: true,
        configurable: true,
      });
      listeners.forEach(l => l.event === 'change' && l.handler());
    });
    
    expect(result.current).toBe(false);
  });

  it('should return false for undefined state initially', () => {
    // Mock useState to test the initial undefined state
    let state: boolean | undefined = undefined;
    vi.spyOn(React, 'useState').mockImplementation(() => [state, (newState: any) => { state = newState }]);
    
    const { result } = renderHook(() => useIsMobile());
    
    // The hook converts undefined to false with !!
    expect(result.current).toBe(false);
    
    vi.restoreAllMocks();
  });

  it('should handle edge case window widths', () => {
    // Test minimum width
    Object.defineProperty(window, 'innerWidth', {
      value: 0,
      writable: true,
      configurable: true,
    });
    
    const { result: result1 } = renderHook(() => useIsMobile());
    expect(result1.current).toBe(true);
    
    // Test very large width
    Object.defineProperty(window, 'innerWidth', {
      value: 9999,
      writable: true,
      configurable: true,
    });
    
    const { result: result2 } = renderHook(() => useIsMobile());
    expect(result2.current).toBe(false);
  });

  it('should maintain correct listener reference for cleanup', () => {
    const addedHandlers: Function[] = [];
    const removedHandlers: Function[] = [];
    
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '',
      addEventListener: vi.fn((_event: string, handler: Function) => {
        addedHandlers.push(handler);
      }),
      removeEventListener: vi.fn((_event: string, handler: Function) => {
        removedHandlers.push(handler);
      }),
    });
    
    const { unmount } = renderHook(() => useIsMobile());
    
    unmount();
    
    // The same handler that was added should be removed
    expect(addedHandlers.length).toBe(1);
    expect(removedHandlers.length).toBe(1);
    expect(addedHandlers[0]).toBe(removedHandlers[0]);
  });
});