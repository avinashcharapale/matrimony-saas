/*
  Master Data Migration: Geography (States/Districts/Talukas) + Lookup Tables
  ----------------------------------------------------------------------------
  Run this ONCE against MatrimonySaaS database.
  Idempotent: uses IF NOT EXISTS checks throughout.
*/

USE MatrimonySaaS;
GO

/* ============================================================
   PART 1: Geographic Hierarchy Tables
   ============================================================ */

IF OBJECT_ID('dbo.Talukas', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Talukas (
    TalukaId    INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    DistrictId  INT NOT NULL,
    Name        NVARCHAR(100) NOT NULL,
    NameMr      NVARCHAR(100) NULL,
    IsActive    BIT NOT NULL CONSTRAINT DF_Talukas_IsActive DEFAULT (1),
    CONSTRAINT UQ_Talukas UNIQUE (DistrictId, Name)
  );
END;
GO

IF OBJECT_ID('dbo.Districts', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Districts (
    DistrictId  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    StateId     INT NOT NULL,
    Name        NVARCHAR(100) NOT NULL,
    NameMr      NVARCHAR(100) NULL,
    IsActive    BIT NOT NULL CONSTRAINT DF_Districts_IsActive DEFAULT (1),
    CONSTRAINT UQ_Districts UNIQUE (StateId, Name)
  );
END;
GO

IF OBJECT_ID('dbo.States', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.States (
    StateId   INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    CountryId INT NOT NULL,
    Code      NVARCHAR(5) NOT NULL,
    Name      NVARCHAR(100) NOT NULL,
    NameMr    NVARCHAR(100) NULL,
    IsActive  BIT NOT NULL CONSTRAINT DF_States_IsActive DEFAULT (1),
    CONSTRAINT UQ_States_Code UNIQUE (CountryId, Code)
  );
END;
GO

IF OBJECT_ID('dbo.Countries', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.Countries (
    CountryId  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Code       NVARCHAR(3) NOT NULL,
    Name       NVARCHAR(100) NOT NULL,
    NameMr     NVARCHAR(100) NULL,
    IsDefault  BIT NOT NULL CONSTRAINT DF_Countries_IsDefault DEFAULT (0),
    IsActive   BIT NOT NULL CONSTRAINT DF_Countries_IsActive DEFAULT (1),
    CONSTRAINT UQ_Countries_Code UNIQUE (Code)
  );
END;
GO

-- Now add FKs if tables just created
IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys
  WHERE name = 'FK_States_Country'
)
  ALTER TABLE dbo.States ADD CONSTRAINT FK_States_Country
    FOREIGN KEY (CountryId) REFERENCES dbo.Countries(CountryId);
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys
  WHERE name = 'FK_Districts_State'
)
  ALTER TABLE dbo.Districts ADD CONSTRAINT FK_Districts_State
    FOREIGN KEY (StateId) REFERENCES dbo.States(StateId);
GO

IF NOT EXISTS (
  SELECT 1 FROM sys.foreign_keys
  WHERE name = 'FK_Talukas_District'
)
  ALTER TABLE dbo.Talukas ADD CONSTRAINT FK_Talukas_District
    FOREIGN KEY (DistrictId) REFERENCES dbo.Districts(DistrictId);
GO

/* ============================================================
   PART 2: Generic Lookup Tables (with translations)
   ============================================================ */

IF OBJECT_ID('dbo.MasterData', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.MasterData (
    MasterDataId  INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    TenantId      INT NOT NULL CONSTRAINT DF_MasterData_TenantId DEFAULT (0), -- 0 = global
    Category      NVARCHAR(50) NOT NULL,
    ValueCode     NVARCHAR(80) NOT NULL,
    SortOrder     SMALLINT NOT NULL CONSTRAINT DF_MasterData_SortOrder DEFAULT (0),
    IsActive      BIT NOT NULL CONSTRAINT DF_MasterData_IsActive DEFAULT (1),
    CreatedAt     DATETIME2(3) NOT NULL CONSTRAINT DF_MasterData_CreatedAt DEFAULT SYSUTCDATETIME(),
    UpdatedAt     DATETIME2(3) NOT NULL CONSTRAINT DF_MasterData_UpdatedAt DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_MasterData UNIQUE (TenantId, Category, ValueCode)
  );
END;
GO

IF OBJECT_ID('dbo.MasterDataTranslations', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.MasterDataTranslations (
    MasterDataId  INT NOT NULL,
    LangCode      NVARCHAR(5) NOT NULL,  -- 'en', 'mr', 'hi'
    Label         NVARCHAR(200) NOT NULL,
    CONSTRAINT PK_MasterDataTranslations PRIMARY KEY (MasterDataId, LangCode),
    CONSTRAINT FK_MasterDataTrans_Master FOREIGN KEY (MasterDataId)
      REFERENCES dbo.MasterData(MasterDataId) ON DELETE CASCADE
  );
END;
GO

-- Cleanup guard: if legacy map tables were created with CASCADE FKs,
-- drop and recreate them to avoid SQL Server multiple-cascade-path errors.
IF OBJECT_ID('dbo.CasteSubCasteMap', 'U') IS NOT NULL
   AND EXISTS (
     SELECT 1
     FROM sys.foreign_keys
     WHERE parent_object_id = OBJECT_ID('dbo.CasteSubCasteMap')
       AND name IN ('FK_CasteSubCasteMap_Caste', 'FK_CasteSubCasteMap_SubCaste')
       AND delete_referential_action = 1
   )
BEGIN
  DROP TABLE dbo.CasteSubCasteMap;
END;
GO

IF OBJECT_ID('dbo.ReligionCasteMap', 'U') IS NOT NULL
   AND EXISTS (
     SELECT 1
     FROM sys.foreign_keys
     WHERE parent_object_id = OBJECT_ID('dbo.ReligionCasteMap')
       AND name IN ('FK_ReligionCasteMap_Religion', 'FK_ReligionCasteMap_Caste')
       AND delete_referential_action = 1
   )
BEGIN
  DROP TABLE dbo.ReligionCasteMap;
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

/* ============================================================
   PART 3: Seed Countries
   ============================================================ */

IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'IN')
  INSERT INTO dbo.Countries (Code, Name, NameMr, IsDefault) VALUES ('IN', 'India', N'भारत', 1);
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'US')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('US', 'United States', N'संयुक्त राज्ये');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'AU')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('AU', 'Australia', N'ऑस्ट्रेलिया');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'AE')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('AE', 'UAE', N'संयुक्त अरब अमिरात');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'GB')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('GB', 'United Kingdom', N'युनायटेड किंगडम');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'CA')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('CA', 'Canada', N'कॅनडा');
-- Additional countries for diaspora / working abroad
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'NZ')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('NZ', 'New Zealand', N'न्यूझीलंड');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'SG')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('SG', 'Singapore', N'सिंगापूर');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'MY')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('MY', 'Malaysia', N'मलेशिया');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'QA')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('QA', 'Qatar', N'कतार');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'SA')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('SA', 'Saudi Arabia', N'सौदी अरेबिया');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'KW')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('KW', 'Kuwait', N'कुवेत');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'BH')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('BH', 'Bahrain', N'बहारीन');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'OM')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('OM', 'Oman', N'ओमान');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'DE')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('DE', 'Germany', N'जर्मनी');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'NL')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('NL', 'Netherlands', N'नेदरलँड्स');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'FR')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('FR', 'France', N'फ्रान्स');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'JP')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('JP', 'Japan', N'जपान');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'ZA')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('ZA', 'South Africa', N'दक्षिण आफ्रिका');
IF NOT EXISTS (SELECT 1 FROM dbo.Countries WHERE Code = 'OTH')
  INSERT INTO dbo.Countries (Code, Name, NameMr) VALUES ('OTH', 'Other', N'इतर');
GO

/* ============================================================
   PART 4: Seed Indian States
   ============================================================ */

DECLARE @IndiaId INT = (SELECT CountryId FROM dbo.Countries WHERE Code = 'IN');

;WITH SourceStates AS (
  SELECT v.Code, v.Name, v.NameMr
  FROM (VALUES
    ('MH', 'Maharashtra', N'महाराष्ट्र'),
    ('KA', 'Karnataka', N'कर्नाटक'),
    ('DL', 'Delhi', N'दिल्ली'),
    ('GJ', 'Gujarat', N'गुजरात'),
    ('MP', 'Madhya Pradesh', N'मध्य प्रदेश'),
    ('RJ', 'Rajasthan', N'राजस्थान'),
    ('UP', 'Uttar Pradesh', N'उत्तर प्रदेश'),
    ('TN', 'Tamil Nadu', N'तामिळनाडू'),
    ('AP', 'Andhra Pradesh', N'आंध्र प्रदेश'),
    ('AR', 'Arunachal Pradesh', N'अरुणाचल प्रदेश'),
    ('AS', 'Assam', N'आसाम'),
    ('BR', 'Bihar', N'बिहार'),
    ('CT', 'Chhattisgarh', N'छत्तीसगड'),
    ('GA', 'Goa', N'गोवा'),
    ('HR', 'Haryana', N'हरियाणा'),
    ('HP', 'Himachal Pradesh', N'हिमाचल प्रदेश'),
    ('JH', 'Jharkhand', N'झारखंड'),
    ('KL', 'Kerala', N'केरळ'),
    ('MN', 'Manipur', N'मणिपूर'),
    ('ML', 'Meghalaya', N'मेघालय'),
    ('MZ', 'Mizoram', N'मिझोरम'),
    ('NL', 'Nagaland', N'नागालँड'),
    ('OD', 'Odisha', N'ओडिशा'),
    ('PB', 'Punjab', N'पंजाब'),
    ('SK', 'Sikkim', N'सिक्कीम'),
    ('TR', 'Tripura', N'त्रिपुरा'),
    ('TS', 'Telangana', N'तेलंगणा'),
    ('UK', 'Uttarakhand', N'उत्तराखंड'),
    ('WB', 'West Bengal', N'पश्चिम बंगाल'),
    ('AN', 'Andaman & Nicobar Islands', N'अंदमान व निकोबार'),
    ('CH', 'Chandigarh', N'चंदीगड'),
    ('DD', 'Dadra & Nagar Haveli and Daman & Diu', N'दादरा व नगर हवेली आणि दमण व दीव'),
    ('JK', 'Jammu & Kashmir', N'जम्मू व काश्मीर'),
    ('LA', 'Ladakh', N'लडाख'),
    ('LD', 'Lakshadweep', N'लक्षद्वीप'),
    ('PY', 'Puducherry', N'पुदुच्चेरी')
  ) AS v(Code, Name, NameMr)
)
UPDATE s
SET
  s.Name = src.Name,
  s.NameMr = src.NameMr
