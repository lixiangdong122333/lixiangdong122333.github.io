import { colord } from 'colord';
import { diffJson, diffLines, type Change } from 'diff';
import type { ToolProcessor, ToolResult } from './tool-model';

export const json: ToolProcessor = (values, action) => {
  const parsed: unknown = JSON.parse(values['input']);
  return { text: JSON.stringify(parsed, null, action === 'minify' ? 0 : 2) };
};

function difference(changes: Change[] | undefined): ToolResult {
  if (!changes) throw new Error('差异过多，计算已停止。请缩小输入范围。');
  if (changes.every((change) => !change.added && !change.removed)) return { text: '内容相同' };
  return {
    text: changes
      .map((change) =>
        change.value
          .split('\n')
          .map((line) => `${change.added ? '+' : change.removed ? '-' : ' '} ${line}`)
          .join('\n'),
      )
      .join('\n'),
    changes: changes.map((change) => ({
      value: change.value,
      added: change.added,
      removed: change.removed,
    })),
  };
}
export const textDiff: ToolProcessor = (values) =>
  difference(diffLines(values['input'], values['second'], { timeout: 1000 }));
export const jsonDiff: ToolProcessor = (values) => {
  const left: unknown = JSON.parse(values['input']);
  const right: unknown = JSON.parse(values['second']);
  // Objects use the library's canonical key ordering; primitives retain JSON quoting.
  const input = (value: unknown): object | string =>
    value !== null && typeof value === 'object' ? value : JSON.stringify(value);
  return difference(diffJson(input(left), input(right), { timeout: 1000 }));
};

export const convertCase: ToolProcessor = (values) => {
  const text = values['input'];
  const mode = values['mode'];
  if (mode === 'upper') return { text: text.toUpperCase() };
  if (mode === 'lower') return { text: text.toLowerCase() };
  const words = text
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean)
    .map((word) => word.toLowerCase());
  const capital = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
  return {
    text:
      mode === 'snake'
        ? words.join('_')
        : mode === 'kebab'
          ? words.join('-')
          : mode === 'pascal'
            ? words.map(capital).join('')
            : words.map((word, index) => (index ? capital(word) : word)).join(''),
  };
};

function decodeBase64(text: string): string {
  const normalized = text.replace(/\s/g, '');
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}(?:==)?|[A-Za-z0-9+/]{3}=?|)?$/.test(normalized))
    throw new Error('Base64 格式无效。');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
}
export const base64: ToolProcessor = (values, action) => {
  if (action === 'decode') return { text: decodeBase64(values['input']) };
  const bytes = new TextEncoder().encode(values['input']);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return { text: btoa(binary) };
};
export const url: ToolProcessor = (values, action) => ({
  text:
    action === 'decode' ? decodeURIComponent(values['input']) : encodeURIComponent(values['input']),
});
export const jwt: ToolProcessor = (values) => {
  const parts = values['input'].trim().split('.');
  if (
    parts.length !== 3 ||
    !parts[0] ||
    !parts[1] ||
    parts.some((part) => !/^[A-Za-z0-9_-]*$/.test(part))
  )
    throw new Error('请输入由三部分组成的 JWT。');
  const decode = (part: string): unknown =>
    JSON.parse(decodeBase64(part.replace(/-/g, '+').replace(/_/g, '/')));
  return {
    text: JSON.stringify(
      { header: decode(parts[0]), payload: decode(parts[1]), signatureVerified: false },
      null,
      2,
    ),
  };
};

