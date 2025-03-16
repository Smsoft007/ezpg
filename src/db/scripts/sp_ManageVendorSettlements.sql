-- =============================================
-- 가맹점 정산 관리 프로시저
-- =============================================

USE [EzPayDB]
GO

-- 정산 대상 거래 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetSettlementTargetTransactions]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetSettlementTargetTransactions]
GO

CREATE PROCEDURE [dbo].[sp_GetSettlementTargetTransactions]
    @VendorId VARCHAR(36),
    @StartDate DATE,
    @EndDate DATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 이미 정산된 거래 목록 조회
    SELECT TransactionId
    INTO #SettledTransactions
    FROM [dbo].[VendorSettlementDetails];
    
    -- 정산 대상 거래 조회
    SELECT 
        t.Id,
        t.VendorId,
        t.Amount,
        t.Fee,
        t.NetAmount,
        t.PaymentMethod,
        t.Status,
        t.OrderId,
        t.CustomerName,
        t.CreatedAt,
        t.CompletedAt
    FROM [dbo].[Transactions] t
    WHERE 
        t.VendorId = @VendorId
        AND t.Status = 'completed'
        AND CAST(t.CompletedAt AS DATE) BETWEEN @StartDate AND @EndDate
        AND NOT EXISTS (SELECT 1 FROM #SettledTransactions s WHERE s.TransactionId = t.Id)
    ORDER BY t.CompletedAt;
    
    -- 임시 테이블 삭제
    DROP TABLE #SettledTransactions;
END
GO

-- 정산 생성 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateVendorSettlement]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_CreateVendorSettlement]
GO

