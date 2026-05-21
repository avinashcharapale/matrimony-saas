/**
 * Cryptographic utilities for token and password handling
 */

import crypto from 'crypto';
import { randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT_ROUNDS = 12;

export class CryptoUtil {
  /**
   * Hash a password using bcrypt-compatible approach
   * In production, use bcrypt package
   */
  static async hashPassword(password: string): Promise<string> {
    // For production, use: const bcrypt = require('bcrypt');
    // return bcrypt.hash(password, SALT_ROUNDS);
    
    // Simple PBKDF2 implementation for reference
    const salt = randomBytes(16);
    const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
    return `$pbkdf2-sha512$100000$${salt.toString('hex')}$${hash.toString('hex')}`;
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    // For production, use: const bcrypt = require('bcrypt');
    // return bcrypt.compare(password, hash);
    
    try {
      const [, , iterations, salt, storedHash] = hash.split('$');
      const computedHash = crypto.pbkdf2Sync(
        password,
        Buffer.from(salt, 'hex'),
        parseInt(iterations, 10),
        64,
        'sha512'
      );
      return computedHash.toString('hex') === storedHash;
    } catch (error) {
      return false;
    }
  }

  /**
   * Hash a token (for storage)
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
   * Encrypt sensitive data
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
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string, encryptionKey: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = crypto.scryptSync(encryptionKey, 'salt', 32);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
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
