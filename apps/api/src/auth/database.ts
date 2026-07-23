/**
 * Database access layer for permission lookups
 *
 * User management, password hashing, token generation, and session handling
 * are all handled by the .NET Backend. This module only queries permissions
 * and user info needed by the Node.js API's middleware.
 */

import mssql, { ConnectionPool } from 'mssql';
import { PermissionRecord } from './types';

export class AuthDatabase {
  constructor(private pool: ConnectionPool) {}

  /**
   * Get basic user info by ID
   */
  async getUserById(userId: number): Promise<{ id: number; email: string; tenantId: number; isActive: boolean; isSuperAdmin: boolean } | null> {
    try {
      const result = await this.pool
        .request()
        .input('userId', mssql.Int, userId)
        .query(`
          SELECT Id, Email, TenantId, IsActive, IsSuperAdmin
          FROM [Identity].[Users]
          WHERE Id = @userId AND IsDeleted = 0
        `);

      return result.recordset[0] || null;
    } catch (error) {
      throw new Error(`Failed to get user by ID: ${(error as Error).message}`);
    }
  }

  /**
   * Get all permission codes for a user
   */
  async getUserPermissions(userId: number, tenantId: number): Promise<string[]> {
    try {
      const result = await this.pool
        .request()
        .input('userId', mssql.Int, userId)
        .input('tenantId', mssql.Int, tenantId)
        .query(`
          SELECT p.PermissionCode
          FROM [Identity].[UserPermissions] up
          INNER JOIN [Identity].[Permissions] p ON up.PermissionId = p.PermissionId
          WHERE up.UserId = @userId
            AND p.TenantId = @tenantId
            AND p.IsActive = 1
            AND (up.ExpiresAt IS NULL OR up.ExpiresAt > SYSUTCDATETIME())
        `);

      return result.recordset.map((r: any) => r.PermissionCode);
    } catch (error) {
      throw new Error(`Failed to get user permissions: ${(error as Error).message}`);
    }
  }

  /**
   * Check if user has a specific permission
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
          FROM [Identity].[UserPermissions] up
          INNER JOIN [Identity].[Permissions] p ON up.PermissionId = p.PermissionId
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
   * Get user roles
   */
  async getUserRoles(userId: number, tenantId: number): Promise<string[]> {
    try {
      const result = await this.pool
        .request()
        .input('userId', mssql.Int, userId)
        .input('tenantId', mssql.Int, tenantId)
        .query(`
          SELECT r.RoleName
          FROM [Identity].[UserRoles] ur
          INNER JOIN [Identity].[Roles] r ON ur.RoleId = r.RoleId AND r.TenantId = ur.TenantId
          WHERE ur.UserId = @userId AND ur.TenantId = @tenantId
        `);

      return result.recordset.map((r: any) => r.RoleName);
    } catch (error) {
      throw new Error(`Failed to get user roles: ${(error as Error).message}`);
    }
  }
}
