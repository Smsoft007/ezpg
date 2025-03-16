-- =============================================
-- 가맹점 관리를 위한 테이블 생성 스크립트
-- =============================================

USE [EzPayDB]
GO

-- 가맹점 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Vendors]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Vendors](
    [Id] [varchar](36) NOT NULL,
    [VendorName] [nvarchar](100) NOT NULL,
    [BusinessNumber] [varchar](20) NOT NULL,
    [RepresentativeName] [nvarchar](50) NOT NULL,
    [PhoneNumber] [varchar](20) NOT NULL,
    [Email] [varchar](100) NOT NULL,
    [Address] [nvarchar](200) NULL,
    [DetailAddress] [nvarchar](100) NULL,
    [ZipCode] [varchar](10) NULL,
    [BusinessType] [nvarchar](50) NULL,
    [BusinessCategory] [nvarchar](50) NULL,
    [BankCode] [varchar](10) NULL,
    [BankName] [nvarchar](50) NULL,
    [AccountNumber] [varchar](30) NULL,
    [AccountHolder] [nvarchar](50) NULL,
    [TaxType] [varchar](20) NULL,
    [Status] [varchar](20) NOT NULL DEFAULT ('pending'), -- 'pending', 'active', 'suspended', 'terminated'
    [ContractStartDate] [date] NULL,
    [ContractEndDate] [date] NULL,
    [FeeRate] [decimal](5, 2) NULL DEFAULT (0.00),
    [SettlementCycle] [varchar](20) NULL DEFAULT ('T+2'), -- 'daily', 'T+1', 'T+2', 'weekly', 'monthly'
    [LogoUrl] [varchar](255) NULL,
    [WebsiteUrl] [varchar](255) NULL,
    [Description] [nvarchar](500) NULL,
    [Memo] [nvarchar](1000) NULL,
    [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    [UpdatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    [LastSettlementDate] [datetime] NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
)
END
GO

-- 가맹점 담당자 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorContacts]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[VendorContacts](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [VendorId] [varchar](36) NOT NULL,
    [Name] [nvarchar](50) NOT NULL,
    [Position] [nvarchar](50) NULL,
    [Department] [nvarchar](50) NULL,
    [PhoneNumber] [varchar](20) NOT NULL,
    [Email] [varchar](100) NOT NULL,
    [IsPrimary] [bit] NOT NULL DEFAULT (0),
    [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    [UpdatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    PRIMARY KEY CLUSTERED ([Id] ASC),
    FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors]([Id]) ON DELETE CASCADE
)
END
GO

-- 가맹점 API 키 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorApiKeys]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[VendorApiKeys](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [VendorId] [varchar](36) NOT NULL,
    [ApiKey] [varchar](64) NOT NULL,
    [SecretKey] [varchar](64) NOT NULL,
    [Name] [nvarchar](100) NULL,
    [Environment] [varchar](20) NOT NULL DEFAULT ('test'), -- 'test', 'live'
    [Status] [varchar](20) NOT NULL DEFAULT ('active'), -- 'active', 'inactive', 'revoked'
    [ExpiryDate] [datetime] NULL,
    [AllowedIps] [varchar](255) NULL,
    [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    [UpdatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    [LastUsedAt] [datetime] NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors]([Id]) ON DELETE CASCADE
)
END
GO

-- 가맹점 결제 설정 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorPaymentSettings]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[VendorPaymentSettings](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [VendorId] [varchar](36) NOT NULL,
    [PaymentMethod] [varchar](50) NOT NULL, -- 'card', 'bank_transfer', 'virtual_account', etc.
    [IsEnabled] [bit] NOT NULL DEFAULT (1),
    [FeeRate] [decimal](5, 2) NOT NULL DEFAULT (0.00),
    [FixedFee] [decimal](10, 2) NOT NULL DEFAULT (0.00),
    [MinFee] [decimal](10, 2) NULL,
    [MaxFee] [decimal](10, 2) NULL,
    [SettlementCycle] [varchar](20) NULL,
    [Settings] [nvarchar](MAX) NULL, -- JSON 형태의 추가 설정
    [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    [UpdatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    PRIMARY KEY CLUSTERED ([Id] ASC),
    FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors]([Id]) ON DELETE CASCADE,
    CONSTRAINT [UQ_VendorPaymentSettings] UNIQUE ([VendorId], [PaymentMethod])
)
END
GO

-- 가맹점 이력 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorHistories]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[VendorHistories](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [VendorId] [varchar](36) NOT NULL,
    [ChangeType] [varchar](20) NOT NULL, -- 'create', 'update', 'status_change', 'fee_change', etc.
    [PreviousValue] [nvarchar](500) NULL,
    [NewValue] [nvarchar](500) NULL,
    [ChangeReason] [nvarchar](500) NULL,
    [ChangedBy] [varchar](100) NOT NULL,
    [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    PRIMARY KEY CLUSTERED ([Id] ASC),
    FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors]([Id]) ON DELETE CASCADE
)
END
GO

-- 가맹점 정산 내역 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorSettlements]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[VendorSettlements](
    [Id] [varchar](36) NOT NULL,
    [VendorId] [varchar](36) NOT NULL,
    [SettlementDate] [date] NOT NULL,
    [StartDate] [date] NOT NULL,
    [EndDate] [date] NOT NULL,
    [TotalAmount] [decimal](18, 2) NOT NULL,
    [TotalFee] [decimal](18, 2) NOT NULL,
    [NetAmount] [decimal](18, 2) NOT NULL,
    [TransactionCount] [int] NOT NULL,
    [Status] [varchar](20) NOT NULL DEFAULT ('pending'), -- 'pending', 'processing', 'completed', 'failed'
    [BankCode] [varchar](10) NULL,
    [BankName] [nvarchar](50) NULL,
    [AccountNumber] [varchar](30) NULL,
    [AccountHolder] [nvarchar](50) NULL,
    [TransferDate] [datetime] NULL,
    [TransferReference] [varchar](100) NULL,
    [Memo] [nvarchar](500) NULL,
    [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    [UpdatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    [CompletedAt] [datetime] NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC),
    FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors]([Id])
)
END
GO

