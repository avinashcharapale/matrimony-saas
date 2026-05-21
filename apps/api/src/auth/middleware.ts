/**
 * Authentication & Authorization Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from './jwt.util';
import { CryptoUtil } from './crypto.util';
import { AuthDatabase } from './database';
import { AuthContext } from './types';

// Extend Express Request to include auth context
declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      authError?: string;
    }
  }
}

/**
 * JWT Authentication Middleware
 * Validates JWT token from Authorization header
 */
export function authMiddleware(db: AuthDatabase) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = JwtUtil.extractTokenFromHeader(authHeader);

      if (!token) {
        return res.status(401).json({
          error: 'Missing or invalid Authorization header',
          code: 'NO_TOKEN',
        });
      }

      // Verify token
      const payload = JwtUtil.verifyAccessToken(token);

      // Get user permissions
      const permissions = await db.getUserPermissions(payload.userId, payload.tenantId);

      // Set auth context
      req.auth = {
        userId: payload.userId,
        email: payload.email,
        tenantId: payload.tenantId,
        permissions,
        roles: [], // TODO: implement role loading
      };

      next();
    } catch (error) {
      return res.status(401).json({
        error: `Authentication failed: ${(error as Error).message}`,
        code: 'AUTH_FAILED',
      });
    }
  };
}

/**
 * API Key Authentication Middleware
 * Validates API key from X-API-Key header
 */
export function apiKeyMiddleware(db: AuthDatabase) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiKey = req.headers['x-api-key'] as string;

      if (!apiKey) {
        return res.status(401).json({
          error: 'Missing X-API-Key header',
          code: 'NO_API_KEY',
        });
      }

      // Verify API key
      const keyHash = CryptoUtil.hashToken(apiKey);
      // TODO: Get tenantId from context
      const keyRecord = await db.verifyApiKey(keyHash, 1);

      if (!keyRecord) {
        return res.status(401).json({
          error: 'Invalid or revoked API key',
          code: 'INVALID_API_KEY',
        });
      }

      // Get user permissions
      const user = await db.getUserById(keyRecord.userId);
      if (!user) {
        return res.status(401).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      const permissions = keyRecord.scope ? keyRecord.scope.split(',') : [];

      // Set auth context
      req.auth = {
        userId: keyRecord.userId,
        email: user.email,
        tenantId: keyRecord.tenantId,
        permissions,
        roles: [],
      };

      next();
    } catch (error) {
      return res.status(401).json({
        error: `API key validation failed: ${(error as Error).message}`,
        code: 'API_KEY_FAILED',
      });
    }
  };
}

/**
 * Optional Authentication Middleware
 * Authenticates if token is present, but doesn't fail if missing
 */
export function optionalAuthMiddleware(db: AuthDatabase) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = JwtUtil.extractTokenFromHeader(authHeader);

      if (token) {
        const payload = JwtUtil.verifyAccessToken(token);
        const permissions = await db.getUserPermissions(payload.userId, payload.tenantId);

        req.auth = {
          userId: payload.userId,
          email: payload.email,
          tenantId: payload.tenantId,
          permissions,
          roles: [],
        };
      }

      next();
    } catch (error) {
      // Log but don't fail authentication
      req.authError = (error as Error).message;
      next();
    }
  };
}

/**
 * Permission Check Middleware
 * Verifies user has specific permission
 */
export function requirePermission(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'NO_AUTH',
      });
    }

    const hasPermission = requiredPermissions.some(perm => req.auth!.permissions.includes(perm));

    if (!hasPermission) {
      return res.status(403).json({
        error: `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
        code: 'INSUFFICIENT_PERMISSIONS',
        required: requiredPermissions,
        have: req.auth.permissions,
      });
    }

    next();
  };
}

/**
 * Tenant Access Middleware
 * Verifies user has access to tenant
 */
export function requireTenantAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.auth) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'NO_AUTH',
    });
  }

  const tenantId = req.params.tenantId ? parseInt(req.params.tenantId, 10) : req.auth.tenantId;

  if (req.auth.tenantId !== tenantId) {
    return res.status(403).json({
      error: 'Access denied to this tenant',
      code: 'FORBIDDEN_TENANT',
    });
  }

  next();
}

/**
 * Rate Limiting Middleware (basic implementation)
 * Limits requests per IP or API key
 */
export function rateLimitMiddleware(maxRequests: number = 100, windowMs: number = 60000) {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const identifier = req.auth?.userId?.toString() || req.ip || 'unknown';
    const now = Date.now();

    let entry = requests.get(identifier);

    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowMs };
      requests.set(identifier, entry);
    }

    entry.count++;

    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - entry.count)));
    res.set('X-RateLimit-Reset', String(entry.resetAt));

    if (entry.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      });
    }

    next();
  };
}

/**
 * CORS & Security Headers Middleware
 */
export function securityMiddleware(req: Request, res: Response, next: NextFunction) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Tenant-Id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
}

/**
 * Error Handler Middleware
 */
export function errorHandlerMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
