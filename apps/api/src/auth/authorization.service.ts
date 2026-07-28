/**
 * Authorization Service
 * Handles permission checking, role-based access control
 */

import { AuthDatabase } from './database';
import { PermissionCheckResult } from './types';

export class AuthorizationService {
  private db: AuthDatabase;
  private permissionCache = new Map<string, { permissions: string[]; expiresAt: Date }>();

  constructor(db: AuthDatabase) {
    this.db = db;
  }

  /**
   * Check if user has permission
   */
  async hasPermission(userId: number, permissionCode: string, tenantId: number): Promise<PermissionCheckResult> {
    try {
      const hasPermission = await this.db.hasPermission(userId, permissionCode, tenantId);

      if (hasPermission) {
        return {
          hasPermission: true,
        };
      }

      return {
        hasPermission: false,
        reason: `User does not have ${permissionCode} permission`,
      };
    } catch (error) {
      return {
        hasPermission: false,
        reason: `Permission check failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Check if user has any of the provided permissions
   */
  async hasAnyPermission(
    userId: number,
    permissionCodes: string[],
    tenantId: number
  ): Promise<PermissionCheckResult> {
    try {
      for (const code of permissionCodes) {
        if (await this.db.hasPermission(userId, code, tenantId)) {
          return {
            hasPermission: true,
          };
        }
      }

      return {
        hasPermission: false,
        reason: `User does not have any of the required permissions: ${permissionCodes.join(', ')}`,
      };
    } catch (error) {
      return {
        hasPermission: false,
        reason: `Permission check failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Check if user has all provided permissions
   */
  async hasAllPermissions(
    userId: number,
    permissionCodes: string[],
    tenantId: number
  ): Promise<PermissionCheckResult> {
    try {
      for (const code of permissionCodes) {
        if (!(await this.db.hasPermission(userId, code, tenantId))) {
          return {
            hasPermission: false,
            reason: `User does not have ${code} permission`,
          };
        }
      }

      return {
        hasPermission: true,
      };
    } catch (error) {
      return {
        hasPermission: false,
        reason: `Permission check failed: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Get all user permissions (with caching)
   */
  async getUserPermissions(userId: number, tenantId: number, useCache = true): Promise<string[]> {
    const cacheKey = `${userId}-${tenantId}`;

    // Check cache
    if (useCache && this.permissionCache.has(cacheKey)) {
      const cached = this.permissionCache.get(cacheKey)!;
      if (cached.expiresAt > new Date()) {
        return cached.permissions;
      }
      this.permissionCache.delete(cacheKey);
    }

    try {
      const permissions = await this.db.getUserPermissions(userId, tenantId);

      // Cache for 5 minutes
      this.permissionCache.set(cacheKey, {
        permissions,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      return permissions;
    } catch (error) {
      console.error(`Failed to get user permissions: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Clear permission cache for user
   */
  clearUserPermissionCache(userId: number, tenantId: number): void {
    const cacheKey = `${userId}-${tenantId}`;
    this.permissionCache.delete(cacheKey);
  }

  /**
   * Clear all permission cache
   */
  clearAllPermissionCache(): void {
    this.permissionCache.clear();
  }

  /**
   * Check if user is owner of resource
   */
  isResourceOwner(userId: number, resourceOwnerId: number): boolean {
    return userId === resourceOwnerId;
  }

  /**
   * Can access tenant resource
   */
  async canAccessTenant(userId: number, tenantId: number): Promise<boolean> {
    try {
      const user = await this.db.getUserById(userId);
      if (!user) {
        return false;
      }

      // User can access their own tenant
      return user.tenantId === tenantId;
    } catch {
      return false;
    }
  }

  /**
   * Permission codes for common operations
   */
  static readonly PERMISSIONS = {
    // Profile permissions
    PROFILE_VIEW: 'PROFILE_VIEW',
    PROFILE_EDIT: 'PROFILE_EDIT',
    PROFILE_DELETE: 'PROFILE_DELETE',
    PROFILE_VERIFY: 'PROFILE_VERIFY',

    // User management
    USER_CREATE: 'USER_CREATE',
    USER_VIEW: 'USER_VIEW',
    USER_EDIT: 'USER_EDIT',
    USER_DELETE: 'USER_DELETE',
    USER_MANAGE_ROLES: 'USER_MANAGE_ROLES',

    // Messages
    MESSAGE_SEND: 'MESSAGE_SEND',
    MESSAGE_VIEW: 'MESSAGE_VIEW',

    // Interests
    INTEREST_SEND: 'INTEREST_SEND',
    INTEREST_VIEW: 'INTEREST_VIEW',

    // Admin
    ADMIN_VIEW_ANALYTICS: 'ADMIN_VIEW_ANALYTICS',
    ADMIN_MANAGE_PERMISSIONS: 'ADMIN_MANAGE_PERMISSIONS',
    ADMIN_MANAGE_SETTINGS: 'ADMIN_MANAGE_SETTINGS',
    ADMIN_VIEW_AUDIT_LOGS: 'ADMIN_VIEW_AUDIT_LOGS',
  };
}
