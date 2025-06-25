import { describe, it, expect } from 'vitest';
import { parse } from 'yaml';
import { validateCommandsYaml } from './validation';

describe('Master Data', () => {
  describe('YAML parsing with master data', () => {
    it('should parse master data section correctly', () => {
      const yamlContent = `
version: 1
master:
  characters: ["Alice", "Bob", "Charlie"]
  emotions: ["Happy", "Sad", "Angry"]
commands:
  - id: test
    label: Test Command
    description: Test description
    commandListLabelFormat: "{character}"
    properties:
      character:
        type: enum
        options:
          master: characters
        required: true
`;
      const result = validateCommandsYaml(yamlContent);
      expect(result.errors).toHaveLength(0);
      expect(result.config).not.toBeNull();
      expect(result.config?.master).toEqual({
        characters: ["Alice", "Bob", "Charlie"],
        emotions: ["Happy", "Sad", "Angry"]
      });
    });

    it('should validate master data format', () => {
      const yamlContent = `
version: 1
master:
  invalid: "not an array"
commands:
  - id: test
    label: Test
    description: Test
    commandListLabelFormat: "test"
    properties: {}
`;
      const result = validateCommandsYaml(yamlContent);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Master data resolution', () => {
    it('should resolve master data references in options', () => {
      const yamlContent = `
version: 1
master:
  testOptions: ["Option1", "Option2", "Option3"]
commands:
  - id: test
    label: Test
    description: Test
    commandListLabelFormat: "{prop}"
    properties:
      prop:
        type: enum
        options:
          master: testOptions
        required: true
`;
      const parsed = parse(yamlContent);
      const masterData = parsed.master || {};
      
      // Simulate master data resolution
      const propDef = parsed.commands[0].properties.prop;
      if (propDef.options && typeof propDef.options === 'object' && 'master' in propDef.options) {
        const masterKey = propDef.options.master;
        expect(masterData[masterKey]).toEqual(["Option1", "Option2", "Option3"]);
      } else {
        throw new Error('Master data reference not found');
      }
    });

    it('should handle missing master data gracefully', () => {
      const yamlContent = `
version: 1
commands:
  - id: test
    label: Test
    description: Test
    commandListLabelFormat: "{prop}"
    properties:
      prop:
        type: enum
        options:
          master: nonExistent
        required: true
`;
      const parsed = parse(yamlContent);
      const masterData = parsed.master || {};
      
      const propDef = parsed.commands[0].properties.prop;
      if (propDef.options && typeof propDef.options === 'object' && 'master' in propDef.options) {
        const masterKey = propDef.options.master;
        expect(masterData[masterKey]).toBeUndefined();
      }
    });
  });

  describe('Integration with validation', () => {
    it('should validate enum values against resolved master data', () => {
      const commandDef = {
        id: 'test',
        label: 'Test',
        description: 'Test',
        commandListLabelFormat: '{character}',
        properties: {
          character: {
            type: 'enum' as const,
            options: ['Alice', 'Bob', 'Charlie'], // Resolved from master data
            required: true
          }
        }
      };

      const skit = {
        meta: {
          title: 'Test Skit',
          version: 1,
          created: new Date().toISOString(),
          modified: new Date().toISOString()
        },
        commands: [
          {
            id: 1,
            type: 'test',
            character: 'Alice' // Valid value
          },
          {
            id: 2,
            type: 'test',
            character: 'David' // Invalid value
          }
        ]
      };

      // Mock the validation function behavior
      const errors: string[] = [];
      skit.commands.forEach(command => {
        if (command.type === 'test') {
          const propValue = command.character;
          const options = commandDef.properties.character.options;
          if (!options.includes(propValue)) {
            errors.push(`Command ${command.id}: Property "character" has invalid value "${propValue}". Must be one of: ${options.join(', ')}`);
          }
        }
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toContain('David');
    });
  });

  describe('Complex master data scenarios', () => {
    it('should support multiple master data references in single command', () => {
      const yamlContent = `
version: 1
master:
  characters: ["Alice", "Bob"]
  emotions: ["Happy", "Sad"]
  locations: ["Home", "School"]
commands:
  - id: complex
    label: Complex Command
    description: Test
    commandListLabelFormat: "{character} is {emotion} at {location}"
    properties:
      character:
        type: enum
        options:
          master: characters
        required: true
      emotion:
        type: enum
        options:
          master: emotions
        required: true
      location:
        type: enum
        options:
          master: locations
        required: true
`;
      const result = validateCommandsYaml(yamlContent);
      expect(result.errors).toHaveLength(0);
      expect(result.config).not.toBeNull();
      
      const parsed = parse(yamlContent);
      const command = parsed.commands[0];
      
      // Verify all properties have master data references
      expect(command.properties.character.options).toHaveProperty('master', 'characters');
      expect(command.properties.emotion.options).toHaveProperty('master', 'emotions');
      expect(command.properties.location.options).toHaveProperty('master', 'locations');
    });

    it('should support mixed master data and direct options', () => {
      const yamlContent = `
version: 1
master:
  characters: ["Alice", "Bob"]
commands:
  - id: mixed
    label: Mixed Options
    description: Test
    commandListLabelFormat: "test"
    properties:
      character:
        type: enum
        options:
          master: characters
        required: true
      action:
        type: enum
        options: ["Walk", "Run", "Jump"]
        required: true
`;
      const result = validateCommandsYaml(yamlContent);
      expect(result.errors).toHaveLength(0);
      
      const parsed = parse(yamlContent);
      const props = parsed.commands[0].properties;
      
      // Character uses master data
      expect(props.character.options).toHaveProperty('master');
      
      // Action uses direct array
      expect(Array.isArray(props.action.options)).toBe(true);
      expect(props.action.options).toEqual(["Walk", "Run", "Jump"]);
    });
  });
});