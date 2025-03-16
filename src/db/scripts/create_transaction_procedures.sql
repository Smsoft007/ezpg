-- =============================================
-- 거래 관리를 위한 저장 프로시저 스크립트
-- =============================================

USE [EZPG]
GO

-- 모든 거래 목록 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetTransactionList]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetTransactionList]
GO

CREATE PROCEDURE [dbo].[sp_GetTransactionList]
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @VendorId VARCHAR(36) = NULL,
    @Status VARCHAR(20) = NULL,
    @PaymentMethod VARCHAR(50) = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @SearchTerm NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- 전체 레코드 수 계산
    SELECT COUNT(*) AS TotalCount
    FROM [dbo].[Transactions] t
    WHERE 
        (@VendorId IS NULL OR t.VendorId = @VendorId)
        AND (@Status IS NULL OR t.Status = @Status)
        AND (@PaymentMethod IS NULL OR t.PaymentMethod = @PaymentMethod)
        AND (@StartDate IS NULL OR t.CreatedAt >= @StartDate)
        AND (@EndDate IS NULL OR t.CreatedAt <= @EndDate)
        AND (@SearchTerm IS NULL OR 
            t.Id LIKE '%' + @SearchTerm + '%' OR 
            t.OrderNumber LIKE '%' + @SearchTerm + '%')
    
    -- 페이지네이션 적용하여 데이터 조회
    SELECT 
        t.Id,
        t.VendorId,
        v.Name AS VendorName,
        t.OrderNumber,
        t.Amount,
        t.Fee,
        t.Status,
        t.PaymentMethod,
        t.CustomerName,
        t.CustomerEmail,
        t.CustomerPhone,
        t.CreatedAt,
        t.UpdatedAt,
        t.CompletedAt,
        t.CanceledAt
    FROM [dbo].[Transactions] t
    LEFT JOIN [dbo].[Vendors] v ON t.VendorId = v.Id
    WHERE 
        (@VendorId IS NULL OR t.VendorId = @VendorId)
        AND (@Status IS NULL OR t.Status = @Status)
        AND (@PaymentMethod IS NULL OR t.PaymentMethod = @PaymentMethod)
        AND (@StartDate IS NULL OR t.CreatedAt >= @StartDate)
        AND (@EndDate IS NULL OR t.CreatedAt <= @EndDate)
        AND (@SearchTerm IS NULL OR 
            t.Id LIKE '%' + @SearchTerm + '%' OR 
            t.OrderNumber LIKE '%' + @SearchTerm + '%')
    ORDER BY t.CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- 결제 방법별 거래 목록 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetTransactionsByType]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetTransactionsByType]
GO

CREATE PROCEDURE [dbo].[sp_GetTransactionsByType]
    @PaymentMethod VARCHAR(50),
    @Status VARCHAR(20) = NULL,
    @VendorId VARCHAR(36) = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- 전체 레코드 수 계산
    SELECT COUNT(*) AS TotalCount
    FROM [dbo].[Transactions] t
    WHERE 
        t.PaymentMethod = @PaymentMethod
        AND (@Status IS NULL OR t.Status = @Status)
        AND (@VendorId IS NULL OR t.VendorId = @VendorId)
        AND (@StartDate IS NULL OR t.CreatedAt >= @StartDate)
        AND (@EndDate IS NULL OR t.CreatedAt <= @EndDate);
    
    -- 페이지네이션 적용하여 데이터 조회
    SELECT 
        t.Id,
        t.VendorId,
        v.Name AS VendorName,
        t.OrderNumber,
        t.Amount,
        t.Fee,
        t.Status,
        t.PaymentMethod,
        t.CustomerName,
        t.CustomerEmail,
        t.CustomerPhone,
        t.CreatedAt,
        t.UpdatedAt,
        t.CompletedAt,
        t.CanceledAt
    FROM [dbo].[Transactions] t
    LEFT JOIN [dbo].[Vendors] v ON t.VendorId = v.Id
    WHERE 
        t.PaymentMethod = @PaymentMethod
        AND (@Status IS NULL OR t.Status = @Status)
        AND (@VendorId IS NULL OR t.VendorId = @VendorId)
        AND (@StartDate IS NULL OR t.CreatedAt >= @StartDate)
        AND (@EndDate IS NULL OR t.CreatedAt <= @EndDate)
    ORDER BY t.CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- 특정 거래 상세 정보 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetTransactionById]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetTransactionById]
