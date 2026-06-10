/**
 * Authentication & Authorization Types
 */

export interface JwtPayload {
  userId: number;
  email: string;
  tenantId: number;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthSession {
  sessionId: bigint;
  userId: number;
  sessionToken: string;
  expiresAt: Date;
  deviceId?: string;
  deviceInfo?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface RefreshTokenRecord {
  refreshTokenId: bigint;
  userId: number;
  tokenHash: string;
  expiresAt: Date;
  isRevoked: boolean;
  revokedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

export interface AuthUserRecord {
  id: number;
  email: string;
  passwordHash: string;
  tenantId: number;
  isActive: boolean;
  isSuperAdmin: boolean;
}

export interface AuthenticationMethod {
  authMethodId: number;
  userId: number;
  methodType: 'email_password' | 'oauth2_google' | 'oauth2_facebook' | 'oauth2_microsoft' | 'totp' | 'webauthn';
  isEnabled: boolean;
  isPrimary: boolean;
  configuration?: Record<string, any>;
  lastUsedAt?: Date;
}

export interface OAuth2ProviderConfig {
  providerId: number;
  tenantId: number;
  providerName: 'google' | 'facebook' | 'microsoft';
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  redirectUrl: string;
  scope: string;
  isEnabled: boolean;
}

export interface OAuth2TokenRecord {
  oauth2TokenId: bigint;
  userId: number;
  providerId: number;
  accessTokenHash: string;
  refreshTokenHash?: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt?: Date;
  tokenType?: string;
  scope?: string;
  providerUserId: string;
  isRevoked: boolean;
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

export interface UserPermissionRecord {
  userPermissionId: bigint;
  userId: number;
  permissionId: number;
  grantedBy?: number;
  grantedAt: Date;
  expiresAt?: Date;
}

export interface ApiKeyRecord {
  apiKeyId: bigint;
  tenantId: number;
  userId: number;
  keyName: string;
  keyHash: string;
  keyPrefix: string;
  scope?: string;
  isActive: boolean;
  lastUsedAt?: Date;
  rateLimit?: number;
  expiresAt?: Date;
  revokedAt?: Date;
}

export interface LoginRequest {
  email: string;
  password: string;
  tenantId?: number;
  rememberMe?: boolean;
  deviceId?: string;
  deviceInfo?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  tenantId?: number;
  deviceId?: string;
  deviceInfo?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    email: string;
    tenantId: number;
  };
}

export interface OAuth2AuthRequest {
  provider: 'google' | 'facebook' | 'microsoft';
  code: string;
  redirectUri: string;
}

export interface OAuth2UserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

export interface AuthContext {
  userId: number;
  email: string;
  tenantId: number;
  permissions: string[];
  roles: string[];
  sessionId?: bigint;
}

export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
  expiresAt?: Date;
}
