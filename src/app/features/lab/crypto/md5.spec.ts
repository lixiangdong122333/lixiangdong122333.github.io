import { md5Hex } from './md5';

describe('md5Hex', () => {
  // Test vectors from RFC 1321, section A.5.
  it.each([
    ['', 'd41d8cd98f00b204e9800998ecf8427e'],
    ['a', '0cc175b9c0f1b6a831c399e269772661'],
    ['abc', '900150983cd24fb0d6963f7d28e17f72'],
    ['message digest', 'f96b697d7cb7938d525a2f31aaf161d0'],
    ['abcdefghijklmnopqrstuvwxyz', 'c3fcd3d76192e4007dfb496cca67e13b'],
    [
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      'd174ab98d277d9f5a5611c2c9f419d9f',
    ],
    [
      '12345678901234567890123456789012345678901234567890123456789012345678901234567890',
      '57edf4a22be3c955ac49da2e2107b67a',
    ],
  ])('md5(%j) === %s', (input, expected) => {
    expect(md5Hex(input)).toBe(expected);
  });

  it('hashes multi-byte characters consistently', () => {
    expect(md5Hex('相东实验室')).toHaveLength(32);
    expect(md5Hex('相东实验室')).toBe(md5Hex('相东实验室'));
    expect(md5Hex('相东实验室')).not.toBe(md5Hex('相东实验室断'));
  });
});