GO

CREATE PROCEDURE [dbo].[sp_GetTransactionById]
    @TransactionId VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 거래 기본 정보 조회
    SELECT 
        t.*,
        v.Name AS VendorName
    FROM [dbo].[Transactions] t
    LEFT JOIN [dbo].[Vendors] v ON t.VendorId = v.Id
    WHERE t.Id = @TransactionId;
    
    -- 결제 로그 조회
    SELECT *
    FROM [dbo].[PaymentLogs]
    WHERE TransactionId = @TransactionId
    ORDER BY CreatedAt ASC;
END
GO

-- 새 거래 생성 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateTransaction]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_CreateTransaction]
GO

CREATE PROCEDURE [dbo].[sp_CreateTransaction]
    @Id VARCHAR(36),
    @VendorId VARCHAR(36),
    @OrderNumber VARCHAR(100),
    @Amount DECIMAL(18, 2),
    @Fee DECIMAL(18, 2) = 0,
    @Status VARCHAR(50),
    @PaymentMethod VARCHAR(50),
    @PaymentKey VARCHAR(100) = NULL,
    @CustomerName NVARCHAR(100) = NULL,
    @CustomerEmail VARCHAR(255) = NULL,
    @CustomerPhone VARCHAR(50) = NULL,
    @ProductName NVARCHAR(255) = NULL,
    @ReturnUrl VARCHAR(500) = NULL,
    @NotifyUrl VARCHAR(500) = NULL,
    @PaymentUrl VARCHAR(500) = NULL,
    @BankCode VARCHAR(10) = NULL,
    @BankName NVARCHAR(50) = NULL,
    @AccountNumber VARCHAR(50) = NULL,
    @AccountHolder NVARCHAR(50) = NULL,
    @ExpiresAt DATETIME = NULL,
    @Metadata NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 거래 정보 삽입
        INSERT INTO [dbo].[Transactions]
        (
            [Id], [VendorId], [OrderNumber], [Amount], [Fee], [Status], 
            [PaymentMethod], [PaymentKey], [CustomerName], [CustomerEmail], [CustomerPhone],
            [ProductName], [ReturnUrl], [NotifyUrl], [PaymentUrl], 
            [BankCode], [BankName], [AccountNumber], [AccountHolder], [ExpiresAt], [Metadata]
        )
        VALUES
        (
            @Id, @VendorId, @OrderNumber, @Amount, @Fee, @Status, 
            @PaymentMethod, @PaymentKey, @CustomerName, @CustomerEmail, @CustomerPhone,
            @ProductName, @ReturnUrl, @NotifyUrl, @PaymentUrl,
            @BankCode, @BankName, @AccountNumber, @AccountHolder, @ExpiresAt, @Metadata
        );
        
        -- 거래 로그 기록
        INSERT INTO [dbo].[PaymentLogs]
        (
            [Id],
            [TransactionId], 
            [LogType], 
            [Message], 
            [CreatedAt]
        )
        VALUES
        (
            NEWID(),
            @Id, 
            @Status, 
            N'거래가 생성되었습니다.', 
            GETDATE()
        );
        
        COMMIT TRANSACTION;
        
        -- 생성된 거래 정보 반환
        SELECT 
            t.*,
            v.Name AS VendorName
        FROM [dbo].[Transactions] t
        LEFT JOIN [dbo].[Vendors] v ON t.VendorId = v.Id
        WHERE t.Id = @Id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- 에러 정보 반환
        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_LINE() AS ErrorLine,
            ERROR_MESSAGE() AS ErrorMessage;
    END CATCH;
END
GO

-- 거래 상태 업데이트 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateTransactionStatus]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_UpdateTransactionStatus]
GO

