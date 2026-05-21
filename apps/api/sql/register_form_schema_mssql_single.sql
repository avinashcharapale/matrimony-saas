/* Single-file MSSQL script: dev reset + full recreate */

/*
  Development reset + recreate script for SQL Server
  -------------------------------------------------
  This script is intended for NON-PRODUCTION environments.
  It drops view/tables in dependency-safe order, then recreates schema.
  Standalone script: run this file directly in SSMS.
*/

IF DB_ID(N'MatrimonySaaS') IS NULL
BEGIN
  CREATE DATABASE MatrimonySaaS;
END;
GO

USE MatrimonySaaS;
GO

/* ==============================
   Drop all foreign keys first
   ============================== */
DECLARE @dropFkSql NVARCHAR(MAX) = N'';

SELECT @dropFkSql = @dropFkSql +
  N'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + N'.' + QUOTENAME(OBJECT_NAME(parent_object_id)) +
  N' DROP CONSTRAINT ' + QUOTENAME(name) + N';' + CHAR(10)
FROM sys.foreign_keys;

IF @dropFkSql <> N''
BEGIN
  EXEC sp_executesql @dropFkSql;
END;
GO

/* ==============================
   Drop read model/view first
   ============================== */
IF OBJECT_ID('dbo.vProfileSearch', 'V') IS NOT NULL
  DROP VIEW dbo.vProfileSearch;
GO

/* ==============================
   Drop tables in reverse dependency order
   ============================== */

IF OBJECT_ID('dbo.EventRsvps', 'U') IS NOT NULL DROP TABLE dbo.EventRsvps;
IF OBJECT_ID('dbo.SuccessStories', 'U') IS NOT NULL DROP TABLE dbo.SuccessStories;
IF OBJECT_ID('dbo.ProfileViews', 'U') IS NOT NULL DROP TABLE dbo.ProfileViews;
IF OBJECT_ID('dbo.Messages', 'U') IS NOT NULL DROP TABLE dbo.Messages;
IF OBJECT_ID('dbo.OAuth2Tokens', 'U') IS NOT NULL DROP TABLE dbo.OAuth2Tokens;
IF OBJECT_ID('dbo.ApiKeys', 'U') IS NOT NULL DROP TABLE dbo.ApiKeys;
IF OBJECT_ID('dbo.UserPermissions', 'U') IS NOT NULL DROP TABLE dbo.UserPermissions;
IF OBJECT_ID('dbo.Permissions', 'U') IS NOT NULL DROP TABLE dbo.Permissions;
IF OBJECT_ID('dbo.OAuth2Providers', 'U') IS NOT NULL DROP TABLE dbo.OAuth2Providers;
IF OBJECT_ID('dbo.UserSessions', 'U') IS NOT NULL DROP TABLE dbo.UserSessions;
IF OBJECT_ID('dbo.AuthenticationMethods', 'U') IS NOT NULL DROP TABLE dbo.AuthenticationMethods;
IF OBJECT_ID('dbo.RefreshTokens', 'U') IS NOT NULL DROP TABLE dbo.RefreshTokens;
IF OBJECT_ID('dbo.InterestRequests', 'U') IS NOT NULL DROP TABLE dbo.InterestRequests;
IF OBJECT_ID('dbo.Notifications', 'U') IS NOT NULL DROP TABLE dbo.Notifications;
IF OBJECT_ID('dbo.LoginHistory', 'U') IS NOT NULL DROP TABLE dbo.LoginHistory;
IF OBJECT_ID('dbo.UserSettings', 'U') IS NOT NULL DROP TABLE dbo.UserSettings;
IF OBJECT_ID('dbo.ProfilePhotos', 'U') IS NOT NULL DROP TABLE dbo.ProfilePhotos;
IF OBJECT_ID('dbo.ProfileVerifications', 'U') IS NOT NULL DROP TABLE dbo.ProfileVerifications;
IF OBJECT_ID('dbo.ProfilePreferredCities', 'U') IS NOT NULL DROP TABLE dbo.ProfilePreferredCities;
IF OBJECT_ID('dbo.ProfileExpectations', 'U') IS NOT NULL DROP TABLE dbo.ProfileExpectations;
IF OBJECT_ID('dbo.ProfileRelatives', 'U') IS NOT NULL DROP TABLE dbo.ProfileRelatives;
IF OBJECT_ID('dbo.ProfileFamilyDetails', 'U') IS NOT NULL DROP TABLE dbo.ProfileFamilyDetails;
IF OBJECT_ID('dbo.ProfilePhoneNumbers', 'U') IS NOT NULL DROP TABLE dbo.ProfilePhoneNumbers;
IF OBJECT_ID('dbo.ProfileContactDetails', 'U') IS NOT NULL DROP TABLE dbo.ProfileContactDetails;
IF OBJECT_ID('dbo.ProfileProfessionalDetails', 'U') IS NOT NULL DROP TABLE dbo.ProfileProfessionalDetails;
IF OBJECT_ID('dbo.ProfileHoroscopeDetails', 'U') IS NOT NULL DROP TABLE dbo.ProfileHoroscopeDetails;
IF OBJECT_ID('dbo.ProfilePersonalDetails', 'U') IS NOT NULL DROP TABLE dbo.ProfilePersonalDetails;
IF OBJECT_ID('dbo.CasteSubCasteMap', 'U') IS NOT NULL DROP TABLE dbo.CasteSubCasteMap;
IF OBJECT_ID('dbo.ReligionCasteMap', 'U') IS NOT NULL DROP TABLE dbo.ReligionCasteMap;
IF OBJECT_ID('dbo.MasterDataTranslations', 'U') IS NOT NULL DROP TABLE dbo.MasterDataTranslations;
IF OBJECT_ID('dbo.MasterData', 'U') IS NOT NULL DROP TABLE dbo.MasterData;
IF OBJECT_ID('dbo.Events', 'U') IS NOT NULL DROP TABLE dbo.Events;
IF OBJECT_ID('dbo.Profiles', 'U') IS NOT NULL DROP TABLE dbo.Profiles;

IF OBJECT_ID('dbo.UserRoles', 'U') IS NOT NULL DROP TABLE dbo.UserRoles;
IF OBJECT_ID('dbo.Roles', 'U') IS NOT NULL DROP TABLE dbo.Roles;
IF OBJECT_ID('dbo.PlatformAdminRoles', 'U') IS NOT NULL DROP TABLE dbo.PlatformAdminRoles;
IF OBJECT_ID('dbo.PlatformAdmins', 'U') IS NOT NULL DROP TABLE dbo.PlatformAdmins;
IF OBJECT_ID('dbo.PlatformRoles', 'U') IS NOT NULL DROP TABLE dbo.PlatformRoles;
IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL DROP TABLE dbo.Payments;
IF OBJECT_ID('dbo.UserSubscriptions', 'U') IS NOT NULL DROP TABLE dbo.UserSubscriptions;
IF OBJECT_ID('dbo.TenantUserPlans', 'U') IS NOT NULL DROP TABLE dbo.TenantUserPlans;
IF OBJECT_ID('dbo.AuditLogs', 'U') IS NOT NULL DROP TABLE dbo.AuditLogs;
IF OBJECT_ID('dbo.TenantSubscriptions', 'U') IS NOT NULL DROP TABLE dbo.TenantSubscriptions;
IF OBJECT_ID('dbo.Plans', 'U') IS NOT NULL DROP TABLE dbo.Plans;
IF OBJECT_ID('dbo.Users', 'U') IS NOT NULL DROP TABLE dbo.Users;
IF OBJECT_ID('dbo.Tenants', 'U') IS NOT NULL DROP TABLE dbo.Tenants;
GO

/* ===== Recreate schema (inlined) ===== */
/*
  Consolidated SQL Server schema for Matrimony SaaS (3NF-oriented)
  Safe to run in SSMS. Creates DB if missing and all core tables.
*/

IF DB_ID(N'MatrimonySaaS') IS NULL
BEGIN
  CREATE DATABASE MatrimonySaaS;
END;
GO

USE MatrimonySaaS;
GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* ==============================
   SaaS Infrastructure
   ============================== */

