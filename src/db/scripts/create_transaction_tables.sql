-- =============================================
-- 거래 관리를 위한 테이블 생성 스크립트
-- =============================================

USE [EzPayDB]
GO

-- 거래 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Transactions]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[Transactions](
    [Id] [varchar](36) NOT NULL,
    [VendorId] [varchar](36) NOT NULL,
    [Amount] [decimal](18, 2) NOT NULL,
    [Fee] [decimal](18, 2) NOT NULL,
    [NetAmount] [decimal](18, 2) NOT NULL,
    [Currency] [varchar](10) NOT NULL DEFAULT ('KRW'),
    [PaymentMethod] [varchar](50) NOT NULL,
    [TransactionType] [varchar](20) NOT NULL,  -- 'deposit', 'withdrawal', 'refund', etc.
    [Status] [varchar](20) NOT NULL,           -- 'pending', 'completed', 'failed', 'canceled'
    [OrderId] [varchar](100) NULL,
    [CustomerName] [nvarchar](100) NULL,
    [CustomerEmail] [varchar](100) NULL,
    [CustomerPhone] [varchar](20) NULL,
    [Description] [nvarchar](500) NULL,
    [Metadata] [nvarchar](MAX) NULL,
    [ErrorCode] [varchar](50) NULL,
    [ErrorMessage] [nvarchar](500) NULL,
    [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    [UpdatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    [CompletedAt] [datetime] NULL,
    [FailedAt] [datetime] NULL,
    [CanceledAt] [datetime] NULL,
    PRIMARY KEY CLUSTERED ([Id] ASC)
)
END
GO

-- 거래 로그 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TransactionLogs]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[TransactionLogs](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [TransactionId] [varchar](36) NOT NULL,
    [Status] [varchar](20) NOT NULL,
    [Message] [nvarchar](500) NULL,
    [Metadata] [nvarchar](MAX) NULL,
    [CreatedBy] [varchar](100) NULL,
    [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    PRIMARY KEY CLUSTERED ([Id] ASC),
    FOREIGN KEY ([TransactionId]) REFERENCES [dbo].[Transactions]([Id])
)
END
GO

-- 결제 수단 정보 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PaymentMethodDetails]') AND type in (N'U'))
BEGIN
CREATE TABLE [dbo].[PaymentMethodDetails](
    [Id] [int] IDENTITY(1,1) NOT NULL,
    [TransactionId] [varchar](36) NOT NULL,
    [Type] [varchar](50) NOT NULL,     -- 'card', 'bank_transfer', 'virtual_account', etc.
    [CardNumber] [varchar](30) NULL,
    [CardBrand] [varchar](50) NULL,
    [CardIssuer] [varchar](100) NULL,
    [CardOwnerName] [nvarchar](100) NULL,
    [BankCode] [varchar](20) NULL,
    [BankName] [nvarchar](100) NULL,
    [AccountNumber] [varchar](50) NULL,
    [AccountHolderName] [nvarchar](100) NULL,
    [ExpiryDate] [datetime] NULL,      -- 가상계좌 만료일
    [ApprovalNumber] [varchar](50) NULL,
    [Metadata] [nvarchar](MAX) NULL,
    [CreatedAt] [datetime] NOT NULL DEFAULT (GETDATE()),
    PRIMARY KEY CLUSTERED ([Id] ASC),
    FOREIGN KEY ([TransactionId]) REFERENCES [dbo].[Transactions]([Id])
)
END
GO

-- 인덱스 생성
-- 거래 조회를 위한 인덱스
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Transactions_VendorId' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
BEGIN
    CREATE INDEX IX_Transactions_VendorId ON [dbo].[Transactions] ([VendorId]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Transactions_Status' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
BEGIN
    CREATE INDEX IX_Transactions_Status ON [dbo].[Transactions] ([Status]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Transactions_TransactionType' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
BEGIN
    CREATE INDEX IX_Transactions_TransactionType ON [dbo].[Transactions] ([TransactionType]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Transactions_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
BEGIN
    CREATE INDEX IX_Transactions_CreatedAt ON [dbo].[Transactions] ([CreatedAt]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Transactions_PaymentMethod' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
BEGIN
    CREATE INDEX IX_Transactions_PaymentMethod ON [dbo].[Transactions] ([PaymentMethod]);
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_TransactionLogs_TransactionId' AND object_id = OBJECT_ID(N'[dbo].[TransactionLogs]'))
BEGIN
    CREATE INDEX IX_TransactionLogs_TransactionId ON [dbo].[TransactionLogs] ([TransactionId]);
END
GO

-- 복합 인덱스 (여러 조건으로 조회할 경우 성능 향상)
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='IX_Transactions_VendorId_Status_CreatedAt' AND object_id = OBJECT_ID(N'[dbo].[Transactions]'))
BEGIN
    CREATE INDEX IX_Transactions_VendorId_Status_CreatedAt ON [dbo].[Transactions] ([VendorId], [Status], [CreatedAt]);
END
GO

PRINT '거래 관리 테이블이 성공적으로 생성되었습니다.'
GO
