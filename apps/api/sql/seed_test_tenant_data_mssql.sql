-- ===========================================================================
-- MatrimonySaaS - Test Seed Data
-- ===========================================================================
-- Password for ALL test users: Admin@123
-- PasswordHash below is a BCrypt work-factor-12 hash of "Admin@123"
-- Generated with: BCrypt.Net.BCrypt.HashPassword("Admin@123", workFactor: 12)
--
-- HOW TO RUN:
--   1. Open SSMS and connect to your MatrimonySaaS database.
--   2. Run this script (F5).
--   3. The script is idempotent - safe to run multiple times.
-- ===========================================================================

USE [MatrimonySaaS];
GO

SET NOCOUNT ON;

-- ===========================================================================
-- 1. GEOGRAPHY REFERENCE DATA
-- ===========================================================================

IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'IND')
  INSERT INTO dbo.Countries (Code, Name, NameMr, IsDefault, IsActive)
  VALUES ('IND', 'India', N'भारत', 1, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'USA')
  INSERT INTO dbo.Countries (Code, Name, NameMr, IsDefault, IsActive)
  VALUES ('USA', 'United States', NULL, 0, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'GBR')
  INSERT INTO dbo.Countries (Code, Name, NameMr, IsDefault, IsActive)
  VALUES ('GBR', 'United Kingdom', NULL, 0, 1);

DECLARE @IndiaId INT = (SELECT CountryId FROM dbo.Countries WHERE Code = 'IND');

IF NOT EXISTS (SELECT 1 FROM dbo.States WHERE CountryId = @IndiaId AND Code = 'MH')
  INSERT INTO dbo.States (CountryId, Code, Name, NameMr, IsActive)
  VALUES (@IndiaId, 'MH', 'Maharashtra', N'महाराष्ट्र', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.States WHERE CountryId = @IndiaId AND Code = 'GJ')
  INSERT INTO dbo.States (CountryId, Code, Name, NameMr, IsActive)
  VALUES (@IndiaId, 'GJ', 'Gujarat', N'गुजरात', 1);

IF NOT EXISTS (SELECT 1 FROM dbo.States WHERE CountryId = @IndiaId AND Code = 'KA')
  INSERT INTO dbo.States (CountryId, Code, Name, NameMr, IsActive)
  VALUES (@IndiaId, 'KA', 'Karnataka', NULL, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.States WHERE CountryId = @IndiaId AND Code = 'DL')
  INSERT INTO dbo.States (CountryId, Code, Name, NameMr, IsActive)
  VALUES (@IndiaId, 'DL', 'Delhi', NULL, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.States WHERE CountryId = @IndiaId AND Code = 'TN')
  INSERT INTO dbo.States (CountryId, Code, Name, NameMr, IsActive)
  VALUES (@IndiaId, 'TN', 'Tamil Nadu', NULL, 1);

IF NOT EXISTS (SELECT 1 FROM dbo.States WHERE CountryId = @IndiaId AND Code = 'AP')
  INSERT INTO dbo.States (CountryId, Code, Name, NameMr, IsActive)
  VALUES (@IndiaId, 'AP', 'Andhra Pradesh', NULL, 1);

DECLARE @MhId INT = (SELECT StateId FROM dbo.States WHERE CountryId = @IndiaId AND Code = 'MH');

IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Pune')
  INSERT INTO dbo.Districts (StateId, Name, NameMr, IsActive) VALUES (@MhId, 'Pune', N'पुणे', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Mumbai')
  INSERT INTO dbo.Districts (StateId, Name, NameMr, IsActive) VALUES (@MhId, 'Mumbai', N'मुंबई', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Nagpur')
  INSERT INTO dbo.Districts (StateId, Name, NameMr, IsActive) VALUES (@MhId, 'Nagpur', N'नागपूर', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Nashik')
  INSERT INTO dbo.Districts (StateId, Name, NameMr, IsActive) VALUES (@MhId, 'Nashik', N'नाशिक', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Aurangabad')
  INSERT INTO dbo.Districts (StateId, Name, NameMr, IsActive) VALUES (@MhId, 'Aurangabad', N'औरंगाबाद', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Solapur')
  INSERT INTO dbo.Districts (StateId, Name, NameMr, IsActive) VALUES (@MhId, 'Solapur', N'सोलापूर', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Satara')
  INSERT INTO dbo.Districts (StateId, Name, NameMr, IsActive) VALUES (@MhId, 'Satara', N'सातारा', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Kolhapur')
  INSERT INTO dbo.Districts (StateId, Name, NameMr, IsActive) VALUES (@MhId, 'Kolhapur', N'कोल्हापूर', 1);

DECLARE @PuneDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Pune');
IF @PuneDistId IS NOT NULL
BEGIN
  IF NOT EXISTS (SELECT 1 FROM dbo.Talukas WHERE DistrictId = @PuneDistId AND Name = 'Haveli')
    INSERT INTO dbo.Talukas (DistrictId, Name, NameMr, IsActive) VALUES (@PuneDistId, 'Haveli', N'हवेली', 1);
  IF NOT EXISTS (SELECT 1 FROM dbo.Talukas WHERE DistrictId = @PuneDistId AND Name = 'Mulshi')
    INSERT INTO dbo.Talukas (DistrictId, Name, NameMr, IsActive) VALUES (@PuneDistId, 'Mulshi', N'मुळशी', 1);
  IF NOT EXISTS (SELECT 1 FROM dbo.Talukas WHERE DistrictId = @PuneDistId AND Name = 'Maval')
    INSERT INTO dbo.Talukas (DistrictId, Name, NameMr, IsActive) VALUES (@PuneDistId, 'Maval', N'मावळ', 1);
  IF NOT EXISTS (SELECT 1 FROM dbo.Talukas WHERE DistrictId = @PuneDistId AND Name = 'Baramati')
    INSERT INTO dbo.Talukas (DistrictId, Name, NameMr, IsActive) VALUES (@PuneDistId, 'Baramati', N'बारामती', 1);
END
GO

-- ===========================================================================
-- 2. MASTER DATA (global)
-- ===========================================================================
EXEC dbo.usp_SeedMasterData 'Religion', 'HINDU', 'Hindu', N'हिंदू', N'हिंदू', 1;
EXEC dbo.usp_SeedMasterData 'Religion', 'MUSLIM', 'Muslim', N'मुस्लिम', NULL, 2;
EXEC dbo.usp_SeedMasterData 'Religion', 'CHRISTIAN', 'Christian', N'ख्रिश्चन', NULL, 3;
EXEC dbo.usp_SeedMasterData 'Religion', 'SIKH', 'Sikh', NULL, NULL, 4;
EXEC dbo.usp_SeedMasterData 'Religion', 'JAIN', 'Jain', N'जैन', N'जैन', 5;
EXEC dbo.usp_SeedMasterData 'Religion', 'BUDDHIST', 'Buddhist', N'बौद्ध', N'बौद्ध', 6;
EXEC dbo.usp_SeedMasterData 'Religion', 'OTHER', 'Other', N'अन्य', N'अन्य', 99;
GO

EXEC dbo.usp_SeedMasterData 'Caste', 'BRAHMIN', 'Brahmin', N'ब्राम्हण', NULL, 1;
EXEC dbo.usp_SeedMasterData 'Caste', 'MARATHA', 'Maratha', N'मराठा', NULL, 2;
EXEC dbo.usp_SeedMasterData 'Caste', 'KUNBI', 'Kunbi', N'कुणबी', NULL, 3;
EXEC dbo.usp_SeedMasterData 'Caste', 'OTHER_CASTE', 'Other', N'अन्य', NULL, 99;
GO

EXEC dbo.usp_SeedMasterData 'MaritalStatus', 'NEVER_MARRIED', 'Never Married', N'अविवाहित', NULL, 1;
EXEC dbo.usp_SeedMasterData 'MaritalStatus', 'DIVORCED', 'Divorced', N'घटस्फोटित', NULL, 2;
EXEC dbo.usp_SeedMasterData 'MaritalStatus', 'WIDOWED', 'Widowed', N'विधवा/विधुर', NULL, 3;
GO

EXEC dbo.usp_SeedMasterData 'Gender', 'MALE', 'Male', N'पुरुष', NULL, 1;
EXEC dbo.usp_SeedMasterData 'Gender', 'FEMALE', 'Female', N'स्त्री', NULL, 2;
EXEC dbo.usp_SeedMasterData 'Gender', 'OTHER', 'Other', N'अन्य', NULL, 3;
GO

-- ===========================================================================
-- 3. PLATFORM ROLES + PLATFORM ADMIN
-- ===========================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.PlatformRoles WHERE RoleName = 'SuperAdmin')
  INSERT INTO dbo.PlatformRoles (RoleName, IsActive) VALUES ('SuperAdmin', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.PlatformRoles WHERE RoleName = 'Support')
  INSERT INTO dbo.PlatformRoles (RoleName, IsActive) VALUES ('Support', 1);
GO

DECLARE @AdminHash NVARCHAR(255) = N'$2a$12$Zn3/iMDRNZ1h4h8NxuAaE.aWmR7Vv3H5aTl5wY2qlYpBDEV8IkOvy';

IF NOT EXISTS (SELECT 1 FROM dbo.PlatformAdmins WHERE Email = 'platformadmin@matrimony.com')
  INSERT INTO dbo.PlatformAdmins (Email, PasswordHash, DisplayName, MustChangePassword, IsActive)
  VALUES ('platformadmin@matrimony.com', @AdminHash, 'Platform Administrator', 0, 1);
GO

-- ===========================================================================
-- 4. TENANT + SUBSCRIPTION + SETTINGS + FEATURES
-- ===========================================================================
IF NOT EXISTS (SELECT 1 FROM dbo.Plans WHERE PlanName = 'Free')
  INSERT INTO dbo.Plans (PlanName, Price, DurationMonths, IsActive)
  VALUES ('Free', 0.00, 12, 1);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Tenants WHERE TenantCode = 'DEMO_TENANT')
  INSERT INTO dbo.Tenants (TenantCode, Domain, SubscriptionStatus, TrialEndDate, IsActive)
  VALUES ('DEMO_TENANT', 'demo.matrimony.local', 'active', DATEADD(MONTH, 3, CAST(GETUTCDATE() AS DATE)), 1);
GO

DECLARE @TenantId INT = (SELECT TenantId FROM dbo.Tenants WHERE TenantCode = 'DEMO_TENANT');
DECLARE @FreePlanId INT = (SELECT PlanId FROM dbo.Plans WHERE PlanName = 'Free');

IF NOT EXISTS (SELECT 1 FROM dbo.TenantSubscriptions WHERE TenantId = @TenantId AND IsActive = 1)
  INSERT INTO dbo.TenantSubscriptions (TenantId, PlanId, StartDate, EndDate, IsActive)
  VALUES (@TenantId, @FreePlanId, CAST(GETUTCDATE() AS DATE), DATEADD(YEAR, 1, CAST(GETUTCDATE() AS DATE)), 1);

IF NOT EXISTS (SELECT 1 FROM dbo.TenantSettings WHERE TenantId = @TenantId AND SettingKey = 'AppName')
  INSERT INTO dbo.TenantSettings (TenantId, SettingKey, SettingValue)
  VALUES (@TenantId, 'AppName', 'Demo Matrimony');

IF NOT EXISTS (SELECT 1 FROM dbo.TenantFeatures WHERE TenantId = @TenantId AND FeatureName = 'Chat')
  INSERT INTO dbo.TenantFeatures (TenantId, FeatureName, IsEnabled) VALUES (@TenantId, 'Chat', 1);
GO

-- ===========================================================================
-- 5. TENANT USERS + ROLES + AUTH METHODS
-- ===========================================================================
DECLARE @TenantId INT = (SELECT TenantId FROM dbo.Tenants WHERE TenantCode = 'DEMO_TENANT');
DECLARE @AdminHash NVARCHAR(255) = N'$2a$12$Zn3/iMDRNZ1h4h8NxuAaE.aWmR7Vv3H5aTl5wY2qlYpBDEV8IkOvy';

IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE TenantId = @TenantId AND RoleName = 'Admin')
  INSERT INTO dbo.Roles (TenantId, RoleName) VALUES (@TenantId, 'Admin');
IF NOT EXISTS (SELECT 1 FROM dbo.Roles WHERE TenantId = @TenantId AND RoleName = 'Member')
  INSERT INTO dbo.Roles (TenantId, RoleName) VALUES (@TenantId, 'Member');

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE TenantId = @TenantId AND Email = 'admin@demo.matrimony.local')
  INSERT INTO dbo.Users (TenantId, Email, PasswordHash, IsSuperAdmin, IsActive, FailedLoginAttempts, IsDeleted)
  VALUES (@TenantId, 'admin@demo.matrimony.local', @AdminHash, 1, 1, 0, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE TenantId = @TenantId AND Email = 'john.doe@demo.matrimony.local')
  INSERT INTO dbo.Users (TenantId, Email, PasswordHash, IsSuperAdmin, IsActive, FailedLoginAttempts, IsDeleted)
  VALUES (@TenantId, 'john.doe@demo.matrimony.local', @AdminHash, 0, 1, 0, 0);

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE TenantId = @TenantId AND Email = 'priya.sharma@demo.matrimony.local')
  INSERT INTO dbo.Users (TenantId, Email, PasswordHash, IsSuperAdmin, IsActive, FailedLoginAttempts, IsDeleted)
  VALUES (@TenantId, 'priya.sharma@demo.matrimony.local', @AdminHash, 0, 1, 0, 0);
GO

DECLARE @TenantId INT = (SELECT TenantId FROM dbo.Tenants WHERE TenantCode = 'DEMO_TENANT');
DECLARE @AdminRoleId INT = (SELECT RoleId FROM dbo.Roles WHERE TenantId = @TenantId AND RoleName = 'Admin');
DECLARE @MemberRoleId INT = (SELECT RoleId FROM dbo.Roles WHERE TenantId = @TenantId AND RoleName = 'Member');

INSERT INTO dbo.UserRoles (UserId, RoleId, TenantId)
SELECT u.Id, @AdminRoleId, @TenantId
FROM dbo.Users u
WHERE u.TenantId = @TenantId AND u.IsSuperAdmin = 1
  AND NOT EXISTS (SELECT 1 FROM dbo.UserRoles r WHERE r.UserId = u.Id AND r.RoleId = @AdminRoleId);

INSERT INTO dbo.UserRoles (UserId, RoleId, TenantId)
SELECT u.Id, @MemberRoleId, @TenantId
FROM dbo.Users u
WHERE u.TenantId = @TenantId AND u.IsSuperAdmin = 0
  AND NOT EXISTS (SELECT 1 FROM dbo.UserRoles r WHERE r.UserId = u.Id AND r.RoleId = @MemberRoleId);

INSERT INTO dbo.AuthenticationMethods (UserId, MethodType, IsEnabled, IsPrimary)
SELECT u.Id, 'email_password', 1, 1
FROM dbo.Users u
WHERE u.TenantId = @TenantId
  AND NOT EXISTS (
    SELECT 1 FROM dbo.AuthenticationMethods am
    WHERE am.UserId = u.Id AND am.MethodType = 'email_password'
  );
GO

-- ===========================================================================
-- 6. SAMPLE PROFILES FOR SEARCH TESTING
-- ===========================================================================
DECLARE @TenantId INT = (SELECT TenantId FROM dbo.Tenants WHERE TenantCode = 'DEMO_TENANT');
DECLARE @User1Id INT = (SELECT Id FROM dbo.Users WHERE TenantId = @TenantId AND Email = 'john.doe@demo.matrimony.local');

IF @User1Id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Profiles WHERE UserId = @User1Id)
BEGIN
  INSERT INTO dbo.Profiles (TenantId, UserId, ProfileCode, FullName, Age, LocationText, OccupationText, IsDeleted, IsVerified, ProfileCompletionPercent)
  VALUES (@TenantId, @User1Id, 'DEMO0001', 'John Doe', 28, 'Pune, Maharashtra', 'Software Engineer', 0, 1, 75);
END

DECLARE @User2Id INT = (SELECT Id FROM dbo.Users WHERE TenantId = @TenantId AND Email = 'priya.sharma@demo.matrimony.local');
IF @User2Id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Profiles WHERE UserId = @User2Id)
BEGIN
  INSERT INTO dbo.Profiles (TenantId, UserId, ProfileCode, FullName, Age, LocationText, OccupationText, IsDeleted, IsVerified, ProfileCompletionPercent)
  VALUES (@TenantId, @User2Id, 'DEMO0002', 'Priya Sharma', 25, 'Mumbai, Maharashtra', 'Doctor', 0, 1, 80);
END
GO

PRINT '=================================================================';
PRINT 'MatrimonySaaS seed data applied successfully.';
PRINT 'Tenant: DEMO_TENANT';
PRINT 'Admin: admin@demo.matrimony.local';
PRINT 'Members: john.doe@demo.matrimony.local, priya.sharma@demo.matrimony.local';
PRINT 'Password for all: Admin@123';
PRINT '=================================================================';
GO
