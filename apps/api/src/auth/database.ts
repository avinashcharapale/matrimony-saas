/**
 * Auth API client — calls .NET Backend via Gateway for user/permission/role lookups.
 *
 * All SQL queries live in the .NET Backend (Identity service).
 * This module only makes HTTP calls through the YARP API Gateway.
 *
 * Gateway routing:  /identity/{**}  →  Identity service /api/{**}
 */

export class AuthDatabase {
  private readonly gatewayUrl: string;

  constructor(gatewayUrl: string) {
    this.gatewayUrl = gatewayUrl.replace(/\/+$/, '');
  }

  /**
   * Get basic user info by ID
   */
  async getUserById(userId: number): Promise<{ id: number; email: string; tenantId: number; isActive: boolean } | null> {
    try {
      const res = await fetch(`${this.gatewayUrl}/identity/Users/${userId}/basic-info`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  /**
   * Get all permission codes for a user
   */
  async getUserPermissions(userId: number, tenantId: number): Promise<string[]> {
    try {
      const res = await fetch(`${this.gatewayUrl}/identity/Users/${userId}/permissions?tenantId=${tenantId}`);
      if (!res.ok) return [];
      const data: { permissionCode: string }[] = await res.json();
      return data.map(p => p.permissionCode);
    } catch {
      return [];
    }
  }

  /**
   * Check if user has a specific permission
   */
  async hasPermission(userId: number, permissionCode: string, tenantId: number): Promise<boolean> {
    const permissions = await this.getUserPermissions(userId, tenantId);
    return permissions.includes(permissionCode);
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: number, tenantId: number): Promise<string[]> {
    try {
      const res = await fetch(`${this.gatewayUrl}/identity/Users/${userId}/roles?tenantId=${tenantId}`);
      if (!res.ok) return [];
      const data: { roleName: string }[] = await res.json();
      return data.map(r => r.roleName);
    } catch {
      return [];
    }
  }
}
