import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse } from 'yaml';
import { CommandsConfig, Skit, PropertyDefinition } from '../types';

const ajv = new Ajv();
addFormats(ajv);

const skitSchema = {
  type: 'object',
  required: ['meta', 'commands'],
  properties: {
    meta: {
      type: 'object',
      required: ['title', 'version', 'created', 'modified'],
      properties: {
        title: { type: 'string' },
        version: { type: 'number' },
        created: { type: 'string', format: 'date-time' },
        modified: { type: 'string', format: 'date-time' }
      }
    },
    commands: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'type'],
        properties: {
          id: { type: 'number' },
          type: { type: 'string' }
        }
      }
    }
  }
};

const commandsConfigSchema = {
  type: 'object',
  required: ['version', 'commands'],
  properties: {
    version: { type: 'number' },
    master: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: { type: 'string' }
      }
    },
    commands: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'label', 'description', 'commandListLabelFormat', 'properties'],
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          description: { type: 'string' },
          commandListLabelFormat: { type: 'string' },
          properties: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              properties: {
                type: { 
                  type: 'string',
                  enum: [
                    'string',
                    'number',
                    'boolean',
                    'enum',
                    'asset',
                    'command',
                    'vector2',
                    'vector3',
                    'vector4',
                    'vector2Int',
                    'vector3Int'
                  ]
                },
                required: { type: 'boolean' },
                default: { },
                multiline: { type: 'boolean' },
                options: { 
                  oneOf: [
                    {
                      type: 'array',
                      items: { type: 'string' }
                    },
                    {
                      type: 'object',
                      required: ['master'],
                      properties: {
                        master: { type: 'string' }
                      }
                    }
                  ]
                },
                optionsFrom: { type: 'string' },
                commandTypes: { 
                  type: 'array',
                  items: { type: 'string' }
                },
                constraints: {
                  type: 'object',
                  properties: {
                    min: { type: 'number' },
                    max: { type: 'number' },
                    pattern: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

const validateSkit = ajv.compile(skitSchema);
const validateCommandsConfig = ajv.compile(commandsConfigSchema);

/**
 * Validates a skit against the JSON schema
 * @param skit The skit to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateSkitData(skit: Skit): string[] {
  const valid = validateSkit(skit);
  
  if (valid) {
    return [];
  }
  
  return (validateSkit.errors || []).map(error => 
    `${error.instancePath} ${error.message}`
  );
}

/**
 * Validates command properties based on command type
 * @param skit The skit to validate
 * @param commandsConfig The commands configuration
 * @returns Array of validation errors, empty if valid
 */
export function validateCommandProperties(
  skit: Skit,
  commandsConfig?: CommandsConfig
): string[] {
  const errors: string[] = [];

  if (!commandsConfig) {
    return errors;
  }

  skit.commands.forEach(command => {
    const commandDef = commandsConfig.commands.find(def => def.id === command.type);

    if (!commandDef) {
      errors.push(`Command ${command.id}: Definition not found`);
    } else {
      if (commandDef.properties) {
        Object.entries(commandDef.properties).forEach(([propName, propDef]: [string, PropertyDefinition]) => {
          const propValue = command[propName];
          
          // Check required properties
          if (propDef.required && (propValue === undefined || propValue === '')) {
            errors.push(`Command ${command.id}: Required property "${propName}" is missing`);
          }
          
          // Validate enum values
          if (propDef.type === 'enum' && propValue !== undefined && propValue !== '') {
            const options = Array.isArray(propDef.options) ? propDef.options : [];
            if (options.length > 0 && !options.includes(propValue as string)) {
              errors.push(`Command ${command.id}: Property "${propName}" has invalid value "${propValue}". Must be one of: ${options.join(', ')}`);
            }
          }
          
          // Validate number constraints
          if (propDef.type === 'number' && propValue !== undefined && propValue !== '') {
            const numValue = Number(propValue);
            if (propDef.constraints) {
              if (propDef.constraints.min !== undefined && numValue < propDef.constraints.min) {
                errors.push(`Command ${command.id}: Property "${propName}" value ${numValue} is less than minimum ${propDef.constraints.min}`);
              }
              if (propDef.constraints.max !== undefined && numValue > propDef.constraints.max) {
                errors.push(`Command ${command.id}: Property "${propName}" value ${numValue} is greater than maximum ${propDef.constraints.max}`);
              }
            }
          }
          
          // Validate string patterns
          if (propDef.type === 'string' && propValue !== undefined && propValue !== '' && propDef.constraints?.pattern) {
            const regex = new RegExp(propDef.constraints.pattern);
            if (!regex.test(propValue as string)) {
              errors.push(`Command ${command.id}: Property "${propName}" value does not match pattern ${propDef.constraints.pattern}`);
            }
          }
        });
      }
    }
  });

  return errors;
}

/**
 * Validates commands.yaml content
 * @param yamlContent The YAML content to validate
 * @returns Object with parsed config and errors
 */
export function validateCommandsYaml(yamlContent: string): {
  config: CommandsConfig | null;
  errors: string[]
} {
  try {
    const parsed = parse(yamlContent) as CommandsConfig;
    const valid = validateCommandsConfig(parsed);

    if (valid) {
      return { config: parsed, errors: [] };
    }

    return {
      config: null,
      errors: (validateCommandsConfig.errors || []).map(error =>
        `${error.instancePath} ${error.message}`
      )
    };
  } catch (error) {
    return { 
      config: null, 
      errors: [`Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`] 
    };
  }
}
