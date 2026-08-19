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