CREATE PROCEDURE [dbo].[sp_UpdateTransactionStatus]
    @TransactionId VARCHAR(36),
    @Status VARCHAR(20),
    @UpdatedBy VARCHAR(100) = 'SYSTEM',
    @LogMessage NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @OldStatus VARCHAR(20);
        DECLARE @CurrentTime DATETIME = GETDATE();
        
        -- 현재 상태 확인
        SELECT @OldStatus = Status
        FROM [dbo].[Transactions]
        WHERE Id = @TransactionId;
        
        -- 상태에 따른 타임스탬프 업데이트
        IF @Status = 'completed'
            UPDATE [dbo].[Transactions]
            SET [Status] = @Status, [CompletedAt] = @CurrentTime, [UpdatedAt] = @CurrentTime
            WHERE Id = @TransactionId;
        ELSE IF @Status = 'failed'
            UPDATE [dbo].[Transactions]
            SET [Status] = @Status, [UpdatedAt] = @CurrentTime
            WHERE Id = @TransactionId;
        ELSE IF @Status = 'canceled'
            UPDATE [dbo].[Transactions]
            SET [Status] = @Status, [CanceledAt] = @CurrentTime, [UpdatedAt] = @CurrentTime
            WHERE Id = @TransactionId;
        ELSE
            UPDATE [dbo].[Transactions]
            SET [Status] = @Status, [UpdatedAt] = @CurrentTime
            WHERE Id = @TransactionId;
        
        -- 로그 메시지가 없으면 기본 메시지 생성
        IF @LogMessage IS NULL
            SET @LogMessage = N'거래 상태가 ' + @OldStatus + N'에서 ' + @Status + N'(으)로 변경되었습니다.';
        
        -- 거래 로그 기록
        INSERT INTO [dbo].[PaymentLogs]
        (
            [Id],
            [TransactionId], 
            [LogType], 
            [Message], 
            [CreatedAt]
        )
        VALUES
        (
            NEWID(),
            @TransactionId, 
            @Status, 
            @LogMessage, 
            GETDATE()
        );
        
        COMMIT TRANSACTION;
        
        -- 업데이트된 거래 정보 반환
        SELECT 
            t.*,
            v.Name AS VendorName
        FROM [dbo].[Transactions] t
        LEFT JOIN [dbo].[Vendors] v ON t.VendorId = v.Id
        WHERE t.Id = @TransactionId;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- 에러 정보 반환
        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_LINE() AS ErrorLine,
            ERROR_MESSAGE() AS ErrorMessage;
    END CATCH;
END
GO

-- 거래 취소 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CancelTransaction]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_CancelTransaction]
GO

CREATE PROCEDURE [dbo].[sp_CancelTransaction]
    @TransactionId VARCHAR(36),
    @Reason NVARCHAR(500) = NULL,
    @CanceledBy VARCHAR(100) = 'SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 현재 상태 확인
        DECLARE @CurrentStatus VARCHAR(20);
        
        SELECT @CurrentStatus = Status
        FROM [dbo].[Transactions]
        WHERE Id = @TransactionId;
        
        -- 취소 가능한 상태인지 확인
        IF @CurrentStatus IN ('completed', 'pending')
        BEGIN
            -- 거래 상태 업데이트
            UPDATE [dbo].[Transactions]
            SET 
                [Status] = 'canceled',
                [CanceledAt] = GETDATE(),
                [UpdatedAt] = GETDATE()
            WHERE Id = @TransactionId;
            
            -- 로그 메시지 생성
            DECLARE @LogMessage NVARCHAR(1000);
            
            IF @Reason IS NULL
                SET @LogMessage = N'거래가 취소되었습니다.';
            ELSE
                SET @LogMessage = N'거래가 취소되었습니다. 사유: ' + @Reason;
            
            -- 거래 로그 기록
            INSERT INTO [dbo].[PaymentLogs]
            (
                [Id],
                [TransactionId], 
                [LogType], 
                [Message], 
                [CreatedAt]
            )
            VALUES
            (
                NEWID(),
                @TransactionId, 
                'canceled', 
                @LogMessage, 
                GETDATE()
            );
            
            COMMIT TRANSACTION;
            
            -- 성공 결과 반환
            SELECT 
                1 AS Success, 
                N'거래가 성공적으로 취소되었습니다.' AS Message,
                t.*,
                v.Name AS VendorName
            FROM [dbo].[Transactions] t
            LEFT JOIN [dbo].[Vendors] v ON t.VendorId = v.Id
            WHERE t.Id = @TransactionId;
        END
        ELSE
        BEGIN
            -- 취소 불가능한 상태
            SELECT 
                0 AS Success, 
                N'이미 취소되었거나 취소할 수 없는 상태입니다. 현재 상태: ' + @CurrentStatus AS Message,
                t.*,
                v.Name AS VendorName
            FROM [dbo].[Transactions] t
            LEFT JOIN [dbo].[Vendors] v ON t.VendorId = v.Id
            WHERE t.Id = @TransactionId;
        END
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- 에러 정보 반환
        SELECT 
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_LINE() AS ErrorLine,
            ERROR_MESSAGE() AS ErrorMessage;
    END CATCH;
