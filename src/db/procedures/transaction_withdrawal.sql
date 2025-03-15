-- 출금 거래 관련 저장 프로시저

-- 출금 거래 생성 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateWithdrawalTransaction]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_CreateWithdrawalTransaction]
GO

CREATE PROCEDURE [dbo].[sp_CreateWithdrawalTransaction]
    @TransactionId NVARCHAR(50),
    @MerchantId NVARCHAR(50),
    @Amount DECIMAL(18, 2),
    @Currency NVARCHAR(3) = 'KRW',
    @PaymentMethod NVARCHAR(20) = 'bank',
    @BankCode NVARCHAR(10),
    @AccountNumber NVARCHAR(50),
    @AccountHolder NVARCHAR(100),
    @WithdrawalFee DECIMAL(18, 2) = 0,
    @CustomerName NVARCHAR(100) = NULL,
    @CustomerEmail NVARCHAR(100) = NULL,
    @CustomerPhone NVARCHAR(20) = NULL,
    @Description NVARCHAR(500) = NULL,
    @ExternalId NVARCHAR(50) = NULL,
    @WithdrawalMethod NVARCHAR(50) = NULL,
    @WithdrawalReference NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentDateTime DATETIME = GETDATE();
    DECLARE @Status NVARCHAR(20) = 'pending';
    DECLARE @ApprovalStatus NVARCHAR(20) = 'pending';
    DECLARE @LogId NVARCHAR(50) = NEWID();
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 기본 거래 정보 삽입
        INSERT INTO [dbo].[Transactions]
           ([TransactionId]
           ,[MerchantId]
           ,[Amount]
           ,[Status]
           ,[PaymentMethod]
           ,[Type]
           ,[Currency]
           ,[CreatedAt]
           ,[UpdatedAt]
           ,[CustomerName]
           ,[CustomerEmail]
           ,[CustomerPhone]
           ,[Description]
           ,[ExternalId])
        VALUES
           (@TransactionId
           ,@MerchantId
           ,@Amount
           ,@Status
           ,@PaymentMethod
           ,'withdrawal'
           ,@Currency
           ,@CurrentDateTime
           ,@CurrentDateTime
           ,@CustomerName
           ,@CustomerEmail
           ,@CustomerPhone
           ,@Description
           ,@ExternalId);
        
        -- 출금 거래 세부 정보 삽입
        INSERT INTO [dbo].[WithdrawalTransactions]
           ([TransactionId]
           ,[BankCode]
           ,[AccountNumber]
           ,[AccountHolder]
           ,[WithdrawalFee]
           ,[ApprovalStatus]
           ,[WithdrawalMethod]
           ,[WithdrawalReference])
        VALUES
           (@TransactionId
           ,@BankCode
           ,@AccountNumber
           ,@AccountHolder
           ,@WithdrawalFee
           ,@ApprovalStatus
           ,@WithdrawalMethod
           ,@WithdrawalReference);
        
        -- 거래 로그 기록
        INSERT INTO [dbo].[TransactionLogs]
           ([LogId]
           ,[TransactionId]
           ,[Action]
           ,[Status]
           ,[Message]
           ,[Timestamp])
        VALUES
           (@LogId
           ,@TransactionId
           ,'create'
           ,@Status
           ,'출금 거래가 생성되었습니다.'
           ,@CurrentDateTime);
        
        COMMIT TRANSACTION;
        
        -- 생성된 거래 정보 반환
        SELECT 
            t.[TransactionId],
            t.[MerchantId],
            t.[Amount],
            t.[Status],
            t.[PaymentMethod],
            t.[Type],
            t.[Currency],
            t.[CreatedAt],
            t.[UpdatedAt],
            t.[CustomerName],
            t.[CustomerEmail],
            t.[CustomerPhone],
            t.[Description],
            t.[ExternalId],
            wt.[BankCode],
            wt.[AccountNumber],
            wt.[AccountHolder],
            wt.[WithdrawalFee],
            wt.[ApprovalStatus],
            wt.[ApprovedBy],
            wt.[ApprovedAt],
            wt.[WithdrawalMethod],
            wt.[WithdrawalReference]
        FROM [dbo].[Transactions] t
        INNER JOIN [dbo].[WithdrawalTransactions] wt ON t.[TransactionId] = wt.[TransactionId]
        WHERE t.[TransactionId] = @TransactionId;
        
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

