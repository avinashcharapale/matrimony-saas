/**
 * Cryptographic utilities for token hashing and encryption
 *
 * Password hashing/verification is handled by the .NET Backend (BCrypt).
 */

import crypto from 'crypto';
import { randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export class CryptoUtil {
  /**
   * Hash a token for storage (SHA-256)
   */
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Generate a random token
   */
  static generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }

  /**
   * Encrypt sensitive data (AES-256-GCM)
   */
  static encrypt(data: string, encryptionKey: string): string {
    const iv = randomBytes(16);
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt sensitive data (AES-256-GCM)
   */
  static decrypt(encryptedData: string, encryptionKey: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate API key with prefix
   */
  static generateApiKey(prefix: string): { key: string; prefix: string; hash: string } {
    const randomPart = randomBytes(24).toString('hex');
    const key = `${prefix}_${randomPart}`;
    const hash = this.hashToken(key);
    return { key, prefix, hash };
  }

  /**
   * Verify API key against hash
   */
  static verifyApiKey(key: string, keyHash: string): boolean {
    return this.hashToken(key) === keyHash;
  }
}
