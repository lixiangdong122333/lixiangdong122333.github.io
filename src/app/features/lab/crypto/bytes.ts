const HEX_ALPHABET = '0123456789abcdef';

// TS 5.7 splits Uint8Array by buffer kind; Web Crypto requires Uint8Array<ArrayBuffer>.
function createBytes(length: number): Uint8Array<ArrayBuffer> {
  return new Uint8Array(new ArrayBuffer(length));
}

export function utf8ToBytes(input: string): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(input);
  const output = createBytes(encoded.length);
  output.set(encoded);
  return output;
}

export function bytesToUtf8(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) {
    hex += HEX_ALPHABET[byte >> 4] + HEX_ALPHABET[byte & 0x0f];
  }
  return hex;
}

export function hexToBytes(hex: string): Uint8Array<ArrayBuffer> {
  const normalized = hex.trim();
  if (normalized.length === 0) {
    return createBytes(0);
  }
  if (normalized.length % 2 !== 0 || /[^0-9a-fA-F]/.test(normalized)) {
    throw new Error('输入不是有效的十六进制字符串');
  }

  const bytes = createBytes(normalized.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(normalized.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

export function base64ToBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binary = atob(base64.trim());
  const bytes = createBytes(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function concatBytes(...arrays: readonly Uint8Array[]): Uint8Array<ArrayBuffer> {
  const totalLength = arrays.reduce((sum, array) => sum + array.length, 0);
  const output = createBytes(totalLength);
  let offset = 0;
  for (const array of arrays) {
    output.set(array, offset);
    offset += array.length;
  }
  return output;
}
