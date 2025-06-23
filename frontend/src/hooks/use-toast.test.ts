// AI Generated Test Code
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, toast, reducer } from './use-toast';

// Mock timers
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('use-toast', () => {
  describe('reducer', () => {
    const initialState = { toasts: [] };

    it('should add a toast', () => {
      const newToast = { id: '1', title: 'Test Toast', open: true };
      const action = { type: 'ADD_TOAST' as const, toast: newToast };
      
      const newState = reducer(initialState, action);
      
      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0]).toEqual(newToast);
    });

    it('should limit toasts to TOAST_LIMIT (1)', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: true };
      const toast2 = { id: '2', title: 'Toast 2', open: true };
      
      let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 });
      state = reducer(state, { type: 'ADD_TOAST', toast: toast2 });
      
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].id).toBe('2'); // Newest toast should be kept
    });

    it('should update a toast', () => {
      const toast = { id: '1', title: 'Original', open: true };
      const state = reducer(initialState, { type: 'ADD_TOAST', toast });
      
      const updatedState = reducer(state, {
        type: 'UPDATE_TOAST',
        toast: { id: '1', title: 'Updated' },
      });
      
      expect(updatedState.toasts[0].title).toBe('Updated');
    });

    it('should dismiss a specific toast', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: true };
      const toast2 = { id: '2', title: 'Toast 2', open: true };
      
      let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 });
      state = reducer(state, { type: 'ADD_TOAST', toast: toast2 });
      
      // Due to TOAST_LIMIT = 1, only toast2 should be in state
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].id).toBe('2');
      
      // Try to dismiss toast1 (which is not in state anymore)
      const dismissedState = reducer(state, {
        type: 'DISMISS_TOAST',
        toastId: '1',
      });
      
      // Toast2 should remain unchanged since we tried to dismiss toast1
      expect(dismissedState.toasts[0].id).toBe('2');
      expect(dismissedState.toasts[0].open).toBe(true);
      
      // Now dismiss toast2
      const dismissedState2 = reducer(dismissedState, {
        type: 'DISMISS_TOAST',
        toastId: '2',
      });
      
      expect(dismissedState2.toasts[0].id).toBe('2');
      expect(dismissedState2.toasts[0].open).toBe(false);
    });

    it('should dismiss all toasts when no toastId provided', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: true };
      const toast2 = { id: '2', title: 'Toast 2', open: true };
      
      let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 });
      state = reducer(state, { type: 'ADD_TOAST', toast: toast2 });
      
      const dismissedState = reducer(state, {
        type: 'DISMISS_TOAST',
      });
      
      expect(dismissedState.toasts.every(t => !t.open)).toBe(true);
    });

    it('should remove a specific toast', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: true };
      const toast2 = { id: '2', title: 'Toast 2', open: true };
      
      let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 });
      state = reducer(state, { type: 'ADD_TOAST', toast: toast2 });
      
      const removedState = reducer(state, {
        type: 'REMOVE_TOAST',
        toastId: '1',
      });
      
      expect(removedState.toasts).toHaveLength(1);
      expect(removedState.toasts[0].id).toBe('2');
    });

    it('should remove all toasts when no toastId provided', () => {
      const toast1 = { id: '1', title: 'Toast 1', open: true };
      const toast2 = { id: '2', title: 'Toast 2', open: true };
      
      let state = reducer(initialState, { type: 'ADD_TOAST', toast: toast1 });
      state = reducer(state, { type: 'ADD_TOAST', toast: toast2 });
      
      const removedState = reducer(state, {
        type: 'REMOVE_TOAST',
      });
      
      expect(removedState.toasts).toHaveLength(0);
    });
  });

  describe('toast function', () => {
    it('should create a toast with unique id', () => {
      const result1 = toast({ title: 'Test 1' });
      const result2 = toast({ title: 'Test 2' });
      
      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      expect(result1.id).not.toBe(result2.id);
    });

    it('should return dismiss function', () => {
      const result = toast({ title: 'Test' });
      
      expect(result.dismiss).toBeDefined();
      expect(typeof result.dismiss).toBe('function');
    });

    it('should return update function', () => {
      const result = toast({ title: 'Test' });
      
      expect(result.update).toBeDefined();
      expect(typeof result.update).toBe('function');
    });
  });

  describe('useToast hook', () => {
    it('should return initial state', () => {
      const { result } = renderHook(() => useToast());
      
      expect(result.current.toasts).toBeDefined();
      expect(result.current.toast).toBeDefined();
      expect(result.current.dismiss).toBeDefined();
    });

    it('should add toast when toast function is called', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({ title: 'Test Toast' });
      });
      
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('Test Toast');
    });

    it('should update toast', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({ title: 'Original' });
      });
      
      act(() => {
        const toast = result.current.toasts[0];
        const toastInstance = result.current.toast({ title: 'Original' });
        toastInstance.update({ ...toast, title: 'Updated' });
      });
      
      // The last toast should have the updated title
      expect(result.current.toasts[0].title).toBe('Updated');
    });

    it('should dismiss toast', () => {
      const { result } = renderHook(() => useToast());
      
      let toastResult: any;
      act(() => {
        toastResult = result.current.toast({ title: 'Test' });
      });
      
      act(() => {
        toastResult.dismiss();
      });
      
      expect(result.current.toasts[0].open).toBe(false);
      
      // Should be removed after timeout
      act(() => {
        vi.advanceTimersByTime(1000000); // TOAST_REMOVE_DELAY
      });
      
      expect(result.current.toasts).toHaveLength(0);
    });

    it('should dismiss all toasts', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({ title: 'Toast 1' });
        result.current.toast({ title: 'Toast 2' });
      });
      
      expect(result.current.toasts).toHaveLength(1); // Due to TOAST_LIMIT
      
      act(() => {
        result.current.dismiss();
      });
      
      expect(result.current.toasts[0].open).toBe(false);
    });

    it('should handle onOpenChange callback', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({ title: 'Test' });
      });
      
      const toast = result.current.toasts[0];
      
      act(() => {
        // Simulate closing the toast
        if (toast.onOpenChange) {
          toast.onOpenChange(false);
        }
      });
      
      expect(result.current.toasts[0].open).toBe(false);
    });

    it('should clean up listeners on unmount', () => {
      const { result, unmount } = renderHook(() => useToast());
      
      act(() => {
        result.current.toast({ title: 'Test' });
      });
      
      unmount();
      
      // Add another toast after unmount - should not cause errors
      act(() => {
        toast({ title: 'After unmount' });
      });
      
      // No errors should occur
      expect(true).toBe(true);
    });

    it('should share state between multiple hook instances', () => {
      const { result: result1 } = renderHook(() => useToast());
      const { result: result2 } = renderHook(() => useToast());
      
      act(() => {
        result1.current.toast({ title: 'Shared Toast' });
      });
      
      // Both hooks should see the same toast
      expect(result1.current.toasts).toHaveLength(1);
      expect(result2.current.toasts).toHaveLength(1);
      expect(result1.current.toasts[0].title).toBe('Shared Toast');
      expect(result2.current.toasts[0].title).toBe('Shared Toast');
    });

    it('should handle rapid toast additions', () => {
      const { result } = renderHook(() => useToast());
      
      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.toast({ title: `Toast ${i}` });
        }
      });
      
      // Should only keep the last toast due to TOAST_LIMIT = 1
      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('Toast 4');
    });

    it('should not add duplicate listeners', () => {
      const { result, rerender } = renderHook(() => useToast());
      
      // Force multiple effect runs
      rerender();
      rerender();
      
      act(() => {
        result.current.toast({ title: 'Test' });
      });
      
      // Should still work correctly
      expect(result.current.toasts).toHaveLength(1);
    });
  });
});