END
GO

-- 일별 거래 통계 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetDailyTransactionStats]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetDailyTransactionStats]
GO

CREATE PROCEDURE [dbo].[sp_GetDailyTransactionStats]
    @StartDate DATE,
    @EndDate DATE,
    @VendorId VARCHAR(36) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        CAST(CreatedAt AS DATE) AS TransactionDate,
        COUNT(*) AS TotalCount,
        SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) AS CompletedCount,
        SUM(CASE WHEN Status = 'failed' THEN 1 ELSE 0 END) AS FailedCount,
        SUM(CASE WHEN Status = 'pending' THEN 1 ELSE 0 END) AS PendingCount,
        SUM(CASE WHEN Status = 'canceled' THEN 1 ELSE 0 END) AS CanceledCount,
        SUM(Amount) AS TotalAmount,
        SUM(CASE WHEN Status = 'completed' THEN Amount ELSE 0 END) AS CompletedAmount,
        SUM(Fee) AS TotalFee
    FROM [dbo].[Transactions]
    WHERE 
        CAST(CreatedAt AS DATE) BETWEEN @StartDate AND @EndDate
        AND (@VendorId IS NULL OR VendorId = @VendorId)
    GROUP BY CAST(CreatedAt AS DATE)
    ORDER BY TransactionDate;
END
GO

-- 결제 수단별 거래 통계 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetPaymentMethodStats]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetPaymentMethodStats]
GO

CREATE PROCEDURE [dbo].[sp_GetPaymentMethodStats]
    @StartDate DATE,
    @EndDate DATE,
    @VendorId VARCHAR(36) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        PaymentMethod,
        COUNT(*) AS TotalCount,
        SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) AS CompletedCount,
        SUM(CASE WHEN Status = 'failed' THEN 1 ELSE 0 END) AS FailedCount,
        SUM(Amount) AS TotalAmount,
        SUM(CASE WHEN Status = 'completed' THEN Amount ELSE 0 END) AS CompletedAmount,
        SUM(Fee) AS TotalFee
    FROM [dbo].[Transactions]
    WHERE 
        CAST(CreatedAt AS DATE) BETWEEN @StartDate AND @EndDate
        AND (@VendorId IS NULL OR VendorId = @VendorId)
    GROUP BY PaymentMethod
    ORDER BY CompletedAmount DESC;
END
GO

-- 가맹점별 거래 통계 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetVendorTransactionStats]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetVendorTransactionStats]
GO

CREATE PROCEDURE [dbo].[sp_GetVendorTransactionStats]
    @StartDate DATE,
    @EndDate DATE,
    @Top INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Top)
        t.VendorId,
        v.Name AS VendorName,
        COUNT(*) AS TotalCount,
        SUM(CASE WHEN t.Status = 'completed' THEN 1 ELSE 0 END) AS CompletedCount,
        SUM(CASE WHEN t.Status = 'failed' THEN 1 ELSE 0 END) AS FailedCount,
        SUM(t.Amount) AS TotalAmount,
        SUM(CASE WHEN t.Status = 'completed' THEN t.Amount ELSE 0 END) AS CompletedAmount,
        SUM(t.Fee) AS TotalFee
    FROM [dbo].[Transactions] t
    JOIN [dbo].[Vendors] v ON t.VendorId = v.Id
    WHERE 
        CAST(t.CreatedAt AS DATE) BETWEEN @StartDate AND @EndDate
    GROUP BY t.VendorId, v.Name
    ORDER BY CompletedAmount DESC;
END
GO

-- 일괄 처리를 위한 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_BatchUpdateTransactionStatus]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_BatchUpdateTransactionStatus]
GO

