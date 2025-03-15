-- 대기 거래 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PendingTransactions]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[PendingTransactions] (
        [PendingId] UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
        [TransactionId] NVARCHAR(50) NOT NULL,
        [MerchantId] NVARCHAR(50) NOT NULL,
        [Amount] DECIMAL(18, 2) NOT NULL,
        [PaymentMethod] NVARCHAR(20) NOT NULL,
        [Type] NVARCHAR(20) NOT NULL,
        [Currency] NVARCHAR(10) NOT NULL DEFAULT 'KRW',
        [PendingSince] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [EstimatedCompletionTime] DATETIME2,
        [PendingReason] NVARCHAR(255),
        [Priority] NVARCHAR(10) DEFAULT 'normal',
        [Status] NVARCHAR(20) NOT NULL DEFAULT 'pending',
        [CustomerName] NVARCHAR(100),
        [CustomerEmail] NVARCHAR(100),
        [CustomerPhone] NVARCHAR(20),
        [Description] NVARCHAR(500),
        [ExternalId] NVARCHAR(50),
        [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [UpdatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [Metadata] NVARCHAR(MAX) NULL,
        [CompletedAt] DATETIME2 NULL,
        [CompletionReason] NVARCHAR(255) NULL
    );

    CREATE INDEX [IX_PendingTransactions_TransactionId] ON [dbo].[PendingTransactions] ([TransactionId]);
    CREATE INDEX [IX_PendingTransactions_MerchantId] ON [dbo].[PendingTransactions] ([MerchantId]);
    CREATE INDEX [IX_PendingTransactions_Status] ON [dbo].[PendingTransactions] ([Status]);
    CREATE INDEX [IX_PendingTransactions_PendingSince] ON [dbo].[PendingTransactions] ([PendingSince]);
END
GO

-- 기존 테이블에 컬럼 추가 (테이블이 이미 존재하는 경우)
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PendingTransactions]') AND type in (N'U'))
BEGIN
    -- Metadata 컬럼 추가
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PendingTransactions]') AND name = 'Metadata')
    BEGIN
        ALTER TABLE [dbo].[PendingTransactions] ADD [Metadata] NVARCHAR(MAX) NULL;
    END

    -- CompletedAt 컬럼 추가
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PendingTransactions]') AND name = 'CompletedAt')
    BEGIN
        ALTER TABLE [dbo].[PendingTransactions] ADD [CompletedAt] DATETIME2 NULL;
    END

    -- CompletionReason 컬럼 추가
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[PendingTransactions]') AND name = 'CompletionReason')
    BEGIN
        ALTER TABLE [dbo].[PendingTransactions] ADD [CompletionReason] NVARCHAR(255) NULL;
    END
END
GO

-- 대기 거래 추가 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_AddPendingTransaction]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[usp_AddPendingTransaction]
GO

CREATE OR ALTER PROCEDURE [dbo].[usp_AddPendingTransaction]
    @TransactionId NVARCHAR(50),
    @MerchantId NVARCHAR(50),
    @Type NVARCHAR(20),
    @Amount DECIMAL(18, 2),
    @Currency NVARCHAR(3),
    @Status NVARCHAR(20),
    @PaymentMethod NVARCHAR(50),
    @Description NVARCHAR(255) = NULL,
    @ExternalId NVARCHAR(50) = NULL,
    @PendingSince DATETIME,
    @PendingReason NVARCHAR(255) = NULL,
    @EstimatedCompletionTime DATETIME = NULL,
    @Priority NVARCHAR(10) = 'normal',
    @Metadata NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 이미 존재하는지 확인
        IF EXISTS (SELECT 1 FROM [dbo].[PendingTransactions] WHERE [TransactionId] = @TransactionId)
        BEGIN
            ROLLBACK TRANSACTION;
            RETURN -1; -- 이미 존재함
        END
        
        -- 메타데이터 처리
        DECLARE @MetadataJson NVARCHAR(MAX) = NULL;
        IF @Metadata IS NOT NULL
        BEGIN
            SET @MetadataJson = @Metadata;
        END
        
        -- 대기 트랜잭션 추가
        INSERT INTO [dbo].[PendingTransactions] (
            [TransactionId],
            [MerchantId],
            [Type],
            [Amount],
            [Currency],
            [Status],
            [PaymentMethod],
            [Description],
            [ExternalId],
            [PendingSince],
            [PendingReason],
            [EstimatedCompletionTime],
            [Priority],
            [Metadata],
            [CreatedAt],
            [UpdatedAt],
            [CompletedAt],
            [CompletionReason]
        )
        VALUES (
            @TransactionId,
            @MerchantId,
            @Type,
            @Amount,
            @Currency,
            @Status,
            @PaymentMethod,
            @Description,
            @ExternalId,
            @PendingSince,
            @PendingReason,
            @EstimatedCompletionTime,
            @Priority,
            @MetadataJson,
            GETDATE(),
            GETDATE(),
            NULL,
            NULL
        );
        
        COMMIT TRANSACTION;
        RETURN 0; -- 성공
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- 오류 정보 반환
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
        RETURN -999; -- 오류 발생
    END CATCH;