IF OBJECT_ID('dbo.PlatformRoles', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PlatformRoles (
    PlatformRoleId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_PlatformRoles_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_PlatformRoles_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_PlatformRoles_RoleName UNIQUE (RoleName)
  );
END;
GO

IF OBJECT_ID('dbo.PlatformAdmins', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PlatformAdmins (
    PlatformAdminId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Email NVARCHAR(120) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    DisplayName NVARCHAR(120) NULL,
    MustChangePassword BIT NOT NULL CONSTRAINT DF_PlatformAdmins_MustChangePassword DEFAULT (1),
    IsActive BIT NOT NULL CONSTRAINT DF_PlatformAdmins_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_PlatformAdmins_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_PlatformAdmins_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_PlatformAdmins_Email UNIQUE (Email),
    CONSTRAINT CHK_PlatformAdmins_EmailFormat CHECK (Email LIKE '%_@__%.__%')
  );
END;
GO

IF OBJECT_ID('dbo.PlatformAdminRoles', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.PlatformAdminRoles (
    PlatformAdminId INT NOT NULL,
    PlatformRoleId INT NOT NULL,
    AssignedAt DATETIME2(3) NOT NULL CONSTRAINT DF_PlatformAdminRoles_AssignedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_PlatformAdminRoles PRIMARY KEY (PlatformAdminId, PlatformRoleId),
    CONSTRAINT FK_PlatformAdminRoles_Admin FOREIGN KEY (PlatformAdminId) REFERENCES dbo.PlatformAdmins(PlatformAdminId) ON DELETE CASCADE,
    CONSTRAINT FK_PlatformAdminRoles_Role FOREIGN KEY (PlatformRoleId) REFERENCES dbo.PlatformRoles(PlatformRoleId) ON DELETE CASCADE
  );
END;
GO

IF OBJECT_ID('dbo.Tenants', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Tenants (
    TenantId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantCode NVARCHAR(50) NOT NULL,
    Domain NVARCHAR(100) NULL,
    SubscriptionStatus NVARCHAR(50) NULL,
    TrialEndDate DATE NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Tenants_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Tenants_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Tenants_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Tenants_TenantCode UNIQUE (TenantCode),
    CONSTRAINT UQ_Tenants_Domain UNIQUE (Domain)
  );
END;
GO

IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Users (
    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    Email NVARCHAR(120) NOT NULL,
    PasswordHash NVARCHAR(255) NOT NULL,
    IsSuperAdmin BIT NOT NULL CONSTRAINT DF_Users_IsSuperAdmin DEFAULT (0),
    IsActive BIT NOT NULL CONSTRAINT DF_Users_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Users_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Users_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId),
    CONSTRAINT UQ_Users_TenantEmail UNIQUE (TenantId, Email),
    CONSTRAINT UQ_Users_IdTenant UNIQUE (Id, TenantId),
    CONSTRAINT CHK_Users_EmailFormat CHECK (Email LIKE '%_@__%.__%')
  );
END;
GO

IF OBJECT_ID('dbo.Roles', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Roles (
    RoleId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    RoleName NVARCHAR(50) NOT NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Roles_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Roles_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId),
    CONSTRAINT UQ_Roles_TenantRole UNIQUE (TenantId, RoleName)
  );
END;
GO

IF OBJECT_ID('dbo.UserRoles', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserRoles (
    UserId INT NOT NULL,
    RoleId INT NOT NULL,
    AssignedAt DATETIME2(3) NOT NULL CONSTRAINT DF_UserRoles_AssignedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_UserRoles PRIMARY KEY (UserId, RoleId),
    CONSTRAINT FK_UserRoles_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserRoles_Role FOREIGN KEY (RoleId) REFERENCES dbo.Roles(RoleId) ON DELETE CASCADE
  );
END;
GO

IF OBJECT_ID('dbo.Plans', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Plans (
    PlanId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    PlanName NVARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    DurationMonths INT NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Plans_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Plans_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Plans_PlanName UNIQUE (PlanName),
    CONSTRAINT CHK_Plans_Price CHECK (Price >= 0),
    CONSTRAINT CHK_Plans_Duration CHECK (DurationMonths > 0)
  );
END;
GO

IF OBJECT_ID('dbo.TenantSubscriptions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.TenantSubscriptions (
    SubscriptionId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    PlanId INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_TenantSubscriptions_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_TenantSubscriptions_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_TenantSubscriptions_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_TenantSubscriptions_IdTenant UNIQUE (SubscriptionId, TenantId),
    CONSTRAINT FK_TenantSubscriptions_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId),
    CONSTRAINT FK_TenantSubscriptions_Plan FOREIGN KEY (PlanId) REFERENCES dbo.Plans(PlanId),
    CONSTRAINT CHK_TenantSubscriptions_DateRange CHECK (EndDate >= StartDate)
  );
END;
GO

IF OBJECT_ID('dbo.TenantUserPlans', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.TenantUserPlans (
    TenantUserPlanId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    PlanName NVARCHAR(100) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    DurationMonths INT NOT NULL,
    FeaturesJson NVARCHAR(MAX) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_TenantUserPlans_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_TenantUserPlans_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_TenantUserPlans_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_TenantUserPlans_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId),
    CONSTRAINT UQ_TenantUserPlans_PlanName UNIQUE (TenantId, PlanName),
    CONSTRAINT UQ_TenantUserPlans_IdTenant UNIQUE (TenantUserPlanId, TenantId),
    CONSTRAINT CHK_TenantUserPlans_Price CHECK (Price >= 0),
    CONSTRAINT CHK_TenantUserPlans_Duration CHECK (DurationMonths > 0)
  );
END;
GO

IF OBJECT_ID('dbo.UserSubscriptions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserSubscriptions (
    UserSubscriptionId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    UserId INT NOT NULL,
    TenantUserPlanId INT NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_UserSubscriptions_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_UserSubscriptions_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_UserSubscriptions_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_UserSubscriptions_IdTenant UNIQUE (UserSubscriptionId, TenantId),
    CONSTRAINT FK_UserSubscriptions_UserTenant FOREIGN KEY (UserId, TenantId) REFERENCES dbo.Users(Id, TenantId),
    CONSTRAINT FK_UserSubscriptions_TenantUserPlan FOREIGN KEY (TenantUserPlanId, TenantId) REFERENCES dbo.TenantUserPlans(TenantUserPlanId, TenantId),
    CONSTRAINT CHK_UserSubscriptions_DateRange CHECK (EndDate >= StartDate)
  );
END;
GO

IF OBJECT_ID('dbo.Payments', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Payments (
    PaymentId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    UserId INT NULL,
    SubscriptionId INT NULL,
    UserSubscriptionId INT NULL,
    Amount DECIMAL(12,2) NOT NULL,
    PaymentGateway NVARCHAR(50) NOT NULL,
    TransactionReference NVARCHAR(100) NULL,
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_Payments_Status DEFAULT ('pending'),
    VerifiedBy NVARCHAR(100) NULL,
    Notes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Payments_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Payments_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId),
    CONSTRAINT FK_Payments_UserTenant FOREIGN KEY (UserId, TenantId) REFERENCES dbo.Users(Id, TenantId),
    CONSTRAINT FK_Payments_SubscriptionTenant FOREIGN KEY (SubscriptionId, TenantId) REFERENCES dbo.TenantSubscriptions(SubscriptionId, TenantId),
    CONSTRAINT FK_Payments_UserSubscriptionTenant FOREIGN KEY (UserSubscriptionId, TenantId) REFERENCES dbo.UserSubscriptions(UserSubscriptionId, TenantId),
    CONSTRAINT CHK_Payments_OneSubscriptionType CHECK (
      (SubscriptionId IS NOT NULL AND UserSubscriptionId IS NULL) OR
      (SubscriptionId IS NULL AND UserSubscriptionId IS NOT NULL)
    ),
    CONSTRAINT CHK_Payments_Status CHECK (Status IN ('pending', 'initiated', 'success', 'failed', 'refunded', 'cancelled')),
    CONSTRAINT CHK_Payments_Amount CHECK (Amount >= 0)
  );
END;
GO

IF OBJECT_ID('dbo.AuditLogs', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.AuditLogs (
    AuditId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NULL,
    UserId INT NULL,
    Action NVARCHAR(200) NOT NULL,
    Details NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_AuditLogs_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_AuditLogs_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId),
    CONSTRAINT FK_AuditLogs_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id)
  );
END;
GO

/* ==============================
   Master Lookup Tables
   ============================== */

IF OBJECT_ID('dbo.MasterData', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.MasterData (
    MasterDataId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL CONSTRAINT DF_MasterData_TenantId DEFAULT (0),
    Category NVARCHAR(50) NOT NULL,
    ValueCode NVARCHAR(80) NOT NULL,
    SortOrder SMALLINT NOT NULL CONSTRAINT DF_MasterData_SortOrder DEFAULT (0),
    IsActive BIT NOT NULL CONSTRAINT DF_MasterData_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_MasterData_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_MasterData_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_MasterData UNIQUE (TenantId, Category, ValueCode)
  );
END;
GO

IF OBJECT_ID('dbo.MasterDataTranslations', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.MasterDataTranslations (
    MasterDataId INT NOT NULL,
    LangCode NVARCHAR(5) NOT NULL,
    Label NVARCHAR(200) NOT NULL,
    CONSTRAINT PK_MasterDataTranslations PRIMARY KEY (MasterDataId, LangCode),
    CONSTRAINT FK_MasterDataTranslations_MasterData FOREIGN KEY (MasterDataId)
      REFERENCES dbo.MasterData(MasterDataId) ON DELETE CASCADE
  );
END;
GO

IF OBJECT_ID('dbo.ReligionCasteMap', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ReligionCasteMap (
    ReligionMasterDataId INT NOT NULL,
    CasteMasterDataId INT NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_ReligionCasteMap_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ReligionCasteMap_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_ReligionCasteMap PRIMARY KEY (ReligionMasterDataId, CasteMasterDataId),
    CONSTRAINT FK_ReligionCasteMap_Religion FOREIGN KEY (ReligionMasterDataId)
      REFERENCES dbo.MasterData(MasterDataId),
    CONSTRAINT FK_ReligionCasteMap_Caste FOREIGN KEY (CasteMasterDataId)
      REFERENCES dbo.MasterData(MasterDataId)
  );
END;
GO

IF OBJECT_ID('dbo.CasteSubCasteMap', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.CasteSubCasteMap (
    CasteMasterDataId INT NOT NULL,
    SubCasteMasterDataId INT NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_CasteSubCasteMap_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_CasteSubCasteMap_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_CasteSubCasteMap PRIMARY KEY (CasteMasterDataId, SubCasteMasterDataId),
    CONSTRAINT FK_CasteSubCasteMap_Caste FOREIGN KEY (CasteMasterDataId)
      REFERENCES dbo.MasterData(MasterDataId),
    CONSTRAINT FK_CasteSubCasteMap_SubCaste FOREIGN KEY (SubCasteMasterDataId)
      REFERENCES dbo.MasterData(MasterDataId)
  );
END;
GO

/* ==============================
   Seed Lookup Data
   ============================== */

CREATE OR ALTER PROCEDURE dbo.usp_SeedMasterData
  @Category NVARCHAR(50),
  @ValueCode NVARCHAR(80),
  @LabelEn NVARCHAR(200),
  @LabelMr NVARCHAR(200) = NULL,
  @LabelHi NVARCHAR(200) = NULL,
  @SortOrder SMALLINT = 0
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @Id INT;
  SET @LabelMr = NULLIF(LTRIM(RTRIM(@LabelMr)), N'');
  SET @LabelHi = NULLIF(LTRIM(RTRIM(@LabelHi)), N'');

  IF NOT EXISTS (
    SELECT 1
    FROM dbo.MasterData
    WHERE TenantId = 0 AND Category = @Category AND ValueCode = @ValueCode
  )
  BEGIN
    INSERT INTO dbo.MasterData (TenantId, Category, ValueCode, SortOrder)
    VALUES (0, @Category, @ValueCode, @SortOrder);
  END;

  SELECT @Id = MasterDataId
  FROM dbo.MasterData
  WHERE TenantId = 0 AND Category = @Category AND ValueCode = @ValueCode;

  IF NOT EXISTS (SELECT 1 FROM dbo.MasterDataTranslations WHERE MasterDataId = @Id AND LangCode = 'en')
    INSERT INTO dbo.MasterDataTranslations (MasterDataId, LangCode, Label) VALUES (@Id, 'en', @LabelEn);
  IF @LabelMr IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.MasterDataTranslations WHERE MasterDataId = @Id AND LangCode = 'mr')
    INSERT INTO dbo.MasterDataTranslations (MasterDataId, LangCode, Label) VALUES (@Id, 'mr', @LabelMr);
  IF @LabelHi IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.MasterDataTranslations WHERE MasterDataId = @Id AND LangCode = 'hi')
    INSERT INTO dbo.MasterDataTranslations (MasterDataId, LangCode, Label) VALUES (@Id, 'hi', @LabelHi);
END;
GO

-- Religion
EXEC dbo.usp_SeedMasterData 'religion', 'HINDU',     'Hindu',     N'हिंदू',        N'हिंदू',        10;
EXEC dbo.usp_SeedMasterData 'religion', 'JAIN',      'Jain',      N'जैन',          N'जैन',          20;
EXEC dbo.usp_SeedMasterData 'religion', 'BUDDHIST',  'Buddhist',  N'बौद्ध',        N'बौद्ध',        30;
EXEC dbo.usp_SeedMasterData 'religion', 'SIKH',      'Sikh',      N'शीख',          N'सिख',          40;
EXEC dbo.usp_SeedMasterData 'religion', 'CHRISTIAN', 'Christian', N'ख्रिश्चन',     N'ईसाई',         50;
EXEC dbo.usp_SeedMasterData 'religion', 'MUSLIM',    'Muslim',    N'मुस्लिम',      N'मुस्लिम',      60;
GO

-- Caste
EXEC dbo.usp_SeedMasterData 'caste', 'MARATHA',    'Maratha',       N'मराठा',         N'मराठा',         10;
EXEC dbo.usp_SeedMasterData 'caste', 'KUNBI',      'Kunbi Maratha', N'कुणबी मराठा',   N'कुणबी मराठा',   20;
EXEC dbo.usp_SeedMasterData 'caste', 'CKP',        'CKP',           N'सीकेपी',        N'सीकेपी',        30;
EXEC dbo.usp_SeedMasterData 'caste', 'BRAHMIN',    'Brahmin',       N'ब्राह्मण',       N'ब्राह्मण',       40;
EXEC dbo.usp_SeedMasterData 'caste', 'DESHASTHA',  'Deshastha',     N'देशस्थ',        N'देशस्थ',        50;
EXEC dbo.usp_SeedMasterData 'caste', 'KOKANASTHA', 'Kokanastha',    N'कोकणस्थ',       N'कोकणस्थ',       60;
EXEC dbo.usp_SeedMasterData 'caste', 'KARHADE',    'Karhade',       N'कऱ्हाडे',        N'करहाड़े',       70;
EXEC dbo.usp_SeedMasterData 'caste', 'MALI',       'Mali',          N'माळी',          N'माली',          80;
EXEC dbo.usp_SeedMasterData 'caste', 'DHANGAR',    'Dhangar',       N'धनगर',         N'धनगर',         90;
EXEC dbo.usp_SeedMasterData 'caste', 'OTHER',      'Other',         N'इतर',           N'अन्य',          100;
GO

-- Sub Caste
EXEC dbo.usp_SeedMasterData 'sub_caste', '96_KULI',   '96 Kuli',         N'९६ कुळी',         N'९६ कुली',        10;
EXEC dbo.usp_SeedMasterData 'sub_caste', 'KUNBI_MRT', 'Kunbi Maratha',   N'कुणबी मराठा',     N'कुणबी मराठा',    20;
EXEC dbo.usp_SeedMasterData 'sub_caste', 'DESHMUKH',  'Deshmukh',        N'देशमुख',          N'देशमुख',         30;
EXEC dbo.usp_SeedMasterData 'sub_caste', 'PATIL',     'Patil',           N'पाटील',           N'पाटिल',          40;
EXEC dbo.usp_SeedMasterData 'sub_caste', 'JADHAV',    'Jadhav',          N'जाधव',           N'जाधव',          50;
GO

-- Religion -> Caste relation mapping
DECLARE @RelHinduId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'religion' AND ValueCode = 'HINDU');
DECLARE @RelJainId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'religion' AND ValueCode = 'JAIN');
DECLARE @RelBuddhistId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'religion' AND ValueCode = 'BUDDHIST');
DECLARE @RelSikhId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'religion' AND ValueCode = 'SIKH');
DECLARE @RelChristianId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'religion' AND ValueCode = 'CHRISTIAN');
DECLARE @RelMuslimId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'religion' AND ValueCode = 'MUSLIM');