CREATE PROCEDURE [dbo].[sp_CreateVendorSettlement]
    @Id VARCHAR(36),
    @VendorId VARCHAR(36),
    @SettlementDate DATE,
    @StartDate DATE,
    @EndDate DATE,
    @CreatedBy VARCHAR(100) = 'SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 가맹점 존재 여부 확인
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Vendors] WHERE Id = @VendorId)
        BEGIN
            RAISERROR(N'존재하지 않는 가맹점입니다.', 16, 1);
            RETURN;
        END
        
        -- 가맹점 계좌 정보 조회
        DECLARE @BankCode VARCHAR(10);
        DECLARE @BankName NVARCHAR(50);
        DECLARE @AccountNumber VARCHAR(30);
        DECLARE @AccountHolder NVARCHAR(50);
        
        SELECT 
            @BankCode = BankCode,
            @BankName = BankName,
            @AccountNumber = AccountNumber,
            @AccountHolder = AccountHolder
        FROM [dbo].[Vendors]
        WHERE Id = @VendorId;
        
        -- 정산 대상 거래 목록 조회
        SELECT 
            t.Id AS TransactionId,
            t.Amount,
            t.Fee,
            t.NetAmount,
            t.PaymentMethod,
            t.CreatedAt AS TransactionDate
        INTO #TargetTransactions
        FROM [dbo].[Transactions] t
        WHERE 
            t.VendorId = @VendorId
            AND t.Status = 'completed'
            AND CAST(t.CompletedAt AS DATE) BETWEEN @StartDate AND @EndDate
            AND NOT EXISTS (
                SELECT 1 
                FROM [dbo].[VendorSettlementDetails] sd
                JOIN [dbo].[VendorSettlements] s ON sd.SettlementId = s.Id
                WHERE sd.TransactionId = t.Id
            );
        
        -- 정산 대상 거래가 없는 경우
        IF NOT EXISTS (SELECT 1 FROM #TargetTransactions)
        BEGIN
            SELECT 0 AS Success, N'해당 기간에 정산 대상 거래가 없습니다.' AS Message;
            DROP TABLE #TargetTransactions;
            RETURN;
        END
        
        -- 정산 정보 계산
        DECLARE @TotalAmount DECIMAL(18, 2);
        DECLARE @TotalFee DECIMAL(18, 2);
        DECLARE @NetAmount DECIMAL(18, 2);
        DECLARE @TransactionCount INT;
        
        SELECT 
            @TotalAmount = SUM(Amount),
            @TotalFee = SUM(Fee),
            @NetAmount = SUM(NetAmount),
            @TransactionCount = COUNT(*)
        FROM #TargetTransactions;
        
        -- 정산 정보 삽입
        INSERT INTO [dbo].[VendorSettlements]
        (
            [Id], [VendorId], [SettlementDate], [StartDate], [EndDate],
            [TotalAmount], [TotalFee], [NetAmount], [TransactionCount], [Status],
            [BankCode], [BankName], [AccountNumber], [AccountHolder]
        )
        VALUES
        (
            @Id, @VendorId, @SettlementDate, @StartDate, @EndDate,
            @TotalAmount, @TotalFee, @NetAmount, @TransactionCount, 'pending',
            @BankCode, @BankName, @AccountNumber, @AccountHolder
        );
        
        -- 정산 상세 정보 삽입
        INSERT INTO [dbo].[VendorSettlementDetails]
        (
            [SettlementId], [TransactionId], [TransactionDate], [OrderId],
            [PaymentMethod], [Amount], [Fee], [NetAmount]
        )
        SELECT 
            @Id, t.TransactionId, t.TransactionDate, tr.OrderId,
            t.PaymentMethod, t.Amount, t.Fee, t.NetAmount
        FROM #TargetTransactions t
        JOIN [dbo].[Transactions] tr ON t.TransactionId = tr.Id;
        
        -- 가맹점 마지막 정산일 업데이트
        UPDATE [dbo].[Vendors]
        SET 
            LastSettlementDate = GETDATE(),
            UpdatedAt = GETDATE()
        WHERE Id = @VendorId;
        
        -- 정산 생성 이력 기록
        INSERT INTO [dbo].[VendorHistories]
        (
            [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
        )
        VALUES
        (
            @VendorId, 'settlement_create', NULL, 
            N'정산 생성: ' + CONVERT(VARCHAR, @StartDate, 23) + N' ~ ' + CONVERT(VARCHAR, @EndDate, 23) + 
            N', 금액: ' + CAST(@NetAmount AS NVARCHAR(50)) + N'원', 
            N'정산 생성', @CreatedBy
        );
        
        COMMIT TRANSACTION;
        
        -- 임시 테이블 삭제
        DROP TABLE #TargetTransactions;
        
        -- 생성된 정산 정보 반환
        SELECT * FROM [dbo].[VendorSettlements] WHERE Id = @Id;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- 임시 테이블이 존재하면 삭제
        IF OBJECT_ID('tempdb..#TargetTransactions') IS NOT NULL
            DROP TABLE #TargetTransactions;
            
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

-- 정산 상태 업데이트 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateSettlementStatus]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_UpdateSettlementStatus]
GO

