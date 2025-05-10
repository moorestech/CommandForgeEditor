import { readTextFile, writeTextFile, createDir, readDir } from '@tauri-apps/api/fs';
import { join, resolveResource } from '@tauri-apps/api/path';
import { Skit } from '../types';
import { validateSkitData, validateCommandsYaml } from './validation';

/**
 * Loads commands.yaml file
 * @returns Promise with the commands.yaml content
 */
export async function loadCommandsYaml(): Promise<string> {
  try {
    const commandsYamlPath = await resolveResource('commands.yaml');
    return await readTextFile(commandsYamlPath);
  } catch (error) {
    console.error('Failed to load commands.yaml:', error);
    throw error;
  }
}

/**
 * Loads all skits from the skits directory
 * @returns Promise with a record of skits
 */
export async function loadSkits(): Promise<Record<string, Skit>> {
  try {
    const skitsPath = await resolveResource('skits');
    const skitFiles = await readDir(skitsPath);
    
    const skits: Record<string, Skit> = {};
    
    for (const file of skitFiles) {
      if (file.name && file.name.endsWith('.json')) {
        const skitId = file.name.replace('.json', '');
        const skitContent = await readTextFile(`${skitsPath}/${file.name}`);
        skits[skitId] = JSON.parse(skitContent);
      }
    }
    
    return skits;
  } catch (error) {
    console.error('Failed to load skits:', error);
    throw error;
  }
}

/**
 * Saves a skit to a JSON file
 * @param skitId The ID of the skit
 * @param skit The skit data
 * @param commandsYaml The commands.yaml content for validation
 * @returns Promise with validation errors, empty if valid
 */
export async function saveSkit(
  skitId: string, 
  skit: Skit, 
  commandsYaml: string
): Promise<string[]> {
  try {
    const errors = validateSkitData(skit);
    
    if (commandsYaml) {
      const { config } = validateCommandsYaml(commandsYaml);
      if (config) {
        const propertyErrors = validateCommandProperties(skit, config);
        errors.push(...propertyErrors);
      }
    }
    
    if (errors.length > 0) {
      return errors;
    }
    
    const updatedSkit = {
      ...skit,
      meta: {
        ...skit.meta,
        modified: new Date().toISOString()
      }
    };
    
    const skitsPath = await resolveResource('skits');
    await createDir(skitsPath, { recursive: true });
    
    const skitPath = await join(skitsPath, `${skitId}.json`);
    await writeTextFile(skitPath, JSON.stringify(updatedSkit, null, 2));
    
    return [];
  } catch (error) {
    console.error('Failed to save skit:', error);
    return [`Failed to save skit: ${error instanceof Error ? error.message : String(error)}`];
  }
}

/**
 * Creates a new skit
 * @param title The title of the new skit
 * @returns Promise with the new skit ID and any errors
 */
export async function createNewSkit(title: string): Promise<{ id: string; errors: string[] }> {
  const newSkit: Skit = {
    meta: {
      title,
      version: 1,
      created: new Date().toISOString(),
      modified: new Date().toISOString()
    },
    commands: []
  };
  
  const skitId = title.toLowerCase().replace(/\s+/g, '_');
  const errors = await saveSkit(skitId, newSkit, '');
  
  return { id: skitId, errors };
}

/**
 * Validates command properties based on command type
 * @param skit The skit to validate
 * @param commandsConfig The commands configuration
 * @returns Array of validation errors, empty if valid
 */
function validateCommandProperties(skit: Skit, commandsConfig: any): string[] {
  const errors: string[] = [];
  
  skit.commands.forEach(command => {
    const commandDef = commandsConfig.commands.find((def: any) => def.id === command.type);
    
    if (!commandDef) {
      errors.push(`Command type "${command.type}" is not defined in commands.yaml`);
      return;
    }
    
    Object.entries(commandDef.properties).forEach(([propName, propDef]: [string, any]) => {
      if (propDef.required && (command[propName] === undefined || command[propName] === '')) {
        errors.push(`Command ${command.id}: Required property "${propName}" is missing`);
      }
    });
  });
  
  return errors;
}
