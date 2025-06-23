// AI Generated Test Code
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('lib/utils', () => {
  describe('cn function', () => {
    it('should handle single string class', () => {
      expect(cn('text-red-500')).toBe('text-red-500');
    });

    it('should handle multiple string classes', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle undefined values', () => {
      expect(cn('text-red-500', undefined, 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle null values', () => {
      expect(cn('text-red-500', null, 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle false values', () => {
      expect(cn('text-red-500', false, 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle empty strings', () => {
      expect(cn('text-red-500', '', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
    });

    it('should handle conditional classes with ternary operators', () => {
      const isActive = true;
      const isDisabled = false;
      expect(cn(
        'base-class',
        isActive ? 'active' : 'inactive',
        isDisabled ? 'disabled' : null
      )).toBe('base-class active');
    });

    it('should handle object syntax for conditional classes', () => {
      expect(cn({
        'text-red-500': true,
        'bg-blue-500': false,
        'font-bold': true,
      })).toBe('text-red-500 font-bold');
    });

    it('should handle arrays of classes', () => {
      expect(cn(['text-red-500', 'bg-blue-500'])).toBe('text-red-500 bg-blue-500');
    });

    it('should handle nested arrays', () => {
      expect(cn(['text-red-500', ['bg-blue-500', 'font-bold']])).toBe('text-red-500 bg-blue-500 font-bold');
    });

    it('should handle mixed input types', () => {
      expect(cn(
        'base',
        ['array-class'],
        { 'object-class': true },
        undefined,
        null,
        false,
        ''
      )).toBe('base array-class object-class');
    });

    it('should merge tailwind classes correctly', () => {
      // twMerge should handle conflicting Tailwind classes
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
      expect(cn('p-4', 'p-8')).toBe('p-8');
      expect(cn('mt-2', 'mt-4')).toBe('mt-4');
    });

    it('should preserve non-conflicting classes', () => {
      expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
      expect(cn('p-4', 'mt-2')).toBe('p-4 mt-2');
    });

    it('should handle responsive variants', () => {
      expect(cn('text-sm', 'md:text-lg')).toBe('text-sm md:text-lg');
      expect(cn('text-sm md:text-base', 'md:text-lg')).toBe('text-sm md:text-lg');
    });

    it('should handle hover and other state variants', () => {
      expect(cn('bg-blue-500', 'hover:bg-blue-600')).toBe('bg-blue-500 hover:bg-blue-600');
      expect(cn('hover:bg-blue-500', 'hover:bg-red-500')).toBe('hover:bg-red-500');
    });

    it('should handle arbitrary values', () => {
      expect(cn('text-[14px]', 'text-[16px]')).toBe('text-[16px]');
      expect(cn('bg-[#ff0000]', 'bg-[#00ff00]')).toBe('bg-[#00ff00]');
    });

    it('should handle important modifiers', () => {
      expect(cn('!text-red-500', '!text-blue-500')).toBe('!text-blue-500');
      // When a non-important class is followed by an important class, both are kept
      // This is the actual behavior of tailwind-merge
      expect(cn('text-red-500', '!text-blue-500')).toBe('text-red-500 !text-blue-500');
    });

    it('should handle negative values', () => {
      expect(cn('-mt-4', '-mt-8')).toBe('-mt-8');
      expect(cn('mt-4', '-mt-4')).toBe('-mt-4');
    });

    it('should handle multiple conflicting utilities', () => {
      expect(cn('p-4 px-8 py-2')).toBe('p-4 px-8 py-2');
      expect(cn('p-4', 'px-8', 'py-2')).toBe('p-4 px-8 py-2');
    });

    it('should return empty string for no valid inputs', () => {
      expect(cn()).toBe('');
      expect(cn(undefined, null, false, '')).toBe('');
    });

    it('should handle complex real-world scenarios', () => {
      const baseClasses = 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm';
      const hoverClasses = 'hover:border-gray-300 hover:shadow-md';
      const conditionalClasses = {
        'opacity-50 cursor-not-allowed': false,
        'cursor-pointer': true,
      };
      
      expect(cn(baseClasses, hoverClasses, conditionalClasses)).toBe(
        'rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300 hover:shadow-md cursor-pointer'
      );
    });

    it('should handle utility conflicts with different properties', () => {
      // Different spacing utilities should not conflict
      expect(cn('m-4', 'p-4')).toBe('m-4 p-4');
      
      // Different color utilities should not conflict
      expect(cn('text-red-500', 'bg-red-500')).toBe('text-red-500 bg-red-500');
      
      // Different border utilities should merge correctly
      expect(cn('border', 'border-red-500')).toBe('border border-red-500');
    });
  });
});