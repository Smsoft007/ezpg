-- =============================================
-- 데이터베이스 테이블 생성 스크립트
-- =============================================

USE [EZPG]
GO

-- 모든 외래 키 제약 조건을 먼저 찾아서 삭제
DECLARE @sql NVARCHAR(MAX) = N'';

SELECT @sql = @sql + N'
ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys;

EXEC sp_executesql @sql;
GO

-- 기존 테이블이 있다면 삭제 (역순으로 삭제)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PaymentLogs]') AND type in (N'U'))
    DROP TABLE [dbo].[PaymentLogs];
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RefundHistory]') AND type in (N'U'))
    DROP TABLE [dbo].[RefundHistory];
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Transactions]') AND type in (N'U'))
    DROP TABLE [dbo].[Transactions];
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorBankAccounts]') AND type in (N'U'))
    DROP TABLE [dbo].[VendorBankAccounts];
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorApiKeys]') AND type in (N'U'))
    DROP TABLE [dbo].[VendorApiKeys];
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorContacts]') AND type in (N'U'))
    DROP TABLE [dbo].[VendorContacts];
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Vendors]') AND type in (N'U'))
    DROP TABLE [dbo].[Vendors];
GO

-- 가맹점 테이블
CREATE TABLE [dbo].[Vendors] (
    [Id] VARCHAR(36) PRIMARY KEY,
    [Name] NVARCHAR(100) NOT NULL,
    [BusinessNumber] VARCHAR(20) NOT NULL,
    [RepresentativeName] NVARCHAR(50) NOT NULL,
    [Address] NVARCHAR(200),
    [PhoneNumber] VARCHAR(20),
    [Email] VARCHAR(100),
    [Status] VARCHAR(20) NOT NULL DEFAULT 'active',
    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE()
);
    
CREATE UNIQUE INDEX [IX_Vendors_BusinessNumber] ON [dbo].[Vendors]([BusinessNumber]);
GO

-- 가맹점 담당자 테이블
CREATE TABLE [dbo].[VendorContacts] (
    [Id] VARCHAR(36) PRIMARY KEY,
    [VendorId] VARCHAR(36) NOT NULL,
    [Name] NVARCHAR(50) NOT NULL,
    [Position] NVARCHAR(50),
    [Department] NVARCHAR(50),
    [PhoneNumber] VARCHAR(20),
    [Email] VARCHAR(100),
    [IsPrimary] BIT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_VendorContacts_Vendors] FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors] ([Id]) ON DELETE CASCADE
);
    
CREATE INDEX [IX_VendorContacts_VendorId] ON [dbo].[VendorContacts]([VendorId]);
GO

-- 가맹점 API 키 테이블
CREATE TABLE [dbo].[VendorApiKeys] (
    [Id] VARCHAR(36) PRIMARY KEY,
    [VendorId] VARCHAR(36) NOT NULL,
    [ApiKey] VARCHAR(100) NOT NULL,
    [SecretKey] VARCHAR(100) NOT NULL,
    [IsActive] BIT NOT NULL DEFAULT 1,
    [ExpiresAt] DATETIME,
    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_VendorApiKeys_Vendors] FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors] ([Id]) ON DELETE CASCADE
);
    
CREATE UNIQUE INDEX [IX_VendorApiKeys_ApiKey] ON [dbo].[VendorApiKeys]([ApiKey]);
CREATE INDEX [IX_VendorApiKeys_VendorId] ON [dbo].[VendorApiKeys]([VendorId]);
GO

-- 가맹점 계좌 정보 테이블
CREATE TABLE [dbo].[VendorBankAccounts] (
    [Id] VARCHAR(36) PRIMARY KEY,
    [VendorId] VARCHAR(36) NOT NULL,
    [BankCode] VARCHAR(10) NOT NULL,
    [BankName] NVARCHAR(50) NOT NULL,
    [AccountNumber] VARCHAR(50) NOT NULL,
    [AccountHolder] NVARCHAR(50) NOT NULL,
    [IsPrimary] BIT NOT NULL DEFAULT 0,
    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_VendorBankAccounts_Vendors] FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors] ([Id]) ON DELETE CASCADE
);
    
