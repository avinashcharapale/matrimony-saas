/**
 * Geographic Routes — /api/geo
 * All routes are public (no auth required for lookups).
 */
import { Router, Request, Response, NextFunction } from 'express';
import { ConnectionPool } from 'mssql';
import { GeoService } from './geo.service';

export function createGeoRoutes(pool: ConnectionPool): Router {
  const router = Router();
  const geo = new GeoService(pool);

  const handle = (fn: (req: Request, res: Response) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
      fn(req, res).catch(next);

  // GET /api/geo/countries
  router.get(
    '/countries',
    handle(async (_req, res) => {
      const data = await geo.getCountries();
      res.json(data);
    })
  );

  // GET /api/geo/states?countryId=1
  router.get(
    '/states',
    handle(async (req, res) => {
      const countryId = req.query.countryId ? parseInt(req.query.countryId as string, 10) : undefined;
      const data = await geo.getStates(countryId);
      res.json(data);
    })
  );

  // GET /api/geo/districts?stateId=1
  router.get(
    '/districts',
    handle(async (req, res) => {
      const stateId = parseInt(req.query.stateId as string, 10);
      if (isNaN(stateId)) {
        res.status(400).json({ error: 'stateId query parameter is required' });
        return;
      }
      const data = await geo.getDistricts(stateId);
      res.json(data);
    })
  );

  // GET /api/geo/talukas?districtId=1
  router.get(
    '/talukas',
    handle(async (req, res) => {
      const districtId = parseInt(req.query.districtId as string, 10);
      if (isNaN(districtId)) {
        res.status(400).json({ error: 'districtId query parameter is required' });
        return;
      }
      const data = await geo.getTalukas(districtId);
      res.json(data);
    })
  );

  return router;
}
