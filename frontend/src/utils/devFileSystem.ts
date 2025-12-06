import { Skit, CommandForgeConfig } from '../types';
import { parse } from 'yaml';

/**
 * 開発環境用: サンプルcommands.yamlファイルを読み込む
 * @returns Promise with the commands.yaml content
 */
export async function loadSampleCommandsYaml(): Promise<string> {
  try {
    console.log('Loading commands.yaml for web environment');
    
    // Web環境でfetchを使用してファイルをロード
    const response = await fetch('/src/sample/commands.yaml');
    if (!response.ok) {
      throw new Error(`Failed to fetch commands.yaml: ${response.status}`);
    }
    const content = await response.text();
    console.log('Successfully loaded commands.yaml');
    return content;
  } catch (error) {
    console.error('Failed to load commands.yaml:', error);
    throw error;
  }
}

/**
 * 開発環境用: サンプルスキットJSONファイルを読み込む
 * @returns Promise with the sample skit
 */
export async function loadSampleSkit(): Promise<Record<string, Skit>> {
  try {
    console.log('Loading sample-skit.json for web environment');
    
    // Web環境でfetchを使用してファイルをロード
    const response = await fetch('/src/sample/skits/sample_skit.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch sample-skit.json: ${response.status}`);
    }
    const content = await response.text();
    const sampleSkit = JSON.parse(content);
    console.log('Successfully loaded sample-skit.json');
    return { 'sample': sampleSkit };
  } catch (error) {
    console.error('Failed to load sample-skit.json:', error);
    throw error;
  }
}

const CONFIG_FILE_NAMES = ['commandForgeEditor.config.yml', 'commandForgeEditor.config.yaml'];

/**
 * 開発環境用: サンプルcommandForgeEditor.config.yml または .yaml ファイルを読み込む
 * @returns Promise with the configuration
 */
export async function loadSampleConfig(): Promise<CommandForgeConfig> {
  try {
    console.log('Loading commandForgeEditor.config for web environment');

    // Web環境でfetchを使用してファイルをロード (.yml, .yaml の順で試行)
    let response: Response | null = null;
    let loadedFileName: string | null = null;

    for (const fileName of CONFIG_FILE_NAMES) {
      const res = await fetch(`/src/sample/${fileName}`);
      if (res.ok) {
        response = res;
        loadedFileName = fileName;
        break;
      }
    }

    if (!response || !response.ok) {
      throw new Error(`Failed to fetch config file. Searched for: ${CONFIG_FILE_NAMES.join(', ')}`);
    }

    const content = await response.text();
    const config = parse(content) as CommandForgeConfig;
    console.log(`Successfully loaded ${loadedFileName}`);
    return config;
  } catch (error) {
    console.error('Failed to load commandForgeEditor.config:', error);
    throw error;
  }
}