CREATE INDEX [IX_VendorBankAccounts_VendorId] ON [dbo].[VendorBankAccounts]([VendorId]);
GO

-- 거래 테이블
CREATE TABLE [dbo].[Transactions] (
    [Id] VARCHAR(36) PRIMARY KEY,
    [VendorId] VARCHAR(36) NOT NULL,
    [OrderNumber] VARCHAR(100) NOT NULL,
    [Amount] DECIMAL(18, 2) NOT NULL,
    [Fee] DECIMAL(18, 2) NOT NULL DEFAULT 0,
    [Status] VARCHAR(50) NOT NULL,
    [PaymentMethod] VARCHAR(50) NOT NULL,
    [PaymentKey] VARCHAR(100),
    [CustomerName] NVARCHAR(100),
    [CustomerEmail] VARCHAR(255),
    [CustomerPhone] VARCHAR(50),
    [ProductName] NVARCHAR(255),
    [ReturnUrl] VARCHAR(500),
    [NotifyUrl] VARCHAR(500),
    [PaymentUrl] VARCHAR(500),
    [BankCode] VARCHAR(10),
    [BankName] NVARCHAR(50),
    [AccountNumber] VARCHAR(50),
    [AccountHolder] NVARCHAR(50),
    [ExpiresAt] DATETIME,
    [CompletedAt] DATETIME,
    [CanceledAt] DATETIME,
    [RefundedAt] DATETIME,
    [RefundAmount] DECIMAL(18, 2),
    [CancelReason] NVARCHAR(500),
    [Metadata] NVARCHAR(MAX),
    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    [UpdatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_Transactions_Vendors] FOREIGN KEY ([VendorId]) REFERENCES [dbo].[Vendors] ([Id])
);
    
CREATE UNIQUE INDEX [IX_Transactions_VendorId_OrderNumber] ON [dbo].[Transactions]([VendorId], [OrderNumber]);
CREATE INDEX [IX_Transactions_Status] ON [dbo].[Transactions]([Status]);
CREATE INDEX [IX_Transactions_PaymentMethod] ON [dbo].[Transactions]([PaymentMethod]);
CREATE INDEX [IX_Transactions_CreatedAt] ON [dbo].[Transactions]([CreatedAt]);
GO

-- 환불 내역 테이블
CREATE TABLE [dbo].[RefundHistory] (
    [Id] VARCHAR(36) PRIMARY KEY,
    [TransactionId] VARCHAR(36) NOT NULL,
    [Amount] DECIMAL(18, 2) NOT NULL,
    [Reason] NVARCHAR(500),
    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_RefundHistory_Transactions] FOREIGN KEY ([TransactionId]) REFERENCES [dbo].[Transactions] ([Id])
);
    
CREATE INDEX [IX_RefundHistory_TransactionId] ON [dbo].[RefundHistory]([TransactionId]);
GO

-- 결제 로그 테이블
CREATE TABLE [dbo].[PaymentLogs] (
    [Id] VARCHAR(36) PRIMARY KEY,
    [TransactionId] VARCHAR(36) NOT NULL,
    [LogType] VARCHAR(50) NOT NULL,
    [Message] NVARCHAR(MAX),
    [Data] NVARCHAR(MAX),
    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_PaymentLogs_Transactions] FOREIGN KEY ([TransactionId]) REFERENCES [dbo].[Transactions] ([Id])
);
    
CREATE INDEX [IX_PaymentLogs_TransactionId] ON [dbo].[PaymentLogs]([TransactionId]);
CREATE INDEX [IX_PaymentLogs_LogType] ON [dbo].[PaymentLogs]([LogType]);
GO
