import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse } from 'yaml';
import { CommandsConfig, Skit } from '../types';

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
                  enum: ['string', 'number', 'boolean', 'enum', 'asset']
                },
                required: { type: 'boolean' },
                default: { },
                multiline: { type: 'boolean' },
                options: { 
                  type: 'array',
                  items: { type: 'string' }
                },
                optionsFrom: { type: 'string' },
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
      errors.push(`Command type "${command.type}" is not defined in commands.yaml`);
      return;
    }
    
    Object.entries(commandDef.properties).forEach(([propName, propDef]) => {
      if (propDef.required && (command[propName] === undefined || command[propName] === '')) {
        errors.push(`Command ${command.id}: Required property "${propName}" is missing`);
      }
    });
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
