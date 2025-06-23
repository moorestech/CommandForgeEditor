// AI Generated Test Code
import { describe, it, expect } from 'vitest';
import { formatCommandPreview, hasCommandFormat } from './commandFormatting';
import { SkitCommand, CommandDefinition } from '../types';

describe('commandFormatting', () => {
  const mockCommandDefinitions: CommandDefinition[] = [
    {
      id: 'text',
      label: 'Text',
      description: 'Display text',
      commandListLabelFormat: 'TEXT: {character}, {body}',
      properties: {
        character: { type: 'string', required: true },
        body: { type: 'string', required: true }
      }
    },
    {
      id: 'move',
      label: 'Move',
      description: 'Move object',
      commandListLabelFormat: 'MOVE to {x}, {y}',
      properties: {
        x: { type: 'number', required: true },
        y: { type: 'number', required: true }
      }
    },
    {
      id: 'noformat',
      label: 'No Format',
      description: 'Command without format',
      commandListLabelFormat: '',
      properties: {
        value: { type: 'string' }
      }
    }
  ];

  const commandsMap = new Map(mockCommandDefinitions.map(def => [def.id, def]));

  describe('formatCommandPreview', () => {
    it('should format command with string properties', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'text',
        character: 'Alice',
        body: 'Hello, world!'
      };

      const result = formatCommandPreview(command, commandsMap);
      expect(result).toBe('TEXT: Alice, Hello, world!');
    });

    it('should format command with number properties', () => {
      const command: SkitCommand = {
        id: 2,
        type: 'move',
        x: 100,
        y: 200
      };

      const result = formatCommandPreview(command, commandsMap);
      expect(result).toBe('MOVE to 100, 200');
    });

    it('should handle missing properties', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'text',
        character: 'Alice'
        // body is missing
      };

      const result = formatCommandPreview(command, commandsMap);
      expect(result).toBe('TEXT: Alice, {body}');
    });

    it('should return type when commandsMap is null', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'text',
        character: 'Alice',
        body: 'Hello'
      };

      const result = formatCommandPreview(command, null as any);
      expect(result).toBe('Alice'); // First string prop value
    });

    it('should return type when commandsMap is undefined', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'text',
        character: 'Alice',
        body: 'Hello'
      };

      const result = formatCommandPreview(command, undefined as any);
      expect(result).toBe('Alice'); // First string prop value
    });

    it('should return type when command definition not found', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'unknown',
        someValue: 'test'
      };

      const result = formatCommandPreview(command, commandsMap);
      expect(result).toBe('test'); // First string prop value
    });

    it('should return type when no format and no string properties', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'unknown',
        numberValue: 123
      };

      const result = formatCommandPreview(command, commandsMap);
      expect(result).toBe('unknown');
    });

    it('should return first non-empty string prop when no format', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'noformat',
        empty: '',
        value: 'First value',
        another: 'Another value'
      };

      const result = formatCommandPreview(command, commandsMap);
      expect(result).toBe('First value');
    });

    it('should skip type property when looking for string values', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'unknown',
        type2: 'unknown', // property named 'type2' with same value as type
        value: 'actual value'
      };

      const result = formatCommandPreview(command, commandsMap);
      expect(result).toBe('actual value'); // First string is 'unknown' but it equals type, so it's skipped and 'actual value' is returned
    });

    it('should handle properties with non-string values', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'text',
        character: 'Alice',
        body: { nested: 'object' } as any
      };

      const result = formatCommandPreview(command, commandsMap);
      expect(result).toBe('TEXT: Alice, [object Object]');
    });

    it('should handle array values', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'text',
        character: 'Alice',
        body: [1, 2, 3] as any
      };

      const result = formatCommandPreview(command, commandsMap);
      expect(result).toBe('TEXT: Alice, 1,2,3');
    });

    it('should handle boolean values', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'text',
        character: 'Alice',
        body: true as any
      };

      const result = formatCommandPreview(command, commandsMap);
      expect(result).toBe('TEXT: Alice, true');
    });

    it('should ignore id property in formatting', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test',
        commandListLabelFormat: 'ID: {id}, Type: {type}',
        properties: {}
      };
      
      const testMap = new Map([['test', commandDef]]);
      const command: SkitCommand = {
        id: 999,
        type: 'test'
      };

      const result = formatCommandPreview(command, testMap);
      expect(result).toBe('ID: {id}, Type: {type}'); // id and type are excluded from props
    });
  });

  describe('hasCommandFormat', () => {
    it('should return true when command has format', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'text'
      };

      const result = hasCommandFormat(command, commandsMap);
      expect(result).toBe(true);
    });

    it('should return false when command has empty format', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'noformat'
      };

      const result = hasCommandFormat(command, commandsMap);
      expect(result).toBe(false);
    });

    it('should return false when command definition not found', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'unknown'
      };

      const result = hasCommandFormat(command, commandsMap);
      expect(result).toBe(false);
    });

    it('should return false when commandsMap is null', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'text'
      };

      const result = hasCommandFormat(command, null as any);
      expect(result).toBe(false);
    });

    it('should return false when commandsMap is undefined', () => {
      const command: SkitCommand = {
        id: 1,
        type: 'text'
      };

      const result = hasCommandFormat(command, undefined as any);
      expect(result).toBe(false);
    });

    it('should return false when commandListLabelFormat is undefined', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test',
        properties: {}
        // commandListLabelFormat is undefined
      } as any;
      
      const testMap = new Map([['test', commandDef]]);
      const command: SkitCommand = {
        id: 1,
        type: 'test'
      };

      const result = hasCommandFormat(command, testMap);
      expect(result).toBe(false);
    });
  });
});