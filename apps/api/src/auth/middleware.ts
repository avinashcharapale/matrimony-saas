/**
 * Authentication & Authorization Middleware
 *
 * Validates .NET Backend JWT tokens and attaches user context to req.auth.
 * Password checking is NOT done here — it's handled by the .NET Backend.
 */

import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from './jwt.util';
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
 * Resolve tenantId from request headers, body, or query params.
 * Used by pre-authentication routes where req.auth is not yet available.
 * Priority: body > header > query > default (1)
 */
export function resolveTenantId(req: Request): number {
  const bodyId = Number((req.body as Record<string, unknown>)?.tenantId);
  if (Number.isFinite(bodyId) && bodyId > 0) return bodyId;

  const headerId = Number(req.header('x-tenant-id'));
  if (Number.isFinite(headerId) && headerId > 0) return headerId;

  const queryId = Number(req.query?.tenantId);
  if (Number.isFinite(queryId) && queryId > 0) return queryId;

  return 1;
}

/**
 * JWT Authentication Middleware
 * Verifies .NET Backend JWT token from Authorization header
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

      // Verify .NET JWT token
      const verified = JwtUtil.verifyAccessToken(token);

      // Load permissions and roles from DB
      const [permissions, roles] = await Promise.all([
        db.getUserPermissions(verified.userId, verified.tenantId),
        db.getUserRoles(verified.userId, verified.tenantId),
      ]);

      // Set auth context
      req.auth = {
        userId: verified.userId,
        email: verified.email,
        tenantId: verified.tenantId,
        permissions,
        roles,
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
 * Optional Authentication Middleware
 * Authenticates if token is present, but doesn't fail if missing
 */
export function optionalAuthMiddleware(db: AuthDatabase) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const token = JwtUtil.extractTokenFromHeader(authHeader);

      if (token) {
        const verified = JwtUtil.verifyAccessToken(token);
        const [permissions, roles] = await Promise.all([
          db.getUserPermissions(verified.userId, verified.tenantId),
          db.getUserRoles(verified.userId, verified.tenantId),
        ]);

        req.auth = {
          userId: verified.userId,
          email: verified.email,
          tenantId: verified.tenantId,
          permissions,
          roles,
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
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

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
export function errorHandlerMiddleware(err: any, req: Request, res: Response, _next: NextFunction) {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    code: err.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
