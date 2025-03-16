-- =============================================
-- 가맹점 관련 테이블 생성 스크립트
-- =============================================

USE [EzPayDB]
GO

-- 가맹점 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Vendors]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Vendors](
        [Id] VARCHAR(36) PRIMARY KEY NOT NULL,
        [VendorCode] VARCHAR(20) UNIQUE NOT NULL,
        [VendorName] NVARCHAR(100) NOT NULL,
        [BusinessNumber] VARCHAR(20) NOT NULL,
        [RepresentativeName] NVARCHAR(50) NOT NULL,
        [PhoneNumber] VARCHAR(20) NOT NULL,
        [Email] VARCHAR(100) NOT NULL,
        [Address] NVARCHAR(200) NULL,
        [BusinessType] NVARCHAR(50) NULL,
        [BankCode] VARCHAR(10) NULL,
        [BankName] NVARCHAR(50) NULL,
        [AccountNumber] VARCHAR(30) NULL,
        [AccountHolder] NVARCHAR(50) NULL,
        [Status] VARCHAR(20) NOT NULL DEFAULT ('active'), -- active, inactive, suspended
        [ContractStartDate] DATE NULL,
        [ContractEndDate] DATE NULL,
        [LastSettlementDate] DATETIME NULL,
        [MemoInternal] NVARCHAR(1000) NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [CK_Vendors_Status] CHECK ([Status] IN ('active', 'inactive', 'suspended'))
    )
END
GO

-- 가맹점 담당자 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorContacts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[VendorContacts](
        [Id] INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
        [VendorId] VARCHAR(36) NOT NULL,
        [Name] NVARCHAR(50) NOT NULL,
        [Position] NVARCHAR(50) NULL,
        [Department] NVARCHAR(50) NULL,
        [PhoneNumber] VARCHAR(20) NOT NULL,
        [Email] VARCHAR(100) NOT NULL,
        [IsPrimary] BIT NOT NULL DEFAULT ((0)),
        [CreatedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [FK_VendorContacts_Vendors] FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors] ([Id]) ON DELETE CASCADE
    )
END
GO

-- 가맹점 API 키 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorApiKeys]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[VendorApiKeys](
        [Id] INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
        [VendorId] VARCHAR(36) NOT NULL,
        [ApiKey] VARCHAR(64) NOT NULL,
        [SecretKey] VARCHAR(64) NOT NULL,
        [ExpiryDate] DATETIME NULL,
        [Status] VARCHAR(20) NOT NULL DEFAULT ('active'), -- active, inactive, expired
        [CreatedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        [DeactivatedAt] DATETIME NULL,
        CONSTRAINT [FK_VendorApiKeys_Vendors] FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [CK_VendorApiKeys_Status] CHECK ([Status] IN ('active', 'inactive', 'expired')),
        CONSTRAINT [UQ_VendorApiKeys_ApiKey] UNIQUE ([ApiKey])
    )
END
GO

-- 가맹점 결제 설정 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorPaymentSettings]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[VendorPaymentSettings](
        [Id] INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
        [VendorId] VARCHAR(36) NOT NULL,
        [PaymentMethod] VARCHAR(50) NOT NULL, -- credit_card, bank_transfer, virtual_account, etc.
        [IsEnabled] BIT NOT NULL DEFAULT ((1)),
        [FeeRate] DECIMAL(5, 2) NOT NULL DEFAULT ((0.00)), -- percentage
        [FixedFee] DECIMAL(10, 2) NOT NULL DEFAULT ((0.00)), -- fixed amount per transaction
        [MinFee] DECIMAL(10, 2) NULL, -- minimum fee
        [MaxFee] DECIMAL(10, 2) NULL, -- maximum fee
        [SettlementCycle] VARCHAR(20) NULL, -- daily, weekly, monthly
        [Settings] NVARCHAR(MAX) NULL, -- JSON format for additional settings
        [CreatedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [FK_VendorPaymentSettings_Vendors] FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [UQ_VendorPaymentSettings_VendorId_Method] UNIQUE ([VendorId], [PaymentMethod])
    )
END
GO

-- 가맹점 정산 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorSettlements]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[VendorSettlements](
        [Id] VARCHAR(36) PRIMARY KEY NOT NULL,
        [VendorId] VARCHAR(36) NOT NULL,
        [SettlementDate] DATE NOT NULL,
        [StartDate] DATE NOT NULL,
        [EndDate] DATE NOT NULL,
        [TotalAmount] DECIMAL(18, 2) NOT NULL,
        [TotalFee] DECIMAL(18, 2) NOT NULL,
        [NetAmount] DECIMAL(18, 2) NOT NULL,
        [TransactionCount] INT NOT NULL,
        [Status] VARCHAR(20) NOT NULL DEFAULT ('pending'), -- pending, processing, completed, failed, canceled
        [BankCode] VARCHAR(10) NOT NULL,
        [BankName] NVARCHAR(50) NOT NULL,
        [AccountNumber] VARCHAR(30) NOT NULL,
        [AccountHolder] NVARCHAR(50) NOT NULL,
        [TransferDate] DATETIME NULL,
        [TransferReference] VARCHAR(100) NULL,
        [Memo] NVARCHAR(500) NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        [UpdatedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        [CompletedAt] DATETIME NULL,
        CONSTRAINT [FK_VendorSettlements_Vendors] FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors] ([Id]) ON DELETE CASCADE,
        CONSTRAINT [CK_VendorSettlements_Status] CHECK ([Status] IN ('pending', 'processing', 'completed', 'failed', 'canceled'))
    )
