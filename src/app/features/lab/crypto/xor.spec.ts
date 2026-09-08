import { xorDecryptFromHex, xorEncryptToHex } from './xor';

describe('xor cipher', () => {
  it('matches a hand-computed vector', () => {
    // 'abc' (0x61 0x62 0x63) XOR 'k' (0x6b) = 0x0a 0x09 0x08
    expect(xorEncryptToHex('abc', 'k')).toBe('0a0908');
  });

  it('round-trips with a repeating multi-byte key', () => {
    const plaintext = '被线程池记住的用户：一次上下文错乱复盘';
    const key = '相东';
    expect(xorDecryptFromHex(xorEncryptToHex(plaintext, key), key)).toBe(plaintext);
  });

  it('is symmetric for the same key', () => {
    expect(xorEncryptToHex('hello', 'key')).toBe(xorEncryptToHex('hello', 'key'));
    expect(xorEncryptToHex('hello', 'key')).not.toBe(xorEncryptToHex('hello', 'keys'));
  });

  it('rejects an empty key', () => {
    expect(() => xorEncryptToHex('hello', '')).toThrow('密钥不能为空');
    expect(() => xorDecryptFromHex('0a09', '')).toThrow('密钥不能为空');
  });
});
