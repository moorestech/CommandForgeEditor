// AI Generated Test Code
import { describe, it, expect } from 'vitest';
import { createCommandWithDefaults } from './commandDefaults';
import { CommandDefinition } from '../types';

describe('commandDefaults', () => {
  describe('createCommandWithDefaults', () => {
    it('should create command with basic properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {}
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result).toEqual({
        type: 'test',
        backgroundColor: '#ffffff'
      });
    });

    it('should use default background color if provided', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {},
        defaultBackgroundColor: '#ff0000'
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.backgroundColor).toBe('#ff0000');
    });

    it('should use property defaults when available', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          stringProp: {
            type: 'string',
            default: 'defaultValue'
          },
          numberProp: {
            type: 'number',
            default: 42
          },
          booleanProp: {
            type: 'boolean',
            default: true
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.stringProp).toBe('defaultValue');
      expect(result.numberProp).toBe(42);
      expect(result.booleanProp).toBe(true);
    });

    it('should generate defaults for required string properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredString: {
            type: 'string',
            required: true
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredString).toBe('');
    });

    it('should generate defaults for required number properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredNumber: {
            type: 'number',
            required: true
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredNumber).toBe(0);
    });

    it('should generate defaults for required boolean properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredBoolean: {
            type: 'boolean',
            required: true
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredBoolean).toBe(false);
    });

    it('should generate defaults for required enum properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredEnum: {
            type: 'enum',
            required: true,
            options: ['option1', 'option2', 'option3']
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredEnum).toBe('option1');
    });

    it('should handle enum with no options', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredEnum: {
            type: 'enum',
            required: true
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredEnum).toBe('');
    });

    it('should generate defaults for required asset properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredAsset: {
            type: 'asset',
            required: true
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredAsset).toBe('');
    });

    it('should generate defaults for required vector2 properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredVector2: {
            type: 'vector2',
            required: true
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredVector2).toEqual([0, 0]);
    });

    it('should generate defaults for required vector2Int properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredVector2Int: {
            type: 'vector2Int',
            required: true
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredVector2Int).toEqual([0, 0]);
    });

    it('should generate defaults for required vector3 properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredVector3: {
            type: 'vector3',
            required: true
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredVector3).toEqual([0, 0, 0]);
    });

    it('should generate defaults for required vector3Int properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredVector3Int: {
            type: 'vector3Int',
            required: true
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredVector3Int).toEqual([0, 0, 0]);
    });

    it('should generate defaults for required vector4 properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredVector4: {
            type: 'vector4',
            required: true
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredVector4).toEqual([0, 0, 0, 0]);
    });

    it('should not generate defaults for optional properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          optionalString: {
            type: 'string',
            required: false
          },
          optionalNumber: {
            type: 'number'
            // required not specified means false
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.optionalString).toBeUndefined();
      expect(result.optionalNumber).toBeUndefined();
    });

    it('should handle mixed required and optional properties', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          requiredString: {
            type: 'string',
            required: true
          },
          optionalString: {
            type: 'string',
            required: false
          },
          stringWithDefault: {
            type: 'string',
            default: 'default'
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.requiredString).toBe('');
      expect(result.optionalString).toBeUndefined();
      expect(result.stringWithDefault).toBe('default');
    });

    it('should prioritize explicit defaults over generated defaults', () => {
      const commandDef: CommandDefinition = {
        id: 'test',
        label: 'Test',
        description: 'Test command',
        commandListLabelFormat: 'Test',
        properties: {
          numberWithDefault: {
            type: 'number',
            required: true,
            default: 100
          }
        }
      };

      const result = createCommandWithDefaults(commandDef);
      
      expect(result.numberWithDefault).toBe(100);
    });
  });
});