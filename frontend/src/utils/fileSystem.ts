import { readTextFile, writeTextFile, createDir, readDir, exists } from '@tauri-apps/api/fs';
import { join, resolveResource } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/api/dialog';
import { Skit } from '../types';
import { validateSkitData, validateCommandsYaml } from './validation';

/**
 * Opens a folder selection dialog
 * @returns Promise with the selected path or null if cancelled
 */
export async function selectProjectFolder(): Promise<string | null> {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: 'プロジェクトフォルダを選択'
    });
    
    if (selected === null) {
      return null;
    }
    
    return selected as string;
  } catch (error) {
    console.error('Failed to select project folder:', error);
    return null;
  }
}

/**
 * Loads commands.yaml file from either project path or resources
 * @param projectPath Optional project path
 * @returns Promise with the commands.yaml content
 */
export async function loadCommandsYaml(projectPath: string | null = null): Promise<string> {
  try {
    // Web環境の場合はすぐに例外をスロー
    if (import.meta.env.DEV && typeof window !== 'undefined' && !(window as any).__TAURI__) {
      throw new Error('Running in web environment, Tauri API not available');
    }
    
    let commandsYamlPath;
    
    if (projectPath) {
      commandsYamlPath = await join(projectPath, 'commands.yaml');
      if (await exists(commandsYamlPath)) {
        return await readTextFile(commandsYamlPath);
      }
    }
    
    commandsYamlPath = await resolveResource('commands.yaml');
    return await readTextFile(commandsYamlPath);
  } catch (error) {
    console.error('Failed to load commands.yaml:', error);
    throw error;
  }
}


/**
 * Loads all skits from the skits directory
 * @param projectPath Optional project path
 * @returns Promise with a record of skits
 */
export async function loadSkits(projectPath: string | null = null): Promise<Record<string, Skit>> {
  try {
    // Web環境の場合はすぐに例外をスロー
    if (import.meta.env.DEV && typeof window !== 'undefined' && !(window as any).__TAURI__) {
      throw new Error('Running in web environment, Tauri API not available');
    }
    
    let skitsPath;
    
    if (projectPath) {
      skitsPath = await join(projectPath, 'skits');
      
      if (!(await exists(skitsPath))) {
        await createDir(skitsPath, { recursive: true });
        console.log(`Created skits directory at ${skitsPath}`);
        return {}; // Return empty object since directory was just created
      }
      
      return await loadSkitsFromPath(skitsPath);
    }
    
    skitsPath = await resolveResource('skits');
    // as it should be part of the bundled resources
    return await loadSkitsFromPath(skitsPath);
  } catch (error) {
    console.error('Failed to load skits:', error);
    return {}; // Return empty object on error instead of throwing
  }
}

/**
 * Helper function to load skits from a specific path
 * @param skitsPath Path to the skits directory
 * @returns Promise with a record of skits
 */
async function loadSkitsFromPath(skitsPath: string): Promise<Record<string, Skit>> {
  try {
    const skitFiles = await readDir(skitsPath);
    const skits: Record<string, Skit> = {};
    
    // Load commands.yaml to get defaultBackgroundColor for each command type
    let commandsConfig;
    try {
      const commandsYamlPath = await join(skitsPath, '../commands.yaml');
      if (await exists(commandsYamlPath)) {
        const commandsYaml = await readTextFile(commandsYamlPath);
        const { validateCommandsYaml } = await import('./validation');
        const { config } = validateCommandsYaml(commandsYaml);
        commandsConfig = config;
      }
    } catch (error) {
      console.error('Failed to load commands.yaml for background colors:', error);
    }
    
    for (const file of skitFiles) {
      if (file.name && file.name.endsWith('.json')) {
        const skitId = file.name.replace('.json', '');
        const skitContent = await readTextFile(`${skitsPath}/${file.name}`);
        const skit = JSON.parse(skitContent);
        
        if (commandsConfig && commandsConfig.commands) {
          skit.commands = skit.commands.map((command: any) => {
            if (!command.backgroundColor) {
              const commandDef = commandsConfig.commands.find((def: any) => def.id === command.type);
              if (commandDef && commandDef.defaultBackgroundColor) {
                return { ...command, backgroundColor: commandDef.defaultBackgroundColor };
              }
            }
            return command;
          });
        }
        
        skits[skitId] = skit;
      }
    }
    
    return skits;
  } catch (error) {
    console.error(`Failed to load skits from ${skitsPath}:`, error);
    return {};
  }
}

/**
 * Saves a skit to a JSON file
 * @param skitId The ID of the skit
 * @param skit The skit data
 * @param commandsYaml The commands.yaml content for validation
 * @param projectPath Optional project path
 * @returns Promise with validation errors, empty if valid
 */
export async function saveSkit(
  skitId: string, 
  skit: Skit, 
  commandsYaml: string,
  projectPath: string | null = null
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
    
    let skitsPath;
    
    if (projectPath) {
      skitsPath = await join(projectPath, 'skits');
    } else {
      skitsPath = await resolveResource('skits');
    }
    
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
 * @param projectPath Optional project path
 * @returns Promise with the new skit ID and any errors
 */
export async function createNewSkit(
  title: string,
  projectPath: string | null = null
): Promise<{ id: string; errors: string[] }> {
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
  const errors = await saveSkit(skitId, newSkit, '', projectPath);
  
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
      // commandDefが見つからない場合は、エラーを返します
      errors.push(`Command ${command.id}: Definition not found`);
    } else {
      if (commandDef.properties) {
        Object.entries(commandDef.properties).forEach(([propName, propDef]: [string, any]) => {
          if (propDef.required && (command[propName] === undefined || command[propName] === '')) {
            errors.push(`Command ${command.id}: Required property "${propName}" is missing`);
          }
        });
      }
    }
  });

  return errors;
}
