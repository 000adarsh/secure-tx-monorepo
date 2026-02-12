/**
 * @repo/crypto — Shared AES-256-GCM encryption module.
 *
 * Derives a 256-bit key from the partyId using SHA-256, then encrypts /
 * decrypts arbitrary JSON payloads with AES-256-GCM.  The encrypted output
 * is a base64-encoded string containing the IV, auth-tag and cipher-text so
 * it can be stored or transmitted as a single opaque token.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

/** Byte-lengths used by the algorithm. */
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Derive a 256-bit encryption key from a human-readable partyId.
 * Uses SHA-256 so the result is always exactly 32 bytes.
 */
function deriveKey(partyId: string): Buffer {
  return createHash('sha256').update(partyId).digest();
}

/**
 * Encrypt a JSON-serialisable object.
 *
 * @param data    - Any object that can be passed to `JSON.stringify`.
 * @param partyId - Unique identifier whose SHA-256 hash is used as the key.
 * @returns A base64-encoded string containing IV + authTag + cipherText.
 */
export function encrypt(data: Record<string, unknown>, partyId: string): string {
  const key = deriveKey(partyId);
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const plainText = JSON.stringify(data);

  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Pack IV (12 B) + authTag (16 B) + cipherText into a single buffer.
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return packed.toString('base64');
}

/**
 * Decrypt a base64-encoded token back into the original object.
 *
 * @param encryptedData - The base64 string produced by `encrypt`.
 * @param partyId       - Must match the partyId used during encryption.
 * @returns The original JSON object.
 * @throws If the partyId is wrong or the data has been tampered with.
 */
export function decrypt(encryptedData: string, partyId: string): Record<string, unknown> {
  const key = deriveKey(partyId);
  const packed = Buffer.from(encryptedData, 'base64');

  // Unpack the three components.
  const iv = packed.subarray(0, IV_LENGTH);
  const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const cipherText = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(cipherText), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8')) as Record<string, unknown>;
}
