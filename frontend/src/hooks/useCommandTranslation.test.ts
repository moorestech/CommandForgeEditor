// AI Generated Test Code
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCommandTranslation } from './useCommandTranslation';
import { useTranslation } from 'react-i18next';
import { getTranslationWithFallback } from '../i18n/translationLoader';

// Mock dependencies
vi.mock('react-i18next');
vi.mock('../i18n/translationLoader');

describe('useCommandTranslation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useTranslation
    vi.mocked(useTranslation).mockReturnValue([
      vi.fn() as any,
      {} as any,
      true,
    ] as any);
    
    // Mock getTranslationWithFallback
    vi.mocked(getTranslationWithFallback).mockImplementation((key, _fallback) => {
      return `translated:${key}`;
    });
  });

  it('should call useTranslation to ensure context is available', () => {
    renderHook(() => useCommandTranslation('test-command'));
    
    expect(useTranslation).toHaveBeenCalled();
  });

  it('should return tCommand function', () => {
    const { result } = renderHook(() => useCommandTranslation('test-command'));
    
    expect(result.current.tCommand).toBeDefined();
    expect(typeof result.current.tCommand).toBe('function');
  });

  it('should return tProperty function', () => {
    const { result } = renderHook(() => useCommandTranslation('test-command'));
    
    expect(result.current.tProperty).toBeDefined();
    expect(typeof result.current.tProperty).toBe('function');
  });

  it('should return tEnum function', () => {
    const { result } = renderHook(() => useCommandTranslation('test-command'));
    
    expect(result.current.tEnum).toBeDefined();
    expect(typeof result.current.tEnum).toBe('function');
  });

  it('should call getTranslationWithFallback with correct key for tCommand', () => {
    const { result } = renderHook(() => useCommandTranslation('test-command'));
    
    const translation = result.current.tCommand('name', 'Default Name');
    
    expect(getTranslationWithFallback).toHaveBeenCalledWith(
      'command.test-command.name',
      'Default Name'
    );
    expect(translation).toBe('translated:command.test-command.name');
  });

  it('should call getTranslationWithFallback with correct key for tProperty', () => {
    const { result } = renderHook(() => useCommandTranslation('dialog-command'));
    
    const translation = result.current.tProperty('message', 'name', 'Message');
    
    expect(getTranslationWithFallback).toHaveBeenCalledWith(
      'command.dialog-command.property.message.name',
      'Message'
    );
    expect(translation).toBe('translated:command.dialog-command.property.message.name');
  });

  it('should call getTranslationWithFallback with correct key for tEnum', () => {
    const { result } = renderHook(() => useCommandTranslation('choice-command'));
    
    const translation = result.current.tEnum('type', 'option1', 'Option 1');
    
    expect(getTranslationWithFallback).toHaveBeenCalledWith(
      'command.choice-command.property.type.enum.option1',
      'Option 1'
    );
    expect(translation).toBe('translated:command.choice-command.property.type.enum.option1');
  });

  it('should use enum value as default fallback for tEnum', () => {
    const { result } = renderHook(() => useCommandTranslation('choice-command'));
    
    result.current.tEnum('type', 'option2');
    
    expect(getTranslationWithFallback).toHaveBeenCalledWith(
      'command.choice-command.property.type.enum.option2',
      'option2'
    );
  });

  it('should handle missing fallback for tCommand', () => {
    const { result } = renderHook(() => useCommandTranslation('test-command'));
    
    result.current.tCommand('description');
    
    expect(getTranslationWithFallback).toHaveBeenCalledWith(
      'command.test-command.description',
      undefined
    );
  });

  it('should handle missing fallback for tProperty', () => {
    const { result } = renderHook(() => useCommandTranslation('test-command'));
    
    result.current.tProperty('prop1', 'tooltip');
    
    expect(getTranslationWithFallback).toHaveBeenCalledWith(
      'command.test-command.property.prop1.tooltip',
      undefined
    );
  });

  it('should work with different command IDs', () => {
    const { result: result1 } = renderHook(() => useCommandTranslation('command1'));
    const { result: result2 } = renderHook(() => useCommandTranslation('command2'));
    
    result1.current.tCommand('name');
    result2.current.tCommand('name');
    
    expect(getTranslationWithFallback).toHaveBeenCalledWith(
      'command.command1.name',
      undefined
    );
    expect(getTranslationWithFallback).toHaveBeenCalledWith(
      'command.command2.name',
      undefined
    );
  });

  it('should handle complex property keys', () => {
    const { result } = renderHook(() => useCommandTranslation('complex-command'));
    
    result.current.tProperty('nested.property.key', 'description', 'Nested Property');
    
    expect(getTranslationWithFallback).toHaveBeenCalledWith(
      'command.complex-command.property.nested.property.key.description',
      'Nested Property'
    );
  });

  it('should handle special characters in enum values', () => {
    const { result } = renderHook(() => useCommandTranslation('special-command'));
    
    result.current.tEnum('type', 'value-with-dash', 'Value With Dash');
    
    expect(getTranslationWithFallback).toHaveBeenCalledWith(
      'command.special-command.property.type.enum.value-with-dash',
      'Value With Dash'
    );
  });

  it('should maintain consistent behavior when rerendered', () => {
    const { result, rerender } = renderHook(() => useCommandTranslation('test-command'));
    
    const firstCall = result.current.tCommand('name', 'Test');
    
    rerender();
    
    const secondCall = result.current.tCommand('name', 'Test');
    
    expect(firstCall).toBe(secondCall);
    expect(getTranslationWithFallback).toHaveBeenCalledTimes(2);
  });
});