FROM dbo.States s
INNER JOIN SourceStates src
  ON src.Code = s.Code
 AND s.CountryId = @IndiaId;

;WITH SourceStates AS (
  SELECT v.Code, v.Name, v.NameMr
  FROM (VALUES
    ('MH', 'Maharashtra', N'महाराष्ट्र'),
    ('KA', 'Karnataka', N'कर्नाटक'),
    ('DL', 'Delhi', N'दिल्ली'),
    ('GJ', 'Gujarat', N'गुजरात'),
    ('MP', 'Madhya Pradesh', N'मध्य प्रदेश'),
    ('RJ', 'Rajasthan', N'राजस्थान'),
    ('UP', 'Uttar Pradesh', N'उत्तर प्रदेश'),
    ('TN', 'Tamil Nadu', N'तामिळनाडू'),
    ('AP', 'Andhra Pradesh', N'आंध्र प्रदेश'),
    ('AR', 'Arunachal Pradesh', N'अरुणाचल प्रदेश'),
    ('AS', 'Assam', N'आसाम'),
    ('BR', 'Bihar', N'बिहार'),
    ('CT', 'Chhattisgarh', N'छत्तीसगड'),
    ('GA', 'Goa', N'गोवा'),
    ('HR', 'Haryana', N'हरियाणा'),
    ('HP', 'Himachal Pradesh', N'हिमाचल प्रदेश'),
    ('JH', 'Jharkhand', N'झारखंड'),
    ('KL', 'Kerala', N'केरळ'),
    ('MN', 'Manipur', N'मणिपूर'),
    ('ML', 'Meghalaya', N'मेघालय'),
    ('MZ', 'Mizoram', N'मिझोरम'),
    ('NL', 'Nagaland', N'नागालँड'),
    ('OD', 'Odisha', N'ओडिशा'),
    ('PB', 'Punjab', N'पंजाब'),
    ('SK', 'Sikkim', N'सिक्कीम'),
    ('TR', 'Tripura', N'त्रिपुरा'),
    ('TS', 'Telangana', N'तेलंगणा'),
    ('UK', 'Uttarakhand', N'उत्तराखंड'),
    ('WB', 'West Bengal', N'पश्चिम बंगाल'),
    ('AN', 'Andaman & Nicobar Islands', N'अंदमान व निकोबार'),
    ('CH', 'Chandigarh', N'चंदीगड'),
    ('DD', 'Dadra & Nagar Haveli and Daman & Diu', N'दादरा व नगर हवेली आणि दमण व दीव'),
    ('JK', 'Jammu & Kashmir', N'जम्मू व काश्मीर'),
    ('LA', 'Ladakh', N'लडाख'),
    ('LD', 'Lakshadweep', N'लक्षद्वीप'),
    ('PY', 'Puducherry', N'पुदुच्चेरी')
  ) AS v(Code, Name, NameMr)
)
INSERT INTO dbo.States (CountryId, Code, Name, NameMr)
SELECT @IndiaId, src.Code, src.Name, src.NameMr
FROM SourceStates src
WHERE NOT EXISTS (
  SELECT 1
  FROM dbo.States s
  WHERE s.CountryId = @IndiaId
    AND s.Code = src.Code
);
GO

/* ============================================================
   PART 5: Seed Maharashtra Districts (all 36)
   ============================================================ */

DECLARE @MhId INT = (SELECT StateId FROM dbo.States WHERE Code = 'MH');

-- Konkan Division
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Mumbai City')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Mumbai City', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Mumbai Suburban')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Mumbai Suburban', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Thane')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Thane', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Palghar')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Palghar', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Raigad')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Raigad', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Ratnagiri')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Ratnagiri', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Sindhudurg')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Sindhudurg', N'');
-- Nashik Division
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Nashik')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Nashik', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Dhule')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Dhule', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Nandurbar')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Nandurbar', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Jalgaon')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Jalgaon', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Ahmednagar')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Ahmednagar', N'');
-- Pune Division
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Pune')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Pune', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Satara')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Satara', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Sangli')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Sangli', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Solapur')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Solapur', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Kolhapur')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Kolhapur', N'');
-- Aurangabad Division
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Aurangabad')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Aurangabad', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Jalna')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Jalna', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Beed')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Beed', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Osmanabad')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Osmanabad', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Latur')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Latur', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Nanded')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Nanded', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Hingoli')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Hingoli', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Parbhani')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Parbhani', N'');
-- Amravati Division
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Amravati')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Amravati', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Akola')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Akola', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Buldhana')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Buldhana', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Washim')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Washim', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Yavatmal')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Yavatmal', N'');
-- Nagpur Division
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Nagpur')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Nagpur', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Wardha')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Wardha', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Bhandara')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Bhandara', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Gondia')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Gondia', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Chandrapur')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Chandrapur', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Gadchiroli')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Gadchiroli', N'');
IF NOT EXISTS (SELECT 1 FROM dbo.Districts WHERE StateId = @MhId AND Name = 'Other')
  INSERT INTO dbo.Districts (StateId, Name, NameMr) VALUES (@MhId, 'Other', N'');
GO

-- Repair Marathi district names for all Maharashtra districts.
;WITH DistrictMr AS (
  SELECT v.DistrictName, v.DistrictNameMr
  FROM (VALUES
    ('Mumbai City', N'मुंबई शहर'),
    ('Mumbai Suburban', N'मुंबई उपनगर'),
    ('Thane', N'ठाणे'),
    ('Palghar', N'पालघर'),
    ('Raigad', N'रायगड'),
    ('Ratnagiri', N'रत्नागिरी'),
    ('Sindhudurg', N'सिंधुदुर्ग'),
    ('Nashik', N'नाशिक'),
    ('Dhule', N'धुळे'),
    ('Nandurbar', N'नंदुरबार'),
    ('Jalgaon', N'जळगाव'),
    ('Ahmednagar', N'अहमदनगर'),
    ('Pune', N'पुणे'),
    ('Satara', N'सातारा'),
    ('Sangli', N'सांगली'),
    ('Solapur', N'सोलापूर'),
    ('Kolhapur', N'कोल्हापूर'),
    ('Aurangabad', N'औरंगाबाद'),
    ('Jalna', N'जालना'),
    ('Beed', N'बीड'),
    ('Osmanabad', N'उस्मानाबाद'),
    ('Latur', N'लातूर'),
    ('Nanded', N'नांदेड'),
    ('Hingoli', N'हिंगोली'),
    ('Parbhani', N'परभणी'),
    ('Amravati', N'अमरावती'),
    ('Akola', N'अकोला'),
    ('Buldhana', N'बुलढाणा'),
    ('Washim', N'वाशिम'),
    ('Yavatmal', N'यवतमाळ'),
    ('Nagpur', N'नागपूर'),
    ('Wardha', N'वर्धा'),
    ('Bhandara', N'भंडारा'),
    ('Gondia', N'गोंदिया'),
    ('Chandrapur', N'चंद्रपूर'),
    ('Gadchiroli', N'गडचिरोली'),
    ('Other', N'इतर')
  ) AS v(DistrictName, DistrictNameMr)
)
UPDATE d
SET d.NameMr = m.DistrictNameMr
FROM dbo.Districts d
INNER JOIN DistrictMr m ON m.DistrictName = d.Name
WHERE ISNULL(d.NameMr, N'') <> m.DistrictNameMr;
GO

/* ============================================================
   PART 6: Seed Talukas for key districts (Pune, Nashik, Kolhapur)
   ============================================================ */