DECLARE @CasteMarathaId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'MARATHA');
DECLARE @CasteKunbiId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'KUNBI');
DECLARE @CasteCkpId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'CKP');
DECLARE @CasteBrahminId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'BRAHMIN');
DECLARE @CasteDeshasthaId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'DESHASTHA');
DECLARE @CasteKokanasthaId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'KOKANASTHA');
DECLARE @CasteKarhadeId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'KARHADE');
DECLARE @CasteMaliId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'MALI');
DECLARE @CasteDhangarId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'DHANGAR');
DECLARE @CasteOtherId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'OTHER');

IF @RelHinduId IS NOT NULL AND @CasteMarathaId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelHinduId AND CasteMasterDataId = @CasteMarathaId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelHinduId, @CasteMarathaId);
IF @RelHinduId IS NOT NULL AND @CasteKunbiId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelHinduId AND CasteMasterDataId = @CasteKunbiId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelHinduId, @CasteKunbiId);
IF @RelHinduId IS NOT NULL AND @CasteCkpId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelHinduId AND CasteMasterDataId = @CasteCkpId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelHinduId, @CasteCkpId);
IF @RelHinduId IS NOT NULL AND @CasteBrahminId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelHinduId AND CasteMasterDataId = @CasteBrahminId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelHinduId, @CasteBrahminId);
IF @RelHinduId IS NOT NULL AND @CasteDeshasthaId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelHinduId AND CasteMasterDataId = @CasteDeshasthaId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelHinduId, @CasteDeshasthaId);
IF @RelHinduId IS NOT NULL AND @CasteKokanasthaId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelHinduId AND CasteMasterDataId = @CasteKokanasthaId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelHinduId, @CasteKokanasthaId);
IF @RelHinduId IS NOT NULL AND @CasteKarhadeId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelHinduId AND CasteMasterDataId = @CasteKarhadeId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelHinduId, @CasteKarhadeId);
IF @RelHinduId IS NOT NULL AND @CasteMaliId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelHinduId AND CasteMasterDataId = @CasteMaliId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelHinduId, @CasteMaliId);
IF @RelHinduId IS NOT NULL AND @CasteDhangarId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelHinduId AND CasteMasterDataId = @CasteDhangarId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelHinduId, @CasteDhangarId);
IF @RelHinduId IS NOT NULL AND @CasteOtherId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelHinduId AND CasteMasterDataId = @CasteOtherId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelHinduId, @CasteOtherId);

IF @RelJainId IS NOT NULL AND @CasteOtherId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelJainId AND CasteMasterDataId = @CasteOtherId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelJainId, @CasteOtherId);
IF @RelBuddhistId IS NOT NULL AND @CasteOtherId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelBuddhistId AND CasteMasterDataId = @CasteOtherId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelBuddhistId, @CasteOtherId);
IF @RelSikhId IS NOT NULL AND @CasteOtherId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelSikhId AND CasteMasterDataId = @CasteOtherId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelSikhId, @CasteOtherId);
IF @RelChristianId IS NOT NULL AND @CasteOtherId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelChristianId AND CasteMasterDataId = @CasteOtherId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelChristianId, @CasteOtherId);
IF @RelMuslimId IS NOT NULL AND @CasteOtherId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.ReligionCasteMap WHERE ReligionMasterDataId = @RelMuslimId AND CasteMasterDataId = @CasteOtherId)
  INSERT INTO dbo.ReligionCasteMap (ReligionMasterDataId, CasteMasterDataId) VALUES (@RelMuslimId, @CasteOtherId);
GO

-- Caste -> Sub Caste relation mapping
DECLARE @Sub96KuliId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'sub_caste' AND ValueCode = '96_KULI');
DECLARE @SubKunbiMrtId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'sub_caste' AND ValueCode = 'KUNBI_MRT');
DECLARE @SubDeshmukhId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'sub_caste' AND ValueCode = 'DESHMUKH');
DECLARE @SubPatilId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'sub_caste' AND ValueCode = 'PATIL');
DECLARE @SubJadhavId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'sub_caste' AND ValueCode = 'JADHAV');
DECLARE @CasteMarathaMapId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'MARATHA');
DECLARE @CasteKunbiMapId INT = (SELECT MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = 'caste' AND ValueCode = 'KUNBI');

IF @CasteMarathaMapId IS NOT NULL AND @Sub96KuliId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.CasteSubCasteMap WHERE CasteMasterDataId = @CasteMarathaMapId AND SubCasteMasterDataId = @Sub96KuliId)
  INSERT INTO dbo.CasteSubCasteMap (CasteMasterDataId, SubCasteMasterDataId) VALUES (@CasteMarathaMapId, @Sub96KuliId);
IF @CasteMarathaMapId IS NOT NULL AND @SubDeshmukhId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.CasteSubCasteMap WHERE CasteMasterDataId = @CasteMarathaMapId AND SubCasteMasterDataId = @SubDeshmukhId)
  INSERT INTO dbo.CasteSubCasteMap (CasteMasterDataId, SubCasteMasterDataId) VALUES (@CasteMarathaMapId, @SubDeshmukhId);
IF @CasteMarathaMapId IS NOT NULL AND @SubPatilId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.CasteSubCasteMap WHERE CasteMasterDataId = @CasteMarathaMapId AND SubCasteMasterDataId = @SubPatilId)
  INSERT INTO dbo.CasteSubCasteMap (CasteMasterDataId, SubCasteMasterDataId) VALUES (@CasteMarathaMapId, @SubPatilId);
IF @CasteMarathaMapId IS NOT NULL AND @SubJadhavId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.CasteSubCasteMap WHERE CasteMasterDataId = @CasteMarathaMapId AND SubCasteMasterDataId = @SubJadhavId)
  INSERT INTO dbo.CasteSubCasteMap (CasteMasterDataId, SubCasteMasterDataId) VALUES (@CasteMarathaMapId, @SubJadhavId);
IF @CasteKunbiMapId IS NOT NULL AND @SubKunbiMrtId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.CasteSubCasteMap WHERE CasteMasterDataId = @CasteKunbiMapId AND SubCasteMasterDataId = @SubKunbiMrtId)
  INSERT INTO dbo.CasteSubCasteMap (CasteMasterDataId, SubCasteMasterDataId) VALUES (@CasteKunbiMapId, @SubKunbiMrtId);
GO

/* ==============================
   Matrimonial Domain
   ============================== */

