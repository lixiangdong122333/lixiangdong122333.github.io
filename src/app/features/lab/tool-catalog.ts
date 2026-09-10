import type { IconName } from '../../shared/icon/icon';
import type { LabTool, ToolCategory, ToolField } from './tool-model';
export type ToolProcessorName =
  | 'base64'
  | 'color'
  | 'contrast'
  | 'convertCase'
  | 'json'
  | 'jsonDiff'
  | 'jwt'
  | 'sql'
  | 'textDiff'
  | 'timestamp'
  | 'timezone'
  | 'url'
  | 'uuid'
  | 'wordCount';
type ToolDefinition = Omit<LabTool, 'process'> & { processor: ToolProcessorName };

const field = (
  key: string,
  label: string,
  type: ToolField['type'] = 'textarea',
  placeholder?: string,
): ToolField => ({ key, label, type, placeholder });
export const TOOL_CATEGORIES: {
  id: ToolCategory;
  label: string;
  description: string;
  icon: IconName;
}[] = [
  { id: 'Data', label: '数据', description: 'JSON、CSV 与结构化数据处理', icon: 'code' },
  { id: 'Text', label: '文本', description: '文本转换、比较与清理', icon: 'notebook' },
  { id: 'Encode', label: '编码', description: '编码、解码与标识符', icon: 'layers' },
  { id: 'Time', label: '时间', description: '时间戳与时区计算', icon: 'clock' },
  { id: 'Developer', label: '开发', description: '开发辅助与调试工具', icon: 'terminal' },
  { id: 'Design', label: '设计', description: '颜色与可访问性检查', icon: 'palette' },
];
const base = (
  id: string,
  name: string,
  nameZh: string,
  description: string,
  category: ToolCategory,
  icon: IconName,
  processor: ToolDefinition['processor'],
  fields: ToolField[],
  actions: { id: string; label: string }[],
  keywords: string[],
  featured = false,
): ToolDefinition => ({
  id,
  name,
  nameZh,
  description,
  category,
  icon,
  fields,
  actions,
  keywords,
  featured,
  about: description,
  related: [],
  processor,
});
export const TOOL_DEFINITIONS: ToolDefinition[] = [
  base(
    'json',
    'JSON Formatter',
    'JSON 格式化',
    '格式化、压缩和校验 JSON 数据。',
    'Data',
    'code',
    'json',
    [field('input', 'JSON 输入', 'textarea', '{"project":"Xiangdong Lab"}')],
    [
      { id: 'format', label: '格式化' },
      { id: 'minify', label: '压缩' },
    ],
    ['json', 'format', 'minify', '结构化'],
    true,
  ),
  base(
    'json-diff',
    'JSON Diff',
    'JSON 对比',
    '对比两份 JSON 的结构差异。',
    'Data',
    'layers',
    'jsonDiff',
    [field('input', '原始 JSON'), field('second', '新的 JSON')],
    [{ id: 'process', label: '比较' }],
    ['json', 'diff', '对比'],
  ),
  base(
    'text-diff',
    'Text Diff',
    '文本对比',
    '快速查看两段文本的差异。',
    'Text',
    'layers',
    'textDiff',
    [field('input', '原始文本'), field('second', '新的文本')],
    [{ id: 'process', label: '比较' }],
    ['diff', 'compare', '对比', '文本'],
    true,
  ),
  base(
    'case',
    'Case Converter',
    '命名格式转换',
    '在 camel、snake、kebab 等格式间转换。',
    'Text',
    'code',
    'convertCase',
    [
      field('input', '待转换文本'),
      {
        ...field('mode', '目标格式', 'select'),
        value: 'camel',
        options: [
          { label: 'camelCase', value: 'camel' },
          { label: 'PascalCase', value: 'pascal' },
          { label: 'snake_case', value: 'snake' },
          { label: 'kebab-case', value: 'kebab' },
          { label: 'UPPER CASE', value: 'upper' },
          { label: 'lower case', value: 'lower' },
        ],
      },
    ],
    [{ id: 'process', label: '转换' }],
    ['case', 'camel', 'snake', '命名'],
    true,
  ),
  base(
    'word-count',
    'Word Counter',
    '字数统计',
    '统计字符、单词与阅读时间。',
    'Text',
    'notebook',
    'wordCount',
    [field('input', '文本内容')],
    [{ id: 'process', label: '统计' }],
    ['word', 'count', '字数'],
  ),
  base(
    'base64',
    'Base64',
    'Base64 编解码',
    '在浏览器中安全地编码或解码 Base64。',
    'Encode',
    'layers',
    'base64',
    [field('input', '文本内容')],
    [
      { id: 'encode', label: '编码' },
      { id: 'decode', label: '解码' },
    ],
    ['base64', 'encode', 'decode'],
    true,
  ),
  base(
    'url',
    'URL Encoder',
    'URL 编解码',
    '编码或解码 URL 参数。',
    'Encode',
    'link',
    'url',
    [field('input', 'URL 或参数')],
    [
      { id: 'encode', label: '编码' },
      { id: 'decode', label: '解码' },
    ],
    ['url', 'uri', 'encode'],
  ),
  base(
    'jwt',
    'JWT Decoder',
    'JWT 查看器',
    '本地解析 JWT 的 Header 与 Payload。',
    'Developer',
    'terminal',
    'jwt',
    [field('input', 'JWT')],
    [{ id: 'process', label: '解析' }],
    ['jwt', 'token', 'decode'],
    true,
  ),
  base(
    'timestamp',
    'Timestamp Converter',
    '时间戳转换',
    'Unix 时间戳与日期时间互转。',
    'Time',
    'clock',
    'timestamp',
    [
      field('input', '时间戳或 ISO 日期'),
      {
        ...field('unit', '时间戳单位', 'select'),
        value: 'seconds',
        options: [
          { label: '秒', value: 'seconds' },
          { label: '毫秒', value: 'milliseconds' },
        ],
      },
    ],
    [
      { id: 'to-date', label: '时间戳转日期' },
      { id: 'to-timestamp', label: '日期转时间戳' },
    ],
    ['timestamp', 'epoch', '时间'],
    true,
  ),
  base(
    'timezone',
    'Timezone Converter',
    '时区转换',
    '将带时区的日期转换为指定时区。',
    'Time',
    'clock',
    'timezone',
    [field('input', 'ISO 日期'), { ...field('zone', '目标时区', 'text'), value: 'Asia/Shanghai' }],
    [{ id: 'process', label: '转换' }],
    ['timezone', '时区', '时间'],
  ),
  base(
    'uuid',
    'UUID Generator',
    'UUID 生成器',
    '生成一个或多个随机 UUID。',
    'Developer',
    'command',
    'uuid',
    [{ ...field('count', '生成数量', 'number'), value: '1' }],
    [{ id: 'process', label: '生成' }],
    ['uuid', 'guid', '随机'],
  ),
  base(
    'sql',
    'SQL Formatter',
    'SQL 格式化',
    '让 SQL 查询更易读。',
    'Developer',
    'terminal',
    'sql',
    [
      field('input', 'SQL 查询'),
      {
        ...field('dialect', 'SQL 方言', 'select'),
        value: 'sql',
        options: [
          { label: 'SQL', value: 'sql' },
          { label: 'MySQL', value: 'mysql' },
          { label: 'PostgreSQL', value: 'postgresql' },
          { label: 'SQLite', value: 'sqlite' },
        ],
      },
    ],
    [{ id: 'process', label: '格式化' }],
    ['sql', 'query', '格式化'],
    true,
  ),
  base(
    'contrast',
    'Contrast Checker',
    '对比度检查',
    '检查文字与背景颜色是否符合 WCAG。',
    'Design',
    'accessibility',
    'contrast',
    [
      { ...field('foreground', '前景色', 'color'), value: '#0f172a' },
      { ...field('background', '背景色', 'color'), value: '#f8fafc' },
    ],
    [{ id: 'process', label: '检查' }],
    ['contrast', 'wcag', '颜色'],
  ),
  base(
    'color',
    'Color Converter',
    '颜色转换',
    'HEX、RGB 与 HSL 颜色互转。',
    'Design',
    'palette',
    'color',
    [field('input', '颜色值', 'text', '#10b981')],
    [{ id: 'process', label: '转换' }],
    ['color', 'hex', 'rgb', 'hsl'],
  ),
];