-- 가맹점 정산 상세 내역 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorSettlementDetails]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[VendorSettlementDetails](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [SettlementId] [varchar](36) NOT NULL,
    [TransactionId] [varchar](36) NOT NULL,
    [TransactionDate] [datetime] NOT NULL,
    [OrderId] [varchar](100) NULL,
    [PaymentMethod] [varchar](50) NOT NULL,
    [Amount] [decimal](18, 2) NOT NULL,
    [Fee] [decimal](18, 2) NOT NULL,
    [NetAmount] [decimal](18, 2) NOT NULL,
    [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    PRIMARY KEY CLUSTERED ([Id] ASC),
    FOREIGN KEY ([SettlementId]) REFERENCES [dbo].[VendorSettlements]([Id]) ON DELETE CASCADE
)
END
GO

-- 인덱스 생성
-- 가맹점 조회용 인덱스
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Vendors_Status' AND object_id = OBJECT_ID(N'[dbo].[Vendors]'))
BEGIN
    CREATE INDEX IX_Vendors_Status ON [dbo].[Vendors] ([Status]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Vendors_BusinessNumber' AND object_id = OBJECT_ID(N'[dbo].[Vendors]'))
BEGIN
    CREATE INDEX IX_Vendors_BusinessNumber ON [dbo].[Vendors] ([BusinessNumber]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_VendorApiKeys_ApiKey' AND object_id = OBJECT_ID(N'[dbo].[VendorApiKeys]'))
BEGIN
    CREATE INDEX IX_VendorApiKeys_ApiKey ON [dbo].[VendorApiKeys] ([ApiKey]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_VendorSettlements_SettlementDate' AND object_id = OBJECT_ID(N'[dbo].[VendorSettlements]'))
BEGIN
    CREATE INDEX IX_VendorSettlements_SettlementDate ON [dbo].[VendorSettlements] ([SettlementDate]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_VendorSettlements_Status' AND object_id = OBJECT_ID(N'[dbo].[VendorSettlements]'))
BEGIN
    CREATE INDEX IX_VendorSettlements_Status ON [dbo].[VendorSettlements] ([Status]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_VendorSettlementDetails_TransactionId' AND object_id = OBJECT_ID(N'[dbo].[VendorSettlementDetails]'))
BEGIN
    CREATE INDEX IX_VendorSettlementDetails_TransactionId ON [dbo].[VendorSettlementDetails] ([TransactionId]);
END
GO

PRINT '가맹점 관리 테이블이 성공적으로 생성되었습니다.'
GO
