/**
 * Database access layer for authentication operations
 */

import mssql, { ConnectionPool, Request } from 'mssql';
import {
  AuthUserRecord,
  RefreshTokenRecord,
  AuthenticationMethod,
  OAuth2ProviderConfig,
  OAuth2TokenRecord,
  UserPermissionRecord,
  PermissionRecord,
  ApiKeyRecord,
  AuthSession,
} from './types';

export class AuthDatabase {
  constructor(private pool: ConnectionPool) {}

  /**
   * Get user by email
   */
  async getUserByEmail(email: string, tenantId: number): Promise<AuthUserRecord | null> {
    try {
      const result = await this.pool
        .request()
        .input('email', mssql.NVarChar(120), email)
        .input('tenantId', mssql.Int, tenantId)
        .query(`
          SELECT Id, Email, PasswordHash, TenantId, IsActive, IsSuperAdmin
          FROM dbo.Users
          WHERE Email = @email AND TenantId = @tenantId
        `);

      return result.recordset[0] || null;
    } catch (error) {
      throw new Error(`Failed to get user by email: ${(error as Error).message}`);
    }
  }

  /**
   * Create a new user
   */
  async createUser(email: string, passwordHash: string, tenantId: number): Promise<AuthUserRecord> {
    try {
      const result = await this.pool
        .request()
        .input('email', mssql.NVarChar(120), email)
        .input('passwordHash', mssql.NVarChar(255), passwordHash)
        .input('tenantId', mssql.Int, tenantId)
        .query(`
          INSERT INTO dbo.Users (TenantId, Email, PasswordHash, IsSuperAdmin, IsActive, CreatedAt, UpdatedAt)
          OUTPUT INSERTED.Id, INSERTED.Email, INSERTED.PasswordHash, INSERTED.TenantId, INSERTED.IsActive, INSERTED.IsSuperAdmin
          VALUES (@tenantId, @email, @passwordHash, 0, 1, SYSUTCDATETIME(), SYSUTCDATETIME())
        `);

      return result.recordset[0] as AuthUserRecord;
    } catch (error) {
      throw new Error(`Failed to create user: ${(error as Error).message}`);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<AuthUserRecord | null> {
    try {
      const result = await this.pool
        .request()
        .input('userId', mssql.Int, userId)
        .query(`
          SELECT Id, Email, PasswordHash, TenantId, IsActive, IsSuperAdmin
          FROM dbo.Users
          WHERE Id = @userId
        `);

      return result.recordset[0] || null;
    } catch (error) {
      throw new Error(`Failed to get user by ID: ${(error as Error).message}`);
    }
  }

  /**
   * Store refresh token
   */
  async storeRefreshToken(
    userId: number,
    tokenHash: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
    deviceId?: string
  ): Promise<bigint> {
    try {
      const result = await this.pool
        .request()
        .input('userId', mssql.Int, userId)
        .input('tokenHash', mssql.NVarChar(255), tokenHash)
        .input('expiresAt', mssql.DateTime2(3), expiresAt)
        .input('ipAddress', mssql.NVarChar(50), ipAddress || null)
        .input('userAgent', mssql.NVarChar(250), userAgent || null)
        .input('deviceId', mssql.NVarChar(100), deviceId || null)
        .query(`
          INSERT INTO dbo.RefreshTokens (UserId, TokenHash, ExpiresAt, IpAddress, UserAgent, DeviceId, IsRevoked)
          VALUES (@userId, @tokenHash, @expiresAt, @ipAddress, @userAgent, @deviceId, 0)
          SELECT @@IDENTITY as RefreshTokenId
        `);

      return BigInt(result.recordset[0]?.RefreshTokenId || 0);
    } catch (error) {
      throw new Error(`Failed to store refresh token: ${(error as Error).message}`);
    }
  }

  /**
   * Get refresh token by hash
   */
  async getRefreshTokenByHash(tokenHash: string): Promise<RefreshTokenRecord | null> {
    try {
      const result = await this.pool
        .request()
        .input('tokenHash', mssql.NVarChar(255), tokenHash)
        .query(`
          SELECT RefreshTokenId, UserId, TokenHash, ExpiresAt, IsRevoked, RevokedAt, IpAddress, UserAgent, DeviceId
          FROM dbo.RefreshTokens
          WHERE TokenHash = @tokenHash
        `);

      return result.recordset[0] || null;
    } catch (error) {
      throw new Error(`Failed to get refresh token: ${(error as Error).message}`);
    }
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(tokenId: bigint): Promise<void> {
    try {
      await this.pool
        .request()
        .input('tokenId', mssql.BigInt, tokenId.toString())
        .query(`
          UPDATE dbo.RefreshTokens
          SET IsRevoked = 1, RevokedAt = SYSUTCDATETIME()
          WHERE RefreshTokenId = @tokenId
        `);
    } catch (error) {
      throw new Error(`Failed to revoke refresh token: ${(error as Error).message}`);
    }
  }

  /**
   * Create user session
   */
  async createSession(
    userId: number,
    sessionHash: string,
    expiresAt: Date,
    deviceId?: string,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<bigint> {
    try {
      const result = await this.pool
        .request()
        .input('userId', mssql.Int, userId)
        .input('sessionHash', mssql.NVarChar(255), sessionHash)
        .input('expiresAt', mssql.DateTime2(3), expiresAt)
        .input('deviceId', mssql.NVarChar(100), deviceId || null)
        .input('deviceInfo', mssql.NVarChar(500), deviceInfo || null)
        .input('ipAddress', mssql.NVarChar(50), ipAddress || null)
        .input('userAgent', mssql.NVarChar(250), userAgent || null)
        .query(`
          INSERT INTO dbo.UserSessions (UserId, SessionHash, ExpiresAt, DeviceId, DeviceInfo, IpAddress, UserAgent, IsActive, LastActivityAt)
          VALUES (@userId, @sessionHash, @expiresAt, @deviceId, @deviceInfo, @ipAddress, @userAgent, 1, SYSUTCDATETIME())
          SELECT @@IDENTITY as SessionId
        `);

      return BigInt(result.recordset[0]?.SessionId || 0);
    } catch (error) {
      throw new Error(`Failed to create session: ${(error as Error).message}`);
    }
  }

  /**
   * Terminate session
   */
  async terminateSession(sessionId: bigint): Promise<void> {
    try {
      await this.pool
        .request()
        .input('sessionId', mssql.BigInt, sessionId.toString())
        .query(`
          UPDATE dbo.UserSessions
          SET IsActive = 0, TerminatedAt = SYSUTCDATETIME()
          WHERE SessionId = @sessionId
        `);
    } catch (error) {
      throw new Error(`Failed to terminate session: ${(error as Error).message}`);
    }
  }

  /**
   * Store OAuth2 token
   */
  async storeOAuth2Token(
    userId: number,
    providerId: number,
    accessTokenHash: string,
    accessTokenExpiresAt: Date,
    providerUserId: string,
    refreshTokenHash?: string,
    refreshTokenExpiresAt?: Date,
    scope?: string
  ): Promise<void> {
    try {
      await this.pool
        .request()
        .input('userId', mssql.Int, userId)
        .input('providerId', mssql.Int, providerId)
        .input('accessTokenHash', mssql.NVarChar(255), accessTokenHash)
        .input('accessTokenExpiresAt', mssql.DateTime2(3), accessTokenExpiresAt)
        .input('providerUserId', mssql.NVarChar(255), providerUserId)
        .input('refreshTokenHash', mssql.NVarChar(255), refreshTokenHash || null)
        .input('refreshTokenExpiresAt', mssql.DateTime2(3), refreshTokenExpiresAt || null)
        .input('scope', mssql.NVarChar(500), scope || null)
        .query(`
          INSERT INTO dbo.OAuth2Tokens (UserId, ProviderId, AccessTokenHash, RefreshTokenHash, AccessTokenExpiresAt, RefreshTokenExpiresAt, ProviderUserId, Scope, IsRevoked)
          VALUES (@userId, @providerId, @accessTokenHash, @refreshTokenHash, @accessTokenExpiresAt, @refreshTokenExpiresAt, @providerUserId, @scope, 0)
        `);
    } catch (error) {
      throw new Error(`Failed to store OAuth2 token: ${(error as Error).message}`);
    }
  }

  /**
   * Get OAuth2 provider config
   */
  async getOAuth2Provider(tenantId: number, providerName: string): Promise<OAuth2ProviderConfig | null> {
    try {
      const result = await this.pool
        .request()
        .input('tenantId', mssql.Int, tenantId)
        .input('providerName', mssql.NVarChar(50), providerName)
        .query(`
          SELECT ProviderId, TenantId, ProviderName, ClientId, ClientSecret, AuthorizationUrl, TokenUrl, UserInfoUrl, RedirectUrl, Scope, IsEnabled
          FROM dbo.OAuth2Providers
          WHERE TenantId = @tenantId AND ProviderName = @providerName AND IsEnabled = 1
        `);

      return result.recordset[0] || null;
    } catch (error) {
      throw new Error(`Failed to get OAuth2 provider: ${(error as Error).message}`);
    }
  }

  /**
   * Check user permission
   */
  async hasPermission(userId: number, permissionCode: string, tenantId: number): Promise<boolean> {
    try {
      const result = await this.pool
        .request()
        .input('userId', mssql.Int, userId)
        .input('permissionCode', mssql.NVarChar(100), permissionCode)
        .input('tenantId', mssql.Int, tenantId)
        .query(`
          SELECT COUNT(*) as Count
          FROM dbo.UserPermissions up
          INNER JOIN dbo.Permissions p ON up.PermissionId = p.PermissionId
          WHERE up.UserId = @userId
            AND p.PermissionCode = @permissionCode
            AND p.TenantId = @tenantId
            AND p.IsActive = 1
            AND (up.ExpiresAt IS NULL OR up.ExpiresAt > SYSUTCDATETIME())
        `);

      return result.recordset[0]?.Count > 0;
    } catch (error) {
      throw new Error(`Failed to check permission: ${(error as Error).message}`);
    }
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: number, tenantId: number): Promise<string[]> {
    try {
      const result = await this.pool
        .request()
        .input('userId', mssql.Int, userId)
        .input('tenantId', mssql.Int, tenantId)
        .query(`
          SELECT p.PermissionCode
          FROM dbo.UserPermissions up
          INNER JOIN dbo.Permissions p ON up.PermissionId = p.PermissionId
          WHERE up.UserId = @userId
            AND p.TenantId = @tenantId
            AND p.IsActive = 1
            AND (up.ExpiresAt IS NULL OR up.ExpiresAt > SYSUTCDATETIME())
        `);

      return result.recordset.map(r => r.PermissionCode);
    } catch (error) {
      throw new Error(`Failed to get user permissions: ${(error as Error).message}`);
    }
  }

  /**
   * Verify API key
   */
  async verifyApiKey(keyHash: string, tenantId: number): Promise<ApiKeyRecord | null> {
    try {
      const result = await this.pool
        .request()
        .input('keyHash', mssql.NVarChar(255), keyHash)
        .input('tenantId', mssql.Int, tenantId)
        .query(`
          SELECT ApiKeyId, TenantId, UserId, KeyName, KeyHash, KeyPrefix, Scope, IsActive, LastUsedAt, RateLimit, ExpiresAt, RevokedAt
          FROM dbo.ApiKeys
          WHERE KeyHash = @keyHash
            AND TenantId = @tenantId
            AND IsActive = 1
            AND (ExpiresAt IS NULL OR ExpiresAt > SYSUTCDATETIME())
            AND RevokedAt IS NULL
        `);

      if (result.recordset[0]) {
        // Update last used timestamp
        await this.pool
          .request()
          .input('keyHash', mssql.NVarChar(255), keyHash)
          .query(`
            UPDATE dbo.ApiKeys SET LastUsedAt = SYSUTCDATETIME() WHERE KeyHash = @keyHash
          `);
      }

      return result.recordset[0] || null;
    } catch (error) {
      throw new Error(`Failed to verify API key: ${(error as Error).message}`);
    }
  }

  /**
   * Create API key
   */
  async createApiKey(
    tenantId: number,
    userId: number,
    keyName: string,
    keyHash: string,
    keyPrefix: string,
    scope?: string,
    rateLimit?: number,
    expiresAt?: Date
  ): Promise<bigint> {
    try {
      const result = await this.pool
        .request()
        .input('tenantId', mssql.Int, tenantId)
        .input('userId', mssql.Int, userId)
        .input('keyName', mssql.NVarChar(150), keyName)
        .input('keyHash', mssql.NVarChar(255), keyHash)
        .input('keyPrefix', mssql.NVarChar(20), keyPrefix)
        .input('scope', mssql.NVarChar(500), scope || null)
        .input('rateLimit', mssql.Int, rateLimit || null)
        .input('expiresAt', mssql.DateTime2(3), expiresAt || null)
        .query(`
          INSERT INTO dbo.ApiKeys (TenantId, UserId, KeyName, KeyHash, KeyPrefix, Scope, IsActive, RateLimit, ExpiresAt)
          VALUES (@tenantId, @userId, @keyName, @keyHash, @keyPrefix, @scope, 1, @rateLimit, @expiresAt)
          SELECT @@IDENTITY as ApiKeyId
        `);

      return BigInt(result.recordset[0]?.ApiKeyId || 0);
    } catch (error) {
      throw new Error(`Failed to create API key: ${(error as Error).message}`);
    }
  }

  /**
   * Record login in audit log
   */
  async recordLogin(userId: number, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      const user = await this.getUserById(userId);
      if (!user) return;

      await this.pool
        .request()
        .input('userId', mssql.Int, userId)
        .input('loginTime', mssql.DateTime2(3), new Date())
        .input('ipAddress', mssql.NVarChar(50), ipAddress || null)
        .input('userAgent', mssql.NVarChar(250), userAgent || null)
        .query(`
          INSERT INTO dbo.LoginHistory (UserId, LoginTime, IpAddress, UserAgent)
          VALUES (@userId, @loginTime, @ipAddress, @userAgent)
        `);
    } catch (error) {
      // Log but don't fail on login history recording
      console.error('Failed to record login:', (error as Error).message);
    }
  }
}