CREATE PROCEDURE [dbo].[sp_UpdateSettlementStatus]
    @SettlementId VARCHAR(36),
    @Status VARCHAR(20),
    @TransferReference VARCHAR(100) = NULL,
    @Memo NVARCHAR(500) = NULL,
    @UpdatedBy VARCHAR(100) = 'SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 정산 정보 확인
        DECLARE @VendorId VARCHAR(36);
        DECLARE @OldStatus VARCHAR(20);
        
        SELECT 
            @VendorId = VendorId,
            @OldStatus = Status
        FROM [dbo].[VendorSettlements]
        WHERE Id = @SettlementId;
        
        IF @VendorId IS NULL
        BEGIN
            RAISERROR(N'존재하지 않는 정산 정보입니다.', 16, 1);
            RETURN;
        END
        
        -- 상태에 따른 필드 업데이트
        IF @Status = 'completed'
        BEGIN
            UPDATE [dbo].[VendorSettlements]
            SET 
                Status = @Status,
                TransferDate = GETDATE(),
                TransferReference = @TransferReference,
                Memo = @Memo,
                UpdatedAt = GETDATE(),
                CompletedAt = GETDATE()
            WHERE Id = @SettlementId;
        END
        ELSE
        BEGIN
            UPDATE [dbo].[VendorSettlements]
            SET 
                Status = @Status,
                Memo = @Memo,
                UpdatedAt = GETDATE()
            WHERE Id = @SettlementId;
        END
        
        -- 상태 변경 이력 기록
        INSERT INTO [dbo].[VendorHistories]
        (
            [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
        )
        VALUES
        (
            @VendorId, 'settlement_status_change', @OldStatus, @Status, 
            N'정산 상태 변경: ' + @OldStatus + N' → ' + @Status + 
            CASE WHEN @Status = 'completed' THEN N', 이체 번호: ' + ISNULL(@TransferReference, N'없음') ELSE N'' END,
            @UpdatedBy
        );
        
        COMMIT TRANSACTION;
        
        -- 업데이트된 정산 정보 반환
        SELECT * FROM [dbo].[VendorSettlements] WHERE Id = @SettlementId;
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

-- 정산 목록 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetVendorSettlements]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetVendorSettlements]
GO

CREATE PROCEDURE [dbo].[sp_GetVendorSettlements]
    @VendorId VARCHAR(36) = NULL,
    @Status VARCHAR(20) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- 전체 레코드 수 계산
    SELECT COUNT(*) AS TotalCount
    FROM [dbo].[VendorSettlements] s
    LEFT JOIN [dbo].[Vendors] v ON s.VendorId = v.Id
    WHERE 
        (@VendorId IS NULL OR s.VendorId = @VendorId)
        AND (@Status IS NULL OR s.Status = @Status)
        AND (@StartDate IS NULL OR s.SettlementDate >= @StartDate)
        AND (@EndDate IS NULL OR s.SettlementDate <= @EndDate);
    
    -- 페이지네이션 적용하여 데이터 조회
    SELECT 
        s.Id,
        s.VendorId,
        v.VendorName,
        s.SettlementDate,
        s.StartDate,
        s.EndDate,
        s.TotalAmount,
        s.TotalFee,
        s.NetAmount,
        s.TransactionCount,
        s.Status,
        s.BankCode,
        s.BankName,
        s.AccountNumber,
        s.AccountHolder,
        s.TransferDate,
        s.TransferReference,
        s.Memo,
        s.CreatedAt,
        s.UpdatedAt,
        s.CompletedAt
    FROM [dbo].[VendorSettlements] s
    LEFT JOIN [dbo].[Vendors] v ON s.VendorId = v.Id
    WHERE 
        (@VendorId IS NULL OR s.VendorId = @VendorId)
        AND (@Status IS NULL OR s.Status = @Status)
        AND (@StartDate IS NULL OR s.SettlementDate >= @StartDate)
        AND (@EndDate IS NULL OR s.SettlementDate <= @EndDate)
    ORDER BY s.SettlementDate DESC, s.CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- 정산 상세 정보 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetSettlementDetails]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetSettlementDetails]
GO

CREATE PROCEDURE [dbo].[sp_GetSettlementDetails]
    @SettlementId VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 정산 기본 정보 조회
    SELECT 
        s.*,
        v.VendorName
    FROM [dbo].[VendorSettlements] s
    JOIN [dbo].[Vendors] v ON s.VendorId = v.Id
    WHERE s.Id = @SettlementId;
    
    -- 정산 상세 거래 내역 조회
    SELECT 
        sd.*,
        t.OrderId,
        t.CustomerName,
        t.CustomerEmail
    FROM [dbo].[VendorSettlementDetails] sd
    JOIN [dbo].[Transactions] t ON sd.TransactionId = t.Id
    WHERE sd.SettlementId = @SettlementId
    ORDER BY sd.TransactionDate DESC;
END
GO