END
GO

-- 정산 상세 내역 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorSettlementDetails]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[VendorSettlementDetails](
        [Id] INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
        [SettlementId] VARCHAR(36) NOT NULL,
        [TransactionId] VARCHAR(36) NOT NULL,
        [TransactionDate] DATETIME NOT NULL,
        [OrderId] VARCHAR(100) NULL,
        [PaymentMethod] VARCHAR(50) NOT NULL,
        [Amount] DECIMAL(18, 2) NOT NULL,
        [Fee] DECIMAL(18, 2) NOT NULL,
        [NetAmount] DECIMAL(18, 2) NOT NULL,
        [CreatedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [FK_VendorSettlementDetails_Settlements] FOREIGN KEY ([SettlementId]) REFERENCES [dbo].[VendorSettlements] ([Id]) ON DELETE CASCADE
    )
END
GO

-- 가맹점 변경 이력 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorHistories]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[VendorHistories](
        [Id] INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
        [VendorId] VARCHAR(36) NOT NULL,
        [ChangeType] VARCHAR(50) NOT NULL, -- info_update, status_change, apikey_create, payment_setting_change, etc.
        [PreviousValue] NVARCHAR(MAX) NULL,
        [NewValue] NVARCHAR(MAX) NULL,
        [ChangeReason] NVARCHAR(500) NULL,
        [ChangedBy] VARCHAR(100) NOT NULL,
        [ChangedAt] DATETIME NOT NULL DEFAULT (GETDATE()),
        CONSTRAINT [FK_VendorHistories_Vendors] FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors] ([Id]) ON DELETE CASCADE
    )
END
GO

-- 인덱스 생성
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Vendors]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Vendors_Status' AND object_id = OBJECT_ID(N'[dbo].[Vendors]'))
        CREATE INDEX [IX_Vendors_Status] ON [dbo].[Vendors]([Status]);
        
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_Vendors_BusinessNumber' AND object_id = OBJECT_ID(N'[dbo].[Vendors]'))
        CREATE INDEX [IX_Vendors_BusinessNumber] ON [dbo].[Vendors]([BusinessNumber]);
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorContacts]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorContacts_VendorId' AND object_id = OBJECT_ID(N'[dbo].[VendorContacts]'))
        CREATE INDEX [IX_VendorContacts_VendorId] ON [dbo].[VendorContacts]([VendorId]);
        
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorContacts_IsPrimary' AND object_id = OBJECT_ID(N'[dbo].[VendorContacts]'))
        CREATE INDEX [IX_VendorContacts_IsPrimary] ON [dbo].[VendorContacts]([IsPrimary]);
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorApiKeys]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorApiKeys_VendorId' AND object_id = OBJECT_ID(N'[dbo].[VendorApiKeys]'))
        CREATE INDEX [IX_VendorApiKeys_VendorId] ON [dbo].[VendorApiKeys]([VendorId]);
        
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorApiKeys_Status' AND object_id = OBJECT_ID(N'[dbo].[VendorApiKeys]'))
        CREATE INDEX [IX_VendorApiKeys_Status] ON [dbo].[VendorApiKeys]([Status]);
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorPaymentSettings]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorPaymentSettings_VendorId' AND object_id = OBJECT_ID(N'[dbo].[VendorPaymentSettings]'))
        CREATE INDEX [IX_VendorPaymentSettings_VendorId] ON [dbo].[VendorPaymentSettings]([VendorId]);
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorSettlements]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorSettlements_VendorId' AND object_id = OBJECT_ID(N'[dbo].[VendorSettlements]'))
        CREATE INDEX [IX_VendorSettlements_VendorId] ON [dbo].[VendorSettlements]([VendorId]);
        
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorSettlements_Status' AND object_id = OBJECT_ID(N'[dbo].[VendorSettlements]'))
        CREATE INDEX [IX_VendorSettlements_Status] ON [dbo].[VendorSettlements]([Status]);
        
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorSettlements_SettlementDate' AND object_id = OBJECT_ID(N'[dbo].[VendorSettlements]'))
        CREATE INDEX [IX_VendorSettlements_SettlementDate] ON [dbo].[VendorSettlements]([SettlementDate]);
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorSettlementDetails]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorSettlementDetails_SettlementId' AND object_id = OBJECT_ID(N'[dbo].[VendorSettlementDetails]'))
        CREATE INDEX [IX_VendorSettlementDetails_SettlementId] ON [dbo].[VendorSettlementDetails]([SettlementId]);
        
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorSettlementDetails_TransactionId' AND object_id = OBJECT_ID(N'[dbo].[VendorSettlementDetails]'))
        CREATE INDEX [IX_VendorSettlementDetails_TransactionId] ON [dbo].[VendorSettlementDetails]([TransactionId]);
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorHistories]') AND type in (N'U'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorHistories_VendorId' AND object_id = OBJECT_ID(N'[dbo].[VendorHistories]'))
        CREATE INDEX [IX_VendorHistories_VendorId] ON [dbo].[VendorHistories]([VendorId]);
        
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_VendorHistories_ChangeType' AND object_id = OBJECT_ID(N'[dbo].[VendorHistories]'))
        CREATE INDEX [IX_VendorHistories_ChangeType] ON [dbo].[VendorHistories]([ChangeType]);
END
GO

PRINT '가맹점 관련 테이블 생성 완료'
GO
