-- 거래 관련 공통 저장 프로시저

-- 거래 상태 업데이트 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateTransactionStatus]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_UpdateTransactionStatus]
GO

CREATE PROCEDURE [dbo].[sp_UpdateTransactionStatus]
    @TransactionId NVARCHAR(50),
    @Status NVARCHAR(20),
    @PerformedBy NVARCHAR(50) = NULL,
    @FailureReason NVARCHAR(500) = NULL,
    @FailureCode NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentDateTime DATETIME = GETDATE();
    DECLARE @LogId NVARCHAR(50) = NEWID();
    DECLARE @TransactionExists BIT = 0;
    DECLARE @CurrentStatus NVARCHAR(20);
    DECLARE @TransactionType NVARCHAR(20);
    
    -- 거래 존재 여부 및 현재 상태 확인
    SELECT 
        @TransactionExists = 1,
        @CurrentStatus = [Status],
        @TransactionType = [Type]
    FROM [dbo].[Transactions]
    WHERE [TransactionId] = @TransactionId;
    
    -- 거래가 존재하지 않는 경우
    IF @TransactionExists = 0
    BEGIN
        SELECT 'error' AS Result, '거래를 찾을 수 없습니다.' AS Message;
        RETURN;
    END
    
    -- 이미 동일한 상태인 경우
    IF @CurrentStatus = @Status
    BEGIN
        SELECT 'error' AS Result, '이미 해당 상태입니다.' AS Message;
        RETURN;
    END
    
    -- 완료된 거래는 상태 변경 불가
    IF @CurrentStatus = 'completed' AND @Status != 'refunded'
    BEGIN
        SELECT 'error' AS Result, '완료된 거래의 상태는 변경할 수 없습니다.' AS Message;
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 거래 상태 업데이트
        UPDATE [dbo].[Transactions]
        SET [Status] = @Status,
            [UpdatedAt] = @CurrentDateTime,
            [FailureReason] = CASE WHEN @Status = 'failed' THEN @FailureReason ELSE [FailureReason] END,
            [FailureCode] = CASE WHEN @Status = 'failed' THEN @FailureCode ELSE [FailureCode] END
        WHERE [TransactionId] = @TransactionId;
        
        -- 출금 거래인 경우 ApprovalStatus 업데이트
        IF @TransactionType = 'withdrawal' AND @Status = 'cancelled'
        BEGIN
            UPDATE [dbo].[WithdrawalTransactions]
            SET [ApprovalStatus] = 'rejected'
            WHERE [TransactionId] = @TransactionId;
        END
        
        -- 거래 로그 기록
        INSERT INTO [dbo].[TransactionLogs]
           ([LogId]
           ,[TransactionId]
           ,[Action]
           ,[Status]
           ,[Message]
           ,[Timestamp]
           ,[PerformedBy]
           ,[Details])
        VALUES
           (@LogId
           ,@TransactionId
           ,'status_update'
           ,@Status
           ,'거래 상태가 ' + @CurrentStatus + '에서 ' + @Status + '로 변경되었습니다.'
           ,@CurrentDateTime
           ,@PerformedBy
           ,CASE 
                WHEN @Status = 'failed' AND @FailureReason IS NOT NULL 
                THEN JSON_QUERY('{"failureReason": "' + @FailureReason + '", "failureCode": "' + ISNULL(@FailureCode, '') + '"}')
                ELSE NULL
            END);
        
        COMMIT TRANSACTION;
        
        -- 성공 결과 반환
        SELECT 'success' AS Result, '거래 상태가 성공적으로 업데이트되었습니다.' AS Message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        -- 오류 정보 반환
        SELECT 
            'error' AS Result,
            @ErrorMessage AS ErrorMessage,
            @ErrorSeverity AS ErrorSeverity,
            @ErrorState AS ErrorState;
            
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END
GO

-- 거래 취소 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CancelTransaction]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_CancelTransaction]
GO