-- 출금 거래 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetWithdrawalTransactionById]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_GetWithdrawalTransactionById]
GO

CREATE PROCEDURE [dbo].[sp_GetWithdrawalTransactionById]
    @TransactionId NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        t.[TransactionId],
        t.[MerchantId],
        t.[Amount],
        t.[Status],
        t.[PaymentMethod],
        t.[Type],
        t.[Currency],
        t.[CreatedAt],
        t.[UpdatedAt],
        t.[CustomerName],
        t.[CustomerEmail],
        t.[CustomerPhone],
        t.[Description],
        t.[ExternalId],
        t.[FailureReason],
        t.[FailureCode],
        wt.[BankCode],
        wt.[AccountNumber],
        wt.[AccountHolder],
        wt.[WithdrawalFee],
        wt.[ApprovalStatus],
        wt.[ApprovedBy],
        wt.[ApprovedAt],
        wt.[WithdrawalMethod],
        wt.[WithdrawalReference]
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[WithdrawalTransactions] wt ON t.[TransactionId] = wt.[TransactionId]
    WHERE t.[TransactionId] = @TransactionId;
END
GO

-- 출금 거래 목록 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetWithdrawalTransactions]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_GetWithdrawalTransactions]
GO

CREATE PROCEDURE [dbo].[sp_GetWithdrawalTransactions]
    @MerchantId NVARCHAR(50) = NULL,
    @Status NVARCHAR(20) = NULL,
    @ApprovalStatus NVARCHAR(20) = NULL,
    @PaymentMethod NVARCHAR(20) = NULL,
    @MinAmount DECIMAL(18, 2) = NULL,
    @MaxAmount DECIMAL(18, 2) = NULL,
    @DateFrom DATETIME = NULL,
    @DateTo DATETIME = NULL,
    @Search NVARCHAR(100) = NULL,
    @BankCode NVARCHAR(10) = NULL,
    @Page INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    DECLARE @TotalItems INT;
    
    -- 총 항목 수 계산
    SELECT @TotalItems = COUNT(t.[TransactionId])
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[WithdrawalTransactions] wt ON t.[TransactionId] = wt.[TransactionId]
    WHERE t.[Type] = 'withdrawal'
        AND (@MerchantId IS NULL OR t.[MerchantId] = @MerchantId)
        AND (@Status IS NULL OR t.[Status] = @Status)
        AND (@ApprovalStatus IS NULL OR wt.[ApprovalStatus] = @ApprovalStatus)
        AND (@PaymentMethod IS NULL OR t.[PaymentMethod] = @PaymentMethod)
        AND (@MinAmount IS NULL OR t.[Amount] >= @MinAmount)
        AND (@MaxAmount IS NULL OR t.[Amount] <= @MaxAmount)
        AND (@DateFrom IS NULL OR t.[CreatedAt] >= @DateFrom)
        AND (@DateTo IS NULL OR t.[CreatedAt] <= @DateTo)
        AND (@BankCode IS NULL OR wt.[BankCode] = @BankCode)
        AND (@Search IS NULL OR 
             t.[TransactionId] LIKE '%' + @Search + '%' OR
             t.[CustomerName] LIKE '%' + @Search + '%' OR
             t.[CustomerEmail] LIKE '%' + @Search + '%' OR
             wt.[AccountHolder] LIKE '%' + @Search + '%' OR
             wt.[AccountNumber] LIKE '%' + @Search + '%');
    
    -- 페이지네이션된 결과 반환
    SELECT 
        t.[TransactionId],
        t.[MerchantId],
        t.[Amount],
        t.[Status],
        t.[PaymentMethod],
        t.[Type],
        t.[Currency],
        t.[CreatedAt],
        t.[UpdatedAt],
        t.[CustomerName],
        t.[CustomerEmail],
        t.[CustomerPhone],
        t.[Description],
        t.[ExternalId],
        t.[FailureReason],
        t.[FailureCode],
        wt.[BankCode],
        wt.[AccountNumber],
        wt.[AccountHolder],
        wt.[WithdrawalFee],
        wt.[ApprovalStatus],
        wt.[ApprovedBy],
        wt.[ApprovedAt],
        wt.[WithdrawalMethod],
        wt.[WithdrawalReference],
        @TotalItems AS TotalItems,
        CEILING(@TotalItems * 1.0 / @PageSize) AS TotalPages,
        @Page AS CurrentPage,
        @PageSize AS PageSize
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[WithdrawalTransactions] wt ON t.[TransactionId] = wt.[TransactionId]
    WHERE t.[Type] = 'withdrawal'
        AND (@MerchantId IS NULL OR t.[MerchantId] = @MerchantId)
        AND (@Status IS NULL OR t.[Status] = @Status)
        AND (@ApprovalStatus IS NULL OR wt.[ApprovalStatus] = @ApprovalStatus)
        AND (@PaymentMethod IS NULL OR t.[PaymentMethod] = @PaymentMethod)
        AND (@MinAmount IS NULL OR t.[Amount] >= @MinAmount)
        AND (@MaxAmount IS NULL OR t.[Amount] <= @MaxAmount)
        AND (@DateFrom IS NULL OR t.[CreatedAt] >= @DateFrom)
        AND (@DateTo IS NULL OR t.[CreatedAt] <= @DateTo)
        AND (@BankCode IS NULL OR wt.[BankCode] = @BankCode)
        AND (@Search IS NULL OR 
             t.[TransactionId] LIKE '%' + @Search + '%' OR
             t.[CustomerName] LIKE '%' + @Search + '%' OR
             t.[CustomerEmail] LIKE '%' + @Search + '%' OR
             wt.[AccountHolder] LIKE '%' + @Search + '%' OR
             wt.[AccountNumber] LIKE '%' + @Search + '%')
    ORDER BY t.[CreatedAt] DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- 출금 승인 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_ApproveWithdrawalTransaction]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_ApproveWithdrawalTransaction]
