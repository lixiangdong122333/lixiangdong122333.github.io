import type { LabTool } from './tool-model';
import { TOOL_DEFINITIONS } from './tool-catalog';
import * as processors from './tool-processors';

export { TOOL_CATEGORIES } from './tool-catalog';
export const LAB_TOOLS: LabTool[] = TOOL_DEFINITIONS.map(({ processor, ...definition }) => ({
  ...definition,
  process: processors[processor],
}));
