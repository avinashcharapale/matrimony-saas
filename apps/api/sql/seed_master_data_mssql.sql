/*
  Master Data Seed Script (SQL Server)
  ------------------------------------
  Purpose:
  - Seed and maintain baseline master data for SaaS setup.
  - Safe to run multiple times (idempotent).

  What it seeds:
  - Platform owner roles and admin (dbo.PlatformRoles, dbo.PlatformAdmins, dbo.PlatformAdminRoles)
  - Global plans (dbo.Plans)
  - Default tenant roles for active tenants (dbo.Roles)
  - Default tenant user plans for active tenants (dbo.TenantUserPlans)

  Run after schema creation script.
*/

IF DB_ID(N'MatrimonySaaS') IS NULL
BEGIN
  THROW 50010, 'Database MatrimonySaaS does not exist. Run schema script first.', 1;
END;
GO

USE MatrimonySaaS;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
GO

BEGIN TRY
  BEGIN TRANSACTION;

  /* ==============================
     0) Platform owner identity and roles
     ============================== */
  ;WITH SourcePlatformRoles AS (
    SELECT CAST(v.RoleName AS NVARCHAR(50)) AS RoleName,
           CAST(v.IsActive AS BIT) AS IsActive
    FROM (VALUES
      (N'Owner', 1),
      (N'BillingAdmin', 1),
      (N'SupportAdmin', 1),
      (N'OpsAdmin', 1)
    ) v(RoleName, IsActive)
  )
  UPDATE pr
  SET pr.IsActive = spr.IsActive
  FROM dbo.PlatformRoles pr
  INNER JOIN SourcePlatformRoles spr ON spr.RoleName = pr.RoleName;

  ;WITH SourcePlatformRoles AS (
    SELECT CAST(v.RoleName AS NVARCHAR(50)) AS RoleName,
           CAST(v.IsActive AS BIT) AS IsActive
    FROM (VALUES
      (N'Owner', 1),
      (N'BillingAdmin', 1),
      (N'SupportAdmin', 1),
      (N'OpsAdmin', 1)
    ) v(RoleName, IsActive)
  )
  INSERT INTO dbo.PlatformRoles (RoleName, IsActive)
  SELECT spr.RoleName, spr.IsActive
  FROM SourcePlatformRoles spr
  WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.PlatformRoles pr
    WHERE pr.RoleName = spr.RoleName
  );

  UPDATE pa
  SET
    pa.IsActive = 1,
    pa.MustChangePassword = 1
  FROM dbo.PlatformAdmins pa
  WHERE pa.Email = N'owner@saas.local';

  INSERT INTO dbo.PlatformAdmins (
    Email,
    PasswordHash,
    DisplayName,
    MustChangePassword,
    IsActive
  )
  SELECT
    N'owner@saas.local',
    N'CHANGE_ME_HASH',
    N'SaaS Owner',
    1,
    1
  WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.PlatformAdmins pa
    WHERE pa.Email = N'owner@saas.local'
  );

  INSERT INTO dbo.PlatformAdminRoles (PlatformAdminId, PlatformRoleId)
  SELECT pa.PlatformAdminId, pr.PlatformRoleId
  FROM dbo.PlatformAdmins pa
  INNER JOIN dbo.PlatformRoles pr ON pr.RoleName = N'Owner'
  WHERE pa.Email = N'owner@saas.local'
    AND NOT EXISTS (
      SELECT 1
      FROM dbo.PlatformAdminRoles par
      WHERE par.PlatformAdminId = pa.PlatformAdminId
        AND par.PlatformRoleId = pr.PlatformRoleId
    );

  /* ==============================
     1) Global plans (superadmin-managed)
     ============================== */
  ;WITH SourcePlans AS (
    SELECT
      CAST(v.PlanName AS NVARCHAR(100)) AS PlanName,
      CAST(v.Price AS DECIMAL(10,2)) AS Price,
      CAST(v.DurationMonths AS INT) AS DurationMonths,
      CAST(v.IsActive AS BIT) AS IsActive
    FROM (VALUES
      (N'Starter', 1999.00, 1, 1),
      (N'Growth', 19999.00, 12, 1),
      (N'Enterprise', 59999.00, 12, 1)
    ) v(PlanName, Price, DurationMonths, IsActive)
  )
  UPDATE p
  SET
    p.Price = sp.Price,
    p.DurationMonths = sp.DurationMonths,
    p.IsActive = sp.IsActive
  FROM dbo.Plans p
  INNER JOIN SourcePlans sp ON sp.PlanName = p.PlanName;

  ;WITH SourcePlans AS (
    SELECT
      CAST(v.PlanName AS NVARCHAR(100)) AS PlanName,
      CAST(v.Price AS DECIMAL(10,2)) AS Price,
      CAST(v.DurationMonths AS INT) AS DurationMonths,
      CAST(v.IsActive AS BIT) AS IsActive
    FROM (VALUES
      (N'Starter', 1999.00, 1, 1),
      (N'Growth', 19999.00, 12, 1),
      (N'Enterprise', 59999.00, 12, 1)
    ) v(PlanName, Price, DurationMonths, IsActive)
  )
  INSERT INTO dbo.Plans (PlanName, Price, DurationMonths, IsActive)
  SELECT sp.PlanName, sp.Price, sp.DurationMonths, sp.IsActive
  FROM SourcePlans sp
  WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.Plans p
    WHERE p.PlanName = sp.PlanName
  );

  /* ==============================
     1.1) Bootstrap one active tenant (for fresh DBs)
     ============================== */
  IF NOT EXISTS (
    SELECT 1
    FROM dbo.Tenants t
    WHERE t.IsActive = 1
  )
  BEGIN
    INSERT INTO dbo.Tenants (
      TenantCode,
      Domain,
      SubscriptionStatus,
      TrialEndDate,
      IsActive
    )
    VALUES (
      N'default-tenant',
      N'default.local',
      N'trial',
      DATEADD(DAY, 30, CAST(SYSUTCDATETIME() AS DATE)),
      1
    );
  END;

  /* ==============================
     2) Default tenant roles
     ============================== */
  ;WITH ActiveTenants AS (
    SELECT t.TenantId
    FROM dbo.Tenants t
    WHERE t.IsActive = 1
  ),
  SourceRoles AS (
    SELECT
      atn.TenantId,
      CAST(v.RoleName AS NVARCHAR(50)) AS RoleName
    FROM ActiveTenants atn
    CROSS APPLY (VALUES
      (N'Owner'),
      (N'Admin'),
      (N'Manager'),
      (N'Support')
    ) v(RoleName)
  )
  INSERT INTO dbo.Roles (TenantId, RoleName)
  SELECT sr.TenantId, sr.RoleName
  FROM SourceRoles sr
  WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.Roles r
    WHERE r.TenantId = sr.TenantId
      AND r.RoleName = sr.RoleName
  );

  /* ==============================
     3) Default tenant user plans
     ============================== */
  ;WITH ActiveTenants AS (
    SELECT t.TenantId
    FROM dbo.Tenants t
    WHERE t.IsActive = 1
  ),
  SourceTenantUserPlans AS (
    SELECT
      atn.TenantId,
      CAST(v.PlanName AS NVARCHAR(100)) AS PlanName,
      CAST(v.Price AS DECIMAL(10,2)) AS Price,
      CAST(v.DurationMonths AS INT) AS DurationMonths,
      CAST(v.FeaturesJson AS NVARCHAR(MAX)) AS FeaturesJson,
      CAST(v.IsActive AS BIT) AS IsActive
    FROM ActiveTenants atn
    CROSS APPLY (VALUES
      (
        N'Free',
        0.00,
        1,
        N'{"dailyInterests":5,"canMessage":false,"profileBoost":false}',
        1
      ),
      (
        N'Premium',
        499.00,
        1,
        N'{"dailyInterests":50,"canMessage":true,"profileBoost":false}',
        1
      ),
      (
        N'Elite',
        4499.00,
        12,
        N'{"dailyInterests":200,"canMessage":true,"profileBoost":true}',
        1
      )
    ) v(PlanName, Price, DurationMonths, FeaturesJson, IsActive)
  )
  UPDATE tup
  SET
    tup.Price = stp.Price,
    tup.DurationMonths = stp.DurationMonths,
    tup.FeaturesJson = stp.FeaturesJson,
    tup.IsActive = stp.IsActive
  FROM dbo.TenantUserPlans tup
  INNER JOIN SourceTenantUserPlans stp
    ON stp.TenantId = tup.TenantId
   AND stp.PlanName = tup.PlanName;

  ;WITH ActiveTenants AS (
    SELECT t.TenantId
    FROM dbo.Tenants t
    WHERE t.IsActive = 1
  ),
  SourceTenantUserPlans AS (
    SELECT
      atn.TenantId,
      CAST(v.PlanName AS NVARCHAR(100)) AS PlanName,
      CAST(v.Price AS DECIMAL(10,2)) AS Price,
      CAST(v.DurationMonths AS INT) AS DurationMonths,
      CAST(v.FeaturesJson AS NVARCHAR(MAX)) AS FeaturesJson,
      CAST(v.IsActive AS BIT) AS IsActive
    FROM ActiveTenants atn
    CROSS APPLY (VALUES
      (
        N'Free',
        0.00,
        1,
        N'{"dailyInterests":5,"canMessage":false,"profileBoost":false}',
        1
      ),
      (
        N'Premium',
        499.00,
        1,
        N'{"dailyInterests":50,"canMessage":true,"profileBoost":false}',
        1
      ),
      (
        N'Elite',
        4499.00,
        12,
        N'{"dailyInterests":200,"canMessage":true,"profileBoost":true}',
        1
      )
    ) v(PlanName, Price, DurationMonths, FeaturesJson, IsActive)
  )
  INSERT INTO dbo.TenantUserPlans (
    TenantId,
    PlanName,
    Price,
    DurationMonths,
    FeaturesJson,
    IsActive
  )
  SELECT
    stp.TenantId,
    stp.PlanName,
    stp.Price,
    stp.DurationMonths,
    stp.FeaturesJson,
    stp.IsActive
  FROM SourceTenantUserPlans stp
  WHERE NOT EXISTS (
    SELECT 1
    FROM dbo.TenantUserPlans tup
    WHERE tup.TenantId = stp.TenantId
      AND tup.PlanName = stp.PlanName
  );

  COMMIT TRANSACTION;
  PRINT 'Master data seed completed successfully.';
END TRY
BEGIN CATCH
  IF @@TRANCOUNT > 0
    ROLLBACK TRANSACTION;

  DECLARE @err NVARCHAR(4000) = ERROR_MESSAGE();
  DECLARE @sev INT = ERROR_SEVERITY();
  DECLARE @state INT = ERROR_STATE();

  RAISERROR(@err, @sev, @state);
END CATCH;
GO
