import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse } from 'yaml';
import { CommandsConfig, Skit } from '../types';
import { isReservedCommand, getReservedCommandDefinition, getCombinedCommandsConfig } from './reservedCommands';

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
                  enum: ['string', 'number', 'boolean', 'enum', 'asset', 'command']
                },
                required: { type: 'boolean' },
                default: { },
                multiline: { type: 'boolean' },
                options: { 
                  type: 'array',
                  items: { type: 'string' }
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
      if (isReservedCommand(command.type)) {
        const reservedDef = getReservedCommandDefinition(command.type);
        
        if (reservedDef && reservedDef.properties) {
          Object.entries(reservedDef.properties).forEach(([propName, propDef]: [string, any]) => {
            if (propDef.required && (command[propName] === undefined || command[propName] === '')) {
              errors.push(`Command ${command.id}: Required property "${propName}" is missing`);
            }
          });
        }
        return;
      }
      
      errors.push(`Command type "${command.type}" is not defined in commands.yaml`);
      return;
    }
    
    Object.entries(commandDef.properties).forEach(([propName, propDef]: [string, any]) => {
      if (propDef.required && (command[propName] === undefined || command[propName] === '')) {
        errors.push(`Command ${command.id}: Required property "${propName}" is missing`);
      }
      
      if (propDef.type === 'command' && command[propName] !== undefined && command[propName] !== '') {
        const commandId = Number(command[propName]);
        const referredCommand = skit.commands.find(cmd => cmd.id === commandId);
        
        if (!referredCommand) {
          errors.push(`Command ${command.id}: Referenced command ID ${commandId} does not exist in the current skit`);
        } else if (propDef.commandTypes && propDef.commandTypes.length > 0) {
          if (!propDef.commandTypes.includes(referredCommand.type)) {
            errors.push(`Command ${command.id}: Referenced command type "${referredCommand.type}" is not allowed for property "${propName}"`);
          }
        }
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
      const combinedConfig = getCombinedCommandsConfig(parsed);
      
      return { config: combinedConfig, errors: [] };
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
