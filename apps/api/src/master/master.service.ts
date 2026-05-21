/**
 * Master Data Service — generic lookup options with multi-language support.
 */
import { ConnectionPool } from 'mssql';

export interface MasterDataItem {
  masterDataId: number;
  category: string;
  valueCode: string;
  sortOrder: number;
  label: string; // resolved label in requested language
}

export interface MasterDataRaw {
  masterDataId: number;
  tenantId: number;
  category: string;
  valueCode: string;
  sortOrder: number;
  isActive: boolean;
  label: string;
  langCode: string;
}

export class MasterDataService {
  constructor(private pool: ConnectionPool) {}

  /**
   * Get all active items for one or more categories.
   * Falls back to 'en' when requested lang has no translation.
   */
  async getOptions(
    categories: string | string[],
    lang = 'en',
    tenantId = 0
  ): Promise<Record<string, MasterDataItem[]>> {
    const cats = Array.isArray(categories) ? categories : [categories];

    const req = this.pool.request().input('tenantId', tenantId).input('lang', lang);
    cats.forEach((cat, i) => req.input(`cat${i}`, cat));
    const catParams = cats.map((_, i) => `@cat${i}`).join(', ');

    const result = await req.query<MasterDataRaw>(
      `SELECT
         m.MasterDataId   AS masterDataId,
         m.TenantId       AS tenantId,
         m.Category       AS category,
         m.ValueCode      AS valueCode,
         m.SortOrder      AS sortOrder,
         m.IsActive       AS isActive,
         COALESCE(tLang.Label, tEn.Label, m.ValueCode) AS label,
         @lang AS langCode
       FROM dbo.MasterData m
       LEFT JOIN dbo.MasterDataTranslations tLang
         ON tLang.MasterDataId = m.MasterDataId AND tLang.LangCode = @lang
       LEFT JOIN dbo.MasterDataTranslations tEn
         ON tEn.MasterDataId = m.MasterDataId AND tEn.LangCode = 'en'
       WHERE m.IsActive = 1
         AND m.TenantId IN (0, @tenantId)
         AND m.Category IN (${catParams})
       ORDER BY m.Category, m.SortOrder, m.ValueCode`
    );

    const grouped: Record<string, MasterDataItem[]> = {};
    for (const cat of cats) {
      grouped[cat] = [];
    }
    for (const row of result.recordset) {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push({
        masterDataId: row.masterDataId,
        category: row.category,
        valueCode: row.valueCode,
        sortOrder: row.sortOrder,
        label: row.label,
      });
    }
    return grouped;
  }

  /** Add or update a master data item (admin use). */
  async upsert(
    category: string,
    valueCode: string,
    translations: Record<string, string>,
    sortOrder = 0,
    tenantId = 0
  ): Promise<number> {
    const existing = await this.pool
      .request()
      .input('tenantId', tenantId)
      .input('cat', category)
      .input('code', valueCode)
      .query<{ id: number }>(
        `SELECT MasterDataId AS id FROM dbo.MasterData
         WHERE TenantId = @tenantId AND Category = @cat AND ValueCode = @code`
      );

    let id: number;
    if (existing.recordset.length > 0) {
      id = existing.recordset[0].id;
      await this.pool
        .request()
        .input('id', id)
        .input('sortOrder', sortOrder)
        .query(`UPDATE dbo.MasterData SET SortOrder = @sortOrder, UpdatedAt = SYSUTCDATETIME() WHERE MasterDataId = @id`);
    } else {
      const ins = await this.pool
        .request()
        .input('tenantId', tenantId)
        .input('cat', category)
        .input('code', valueCode)
        .input('sortOrder', sortOrder)
        .query<{ id: number }>(
          `INSERT INTO dbo.MasterData (TenantId, Category, ValueCode, SortOrder)
           OUTPUT INSERTED.MasterDataId AS id
           VALUES (@tenantId, @cat, @code, @sortOrder)`
        );
      id = ins.recordset[0].id;
    }

    for (const [lang, label] of Object.entries(translations)) {
      await this.pool
        .request()
        .input('id', id)
        .input('lang', lang)
        .input('label', label)
        .query(
          `IF EXISTS (SELECT 1 FROM dbo.MasterDataTranslations WHERE MasterDataId = @id AND LangCode = @lang)
             UPDATE dbo.MasterDataTranslations SET Label = @label WHERE MasterDataId = @id AND LangCode = @lang
           ELSE
             INSERT INTO dbo.MasterDataTranslations (MasterDataId, LangCode, Label) VALUES (@id, @lang, @label)`
        );
    }

    return id;
  }

  /** Soft-delete a master data item. */
  async deactivate(masterDataId: number): Promise<void> {
    await this.pool
      .request()
      .input('id', masterDataId)
      .query(`UPDATE dbo.MasterData SET IsActive = 0 WHERE MasterDataId = @id`);
  }
}
