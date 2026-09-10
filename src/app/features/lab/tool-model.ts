import type { IconName } from '../../shared/icon/icon';

export type ToolCategory = 'Data' | 'Text' | 'Encode' | 'Time' | 'Developer' | 'Design';
export interface ToolField {
  key: string;
  label: string;
  type: 'textarea' | 'text' | 'number' | 'color' | 'select';
  value?: string;
  placeholder?: string;
  options?: { label: string; value: string }[];
}
export interface ToolResult {
  text: string;
  changes?: { value: string; added: boolean; removed: boolean }[];
  preview?: { foreground: string; background: string };
}
export type ToolProcessor = (
  values: Readonly<Record<string, string>>,
  action: string,
) => ToolResult | Promise<ToolResult>;
export interface LabTool {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  category: ToolCategory;
  icon: IconName;
  keywords: string[];
  featured?: boolean;
  fields: ToolField[];
  actions: { id: string; label: string }[];
  about: string;
  related: string[];
  process: ToolProcessor;
}
