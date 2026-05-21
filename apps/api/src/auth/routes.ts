/**
 * Authentication Routes & Controllers
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AuthenticationService } from './authentication.service';
import { OAuth2Service } from './oauth2.service';
import { AuthorizationService } from './authorization.service';
import { AuthDatabase } from './database';
import { authMiddleware, requirePermission } from './middleware';
import { CryptoUtil } from './crypto.util';
import { JwtUtil } from './jwt.util';

export function createAuthRoutes(
  db: AuthDatabase,
  authService: AuthenticationService,
  oauth2Service: OAuth2Service,
  authzService: AuthorizationService
): Router {
  const router = Router();

  /**
   * POST /auth/login
   * Login with email and password
   */
  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, rememberMe, deviceId, deviceInfo } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required',
          code: 'MISSING_FIELDS',
        });
      }

      const result = await authService.login({
        email,
        password,
        rememberMe,
        deviceId,
        deviceInfo,
      });

      res.json(result);
    } catch (error) {
      res.status(401).json({
        error: (error as Error).message,
        code: 'LOGIN_FAILED',
      });
    }
  });

  /**
   * POST /auth/register
   * Register new user
   */
  router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, confirmPassword, tenantId } = req.body;

      if (!email || !password || !confirmPassword) {
        return res.status(400).json({
          error: 'Email, password, and confirm password are required',
          code: 'MISSING_FIELDS',
        });
      }

      const result = await authService.register({
        email,
        password,
        confirmPassword,
        tenantId,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        error: (error as Error).message,
        code: 'REGISTRATION_FAILED',
      });
    }
  });

  /**
   * POST /auth/refresh
   * Refresh access token
   */
  router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token is required',
          code: 'MISSING_TOKEN',
        });
      }

      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      res.status(401).json({
        error: (error as Error).message,
        code: 'REFRESH_FAILED',
      });
    }
  });

  /**
   * POST /auth/logout
   * Logout and revoke tokens
   */
  router.post('/logout', authMiddleware(db), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          error: 'Refresh token is required',
          code: 'MISSING_TOKEN',
        });
      }

      await authService.logout(refreshToken, req.auth?.sessionId);
      res.json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(400).json({
        error: (error as Error).message,
        code: 'LOGOUT_FAILED',
      });
    }
  });

  /**
   * POST /auth/change-password
   * Change user password
   */
  router.post('/change-password', authMiddleware(db), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;

      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          error: 'All password fields are required',
          code: 'MISSING_FIELDS',
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          error: 'Passwords do not match',
          code: 'MISMATCH_PASSWORD',
        });
      }

      await authService.changePassword(req.auth!.userId, oldPassword, newPassword);
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(400).json({
        error: (error as Error).message,
        code: 'CHANGE_PASSWORD_FAILED',
      });
    }
  });

  /**
   * POST /auth/oauth2/authorize/:provider
   * Get OAuth2 authorization URL
   */
  router.post('/oauth2/authorize/:provider', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { provider } = req.params;
      const { redirectUri, state } = req.body;

      if (!redirectUri || !state) {
        return res.status(400).json({
          error: 'redirectUri and state are required',
          code: 'MISSING_FIELDS',
        });
      }

      const authUrl = oauth2Service.generateAuthorizationUrl(provider, 1, redirectUri, state);
      res.json({ authorizationUrl: authUrl });
    } catch (error) {
      res.status(400).json({
        error: (error as Error).message,
        code: 'OAUTH2_FAILED',
      });
    }
  });

  /**
   * POST /auth/oauth2/callback/:provider
   * Handle OAuth2 callback
   */
  router.post('/oauth2/callback/:provider', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { provider } = req.params;
      const { code, redirectUri } = req.body;

      if (!code || !redirectUri) {
        return res.status(400).json({
          error: 'Code and redirectUri are required',
          code: 'MISSING_FIELDS',
        });
      }

      const tokenPair = await oauth2Service.handleCallback(
        { provider: provider as any, code, redirectUri },
        1 // tenantId
      );

      res.json(tokenPair);
    } catch (error) {
      res.status(400).json({
        error: (error as Error).message,
        code: 'OAUTH2_CALLBACK_FAILED',
      });
    }
  });

  /**
   * POST /auth/api-keys
   * Create new API key
   */
  router.post('/api-keys', authMiddleware(db), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { keyName, scope, rateLimit, expiresAt } = req.body;

      if (!keyName) {
        return res.status(400).json({
          error: 'keyName is required',
          code: 'MISSING_FIELDS',
        });
      }

      const { key, prefix, hash } = CryptoUtil.generateApiKey('sk');

      const apiKeyId = await db.createApiKey(
        req.auth!.tenantId,
        req.auth!.userId,
        keyName,
        hash,
        prefix,
        scope,
        rateLimit,
        expiresAt ? new Date(expiresAt) : undefined
      );

      res.status(201).json({
        apiKeyId,
        key, // Only shown once at creation
        prefix,
        keyName,
        scope,
        rateLimit,
        expiresAt,
      });
    } catch (error) {
      res.status(400).json({
        error: (error as Error).message,
        code: 'API_KEY_CREATION_FAILED',
      });
    }
  });

  /**
   * GET /auth/me
   * Get current user info
   */
  router.get('/me', authMiddleware(db), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await db.getUserById(req.auth!.userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found',
          code: 'USER_NOT_FOUND',
        });
      }

      res.json({
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
        isSuperAdmin: user.isSuperAdmin,
        isActive: user.isActive,
        permissions: req.auth!.permissions,
      });
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
        code: 'FETCH_USER_FAILED',
      });
    }
  });

  /**
   * GET /auth/permissions
   * Get all permissions for current user
   */
  router.get('/permissions', authMiddleware(db), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const permissions = await authzService.getUserPermissions(req.auth!.userId, req.auth!.tenantId);

      res.json({
        permissions,
        count: permissions.length,
      });
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
        code: 'FETCH_PERMISSIONS_FAILED',
      });
    }
  });

  /**
   * GET /auth/validate
   * Validate current token
   */
  router.get('/validate', authMiddleware(db), (req: Request, res: Response) => {
    res.json({
      valid: true,
      user: {
        id: req.auth!.userId,
        email: req.auth!.email,
        tenantId: req.auth!.tenantId,
      },
      permissions: req.auth!.permissions,
    });
  });

  return router;
}
