import { aesDecrypt, aesEncrypt, digestHex, hmacSha256Hex } from './webcrypto';

describe('webcrypto wrappers', () => {
  it('computes SHA-256 from the NIST vector', async () => {
    await expect(digestHex('SHA-256', 'abc')).resolves.toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('computes SHA-1 from the NIST vector', async () => {
    await expect(digestHex('SHA-1', 'abc')).resolves.toBe(
      'a9993e364706816aba3e25717850c26c9cd0d89d',
    );
  });

  it('computes HMAC-SHA256 from the RFC 4231 vector', async () => {
    await expect(hmacSha256Hex('Jefe', 'what do ya want for nothing?')).resolves.toBe(
      '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843',
    );
  });

  it.each(['AES-GCM', 'AES-CBC'] as const)('round-trips %s with a password', async (algorithm) => {
    const plaintext = '被线程池记住的用户：一次上下文错乱复盘';
    const payload = await aesEncrypt(algorithm, 'correct horse battery staple', plaintext);
    await expect(aesDecrypt(algorithm, 'correct horse battery staple', payload)).resolves.toBe(
      plaintext,
    );
  });

  it('produces a fresh payload for every encryption', async () => {
    const first = await aesEncrypt('AES-GCM', 'password', 'same input');
    const second = await aesEncrypt('AES-GCM', 'password', 'same input');
    expect(first).not.toBe(second);
  });

  it('rejects a wrong password in GCM mode', async () => {
    const payload = await aesEncrypt('AES-GCM', 'right password', 'secret');
    await expect(aesDecrypt('AES-GCM', 'wrong password', payload)).rejects.toThrow();
  });

  it('rejects truncated payloads', async () => {
    await expect(aesDecrypt('AES-GCM', 'password', 'QUJD')).rejects.toThrow('密文格式无效');
  });
});