GO

CREATE PROCEDURE [dbo].[sp_ApproveWithdrawalTransaction]
    @TransactionId NVARCHAR(50),
    @ApprovedBy NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentDateTime DATETIME = GETDATE();
    DECLARE @LogId NVARCHAR(50) = NEWID();
    DECLARE @TransactionExists BIT = 0;
    DECLARE @CurrentStatus NVARCHAR(20);
    DECLARE @CurrentApprovalStatus NVARCHAR(20);
    
    -- 거래 존재 여부 및 상태 확인
    SELECT 
        @TransactionExists = 1,
        @CurrentStatus = t.[Status],
        @CurrentApprovalStatus = wt.[ApprovalStatus]
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[WithdrawalTransactions] wt ON t.[TransactionId] = wt.[TransactionId]
    WHERE t.[TransactionId] = @TransactionId AND t.[Type] = 'withdrawal';
    
    -- 거래가 존재하지 않는 경우
    IF @TransactionExists = 0
    BEGIN
        SELECT 'error' AS Result, '출금 거래를 찾을 수 없습니다.' AS Message;
        RETURN;
    END
    
    -- 이미 승인된 경우
    IF @CurrentApprovalStatus = 'approved'
    BEGIN
        SELECT 'error' AS Result, '이미 승인된 출금 거래입니다.' AS Message;
        RETURN;
    END
    
    -- 이미 거부된 경우
    IF @CurrentApprovalStatus = 'rejected'
    BEGIN
        SELECT 'error' AS Result, '이미 거부된 출금 거래입니다.' AS Message;
        RETURN;
    END
    
    -- 이미 취소된 경우
    IF @CurrentStatus = 'cancelled'
    BEGIN
        SELECT 'error' AS Result, '취소된 출금 거래는 승인할 수 없습니다.' AS Message;
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 출금 거래 승인 상태 업데이트
        UPDATE [dbo].[WithdrawalTransactions]
        SET [ApprovalStatus] = 'approved',
            [ApprovedBy] = @ApprovedBy,
            [ApprovedAt] = @CurrentDateTime
        WHERE [TransactionId] = @TransactionId;
        
        -- 거래 상태 업데이트 (대기 중 -> 완료)
        UPDATE [dbo].[Transactions]
        SET [Status] = 'completed',
            [UpdatedAt] = @CurrentDateTime
        WHERE [TransactionId] = @TransactionId;
        
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
           ,'approve'
           ,'completed'
           ,'출금 거래가 승인되었습니다.'
           ,@CurrentDateTime
           ,@ApprovedBy);
        
        COMMIT TRANSACTION;
        
        -- 성공 결과 반환
        SELECT 'success' AS Result, '출금 거래가 성공적으로 승인되었습니다.' AS Message;
        
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

