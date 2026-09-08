import { base64ToBytes, bytesToBase64, bytesToHex, hexToBytes, utf8ToBytes } from './bytes';

describe('byte encoding helpers', () => {
  it('encodes and decodes utf-8 bytes', () => {
    const text = '相东实验室 XD Lab';
    expect(bytesToHex(utf8ToBytes(text))).toBe(
      'e79bb8e4b89ce5ae9ee9aa8c e5aea4 205844204c6162'.replaceAll(' ', ''),
    );
  });

  it('round-trips hex encoding', () => {
    const bytes = utf8ToBytes('hello 加密');
    expect(hexToBytes(bytesToHex(bytes))).toEqual(bytes);
  });

  it('round-trips base64 encoding', () => {
    const bytes = utf8ToBytes('hello 加密');
    expect(base64ToBytes(bytesToBase64(bytes))).toEqual(bytes);
  });

  it('rejects invalid hex input', () => {
    expect(() => hexToBytes('abc')).toThrow('十六进制');
    expect(() => hexToBytes('zz')).toThrow('十六进制');
  });
});