CREATE PROCEDURE [dbo].[sp_CancelTransaction]
    @TransactionId NVARCHAR(50),
    @PerformedBy NVARCHAR(50) = NULL,
    @CancelReason NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentDateTime DATETIME = GETDATE();
    DECLARE @LogId NVARCHAR(50) = NEWID();
    DECLARE @TransactionExists BIT = 0;
    DECLARE @CurrentStatus NVARCHAR(20);
    DECLARE @TransactionType NVARCHAR(20);
    
    -- 거래 존재 여부 및 현재 상태 확인
    SELECT 
        @TransactionExists = 1,
        @CurrentStatus = [Status],
        @TransactionType = [Type]
    FROM [dbo].[Transactions]
    WHERE [TransactionId] = @TransactionId;
    
    -- 거래가 존재하지 않는 경우
    IF @TransactionExists = 0
    BEGIN
        SELECT 'error' AS Result, '거래를 찾을 수 없습니다.' AS Message;
        RETURN;
    END
    
    -- 이미 취소된 경우
    IF @CurrentStatus = 'cancelled'
    BEGIN
        SELECT 'error' AS Result, '이미 취소된 거래입니다.' AS Message;
        RETURN;
    END
    
    -- 완료된 거래는 취소 불가
    IF @CurrentStatus = 'completed'
    BEGIN
        SELECT 'error' AS Result, '완료된 거래는 취소할 수 없습니다. 환불 처리를 진행하세요.' AS Message;
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 거래 상태 업데이트
        UPDATE [dbo].[Transactions]
        SET [Status] = 'cancelled',
            [UpdatedAt] = @CurrentDateTime,
            [FailureReason] = @CancelReason
        WHERE [TransactionId] = @TransactionId;
        
        -- 출금 거래인 경우 ApprovalStatus 업데이트
        IF @TransactionType = 'withdrawal'
        BEGIN
            UPDATE [dbo].[WithdrawalTransactions]
            SET [ApprovalStatus] = 'rejected'
            WHERE [TransactionId] = @TransactionId;
        END
        
        -- 거래 로그 기록
        INSERT INTO [dbo].[TransactionLogs]
           ([LogId]
           ,[TransactionId]
           ,[Action]
           ,[Status]
           ,[Message]
           ,[Timestamp]
           ,[PerformedBy]
           ,[Details])
        VALUES
           (@LogId
           ,@TransactionId
           ,'cancel'
           ,'cancelled'
           ,'거래가 취소되었습니다.'
           ,@CurrentDateTime
           ,@PerformedBy
           ,CASE 
                WHEN @CancelReason IS NOT NULL 
                THEN JSON_QUERY('{"cancelReason": "' + @CancelReason + '"}')
                ELSE NULL
            END);
        
        COMMIT TRANSACTION;
        
        -- 성공 결과 반환
        SELECT 'success' AS Result, '거래가 성공적으로 취소되었습니다.' AS Message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        -- 오류 정보 반환
        SELECT 
            'error' AS Result,
            @ErrorMessage AS ErrorMessage,
            @ErrorSeverity AS ErrorSeverity,
            @ErrorState AS ErrorState;
            
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END
GO

-- 거래 재시도 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_RetryTransaction]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_RetryTransaction]
GO

CREATE PROCEDURE [dbo].[sp_RetryTransaction]
    @TransactionId NVARCHAR(50),
    @PerformedBy NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentDateTime DATETIME = GETDATE();
    DECLARE @LogId NVARCHAR(50) = NEWID();
    DECLARE @TransactionExists BIT = 0;
    DECLARE @CurrentStatus NVARCHAR(20);
    DECLARE @TransactionType NVARCHAR(20);
    
    -- 거래 존재 여부 및 현재 상태 확인
    SELECT 
        @TransactionExists = 1,
        @CurrentStatus = [Status],
        @TransactionType = [Type]
    FROM [dbo].[Transactions]
    WHERE [TransactionId] = @TransactionId;
    
    -- 거래가 존재하지 않는 경우
    IF @TransactionExists = 0
    BEGIN
        SELECT 'error' AS Result, '거래를 찾을 수 없습니다.' AS Message;
        RETURN;
    END
    
    -- 실패한 거래만 재시도 가능
    IF @CurrentStatus != 'failed'
    BEGIN
        SELECT 'error' AS Result, '실패한 거래만 재시도할 수 있습니다.' AS Message;
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 거래 상태 업데이트
        UPDATE [dbo].[Transactions]
        SET [Status] = 'pending',
            [UpdatedAt] = @CurrentDateTime,
            [FailureReason] = NULL,
            [FailureCode] = NULL
        WHERE [TransactionId] = @TransactionId;
        
        -- 출금 거래인 경우 ApprovalStatus 업데이트
        IF @TransactionType = 'withdrawal'
        BEGIN
            UPDATE [dbo].[WithdrawalTransactions]
            SET [ApprovalStatus] = 'pending'
            WHERE [TransactionId] = @TransactionId;
        END
        
        -- 거래 로그 기록
        INSERT INTO [dbo].[TransactionLogs]
           ([LogId]
           ,[TransactionId]
           ,[Action]
           ,[Status]
           ,[Message]
           ,[Timestamp]
           ,[PerformedBy])
        VALUES
           (@LogId
           ,@TransactionId
           ,'retry'
           ,'pending'
           ,'거래가 재시도되었습니다.'
           ,@CurrentDateTime
           ,@PerformedBy);
        
        COMMIT TRANSACTION;
        
        -- 성공 결과 반환
        SELECT 'success' AS Result, '거래가 성공적으로 재시도되었습니다.' AS Message;
        
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        -- 오류 정보 반환
        SELECT 
            'error' AS Result,
            @ErrorMessage AS ErrorMessage,
            @ErrorSeverity AS ErrorSeverity,
            @ErrorState AS ErrorState;
            
        RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH;
