/**
 * Core Authentication Service
 * Handles login, registration, token refresh, logout
 */

import { AuthDatabase } from './database';
import { JwtUtil } from './jwt.util';
import { CryptoUtil } from './crypto.util';
import type { SignOptions } from 'jsonwebtoken';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  TokenPair,
  JwtPayload,
} from './types';

interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: SignOptions['expiresIn'];
  refreshTokenSecret: string;
  refreshTokenExpiresIn: SignOptions['expiresIn'];
  encryptionKey: string;
  sessionExpiresInMs: number;
}

export class AuthenticationService {
  private db: AuthDatabase;
  private config: AuthConfig;

  constructor(db: AuthDatabase, config: AuthConfig) {
    this.db = db;
    this.config = config;

    // Initialize JWT utility
    JwtUtil.initialize({
      jwtSecret: config.jwtSecret,
      jwtExpiresIn: config.jwtExpiresIn,
      refreshTokenSecret: config.refreshTokenSecret,
      refreshTokenExpiresIn: config.refreshTokenExpiresIn,
    });
  }

  /**
   * Login with email and password
   */
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      const tenantId = request.tenantId || 1;

      // Get user from database
      const user = await this.db.getUserByEmail(request.email, tenantId);
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new Error('User account is inactive');
      }

      // Verify password
      const passwordMatch = await CryptoUtil.verifyPassword(request.password, user.passwordHash);
      if (!passwordMatch) {
        throw new Error('Invalid email or password');
      }

      // Generate tokens
      const refreshTokenExpiresAt = new Date(Date.now() + this.parseExpiry(this.config.refreshTokenExpiresIn));
      const refreshTokenId = await this.db.storeRefreshToken(
        user.id,
        CryptoUtil.hashToken(CryptoUtil.generateToken()),
        refreshTokenExpiresAt,
        undefined,
        undefined,
        request.deviceId
      );

      const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
      };

      const tokenPair = JwtUtil.generateTokenPair(jwtPayload, refreshTokenId);
      await this.db.updateRefreshTokenHash(refreshTokenId, CryptoUtil.hashToken(tokenPair.refreshToken));

      // Create session
      const sessionExpiresAt = new Date(Date.now() + this.config.sessionExpiresInMs);
      const sessionToken = CryptoUtil.generateToken();
      const sessionHash = CryptoUtil.hashToken(CryptoUtil.generateToken());
      await this.db.createSession(
        user.id,
        user.tenantId,
        sessionToken,
        sessionHash,
        sessionExpiresAt,
        request.deviceId,
        request.deviceInfo
      );

      // Record login
      await this.db.recordLogin(user.id, user.tenantId);

      return {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
        },
      };
    } catch (error) {
      throw new Error(`Login failed: ${(error as Error).message}`);
    }
  }

  /**
   * Register new user
   */
  async register(request: RegisterRequest): Promise<LoginResponse> {
    try {
      if (request.password !== request.confirmPassword) {
        throw new Error('Passwords do not match');
      }

      if (request.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      const tenantId = request.tenantId || 1;

      // Check if user exists
      const existingUser = await this.db.getUserByEmail(request.email, tenantId);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Hash password
      const passwordHash = await CryptoUtil.hashPassword(request.password);

      const user = await this.db.createUser(request.email, passwordHash, tenantId);
      await this.db.ensureAuthenticationMethod(user.id, 'email_password', true);

      const refreshTokenExpiresAt = new Date(Date.now() + this.parseExpiry(this.config.refreshTokenExpiresIn));
      const refreshTokenId = await this.db.storeRefreshToken(
        user.id,
        CryptoUtil.hashToken(CryptoUtil.generateToken()),
        refreshTokenExpiresAt,
        request.deviceId,
        request.deviceInfo
      );

      const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
      };

      const tokenPair = JwtUtil.generateTokenPair(jwtPayload, refreshTokenId);
      await this.db.updateRefreshTokenHash(refreshTokenId, CryptoUtil.hashToken(tokenPair.refreshToken));

      const sessionExpiresAt = new Date(Date.now() + this.config.sessionExpiresInMs);
      const sessionToken = CryptoUtil.generateToken();
      const sessionHash = CryptoUtil.hashToken(CryptoUtil.generateToken());
      await this.db.createSession(
        user.id,
        user.tenantId,
        sessionToken,
        sessionHash,
        sessionExpiresAt,
        request.deviceId,
        request.deviceInfo
      );

      await this.db.recordLogin(user.id, user.tenantId);

      return {
        accessToken: tokenPair.accessToken,
        refreshToken: tokenPair.refreshToken,
        expiresIn: tokenPair.expiresIn,
        user: {
          id: user.id,
          email: user.email,
          tenantId: user.tenantId,
        },
      };
    } catch (error) {
      throw new Error(`Registration failed: ${(error as Error).message}`);
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const decoded = JwtUtil.verifyRefreshToken(refreshToken);
      const tokenId = this.toBigInt(decoded.tokenId);

      // Get refresh token record
      const tokenRecord = await this.db.getRefreshTokenById(tokenId);
      if (!tokenRecord || tokenRecord.isRevoked) {
        throw new Error('Refresh token is invalid or revoked');
      }

      if (tokenRecord.tokenHash !== CryptoUtil.hashToken(refreshToken)) {
        throw new Error('Refresh token is invalid');
      }

      if (new Date(tokenRecord.expiresAt) < new Date()) {
        throw new Error('Refresh token is expired');
      }

      // Get user
      const user = await this.db.getUserById(decoded.userId);
      if (!user || !user.isActive) {
        throw new Error('User is inactive or not found');
      }

      // Generate new token pair
      const jwtPayload: Omit<JwtPayload, 'iat' | 'exp'> = {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
      };

      const newTokenPair = JwtUtil.generateTokenPair(jwtPayload, tokenRecord.refreshTokenId);
      await this.db.updateRefreshTokenHash(tokenRecord.refreshTokenId, CryptoUtil.hashToken(newTokenPair.refreshToken));

      return newTokenPair;
    } catch (error) {
      throw new Error(`Token refresh failed: ${(error as Error).message}`);
    }
  }

  /**
   * Logout (revoke tokens)
   */
  async logout(refreshToken: string, sessionId?: bigint): Promise<void> {
    try {
      // Revoke refresh token
      const decoded = JwtUtil.verifyRefreshToken(refreshToken);
      await this.db.revokeRefreshToken(this.toBigInt(decoded.tokenId));

      // Terminate session if provided
      if (sessionId) {
        await this.db.terminateSession(sessionId);
      }
    } catch (error) {
      throw new Error(`Logout failed: ${(error as Error).message}`);
    }
  }

  /**
   * Validate access token
   */
  validateAccessToken(token: string): JwtPayload {
    try {
      return JwtUtil.verifyAccessToken(token);
    } catch (error) {
      throw new Error(`Invalid access token: ${(error as Error).message}`);
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<void> {
    try {
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters');
      }

      const user = await this.db.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify old password
      const passwordMatch = await CryptoUtil.verifyPassword(oldPassword, user.passwordHash);
      if (!passwordMatch) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await CryptoUtil.hashPassword(newPassword);

      // Update password in database
      await this.db.updateUserPassword(userId, newPasswordHash);
    } catch (error) {
      throw new Error(`Change password failed: ${(error as Error).message}`);
    }
  }

  /**
   * Parse expiry time string to milliseconds
   */
  private parseExpiry(expiry: string | number): number {
    if (typeof expiry === 'number') {
      return expiry;
    }

    const match = String(expiry).match(/^(\d+)([smhd])$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000; // Default 7 days
    }

    const [, value, unit] = match;
    const num = parseInt(value, 10);

    switch (unit) {
      case 's':
        return num * 1000;
      case 'm':
        return num * 60 * 1000;
      case 'h':
        return num * 60 * 60 * 1000;
      case 'd':
        return num * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  private toBigInt(value: bigint | number | string): bigint {
    if (typeof value === 'bigint') {
      return value;
    }
    return BigInt(value);
  }
}
