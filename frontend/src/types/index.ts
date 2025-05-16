
export type PropertyType = 'string' | 'number' | 'boolean' | 'enum' | 'asset' | 'command';

export interface PropertyDefinition {
  type: PropertyType;
  required?: boolean;
  default?: string | number | boolean;
  multiline?: boolean;
  options?: string[];
  optionsFrom?: string;
  commandTypes?: string[]; // Array of command types that can be selected
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
  commandListLabelFormat: string;
  defaultBackgroundColor?: string;
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
  backgroundColor?: string; // Background color for the command
  isCollapsed?: boolean; // For group_start commands
  groupName?: string; // For group_start commands
  // 必須プロパティの型も含めたインデックスシグネチャ
  [key: string]: unknown | string | number | boolean;
}

export interface Skit {
  meta: SkitMeta;
  commands: SkitCommand[];
}
