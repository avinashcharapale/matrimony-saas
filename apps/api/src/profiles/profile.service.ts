/**
 * Profile Service - Business logic for profile operations
 */

import { ConnectionPool, Request } from 'mssql';
import { AuthDatabase } from '../auth/database';

export interface ProfileSearchResult {
  profileId: number;
  userId: number;
  profileCode: string;
  fullName: string;
  age?: number;
  bio?: string;
  locationText?: string;
  occupationText?: string;
  email: string;
  createdAt: string;
  personal?: any;
  professional?: any;
}

export interface ProfileDetail extends ProfileSearchResult {
  personal: any;
  horoscope: any;
  professional: any;
  contact: any;
  family: any;
  expectations: any;
  verification?: any;
  photos?: any[];
}

export interface ProfileSearchFilters {
  name?: string;
  location?: string;
  occupation?: string;
  ageMin?: number;
  ageMax?: number;
  religion?: string;
  caste?: string;
  education?: string;
  maritalStatus?: string;
  pageNumber?: number;
  pageSize?: number;
}

export class ProfileService {
  private readonly columnExistsCache = new Map<string, boolean>();

  constructor(private pool: ConnectionPool, private db: AuthDatabase) {}

  private normalizeString(value: unknown): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    const text = String(value).trim();
    return text.length > 0 ? text : null;
  }

  private normalizeInt(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return null;
    }
    return Math.trunc(parsed);
  }

  private normalizeBoolean(value: unknown): boolean | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    if (typeof value === 'boolean') {
      return value;
    }

    const normalized = String(value).trim().toLowerCase();
    if (['yes', 'true', '1', 'y'].includes(normalized)) {
      return true;
    }
    if (['no', 'false', '0', 'n'].includes(normalized)) {
      return false;
    }

    return null;
  }

  private normalizeLookupToken(value: unknown): string | null {
    const text = this.normalizeString(value);
    if (!text) {
      return null;
    }
    return text.replace(/\s+/g, ' ').trim().toUpperCase();
  }

  private splitList(value: unknown): string[] {
    const text = this.normalizeString(value);
    if (!text) {
      return [];
    }

    return Array.from(
      new Set(
        text
          .split(/[\n,]/)
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
  }

  private async syncPhoneNumbers(profileId: number, contact: any): Promise<void> {
    const rows = [
      { phoneType: 'sms_mobile', phoneNumber: this.normalizeString(contact?.SmsMobile ?? contact?.smsMobile) },
      {
        phoneType: 'mobile_secondary',
        phoneNumber: this.normalizeString(contact?.MobileSecondary ?? contact?.mobileSecondary ?? contact?.Mobile2 ?? contact?.mobile2),
      },
      {
        phoneType: 'phone_primary',
        phoneNumber: this.normalizeString(contact?.PhonePrimary ?? contact?.phonePrimary ?? contact?.Phone1 ?? contact?.phone1),
      },
      {
        phoneType: 'phone_secondary',
        phoneNumber: this.normalizeString(contact?.PhoneSecondary ?? contact?.phoneSecondary ?? contact?.Phone2 ?? contact?.phone2),
      },
    ].filter((row) => row.phoneNumber);

    await this.pool.request().input('profileId', 'int', profileId).query(`
      UPDATE dbo.ProfilePhoneNumbers
      SET IsDeleted = 1
      WHERE ProfileId = @profileId AND IsDeleted = 0
    `);

    for (const row of rows) {
      const req = this.pool.request();
      req.input('profileId', 'int', profileId);
      req.input('phoneType', 'nvarchar', row.phoneType);
      req.input('phoneNumber', 'nvarchar', row.phoneNumber);
      await req.query(`
        IF EXISTS (
          SELECT 1
          FROM dbo.ProfilePhoneNumbers
          WHERE ProfileId = @profileId AND PhoneType = @phoneType
        )
        BEGIN
          UPDATE dbo.ProfilePhoneNumbers
          SET PhoneNumber = @phoneNumber,
              IsDeleted = 0
          WHERE ProfileId = @profileId AND PhoneType = @phoneType
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ProfilePhoneNumbers (ProfileId, PhoneType, PhoneNumber, IsDeleted)
          VALUES (@profileId, @phoneType, @phoneNumber, 0)
        END
      `);
    }
  }

  private async syncRelatives(profileId: number, family: any): Promise<void> {
    const relatives = this.splitList(family?.RelativesSurnames ?? family?.relativesSurnames);

    await this.pool.request().input('profileId', 'int', profileId).query(`
      UPDATE dbo.ProfileRelatives
      SET IsDeleted = 1
      WHERE ProfileId = @profileId AND IsDeleted = 0
    `);

    for (const surname of relatives) {
      const req = this.pool.request();
      req.input('profileId', 'int', profileId);
      req.input('surname', 'nvarchar', surname);
      await req.query(`
        IF EXISTS (
          SELECT 1
          FROM dbo.ProfileRelatives
          WHERE ProfileId = @profileId AND Surname = @surname
        )
        BEGIN
          UPDATE dbo.ProfileRelatives
          SET IsDeleted = 0
          WHERE ProfileId = @profileId AND Surname = @surname
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ProfileRelatives (ProfileId, Surname, IsDeleted)
          VALUES (@profileId, @surname, 0)
        END
      `);
    }
  }

  private async syncPreferredCities(profileId: number, expectations: any): Promise<void> {
    const cities = this.splitList(expectations?.PreferredCities ?? expectations?.preferredCities);

    await this.pool.request().input('profileId', 'int', profileId).query(`
      UPDATE dbo.ProfilePreferredCities
      SET IsDeleted = 1
      WHERE ProfileId = @profileId AND IsDeleted = 0
    `);

    for (const cityName of cities) {
      const req = this.pool.request();
      req.input('profileId', 'int', profileId);
      req.input('cityName', 'nvarchar', cityName);
      await req.query(`
        IF EXISTS (
          SELECT 1
          FROM dbo.ProfilePreferredCities
          WHERE ProfileId = @profileId AND CityName = @cityName
        )
        BEGIN
          UPDATE dbo.ProfilePreferredCities
          SET IsDeleted = 0
          WHERE ProfileId = @profileId AND CityName = @cityName
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ProfilePreferredCities (ProfileId, CityName, IsDeleted)
          VALUES (@profileId, @cityName, 0)
        END
      `);
    }
  }

  private async syncPhotos(profileId: number, photos: any[] | undefined): Promise<void> {
    const safePhotos = Array.isArray(photos)
      ? photos
          .map((photo, index) => ({
            photoSlot: this.normalizeInt(photo?.PhotoSlot ?? photo?.photoSlot) ?? index + 1,
            fileName: this.normalizeString(photo?.FileName ?? photo?.fileName),
            isPrimary: this.normalizeBoolean(photo?.IsPrimary ?? photo?.isPrimary) ?? index === 0,
          }))
          .filter((photo) => photo.fileName && photo.photoSlot >= 1 && photo.photoSlot <= 3)
      : [];

    await this.pool.request().input('profileId', 'int', profileId).query(`
      UPDATE dbo.ProfilePhotos
      SET IsDeleted = 1,
          IsPrimary = 0
      WHERE ProfileId = @profileId AND IsDeleted = 0
    `);

    for (const photo of safePhotos) {
      const req = this.pool.request();
      req.input('profileId', 'int', profileId);
      req.input('photoSlot', 'smallint', photo.photoSlot);
      req.input('fileName', 'nvarchar', photo.fileName);
      req.input('isPrimary', 'bit', photo.isPrimary ? 1 : 0);
      await req.query(`
        IF EXISTS (
          SELECT 1
          FROM dbo.ProfilePhotos
          WHERE ProfileId = @profileId AND PhotoSlot = @photoSlot
        )
        BEGIN
          UPDATE dbo.ProfilePhotos
          SET FileName = @fileName,
              IsPrimary = @isPrimary,
              IsDeleted = 0
          WHERE ProfileId = @profileId AND PhotoSlot = @photoSlot
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ProfilePhotos (ProfileId, PhotoSlot, FileName, IsPrimary, IsDeleted)
          VALUES (@profileId, @photoSlot, @fileName, @isPrimary, 0)
        END
      `);
    }
  }

  private async resolveMasterDataId(category: string, value: unknown): Promise<number | null> {
    const token = this.normalizeLookupToken(value);
    if (!token) {
      return null;
    }

    const req = this.pool.request();
    req.input('category', 'nvarchar', category);
    req.input('token', 'nvarchar', token);

    const result = await req.query(`
      SELECT TOP 1 m.MasterDataId AS id
      FROM dbo.MasterData m
      LEFT JOIN dbo.MasterDataTranslations tEn
        ON tEn.MasterDataId = m.MasterDataId AND tEn.LangCode = 'en'
      LEFT JOIN dbo.MasterDataTranslations tMr
        ON tMr.MasterDataId = m.MasterDataId AND tMr.LangCode = 'mr'
      LEFT JOIN dbo.MasterDataTranslations tHi
        ON tHi.MasterDataId = m.MasterDataId AND tHi.LangCode = 'hi'
      WHERE m.TenantId = 0
        AND m.IsActive = 1
        AND m.Category = @category
        AND (
          UPPER(m.ValueCode) = @token
          OR UPPER(ISNULL(tEn.Label, '')) = @token
          OR UPPER(ISNULL(tMr.Label, '')) = @token
          OR UPPER(ISNULL(tHi.Label, '')) = @token
        )
      ORDER BY CASE WHEN UPPER(m.ValueCode) = @token THEN 0 ELSE 1 END, m.SortOrder, m.MasterDataId
    `);

    if (result.recordset.length === 0) {
      return null;
    }

    return Number(result.recordset[0].id);
  }

  private async validateReligionCasteSubCaste(personal: any): Promise<void> {
    const religion = this.normalizeString(personal?.Religion ?? personal?.religion);
    const caste = this.normalizeString(personal?.Caste ?? personal?.caste);
    const subCast = this.normalizeString(
      personal?.SubCast ?? personal?.subCast ?? personal?.SubCaste ?? personal?.subCaste
    );

    if (!religion && !caste && !subCast) {
      return;
    }

    const [religionId, casteId, subCasteId] = await Promise.all([
      religion ? this.resolveMasterDataId('religion', religion) : Promise.resolve(null),
      caste ? this.resolveMasterDataId('caste', caste) : Promise.resolve(null),
      subCast ? this.resolveMasterDataId('sub_caste', subCast) : Promise.resolve(null),
    ]);

    if (religion && !religionId) {
      throw new Error(`Invalid religion '${religion}'.`);
    }
    if (caste && !casteId) {
      throw new Error(`Invalid caste '${caste}'.`);
    }
    if (subCast && !subCasteId) {
      throw new Error(`Invalid sub-caste '${subCast}'.`);
    }

    if (religionId && casteId) {
      const req = this.pool.request();
      req.input('religionId', 'int', religionId);
      req.input('casteId', 'int', casteId);
      const result = await req.query(`
        SELECT COUNT(1) AS Cnt
        FROM dbo.ReligionCasteMap
        WHERE ReligionMasterDataId = @religionId
          AND CasteMasterDataId = @casteId
          AND IsActive = 1
      `);

      if (Number(result.recordset[0]?.Cnt || 0) === 0) {
        throw new Error(`Caste '${caste}' is not valid for religion '${religion}'.`);
      }
    }

    if (casteId && subCasteId) {
      const req = this.pool.request();
      req.input('casteId', 'int', casteId);
      req.input('subCasteId', 'int', subCasteId);
      const result = await req.query(`
        SELECT COUNT(1) AS Cnt
        FROM dbo.CasteSubCasteMap
        WHERE CasteMasterDataId = @casteId
          AND SubCasteMasterDataId = @subCasteId
          AND IsActive = 1
      `);

      if (Number(result.recordset[0]?.Cnt || 0) === 0) {
        throw new Error(`Sub-caste '${subCast}' is not valid for caste '${caste}'.`);
      }
    }
  }

  private monthToNumber(monthValue: unknown): number | null {
    const raw = this.normalizeString(monthValue);
    if (!raw) {
      return null;
    }

    const numeric = this.normalizeInt(raw);
    if (numeric !== null && numeric >= 1 && numeric <= 12) {
      return numeric;
    }

    const mon = raw.toLowerCase().slice(0, 3);
    const map: Record<string, number> = {
      jan: 1,
      feb: 2,
      mar: 3,
      apr: 4,
      may: 5,
      jun: 6,
      jul: 7,
      aug: 8,
      sep: 9,
      oct: 10,
      nov: 11,
      dec: 12,
    };
    return map[mon] ?? null;
  }

  private computeDateOfBirth(personal: any): string | null {
    const existing = this.normalizeString(personal?.DateOfBirth ?? personal?.dateOfBirth);
    if (existing) {
      return existing.slice(0, 10);
    }

    const day = this.normalizeInt(personal?.DobDay ?? personal?.dobDay);
    const month = this.monthToNumber(personal?.DobMonth ?? personal?.dobMonth);
    const year = this.normalizeInt(personal?.DobYear ?? personal?.dobYear);

    if (!day || !month || !year) {
      return null;
    }

    const utc = new Date(Date.UTC(year, month - 1, day));
    if (
      utc.getUTCFullYear() !== year ||
      utc.getUTCMonth() !== month - 1 ||
      utc.getUTCDate() !== day
    ) {
      return null;
    }

    return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day
      .toString()
      .padStart(2, '0')}`;
  }

  private computeHeightCm(personal: any): number | null {
    const existing = this.normalizeInt(personal?.HeightCm ?? personal?.heightCm);
    if (existing && existing >= 100 && existing <= 250) {
      return existing;
    }

    const heightFt = this.normalizeInt(personal?.HeightFt ?? personal?.heightFt);
    const heightIn = this.normalizeInt(personal?.HeightIn ?? personal?.heightIn);

    if (heightFt === null && heightIn === null) {
      return null;
    }

    const totalInches = (heightFt ?? 0) * 12 + (heightIn ?? 0);
    if (totalInches <= 0) {
      return null;
    }
    return Math.round(totalInches * 2.54);
  }

  private computeBirthTime(horoscope: any): string | null {
    const existing = this.normalizeString(horoscope?.BirthTime ?? horoscope?.birthTime);
    if (existing) {
      return existing;
    }

    const hour = this.normalizeInt(horoscope?.BirthHour ?? horoscope?.birthHour);
    const minute = this.normalizeInt(horoscope?.BirthMinute ?? horoscope?.birthMinute);
    const period = this.normalizeString(horoscope?.BirthPeriod ?? horoscope?.birthPeriod)?.toUpperCase();

    if (hour === null || minute === null || !period || minute < 0 || minute > 59) {
      return null;
    }

    if (hour < 1 || hour > 12 || (period !== 'AM' && period !== 'PM')) {
      return null;
    }

    let hour24 = hour;
    if (period === 'AM') {
      hour24 = hour === 12 ? 0 : hour;
    } else {
      hour24 = hour === 12 ? 12 : hour + 12;
    }

    return `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
  }

  private computeSplitBirthTime(horoscope: any, canonicalBirthTime: string | null): {
    birthHour: number | null;
    birthMinute: number | null;
    birthPeriod: 'AM' | 'PM' | null;
  } {
    const rawHour = this.normalizeInt(horoscope?.BirthHour ?? horoscope?.birthHour);
    const rawMinute = this.normalizeInt(horoscope?.BirthMinute ?? horoscope?.birthMinute);
    const rawPeriod = this.normalizeString(horoscope?.BirthPeriod ?? horoscope?.birthPeriod)?.toUpperCase();

    if (
      rawHour !== null &&
      rawHour >= 1 &&
      rawHour <= 12 &&
      rawMinute !== null &&
      rawMinute >= 0 &&
      rawMinute <= 59 &&
      (rawPeriod === 'AM' || rawPeriod === 'PM')
    ) {
      return {
        birthHour: rawHour,
        birthMinute: rawMinute,
        birthPeriod: rawPeriod,
      };
    }

    if (!canonicalBirthTime || canonicalBirthTime.length < 5) {
      return { birthHour: null, birthMinute: null, birthPeriod: null };
    }

    const hour24 = Number(canonicalBirthTime.slice(0, 2));
    const minute = Number(canonicalBirthTime.slice(3, 5));

    if (!Number.isFinite(hour24) || !Number.isFinite(minute)) {
      return { birthHour: null, birthMinute: null, birthPeriod: null };
    }

    const period: 'AM' | 'PM' = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;

    return {
      birthHour: hour12,
      birthMinute: minute,
      birthPeriod: period,
    };
  }

  private computeSplitHeight(personal: any, canonicalHeightCm: number | null): {
    heightFt: number | null;
    heightIn: number | null;
  } {
    const rawFt = this.normalizeInt(personal?.HeightFt ?? personal?.heightFt);
    const rawIn = this.normalizeInt(personal?.HeightIn ?? personal?.heightIn);
    if (
      rawFt !== null &&
      rawFt >= 0 &&
      rawFt <= 8 &&
      rawIn !== null &&
      rawIn >= 0 &&
      rawIn <= 11
    ) {
      return { heightFt: rawFt, heightIn: rawIn };
    }

    if (!canonicalHeightCm || canonicalHeightCm <= 0) {
      return { heightFt: null, heightIn: null };
    }

    const totalInches = Math.round(canonicalHeightCm / 2.54);
    return {
      heightFt: Math.floor(totalInches / 12),
      heightIn: totalInches % 12,
    };
  }

  private async columnExists(tableName: string, columnName: string): Promise<boolean> {
    const cacheKey = `${tableName}.${columnName}`;
    const cached = this.columnExistsCache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const req = this.pool.request();
    req.input('tableName', 'nvarchar', tableName);
    req.input('columnName', 'nvarchar', columnName);
    const result = await req.query(`
      SELECT COUNT(1) AS Cnt
      FROM sys.columns c
      INNER JOIN sys.objects o ON c.object_id = o.object_id
      WHERE o.type = 'U'
        AND o.name = @tableName
        AND c.name = @columnName
    `);

    const exists = Number(result.recordset[0]?.Cnt || 0) > 0;
    this.columnExistsCache.set(cacheKey, exists);
    return exists;
  }

  private async syncHybridCanonicalFields(profileId: number, profileData: Partial<ProfileDetail>): Promise<void> {
    if (profileData.personal) {
      await this.validateReligionCasteSubCaste(profileData.personal);

      const dateOfBirth = this.computeDateOfBirth(profileData.personal);
      const heightCm = this.computeHeightCm(profileData.personal);
      const splitHeight = this.computeSplitHeight(profileData.personal, heightCm);
      const hasDateOfBirth = await this.columnExists('ProfilePersonalDetails', 'DateOfBirth');
      const hasHeightCm = await this.columnExists('ProfilePersonalDetails', 'HeightCm');
      const hasGender = await this.columnExists('ProfilePersonalDetails', 'Gender');
      const hasReligion = await this.columnExists('ProfilePersonalDetails', 'Religion');
      const hasCaste = await this.columnExists('ProfilePersonalDetails', 'Caste');
      const hasSubCast = await this.columnExists('ProfilePersonalDetails', 'SubCast');

      const personalReq = this.pool.request();
      personalReq.input('profileId', 'int', profileId);
      personalReq.input('dobDay', 'smallint', this.normalizeInt(profileData.personal?.DobDay ?? profileData.personal?.dobDay));
      personalReq.input('dobMonth', 'nvarchar', this.normalizeString(profileData.personal?.DobMonth ?? profileData.personal?.dobMonth));
      personalReq.input('dobYear', 'smallint', this.normalizeInt(profileData.personal?.DobYear ?? profileData.personal?.dobYear));
      personalReq.input('heightFt', 'smallint', splitHeight.heightFt);
      personalReq.input('heightIn', 'smallint', splitHeight.heightIn);
      personalReq.input('dateOfBirth', 'date', dateOfBirth);
      personalReq.input('heightCm', 'smallint', heightCm);
      personalReq.input('gender', 'nvarchar', this.normalizeString(profileData.personal?.Gender ?? profileData.personal?.gender));
      personalReq.input('religion', 'nvarchar', this.normalizeString(profileData.personal?.Religion ?? profileData.personal?.religion));
      personalReq.input('caste', 'nvarchar', this.normalizeString(profileData.personal?.Caste ?? profileData.personal?.caste));
      personalReq.input(
        'subCast',
        'nvarchar',
        this.normalizeString(
          profileData.personal?.SubCast ?? profileData.personal?.subCast ?? profileData.personal?.SubCaste ?? profileData.personal?.subCaste
        )
      );

      const canonicalSetParts: string[] = [];
      if (hasDateOfBirth) {
        canonicalSetParts.push('DateOfBirth = ISNULL(@dateOfBirth, DateOfBirth)');
      }
      if (hasHeightCm) {
        canonicalSetParts.push('HeightCm = ISNULL(@heightCm, HeightCm)');
      }
      if (hasGender) {
        canonicalSetParts.push('Gender = ISNULL(@gender, Gender)');
      }
      if (hasReligion) {
        canonicalSetParts.push('Religion = ISNULL(@religion, Religion)');
      }
      if (hasCaste) {
        canonicalSetParts.push('Caste = ISNULL(@caste, Caste)');
      }
      if (hasSubCast) {
        canonicalSetParts.push('SubCast = ISNULL(@subCast, SubCast)');
      }

      personalReq.input('firstName', 'nvarchar', this.normalizeString(profileData.personal?.FirstName ?? profileData.personal?.firstName) || '');
      personalReq.input('middleName', 'nvarchar', this.normalizeString(profileData.personal?.MiddleName ?? profileData.personal?.middleName));
      personalReq.input('lastName', 'nvarchar', this.normalizeString(profileData.personal?.LastName ?? profileData.personal?.lastName) || '');
      personalReq.input('maritalStatus', 'nvarchar', this.normalizeString(profileData.personal?.MaritalStatus ?? profileData.personal?.maritalStatus) || 'Unmarried');
      personalReq.input('weightKg', 'smallint', this.normalizeInt(profileData.personal?.WeightKg ?? profileData.personal?.weightKg));
      personalReq.input('bloodGroup', 'nvarchar', this.normalizeString(profileData.personal?.BloodGroup ?? profileData.personal?.bloodGroup));
      personalReq.input('complexion', 'nvarchar', this.normalizeString(profileData.personal?.Complexion ?? profileData.personal?.complexion));
      personalReq.input('physicalDisability', 'bit', (this.normalizeBoolean(profileData.personal?.PhysicalDisability ?? profileData.personal?.physicalDisability) ?? false) ? 1 : 0);
      personalReq.input('disabilityDetail', 'nvarchar', this.normalizeString(profileData.personal?.DisabilityDetail ?? profileData.personal?.disabilityDetail));
      personalReq.input('diet', 'nvarchar', this.normalizeString(profileData.personal?.Diet ?? profileData.personal?.diet));
      personalReq.input('spectacles', 'bit', this.normalizeBoolean(profileData.personal?.Spectacles ?? profileData.personal?.spectacles));
      personalReq.input('lens', 'bit', this.normalizeBoolean(profileData.personal?.Lens ?? profileData.personal?.lens));
      personalReq.input('personality', 'nvarchar', this.normalizeString(profileData.personal?.Personality ?? profileData.personal?.personality));

      await personalReq.query(`
        IF EXISTS (SELECT 1 FROM dbo.ProfilePersonalDetails WHERE ProfileId = @profileId)
        BEGIN
          UPDATE dbo.ProfilePersonalDetails
          SET
            FirstName = ISNULL(NULLIF(@firstName, ''), FirstName),
            MiddleName = @middleName,
            LastName = ISNULL(NULLIF(@lastName, ''), LastName),
            DobDay = ISNULL(@dobDay, DobDay),
            DobMonth = ISNULL(@dobMonth, DobMonth),
            DobYear = ISNULL(@dobYear, DobYear),
            Gender = ISNULL(@gender, Gender),
            Religion = ISNULL(@religion, Religion),
            Caste = ISNULL(@caste, Caste),
            SubCast = ISNULL(@subCast, SubCast),
            MaritalStatus = ISNULL(@maritalStatus, MaritalStatus),
            HeightFt = ISNULL(@heightFt, HeightFt),
            HeightIn = ISNULL(@heightIn, HeightIn),
            WeightKg = ISNULL(@weightKg, WeightKg),
            BloodGroup = ISNULL(@bloodGroup, BloodGroup),
            Complexion = ISNULL(@complexion, Complexion),
            PhysicalDisability = @physicalDisability,
            DisabilityDetail = @disabilityDetail,
            Diet = ISNULL(@diet, Diet),
            Spectacles = COALESCE(@spectacles, Spectacles),
            Lens = COALESCE(@lens, Lens),
            Personality = ISNULL(@personality, Personality),
            ${canonicalSetParts.length > 0 ? `${canonicalSetParts.join(',')},` : ''}
            UpdatedAt = SYSUTCDATETIME()
          WHERE ProfileId = @profileId
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ProfilePersonalDetails (
            ProfileId, FirstName, MiddleName, LastName, DobDay, DobMonth, DobYear, Gender, Religion, Caste, SubCast,
            MaritalStatus, HeightFt, HeightIn, WeightKg, BloodGroup, Complexion, PhysicalDisability,
            DisabilityDetail, Diet, Spectacles, Lens, Personality
          )
          VALUES (
            @profileId, @firstName, @middleName, @lastName, COALESCE(@dobDay, 1), COALESCE(@dobMonth, 'Jan'), COALESCE(@dobYear, 1990),
            @gender, @religion, @caste, @subCast, @maritalStatus, @heightFt, @heightIn, @weightKg, @bloodGroup, @complexion,
            @physicalDisability, @disabilityDetail, @diet, @spectacles, @lens, @personality
          )
        END
      `);
    }

    if (profileData.horoscope) {
      const birthTime = this.computeBirthTime(profileData.horoscope);
      const splitBirthTime = this.computeSplitBirthTime(profileData.horoscope, birthTime);
      const hasBirthTime = await this.columnExists('ProfileHoroscopeDetails', 'BirthTime');
      const hasBirthTimeIsApprox = await this.columnExists('ProfileHoroscopeDetails', 'BirthTimeIsApprox');
      const birthTimeIsApprox =
        profileData.horoscope?.BirthTimeIsApprox ?? profileData.horoscope?.birthTimeIsApprox ?? false;

      const horoscopeReq = this.pool.request();
      horoscopeReq.input('profileId', 'int', profileId);
      horoscopeReq.input('birthHour', 'smallint', splitBirthTime.birthHour);
      horoscopeReq.input('birthMinute', 'smallint', splitBirthTime.birthMinute);
      horoscopeReq.input('birthPeriod', 'nvarchar', splitBirthTime.birthPeriod);
      horoscopeReq.input('birthTime', 'time', birthTime);
      horoscopeReq.input('birthTimeIsApprox', 'bit', birthTimeIsApprox ? 1 : 0);

      const canonicalSetParts: string[] = [];
      if (hasBirthTime) {
        canonicalSetParts.push('BirthTime = ISNULL(@birthTime, BirthTime)');
      }
      if (hasBirthTimeIsApprox) {
        canonicalSetParts.push('BirthTimeIsApprox = @birthTimeIsApprox');
      }

      horoscopeReq.input('manglik', 'bit', (this.normalizeBoolean(profileData.horoscope?.Manglik ?? profileData.horoscope?.manglik) ?? false) ? 1 : 0);
      horoscopeReq.input('rashi', 'nvarchar', this.normalizeString(profileData.horoscope?.Rashi ?? profileData.horoscope?.rashi));
      horoscopeReq.input('nakshatra', 'nvarchar', this.normalizeString(profileData.horoscope?.Nakshatra ?? profileData.horoscope?.nakshatra));
      horoscopeReq.input('charan', 'nvarchar', this.normalizeString(profileData.horoscope?.Charan ?? profileData.horoscope?.charan));
      horoscopeReq.input('nadi', 'nvarchar', this.normalizeString(profileData.horoscope?.Nadi ?? profileData.horoscope?.nadi));
      horoscopeReq.input('gan', 'nvarchar', this.normalizeString(profileData.horoscope?.Gan ?? profileData.horoscope?.gan));
      horoscopeReq.input('birthDistrict', 'nvarchar', this.normalizeString(profileData.horoscope?.BirthDistrict ?? profileData.horoscope?.birthDistrict));
      horoscopeReq.input('devak', 'nvarchar', this.normalizeString(profileData.horoscope?.Devak ?? profileData.horoscope?.devak));

      await horoscopeReq.query(`
        IF EXISTS (SELECT 1 FROM dbo.ProfileHoroscopeDetails WHERE ProfileId = @profileId)
        BEGIN
          UPDATE dbo.ProfileHoroscopeDetails
          SET
            Manglik = @manglik,
            Rashi = ISNULL(@rashi, Rashi),
            Nakshatra = ISNULL(@nakshatra, Nakshatra),
            Charan = ISNULL(@charan, Charan),
            Nadi = ISNULL(@nadi, Nadi),
            Gan = ISNULL(@gan, Gan),
            BirthHour = ISNULL(@birthHour, BirthHour),
            BirthMinute = ISNULL(@birthMinute, BirthMinute),
            BirthPeriod = ISNULL(@birthPeriod, BirthPeriod),
            BirthDistrict = ISNULL(@birthDistrict, BirthDistrict),
            Devak = ISNULL(@devak, Devak),
            ${canonicalSetParts.length > 0 ? `${canonicalSetParts.join(',')},` : ''}
            UpdatedAt = SYSUTCDATETIME()
          WHERE ProfileId = @profileId
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ProfileHoroscopeDetails (
            ProfileId, Manglik, Rashi, Nakshatra, Charan, Nadi, Gan, BirthHour, BirthMinute, BirthPeriod, BirthDistrict, Devak
          )
          VALUES (
            @profileId, @manglik, @rashi, @nakshatra, @charan, @nadi, @gan, @birthHour, @birthMinute, @birthPeriod, @birthDistrict, @devak
          )
        END
      `);
    }

    if (profileData.professional) {
      const req = this.pool.request();
      req.input('profileId', 'int', profileId);
      req.input('educationArea', 'nvarchar', this.normalizeString(profileData.professional?.EducationArea ?? profileData.professional?.educationArea));
      req.input('education', 'nvarchar', this.normalizeString(profileData.professional?.Education ?? profileData.professional?.education));
      req.input('occupationType', 'nvarchar', this.normalizeString(profileData.professional?.OccupationType ?? profileData.professional?.occupationType));
      req.input('occupationDetails', 'nvarchar', this.normalizeString(profileData.professional?.OccupationDetails ?? profileData.professional?.occupationDetails));
      req.input('workingCityCountry', 'nvarchar', this.normalizeString(profileData.professional?.WorkingCityCountry ?? profileData.professional?.workingCityCountry));
      req.input('incomeAmount', 'decimal', this.normalizeInt(profileData.professional?.IncomeAmount ?? profileData.professional?.incomeAmount));
      req.input('incomePeriod', 'nvarchar', this.normalizeString(profileData.professional?.IncomePeriod ?? profileData.professional?.incomePeriod));
      await req.query(`
        IF EXISTS (SELECT 1 FROM dbo.ProfileProfessionalDetails WHERE ProfileId = @profileId)
        BEGIN
          UPDATE dbo.ProfileProfessionalDetails
          SET
            EducationArea = ISNULL(@educationArea, EducationArea),
            Education = ISNULL(@education, Education),
            OccupationType = ISNULL(@occupationType, OccupationType),
            OccupationDetails = ISNULL(@occupationDetails, OccupationDetails),
            WorkingCityCountry = ISNULL(@workingCityCountry, WorkingCityCountry),
            IncomeAmount = COALESCE(@incomeAmount, IncomeAmount),
            IncomePeriod = ISNULL(@incomePeriod, IncomePeriod),
            UpdatedAt = SYSUTCDATETIME()
          WHERE ProfileId = @profileId
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ProfileProfessionalDetails (
            ProfileId, EducationArea, Education, OccupationType, OccupationDetails, WorkingCityCountry, IncomeAmount, IncomePeriod
          )
          VALUES (
            @profileId, @educationArea, @education, @occupationType, @occupationDetails, @workingCityCountry, @incomeAmount, @incomePeriod
          )
        END
      `);
    }

    if (profileData.contact) {
      const req = this.pool.request();
      req.input('profileId', 'int', profileId);
      req.input('idProofNumber', 'nvarchar', this.normalizeString(profileData.contact?.IdProofNumber ?? profileData.contact?.idProofNumber));
      req.input('residenceAddress', 'nvarchar', this.normalizeString(profileData.contact?.ResidenceAddress ?? profileData.contact?.residenceAddress));
      req.input('contactEmail', 'nvarchar', this.normalizeString(profileData.contact?.ContactEmail ?? profileData.contact?.contactEmail));
      await req.query(`
        IF EXISTS (SELECT 1 FROM dbo.ProfileContactDetails WHERE ProfileId = @profileId)
        BEGIN
          UPDATE dbo.ProfileContactDetails
          SET
            IdProofNumber = ISNULL(@idProofNumber, IdProofNumber),
            ResidenceAddress = ISNULL(@residenceAddress, ResidenceAddress),
            ContactEmail = ISNULL(@contactEmail, ContactEmail),
            UpdatedAt = SYSUTCDATETIME()
          WHERE ProfileId = @profileId
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ProfileContactDetails (ProfileId, IdProofNumber, ResidenceAddress, ContactEmail)
          VALUES (@profileId, @idProofNumber, @residenceAddress, @contactEmail)
        END
      `);

      await this.syncPhoneNumbers(profileId, profileData.contact);
    }

    if (profileData.family) {
      const req = this.pool.request();
      req.input('profileId', 'int', profileId);
      req.input('fatherStatus', 'bit', this.normalizeBoolean(profileData.family?.FatherStatus ?? profileData.family?.fatherStatus));
      req.input('motherStatus', 'bit', this.normalizeBoolean(profileData.family?.MotherStatus ?? profileData.family?.motherStatus));
      req.input('brothers', 'smallint', this.normalizeInt(profileData.family?.Brothers ?? profileData.family?.brothers) ?? 0);
      req.input('marriedBrothers', 'smallint', this.normalizeInt(profileData.family?.MarriedBrothers ?? profileData.family?.marriedBrothers) ?? 0);
      req.input('sisters', 'smallint', this.normalizeInt(profileData.family?.Sisters ?? profileData.family?.sisters) ?? 0);
      req.input('marriedSisters', 'smallint', this.normalizeInt(profileData.family?.MarriedSisters ?? profileData.family?.marriedSisters) ?? 0);
      req.input('parentsFullName', 'nvarchar', this.normalizeString(profileData.family?.ParentsFullName ?? profileData.family?.parentsFullName));
      req.input('parentsOccupation', 'nvarchar', this.normalizeString(profileData.family?.ParentsOccupation ?? profileData.family?.parentsOccupation));
      req.input('parentsResidentCity', 'nvarchar', this.normalizeString(profileData.family?.ParentsResidentCity ?? profileData.family?.parentsResidentCity));
      req.input('familyWealth', 'nvarchar', this.normalizeString(profileData.family?.FamilyWealth ?? profileData.family?.familyWealth));
      req.input('mamaSurnamePlace', 'nvarchar', this.normalizeString(profileData.family?.MamaSurnamePlace ?? profileData.family?.mamaSurnamePlace));
      req.input('nativeDistrict', 'nvarchar', this.normalizeString(profileData.family?.NativeDistrict ?? profileData.family?.nativeDistrict));
      req.input('nativeTaluka', 'nvarchar', this.normalizeString(profileData.family?.NativeTaluka ?? profileData.family?.nativeTaluka));
      req.input('intercastMarriage', 'bit', this.normalizeBoolean(profileData.family?.IntercastMarriage ?? profileData.family?.intercastMarriage));
      req.input('intercastRelation', 'nvarchar', this.normalizeString(profileData.family?.IntercastRelation ?? profileData.family?.intercastRelation));
      await req.query(`
        IF EXISTS (SELECT 1 FROM dbo.ProfileFamilyDetails WHERE ProfileId = @profileId)
        BEGIN
          UPDATE dbo.ProfileFamilyDetails
          SET
            FatherStatus = @fatherStatus,
            MotherStatus = @motherStatus,
            Brothers = @brothers,
            MarriedBrothers = @marriedBrothers,
            Sisters = @sisters,
            MarriedSisters = @marriedSisters,
            ParentsFullName = ISNULL(@parentsFullName, ParentsFullName),
            ParentsOccupation = ISNULL(@parentsOccupation, ParentsOccupation),
            ParentsResidentCity = ISNULL(@parentsResidentCity, ParentsResidentCity),
            FamilyWealth = ISNULL(@familyWealth, FamilyWealth),
            MamaSurnamePlace = ISNULL(@mamaSurnamePlace, MamaSurnamePlace),
            NativeDistrict = ISNULL(@nativeDistrict, NativeDistrict),
            NativeTaluka = ISNULL(@nativeTaluka, NativeTaluka),
            IntercastMarriage = @intercastMarriage,
            IntercastRelation = @intercastRelation,
            UpdatedAt = SYSUTCDATETIME()
          WHERE ProfileId = @profileId
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ProfileFamilyDetails (
            ProfileId, FatherStatus, MotherStatus, Brothers, MarriedBrothers, Sisters, MarriedSisters, ParentsFullName,
            ParentsOccupation, ParentsResidentCity, FamilyWealth, MamaSurnamePlace, NativeDistrict, NativeTaluka,
            IntercastMarriage, IntercastRelation
          )
          VALUES (
            @profileId, @fatherStatus, @motherStatus, @brothers, @marriedBrothers, @sisters, @marriedSisters, @parentsFullName,
            @parentsOccupation, @parentsResidentCity, @familyWealth, @mamaSurnamePlace, @nativeDistrict, @nativeTaluka,
            @intercastMarriage, @intercastRelation
          )
        END
      `);

      await this.syncRelatives(profileId, profileData.family);
    }

    if (profileData.expectations) {
      const req = this.pool.request();
      req.input('profileId', 'int', profileId);
      req.input('expectedManglik', 'bit', this.normalizeBoolean(profileData.expectations?.ExpectedManglik ?? profileData.expectations?.expectedManglik));
      req.input('expectedCaste', 'nvarchar', this.normalizeString(profileData.expectations?.ExpectedCaste ?? profileData.expectations?.expectedCaste));
      req.input('maxAgeDifference', 'smallint', this.normalizeInt(profileData.expectations?.MaxAgeDifference ?? profileData.expectations?.maxAgeDifference));
      req.input('expectedHeightFt', 'smallint', this.normalizeInt(profileData.expectations?.ExpectedHeightFt ?? profileData.expectations?.expectedHeightFt));
      req.input('expectedHeightIn', 'smallint', this.normalizeInt(profileData.expectations?.ExpectedHeightIn ?? profileData.expectations?.expectedHeightIn));
      req.input('expectedEducation', 'nvarchar', this.normalizeString(profileData.expectations?.ExpectedEducation ?? profileData.expectations?.expectedEducation));
      req.input('expectedOccupationIncome', 'nvarchar', this.normalizeString(profileData.expectations?.ExpectedOccupationIncome ?? profileData.expectations?.expectedOccupationIncome));
      req.input('divorcee', 'bit', this.normalizeBoolean(profileData.expectations?.Divorcee ?? profileData.expectations?.divorcee));
      await req.query(`
        IF EXISTS (SELECT 1 FROM dbo.ProfileExpectations WHERE ProfileId = @profileId)
        BEGIN
          UPDATE dbo.ProfileExpectations
          SET
            ExpectedManglik = @expectedManglik,
            ExpectedCaste = ISNULL(@expectedCaste, ExpectedCaste),
            MaxAgeDifference = COALESCE(@maxAgeDifference, MaxAgeDifference),
            ExpectedHeightFt = COALESCE(@expectedHeightFt, ExpectedHeightFt),
            ExpectedHeightIn = COALESCE(@expectedHeightIn, ExpectedHeightIn),
            ExpectedEducation = ISNULL(@expectedEducation, ExpectedEducation),
            ExpectedOccupationIncome = ISNULL(@expectedOccupationIncome, ExpectedOccupationIncome),
            Divorcee = @divorcee,
            UpdatedAt = SYSUTCDATETIME()
          WHERE ProfileId = @profileId
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ProfileExpectations (
            ProfileId, ExpectedManglik, ExpectedCaste, MaxAgeDifference, ExpectedHeightFt, ExpectedHeightIn,
            ExpectedEducation, ExpectedOccupationIncome, Divorcee
          )
          VALUES (
            @profileId, @expectedManglik, @expectedCaste, @maxAgeDifference, @expectedHeightFt, @expectedHeightIn,
            @expectedEducation, @expectedOccupationIncome, @divorcee
          )
        END
      `);

      await this.syncPreferredCities(profileId, profileData.expectations);
    }

    if (profileData.verification) {
      const req = this.pool.request();
      req.input('profileId', 'int', profileId);
      req.input('verificationCode', 'nvarchar', this.normalizeString(profileData.verification?.VerificationCode ?? profileData.verification?.verificationCode));
      req.input('verificationPassed', 'bit', (this.normalizeBoolean(profileData.verification?.VerificationPassed ?? profileData.verification?.verificationPassed) ?? false) ? 1 : 0);
      await req.query(`
        IF EXISTS (SELECT 1 FROM dbo.ProfileVerifications WHERE ProfileId = @profileId)
        BEGIN
          UPDATE dbo.ProfileVerifications
          SET
            VerificationCode = ISNULL(@verificationCode, VerificationCode),
            VerificationPassed = @verificationPassed,
            VerifiedAt = CASE WHEN @verificationPassed = 1 THEN COALESCE(VerifiedAt, SYSUTCDATETIME()) ELSE NULL END,
            UpdatedAt = SYSUTCDATETIME()
          WHERE ProfileId = @profileId
        END
        ELSE
        BEGIN
          INSERT INTO dbo.ProfileVerifications (ProfileId, VerificationCode, VerificationPassed, VerifiedAt)
          VALUES (@profileId, @verificationCode, @verificationPassed, CASE WHEN @verificationPassed = 1 THEN SYSUTCDATETIME() ELSE NULL END)
        END
      `);
    }

    if (profileData.photos) {
      await this.syncPhotos(profileId, profileData.photos);
    }
  }

  private enrichPersonalWithCanonical(personal: any): any {
    if (!personal) {
      return null;
    }
    return {
      ...personal,
      DateOfBirth: personal.DateOfBirth || this.computeDateOfBirth(personal),
      HeightCm: personal.HeightCm || this.computeHeightCm(personal),
    };
  }

  private enrichHoroscopeWithCanonical(horoscope: any): any {
    if (!horoscope) {
      return null;
    }
    return {
      ...horoscope,
      BirthTime: horoscope.BirthTime || this.computeBirthTime(horoscope),
      BirthTimeIsApprox: horoscope.BirthTimeIsApprox ?? horoscope.birthTimeIsApprox ?? false,
    };
  }

  /**
   * Get all profiles with pagination and optional filters
   */
  async searchProfiles(tenantId: number, filters: ProfileSearchFilters): Promise<{
    profiles: ProfileSearchResult[];
    total: number;
  }> {
    const pageNumber = filters.pageNumber || 1;
    const pageSize = filters.pageSize || 10;
    const offset = (pageNumber - 1) * pageSize;

    let query = `
      SELECT 
        p.ProfileId,
        p.UserId,
        p.ProfileCode,
        p.FullName,
        p.Age,
        p.Bio,
        p.LocationText,
        p.OccupationText,
        u.Email,
        p.CreatedAt,
        COUNT(*) OVER() AS TotalCount
      FROM dbo.Profiles p
      INNER JOIN [Identity].[Users] u ON p.UserId = u.Id AND p.TenantId = u.TenantId
      LEFT JOIN dbo.ProfilePersonalDetails pp ON p.ProfileId = pp.ProfileId
      LEFT JOIN dbo.ProfileProfessionalDetails pd ON p.ProfileId = pd.ProfileId
      WHERE p.TenantId = @tenantId
        AND u.IsActive = 1
    `;

    const params: any[] = [
      { name: 'tenantId', type: 'int', value: tenantId },
    ];

    // Add filters
    if (filters.name) {
      query += ` AND p.FullName LIKE @name`;
      params.push({ name: 'name', type: 'nvarchar', value: `%${filters.name}%` });
    }

    if (filters.location) {
      query += ` AND p.LocationText LIKE @location`;
      params.push({ name: 'location', type: 'nvarchar', value: `%${filters.location}%` });
    }

    if (filters.occupation) {
      query += ` AND p.OccupationText LIKE @occupation`;
      params.push({ name: 'occupation', type: 'nvarchar', value: `%${filters.occupation}%` });
    }

    if (filters.ageMin !== undefined) {
      query += ` AND p.Age >= @ageMin`;
      params.push({ name: 'ageMin', type: 'smallint', value: filters.ageMin });
    }

    if (filters.ageMax !== undefined) {
      query += ` AND p.Age <= @ageMax`;
      params.push({ name: 'ageMax', type: 'smallint', value: filters.ageMax });
    }

    if (filters.religion) {
      query += ` AND pp.Religion = @religion`;
      params.push({ name: 'religion', type: 'nvarchar', value: filters.religion });
    }

    if (filters.caste) {
      query += ` AND pp.Caste = @caste`;
      params.push({ name: 'caste', type: 'nvarchar', value: filters.caste });
    }

    if (filters.education) {
      query += ` AND pd.Education LIKE @education`;
      params.push({ name: 'education', type: 'nvarchar', value: `%${filters.education}%` });
    }

    if (filters.maritalStatus) {
      query += ` AND pp.MaritalStatus = @maritalStatus`;
      params.push({ name: 'maritalStatus', type: 'nvarchar', value: filters.maritalStatus });
    }

    query += ` ORDER BY p.CreatedAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @pageSize ROWS ONLY`;

    params.push({ name: 'offset', type: 'int', value: offset });
    params.push({ name: 'pageSize', type: 'int', value: pageSize });

    const request = this.pool.request();
    params.forEach(p => request.input(p.name, p.type, p.value));

    const result = await request.query(query);

    const profiles: ProfileSearchResult[] = result.recordset.map((row: any) => ({
      profileId: row.ProfileId,
      userId: row.UserId,
      profileCode: row.ProfileCode,
      fullName: row.FullName,
      age: row.Age,
      bio: row.Bio,
      locationText: row.LocationText,
      occupationText: row.OccupationText,
      email: row.Email,
      createdAt: row.CreatedAt,
    }));

    const total = result.recordset.length > 0 ? result.recordset[0].TotalCount : 0;

    return { profiles, total };
  }

  /**
   * Get profile by ID with all details
   */
  async getProfileById(tenantId: number, profileId: number): Promise<ProfileDetail | null> {
    // Get basic profile info
    const profileQuery = `
      SELECT 
        p.ProfileId,
        p.UserId,
        p.ProfileCode,
        p.FullName,
        p.Age,
        p.Bio,
        p.LocationText,
        p.OccupationText,
        u.Email,
        p.CreatedAt
      FROM dbo.Profiles p
      INNER JOIN [Identity].[Users] u ON p.UserId = u.Id AND p.TenantId = u.TenantId
      WHERE p.TenantId = @tenantId
        AND p.ProfileId = @profileId
        AND u.IsActive = 1
    `;

    const profileReq = this.pool.request();
    profileReq.input('tenantId', 'int', tenantId);
    profileReq.input('profileId', 'int', profileId);
    const profileResult = await profileReq.query(profileQuery);

    if (profileResult.recordset.length === 0) {
      return null;
    }

    const profile = profileResult.recordset[0];

    // Get personal details
    const personalReq = this.pool.request();
    personalReq.input('profileId', 'int', profileId);
    const personalResult = await personalReq.query(`
      SELECT TOP 1 * FROM dbo.ProfilePersonalDetails WHERE ProfileId = @profileId
    `);

    // Get horoscope details
    const horoscopeReq = this.pool.request();
    horoscopeReq.input('profileId', 'int', profileId);
    const horoscopeResult = await horoscopeReq.query(`
      SELECT TOP 1 * FROM dbo.ProfileHoroscopeDetails WHERE ProfileId = @profileId
    `);

    // Get professional details
    const professionalReq = this.pool.request();
    professionalReq.input('profileId', 'int', profileId);
    const professionalResult = await professionalReq.query(`
      SELECT TOP 1 * FROM dbo.ProfileProfessionalDetails WHERE ProfileId = @profileId
    `);

    // Get contact details
    const contactReq = this.pool.request();
    contactReq.input('profileId', 'int', profileId);
    const contactResult = await contactReq.query(`
      SELECT TOP 1 * FROM dbo.ProfileContactDetails WHERE ProfileId = @profileId
    `);

    // Get family details
    const familyReq = this.pool.request();
    familyReq.input('profileId', 'int', profileId);
    const familyResult = await familyReq.query(`
      SELECT TOP 1 * FROM dbo.ProfileFamilyDetails WHERE ProfileId = @profileId
    `);

    // Get expectations
    const expectationsReq = this.pool.request();
    expectationsReq.input('profileId', 'int', profileId);
    const expectationsResult = await expectationsReq.query(`
      SELECT TOP 1 * FROM dbo.ProfileExpectations WHERE ProfileId = @profileId
    `);

    const phonesReq = this.pool.request();
    phonesReq.input('profileId', 'int', profileId);
    const phonesResult = await phonesReq.query(`
      SELECT PhoneType, PhoneNumber
      FROM dbo.ProfilePhoneNumbers
      WHERE ProfileId = @profileId AND IsDeleted = 0
      ORDER BY ProfilePhoneId
    `);

    const relativesReq = this.pool.request();
    relativesReq.input('profileId', 'int', profileId);
    const relativesResult = await relativesReq.query(`
      SELECT Surname
      FROM dbo.ProfileRelatives
      WHERE ProfileId = @profileId AND IsDeleted = 0
      ORDER BY RelativeId
    `);

    const preferredCitiesReq = this.pool.request();
    preferredCitiesReq.input('profileId', 'int', profileId);
    const preferredCitiesResult = await preferredCitiesReq.query(`
      SELECT CityName
      FROM dbo.ProfilePreferredCities
      WHERE ProfileId = @profileId AND IsDeleted = 0
      ORDER BY PreferredCityId
    `);

    const verificationReq = this.pool.request();
    verificationReq.input('profileId', 'int', profileId);
    const verificationResult = await verificationReq.query(`
      SELECT TOP 1 * FROM dbo.ProfileVerifications WHERE ProfileId = @profileId
    `);

    const photosReq = this.pool.request();
    photosReq.input('profileId', 'int', profileId);
    const photosResult = await photosReq.query(`
      SELECT PhotoSlot, FileName, FileUrl, IsPrimary
      FROM dbo.ProfilePhotos
      WHERE ProfileId = @profileId AND IsDeleted = 0
      ORDER BY PhotoSlot
    `);

    const personal = this.enrichPersonalWithCanonical(personalResult.recordset[0] || null);
    const horoscope = this.enrichHoroscopeWithCanonical(horoscopeResult.recordset[0] || null);
    const contact = contactResult.recordset[0] || null;
    const family = familyResult.recordset[0] || null;
    const expectations = expectationsResult.recordset[0] || null;

    if (contact) {
      for (const phone of phonesResult.recordset) {
        if (phone.PhoneType === 'sms_mobile') {
          contact.SmsMobile = phone.PhoneNumber;
        }
        if (phone.PhoneType === 'mobile_secondary') {
          contact.MobileSecondary = phone.PhoneNumber;
        }
        if (phone.PhoneType === 'phone_primary') {
          contact.PhonePrimary = phone.PhoneNumber;
        }
        if (phone.PhoneType === 'phone_secondary') {
          contact.PhoneSecondary = phone.PhoneNumber;
        }
      }
    }

    if (family) {
      family.RelativesSurnames = relativesResult.recordset.map((row: any) => row.Surname).join(', ');
    }

    if (expectations) {
      expectations.PreferredCities = preferredCitiesResult.recordset.map((row: any) => row.CityName).join(', ');
    }

    return {
      profileId: profile.ProfileId,
      userId: profile.UserId,
      profileCode: profile.ProfileCode,
      fullName: profile.FullName,
      age: profile.Age,
      bio: profile.Bio,
      locationText: profile.LocationText,
      occupationText: profile.OccupationText,
      email: profile.Email,
      createdAt: profile.CreatedAt,
      personal,
      horoscope,
      professional: professionalResult.recordset[0] || null,
      contact,
      family,
      expectations,
      verification: verificationResult.recordset[0] || null,
      photos: photosResult.recordset,
    };
  }

  /**
   * Get profile by user ID
   */
  async getProfileByUserId(tenantId: number, userId: number): Promise<ProfileDetail | null> {
    const query = `
      SELECT ProfileId FROM dbo.Profiles 
      WHERE TenantId = @tenantId AND UserId = @userId
    `;

    const req = this.pool.request();
    req.input('tenantId', 'int', tenantId);
    req.input('userId', 'int', userId);
    const result = await req.query(query);

    if (result.recordset.length === 0) {
      return null;
    }

    return this.getProfileById(tenantId, result.recordset[0].ProfileId);
  }

  /**
   * Create or update profile
   */
  async createOrUpdateProfile(
    tenantId: number,
    userId: number,
    profileData: Partial<ProfileDetail>
  ): Promise<ProfileDetail> {
    // Check if profile exists
    const existingProfile = await this.getProfileByUserId(tenantId, userId);

    if (existingProfile) {
      // Update existing profile
      return this.updateProfile(tenantId, existingProfile.profileId, profileData);
    } else {
      // Create new profile
      return this.insertProfile(tenantId, userId, profileData);
    }
  }

  private async insertProfile(
    tenantId: number,
    userId: number,
    profileData: Partial<ProfileDetail>
  ): Promise<ProfileDetail> {
    const profileCode = await this.generateProfileCode(tenantId);

    const query = `
      INSERT INTO dbo.Profiles 
      (TenantId, UserId, ProfileCode, FullName, Age, Bio, LocationText, OccupationText, CreatedAt, UpdatedAt)
      VALUES
      (@tenantId, @userId, @profileCode, @fullName, @age, @bio, @location, @occupation, SYSUTCDATETIME(), SYSUTCDATETIME());
      
      SELECT IDENT_CURRENT('dbo.Profiles') AS ProfileId;
    `;

    const req = this.pool.request();
    req.input('tenantId', 'int', tenantId);
    req.input('userId', 'int', userId);
    req.input('profileCode', 'nvarchar', profileCode);
    req.input('fullName', 'nvarchar', profileData.fullName || '');
    req.input('age', 'smallint', profileData.age || null);
    req.input('bio', 'nvarchar', profileData.bio || null);
    req.input('location', 'nvarchar', profileData.locationText || null);
    req.input('occupation', 'nvarchar', profileData.occupationText || null);

    const result = await req.query(query);
    const profileId = result.recordset[0].ProfileId;

    await this.syncHybridCanonicalFields(profileId, profileData);

    return this.getProfileById(tenantId, profileId) as Promise<ProfileDetail>;
  }

  private async generateProfileCode(tenantId: number): Promise<string> {
    const seqResult = await this.pool.request()
      .input('tenantId', 'int', tenantId)
      .query(`
        MERGE INTO dbo.TenantProfileSequences AS target
        USING (SELECT @tenantId AS TenantId) AS source
        ON target.TenantId = source.TenantId
        WHEN MATCHED THEN UPDATE SET LastNumber = target.LastNumber + 1
        WHEN NOT MATCHED THEN INSERT (TenantId, LastNumber) VALUES (@tenantId, 1);

        SELECT LastNumber FROM dbo.TenantProfileSequences WHERE TenantId = @tenantId;
      `);
    const lastNumber: number = seqResult.recordset[0].LastNumber;

    const tenantResult = await this.pool.request()
      .input('tenantId', 'int', tenantId)
      .query(`SELECT TenantCode FROM dbo.Tenants WHERE TenantId = @tenantId`);
    const tenantCode: string = tenantResult.recordset[0].TenantCode;

    const maxPrefix = 20;
    const prefix = tenantCode.length > maxPrefix ? tenantCode.substring(0, maxPrefix) : tenantCode;
    const numberStr = String(lastNumber);
    const minDigits = Math.max(4, numberStr.length);
    return `${prefix}-${numberStr.padStart(minDigits, '0')}`;
  }

  private async updateProfile(
    tenantId: number,
    profileId: number,
    profileData: Partial<ProfileDetail>
  ): Promise<ProfileDetail> {
    const query = `
      UPDATE dbo.Profiles
      SET 
        FullName = ISNULL(@fullName, FullName),
        Age = ISNULL(@age, Age),
        Bio = ISNULL(@bio, Bio),
        LocationText = ISNULL(@location, LocationText),
        OccupationText = ISNULL(@occupation, OccupationText),
        UpdatedAt = SYSUTCDATETIME()
      WHERE TenantId = @tenantId AND ProfileId = @profileId
    `;

    const req = this.pool.request();
    req.input('tenantId', 'int', tenantId);
    req.input('profileId', 'int', profileId);
    req.input('fullName', 'nvarchar', profileData.fullName || null);
    req.input('age', 'smallint', profileData.age || null);
    req.input('bio', 'nvarchar', profileData.bio || null);
    req.input('location', 'nvarchar', profileData.locationText || null);
    req.input('occupation', 'nvarchar', profileData.occupationText || null);

    await req.query(query);

    await this.syncHybridCanonicalFields(profileId, profileData);

    return this.getProfileById(tenantId, profileId) as Promise<ProfileDetail>;
  }
}
