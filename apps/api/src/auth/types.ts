/**
 * Authentication & Authorization Types
 */

/** Auth context attached to req.auth after middleware runs */
export interface AuthContext {
  userId: number;
  email: string;
  tenantId: number;
  permissions: string[];
  roles: string[];
}

export interface PermissionRecord {
  permissionId: number;
  tenantId: number;
  permissionCode: string;
  displayName: string;
  description?: string;
  resourceType: string;
  action: string;
  isActive: boolean;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  expiresAt?: Date;
}
