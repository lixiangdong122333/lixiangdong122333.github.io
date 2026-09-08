import {
  base64ToBytes,
  bytesToBase64,
  bytesToHex,
  bytesToUtf8,
  concatBytes,
  utf8ToBytes,
} from './bytes';

const PBKDF2_ITERATIONS = 210_000;
const SALT_LENGTH = 16;

export type AesAlgorithm = 'AES-GCM' | 'AES-CBC';
export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-512';

function subtle(): SubtleCrypto {
  const api = globalThis.crypto?.subtle;
  if (!api) {
    throw new Error('当前环境不支持 Web Crypto');
  }
  return api;
}

async function deriveAesKey(
  algorithm: AesAlgorithm,
  password: string,
  salt: Uint8Array<ArrayBuffer>,
): Promise<CryptoKey> {
  const keyMaterial = await subtle().importKey('raw', utf8ToBytes(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return subtle().deriveKey(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: algorithm, length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

function ivLength(algorithm: AesAlgorithm): number {
  return algorithm === 'AES-GCM' ? 12 : 16;
}

function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  const output = new Uint8Array(new ArrayBuffer(length));
  globalThis.crypto.getRandomValues(output);
  return output;
}

export async function aesEncrypt(
  algorithm: AesAlgorithm,
  password: string,
  plaintext: string,
): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(ivLength(algorithm));
  const key = await deriveAesKey(algorithm, password, salt);
  const ciphertext = await subtle().encrypt({ name: algorithm, iv }, key, utf8ToBytes(plaintext));
  return bytesToBase64(concatBytes(salt, iv, new Uint8Array(ciphertext)));
}

export async function aesDecrypt(
  algorithm: AesAlgorithm,
  password: string,
  payload: string,
): Promise<string> {
  const bytes = base64ToBytes(payload);
  const minimumLength = SALT_LENGTH + ivLength(algorithm);
  if (bytes.length < minimumLength) {
    throw new Error('密文格式无效');
  }

  const salt = bytes.slice(0, SALT_LENGTH);
  const iv = bytes.slice(SALT_LENGTH, minimumLength);
  const ciphertext = bytes.slice(minimumLength);
  const key = await deriveAesKey(algorithm, password, salt);
  const plaintext = await subtle().decrypt({ name: algorithm, iv }, key, ciphertext);
  return bytesToUtf8(new Uint8Array(plaintext));
}

export async function digestHex(algorithm: HashAlgorithm, input: string): Promise<string> {
  const digest = await subtle().digest(algorithm, utf8ToBytes(input));
  return bytesToHex(new Uint8Array(digest));
}

export async function hmacSha256Hex(key: string, input: string): Promise<string> {
  const cryptoKey = await subtle().importKey(
    'raw',
    utf8ToBytes(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await subtle().sign('HMAC', cryptoKey, utf8ToBytes(input));
  return bytesToHex(new Uint8Array(signature));
}