IF OBJECT_ID('dbo.Profiles', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Profiles (
    ProfileId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    UserId INT NOT NULL,
    ProfileCode NVARCHAR(25) NOT NULL,
    FullName NVARCHAR(140) NOT NULL,
    Age SMALLINT NULL,
    Bio NVARCHAR(MAX) NULL,
    LocationText NVARCHAR(180) NULL,
    OccupationText NVARCHAR(180) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Profiles_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Profiles_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Profiles_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId),
    CONSTRAINT FK_Profiles_UserTenant FOREIGN KEY (UserId, TenantId) REFERENCES dbo.Users(Id, TenantId),
    CONSTRAINT UQ_Profiles_User UNIQUE (UserId),
    CONSTRAINT UQ_Profiles_TenantCode UNIQUE (TenantId, ProfileCode),
    CONSTRAINT CHK_Profiles_Age CHECK (Age BETWEEN 18 AND 90)
  );
END;
GO

IF OBJECT_ID('dbo.ProfilePersonalDetails', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfilePersonalDetails (
    ProfileId INT NOT NULL PRIMARY KEY,
    FirstName NVARCHAR(40) NOT NULL,
    MiddleName NVARCHAR(40) NULL,
    LastName NVARCHAR(40) NOT NULL,
    DobDay SMALLINT NOT NULL,
    DobMonth NVARCHAR(12) NOT NULL,
    DobYear SMALLINT NOT NULL,
    Gender NVARCHAR(10) NULL,
    Religion NVARCHAR(80) NULL,
    Caste NVARCHAR(80) NULL,
    SubCast NVARCHAR(80) NULL,
    MaritalStatus NVARCHAR(20) NOT NULL,
    HeightFt SMALLINT NULL,
    HeightIn SMALLINT NULL,
    WeightKg SMALLINT NULL,
    BloodGroup NVARCHAR(5) NULL,
    Complexion NVARCHAR(30) NULL,
    PhysicalDisability BIT NOT NULL CONSTRAINT DF_ProfilePersonal_PhysicalDisability DEFAULT (0),
    DisabilityDetail NVARCHAR(250) NULL,
    Diet NVARCHAR(20) NULL,
    Spectacles BIT NULL,
    Lens BIT NULL,
    Personality NVARCHAR(250) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfilePersonal_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfilePersonal_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfilePersonal_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE,
    CONSTRAINT CHK_ProfilePersonal_DobDay CHECK (DobDay BETWEEN 1 AND 31),
    CONSTRAINT CHK_ProfilePersonal_DobYear CHECK (DobYear BETWEEN 1900 AND 2100),
    CONSTRAINT CHK_ProfilePersonal_Gender CHECK (Gender IS NULL OR Gender IN ('Male', 'Female', 'Other')),
    CONSTRAINT CHK_ProfilePersonal_HeightFt CHECK (HeightFt BETWEEN 4 AND 7),
    CONSTRAINT CHK_ProfilePersonal_HeightIn CHECK (HeightIn BETWEEN 0 AND 11),
    CONSTRAINT CHK_ProfilePersonal_Weight CHECK (WeightKg BETWEEN 25 AND 300),
    CONSTRAINT CHK_ProfilePersonal_Disability CHECK (
      PhysicalDisability = 0 OR (DisabilityDetail IS NOT NULL AND LTRIM(RTRIM(DisabilityDetail)) <> '')
    )
  );
END;
GO

IF OBJECT_ID('dbo.ProfileHoroscopeDetails', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfileHoroscopeDetails (
    ProfileId INT NOT NULL PRIMARY KEY,
    Manglik BIT NOT NULL CONSTRAINT DF_ProfileHoroscope_Manglik DEFAULT (0),
    Rashi NVARCHAR(40) NULL,
    Nakshatra NVARCHAR(40) NULL,
    Charan NVARCHAR(20) NULL,
    Nadi NVARCHAR(20) NULL,
    Gan NVARCHAR(20) NULL,
    BirthHour SMALLINT NULL,
    BirthMinute SMALLINT NULL,
    BirthPeriod NVARCHAR(2) NULL,
    BirthDistrict NVARCHAR(80) NULL,
    Devak NVARCHAR(120) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileHoroscope_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileHoroscope_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfileHoroscope_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE,
    CONSTRAINT CHK_ProfileHoroscope_BirthHour CHECK (BirthHour BETWEEN 1 AND 12),
    CONSTRAINT CHK_ProfileHoroscope_BirthMinute CHECK (BirthMinute BETWEEN 0 AND 59),
    CONSTRAINT CHK_ProfileHoroscope_BirthPeriod CHECK (BirthPeriod IN ('AM', 'PM'))
  );
END;
GO

IF OBJECT_ID('dbo.ProfileProfessionalDetails', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfileProfessionalDetails (
    ProfileId INT NOT NULL PRIMARY KEY,
    EducationArea NVARCHAR(80) NULL,
    Education NVARCHAR(120) NULL,
    OccupationType NVARCHAR(80) NULL,
    OccupationDetails NVARCHAR(120) NULL,
    WorkingCityCountry NVARCHAR(120) NULL,
    IncomeAmount DECIMAL(12,2) NULL,
    IncomePeriod NVARCHAR(20) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileProfessional_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileProfessional_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfileProfessional_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE,
    CONSTRAINT CHK_ProfileProfessional_Income CHECK (IncomeAmount IS NULL OR IncomeAmount >= 0)
  );
END;
GO

IF OBJECT_ID('dbo.ProfileContactDetails', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfileContactDetails (
    ProfileId INT NOT NULL PRIMARY KEY,
    IdProofNumber NVARCHAR(100) NULL,
    ResidenceAddress NVARCHAR(250) NULL,
    ContactEmail NVARCHAR(120) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileContact_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileContact_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfileContact_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE,
    CONSTRAINT CHK_ProfileContact_Email CHECK (ContactEmail IS NULL OR ContactEmail LIKE '%_@__%.__%')
  );
END;
GO

IF OBJECT_ID('dbo.ProfilePhoneNumbers', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfilePhoneNumbers (
    ProfilePhoneId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ProfileId INT NOT NULL,
    PhoneType NVARCHAR(20) NOT NULL,
    PhoneNumber NVARCHAR(15) NOT NULL,
      IsDeleted BIT NOT NULL CONSTRAINT DF_ProfilePhone_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfilePhone_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfilePhone_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE,
    CONSTRAINT UQ_ProfilePhone_ProfileType UNIQUE (ProfileId, PhoneType),
    CONSTRAINT CHK_ProfilePhone_Type CHECK (PhoneType IN ('sms_mobile', 'mobile_secondary', 'phone_primary', 'phone_secondary')),
    CONSTRAINT CHK_ProfilePhone_Number CHECK (PhoneNumber NOT LIKE '%[^0-9]%' AND LEN(PhoneNumber) BETWEEN 10 AND 15)
  );
END;
GO

IF OBJECT_ID('dbo.ProfileFamilyDetails', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfileFamilyDetails (
    ProfileId INT NOT NULL PRIMARY KEY,
    FatherStatus BIT NULL,
    MotherStatus BIT NULL,
    Brothers SMALLINT NOT NULL CONSTRAINT DF_ProfileFamily_Brothers DEFAULT (0),
    MarriedBrothers SMALLINT NOT NULL CONSTRAINT DF_ProfileFamily_MarriedBrothers DEFAULT (0),
    Sisters SMALLINT NOT NULL CONSTRAINT DF_ProfileFamily_Sisters DEFAULT (0),
    MarriedSisters SMALLINT NOT NULL CONSTRAINT DF_ProfileFamily_MarriedSisters DEFAULT (0),
    ParentsFullName NVARCHAR(120) NULL,
    ParentsOccupation NVARCHAR(120) NULL,
    ParentsResidentCity NVARCHAR(120) NULL,
    FamilyWealth NVARCHAR(MAX) NULL,
    MamaSurnamePlace NVARCHAR(250) NULL,
    NativeDistrict NVARCHAR(80) NULL,
    NativeTaluka NVARCHAR(120) NULL,
    IntercastMarriage BIT NULL,
    IntercastRelation NVARCHAR(MAX) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileFamily_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileFamily_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfileFamily_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE,
    CONSTRAINT CHK_ProfileFamily_Counts CHECK (Brothers >= MarriedBrothers AND Sisters >= MarriedSisters)
  );
END;
GO

IF OBJECT_ID('dbo.ProfileRelatives', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfileRelatives (
    RelativeId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ProfileId INT NOT NULL,
    Surname NVARCHAR(80) NOT NULL,
    IsDeleted BIT NOT NULL CONSTRAINT DF_ProfileRelatives_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileRelatives_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfileRelatives_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE,
    CONSTRAINT UQ_ProfileRelatives UNIQUE (ProfileId, Surname)
  );
END;
GO

IF OBJECT_ID('dbo.ProfileExpectations', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfileExpectations (
    ProfileId INT NOT NULL PRIMARY KEY,
    ExpectedManglik BIT NULL,
    ExpectedCaste NVARCHAR(80) NULL,
    MaxAgeDifference SMALLINT NULL,
    ExpectedHeightFt SMALLINT NULL,
    ExpectedHeightIn SMALLINT NULL,
    ExpectedEducation NVARCHAR(250) NULL,
    ExpectedOccupationIncome NVARCHAR(250) NULL,
    Divorcee BIT NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileExpectations_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileExpectations_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfileExpectations_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE,
    CONSTRAINT CHK_ProfileExpectations_HeightFt CHECK (ExpectedHeightFt BETWEEN 4 AND 7),
    CONSTRAINT CHK_ProfileExpectations_HeightIn CHECK (ExpectedHeightIn BETWEEN 0 AND 11)
  );
END;
GO

IF OBJECT_ID('dbo.ProfilePreferredCities', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfilePreferredCities (
    PreferredCityId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ProfileId INT NOT NULL,
    CityName NVARCHAR(120) NOT NULL,
    IsDeleted BIT NOT NULL CONSTRAINT DF_ProfilePreferredCities_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfilePreferredCities_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfilePreferredCities_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE,
    CONSTRAINT UQ_ProfilePreferredCities UNIQUE (ProfileId, CityName)
  );
END;
GO

IF OBJECT_ID('dbo.ProfileVerifications', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfileVerifications (
    ProfileId INT NOT NULL PRIMARY KEY,
    VerificationCode NVARCHAR(10) NULL,
    VerificationPassed BIT NOT NULL CONSTRAINT DF_ProfileVerifications_Passed DEFAULT (0),
    VerifiedAt DATETIME2(3) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileVerifications_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileVerifications_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfileVerifications_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE
  );
END;
GO

IF OBJECT_ID('dbo.ProfilePhotos', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfilePhotos (
    PhotoId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ProfileId INT NOT NULL,
    PhotoSlot SMALLINT NOT NULL,
    FileName NVARCHAR(255) NOT NULL,
    FileUrl NVARCHAR(MAX) NULL,
    IsPrimary BIT NOT NULL CONSTRAINT DF_ProfilePhotos_IsPrimary DEFAULT (0),
    IsDeleted BIT NOT NULL CONSTRAINT DF_ProfilePhotos_IsDeleted DEFAULT (0),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfilePhotos_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfilePhotos_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE,
    CONSTRAINT UQ_ProfilePhotos_Slot UNIQUE (ProfileId, PhotoSlot),
    CONSTRAINT CHK_ProfilePhotos_Slot CHECK (PhotoSlot BETWEEN 1 AND 3)
  );
END;
GO

IF EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'UX_ProfilePhotos_OnePrimary'
    AND object_id = OBJECT_ID('dbo.ProfilePhotos')
)
BEGIN
  DROP INDEX UX_ProfilePhotos_OnePrimary ON dbo.ProfilePhotos;
END;
GO

IF NOT EXISTS (
  SELECT 1
  FROM sys.indexes
  WHERE name = 'UX_ProfilePhotos_OnePrimary'
    AND object_id = OBJECT_ID('dbo.ProfilePhotos')
)
BEGIN
  CREATE UNIQUE INDEX UX_ProfilePhotos_OnePrimary
    ON dbo.ProfilePhotos(ProfileId)
    WHERE IsPrimary = 1 AND IsDeleted = 0;
END;
GO

/*
  Two-profile relationship tables use NO ACTION FKs to avoid
  SQL Server multiple-cascade-path errors.
*/

IF OBJECT_ID('dbo.InterestRequests', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.InterestRequests (
    InterestRequestId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    RequesterProfileId INT NOT NULL,
    TargetProfileId INT NOT NULL,
    Status NVARCHAR(20) NOT NULL CONSTRAINT DF_InterestRequests_Status DEFAULT ('pending'),
    Message NVARCHAR(300) NULL,
    RespondedAt DATETIME2(3) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_InterestRequests_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_InterestRequests_Requester FOREIGN KEY (RequesterProfileId) REFERENCES dbo.Profiles(ProfileId),
    CONSTRAINT FK_InterestRequests_Target FOREIGN KEY (TargetProfileId) REFERENCES dbo.Profiles(ProfileId),
    CONSTRAINT UQ_InterestRequests_Pair UNIQUE (RequesterProfileId, TargetProfileId),
    CONSTRAINT CHK_InterestRequests_NotSelf CHECK (RequesterProfileId <> TargetProfileId),
    CONSTRAINT CHK_InterestRequests_Status CHECK (Status IN ('pending', 'accepted', 'declined', 'withdrawn'))
  );
END;
GO

IF OBJECT_ID('dbo.Messages', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Messages (
    MessageId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SenderProfileId INT NOT NULL,
    ReceiverProfileId INT NOT NULL,
    MessageText NVARCHAR(MAX) NOT NULL,
    IsRead BIT NOT NULL CONSTRAINT DF_Messages_IsRead DEFAULT (0),
    SentAt DATETIME2(3) NOT NULL CONSTRAINT DF_Messages_SentAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Messages_Sender FOREIGN KEY (SenderProfileId) REFERENCES dbo.Profiles(ProfileId),
    CONSTRAINT FK_Messages_Receiver FOREIGN KEY (ReceiverProfileId) REFERENCES dbo.Profiles(ProfileId),
    CONSTRAINT CHK_Messages_NotSelf CHECK (SenderProfileId <> ReceiverProfileId)
  );
END;
GO

IF OBJECT_ID('dbo.Notifications', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Notifications (
    NotificationId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId INT NOT NULL,
    NotificationText NVARCHAR(250) NOT NULL,
    IsRead BIT NOT NULL CONSTRAINT DF_Notifications_IsRead DEFAULT (0),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Notifications_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Notifications_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
  );
END;
GO

IF OBJECT_ID('dbo.ProfileViews', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ProfileViews (
    ViewId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ViewerProfileId INT NOT NULL,
    ViewedProfileId INT NOT NULL,
    ViewedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ProfileViews_ViewedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_ProfileViews_Viewer FOREIGN KEY (ViewerProfileId) REFERENCES dbo.Profiles(ProfileId),
    CONSTRAINT FK_ProfileViews_Viewed FOREIGN KEY (ViewedProfileId) REFERENCES dbo.Profiles(ProfileId),
    CONSTRAINT CHK_ProfileViews_NotSelf CHECK (ViewerProfileId <> ViewedProfileId)
  );
END;
GO

IF OBJECT_ID('dbo.LoginHistory', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.LoginHistory (
    LoginId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId INT NOT NULL,
    LoginTime DATETIME2(3) NOT NULL CONSTRAINT DF_LoginHistory_LoginTime DEFAULT SYSUTCDATETIME(),
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(250) NULL,
    CONSTRAINT FK_LoginHistory_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE
  );
END;
GO

IF OBJECT_ID('dbo.RefreshTokens', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.RefreshTokens (
    RefreshTokenId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId INT NOT NULL,
    TokenHash NVARCHAR(255) NOT NULL,
    ExpiresAt DATETIME2(3) NOT NULL,
    IsRevoked BIT NOT NULL CONSTRAINT DF_RefreshTokens_IsRevoked DEFAULT (0),
    RevokedAt DATETIME2(3) NULL,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(250) NULL,
    DeviceId NVARCHAR(100) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_RefreshTokens_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_RefreshTokens_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_RefreshTokens_RevokedAt CHECK (
      (IsRevoked = 0 AND RevokedAt IS NULL) OR (IsRevoked = 1 AND RevokedAt IS NOT NULL)
    )
  );
END;
GO

/*
  ========================================
  JWT & OAuth2 Authentication & Authorization
  ========================================
  
  These tables support comprehensive JWT and OAuth2 authentication with:
  - Multi-factor authentication support (TOTP, WebAuthn)
  - Session management with device tracking
  - OAuth2 provider integration (Google, Facebook, Microsoft, etc.)
  - Fine-grained permission management
  - API key generation for service-to-service auth
  - Audit trails for all auth operations
  
  Implementation Notes:
  1. Always store token hashes, never plain tokens
  2. Use sp_CleanupExpiredRefreshTokens, sp_CleanupExpiredSessions, 
     sp_CleanupExpiredOAuth2Tokens periodically (e.g., daily job)
  3. Sessions expire automatically based on ExpiresAt
  4. Permissions can have optional expiration dates
  5. API keys support rotation and scope-based access
*/

IF OBJECT_ID('dbo.AuthenticationMethods', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.AuthenticationMethods (
    AuthMethodId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId INT NOT NULL,
    MethodType NVARCHAR(50) NOT NULL,
    IsEnabled BIT NOT NULL CONSTRAINT DF_AuthMethods_IsEnabled DEFAULT (1),
    IsPrimary BIT NOT NULL CONSTRAINT DF_AuthMethods_IsPrimary DEFAULT (0),
    Configuration NVARCHAR(MAX) NULL,
    LastUsedAt DATETIME2(3) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_AuthMethods_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_AuthMethods_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_AuthMethods_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_AuthMethods_UserMethod UNIQUE (UserId, MethodType),
    CONSTRAINT CHK_AuthMethods_Type CHECK (MethodType IN ('email_password', 'oauth2_google', 'oauth2_facebook', 'oauth2_microsoft', 'totp', 'webauthn')),
    CONSTRAINT CHK_AuthMethods_OnePrimary CHECK ((MethodType = 'email_password' AND IsPrimary = 1) OR IsPrimary = 0)
  );
END;
GO

IF OBJECT_ID('dbo.UserSessions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserSessions (
    SessionId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId INT NOT NULL,
    SessionToken NVARCHAR(255) NOT NULL,
    SessionHash NVARCHAR(255) NOT NULL,
    ExpiresAt DATETIME2(3) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Sessions_IsActive DEFAULT (1),
    DeviceId NVARCHAR(100) NULL,
    DeviceInfo NVARCHAR(500) NULL,
    IpAddress NVARCHAR(50) NULL,
    UserAgent NVARCHAR(250) NULL,
    LastActivityAt DATETIME2(3) NOT NULL CONSTRAINT DF_Sessions_LastActivityAt DEFAULT SYSUTCDATETIME(),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Sessions_CreatedAt DEFAULT SYSUTCDATETIME(),
    TerminatedAt DATETIME2(3) NULL,
    CONSTRAINT FK_Sessions_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_Sessions_Token UNIQUE (SessionHash),
    CONSTRAINT CHK_Sessions_Active CHECK ((IsActive = 0 AND TerminatedAt IS NOT NULL) OR (IsActive = 1 AND TerminatedAt IS NULL))
  );
END;
GO

IF OBJECT_ID('dbo.OAuth2Providers', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.OAuth2Providers (
    ProviderId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    ProviderName NVARCHAR(50) NOT NULL,
    ClientId NVARCHAR(255) NOT NULL,
    ClientSecret NVARCHAR(MAX) NOT NULL,
    AuthorizationUrl NVARCHAR(MAX) NOT NULL,
    TokenUrl NVARCHAR(MAX) NOT NULL,
    UserInfoUrl NVARCHAR(MAX) NOT NULL,
    RedirectUrl NVARCHAR(MAX) NOT NULL,
    Scope NVARCHAR(500) NOT NULL,
    IsEnabled BIT NOT NULL CONSTRAINT DF_OAuth2Providers_IsEnabled DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_OAuth2Providers_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_OAuth2Providers_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_OAuth2Providers_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT UQ_OAuth2Providers_TenantProvider UNIQUE (TenantId, ProviderName)
  );
END;
GO

IF OBJECT_ID('dbo.OAuth2Tokens', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.OAuth2Tokens (
    OAuth2TokenId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId INT NOT NULL,
    ProviderId INT NOT NULL,
    AccessTokenHash NVARCHAR(255) NOT NULL,
    RefreshTokenHash NVARCHAR(255) NULL,
    AccessTokenExpiresAt DATETIME2(3) NOT NULL,
    RefreshTokenExpiresAt DATETIME2(3) NULL,
    TokenType NVARCHAR(50) NULL,
    Scope NVARCHAR(500) NULL,
    ProviderUserId NVARCHAR(255) NOT NULL,
    IsRevoked BIT NOT NULL CONSTRAINT DF_OAuth2Tokens_IsRevoked DEFAULT (0),
    RevokedAt DATETIME2(3) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_OAuth2Tokens_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_OAuth2Tokens_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_OAuth2Tokens_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_OAuth2Tokens_Provider FOREIGN KEY (ProviderId) REFERENCES dbo.OAuth2Providers(ProviderId),
    CONSTRAINT UQ_OAuth2Tokens_UserProvider UNIQUE (UserId, ProviderId),
    CONSTRAINT CHK_OAuth2Tokens_RevokedAt CHECK ((IsRevoked = 0 AND RevokedAt IS NULL) OR (IsRevoked = 1 AND RevokedAt IS NOT NULL))
  );
END;
GO

IF OBJECT_ID('dbo.Permissions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Permissions (
    PermissionId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    PermissionCode NVARCHAR(100) NOT NULL,
    DisplayName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    ResourceType NVARCHAR(50) NOT NULL,
    Action NVARCHAR(50) NOT NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Permissions_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Permissions_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Permissions_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT UQ_Permissions_Code UNIQUE (TenantId, PermissionCode),
    CONSTRAINT CHK_Permissions_Code CHECK (PermissionCode LIKE '[A-Z_][A-Z0-9_]*')
  );
END;
GO

IF OBJECT_ID('dbo.UserPermissions', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserPermissions (
    UserPermissionId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    UserId INT NOT NULL,
    PermissionId INT NOT NULL,
    GrantedBy INT NULL,
    GrantedAt DATETIME2(3) NOT NULL CONSTRAINT DF_UserPermissions_GrantedAt DEFAULT SYSUTCDATETIME(),
    ExpiresAt DATETIME2(3) NULL,
    CONSTRAINT FK_UserPermissions_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT FK_UserPermissions_Permission FOREIGN KEY (PermissionId) REFERENCES dbo.Permissions(PermissionId),
    CONSTRAINT FK_UserPermissions_GrantedBy FOREIGN KEY (GrantedBy) REFERENCES dbo.Users(Id),
    CONSTRAINT UQ_UserPermissions_Pair UNIQUE (UserId, PermissionId),
    CONSTRAINT CHK_UserPermissions_ExpiresAt CHECK (ExpiresAt IS NULL OR ExpiresAt > GrantedAt)
  );
END;
GO

IF OBJECT_ID('dbo.ApiKeys', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ApiKeys (
    ApiKeyId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    UserId INT NOT NULL,
    KeyName NVARCHAR(150) NOT NULL,
    KeyHash NVARCHAR(255) NOT NULL,
    KeyPrefix NVARCHAR(20) NOT NULL,
    Scope NVARCHAR(500) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_ApiKeys_IsActive DEFAULT (1),
    LastUsedAt DATETIME2(3) NULL,
    RateLimit INT NULL,
    ExpiresAt DATETIME2(3) NULL,
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_ApiKeys_CreatedAt DEFAULT SYSUTCDATETIME(),
    RevokedAt DATETIME2(3) NULL,
    CONSTRAINT FK_ApiKeys_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId) ON DELETE CASCADE,
    CONSTRAINT FK_ApiKeys_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT UQ_ApiKeys_Hash UNIQUE (KeyHash),
    CONSTRAINT UQ_ApiKeys_Prefix UNIQUE (KeyPrefix),
    CONSTRAINT CHK_ApiKeys_KeyName CHECK (LEN(LTRIM(RTRIM(KeyName))) > 0)
  );
END;
GO

IF OBJECT_ID('dbo.Events', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Events (
    EventId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    Title NVARCHAR(150) NOT NULL,
    Description NVARCHAR(MAX) NULL,
    Venue NVARCHAR(200) NULL,
    EventDate DATE NOT NULL,
    EventTime TIME(0) NULL,
    IsVirtual BIT NOT NULL CONSTRAINT DF_Events_IsVirtual DEFAULT (0),
    MeetingLink NVARCHAR(300) NULL,
    IsActive BIT NOT NULL CONSTRAINT DF_Events_IsActive DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_Events_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_Events_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId)
  );
END;
GO

IF OBJECT_ID('dbo.EventRsvps', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.EventRsvps (
    EventRsvpId BIGINT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    EventId INT NOT NULL,
    ProfileId INT NOT NULL,
    RsvpStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_EventRsvps_Status DEFAULT ('going'),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_EventRsvps_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_EventRsvps_Event FOREIGN KEY (EventId) REFERENCES dbo.Events(EventId) ON DELETE CASCADE,
    CONSTRAINT FK_EventRsvps_Profile FOREIGN KEY (ProfileId) REFERENCES dbo.Profiles(ProfileId) ON DELETE CASCADE,
    CONSTRAINT UQ_EventRsvps_EventProfile UNIQUE (EventId, ProfileId),
    CONSTRAINT CHK_EventRsvps_Status CHECK (RsvpStatus IN ('going', 'interested', 'not_going'))
  );
END;
GO

IF OBJECT_ID('dbo.SuccessStories', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.SuccessStories (
    StoryId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId INT NOT NULL,
    BrideProfileId INT NULL,
    GroomProfileId INT NULL,
    Title NVARCHAR(180) NOT NULL,
    StoryText NVARCHAR(MAX) NOT NULL,
    CoverImageUrl NVARCHAR(400) NULL,
    PublishedAt DATETIME2(3) NULL,
    IsPublished BIT NOT NULL CONSTRAINT DF_SuccessStories_IsPublished DEFAULT (0),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_SuccessStories_CreatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_SuccessStories_Tenant FOREIGN KEY (TenantId) REFERENCES dbo.Tenants(TenantId),
    CONSTRAINT FK_SuccessStories_Bride FOREIGN KEY (BrideProfileId) REFERENCES dbo.Profiles(ProfileId),
    CONSTRAINT FK_SuccessStories_Groom FOREIGN KEY (GroomProfileId) REFERENCES dbo.Profiles(ProfileId)
  );
END;
GO

IF OBJECT_ID('dbo.UserSettings', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserSettings (
    UserId INT NOT NULL PRIMARY KEY,
    ProfileVisibility NVARCHAR(20) NOT NULL CONSTRAINT DF_UserSettings_Visibility DEFAULT ('verified'),
    EmailAlerts BIT NOT NULL CONSTRAINT DF_UserSettings_EmailAlerts DEFAULT (1),
    SmsAlerts BIT NOT NULL CONSTRAINT DF_UserSettings_SmsAlerts DEFAULT (0),
    EventReminders BIT NOT NULL CONSTRAINT DF_UserSettings_EventReminders DEFAULT (1),
    CreatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_UserSettings_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2(3) NOT NULL CONSTRAINT DF_UserSettings_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT FK_UserSettings_User FOREIGN KEY (UserId) REFERENCES dbo.Users(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_UserSettings_Visibility CHECK (ProfileVisibility IN ('all', 'verified', 'matches'))
  );
END;
GO

/* ==============================
   Reconciliation for existing DBs
   (supports rerun over older schema)
   ============================== */

IF COL_LENGTH('dbo.Tenants', 'UpdatedAt') IS NULL
BEGIN
  ALTER TABLE dbo.Tenants
    ADD UpdatedAt DATETIME2(3) NOT NULL
      CONSTRAINT DF_Tenants_UpdatedAt_MIG DEFAULT SYSUTCDATETIME();
END;
GO

IF COL_LENGTH('dbo.Users', 'UpdatedAt') IS NULL
BEGIN
  ALTER TABLE dbo.Users
    ADD UpdatedAt DATETIME2(3) NOT NULL
      CONSTRAINT DF_Users_UpdatedAt_MIG DEFAULT SYSUTCDATETIME();
END;
GO

IF COL_LENGTH('dbo.TenantSubscriptions', 'UpdatedAt') IS NULL
BEGIN
  ALTER TABLE dbo.TenantSubscriptions
    ADD UpdatedAt DATETIME2(3) NOT NULL
      CONSTRAINT DF_TenantSubscriptions_UpdatedAt_MIG DEFAULT SYSUTCDATETIME();
END;
GO

IF COL_LENGTH('dbo.Payments', 'UserSubscriptionId') IS NULL
BEGIN
  ALTER TABLE dbo.Payments ADD UserSubscriptionId INT NULL;
END;
GO

IF COL_LENGTH('dbo.Payments', 'Status') IS NOT NULL
BEGIN
  UPDATE dbo.Payments SET Status = 'pending' WHERE Status IS NULL;
END;
GO

IF OBJECT_ID('dbo.TenantSubscriptions', 'U') IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM sys.key_constraints
  WHERE [type] = 'UQ' AND [name] = 'UQ_TenantSubscriptions_IdTenant'
)
BEGIN
  ALTER TABLE dbo.TenantSubscriptions
    ADD CONSTRAINT UQ_TenantSubscriptions_IdTenant UNIQUE (SubscriptionId, TenantId);
END;
GO

IF OBJECT_ID('dbo.UserSubscriptions', 'U') IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM sys.key_constraints
  WHERE [type] = 'UQ' AND [name] = 'UQ_UserSubscriptions_IdTenant'
)
BEGIN
  ALTER TABLE dbo.UserSubscriptions
    ADD CONSTRAINT UQ_UserSubscriptions_IdTenant UNIQUE (UserSubscriptionId, TenantId);
END;
GO

IF OBJECT_ID('dbo.TenantUserPlans', 'U') IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM sys.check_constraints
  WHERE [name] = 'CHK_TenantUserPlans_FeaturesJson'
)
BEGIN
  ALTER TABLE dbo.TenantUserPlans WITH NOCHECK
    ADD CONSTRAINT CHK_TenantUserPlans_FeaturesJson CHECK (FeaturesJson IS NULL OR ISJSON(FeaturesJson) = 1);
END;
GO

IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL
AND EXISTS (SELECT 1 FROM sys.foreign_keys WHERE [name] = 'FK_Payments_Subscription')
BEGIN
  ALTER TABLE dbo.Payments DROP CONSTRAINT FK_Payments_Subscription;
END;
GO

IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL
AND EXISTS (SELECT 1 FROM sys.foreign_keys WHERE [name] = 'FK_Payments_UserSubscription')
BEGIN
  ALTER TABLE dbo.Payments DROP CONSTRAINT FK_Payments_UserSubscription;
END;
GO

IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE [name] = 'FK_Payments_SubscriptionTenant')
BEGIN
  ALTER TABLE dbo.Payments WITH NOCHECK
    ADD CONSTRAINT FK_Payments_SubscriptionTenant
    FOREIGN KEY (SubscriptionId, TenantId) REFERENCES dbo.TenantSubscriptions(SubscriptionId, TenantId);
END;
GO

IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE [name] = 'FK_Payments_UserSubscriptionTenant')
BEGIN
  ALTER TABLE dbo.Payments WITH NOCHECK
    ADD CONSTRAINT FK_Payments_UserSubscriptionTenant
    FOREIGN KEY (UserSubscriptionId, TenantId) REFERENCES dbo.UserSubscriptions(UserSubscriptionId, TenantId);
END;
GO

IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL
AND EXISTS (SELECT 1 FROM sys.check_constraints WHERE [name] = 'CHK_Payments_OneSubscriptionType')
BEGIN
  ALTER TABLE dbo.Payments DROP CONSTRAINT CHK_Payments_OneSubscriptionType;
END;
GO

IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE [name] = 'CHK_Payments_OneSubscriptionType')
BEGIN
  ALTER TABLE dbo.Payments WITH NOCHECK
    ADD CONSTRAINT CHK_Payments_OneSubscriptionType CHECK (
      (SubscriptionId IS NOT NULL AND UserSubscriptionId IS NULL) OR
      (SubscriptionId IS NULL AND UserSubscriptionId IS NOT NULL)
    );
END;
GO

IF OBJECT_ID('dbo.Payments', 'U') IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE [name] = 'CHK_Payments_Status')
BEGIN
  ALTER TABLE dbo.Payments WITH NOCHECK
    ADD CONSTRAINT CHK_Payments_Status CHECK (Status IN ('pending', 'initiated', 'success', 'failed', 'refunded', 'cancelled'));
END;
GO

IF COL_LENGTH('dbo.Profiles', 'TenantId') IS NULL
BEGIN
  ALTER TABLE dbo.Profiles ADD TenantId INT NULL;

  EXEC sp_executesql N'
    UPDATE p
    SET TenantId = u.TenantId
    FROM dbo.Profiles p
    INNER JOIN dbo.Users u ON u.Id = p.UserId
    WHERE p.TenantId IS NULL;
  ';

  -- Keep nullable-safe migration behavior; can be enforced to NOT NULL after data cleanup.
END;
GO

IF COL_LENGTH('dbo.ProfilePhoneNumbers', 'IsDeleted') IS NULL
BEGIN
  ALTER TABLE dbo.ProfilePhoneNumbers
    ADD IsDeleted BIT NOT NULL
      CONSTRAINT DF_ProfilePhone_IsDeleted_MIG DEFAULT (0);
END;
GO

IF COL_LENGTH('dbo.ProfileRelatives', 'IsDeleted') IS NULL
BEGIN
  ALTER TABLE dbo.ProfileRelatives
    ADD IsDeleted BIT NOT NULL
      CONSTRAINT DF_ProfileRelatives_IsDeleted_MIG DEFAULT (0);
END;
GO

IF COL_LENGTH('dbo.ProfilePreferredCities', 'IsDeleted') IS NULL
BEGIN
  ALTER TABLE dbo.ProfilePreferredCities
    ADD IsDeleted BIT NOT NULL
      CONSTRAINT DF_ProfilePreferredCities_IsDeleted_MIG DEFAULT (0);
END;
GO

IF COL_LENGTH('dbo.ProfilePhotos', 'IsDeleted') IS NULL
BEGIN
  ALTER TABLE dbo.ProfilePhotos
    ADD IsDeleted BIT NOT NULL
      CONSTRAINT DF_ProfilePhotos_IsDeleted_MIG DEFAULT (0);
END;
GO

/* Support for existing RefreshTokens column if migrating */
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'RefreshTokens')
BEGIN
  PRINT 'RefreshTokens table will be created as part of auth schema.';
END;
GO

/* Support for existing OAuth2 provider settings migration */
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'OAuth2Providers')
BEGIN
  PRINT 'OAuth2Providers table will be created as part of auth schema.';
END;
GO

/* ==============================
   UpdatedAt Triggers
   ============================== */

CREATE OR ALTER TRIGGER dbo.trg_Tenants_SetUpdatedAt ON dbo.Tenants
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE t SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.Tenants t
  INNER JOIN inserted i ON i.TenantId = t.TenantId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_Users_SetUpdatedAt ON dbo.Users
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE u SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.Users u
  INNER JOIN inserted i ON i.Id = u.Id;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_PlatformAdmins_SetUpdatedAt ON dbo.PlatformAdmins
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE a SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.PlatformAdmins a
  INNER JOIN inserted i ON i.PlatformAdminId = a.PlatformAdminId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_TenantSubscriptions_SetUpdatedAt ON dbo.TenantSubscriptions
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE s SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.TenantSubscriptions s
  INNER JOIN inserted i ON i.SubscriptionId = s.SubscriptionId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_TenantSubscriptions_ValidateNoOverlap ON dbo.TenantSubscriptions
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (
    SELECT 1
    FROM inserted i
    INNER JOIN dbo.TenantSubscriptions s
      ON s.TenantId = i.TenantId
     AND s.SubscriptionId <> i.SubscriptionId
     AND s.StartDate <= i.EndDate
     AND s.EndDate >= i.StartDate
  )
  BEGIN
    THROW 50001, 'Overlapping tenant subscription periods are not allowed for the same tenant.', 1;
  END;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_TenantUserPlans_SetUpdatedAt ON dbo.TenantUserPlans
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE p SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.TenantUserPlans p
  INNER JOIN inserted i ON i.TenantUserPlanId = p.TenantUserPlanId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_UserSubscriptions_SetUpdatedAt ON dbo.UserSubscriptions
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE s SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.UserSubscriptions s
  INNER JOIN inserted i ON i.UserSubscriptionId = s.UserSubscriptionId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_UserSubscriptions_ValidateNoOverlap ON dbo.UserSubscriptions
AFTER INSERT, UPDATE
AS
BEGIN
  SET NOCOUNT ON;

  IF EXISTS (
    SELECT 1
    FROM inserted i
    INNER JOIN dbo.UserSubscriptions s
      ON s.TenantId = i.TenantId
     AND s.UserId = i.UserId
     AND s.UserSubscriptionId <> i.UserSubscriptionId
     AND s.StartDate <= i.EndDate
     AND s.EndDate >= i.StartDate
  )
  BEGIN
    THROW 50002, 'Overlapping user subscription periods are not allowed for the same tenant user.', 1;
  END;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_Profiles_SetUpdatedAt ON dbo.Profiles
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE p SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.Profiles p
  INNER JOIN inserted i ON i.ProfileId = p.ProfileId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ProfilePersonal_SetUpdatedAt ON dbo.ProfilePersonalDetails
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE d SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.ProfilePersonalDetails d
  INNER JOIN inserted i ON i.ProfileId = d.ProfileId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ProfileHoroscope_SetUpdatedAt ON dbo.ProfileHoroscopeDetails
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE d SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.ProfileHoroscopeDetails d
  INNER JOIN inserted i ON i.ProfileId = d.ProfileId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ProfileProfessional_SetUpdatedAt ON dbo.ProfileProfessionalDetails
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE d SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.ProfileProfessionalDetails d
  INNER JOIN inserted i ON i.ProfileId = d.ProfileId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ProfileContact_SetUpdatedAt ON dbo.ProfileContactDetails
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE d SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.ProfileContactDetails d
  INNER JOIN inserted i ON i.ProfileId = d.ProfileId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ProfileFamily_SetUpdatedAt ON dbo.ProfileFamilyDetails
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE d SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.ProfileFamilyDetails d
  INNER JOIN inserted i ON i.ProfileId = d.ProfileId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ProfileExpectations_SetUpdatedAt ON dbo.ProfileExpectations
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE d SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.ProfileExpectations d
  INNER JOIN inserted i ON i.ProfileId = d.ProfileId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_ProfileVerifications_SetUpdatedAt ON dbo.ProfileVerifications
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE d SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.ProfileVerifications d
  INNER JOIN inserted i ON i.ProfileId = d.ProfileId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_UserSettings_SetUpdatedAt ON dbo.UserSettings
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE s SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.UserSettings s
  INNER JOIN inserted i ON i.UserId = s.UserId;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CleanupExpiredRefreshTokens
AS
BEGIN
  SET NOCOUNT ON;
  
  DELETE FROM dbo.RefreshTokens
  WHERE ExpiresAt < SYSUTCDATETIME()
    AND IsRevoked = 0;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CleanupExpiredSessions
AS
BEGIN
  SET NOCOUNT ON;
  
  UPDATE dbo.UserSessions
  SET IsActive = 0, TerminatedAt = SYSUTCDATETIME()
  WHERE ExpiresAt < SYSUTCDATETIME()
    AND IsActive = 1;
END;
GO

CREATE OR ALTER PROCEDURE dbo.sp_CleanupExpiredOAuth2Tokens
AS
BEGIN
  SET NOCOUNT ON;
  
  UPDATE dbo.OAuth2Tokens
  SET IsRevoked = 1, RevokedAt = SYSUTCDATETIME()
  WHERE AccessTokenExpiresAt < SYSUTCDATETIME()
    AND IsRevoked = 0;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_AuthenticationMethods_SetUpdatedAt ON dbo.AuthenticationMethods
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE a SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.AuthenticationMethods a
  INNER JOIN inserted i ON i.AuthMethodId = a.AuthMethodId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_OAuth2Providers_SetUpdatedAt ON dbo.OAuth2Providers
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE p SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.OAuth2Providers p
  INNER JOIN inserted i ON i.ProviderId = p.ProviderId;
END;
GO

CREATE OR ALTER TRIGGER dbo.trg_OAuth2Tokens_SetUpdatedAt ON dbo.OAuth2Tokens
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE o SET UpdatedAt = SYSUTCDATETIME()
  FROM dbo.OAuth2Tokens o
  INNER JOIN inserted i ON i.OAuth2TokenId = o.OAuth2TokenId;
END;
GO

/* ==============================
   Indexes for performance
   ============================== */

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Users_TenantId' AND object_id = OBJECT_ID('dbo.Users'))
  CREATE INDEX IX_Users_TenantId ON dbo.Users(TenantId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_PlatformAdmins_IsActive' AND object_id = OBJECT_ID('dbo.PlatformAdmins'))
  CREATE INDEX IX_PlatformAdmins_IsActive ON dbo.PlatformAdmins(IsActive);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Profiles_Age' AND object_id = OBJECT_ID('dbo.Profiles'))
  CREATE INDEX IX_Profiles_Age ON dbo.Profiles(Age);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Profiles_Location' AND object_id = OBJECT_ID('dbo.Profiles'))
  CREATE INDEX IX_Profiles_Location ON dbo.Profiles(LocationText);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Profiles_Occupation' AND object_id = OBJECT_ID('dbo.Profiles'))
  CREATE INDEX IX_Profiles_Occupation ON dbo.Profiles(OccupationText);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProfileProfessional_WorkCity' AND object_id = OBJECT_ID('dbo.ProfileProfessionalDetails'))
  CREATE INDEX IX_ProfileProfessional_WorkCity ON dbo.ProfileProfessionalDetails(WorkingCityCountry);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProfileExpectations_Caste' AND object_id = OBJECT_ID('dbo.ProfileExpectations'))
  CREATE INDEX IX_ProfileExpectations_Caste ON dbo.ProfileExpectations(ExpectedCaste);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProfilePhoneNumbers_Number' AND object_id = OBJECT_ID('dbo.ProfilePhoneNumbers'))
  CREATE INDEX IX_ProfilePhoneNumbers_Number ON dbo.ProfilePhoneNumbers(PhoneNumber);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProfilePhoneNumbers_ProfileId_IsDeleted' AND object_id = OBJECT_ID('dbo.ProfilePhoneNumbers'))
  CREATE INDEX IX_ProfilePhoneNumbers_ProfileId_IsDeleted ON dbo.ProfilePhoneNumbers(ProfileId, IsDeleted);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProfileRelatives_ProfileId_IsDeleted' AND object_id = OBJECT_ID('dbo.ProfileRelatives'))
  CREATE INDEX IX_ProfileRelatives_ProfileId_IsDeleted ON dbo.ProfileRelatives(ProfileId, IsDeleted);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProfilePreferredCities_CityName' AND object_id = OBJECT_ID('dbo.ProfilePreferredCities'))
  CREATE INDEX IX_ProfilePreferredCities_CityName ON dbo.ProfilePreferredCities(CityName);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProfilePreferredCities_ProfileId_IsDeleted' AND object_id = OBJECT_ID('dbo.ProfilePreferredCities'))
  CREATE INDEX IX_ProfilePreferredCities_ProfileId_IsDeleted ON dbo.ProfilePreferredCities(ProfileId, IsDeleted);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ProfilePhotos_ProfileId_IsDeleted' AND object_id = OBJECT_ID('dbo.ProfilePhotos'))
  CREATE INDEX IX_ProfilePhotos_ProfileId_IsDeleted ON dbo.ProfilePhotos(ProfileId, IsDeleted);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_InterestRequests_TargetStatus' AND object_id = OBJECT_ID('dbo.InterestRequests'))
  CREATE INDEX IX_InterestRequests_TargetStatus ON dbo.InterestRequests(TargetProfileId, Status);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Messages_ReceiverSentAt' AND object_id = OBJECT_ID('dbo.Messages'))
  CREATE INDEX IX_Messages_ReceiverSentAt ON dbo.Messages(ReceiverProfileId, SentAt DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_TenantUserPlans_TenantId_IsActive' AND object_id = OBJECT_ID('dbo.TenantUserPlans'))
  CREATE INDEX IX_TenantUserPlans_TenantId_IsActive ON dbo.TenantUserPlans(TenantId, IsActive);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserSubscriptions_TenantUser_EndDate' AND object_id = OBJECT_ID('dbo.UserSubscriptions'))
  CREATE INDEX IX_UserSubscriptions_TenantUser_EndDate ON dbo.UserSubscriptions(TenantId, UserId, EndDate DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserSubscriptions_UserId_IsActive' AND object_id = OBJECT_ID('dbo.UserSubscriptions'))
  CREATE INDEX IX_UserSubscriptions_UserId_IsActive ON dbo.UserSubscriptions(UserId, IsActive);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_TenantSubscriptions_OneActive' AND object_id = OBJECT_ID('dbo.TenantSubscriptions'))
  CREATE UNIQUE INDEX UX_TenantSubscriptions_OneActive ON dbo.TenantSubscriptions(TenantId) WHERE IsActive = 1;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_UserSubscriptions_OneActive' AND object_id = OBJECT_ID('dbo.UserSubscriptions'))
  CREATE UNIQUE INDEX UX_UserSubscriptions_OneActive ON dbo.UserSubscriptions(TenantId, UserId) WHERE IsActive = 1;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Payments_Status' AND object_id = OBJECT_ID('dbo.Payments'))
  CREATE INDEX IX_Payments_Status ON dbo.Payments(Status);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Payments_CreatedAt' AND object_id = OBJECT_ID('dbo.Payments'))
  CREATE INDEX IX_Payments_CreatedAt ON dbo.Payments(CreatedAt DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Payments_UserId_CreatedAt' AND object_id = OBJECT_ID('dbo.Payments'))
  CREATE INDEX IX_Payments_UserId_CreatedAt ON dbo.Payments(UserId, CreatedAt DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Payments_UserSubscriptionId' AND object_id = OBJECT_ID('dbo.Payments'))
  CREATE INDEX IX_Payments_UserSubscriptionId ON dbo.Payments(UserSubscriptionId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_Payments_TenantGatewayTxnRef' AND object_id = OBJECT_ID('dbo.Payments'))
  CREATE UNIQUE INDEX UX_Payments_TenantGatewayTxnRef ON dbo.Payments(TenantId, PaymentGateway, TransactionReference)
  WHERE TransactionReference IS NOT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_RefreshTokens_UserId_ExpiresAt' AND object_id = OBJECT_ID('dbo.RefreshTokens'))
  CREATE INDEX IX_RefreshTokens_UserId_ExpiresAt ON dbo.RefreshTokens(UserId, ExpiresAt DESC);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_RefreshTokens_UserIdActive' AND object_id = OBJECT_ID('dbo.RefreshTokens'))
  CREATE INDEX IX_RefreshTokens_UserIdActive ON dbo.RefreshTokens(UserId, IsRevoked) WHERE IsRevoked = 0;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_RefreshTokens_TokenHash' AND object_id = OBJECT_ID('dbo.RefreshTokens'))
  CREATE INDEX IX_RefreshTokens_TokenHash ON dbo.RefreshTokens(TokenHash);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_AuthenticationMethods_UserId_IsEnabled' AND object_id = OBJECT_ID('dbo.AuthenticationMethods'))
  CREATE INDEX IX_AuthenticationMethods_UserId_IsEnabled ON dbo.AuthenticationMethods(UserId, IsEnabled);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserSessions_UserId_IsActive' AND object_id = OBJECT_ID('dbo.UserSessions'))
  CREATE INDEX IX_UserSessions_UserId_IsActive ON dbo.UserSessions(UserId, IsActive);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserSessions_SessionHash' AND object_id = OBJECT_ID('dbo.UserSessions'))
  CREATE INDEX IX_UserSessions_SessionHash ON dbo.UserSessions(SessionHash);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserSessions_ExpiresAt' AND object_id = OBJECT_ID('dbo.UserSessions'))
  CREATE INDEX IX_UserSessions_ExpiresAt ON dbo.UserSessions(ExpiresAt) WHERE IsActive = 1;
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_OAuth2Providers_TenantId_IsEnabled' AND object_id = OBJECT_ID('dbo.OAuth2Providers'))
  CREATE INDEX IX_OAuth2Providers_TenantId_IsEnabled ON dbo.OAuth2Providers(TenantId, IsEnabled);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_OAuth2Tokens_UserId_IsRevoked' AND object_id = OBJECT_ID('dbo.OAuth2Tokens'))
  CREATE INDEX IX_OAuth2Tokens_UserId_IsRevoked ON dbo.OAuth2Tokens(UserId, IsRevoked);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_OAuth2Tokens_AccessTokenHash' AND object_id = OBJECT_ID('dbo.OAuth2Tokens'))
  CREATE INDEX IX_OAuth2Tokens_AccessTokenHash ON dbo.OAuth2Tokens(AccessTokenHash);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_OAuth2Tokens_ProviderUserId' AND object_id = OBJECT_ID('dbo.OAuth2Tokens'))
  CREATE INDEX IX_OAuth2Tokens_ProviderUserId ON dbo.OAuth2Tokens(ProviderId, ProviderUserId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_Permissions_TenantId_IsActive' AND object_id = OBJECT_ID('dbo.Permissions'))
  CREATE INDEX IX_Permissions_TenantId_IsActive ON dbo.Permissions(TenantId, IsActive);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserPermissions_UserId_ExpiresAt' AND object_id = OBJECT_ID('dbo.UserPermissions'))
  CREATE INDEX IX_UserPermissions_UserId_ExpiresAt ON dbo.UserPermissions(UserId, ExpiresAt);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_UserPermissions_PermissionId' AND object_id = OBJECT_ID('dbo.UserPermissions'))
  CREATE INDEX IX_UserPermissions_PermissionId ON dbo.UserPermissions(PermissionId);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ApiKeys_TenantId_IsActive' AND object_id = OBJECT_ID('dbo.ApiKeys'))
  CREATE INDEX IX_ApiKeys_TenantId_IsActive ON dbo.ApiKeys(TenantId, IsActive);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ApiKeys_UserId_IsActive' AND object_id = OBJECT_ID('dbo.ApiKeys'))
  CREATE INDEX IX_ApiKeys_UserId_IsActive ON dbo.ApiKeys(UserId, IsActive);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ApiKeys_KeyHash' AND object_id = OBJECT_ID('dbo.ApiKeys'))
  CREATE INDEX IX_ApiKeys_KeyHash ON dbo.ApiKeys(KeyHash);
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ApiKeys_ExpiresAt' AND object_id = OBJECT_ID('dbo.ApiKeys'))
  CREATE INDEX IX_ApiKeys_ExpiresAt ON dbo.ApiKeys(ExpiresAt) WHERE IsActive = 1;
GO

/* ==============================
   Read model view (search list)
   ============================== */

CREATE OR ALTER VIEW dbo.vProfileSearch
AS
SELECT
  p.ProfileId,
  p.TenantId,
  p.ProfileCode,
  p.FullName,
  p.Age,
  p.LocationText,
  p.OccupationText,
  u.Email AS AccountEmail,
  ppd.MaritalStatus,
  phd.Manglik,
  prf.Education,
  prf.WorkingCityCountry,
  p.CreatedAt
FROM dbo.Profiles p
INNER JOIN dbo.Users u ON u.Id = p.UserId
LEFT JOIN dbo.ProfilePersonalDetails ppd ON ppd.ProfileId = p.ProfileId
LEFT JOIN dbo.ProfileHoroscopeDetails phd ON phd.ProfileId = p.ProfileId
LEFT JOIN dbo.ProfileProfessionalDetails prf ON prf.ProfileId = p.ProfileId;
GO

PRINT 'Single-file reset + recreate completed.';