CREATE PROCEDURE [dbo].[sp_BatchUpdateTransactionStatus]
    @TransactionIds NVARCHAR(MAX),  -- 쉼표로 구분된 거래 ID 목록
    @Status VARCHAR(20),
    @UpdatedBy VARCHAR(100) = 'SYSTEM',
    @Reason NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 임시 테이블 생성
    CREATE TABLE #TempTransactionIds (TransactionId VARCHAR(36));
    
    -- 쉼표로 구분된 문자열을 행으로 분리
    INSERT INTO #TempTransactionIds (TransactionId)
    SELECT value
    FROM STRING_SPLIT(@TransactionIds, ',');
    
    -- 성공 및 실패 카운트 초기화
    DECLARE @SuccessCount INT = 0;
    DECLARE @FailCount INT = 0;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        DECLARE @CurrentTime DATETIME = GETDATE();
        
        -- 상태에 따른 타임스탬프 업데이트
        IF @Status = 'completed'
        BEGIN
            UPDATE t
            SET 
                t.Status = @Status,
                t.CompletedAt = @CurrentTime,
                t.UpdatedAt = @CurrentTime
            FROM [dbo].[Transactions] t
            JOIN #TempTransactionIds tmp ON t.Id = tmp.TransactionId
            WHERE t.Status IN ('pending');  -- 특정 상태에서만 변경 가능
            
            SET @SuccessCount = @@ROWCOUNT;
        END
        ELSE IF @Status = 'canceled'
        BEGIN
            UPDATE t
            SET 
                t.Status = @Status,
                t.CanceledAt = @CurrentTime,
                t.UpdatedAt = @CurrentTime
            FROM [dbo].[Transactions] t
            JOIN #TempTransactionIds tmp ON t.Id = tmp.TransactionId
            WHERE t.Status IN ('pending', 'completed');  -- 특정 상태에서만 취소 가능
            
            SET @SuccessCount = @@ROWCOUNT;
        END
        ELSE
        BEGIN
            UPDATE t
            SET 
                t.Status = @Status,
                t.UpdatedAt = @CurrentTime
            FROM [dbo].[Transactions] t
            JOIN #TempTransactionIds tmp ON t.Id = tmp.TransactionId;
            
            SET @SuccessCount = @@ROWCOUNT;
        END
        
        -- 로그 메시지 생성
        DECLARE @LogMessage NVARCHAR(1000);
        
        IF @Reason IS NULL
            SET @LogMessage = N'일괄 처리: 상태가 ' + @Status + N'(으)로 변경되었습니다.';
        ELSE
            SET @LogMessage = N'일괄 처리: 상태가 ' + @Status + N'(으)로 변경되었습니다. 사유: ' + @Reason;
        
        -- 각 거래에 대한 로그 기록
        INSERT INTO [dbo].[PaymentLogs]
        (
            [Id],
            [TransactionId], 
            [LogType], 
            [Message], 
            [CreatedAt]
        )
        SELECT 
            NEWID(),
            tmp.TransactionId, 
            @Status, 
            @LogMessage, 
            GETDATE()
        FROM #TempTransactionIds tmp
        JOIN [dbo].[Transactions] t ON tmp.TransactionId = t.Id
        WHERE t.Status = @Status;  -- 상태가 변경된 거래만 로그 기록
        
        COMMIT TRANSACTION;
        
        -- 총 처리된 건수와 실패한 건수 반환
        SET @FailCount = (SELECT COUNT(*) FROM #TempTransactionIds) - @SuccessCount;
        
        SELECT 
            @SuccessCount AS SuccessCount,
            @FailCount AS FailCount,
            CASE 
                WHEN @FailCount = 0 THEN N'모든 거래가 성공적으로 처리되었습니다.'
                ELSE N'일부 거래가 처리되지 않았습니다. 성공: ' + CAST(@SuccessCount AS NVARCHAR) + N', 실패: ' + CAST(@FailCount AS NVARCHAR)
            END AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- 에러 정보 반환
        SELECT 
            0 AS SuccessCount,
            (SELECT COUNT(*) FROM #TempTransactionIds) AS FailCount,
            ERROR_MESSAGE() AS Message,
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_LINE() AS ErrorLine;
    END CATCH;
    
    -- 임시 테이블 삭제
    DROP TABLE #TempTransactionIds;
END
GO

PRINT '거래 관리 저장 프로시저가 성공적으로 생성되었습니다.'
GO
