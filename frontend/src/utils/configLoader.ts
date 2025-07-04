import { readTextFile, exists } from '@tauri-apps/api/fs';
import { join } from '@tauri-apps/api/path';
import { parse } from 'yaml';
import Ajv from 'ajv';
import { CommandForgeConfig } from '../types';

const ajv = new Ajv();

const configSchema = {
  type: 'object',
  required: ['version', 'commandsSchema'],
  properties: {
    version: { type: 'number' },
    projectName: { type: 'string' },
    commandsSchema: { type: 'string' }
  }
};

const validateConfig = ajv.compile(configSchema);

/**
 * Loads and validates the commandForgeEditor.config.yml file
 * @param projectPath The project path
 * @returns Promise with the configuration
 */
export async function loadConfigFile(projectPath: string): Promise<CommandForgeConfig> {
  try {
    // Web環境の場合は例外をスロー
    if (import.meta.env.DEV && typeof window !== 'undefined' && !((window as unknown) as { __TAURI__: unknown }).__TAURI__) {
      throw new Error('Running in web environment, Tauri API not available');
    }

    const configPath = await join(projectPath, 'commandForgeEditor.config.yml');
    
    if (!(await exists(configPath))) {
      throw new Error(`Configuration file not found at ${configPath}`);
    }

    const configContent = await readTextFile(configPath);
    const config = parse(configContent) as CommandForgeConfig;

    if (!validateConfig(config)) {
      const errors = validateConfig.errors?.map(err => `${err.instancePath} ${err.message}`).join(', ');
      throw new Error(`Invalid configuration: ${errors}`);
    }

    return config;
  } catch (error) {
    console.error('Failed to load configuration file:', error);
    throw error;
  }
}

/**
 * Validates a configuration object
 * @param config The configuration to validate
 * @returns Array of validation errors, empty if valid
 */
export function validateCommandForgeConfig(config: unknown): string[] {
  if (!validateConfig(config)) {
    return validateConfig.errors?.map(err => `${err.instancePath} ${err.message}`) || ['Unknown validation error'];
  }
  return [];
}