END
GO

-- 거래 로그 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetTransactionLogs]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_GetTransactionLogs]
GO

CREATE PROCEDURE [dbo].[sp_GetTransactionLogs]
    @TransactionId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        [LogId],
        [TransactionId],
        [Action],
        [Status],
        [Message],
        [Timestamp],
        [PerformedBy],
        [Details],
        [IpAddress],
        [UserAgent]
    FROM [dbo].[TransactionLogs]
    WHERE [TransactionId] = @TransactionId
    ORDER BY [Timestamp] DESC;
END
GO

-- 거래 통계 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetTransactionStats]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_GetTransactionStats]
GO

CREATE PROCEDURE [dbo].[sp_GetTransactionStats]
    @MerchantId NVARCHAR(50) = NULL,
    @DateFrom DATETIME = NULL,
    @DateTo DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 기본값 설정
    SET @DateFrom = ISNULL(@DateFrom, DATEADD(DAY, -30, GETDATE()));
    SET @DateTo = ISNULL(@DateTo, GETDATE());
    
    -- 전체 통계
    SELECT
        SUM(CASE WHEN [Type] = 'deposit' AND [Status] = 'completed' THEN [Amount] ELSE 0 END) AS TotalDeposits,
        SUM(CASE WHEN [Type] = 'withdrawal' AND [Status] = 'completed' THEN [Amount] ELSE 0 END) AS TotalWithdrawals,
        SUM(CASE WHEN [Status] = 'completed' THEN [Amount] ELSE 0 END) AS TotalAmount,
        CAST(COUNT(CASE WHEN [Status] = 'completed' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0) AS DECIMAL(5,2)) AS SuccessRate,
        COUNT(CASE WHEN [Type] = 'deposit' THEN 1 END) AS DepositCount,
        COUNT(CASE WHEN [Type] = 'withdrawal' THEN 1 END) AS WithdrawalCount,
        COUNT(CASE WHEN [Status] = 'failed' THEN 1 END) AS FailedCount,
        COUNT(CASE WHEN [Status] = 'pending' THEN 1 END) AS PendingCount
    FROM [dbo].[Transactions]
    WHERE ([CreatedAt] BETWEEN @DateFrom AND @DateTo)
        AND (@MerchantId IS NULL OR [MerchantId] = @MerchantId);
    
    -- 일별 거래 통계
    SELECT
        CAST([CreatedAt] AS DATE) AS [Date],
        COUNT(*) AS [Count],
        SUM([Amount]) AS [Amount]
    FROM [dbo].[Transactions]
    WHERE ([CreatedAt] BETWEEN @DateFrom AND @DateTo)
        AND (@MerchantId IS NULL OR [MerchantId] = @MerchantId)
    GROUP BY CAST([CreatedAt] AS DATE)
    ORDER BY CAST([CreatedAt] AS DATE);
END
GO

-- 거래 요약 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetTransactionSummary]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_GetTransactionSummary]
GO

CREATE PROCEDURE [dbo].[sp_GetTransactionSummary]
    @MerchantId NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Today DATE = CAST(GETDATE() AS DATE);
    DECLARE @WeekStart DATE = DATEADD(DAY, -(DATEPART(WEEKDAY, GETDATE()) - 1), @Today);
    DECLARE @MonthStart DATE = DATEADD(DAY, -(DATEPART(DAY, GETDATE()) - 1), @Today);
    
    -- 오늘 거래
    SELECT
        COUNT(*) AS [Count],
        SUM([Amount]) AS [Amount]
    FROM [dbo].[Transactions]
    WHERE CAST([CreatedAt] AS DATE) = @Today
        AND (@MerchantId IS NULL OR [MerchantId] = @MerchantId);
    
    -- 이번 주 거래
    SELECT
        COUNT(*) AS [Count],
        SUM([Amount]) AS [Amount]
    FROM [dbo].[Transactions]
    WHERE CAST([CreatedAt] AS DATE) >= @WeekStart
        AND (@MerchantId IS NULL OR [MerchantId] = @MerchantId);
    
    -- 이번 달 거래
    SELECT
        COUNT(*) AS [Count],
        SUM([Amount]) AS [Amount]
    FROM [dbo].[Transactions]
    WHERE CAST([CreatedAt] AS DATE) >= @MonthStart
        AND (@MerchantId IS NULL OR [MerchantId] = @MerchantId);
    
    -- 전체 거래
    SELECT
        COUNT(*) AS [Count],
        SUM([Amount]) AS [Amount]
    FROM [dbo].[Transactions]
    WHERE @MerchantId IS NULL OR [MerchantId] = @MerchantId;
END
GO
