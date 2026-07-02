import { Router, Request, Response, NextFunction } from 'express';
import { ConnectionPool } from 'mssql';
import { MasterDataItem, MasterDataService } from './master.service';
import { GeoService } from '../geo/geo.service';

export function createMasterDataRoutes(pool: ConnectionPool): Router {
  const router = Router();
  const master = new MasterDataService(pool);
  const geo = new GeoService(pool);

  const handle = (fn: (req: Request, res: Response) => Promise<void>) =>
    (req: Request, res: Response, next: NextFunction) =>
      fn(req, res).catch(next);

  const getCategory = async (candidates: string[]): Promise<MasterDataItem[]> => {
    const data = await master.getOptions(candidates);
    for (const category of candidates) {
      const items = data[category] ?? [];
      if (items.length > 0) {
        return items;
      }
    }
    return data[candidates[0]] ?? [];
  };

  const getMappedCategoryItems = async (
    table: 'ReligionCasteMap' | 'CasteSubCasteMap',
    parentColumn: 'ReligionMasterDataId' | 'CasteMasterDataId',
    childColumn: 'CasteMasterDataId' | 'SubCasteMasterDataId',
    parentId: number,
    categoryCandidates: string[],
    lang = 'en'
  ): Promise<MasterDataItem[]> => {
    const req = pool.request();
    req.input('parentId', 'int', parentId);
    req.input('lang', 'nvarchar', lang);
    categoryCandidates.forEach((cat, index) => {
      req.input(`cat${index}`, 'nvarchar', cat);
    });
    const categoryParams = categoryCandidates.map((_, index) => `@cat${index}`).join(', ');

    const result = await req.query<MasterDataItem>(`
      SELECT
        m.MasterDataId AS masterDataId,
        m.Category AS category,
        m.ValueCode AS valueCode,
        m.SortOrder AS sortOrder,
        COALESCE(tLang.Label, tEn.Label, m.ValueCode) AS label
      FROM dbo.${table} map
      INNER JOIN dbo.MasterData m ON m.MasterDataId = map.${childColumn}
      LEFT JOIN dbo.MasterDataTranslations tLang
        ON tLang.MasterDataId = m.MasterDataId AND tLang.LangCode = @lang
      LEFT JOIN dbo.MasterDataTranslations tEn
        ON tEn.MasterDataId = m.MasterDataId AND tEn.LangCode = 'en'
      WHERE map.${parentColumn} = @parentId
        AND map.IsActive = 1
        AND m.IsActive = 1
        AND m.Category IN (${categoryParams})
      ORDER BY m.SortOrder, m.ValueCode
    `);

    return result.recordset;
  };

  router.get('/genders', handle(async (_req, res) => {
    res.json(await getCategory(['gender', 'genders']));
  }));

  router.get('/religions', handle(async (_req, res) => {
    res.json(await getCategory(['religion', 'religions']));
  }));

  router.get('/castes', handle(async (req, res) => {
    const religionId = parseInt(req.query.religionId as string, 10);
    if (isNaN(religionId)) {
      res.status(400).json({ error: 'religionId query parameter is required' });
      return;
    }
    const lang = (req.query.lang as string) || 'en';
    const items = await getMappedCategoryItems(
      'ReligionCasteMap',
      'ReligionMasterDataId',
      'CasteMasterDataId',
      religionId,
      ['caste', 'castes'],
      lang
    );
    res.json(items);
  }));

  router.get('/sub-castes', handle(async (req, res) => {
    const casteId = parseInt(req.query.casteId as string, 10);
    if (isNaN(casteId)) {
      res.status(400).json({ error: 'casteId query parameter is required' });
      return;
    }
    const lang = (req.query.lang as string) || 'en';
    const items = await getMappedCategoryItems(
      'CasteSubCasteMap',
      'CasteMasterDataId',
      'SubCasteMasterDataId',
      casteId,
      ['sub_caste', 'sub-caste', 'sub_castes', 'sub-castes'],
      lang
    );
    res.json(items);
  }));

  router.get('/marital-statuses', handle(async (_req, res) => {
    res.json(await getCategory(['marital_status', 'marital-status', 'maritalstatus']));
  }));

  router.get('/blood-groups', handle(async (_req, res) => {
    res.json(await getCategory(['blood_group', 'blood-group', 'bloodgroup']));
  }));

  router.get('/complexions', handle(async (_req, res) => {
    res.json(await getCategory(['complexion', 'complexions']));
  }));

  router.get('/diets', handle(async (_req, res) => {
    res.json(await getCategory(['diet', 'diets']));
  }));

  router.get('/personalities', handle(async (_req, res) => {
    res.json(await getCategory(['personality', 'personalities']));
  }));

  router.get('/rashis', handle(async (_req, res) => {
    res.json(await getCategory(['rashi', 'rashis']));
  }));

  router.get('/nakshatras', handle(async (_req, res) => {
    res.json(await getCategory(['nakshatra', 'nakshatras']));
  }));

  router.get('/charans', handle(async (_req, res) => {
    res.json(await getCategory(['charan', 'charans']));
  }));

  router.get('/nadis', handle(async (_req, res) => {
    res.json(await getCategory(['nadi', 'nadis']));
  }));

  router.get('/gans', handle(async (_req, res) => {
    res.json(await getCategory(['gan', 'gans']));
  }));

  router.get('/educations', handle(async (_req, res) => {
    res.json(await getCategory(['education', 'educations']));
  }));

  router.get('/education-areas', handle(async (_req, res) => {
    res.json(await getCategory(['education_area', 'education-area', 'education_areas']));
  }));

  router.get('/occupations', handle(async (_req, res) => {
    res.json(await getCategory(['occupation_type', 'occupation', 'occupations']));
  }));

  router.get('/income-periods', handle(async (_req, res) => {
    res.json(await getCategory(['income_period', 'income-period', 'income_periods']));
  }));

  router.get('/states', handle(async (_req, res) => {
    const data = await geo.getStates();
    res.json(data);
  }));

  router.get('/districts', handle(async (req, res) => {
    const stateId = parseInt(req.query.stateId as string, 10);
    if (isNaN(stateId)) {
      res.status(400).json({ error: 'stateId query parameter is required' });
      return;
    }
    const data = await geo.getDistricts(stateId);
    res.json(data);
  }));

  return router;
}