
export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'asset'
  | 'command'
  | 'vector2'
  | 'vector3'
  | 'vector4'
  | 'vector2Int'
  | 'vector3Int';

export interface PropertyDefinition {
  type: PropertyType;
  required?: boolean;
  default?: string | number | boolean | number[];
  multiline?: boolean;
  options?: string[] | { master: string };
  optionsFrom?: string;
  commandTypes?: string[]; // Array of command types that can be selected
  masterKey?: string; // The master data key if options were resolved from master data
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
  category?: string[];
  commandListLabelFormat: string;
  defaultBackgroundColor?: string;
  defaultCommandLabelColor?: string;
  properties: Record<string, PropertyDefinition>;
}

export interface CommandsConfig {
  version: number;
  master?: Record<string, string[]>;
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
  backgroundColor?: string; // Background color for the command
  commandLabelColor?: string; // Text color for the command
  isCollapsed?: boolean; // For group_start commands
  groupName?: string; // For group_start commands
  // 必須プロパティの型も含めたインデックスシグネチャ
  [key: string]: unknown | string | number | boolean | number[];
}

export interface Skit {
  meta: SkitMeta;
  commands: SkitCommand[];
}

export interface CommandForgeConfig {
  version: number;
  projectName?: string;
  commandsSchema: string;
}
