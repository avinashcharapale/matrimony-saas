/**
 * JWT Token Generation and Validation
 */

import jwt from 'jsonwebtoken';
import { JwtPayload, TokenPair } from './types';

interface JwtConfig {
  jwtSecret: string;
  jwtExpiresIn: jwt.SignOptions['expiresIn'];
  refreshTokenSecret: string;
  refreshTokenExpiresIn: jwt.SignOptions['expiresIn'];
}

export class JwtUtil {
  private static config: JwtConfig;

  static initialize(config: JwtConfig): void {
    this.config = config;
  }

  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    if (!this.config) {
      throw new Error('JwtUtil not initialized. Call initialize(config) first.');
    }

    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpiresIn,
      algorithm: 'HS256',
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(userId: number, tokenId: bigint): string {
    if (!this.config) {
      throw new Error('JwtUtil not initialized. Call initialize(config) first.');
    }

    return jwt.sign(
      { userId, tokenId, type: 'refresh' },
      this.config.refreshTokenSecret,
      {
        expiresIn: this.config.refreshTokenExpiresIn,
        algorithm: 'HS256',
      }
    );
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(payload: Omit<JwtPayload, 'iat' | 'exp'>, tokenId: bigint): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload.userId, tokenId);

    // Calculate expiration from JWT
    const decoded = jwt.decode(accessToken) as any;
    const expiresIn = decoded.exp ? (decoded.exp - decoded.iat) * 1000 : 3600000;

    return {
      accessToken,
      refreshToken,
      expiresIn,
      tokenType: 'Bearer',
    };
  }

  /**
   * Verify and decode access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    if (!this.config) {
      throw new Error('JwtUtil not initialized. Call initialize(config) first.');
    }

    try {
      return jwt.verify(token, this.config.jwtSecret, {
        algorithms: ['HS256'],
      }) as JwtPayload;
    } catch (error: any) {
      throw new Error(`Invalid token: ${error.message}`);
    }
  }

  /**
   * Verify and decode refresh token
   */
  static verifyRefreshToken(token: string): { userId: number; tokenId: bigint; type: string } {
    if (!this.config) {
      throw new Error('JwtUtil not initialized. Call initialize(config) first.');
    }

    try {
      return jwt.verify(token, this.config.refreshTokenSecret, {
        algorithms: ['HS256'],
      }) as any;
    } catch (error: any) {
      throw new Error(`Invalid refresh token: ${error.message}`);
    }
  }

  /**
   * Decode token without verification (use with caution)
   */
  static decodeToken<T = any>(token: string): T | null {
    try {
      return jwt.decode(token) as T;
    } catch {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Get time until token expiration (in seconds)
   */
  static getTimeUntilExpiration(token: string): number | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return null;
      }
      return Math.max(0, decoded.exp - Math.floor(Date.now() / 1000));
    } catch {
      return null;
    }
  }

  /**
   * Extract token from Bearer header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const [scheme, token] = authHeader.split(' ');
    
    if (scheme?.toLowerCase() !== 'bearer') {
      return null;
    }

    return token || null;
  }
}
