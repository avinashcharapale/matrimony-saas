/**
 * Profile Routes & Controllers
 */

import { Router, Request, Response, NextFunction } from 'express';
import { ConnectionPool } from 'mssql';
import { ProfileService, ProfileSearchFilters } from './profile.service';
import { AuthDatabase } from '../auth/database';
import { authMiddleware } from '../auth/middleware';

export function createProfileRoutes(
  pool: ConnectionPool,
  db: AuthDatabase
): Router {
  const router = Router();
  const profileService = new ProfileService(pool, db);

  /**
   * GET /profiles
   * List all profiles with pagination
   */
  router.get('/', authMiddleware(db), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.auth?.tenantId || 1;
      const filters: ProfileSearchFilters = {
        name: req.query.name as string | undefined,
        location: req.query.location as string | undefined,
        occupation: req.query.occupation as string | undefined,
        ageMin: req.query.ageMin ? parseInt(req.query.ageMin as string) : undefined,
        ageMax: req.query.ageMax ? parseInt(req.query.ageMax as string) : undefined,
        religion: req.query.religion as string | undefined,
        caste: req.query.caste as string | undefined,
        education: req.query.education as string | undefined,
        maritalStatus: req.query.maritalStatus as string | undefined,
        pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber as string) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
      };

      const result = await profileService.searchProfiles(tenantId, filters);

      res.json({
        profiles: result.profiles,
        total: result.total,
        pageNumber: filters.pageNumber,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(result.total / (filters.pageSize || 10)),
      });
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
        code: 'PROFILE_LIST_FAILED',
      });
    }
  });

  /**
   * GET /profiles/search
   * Search profiles with advanced filters
   */
  router.get('/search', authMiddleware(db), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.auth?.tenantId || 1;
      const filters: ProfileSearchFilters = {
        name: req.query.name as string | undefined,
        location: req.query.location as string | undefined,
        occupation: req.query.occupation as string | undefined,
        ageMin: req.query.ageMin ? parseInt(req.query.ageMin as string) : undefined,
        ageMax: req.query.ageMax ? parseInt(req.query.ageMax as string) : undefined,
        religion: req.query.religion as string | undefined,
        caste: req.query.caste as string | undefined,
        education: req.query.education as string | undefined,
        maritalStatus: req.query.maritalStatus as string | undefined,
        pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber as string) : 1,
        pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 10,
      };

      const result = await profileService.searchProfiles(tenantId, filters);

      res.json({
        profiles: result.profiles,
        total: result.total,
        pageNumber: filters.pageNumber,
        pageSize: filters.pageSize,
        totalPages: Math.ceil(result.total / (filters.pageSize || 10)),
      });
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
        code: 'PROFILE_SEARCH_FAILED',
      });
    }
  });

  /**
   * GET /profiles/:id
   * Get profile details
   */
  router.get('/:id', authMiddleware(db), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.auth?.tenantId || 1;
      const profileId = parseInt(req.params.id);

      if (isNaN(profileId)) {
        return res.status(400).json({
          error: 'Invalid profile ID',
          code: 'INVALID_ID',
        });
      }

      const profile = await profileService.getProfileById(tenantId, profileId);

      if (!profile) {
        return res.status(404).json({
          error: 'Profile not found',
          code: 'PROFILE_NOT_FOUND',
        });
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
        code: 'PROFILE_DETAIL_FAILED',
      });
    }
  });

  /**
   * GET /profiles/user/:userId
   * Get profile by user ID
   */
  router.get('/user/:userId', authMiddleware(db), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.auth?.tenantId || 1;
      const userId = parseInt(req.params.userId);

      if (isNaN(userId)) {
        return res.status(400).json({
          error: 'Invalid user ID',
          code: 'INVALID_ID',
        });
      }

      const profile = await profileService.getProfileByUserId(tenantId, userId);

      if (!profile) {
        return res.status(404).json({
          error: 'Profile not found for this user',
          code: 'PROFILE_NOT_FOUND',
        });
      }

      res.json(profile);
    } catch (error) {
      res.status(500).json({
        error: (error as Error).message,
        code: 'PROFILE_DETAIL_FAILED',
      });
    }
  });

  /**
   * POST /profiles
   * Create or update profile
   */
  router.post('/', authMiddleware(db), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = req.auth?.tenantId || 1;
      const userId = req.auth?.userId;

      if (!userId) {
        return res.status(401).json({
          error: 'User ID not found in token',
          code: 'UNAUTHORIZED',
        });
      }

      const profile = await profileService.createOrUpdateProfile(tenantId, userId, req.body);

      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({
        error: (error as Error).message,
        code: 'PROFILE_CREATE_FAILED',
      });
    }
  });

  return router;
}
