-- 거래 로그 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[TransactionLogs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[TransactionLogs] (
        [LogId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [TransactionId] NVARCHAR(50) NOT NULL,
        [Action] NVARCHAR(50) NOT NULL,
        [Status] NVARCHAR(20) NOT NULL,
        [Message] NVARCHAR(500) NOT NULL,
        [Timestamp] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [PerformedBy] NVARCHAR(100),
        [Details] NVARCHAR(MAX),
        [IpAddress] NVARCHAR(50),
        [UserAgent] NVARCHAR(255)
    );

    CREATE INDEX [IX_TransactionLogs_TransactionId] ON [dbo].[TransactionLogs] ([TransactionId]);
    CREATE INDEX [IX_TransactionLogs_Timestamp] ON [dbo].[TransactionLogs] ([Timestamp]);
END
GO

-- 거래 로그 추가 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_AddTransactionLog]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[usp_AddTransactionLog]
GO

CREATE PROCEDURE [dbo].[usp_AddTransactionLog]
    @TransactionId NVARCHAR(50),
    @Action NVARCHAR(50),
    @Status NVARCHAR(20),
    @Message NVARCHAR(500),
    @PerformedBy NVARCHAR(100) = NULL,
    @Details NVARCHAR(MAX) = NULL,
    @IpAddress NVARCHAR(50) = NULL,
    @UserAgent NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO [dbo].[TransactionLogs]
        ([TransactionId], [Action], [Status], [Message], [PerformedBy], [Details], [IpAddress], [UserAgent])
    VALUES
        (@TransactionId, @Action, @Status, @Message, @PerformedBy, @Details, @IpAddress, @UserAgent);
    
    SELECT CAST(SCOPE_IDENTITY() AS INT) AS LogId;
END
GO

-- 거래 로그 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_GetTransactionLogs]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[usp_GetTransactionLogs]
GO

CREATE PROCEDURE [dbo].[usp_GetTransactionLogs]
    @TransactionId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        [LogId] AS id,
        [TransactionId] AS transactionId,
        [Action] AS action,
        [Status] AS status,
        [Message] AS message,
        [Timestamp] AS timestamp,
        [PerformedBy] AS performedBy,
        [Details] AS details,
        [IpAddress] AS ipAddress,
        [UserAgent] AS userAgent
    FROM 
        [dbo].[TransactionLogs]
    WHERE 
        [TransactionId] = @TransactionId
    ORDER BY 
        [Timestamp] DESC;
END
GO

-- 최근 거래 로그 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_GetRecentTransactionLogs]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[usp_GetRecentTransactionLogs]
GO

CREATE PROCEDURE [dbo].[usp_GetRecentTransactionLogs]
    @Count INT = 100
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Count)
        [LogId] AS id,
        [TransactionId] AS transactionId,
        [Action] AS action,
        [Status] AS status,
        [Message] AS message,
        [Timestamp] AS timestamp,
        [PerformedBy] AS performedBy,
        [Details] AS details,
        [IpAddress] AS ipAddress,
        [UserAgent] AS userAgent
    FROM 
        [dbo].[TransactionLogs]
    ORDER BY 
        [Timestamp] DESC;
END
GO
