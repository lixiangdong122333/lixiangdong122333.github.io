import { bytesToHex, bytesToUtf8, hexToBytes, utf8ToBytes } from './bytes';

export function xorBytes(input: Uint8Array, key: Uint8Array): Uint8Array {
  if (key.length === 0) {
    throw new Error('密钥不能为空');
  }

  const output = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i++) {
    output[i] = input[i] ^ key[i % key.length];
  }
  return output;
}

export function xorEncryptToHex(plaintext: string, key: string): string {
  return bytesToHex(xorBytes(utf8ToBytes(plaintext), utf8ToBytes(key)));
}

export function xorDecryptFromHex(hex: string, key: string): string {
  return bytesToUtf8(xorBytes(hexToBytes(hex), utf8ToBytes(key)));
}