-- 출금 거부 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_RejectWithdrawalTransaction]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_RejectWithdrawalTransaction]
GO

CREATE PROCEDURE [dbo].[sp_RejectWithdrawalTransaction]
    @TransactionId NVARCHAR(50),
    @RejectedBy NVARCHAR(50),
    @RejectReason NVARCHAR(500)
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentDateTime DATETIME = GETDATE();
    DECLARE @LogId NVARCHAR(50) = NEWID();
    DECLARE @TransactionExists BIT = 0;
    DECLARE @CurrentStatus NVARCHAR(20);
    DECLARE @CurrentApprovalStatus NVARCHAR(20);
    
    -- 거래 존재 여부 및 상태 확인
    SELECT 
        @TransactionExists = 1,
        @CurrentStatus = t.[Status],
        @CurrentApprovalStatus = wt.[ApprovalStatus]
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[WithdrawalTransactions] wt ON t.[TransactionId] = wt.[TransactionId]
    WHERE t.[TransactionId] = @TransactionId AND t.[Type] = 'withdrawal';
    
    -- 거래가 존재하지 않는 경우
    IF @TransactionExists = 0
    BEGIN
        SELECT 'error' AS Result, '출금 거래를 찾을 수 없습니다.' AS Message;
        RETURN;
    END
    
    -- 이미 승인된 경우
    IF @CurrentApprovalStatus = 'approved'
    BEGIN
        SELECT 'error' AS Result, '이미 승인된 출금 거래는 거부할 수 없습니다.' AS Message;
        RETURN;
    END
    
    -- 이미 거부된 경우
    IF @CurrentApprovalStatus = 'rejected'
    BEGIN
        SELECT 'error' AS Result, '이미 거부된 출금 거래입니다.' AS Message;
        RETURN;
    END
    
    -- 이미 취소된 경우
    IF @CurrentStatus = 'cancelled'
    BEGIN
        SELECT 'error' AS Result, '취소된 출금 거래는 거부할 수 없습니다.' AS Message;
        RETURN;
    END
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 출금 거래 승인 상태 업데이트
        UPDATE [dbo].[WithdrawalTransactions]
        SET [ApprovalStatus] = 'rejected',
            [ApprovedBy] = @RejectedBy,
            [ApprovedAt] = @CurrentDateTime
        WHERE [TransactionId] = @TransactionId;
        
        -- 거래 상태 업데이트 (대기 중 -> 실패)
        UPDATE [dbo].[Transactions]
        SET [Status] = 'failed',
            [UpdatedAt] = @CurrentDateTime,
            [FailureReason] = @RejectReason,
            [FailureCode] = 'REJECTED'
        WHERE [TransactionId] = @TransactionId;
        
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
           ,'reject'
           ,'failed'
           ,'출금 거래가 거부되었습니다.'
           ,@CurrentDateTime
           ,@RejectedBy
           ,JSON_QUERY('{"rejectReason": "' + @RejectReason + '"}'));
        
        COMMIT TRANSACTION;
        
        -- 성공 결과 반환
        SELECT 'success' AS Result, '출금 거래가 성공적으로 거부되었습니다.' AS Message;
        
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
