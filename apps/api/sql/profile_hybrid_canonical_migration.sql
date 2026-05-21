/*
  Hybrid profile canonical migration (MSSQL)
  -----------------------------------------
  Purpose:
    - Keep existing split fields for UI compatibility.
    - Add canonical fields for reliable querying/filtering.

  Tables affected:
    - dbo.ProfilePersonalDetails
      - DateOfBirth DATE NULL
      - HeightCm SMALLINT NULL
    - dbo.ProfileHoroscopeDetails
      - BirthTime TIME(0) NULL
      - BirthTimeIsApprox BIT NOT NULL DEFAULT(0)
*/

USE MatrimonySaaS;
GO

/* 1) Add canonical columns (idempotent) */
IF COL_LENGTH('dbo.ProfilePersonalDetails', 'Gender') IS NULL
BEGIN
  ALTER TABLE dbo.ProfilePersonalDetails
  ADD Gender NVARCHAR(10) NULL
      CONSTRAINT CHK_ProfilePersonal_Gender CHECK (Gender IS NULL OR Gender IN ('Male', 'Female', 'Other'));
END;
GO

IF COL_LENGTH('dbo.ProfilePersonalDetails', 'DateOfBirth') IS NULL
BEGIN
  ALTER TABLE dbo.ProfilePersonalDetails
  ADD DateOfBirth DATE NULL;
END;
GO

IF COL_LENGTH('dbo.ProfilePersonalDetails', 'HeightCm') IS NULL
BEGIN
  ALTER TABLE dbo.ProfilePersonalDetails
  ADD HeightCm SMALLINT NULL;
END;
GO

IF COL_LENGTH('dbo.ProfileHoroscopeDetails', 'BirthTime') IS NULL
BEGIN
  ALTER TABLE dbo.ProfileHoroscopeDetails
  ADD BirthTime TIME(0) NULL;
END;
GO

IF COL_LENGTH('dbo.ProfileHoroscopeDetails', 'BirthTimeIsApprox') IS NULL
BEGIN
  ALTER TABLE dbo.ProfileHoroscopeDetails
  ADD BirthTimeIsApprox BIT NOT NULL
      CONSTRAINT DF_ProfileHoroscope_BirthTimeIsApprox DEFAULT (0);
END;
GO

/* 2) Backfill DateOfBirth from split DOB fields */
;WITH DobSource AS (
  SELECT
    pd.ProfileId,
    pd.DobDay,
    pd.DobYear,
    CASE
      WHEN TRY_CONVERT(INT, pd.DobMonth) BETWEEN 1 AND 12 THEN TRY_CONVERT(INT, pd.DobMonth)
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'jan' THEN 1
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'feb' THEN 2
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'mar' THEN 3
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'apr' THEN 4
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'may' THEN 5
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'jun' THEN 6
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'jul' THEN 7
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'aug' THEN 8
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'sep' THEN 9
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'oct' THEN 10
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'nov' THEN 11
      WHEN LOWER(LEFT(LTRIM(RTRIM(pd.DobMonth)), 3)) = 'dec' THEN 12
      ELSE NULL
    END AS DobMonthNo
  FROM dbo.ProfilePersonalDetails pd
)
UPDATE pd
SET DateOfBirth = TRY_CONVERT(DATE,
  CONCAT(
    FORMAT(ds.DobYear, '0000'), '-',
    FORMAT(ds.DobMonthNo, '00'), '-',
    FORMAT(ds.DobDay, '00')
  )
)
FROM dbo.ProfilePersonalDetails pd
INNER JOIN DobSource ds ON ds.ProfileId = pd.ProfileId
WHERE pd.DateOfBirth IS NULL
  AND ds.DobYear BETWEEN 1900 AND 2100
  AND ds.DobDay BETWEEN 1 AND 31
  AND ds.DobMonthNo BETWEEN 1 AND 12;
GO

/* 3) Backfill HeightCm from ft/in */
UPDATE pd
SET HeightCm = CASE
  WHEN pd.HeightFt IS NULL AND pd.HeightIn IS NULL THEN NULL
  WHEN COALESCE(pd.HeightFt, 0) BETWEEN 0 AND 8
   AND COALESCE(pd.HeightIn, 0) BETWEEN 0 AND 11
  THEN CAST(ROUND(((COALESCE(pd.HeightFt, 0) * 12) + COALESCE(pd.HeightIn, 0)) * 2.54, 0) AS SMALLINT)
  ELSE NULL
END
FROM dbo.ProfilePersonalDetails pd
WHERE pd.HeightCm IS NULL;
GO

/* 4) Backfill BirthTime from split hour/minute/period */
;WITH BirthSource AS (
  SELECT
    h.ProfileId,
    h.BirthHour,
    h.BirthMinute,
    UPPER(LTRIM(RTRIM(h.BirthPeriod))) AS BirthPeriod,
    CASE
      WHEN h.BirthHour IS NULL OR h.BirthMinute IS NULL OR h.BirthPeriod IS NULL THEN NULL
      WHEN UPPER(LTRIM(RTRIM(h.BirthPeriod))) = 'AM' AND h.BirthHour = 12 THEN 0
      WHEN UPPER(LTRIM(RTRIM(h.BirthPeriod))) = 'AM' THEN h.BirthHour
      WHEN UPPER(LTRIM(RTRIM(h.BirthPeriod))) = 'PM' AND h.BirthHour = 12 THEN 12
      WHEN UPPER(LTRIM(RTRIM(h.BirthPeriod))) = 'PM' THEN h.BirthHour + 12
      ELSE NULL
    END AS Hour24
  FROM dbo.ProfileHoroscopeDetails h
)
UPDATE h
SET BirthTime = TRY_CONVERT(TIME(0), CONCAT(FORMAT(bs.Hour24, '00'), ':', FORMAT(bs.BirthMinute, '00'), ':00'))
FROM dbo.ProfileHoroscopeDetails h
INNER JOIN BirthSource bs ON bs.ProfileId = h.ProfileId
WHERE h.BirthTime IS NULL
  AND bs.Hour24 BETWEEN 0 AND 23
  AND bs.BirthMinute BETWEEN 0 AND 59;
GO

/* 5) Helpful indexes for filtering/search */
IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_ProfilePersonalDetails_DateOfBirth'
    AND object_id = OBJECT_ID('dbo.ProfilePersonalDetails')
)
BEGIN
  CREATE INDEX IX_ProfilePersonalDetails_DateOfBirth
    ON dbo.ProfilePersonalDetails(DateOfBirth);
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'IX_ProfilePersonalDetails_HeightCm'
    AND object_id = OBJECT_ID('dbo.ProfilePersonalDetails')
)
BEGIN
  CREATE INDEX IX_ProfilePersonalDetails_HeightCm
    ON dbo.ProfilePersonalDetails(HeightCm);
END;
GO

/* 6) Optional guardrails (uncomment after data cleanup)
ALTER TABLE dbo.ProfilePersonalDetails
  ADD CONSTRAINT CHK_ProfilePersonal_HeightCm CHECK (HeightCm IS NULL OR HeightCm BETWEEN 100 AND 250);
GO
*/
