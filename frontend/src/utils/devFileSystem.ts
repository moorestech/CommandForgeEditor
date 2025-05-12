import { Skit } from '../types';

/**
 * 開発環境用: サンプルcommands.yamlファイルを読み込む
 * @returns Promise with the sample-commands.yaml content
 */
export async function loadSampleCommandsYaml(): Promise<string> {
  try {
    console.log('Loading sample-commands.yaml for web environment');
    
    // Web環境でfetchを使用してファイルをロード
    const response = await fetch('/src/sample-commands.yaml');
    if (!response.ok) {
      throw new Error(`Failed to fetch sample-commands.yaml: ${response.status}`);
    }
    const content = await response.text();
    console.log('Successfully loaded sample-commands.yaml');
    return content;
  } catch (error) {
    console.error('Failed to load sample-commands.yaml:', error);
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
    const response = await fetch('/src/sample-skit.json');
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