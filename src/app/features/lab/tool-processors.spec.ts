import { LAB_TOOLS } from './tool-registry';
import { searchTools } from './tool-search';
import {
  base64,
  color,
  contrast,
  convertCase,
  json,
  jsonDiff,
  jwt,
  parseInstant,
  sql,
  textDiff,
  timestamp,
  timezone,
  url,
  uuid,
  wordCount,
} from './tool-processors';

describe('tool registry', () => {
  it('has unique paths and valid select defaults', () => {
    expect(new Set(LAB_TOOLS.map((tool) => tool.id)).size).toBe(LAB_TOOLS.length);
    for (const tool of LAB_TOOLS) {
      for (const field of tool.fields.filter((field) => field.type === 'select')) {
        expect(field.options?.some((option) => option.value === field.value)).toBe(true);
      }
    }
  });
  it('searches aliases, English, Chinese and whitespace-separated terms', () => {
    expect(searchTools('epoch').map((tool) => tool.id)).toContain('timestamp');
    expect(searchTools('时间').map((tool) => tool.id)).toEqual(
      expect.arrayContaining(['timestamp', 'timezone']),
    );
    expect(searchTools('JSON diff').map((tool) => tool.id)).toEqual(['json-diff']);
    expect(searchTools('no such tool')).toEqual([]);
  });
});

describe('local tool processors', () => {
  it('formats and validates JSON', async () => {
    expect((await json({ input: '{"a":1}' }, 'format')).text).toBe('{\n  "a": 1\n}');
    expect((await json({ input: '{ "a": 1 }' }, 'minify')).text).toBe('{"a":1}');
    expect(() => json({ input: '{' }, 'format')).toThrow();
  });
  it('compares JSON without depending on object key order', async () => {
    expect((await jsonDiff({ input: '{"a":1,"b":2}', second: '{"b":2,"a":1}' }, '')).text).toBe(
      '内容相同',
    );
    expect((await jsonDiff({ input: '"a"', second: '"b"' }, '')).text).toContain('+');
  });
  it('marks added and removed text', async () => {
    const result = await textDiff({ input: 'one\ntwo', second: 'one\nthree' }, '');
    expect(result.text).toContain('- two');
    expect(result.text).toContain('+ three');
  });
  it('converts acronym and mixed case names', async () => {
    expect((await convertCase({ input: 'HTTPServer foo_bar', mode: 'snake' }, '')).text).toBe(
      'http_server_foo_bar',
    );
  });
  it('round-trips Unicode Base64 including unpadded input', async () => {
    const encoded = await base64({ input: '相东 🧪' }, 'encode');
    expect((await base64({ input: encoded.text.replace(/=+$/, '') }, 'decode')).text).toBe(
      '相东 🧪',
    );
    expect(() => base64({ input: '%%' }, 'decode')).toThrow();
  });
  it('round-trips URL parameters and rejects malformed escapes', async () => {
    const encoded = await url({ input: '相东 & +/#' }, 'encode');
    expect((await url({ input: encoded.text }, 'decode')).text).toBe('相东 & +/#');
    expect(() => url({ input: '%zz' }, 'decode')).toThrow();
  });
  it('decodes unsigned JWT without claiming signature verification', async () => {
    const result = await jwt({ input: 'eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0.' }, '');
    expect(JSON.parse(result.text)).toEqual({
      header: { alg: 'none' },
      payload: { sub: '1' },
      signatureVerified: false,
    });
    expect(() => jwt({ input: 'not.a.token!' }, '')).toThrow();
  });
  it('distinguishes seconds from milliseconds at the epoch', async () => {
    expect((await timestamp({ input: '1', unit: 'seconds' }, 'to-date')).text).toContain(
      '1970-01-01T00:00:01.000Z',
    );
    expect((await timestamp({ input: '1', unit: 'milliseconds' }, 'to-date')).text).toContain(
      '1970-01-01T00:00:00.001Z',
    );
    expect((await timestamp({ input: '0', unit: 'seconds' }, 'to-date')).text).toContain(
      '1970-01-01T00:00:00.000Z',
    );
  });
  it('rejects invalid dates and ambiguous date strings', () => {
    expect(() => parseInstant('2026-02-30T12:00:00Z')).toThrow();
    expect(() => parseInstant('2026-09-08T12:00:00')).toThrow();
    expect(parseInstant('2024-02-29T12:00:00+08:00').toISOString()).toBe(
      '2024-02-29T04:00:00.000Z',
    );
  });
  it('converts an explicit instant to a target timezone', async () => {
    expect(
      (await timezone({ input: '1970-01-01T00:00:00Z', zone: 'Asia/Shanghai' }, '')).text,
    ).toContain('08:00:00');
    expect(() => timezone({ input: '1970-01-01T00:00:00Z', zone: 'Invalid/Zone' }, '')).toThrow();
  });
  it('formats SQL without changing quoted text', async () => {
    const result = await sql(
      { input: "select 'from where' as value from items where id=1", dialect: 'sql' },
      '',
    );
    expect(result.text).toContain("'from where'");
    expect(result.text).toContain('SELECT');
    expect(result.text).toContain('\nFROM');
  });
  it('generates a bounded number of UUIDs', async () => {
    const ids = (await uuid({ count: '2' }, '')).text.split('\n');
    expect(new Set(ids).size).toBe(2);
    expect(ids.every((id) => /^[0-9a-f-]{14}4[0-9a-f-]{21}$/.test(id))).toBe(true);
    expect(() => uuid({ count: '101' }, '')).toThrow();
  });
  it('converts colors and reports WCAG thresholds', async () => {
    expect((await color({ input: 'rgb(255, 0, 0)' }, '')).text).toContain('#ff0000');
    const result = await contrast({ foreground: '#000000', background: '#ffffff' }, '');
    expect(result.text).toContain('21.00:1');
    expect(result.preview).toEqual({ foreground: '#000000', background: '#ffffff' });
    expect(() => color({ input: 'not a color' }, '')).toThrow();
  });
  it('counts Unicode characters and empty text', async () => {
    expect((await wordCount({ input: '你好' }, '')).text).toContain('字符: 2');
    expect((await wordCount({ input: '' }, '')).text).toContain('行数: 0');
  });
});