export function parseInstant(input: string): Date {
  const value = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/i.test(value))
    throw new Error('请输入带时区的 ISO 日期，例如 2026-09-08T12:00:00+08:00。');
  const year = Number(value.slice(0, 4)),
    month = Number(value.slice(5, 7)),
    day = Number(value.slice(8, 10));
  const calendar = new Date(0);
  calendar.setUTCFullYear(year, month, 0);
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > calendar.getUTCDate() ||
    Number(value.slice(11, 13)) > 23
  )
    throw new Error('日期不存在。');
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new Error('日期无效。');
  return date;
}
export const timestamp: ToolProcessor = (values, action) => {
  const value = values['input'].trim();
  let date: Date;
  if (action === 'to-date') {
    if (!/^-?\d+$/.test(value)) throw new Error('时间戳必须是整数。');
    const milliseconds = Number(value) * (values['unit'] === 'seconds' ? 1000 : 1);
    if (!Number.isSafeInteger(milliseconds)) throw new Error('时间戳超出有效范围。');
    date = new Date(milliseconds);
    if (!Number.isFinite(date.getTime())) throw new Error('时间戳超出日期范围。');
  } else date = parseInstant(value);
  return {
    text: `UTC: ${date.toISOString()}\nUnix seconds: ${Math.floor(date.getTime() / 1000)}\nUnix milliseconds: ${date.getTime()}`,
  };
};
export const timezone: ToolProcessor = (values) => {
  const date = parseInstant(values['input']);
  return {
    text: new Intl.DateTimeFormat('zh-CN', {
      timeZone: values['zone'].trim(),
      dateStyle: 'full',
      timeStyle: 'long',
      hourCycle: 'h23',
    }).format(date),
  };
};
export const uuid: ToolProcessor = (values) => {
  const amount = Number(values['count']);
  if (!Number.isInteger(amount) || amount < 1 || amount > 100)
    throw new Error('数量必须是 1 到 100 的整数。');
  return { text: Array.from({ length: amount }, () => crypto.randomUUID()).join('\n') };
};
export const sql: ToolProcessor = async (values) => {
  const { format } = await import('sql-formatter');
  const language = values['dialect'];
  if (
    language !== 'sql' &&
    language !== 'mysql' &&
    language !== 'postgresql' &&
    language !== 'sqlite'
  )
    throw new Error('不支持的 SQL 方言。');
  return { text: format(values['input'], { language, keywordCase: 'upper', tabWidth: 2 }) };
};

function parseColor(input: string) {
  const color = colord(input.trim());
  if (!color.isValid()) throw new Error('请输入有效的 HEX、RGB 或 HSL 颜色。');
  return color;
}
export function calculateContrastRatio(foreground: string, background: string): number {
  const luminance = (input: string) => {
    const color = parseColor(input);
    if (color.alpha() !== 1) throw new Error('对比度检查需要不透明颜色。');
    const { r, g, b } = color.toRgb();
    const channel = (value: number) => {
      const v = value / 255;
      return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  const a = luminance(foreground),
    b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
export const contrast: ToolProcessor = (values) => {
  const ratio = calculateContrastRatio(values['foreground'], values['background']);
  return {
    text: `${ratio.toFixed(2)}:1\nAA 正文: ${ratio >= 4.5 ? '通过' : '未通过'}\nAA 大字: ${ratio >= 3 ? '通过' : '未通过'}\nAAA 正文: ${ratio >= 7 ? '通过' : '未通过'}`,
    preview: {
      foreground: parseColor(values['foreground']).toHex(),
      background: parseColor(values['background']).toHex(),
    },
  };
};
export const color: ToolProcessor = (values) => {
  const color = parseColor(values['input']);
  return {
    text: `${color.toHex()}\n${color.toRgbString()}\n${color.toHslString()}`,
    preview: { foreground: '#000000', background: color.toHex() },
  };
};
export const wordCount: ToolProcessor = (values) => {
  const text = values['input'];
  const words = [...new Intl.Segmenter('zh-CN', { granularity: 'word' }).segment(text)].filter(
    (word) => word.isWordLike,
  ).length;
  const characters = [...text].length;
  return {
    text: `字符: ${characters}\n非空白字符: ${[...text.replace(/\s/g, '')].length}\n词数: ${words}\n行数: ${text ? text.split(/\r?\n/).length : 0}\n预计阅读: ${text.trim() ? Math.max(1, Math.ceil(words / 200)) : 0} 分钟`,
  };
};
