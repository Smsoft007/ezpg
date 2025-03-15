-- 거래 관련 테이블 생성 스크립트

-- 거래 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Transactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[Transactions](
        [TransactionId] [nvarchar](50) NOT NULL,
        [MerchantId] [nvarchar](50) NOT NULL,
        [Amount] [decimal](18, 2) NOT NULL,
        [Status] [nvarchar](20) NOT NULL,
        [PaymentMethod] [nvarchar](20) NOT NULL,
        [Type] [nvarchar](20) NOT NULL,
        [Currency] [nvarchar](3) NOT NULL,
        [CreatedAt] [datetime] NOT NULL,
        [UpdatedAt] [datetime] NOT NULL,
        [CustomerName] [nvarchar](100) NULL,
        [CustomerEmail] [nvarchar](100) NULL,
        [CustomerPhone] [nvarchar](20) NULL,
        [Description] [nvarchar](500) NULL,
        [ExternalId] [nvarchar](50) NULL,
        [FailureReason] [nvarchar](500) NULL,
        [FailureCode] [nvarchar](50) NULL,
        CONSTRAINT [PK_Transactions] PRIMARY KEY CLUSTERED 
        (
            [TransactionId] ASC
        )
    )
END
GO

-- 입금 거래 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[DepositTransactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[DepositTransactions](
        [TransactionId] [nvarchar](50) NOT NULL,
        [AccountNumber] [nvarchar](50) NULL,
        [Depositor] [nvarchar](100) NULL,
        [VirtualAccountId] [nvarchar](50) NULL,
        [DepositedAt] [datetime] NULL,
        [DepositMethod] [nvarchar](50) NULL,
        [ReceiptUrl] [nvarchar](500) NULL,
        CONSTRAINT [PK_DepositTransactions] PRIMARY KEY CLUSTERED 
        (
            [TransactionId] ASC
        ),
        CONSTRAINT [FK_DepositTransactions_Transactions] FOREIGN KEY([TransactionId])
        REFERENCES [dbo].[Transactions] ([TransactionId])
        ON DELETE CASCADE
    )
END
GO

-- 출금 거래 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[WithdrawalTransactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[WithdrawalTransactions](
        [TransactionId] [nvarchar](50) NOT NULL,
        [BankCode] [nvarchar](10) NULL,
        [AccountNumber] [nvarchar](50) NULL,
        [AccountHolder] [nvarchar](100) NULL,
        [WithdrawalFee] [decimal](18, 2) NULL,
        [ApprovalStatus] [nvarchar](20) NULL,
        [ApprovedBy] [nvarchar](50) NULL,
        [ApprovedAt] [datetime] NULL,
        [WithdrawalMethod] [nvarchar](50) NULL,
        [WithdrawalReference] [nvarchar](100) NULL,
        CONSTRAINT [PK_WithdrawalTransactions] PRIMARY KEY CLUSTERED 
        (
            [TransactionId] ASC
        ),
        CONSTRAINT [FK_WithdrawalTransactions_Transactions] FOREIGN KEY([TransactionId])
        REFERENCES [dbo].[Transactions] ([TransactionId])
        ON DELETE CASCADE
    )
END
GO

-- 거래 로그 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TransactionLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TransactionLogs](
        [LogId] [nvarchar](50) NOT NULL,
        [TransactionId] [nvarchar](50) NOT NULL,
        [Action] [nvarchar](50) NOT NULL,
        [Status] [nvarchar](20) NOT NULL,
        [Message] [nvarchar](500) NOT NULL,
        [Timestamp] [datetime] NOT NULL,
        [PerformedBy] [nvarchar](50) NULL,
        [Details] [nvarchar](max) NULL,
        [IpAddress] [nvarchar](50) NULL,
        [UserAgent] [nvarchar](500) NULL,
        CONSTRAINT [PK_TransactionLogs] PRIMARY KEY CLUSTERED 
        (
            [LogId] ASC
        ),
        CONSTRAINT [FK_TransactionLogs_Transactions] FOREIGN KEY([TransactionId])
        REFERENCES [dbo].[Transactions] ([TransactionId])
        ON DELETE CASCADE
    )
END
GO

-- 일괄 작업 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BatchOperations]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[BatchOperations](
        [BatchId] [nvarchar](50) NOT NULL,
        [Type] [nvarchar](20) NOT NULL,
        [Status] [nvarchar](20) NOT NULL,
        [TotalItems] [int] NOT NULL,
        [ProcessedItems] [int] NOT NULL,
        [SuccessItems] [int] NOT NULL,
        [FailedItems] [int] NOT NULL,
        [CreatedAt] [datetime] NOT NULL,
        [StartedAt] [datetime] NULL,
        [CompletedAt] [datetime] NULL,
        [CreatedBy] [nvarchar](50) NOT NULL,
        [FileName] [nvarchar](200) NULL,
        [ErrorDetails] [nvarchar](max) NULL,
        CONSTRAINT [PK_BatchOperations] PRIMARY KEY CLUSTERED 
        (
            [BatchId] ASC
        )
    )
END
GO

-- 일괄 작업 항목 테이블
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BatchOperationItems]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[BatchOperationItems](
        [ItemId] [nvarchar](50) NOT NULL,
        [BatchId] [nvarchar](50) NOT NULL,
        [TransactionId] [nvarchar](50) NULL,
        [Status] [nvarchar](20) NOT NULL,
        [Data] [nvarchar](max) NOT NULL,
        [ErrorMessage] [nvarchar](500) NULL,
        [ProcessedAt] [datetime] NULL,
        CONSTRAINT [PK_BatchOperationItems] PRIMARY KEY CLUSTERED 
        (
            [ItemId] ASC
        ),
        CONSTRAINT [FK_BatchOperationItems_BatchOperations] FOREIGN KEY([BatchId])
        REFERENCES [dbo].[BatchOperations] ([BatchId])
        ON DELETE CASCADE
    )
END
GO