END
GO

-- 대기 거래 상태 업데이트 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_UpdatePendingTransactionStatus]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[usp_UpdatePendingTransactionStatus]
GO

CREATE OR ALTER PROCEDURE [dbo].[usp_UpdatePendingTransactionStatus]
    @TransactionId NVARCHAR(50),
    @Status NVARCHAR(20),
    @Reason NVARCHAR(255) = NULL,
    @PerformedBy NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 대기 트랜잭션이 존재하는지 확인
        IF NOT EXISTS (SELECT 1 FROM [dbo].[PendingTransactions] WHERE [TransactionId] = @TransactionId)
        BEGIN
            ROLLBACK TRANSACTION;
            RETURN -1; -- 존재하지 않음
        END
        
        -- 상태에 따른 처리
        DECLARE @StatusDescription NVARCHAR(255);
        
        SET @StatusDescription = 
            CASE 
                WHEN @Status = 'completed' THEN '완료됨'
                WHEN @Status = 'failed' THEN '실패'
                WHEN @Status = 'cancelled' THEN '취소됨'
                WHEN @Status = 'refunded' THEN '환불됨'
                ELSE '상태 변경됨'
            END;
        
        -- 대기 트랜잭션 상태 업데이트
        UPDATE [dbo].[PendingTransactions]
        SET [Status] = @Status,
            [UpdatedAt] = GETDATE(),
            [CompletedAt] = CASE WHEN @Status IN ('completed', 'failed', 'cancelled', 'refunded') THEN GETDATE() ELSE NULL END,
            [CompletionReason] = CASE WHEN @Status IN ('completed', 'failed', 'cancelled', 'refunded') THEN @Reason ELSE NULL END
        WHERE [TransactionId] = @TransactionId;
        
        -- 트랜잭션 로그 추가
        INSERT INTO [dbo].[TransactionLogs] (
            [TransactionId],
            [Action],
            [Status],
            [Message],
            [PerformedBy],
            [Timestamp]
        )
        VALUES (
            @TransactionId,
            'STATUS_CHANGED',
            @Status,
            'Status changed to ' + @Status + '. Reason: ' + ISNULL(@Reason, 'Not specified'),
            ISNULL(@PerformedBy, 'system'),
            GETDATE()
        );
        
        COMMIT TRANSACTION;
        RETURN 0; -- 성공
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- 오류 정보 반환
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
        RETURN -999; -- 오류 발생
    END CATCH;
END
GO

-- 대기 거래 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[usp_GetPendingTransactions]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[usp_GetPendingTransactions]
GO

CREATE PROCEDURE [dbo].[usp_GetPendingTransactions]
    @Status NVARCHAR(20) = 'pending',
    @MerchantId NVARCHAR(50) = NULL,
    @Type NVARCHAR(20) = NULL,
    @Page INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    
    -- 총 레코드 수 계산
    SELECT COUNT(*) AS TotalCount
    FROM [dbo].[PendingTransactions]
    WHERE 
        (@Status IS NULL OR [Status] = @Status) AND
        (@MerchantId IS NULL OR [MerchantId] = @MerchantId) AND
        (@Type IS NULL OR [Type] = @Type);
    
    -- 페이징된 결과 조회
    SELECT 
        [PendingId] AS pendingId,
        [TransactionId] AS transactionId,
        [MerchantId] AS merchantId,
        [Amount] AS amount,
        [Status] AS status,
        [PaymentMethod] AS paymentMethod,
        [Type] AS type,
        [Currency] AS currency,
        [PendingSince] AS pendingSince,
        [EstimatedCompletionTime] AS estimatedCompletionTime,
        [PendingReason] AS pendingReason,
        [Priority] AS priority,
        [CustomerName] AS customerName,
        [CustomerEmail] AS customerEmail,
        [CustomerPhone] AS customerPhone,
        [Description] AS description,
        [ExternalId] AS externalId,
        [CreatedAt] AS createdAt,
        [UpdatedAt] AS updatedAt,
        [Metadata] AS metadata,
        [CompletedAt] AS completedAt,
        [CompletionReason] AS completionReason
    FROM 
        [dbo].[PendingTransactions]
    WHERE 
        (@Status IS NULL OR [Status] = @Status) AND
        (@MerchantId IS NULL OR [MerchantId] = @MerchantId) AND
        (@Type IS NULL OR [Type] = @Type)
    ORDER BY 
        [PendingSince] DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