DECLARE @PuneDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Pune');
IF @PuneDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @PuneDistId, v.Name, v.NameMr FROM (VALUES
    ('Haveli',       N''),
    ('Pune City',    N''),
    ('Khed',         N''),
    ('Shirur',       N''),
    ('Junnar',       N''),
    ('Ambegaon',     N''),
    ('Maval',        N''),
    ('Velha',        N''),
    ('Bhor',         N''),
    ('Purandar',     N''),
    ('Baramati',     N''),
    ('Indapur',      N''),
    ('Daund',        N''),
    ('Mulshi',       N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @PuneDistId AND t.Name = v.Name
  );
END;
GO

DECLARE @NashikDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Nashik');
IF @NashikDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @NashikDistId, v.Name, v.NameMr FROM (VALUES
    ('Nashik',         N''),
    ('Sinnar',         N''),
    ('Niphad',         N''),
    ('Dindori',        N''),
    ('Peth',           N''),
    ('Trimbakeshwar',  N''),
    ('Igatpuri',       N''),
    ('Baglan',         N''),
    ('Kalwan',         N''),
    ('Chandwad',       N''),
    ('Deola',          N''),
    ('Yeola',          N''),
    ('Nandgaon',       N''),
    ('Malegaon',       N''),
    ('Surgana',        N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @NashikDistId AND t.Name = v.Name
  );
END;
GO

DECLARE @KolhapurDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Kolhapur');
IF @KolhapurDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @KolhapurDistId, v.Name, v.NameMr FROM (VALUES
    ('Karvir',      N''),
    ('Kagal',       N''),
    ('Hatkanangle', N''),
    ('Shirol',      N''),
    ('Panhala',     N''),
    ('Shahuwadi',   N''),
    ('Gadhinglaj',  N''),
    ('Chandgad',    N''),
    ('Ajra',        N''),
    ('Bhudargad',   N''),
    ('Gaganbawda',  N''),
    ('Radhanagari', N''),
    ('Other',       N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @KolhapurDistId AND t.Name = v.Name
  );
END;
GO

-- ---- Talukas: Mumbai City ----
DECLARE @MumbaiCityDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Mumbai City');
IF @MumbaiCityDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @MumbaiCityDistId, v.Name, v.NameMr FROM (VALUES
    ('Mumbai City', N''),
    ('Other',       N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @MumbaiCityDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Mumbai Suburban ----
DECLARE @MumbaiSubDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Mumbai Suburban');
IF @MumbaiSubDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @MumbaiSubDistId, v.Name, v.NameMr FROM (VALUES
    ('Andheri',  N''),
    ('Borivali', N''),
    ('Kurla',    N''),
    ('Other',    N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @MumbaiSubDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Thane ----
DECLARE @ThaneDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Thane');
IF @ThaneDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @ThaneDistId, v.Name, v.NameMr FROM (VALUES
    ('Thane',      N''),
    ('Kalyan',     N''),
    ('Bhiwandi',   N''),
    ('Shahapur',   N''),
    ('Murbad',     N''),
    ('Ambarnath',  N''),
    ('Ulhasnagar', N''),
    ('Other',      N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @ThaneDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Palghar ----
DECLARE @PalgharDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Palghar');
IF @PalgharDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @PalgharDistId, v.Name, v.NameMr FROM (VALUES
    ('Palghar',    N''),
    ('Vasai',      N''),
    ('Dahanu',     N''),
    ('Talasari',   N''),
    ('Jawhar',     N''),
    ('Mokhada',    N''),
    ('Vikramgad',  N''),
    ('Wada',       N''),
    ('Other',      N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @PalgharDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Raigad ----
DECLARE @RaigadDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Raigad');
IF @RaigadDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @RaigadDistId, v.Name, v.NameMr FROM (VALUES
    ('Alibag',      N''),
    ('Pen',         N''),
    ('Panvel',      N''),
    ('Uran',        N''),
    ('Karjat',      N''),
    ('Khalapur',    N''),
    ('Mahad',       N''),
    ('Poladpur',    N''),
    ('Mangaon',     N''),
    ('Tala',        N''),
    ('Mhasala',     N''),
    ('Shrivardhan', N''),
    ('Murud',       N''),
    ('Roha',        N''),
    ('Sudhagad',    N''),
    ('Other',       N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @RaigadDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Ratnagiri ----
DECLARE @RatnagiriDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Ratnagiri');
IF @RatnagiriDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @RatnagiriDistId, v.Name, v.NameMr FROM (VALUES
    ('Ratnagiri',    N''),
    ('Lanja',        N''),
    ('Rajapur',      N''),
    ('Sangameshwar', N''),
    ('Chiplun',      N''),
    ('Khed',         N''),
    ('Dapoli',       N''),
    ('Mandangad',    N''),
    ('Guhagar',      N''),
    ('Other',        N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @RatnagiriDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Sindhudurg ----
DECLARE @SindhudurgDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Sindhudurg');
IF @SindhudurgDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @SindhudurgDistId, v.Name, v.NameMr FROM (VALUES
    ('Kudal',       N''),
    ('Malvan',      N''),
    ('Sawantwadi',  N''),
    ('Kankavli',    N''),
    ('Vaibhavwadi', N''),
    ('Deogad',      N''),
    ('Vengurla',    N''),
    ('Dodamarg',    N''),
    ('Other',       N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @SindhudurgDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Dhule ----
DECLARE @DhuleDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Dhule');
IF @DhuleDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @DhuleDistId, v.Name, v.NameMr FROM (VALUES
    ('Dhule',     N''),
    ('Shirpur',   N''),
    ('Sakri',     N''),
    ('Sindkheda', N''),
    ('Other',     N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @DhuleDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Nandurbar ----
DECLARE @NandurbarDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Nandurbar');
IF @NandurbarDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @NandurbarDistId, v.Name, v.NameMr FROM (VALUES
    ('Nandurbar', N''),
    ('Navapur',   N''),
    ('Shahada',   N''),
    ('Taloda',    N''),
    ('Akkalkuwa', N''),
    ('Akrani',    N''),
    ('Other',     N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @NandurbarDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Jalgaon ----
DECLARE @JalgaonDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Jalgaon');
IF @JalgaonDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @JalgaonDistId, v.Name, v.NameMr FROM (VALUES
    ('Jalgaon',     N''),
    ('Amalner',     N''),
    ('Erandol',     N''),
    ('Bodwad',      N''),
    ('Bhusawal',    N''),
    ('Raver',       N''),
    ('Muktainagar', N''),
    ('Jamner',      N''),
    ('Dharangaon',  N''),
    ('Chalisgaon',  N''),
    ('Pachora',     N''),
    ('Bhadgaon',    N''),
    ('Parola',      N''),
    ('Chopda',      N''),
    ('Yawal',       N''),
    ('Other',       N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @JalgaonDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Ahmednagar ----
DECLARE @AhmednagarDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Ahmednagar');
IF @AhmednagarDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @AhmednagarDistId, v.Name, v.NameMr FROM (VALUES
    ('Ahmednagar',  N''),
    ('Rahuri',      N''),
    ('Newasa',      N''),
    ('Pathardi',    N''),
    ('Shrirampur',  N''),
    ('Kopargaon',   N''),
    ('Sangamner',   N''),
    ('Akole',       N''),
    ('Shevgaon',    N''),
    ('Parner',      N''),
    ('Jamkhed',     N''),
    ('Karjat',      N''),
    ('Other',       N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @AhmednagarDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Satara ----
DECLARE @SataraDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Satara');
IF @SataraDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @SataraDistId, v.Name, v.NameMr FROM (VALUES
    ('Satara',        N''),
    ('Karad',         N''),
    ('Patan',         N''),
    ('Mahabaleshwar', N''),
    ('Wai',           N''),
    ('Khandala',      N''),
    ('Koregaon',      N''),
    ('Phaltan',       N''),
    ('Khatav',        N''),
    ('Jaoli',         N''),
    ('Man',           N''),
    ('Other',         N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @SataraDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Sangli ----
DECLARE @SangliDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Sangli');
IF @SangliDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @SangliDistId, v.Name, v.NameMr FROM (VALUES
    ('Miraj',          N''),
    ('Sangli',         N''),
    ('Tasgaon',        N''),
    ('Walwa',          N''),
    ('Shirala',        N''),
    ('Palus',          N''),
    ('Kadegaon',       N''),
    ('Kavathemahankal',N''),
    ('Jat',            N''),
    ('Atpadi',         N''),
    ('Khanpur',        N''),
    ('Other',          N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @SangliDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Solapur ----
DECLARE @SolapurDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Solapur');
IF @SolapurDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @SolapurDistId, v.Name, v.NameMr FROM (VALUES
    ('Solapur North', N''),
    ('Solapur South', N''),
    ('Akkalkot',      N''),
    ('Pandharpur',    N''),
    ('Mangalvedha',   N''),
    ('Madha',         N''),
    ('Mohol',         N''),
    ('Barshi',        N''),
    ('Karmala',       N''),
    ('Sangola',       N''),
    ('Malshiras',     N''),
    ('Other',         N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @SolapurDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Aurangabad ----
DECLARE @AurangabadDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Aurangabad');
IF @AurangabadDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @AurangabadDistId, v.Name, v.NameMr FROM (VALUES
    ('Aurangabad', N''),
    ('Paithan',    N''),
    ('Gangapur',   N''),
    ('Vaijapur',   N''),
    ('Sillod',     N''),
    ('Kannad',     N''),
    ('Soegaon',    N''),
    ('Khuldabad',  N''),
    ('Phulambri',  N''),
    ('Other',      N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @AurangabadDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Jalna ----
DECLARE @JalnaDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Jalna');
IF @JalnaDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @JalnaDistId, v.Name, v.NameMr FROM (VALUES
    ('Jalna',       N''),
    ('Ambad',       N''),
    ('Badnapur',    N''),
    ('Bhokardan',   N''),
    ('Ghansawangi', N''),
    ('Jafrabad',    N''),
    ('Mantha',      N''),
    ('Partur',      N''),
    ('Other',       N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @JalnaDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Beed ----
DECLARE @BeedDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Beed');
IF @BeedDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @BeedDistId, v.Name, v.NameMr FROM (VALUES
    ('Beed',          N''),
    ('Ambejogai',     N''),
    ('Parli',         N''),
    ('Ashti',         N''),
    ('Dharur',        N''),
    ('Gevrai',        N''),
    ('Kaij',          N''),
    ('Majalgaon',     N''),
    ('Patoda',        N''),
    ('Shirur Kasar',  N''),
    ('Wadwani',       N''),
    ('Other',         N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @BeedDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Osmanabad ----
DECLARE @OsmanabadDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Osmanabad');
IF @OsmanabadDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @OsmanabadDistId, v.Name, v.NameMr FROM (VALUES
    ('Osmanabad', N''),
    ('Tuljapur',  N''),
    ('Omerga',    N''),
    ('Lohara',    N''),
    ('Kalamb',    N''),
    ('Paranda',   N''),
    ('Bhum',      N''),
    ('Washi',     N''),
    ('Other',     N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @OsmanabadDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Latur ----
DECLARE @LaturDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Latur');
IF @LaturDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @LaturDistId, v.Name, v.NameMr FROM (VALUES
    ('Latur',      N''),
    ('Ahmedpur',   N''),
    ('Udgir',      N''),
    ('Chakur',     N''),
    ('Devni',      N''),
    ('Ausa',       N''),
    ('Jalkot',     N''),
    ('Nilanga',    N''),
    ('Renapur',    N''),
    ('Other',      N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @LaturDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Nanded ----
DECLARE @NandedDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Nanded');
IF @NandedDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @NandedDistId, v.Name, v.NameMr FROM (VALUES
    ('Nanded',       N''),
    ('Ardhapur',     N''),
    ('Bhokar',       N''),
    ('Biloli',       N''),
    ('Deglur',       N''),
    ('Dharmabad',    N''),
    ('Hadgaon',      N''),
    ('Himayatnagar', N''),
    ('Kandhar',      N''),
    ('Kinwat',       N''),
    ('Loha',         N''),
    ('Mahoor',       N''),
    ('Mudkhed',      N''),
    ('Mukhed',       N''),
    ('Naigaon',      N''),
    ('Umri',         N''),
    ('Other',        N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @NandedDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Hingoli ----
DECLARE @HingoliDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Hingoli');
IF @HingoliDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @HingoliDistId, v.Name, v.NameMr FROM (VALUES
    ('Hingoli',   N''),
    ('Aundha',    N''),
    ('Basmath',   N''),
    ('Kalamnuri', N''),
    ('Sengaon',   N''),
    ('Other',     N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @HingoliDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Parbhani ----
DECLARE @ParbhaniDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Parbhani');
IF @ParbhaniDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @ParbhaniDistId, v.Name, v.NameMr FROM (VALUES
    ('Parbhani',  N''),
    ('Gangakhed', N''),
    ('Jintur',    N''),
    ('Manwath',   N''),
    ('Palam',     N''),
    ('Pathri',    N''),
    ('Purna',     N''),
    ('Sailu',     N''),
    ('Selu',      N''),
    ('Sonpeth',   N''),
    ('Other',     N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @ParbhaniDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Amravati ----
DECLARE @AmravatiDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Amravati');
IF @AmravatiDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @AmravatiDistId, v.Name, v.NameMr FROM (VALUES
    ('Amravati',           N''),
    ('Achalpur',           N''),
    ('Anjangaon',          N''),
    ('Bhatkuli',           N''),
    ('Chandur Bazar',      N''),
    ('Chandur Railway',    N''),
    ('Chikhaldara',        N''),
    ('Daryapur',           N''),
    ('Dharni',             N''),
    ('Morshi',             N''),
    ('Nandgaon Khandeshwar',N''),
    ('Teosa',              N''),
    ('Tivsa',              N''),
    ('Warud',              N''),
    ('Other',              N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @AmravatiDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Akola ----
DECLARE @AkolaDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Akola');
IF @AkolaDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @AkolaDistId, v.Name, v.NameMr FROM (VALUES
    ('Akola',       N''),
    ('Akot',        N''),
    ('Balapur',     N''),
    ('Barshitakli', N''),
    ('Murtijapur',  N''),
    ('Patur',       N''),
    ('Telhara',     N''),
    ('Other',       N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @AkolaDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Buldhana ----
DECLARE @BuldhanaDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Buldhana');
IF @BuldhanaDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @BuldhanaDistId, v.Name, v.NameMr FROM (VALUES
    ('Buldhana',      N''),
    ('Chikhli',       N''),
    ('Deulgaon Raja', N''),
    ('Jalgaon Jamod', N''),
    ('Khamgaon',      N''),
    ('Lonar',         N''),
    ('Malkapur',      N''),
    ('Mehkar',        N''),
    ('Motala',        N''),
    ('Nandura',       N''),
    ('Sangrampur',    N''),
    ('Shegaon',       N''),
    ('Sindkhed Raja', N''),
    ('Other',         N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @BuldhanaDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Washim ----
DECLARE @WashimDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Washim');
IF @WashimDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @WashimDistId, v.Name, v.NameMr FROM (VALUES
    ('Washim',     N''),
    ('Karanja',    N''),
    ('Malegaon',   N''),
    ('Mangrulpir', N''),
    ('Manora',     N''),
    ('Risod',      N''),
    ('Other',      N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @WashimDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Yavatmal ----
DECLARE @YavatmalDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Yavatmal');
IF @YavatmalDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @YavatmalDistId, v.Name, v.NameMr FROM (VALUES
    ('Yavatmal',  N''),
    ('Arni',      N''),
    ('Babulgaon', N''),
    ('Darwha',    N''),
    ('Digras',    N''),
    ('Ghatanji',  N''),
    ('Kalamb',    N''),
    ('Kelapur',   N''),
    ('Mahagaon',  N''),
    ('Maregaon',  N''),
    ('Ner',       N''),
    ('Pusad',     N''),
    ('Ralegaon',  N''),
    ('Umarkhed',  N''),
    ('Wani',      N''),
    ('Zari Jamni',N''),
    ('Other',     N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @YavatmalDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Nagpur ----
DECLARE @NagpurDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Nagpur');
IF @NagpurDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @NagpurDistId, v.Name, v.NameMr FROM (VALUES
    ('Nagpur City',  N''),
    ('Nagpur Rural', N''),
    ('Hingna',       N''),
    ('Kamptee',      N''),
    ('Katol',        N''),
    ('Kalmeshwar',   N''),
    ('Mauda',        N''),
    ('Narkhed',      N''),
    ('Parseoni',     N''),
    ('Ramtek',       N''),
    ('Savner',       N''),
    ('Umred',        N''),
    ('Bhiwapur',     N''),
    ('Other',        N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @NagpurDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Wardha ----
DECLARE @WardhaDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Wardha');
IF @WardhaDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @WardhaDistId, v.Name, v.NameMr FROM (VALUES
    ('Wardha',     N''),
    ('Arvi',       N''),
    ('Ashti',      N''),
    ('Deoli',      N''),
    ('Hinganghat', N''),
    ('Karanja',    N''),
    ('Samudrapur', N''),
    ('Seloo',      N''),
    ('Other',      N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @WardhaDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Bhandara ----
DECLARE @BhandaraDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Bhandara');
IF @BhandaraDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @BhandaraDistId, v.Name, v.NameMr FROM (VALUES
    ('Bhandara',  N''),
    ('Mohadi',    N''),
    ('Pauni',     N''),
    ('Sakoli',    N''),
    ('Tumsar',    N''),
    ('Lakhni',    N''),
    ('Lakhandur', N''),
    ('Other',     N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @BhandaraDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Gondia ----
DECLARE @GondiaDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Gondia');
IF @GondiaDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @GondiaDistId, v.Name, v.NameMr FROM (VALUES
    ('Gondia',          N''),
    ('Amgaon',          N''),
    ('Arjuni Morgaon',  N''),
    ('Deori',           N''),
    ('Goregaon',        N''),
    ('Sadak Arjuni',    N''),
    ('Salekasa',        N''),
    ('Tirora',          N''),
    ('Other',           N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @GondiaDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Chandrapur ----
DECLARE @ChandrapurDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Chandrapur');
IF @ChandrapurDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @ChandrapurDistId, v.Name, v.NameMr FROM (VALUES
    ('Chandrapur',  N''),
    ('Ballarpur',   N''),
    ('Bhadravati',  N''),
    ('Brahmapuri',  N''),
    ('Chimur',      N''),
    ('Gondpipri',   N''),
    ('Jiwati',      N''),
    ('Korpana',     N''),
    ('Mul',         N''),
    ('Nagbhid',     N''),
    ('Pombhurna',   N''),
    ('Rajura',      N''),
    ('Sawali',      N''),
    ('Sindewahi',   N''),
    ('Warora',      N''),
    ('Other',       N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @ChandrapurDistId AND t.Name = v.Name);
END;
GO

-- ---- Talukas: Gadchiroli ----
DECLARE @GadchiroliDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Gadchiroli');
IF @GadchiroliDistId IS NOT NULL
BEGIN
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr)
  SELECT @GadchiroliDistId, v.Name, v.NameMr FROM (VALUES
    ('Gadchiroli', N''),
    ('Aheri',      N''),
    ('Armori',     N''),
    ('Bhamragad',  N''),
    ('Chamorshi',  N''),
    ('Desaiganj',  N''),
    ('Dhanora',    N''),
    ('Etapalli',   N''),
    ('Kurkheda',   N''),
    ('Mulchera',   N''),
    ('Sironcha',   N''),
    ('Wadsa',      N''),
    ('Other',      N'')
  ) AS v(Name, NameMr)
  WHERE NOT EXISTS (SELECT 1 FROM dbo.Talukas t WHERE t.DistrictId = @GadchiroliDistId AND t.Name = v.Name);
END;
GO

-- Other taluka for the "Other" district
DECLARE @OtherDistId INT = (SELECT DistrictId FROM dbo.Districts WHERE StateId = (SELECT StateId FROM dbo.States WHERE Code = 'MH') AND Name = 'Other');
IF @OtherDistId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Talukas WHERE DistrictId = @OtherDistId AND Name = 'Other')
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr) VALUES (@OtherDistId, 'Other', N'');
GO

-- Add Other taluka to Pune & Nashik (seeded earlier without it)
DECLARE @PuneD INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Pune');
IF @PuneD IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Talukas WHERE DistrictId = @PuneD AND Name = 'Other')
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr) VALUES (@PuneD, 'Other', N'');
GO

DECLARE @NashikD INT = (SELECT DistrictId FROM dbo.Districts WHERE Name = 'Nashik');
IF @NashikD IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.Talukas WHERE DistrictId = @NashikD AND Name = 'Other')
  INSERT INTO dbo.Talukas (DistrictId, Name, NameMr) VALUES (@NashikD, 'Other', N'');
GO

-- Repair Unicode for existing taluka NameMr values (fixes prior ????? data)
;WITH TalukaMr AS (
  SELECT v.DistrictName, v.TalukaName, v.TalukaNameMr
  FROM (VALUES
    ('Pune', 'Haveli', N'हवेली'),
    ('Pune', 'Pune City', N'पुणे शहर'),
    ('Pune', 'Khed', N'खेड'),
    ('Pune', 'Shirur', N'शिरूर'),
    ('Pune', 'Junnar', N'जुन्नर'),
    ('Pune', 'Ambegaon', N'आंबेगाव'),
    ('Pune', 'Maval', N'मावळ'),
    ('Pune', 'Velha', N'वेल्हे'),
    ('Pune', 'Bhor', N'भोर'),
    ('Pune', 'Purandar', N'पुरंदर'),
    ('Pune', 'Baramati', N'बारामती'),
    ('Pune', 'Indapur', N'इंदापूर'),
    ('Pune', 'Daund', N'दौंड'),
    ('Pune', 'Mulshi', N'मुळशी'),
    ('Pune', 'Other', N'इतर'),

    ('Nashik', 'Nashik', N'नाशिक'),
    ('Nashik', 'Sinnar', N'सिन्नर'),
    ('Nashik', 'Niphad', N'निफाड'),
    ('Nashik', 'Dindori', N'दिंडोरी'),
    ('Nashik', 'Peth', N'पेठ'),
    ('Nashik', 'Trimbakeshwar', N'त्र्यंबकेश्वर'),
    ('Nashik', 'Igatpuri', N'इगतपुरी'),
    ('Nashik', 'Baglan', N'बागलाण'),
    ('Nashik', 'Kalwan', N'कळवण'),
    ('Nashik', 'Chandwad', N'चांदवड'),
    ('Nashik', 'Deola', N'देवळा'),
    ('Nashik', 'Yeola', N'येवला'),
    ('Nashik', 'Nandgaon', N'नांदगाव'),
    ('Nashik', 'Malegaon', N'मालेगाव'),
    ('Nashik', 'Surgana', N'सुरगाणा'),
    ('Nashik', 'Other', N'इतर'),

    ('Kolhapur', 'Karvir', N'करवीर'),
    ('Kolhapur', 'Kagal', N'कागल'),
    ('Kolhapur', 'Hatkanangle', N'हातकणंगले'),
    ('Kolhapur', 'Shirol', N'शिरोळ'),
    ('Kolhapur', 'Panhala', N'पन्हाळा'),
    ('Kolhapur', 'Shahuwadi', N'शाहूवाडी'),
    ('Kolhapur', 'Gadhinglaj', N'गडहिंग्लज'),
    ('Kolhapur', 'Chandgad', N'चंदगड'),
    ('Kolhapur', 'Ajra', N'आजरा'),
    ('Kolhapur', 'Bhudargad', N'भुदरगड'),
    ('Kolhapur', 'Gaganbawda', N'गगनबावडा'),
    ('Kolhapur', 'Radhanagari', N'राधानगरी'),
    ('Kolhapur', 'Other', N'इतर')
  ) AS v(DistrictName, TalukaName, TalukaNameMr)
)
UPDATE t
SET t.NameMr = m.TalukaNameMr
FROM dbo.Talukas t
INNER JOIN dbo.Districts d ON d.DistrictId = t.DistrictId
INNER JOIN TalukaMr m
  ON m.DistrictName = d.Name
 AND m.TalukaName = t.Name
WHERE ISNULL(t.NameMr, N'') <> m.TalukaNameMr;
GO

-- Comprehensive Marathi taluka repair for all talukas seeded in this file.
;WITH TalukaMrAll AS (
  SELECT v.DistrictName, v.TalukaName, v.TalukaNameMr
  FROM (VALUES
    ('Pune', 'Haveli', N'हवेली'),
    ('Pune', 'Pune City', N'पुणे शहर'),
    ('Pune', 'Khed', N'खेड'),
    ('Pune', 'Shirur', N'शिरूर'),
    ('Pune', 'Junnar', N'जुन्नर'),
    ('Pune', 'Ambegaon', N'आंबेगाव'),
    ('Pune', 'Maval', N'मावळ'),
    ('Pune', 'Velha', N'वेल्हे'),
    ('Pune', 'Bhor', N'भोर'),
    ('Pune', 'Purandar', N'पुरंदर'),
    ('Pune', 'Baramati', N'बारामती'),
    ('Pune', 'Indapur', N'इंदापूर'),
    ('Pune', 'Daund', N'दौंड'),
    ('Pune', 'Mulshi', N'मुळशी'),
    ('Pune', 'Other', N'इतर'),

    ('Nashik', 'Nashik', N'नाशिक'),
    ('Nashik', 'Sinnar', N'सिन्नर'),
    ('Nashik', 'Niphad', N'निफाड'),
    ('Nashik', 'Dindori', N'दिंडोरी'),
    ('Nashik', 'Peth', N'पेठ'),
    ('Nashik', 'Trimbakeshwar', N'त्र्यंबकेश्वर'),
    ('Nashik', 'Igatpuri', N'इगतपुरी'),
    ('Nashik', 'Baglan', N'बागलाण'),
    ('Nashik', 'Kalwan', N'कळवण'),
    ('Nashik', 'Chandwad', N'चांदवड'),
    ('Nashik', 'Deola', N'देवळा'),
    ('Nashik', 'Yeola', N'येवला'),
    ('Nashik', 'Nandgaon', N'नांदगाव'),
    ('Nashik', 'Malegaon', N'मालेगाव'),
    ('Nashik', 'Surgana', N'सुरगाणा'),
    ('Nashik', 'Other', N'इतर'),

    ('Kolhapur', 'Karvir', N'करवीर'),
    ('Kolhapur', 'Kagal', N'कागल'),
    ('Kolhapur', 'Hatkanangle', N'हातकणंगले'),
    ('Kolhapur', 'Shirol', N'शिरोळ'),
    ('Kolhapur', 'Panhala', N'पन्हाळा'),
    ('Kolhapur', 'Shahuwadi', N'शाहूवाडी'),
    ('Kolhapur', 'Gadhinglaj', N'गडहिंग्लज'),
    ('Kolhapur', 'Chandgad', N'चंदगड'),
    ('Kolhapur', 'Ajra', N'आजरा'),
    ('Kolhapur', 'Bhudargad', N'भुदरगड'),
    ('Kolhapur', 'Gaganbawda', N'गगनबावडा'),
    ('Kolhapur', 'Radhanagari', N'राधानगरी'),
    ('Kolhapur', 'Other', N'इतर'),

    ('Mumbai City', 'Mumbai City', N'मुंबई शहर'),
    ('Mumbai City', 'Other', N'इतर'),

    ('Mumbai Suburban', 'Andheri', N'अंधेरी'),
    ('Mumbai Suburban', 'Borivali', N'बोरिवली'),
    ('Mumbai Suburban', 'Kurla', N'कुर्ला'),
    ('Mumbai Suburban', 'Other', N'इतर'),

    ('Thane', 'Thane', N'ठाणे'),
    ('Thane', 'Kalyan', N'कल्याण'),
    ('Thane', 'Bhiwandi', N'भिवंडी'),
    ('Thane', 'Shahapur', N'शहापूर'),
    ('Thane', 'Murbad', N'मुरबाड'),
    ('Thane', 'Ambarnath', N'अंबरनाथ'),
    ('Thane', 'Ulhasnagar', N'उल्हासनगर'),
    ('Thane', 'Other', N'इतर'),

    ('Palghar', 'Palghar', N'पालघर'),
    ('Palghar', 'Vasai', N'वसई'),
    ('Palghar', 'Dahanu', N'डहाणू'),
    ('Palghar', 'Talasari', N'तलासरी'),
    ('Palghar', 'Jawhar', N'जव्हार'),
    ('Palghar', 'Mokhada', N'मोखाडा'),
    ('Palghar', 'Vikramgad', N'विक्रमगड'),
    ('Palghar', 'Wada', N'वाडा'),
    ('Palghar', 'Other', N'इतर'),

    ('Raigad', 'Alibag', N'अलिबाग'),
    ('Raigad', 'Pen', N'पेण'),
    ('Raigad', 'Panvel', N'पनवेल'),
    ('Raigad', 'Uran', N'उरण'),
    ('Raigad', 'Karjat', N'कर्जत'),
    ('Raigad', 'Khalapur', N'खालापूर'),
    ('Raigad', 'Mahad', N'महाड'),
    ('Raigad', 'Poladpur', N'पोलादपूर'),
    ('Raigad', 'Mangaon', N'माणगाव'),
    ('Raigad', 'Tala', N'तळा'),
    ('Raigad', 'Mhasala', N'म्हसळा'),
    ('Raigad', 'Shrivardhan', N'श्रीवर्धन'),
    ('Raigad', 'Murud', N'मुरूड'),
    ('Raigad', 'Roha', N'रोहा'),
    ('Raigad', 'Sudhagad', N'सुधागड'),
    ('Raigad', 'Other', N'इतर'),

    ('Ratnagiri', 'Ratnagiri', N'रत्नागिरी'),
    ('Ratnagiri', 'Lanja', N'लांजा'),
    ('Ratnagiri', 'Rajapur', N'राजापूर'),
    ('Ratnagiri', 'Sangameshwar', N'संगमेश्वर'),
    ('Ratnagiri', 'Chiplun', N'चिपळूण'),
    ('Ratnagiri', 'Khed', N'खेड'),
    ('Ratnagiri', 'Dapoli', N'दापोली'),
    ('Ratnagiri', 'Mandangad', N'मंडणगड'),
    ('Ratnagiri', 'Guhagar', N'गुहागर'),
    ('Ratnagiri', 'Other', N'इतर'),

    ('Sindhudurg', 'Kudal', N'कुडाळ'),
    ('Sindhudurg', 'Malvan', N'मालवण'),
    ('Sindhudurg', 'Sawantwadi', N'सावंतवाडी'),
    ('Sindhudurg', 'Kankavli', N'कणकवली'),
    ('Sindhudurg', 'Vaibhavwadi', N'वैभववाडी'),
    ('Sindhudurg', 'Deogad', N'देवगड'),
    ('Sindhudurg', 'Vengurla', N'वेंगुर्ले'),
    ('Sindhudurg', 'Dodamarg', N'दोडामार्ग'),
    ('Sindhudurg', 'Other', N'इतर'),

    ('Dhule', 'Dhule', N'धुळे'),
    ('Dhule', 'Shirpur', N'शिरपूर'),
    ('Dhule', 'Sakri', N'साक्री'),
    ('Dhule', 'Sindkheda', N'सिंदखेडा'),
    ('Dhule', 'Other', N'इतर'),

    ('Nandurbar', 'Nandurbar', N'नंदुरबार'),
    ('Nandurbar', 'Navapur', N'नवापूर'),
    ('Nandurbar', 'Shahada', N'शहादा'),
    ('Nandurbar', 'Taloda', N'तळोदा'),
    ('Nandurbar', 'Akkalkuwa', N'अक्कलकुवा'),
    ('Nandurbar', 'Akrani', N'अक्राणी'),
    ('Nandurbar', 'Other', N'इतर'),

    ('Jalgaon', 'Jalgaon', N'जळगाव'),
    ('Jalgaon', 'Amalner', N'अमळनेर'),
    ('Jalgaon', 'Erandol', N'एरंडोल'),
    ('Jalgaon', 'Bodwad', N'बोदवड'),
    ('Jalgaon', 'Bhusawal', N'भुसावळ'),
    ('Jalgaon', 'Raver', N'रावेर'),
    ('Jalgaon', 'Muktainagar', N'मुक्ताईनगर'),
    ('Jalgaon', 'Jamner', N'जामनेर'),
    ('Jalgaon', 'Dharangaon', N'धारणगाव'),
    ('Jalgaon', 'Chalisgaon', N'चाळीसगाव'),
    ('Jalgaon', 'Pachora', N'पाचोरा'),
    ('Jalgaon', 'Bhadgaon', N'भडगाव'),
    ('Jalgaon', 'Parola', N'पारोळा'),
    ('Jalgaon', 'Chopda', N'चोपडा'),
    ('Jalgaon', 'Yawal', N'यावल'),
    ('Jalgaon', 'Other', N'इतर'),

    ('Ahmednagar', 'Ahmednagar', N'अहमदनगर'),
    ('Ahmednagar', 'Rahuri', N'राहुरी'),
    ('Ahmednagar', 'Newasa', N'नेवासा'),
    ('Ahmednagar', 'Pathardi', N'पाथर्डी'),
    ('Ahmednagar', 'Shrirampur', N'श्रीरामपूर'),
    ('Ahmednagar', 'Kopargaon', N'कोपरगाव'),
    ('Ahmednagar', 'Sangamner', N'संगमनेर'),
    ('Ahmednagar', 'Akole', N'अकोले'),
    ('Ahmednagar', 'Shevgaon', N'शेवगाव'),
    ('Ahmednagar', 'Parner', N'पारनेर'),
    ('Ahmednagar', 'Jamkhed', N'जामखेड'),
    ('Ahmednagar', 'Karjat', N'कर्जत'),
    ('Ahmednagar', 'Other', N'इतर'),

    ('Satara', 'Satara', N'सातारा'),
    ('Satara', 'Karad', N'कराड'),
    ('Satara', 'Patan', N'पाटण'),
    ('Satara', 'Mahabaleshwar', N'महाबळेश्वर'),
    ('Satara', 'Wai', N'वाई'),
    ('Satara', 'Khandala', N'खंडाळा'),
    ('Satara', 'Koregaon', N'कोरेगाव'),
    ('Satara', 'Phaltan', N'फलटण'),
    ('Satara', 'Khatav', N'खटाव'),
    ('Satara', 'Jaoli', N'जावली'),
    ('Satara', 'Man', N'माण'),
    ('Satara', 'Other', N'इतर'),

    ('Sangli', 'Miraj', N'मिरज'),
    ('Sangli', 'Sangli', N'सांगली'),
    ('Sangli', 'Tasgaon', N'तासगाव'),
    ('Sangli', 'Walwa', N'वाळवा'),
    ('Sangli', 'Shirala', N'शिराळा'),
    ('Sangli', 'Palus', N'पलूस'),
    ('Sangli', 'Kadegaon', N'कडेगाव'),
    ('Sangli', 'Kavathemahankal', N'कवठेमहांकाळ'),
    ('Sangli', 'Jat', N'जत'),
    ('Sangli', 'Atpadi', N'आटपाडी'),
    ('Sangli', 'Khanpur', N'खानापूर'),
    ('Sangli', 'Other', N'इतर'),

    ('Solapur', 'Solapur North', N'सोलापूर उत्तर'),
    ('Solapur', 'Solapur South', N'सोलापूर दक्षिण'),
    ('Solapur', 'Akkalkot', N'अक्कलकोट'),
    ('Solapur', 'Pandharpur', N'पंढरपूर'),
    ('Solapur', 'Mangalvedha', N'मंगळवेढा'),
    ('Solapur', 'Madha', N'माढा'),
    ('Solapur', 'Mohol', N'मोहोळ'),
    ('Solapur', 'Barshi', N'बार्शी'),
    ('Solapur', 'Karmala', N'करमाळा'),
    ('Solapur', 'Sangola', N'सांगोला'),
    ('Solapur', 'Malshiras', N'माळशिरस'),
    ('Solapur', 'Other', N'इतर'),

    ('Aurangabad', 'Aurangabad', N'औरंगाबाद'),
    ('Aurangabad', 'Paithan', N'पैठण'),
    ('Aurangabad', 'Gangapur', N'गंगापूर'),
    ('Aurangabad', 'Vaijapur', N'वैजापूर'),
    ('Aurangabad', 'Sillod', N'सिल्लोड'),
    ('Aurangabad', 'Kannad', N'कन्नड'),
    ('Aurangabad', 'Soegaon', N'सोयगाव'),
    ('Aurangabad', 'Khuldabad', N'खुलताबाद'),
    ('Aurangabad', 'Phulambri', N'फुलंब्री'),
    ('Aurangabad', 'Other', N'इतर'),

    ('Jalna', 'Jalna', N'जालना'),
    ('Jalna', 'Ambad', N'अंबड'),
    ('Jalna', 'Badnapur', N'बदनापूर'),
    ('Jalna', 'Bhokardan', N'भोकरदन'),
    ('Jalna', 'Ghansawangi', N'घनसावंगी'),
    ('Jalna', 'Jafrabad', N'जाफराबाद'),
    ('Jalna', 'Mantha', N'मंठा'),
    ('Jalna', 'Partur', N'परतूर'),
    ('Jalna', 'Other', N'इतर'),

    ('Beed', 'Beed', N'बीड'),
    ('Beed', 'Ambejogai', N'अंबाजोगाई'),
    ('Beed', 'Parli', N'परळी'),
    ('Beed', 'Ashti', N'आष्टी'),
    ('Beed', 'Dharur', N'धारूर'),
    ('Beed', 'Gevrai', N'गेवराई'),
    ('Beed', 'Kaij', N'केज'),
    ('Beed', 'Majalgaon', N'माजलगाव'),
    ('Beed', 'Patoda', N'पाटोदा'),
    ('Beed', 'Shirur Kasar', N'शिरूर कासार'),
    ('Beed', 'Wadwani', N'वडवणी'),
    ('Beed', 'Other', N'इतर'),

    ('Osmanabad', 'Osmanabad', N'उस्मानाबाद'),
    ('Osmanabad', 'Tuljapur', N'तुळजापूर'),
    ('Osmanabad', 'Omerga', N'उमरगा'),
    ('Osmanabad', 'Lohara', N'लोहारा'),
    ('Osmanabad', 'Kalamb', N'कळंब'),
    ('Osmanabad', 'Paranda', N'परंडा'),
    ('Osmanabad', 'Bhum', N'भूम'),
    ('Osmanabad', 'Washi', N'वाशी'),
    ('Osmanabad', 'Other', N'इतर'),

    ('Latur', 'Latur', N'लातूर'),
    ('Latur', 'Ahmedpur', N'अहमदपूर'),
    ('Latur', 'Udgir', N'उदगीर'),
    ('Latur', 'Chakur', N'चाकूर'),
    ('Latur', 'Devni', N'देवणी'),
    ('Latur', 'Ausa', N'औसा'),
    ('Latur', 'Jalkot', N'जळकोट'),
    ('Latur', 'Nilanga', N'निलंगा'),
    ('Latur', 'Renapur', N'रेणापूर'),
    ('Latur', 'Other', N'इतर'),

    ('Nanded', 'Nanded', N'नांदेड'),
    ('Nanded', 'Ardhapur', N'अर्धापूर'),
    ('Nanded', 'Bhokar', N'भोकर'),
    ('Nanded', 'Biloli', N'बिलोली'),
    ('Nanded', 'Deglur', N'देगलूर'),
    ('Nanded', 'Dharmabad', N'धर्माबाद'),
    ('Nanded', 'Hadgaon', N'हदगाव'),
    ('Nanded', 'Himayatnagar', N'हिमायतनगर'),
    ('Nanded', 'Kandhar', N'कंधार'),
    ('Nanded', 'Kinwat', N'किनवट'),
    ('Nanded', 'Loha', N'लोहा'),
    ('Nanded', 'Mahoor', N'माहूर'),
    ('Nanded', 'Mudkhed', N'मुदखेड'),
    ('Nanded', 'Mukhed', N'मुखेड'),
    ('Nanded', 'Naigaon', N'नायगाव'),
    ('Nanded', 'Umri', N'उमरी'),
    ('Nanded', 'Other', N'इतर'),

    ('Hingoli', 'Hingoli', N'हिंगोली'),
    ('Hingoli', 'Aundha', N'औंढा'),
    ('Hingoli', 'Basmath', N'बसमत'),
    ('Hingoli', 'Kalamnuri', N'कळमनुरी'),
    ('Hingoli', 'Sengaon', N'सेनगाव'),
    ('Hingoli', 'Other', N'इतर'),

    ('Parbhani', 'Parbhani', N'परभणी'),
    ('Parbhani', 'Gangakhed', N'गंगाखेड'),
    ('Parbhani', 'Jintur', N'जिंतूर'),
    ('Parbhani', 'Manwath', N'मानवत'),
    ('Parbhani', 'Palam', N'पालम'),
    ('Parbhani', 'Pathri', N'पाथरी'),
    ('Parbhani', 'Purna', N'पूर्णा'),
    ('Parbhani', 'Sailu', N'सैलू'),
    ('Parbhani', 'Selu', N'सेलू'),
    ('Parbhani', 'Sonpeth', N'सोनपेठ'),
    ('Parbhani', 'Other', N'इतर'),

    ('Amravati', 'Amravati', N'अमरावती'),
    ('Amravati', 'Achalpur', N'अचलपूर'),
    ('Amravati', 'Anjangaon', N'अंजनगाव'),
    ('Amravati', 'Bhatkuli', N'भातकुली'),
    ('Amravati', 'Chandur Bazar', N'चांदूर बाजार'),
    ('Amravati', 'Chandur Railway', N'चांदूर रेल्वे'),
    ('Amravati', 'Chikhaldara', N'चिखलदरा'),
    ('Amravati', 'Daryapur', N'दर्यापूर'),
    ('Amravati', 'Dharni', N'धारणी'),
    ('Amravati', 'Morshi', N'मोर्शी'),
    ('Amravati', 'Nandgaon Khandeshwar', N'नांदगाव खंडेश्वर'),
    ('Amravati', 'Teosa', N'तेओसा'),
    ('Amravati', 'Tivsa', N'तिवसा'),
    ('Amravati', 'Warud', N'वरुड'),
    ('Amravati', 'Other', N'इतर'),

    ('Akola', 'Akola', N'अकोला'),
    ('Akola', 'Akot', N'अकोट'),
    ('Akola', 'Balapur', N'बाळापूर'),
    ('Akola', 'Barshitakli', N'बार्शीटाकळी'),
    ('Akola', 'Murtijapur', N'मुर्तीजापूर'),
    ('Akola', 'Patur', N'पातूर'),
    ('Akola', 'Telhara', N'तेल्हारा'),
    ('Akola', 'Other', N'इतर'),

    ('Buldhana', 'Buldhana', N'बुलढाणा'),
    ('Buldhana', 'Chikhli', N'चिखली'),
    ('Buldhana', 'Deulgaon Raja', N'देऊळगाव राजा'),
    ('Buldhana', 'Jalgaon Jamod', N'जळगाव जामोद'),
    ('Buldhana', 'Khamgaon', N'खामगाव'),
    ('Buldhana', 'Lonar', N'लोणार'),
    ('Buldhana', 'Malkapur', N'मलकापूर'),
    ('Buldhana', 'Mehkar', N'मेहकर'),
    ('Buldhana', 'Motala', N'मोताळा'),
    ('Buldhana', 'Nandura', N'नांदुरा'),
    ('Buldhana', 'Sangrampur', N'संग्रामपूर'),
    ('Buldhana', 'Shegaon', N'शेगाव'),
    ('Buldhana', 'Sindkhed Raja', N'सिंदखेड राजा'),
    ('Buldhana', 'Other', N'इतर'),

    ('Washim', 'Washim', N'वाशिम'),
    ('Washim', 'Karanja', N'कारंजा'),
    ('Washim', 'Malegaon', N'मालेगाव'),
    ('Washim', 'Mangrulpir', N'मंगरुळपीर'),
    ('Washim', 'Manora', N'मानोरा'),
    ('Washim', 'Risod', N'रिसोड'),
    ('Washim', 'Other', N'इतर'),

    ('Yavatmal', 'Yavatmal', N'यवतमाळ'),
    ('Yavatmal', 'Arni', N'आर्णी'),
    ('Yavatmal', 'Babulgaon', N'बाभुळगाव'),
    ('Yavatmal', 'Darwha', N'दारव्हा'),
    ('Yavatmal', 'Digras', N'दिग्रस'),
    ('Yavatmal', 'Ghatanji', N'घाटंजी'),
    ('Yavatmal', 'Kalamb', N'कळंब'),
    ('Yavatmal', 'Kelapur', N'केळापूर'),
    ('Yavatmal', 'Mahagaon', N'महागाव'),
    ('Yavatmal', 'Maregaon', N'मारेगाव'),
    ('Yavatmal', 'Ner', N'नेर'),
    ('Yavatmal', 'Pusad', N'पुसद'),
    ('Yavatmal', 'Ralegaon', N'राळेगाव'),
    ('Yavatmal', 'Umarkhed', N'उमरखेड'),
    ('Yavatmal', 'Wani', N'वणी'),
    ('Yavatmal', 'Zari Jamni', N'झरी जामनी'),
    ('Yavatmal', 'Other', N'इतर'),

    ('Nagpur', 'Nagpur City', N'नागपूर शहर'),
    ('Nagpur', 'Nagpur Rural', N'नागपूर ग्रामीण'),
    ('Nagpur', 'Hingna', N'हिंगणा'),
    ('Nagpur', 'Kamptee', N'कामठी'),
    ('Nagpur', 'Katol', N'काटोल'),
    ('Nagpur', 'Kalmeshwar', N'कळमेश्वर'),
    ('Nagpur', 'Mauda', N'मौदा'),
    ('Nagpur', 'Narkhed', N'नरखेड'),
    ('Nagpur', 'Parseoni', N'पारशिवनी'),
    ('Nagpur', 'Ramtek', N'रामटेक'),
    ('Nagpur', 'Savner', N'सावनेर'),
    ('Nagpur', 'Umred', N'उमरेड'),
    ('Nagpur', 'Bhiwapur', N'भिवापूर'),
    ('Nagpur', 'Other', N'इतर'),

    ('Wardha', 'Wardha', N'वर्धा'),
    ('Wardha', 'Arvi', N'आर्वी'),
    ('Wardha', 'Ashti', N'आष्टी'),
    ('Wardha', 'Deoli', N'देवळी'),
    ('Wardha', 'Hinganghat', N'हिंगणघाट'),
    ('Wardha', 'Karanja', N'कारंजा'),
    ('Wardha', 'Samudrapur', N'समुद्रपूर'),
    ('Wardha', 'Seloo', N'सेलू'),
    ('Wardha', 'Other', N'इतर'),

    ('Bhandara', 'Bhandara', N'भंडारा'),
    ('Bhandara', 'Mohadi', N'मोहाडी'),
    ('Bhandara', 'Pauni', N'पवनी'),
    ('Bhandara', 'Sakoli', N'साकोली'),
    ('Bhandara', 'Tumsar', N'तुमसर'),
    ('Bhandara', 'Lakhni', N'लाखनी'),
    ('Bhandara', 'Lakhandur', N'लाखांदूर'),
    ('Bhandara', 'Other', N'इतर'),

    ('Gondia', 'Gondia', N'गोंदिया'),
    ('Gondia', 'Amgaon', N'आमगाव'),
    ('Gondia', 'Arjuni Morgaon', N'अर्जुनी मोरगाव'),
    ('Gondia', 'Deori', N'देवरी'),
    ('Gondia', 'Goregaon', N'गोरेगाव'),
    ('Gondia', 'Sadak Arjuni', N'सडक अर्जुनी'),
    ('Gondia', 'Salekasa', N'सालेकसा'),
    ('Gondia', 'Tirora', N'तिरोडा'),
    ('Gondia', 'Other', N'इतर'),

    ('Chandrapur', 'Chandrapur', N'चंद्रपूर'),
    ('Chandrapur', 'Ballarpur', N'बल्लारपूर'),
    ('Chandrapur', 'Bhadravati', N'भद्रावती'),
    ('Chandrapur', 'Brahmapuri', N'ब्रह्मपुरी'),
    ('Chandrapur', 'Chimur', N'चिमूर'),
    ('Chandrapur', 'Gondpipri', N'गोंडपिंपरी'),
    ('Chandrapur', 'Jiwati', N'जिवती'),
    ('Chandrapur', 'Korpana', N'कोरपना'),
    ('Chandrapur', 'Mul', N'मुल'),
    ('Chandrapur', 'Nagbhid', N'नागभीड'),
    ('Chandrapur', 'Pombhurna', N'पोंभूर्णा'),
    ('Chandrapur', 'Rajura', N'राजुरा'),
    ('Chandrapur', 'Sawali', N'सावली'),
    ('Chandrapur', 'Sindewahi', N'सिंदेवाही'),
    ('Chandrapur', 'Warora', N'वरोरा'),
    ('Chandrapur', 'Other', N'इतर'),

    ('Gadchiroli', 'Gadchiroli', N'गडचिरोली'),
    ('Gadchiroli', 'Aheri', N'अहेरी'),
    ('Gadchiroli', 'Armori', N'आरमोरी'),
    ('Gadchiroli', 'Bhamragad', N'भामरागड'),
    ('Gadchiroli', 'Chamorshi', N'चामोर्शी'),
    ('Gadchiroli', 'Desaiganj', N'देसाईगंज'),
    ('Gadchiroli', 'Dhanora', N'धानोरा'),
    ('Gadchiroli', 'Etapalli', N'एटापल्ली'),
    ('Gadchiroli', 'Kurkheda', N'कुरखेडा'),
    ('Gadchiroli', 'Mulchera', N'मुलचेरा'),
    ('Gadchiroli', 'Sironcha', N'सिरोंचा'),
    ('Gadchiroli', 'Wadsa', N'वडसा'),
    ('Gadchiroli', 'Other', N'इतर'),

    ('Other', 'Other', N'इतर')
  ) AS v(DistrictName, TalukaName, TalukaNameMr)
)
UPDATE t
SET t.NameMr = m.TalukaNameMr
FROM dbo.Talukas t
INNER JOIN dbo.Districts d ON d.DistrictId = t.DistrictId
INNER JOIN TalukaMrAll m
  ON m.DistrictName = d.Name
 AND m.TalukaName = t.Name
WHERE ISNULL(t.NameMr, N'') <> m.TalukaNameMr;
GO

/* ============================================================
   PART 6B: Global fallback repair for empty localized values
   ============================================================ */

UPDATE dbo.Countries
SET NameMr = CASE
  WHEN Name = 'India' THEN N'भारत'
  WHEN Name = 'Other' THEN N'इतर'
  ELSE Name
END
WHERE LTRIM(RTRIM(ISNULL(NameMr, N''))) = N'';
GO

UPDATE dbo.States
SET NameMr = CASE
  WHEN Name = 'Other' THEN N'इतर'
  ELSE Name
END
WHERE LTRIM(RTRIM(ISNULL(NameMr, N''))) = N'';
GO

UPDATE dbo.Districts
SET NameMr = CASE
  WHEN Name = 'Other' THEN N'इतर'
  ELSE Name
END
WHERE LTRIM(RTRIM(ISNULL(NameMr, N''))) = N'';
GO

UPDATE dbo.Talukas
SET NameMr = CASE
  WHEN Name = 'Other' THEN N'इतर'
  ELSE Name
END
WHERE LTRIM(RTRIM(ISNULL(NameMr, N''))) = N'';
GO

/* ============================================================
   PART 7: Seed MasterData (generic lookups: education, occupation, caste, etc.)
   ============================================================ */

-- Helper: insert MasterData + translations together
-- We use a temp procedure pattern for readability

CREATE OR ALTER PROCEDURE dbo.usp_SeedMasterData
  @Category   NVARCHAR(50),
  @ValueCode  NVARCHAR(80),
  @LabelEn    NVARCHAR(200),
  @LabelMr    NVARCHAR(200) = NULL,
  @LabelHi    NVARCHAR(200) = NULL,
  @SortOrder  SMALLINT = 0
AS
BEGIN
  SET NOCOUNT ON;
  DECLARE @Id INT;

  -- Treat blank translations as NULL so empty labels are not inserted.
  SET @LabelMr = NULLIF(LTRIM(RTRIM(@LabelMr)), N'');
  SET @LabelHi = NULLIF(LTRIM(RTRIM(@LabelHi)), N'');

  IF NOT EXISTS (SELECT 1 FROM dbo.MasterData WHERE TenantId = 0 AND Category = @Category AND ValueCode = @ValueCode)
  BEGIN
    INSERT INTO dbo.MasterData (TenantId, Category, ValueCode, SortOrder)
    VALUES (0, @Category, @ValueCode, @SortOrder);
  END

  SELECT @Id = MasterDataId FROM dbo.MasterData WHERE TenantId = 0 AND Category = @Category AND ValueCode = @ValueCode;

  IF NOT EXISTS (SELECT 1 FROM dbo.MasterDataTranslations WHERE MasterDataId = @Id AND LangCode = 'en')
    INSERT INTO dbo.MasterDataTranslations VALUES (@Id, 'en', @LabelEn);
  IF @LabelMr IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.MasterDataTranslations WHERE MasterDataId = @Id AND LangCode = 'mr')
    INSERT INTO dbo.MasterDataTranslations VALUES (@Id, 'mr', @LabelMr);
  IF @LabelHi IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.MasterDataTranslations WHERE MasterDataId = @Id AND LangCode = 'hi')
    INSERT INTO dbo.MasterDataTranslations VALUES (@Id, 'hi', @LabelHi);
END;
GO

-- Education Area
EXEC dbo.usp_SeedMasterData 'education_area', 'ENGINEERING',   'Engineering',        N'',    N'',    10;
EXEC dbo.usp_SeedMasterData 'education_area', 'MEDICAL',       'Medical',            N'',         N'',        20;
EXEC dbo.usp_SeedMasterData 'education_area', 'COMMERCE',      'Commerce',           N'',          N'',         30;
EXEC dbo.usp_SeedMasterData 'education_area', 'ARTS',          'Arts',               N'',              N'',             40;
EXEC dbo.usp_SeedMasterData 'education_area', 'SCIENCE',       'Science',            N'',          N'',         50;
EXEC dbo.usp_SeedMasterData 'education_area', 'MANAGEMENT',    'Management / MBA',   N'',       N'',         60;
EXEC dbo.usp_SeedMasterData 'education_area', 'LAW',           'Law',                N'',            N'',           70;
EXEC dbo.usp_SeedMasterData 'education_area', 'AGRICULTURE',   'Agriculture',        N'',             N'',            80;
EXEC dbo.usp_SeedMasterData 'education_area', 'OTHER',         'Other',              N'',              N'',            90;
GO

-- Occupation Type
EXEC dbo.usp_SeedMasterData 'occupation_type', 'PRIVATE_SERVICE',  'Private Service',    N'',    N'',     10;
EXEC dbo.usp_SeedMasterData 'occupation_type', 'GOVT_SERVICE',     'Government Service', N'',   N'',   20;
EXEC dbo.usp_SeedMasterData 'occupation_type', 'BUSINESS',         'Business',           N'',         N'',         30;
EXEC dbo.usp_SeedMasterData 'occupation_type', 'SELF_EMPLOYED',    'Self Employed',      N'',    N'',     40;
EXEC dbo.usp_SeedMasterData 'occupation_type', 'DOCTOR',           'Doctor',             N'',          N'',          50;
EXEC dbo.usp_SeedMasterData 'occupation_type', 'ENGINEER',         'Engineer',           N'',         N'',        60;
EXEC dbo.usp_SeedMasterData 'occupation_type', 'AGRICULTURE',      'Agriculture / Farming', N'',         N'',            70;
EXEC dbo.usp_SeedMasterData 'occupation_type', 'NOT_WORKING',      'Not Working',        N'',     N'',       80;
GO

-- Religion
EXEC dbo.usp_SeedMasterData 'religion', 'HINDU',    'Hindu',     N'',    N'',  10;
EXEC dbo.usp_SeedMasterData 'religion', 'JAIN',     'Jain',      N'',      N'',     20;
EXEC dbo.usp_SeedMasterData 'religion', 'BUDDHIST', 'Buddhist',  N'',   N'',   30;
EXEC dbo.usp_SeedMasterData 'religion', 'SIKH',     'Sikh',      N'',     N'',     40;
EXEC dbo.usp_SeedMasterData 'religion', 'CHRISTIAN','Christian', N'',N'',    50;
EXEC dbo.usp_SeedMasterData 'religion', 'MUSLIM',   'Muslim',    N'', N'', 60;
GO

-- Caste (Maratha context)
EXEC dbo.usp_SeedMasterData 'caste', 'MARATHA',       'Maratha',         N'',         N'',     10;
EXEC dbo.usp_SeedMasterData 'caste', 'KUNBI',         'Kunbi Maratha',   N'',   N'',     20;
EXEC dbo.usp_SeedMasterData 'caste', 'CKP',           'CKP',             N'',        N'',    30;
EXEC dbo.usp_SeedMasterData 'caste', 'BRAHMIN',       'Brahmin',         N'',      N'', 40;
EXEC dbo.usp_SeedMasterData 'caste', 'DESHASTHA',     'Deshastha',       N'',        N'',    50;
EXEC dbo.usp_SeedMasterData 'caste', 'KOKANASTHA',    'Kokanastha',      N'',       N'',   60;
EXEC dbo.usp_SeedMasterData 'caste', 'KARHADE',       'Karhade',         N'',       N'',   70;
EXEC dbo.usp_SeedMasterData 'caste', 'MALI',          'Mali',            N'',          N'',      80;
EXEC dbo.usp_SeedMasterData 'caste', 'DHANGAR',       'Dhangar',         N'',          N'',      90;
EXEC dbo.usp_SeedMasterData 'caste', 'OTHER',         'Other',           N'',           N'',     100;
GO

-- Sub Caste (Maratha)
EXEC dbo.usp_SeedMasterData 'sub_caste', '96_KULI',     '96 Kuli',         N'',       N'',   10;
EXEC dbo.usp_SeedMasterData 'sub_caste', 'KUNBI_MRT',   'Kunbi Maratha',   N'',   N'',     20;
EXEC dbo.usp_SeedMasterData 'sub_caste', 'DESHMUKH',    'Deshmukh',        N'',        N'',    30;
EXEC dbo.usp_SeedMasterData 'sub_caste', 'PATIL',       'Patil',           N'',         N'',     40;
EXEC dbo.usp_SeedMasterData 'sub_caste', 'JADHAV',      'Jadhav',          N'',          N'',      50;
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

-- Marital Status
EXEC dbo.usp_SeedMasterData 'marital_status', 'UNMARRIED',  'Unmarried',   N'',  N'',  10;
EXEC dbo.usp_SeedMasterData 'marital_status', 'DIVORCED',   'Divorced',    N'', N'',  20;
EXEC dbo.usp_SeedMasterData 'marital_status', 'WIDOWED',    'Widowed',     N'',N'',     30;
GO

-- Diet
EXEC dbo.usp_SeedMasterData 'diet', 'VEG',      'Vegetarian',     N'',    N'',   10;
EXEC dbo.usp_SeedMasterData 'diet', 'NON_VEG',  'Non-Vegetarian', N'',   N'',  20;
EXEC dbo.usp_SeedMasterData 'diet', 'EGGETARIAN','Eggetarian',    N'',   N'',   30;
GO

-- Complexion
EXEC dbo.usp_SeedMasterData 'complexion', 'FAIR',    'Fair',        N'',   N'',   10;
EXEC dbo.usp_SeedMasterData 'complexion', 'WHEATISH','Wheatish',    N'', N'', 20;
EXEC dbo.usp_SeedMasterData 'complexion', 'DARK',    'Dark',        N'',  N'',  30;
GO

-- Rashi
EXEC dbo.usp_SeedMasterData 'rashi', 'MESHA',      'Mesha',      N'',      N'',      10;
EXEC dbo.usp_SeedMasterData 'rashi', 'VRUSHABH',   'Vrushabh',   N'',     N'',     20;
EXEC dbo.usp_SeedMasterData 'rashi', 'MITHUN',     'Mithun',     N'',    N'',    30;
EXEC dbo.usp_SeedMasterData 'rashi', 'KARK',       'Kark',       N'',      N'',      40;
EXEC dbo.usp_SeedMasterData 'rashi', 'SIMHA',      'Simha',      N'',      N'',      50;
EXEC dbo.usp_SeedMasterData 'rashi', 'KANYA',      'Kanya',      N'',     N'',     60;
EXEC dbo.usp_SeedMasterData 'rashi', 'TULA',       'Tula',       N'',       N'',      70;
EXEC dbo.usp_SeedMasterData 'rashi', 'VRISCHIK',   'Vrischik',   N'',   N'',   80;
EXEC dbo.usp_SeedMasterData 'rashi', 'DHANU',      'Dhanu',      N'',      N'',      90;
EXEC dbo.usp_SeedMasterData 'rashi', 'MAKAR',      'Makar',      N'',      N'',     100;
EXEC dbo.usp_SeedMasterData 'rashi', 'KUMBHA',     'Kumbha',     N'',     N'',    110;
EXEC dbo.usp_SeedMasterData 'rashi', 'MEEN',       'Meen',       N'',      N'',     120;
GO

-- Nakshatra
EXEC dbo.usp_SeedMasterData 'nakshatra', 'ASHWINI',       'Ashwini',       N'',       N'',       10;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'BHARANI',       'Bharani',       N'',          N'',          20;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'KRITTIKA',      'Krittika',      N'',      N'',      30;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'ROHINI',        'Rohini',        N'',         N'',         40;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'MRIGASHIRSHA',  'Mrigashirsha',  N'',       N'',        50;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'ARDRA',         'Ardra',         N'',         N'',         60;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'PUNARVASU',     'Punarvasu',     N'',       N'',       70;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'PUSHYA',        'Pushya',        N'',          N'',          80;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'ASHLESHA',      'Ashlesha',      N'',         N'',         90;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'MAGHA',         'Magha',         N'',            N'',           100;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'PURVA_PHALGUNI','Purva Phalguni',N'', N'',110;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'UTTARA_PHALGUNI','Uttara Phalguni',N'',N'',120;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'HASTA',         'Hasta',         N'',            N'',          130;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'CHITRA',        'Chitra',        N'',          N'',        140;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'SWATI',         'Swati',         N'',          N'',        150;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'VISHAKHA',      'Vishakha',      N'',          N'',        160;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'ANURADHA',      'Anuradha',      N'',         N'',       170;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'JYESHTHA',      'Jyeshtha',      N'',         N'',       180;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'MOOLA',         'Moola',         N'',             N'',          190;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'PURVA_ASHADHA', 'Purva Ashadha', N'',       N'',    200;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'UTTARA_ASHADHA','Uttara Ashadha',N'',      N'',   210;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'SHRAVANA',      'Shravana',      N'',           N'',         220;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'DHANISHTA',     'Dhanishta',     N'',         N'',       230;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'SHATABHISHA',   'Shatabhisha',   N'',          N'',        240;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'PURVA_BHADRAPADA','Purva Bhadrapada',N'',N'', 250;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'UTTARA_BHADRAPADA','Uttara Bhadrapada',N'',N'',260;
EXEC dbo.usp_SeedMasterData 'nakshatra', 'REVATI',        'Revati',        N'',           N'',         270;
GO

-- Ensure mr/hi labels are never blank by falling back to English labels.
UPDATE t
SET t.Label = en.Label
FROM dbo.MasterDataTranslations t
INNER JOIN dbo.MasterDataTranslations en
  ON en.MasterDataId = t.MasterDataId
 AND en.LangCode = 'en'
WHERE t.LangCode IN ('mr', 'hi')
  AND LTRIM(RTRIM(ISNULL(t.Label, N''))) = N'';
GO