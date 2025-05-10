
export type PropertyType = 'string' | 'number' | 'boolean' | 'enum' | 'asset';

export interface PropertyDefinition {
  type: PropertyType;
  required?: boolean;
  default?: string | number | boolean;
  multiline?: boolean;
  options?: string[];
  optionsFrom?: string;
  constraints?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface CommandDefinition {
  id: string;
  label: string;
  description: string;
  format: string;
  properties: Record<string, PropertyDefinition>;
}

export interface CommandsConfig {
  version: number;
  commands: CommandDefinition[];
}

export interface SkitMeta {
  title: string;
  version: number;
  created: string;
  modified: string;
}

export interface SkitCommand {
  id: number;
  type: string;
  [key: string]: any; // Additional properties based on command type
}

export interface Skit {
  meta: SkitMeta;
  commands: SkitCommand[];
}
