/**
 * Master Data Routes — /api/master
 *
 * Public:  GET  /api/master?category=education_area&lang=en
 * Admin:   POST /api/master  (requires auth)
 *          PUT  /api/master/:id/deactivate (requires auth)
 */
import { Router, Request, Response, NextFunction } from 'express';
import { ConnectionPool } from 'mssql';
import { MasterDataService } from './master.service';
import { authMiddleware, resolveTenantId } from '../auth/middleware';
import { AuthDatabase } from '../auth/database';

export function createMasterRoutes(pool: ConnectionPool, db: AuthDatabase): Router {
  const router = Router();
  const svc = new MasterDataService(pool);

  const handle = (fn: (req: Request, res: Response) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
      fn(req, res).catch(next);

  /**
   * GET /api/master
   * Query: category (required, comma-separated OK), lang (default 'en'), tenantId (default 0)
   */
  router.get(
    '/',
    handle(async (req, res) => {
      const categoryParam = req.query.category as string | undefined;
      if (!categoryParam) {
        res.status(400).json({ error: '"category" query parameter is required' });
        return;
      }
      const categories = categoryParam.split(',').map((c) => c.trim()).filter(Boolean);
      const lang = (req.query.lang as string) || 'en';
      const tenantId = resolveTenantId(req);

      const data = await svc.getOptions(categories, lang, tenantId);
      // If only one category, return the array directly for convenience
      if (categories.length === 1) {
        res.json(data[categories[0]] ?? []);
      } else {
        res.json(data);
      }
    })
  );

  /**
   * POST /api/master
   * Body: { category, valueCode, translations: { en: '...', mr: '...' }, sortOrder }
   */
  router.post(
    '/',
    authMiddleware(db),
    handle(async (req, res) => {
      const { category, valueCode, translations, sortOrder, tenantId } = req.body as {
        category?: string;
        valueCode?: string;
        translations?: Record<string, string>;
        sortOrder?: number;
        tenantId?: number;
      };

      if (!category || !valueCode || !translations || typeof translations !== 'object') {
        res.status(400).json({ error: 'category, valueCode and translations are required' });
        return;
      }

      const id = await svc.upsert(category, valueCode, translations, sortOrder ?? 0, tenantId ?? 0);
      res.status(201).json({ masterDataId: id });
    })
  );

  /**
   * PUT /api/master/:id/deactivate
   */
  router.put(
    '/:id/deactivate',
    authMiddleware(db),
    handle(async (req, res) => {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid id' });
        return;
      }
      await svc.deactivate(id);
      res.json({ success: true });
    })
  );

  return router;
}
