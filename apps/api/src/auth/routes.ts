/**
 * Auth Routes — minimal
 *
 * All login/register/refresh/logout is handled by the .NET Backend.
 * The Angular apps call /identity/Auth/* directly.
 * The Node.js API only validates tokens via authMiddleware on protected routes.
 */

import { Router, Request, Response } from 'express';

export function createAuthRoutes(): Router {
  const router = Router();

  /**
   * GET /api/auth/health
   * Simple health check for the auth module
   */
  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'Auth module healthy — delegates to .NET Backend' });
  });

  /**
   * GET /api/auth/me
   * Returns the authenticated user's context (populated by authMiddleware upstream)
   */
  router.get('/me', (req: Request, res: Response) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'Not authenticated', code: 'NO_AUTH' });
    }

    res.json({
      userId: req.auth.userId,
      email: req.auth.email,
      tenantId: req.auth.tenantId,
      permissions: req.auth.permissions,
      roles: req.auth.roles,
    });
  });

  return router;
}
