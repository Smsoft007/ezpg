-- 입금 거래 관련 저장 프로시저

-- 입금 거래 생성 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateDepositTransaction]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_CreateDepositTransaction]
GO

CREATE PROCEDURE [dbo].[sp_CreateDepositTransaction]
    @TransactionId NVARCHAR(50),
    @MerchantId NVARCHAR(50),
    @Amount DECIMAL(18, 2),
    @Currency NVARCHAR(3) = 'KRW',
    @PaymentMethod NVARCHAR(20),
    @Depositor NVARCHAR(100) = NULL,
    @AccountNumber NVARCHAR(50) = NULL,
    @VirtualAccountId NVARCHAR(50) = NULL,
    @CustomerName NVARCHAR(100) = NULL,
    @CustomerEmail NVARCHAR(100) = NULL,
    @CustomerPhone NVARCHAR(20) = NULL,
    @Description NVARCHAR(500) = NULL,
    @ExternalId NVARCHAR(50) = NULL,
    @DepositMethod NVARCHAR(50) = NULL,
    @ReceiptUrl NVARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @CurrentDateTime DATETIME = GETDATE();
    DECLARE @Status NVARCHAR(20) = 'completed';
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
           ,'deposit'
           ,@Currency
           ,@CurrentDateTime
           ,@CurrentDateTime
           ,@CustomerName
           ,@CustomerEmail
           ,@CustomerPhone
           ,@Description
           ,@ExternalId);
        
        -- 입금 거래 세부 정보 삽입
        INSERT INTO [dbo].[DepositTransactions]
           ([TransactionId]
           ,[AccountNumber]
           ,[Depositor]
           ,[VirtualAccountId]
           ,[DepositedAt]
           ,[DepositMethod]
           ,[ReceiptUrl])
        VALUES
           (@TransactionId
           ,@AccountNumber
           ,@Depositor
           ,@VirtualAccountId
           ,@CurrentDateTime
           ,@DepositMethod
           ,@ReceiptUrl);
        
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
           ,'입금 거래가 생성되었습니다.'
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
            dt.[AccountNumber],
            dt.[Depositor],
            dt.[VirtualAccountId],
            dt.[DepositedAt],
            dt.[DepositMethod],
            dt.[ReceiptUrl]
        FROM [dbo].[Transactions] t
        INNER JOIN [dbo].[DepositTransactions] dt ON t.[TransactionId] = dt.[TransactionId]
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

-- 입금 거래 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetDepositTransactionById]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_GetDepositTransactionById]
GO

CREATE PROCEDURE [dbo].[sp_GetDepositTransactionById]
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
        dt.[AccountNumber],
        dt.[Depositor],
        dt.[VirtualAccountId],
        dt.[DepositedAt],
        dt.[DepositMethod],
        dt.[ReceiptUrl]
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[DepositTransactions] dt ON t.[TransactionId] = dt.[TransactionId]
    WHERE t.[TransactionId] = @TransactionId;
END
GO

-- 입금 거래 목록 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetDepositTransactions]') AND type in (N'P'))
    DROP PROCEDURE [dbo].[sp_GetDepositTransactions]
GO

CREATE PROCEDURE [dbo].[sp_GetDepositTransactions]
    @MerchantId NVARCHAR(50) = NULL,
    @Status NVARCHAR(20) = NULL,
    @PaymentMethod NVARCHAR(20) = NULL,
    @MinAmount DECIMAL(18, 2) = NULL,
    @MaxAmount DECIMAL(18, 2) = NULL,
    @DateFrom DATETIME = NULL,
    @DateTo DATETIME = NULL,
    @Search NVARCHAR(100) = NULL,
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
    INNER JOIN [dbo].[DepositTransactions] dt ON t.[TransactionId] = dt.[TransactionId]
    WHERE t.[Type] = 'deposit'
        AND (@MerchantId IS NULL OR t.[MerchantId] = @MerchantId)
        AND (@Status IS NULL OR t.[Status] = @Status)
        AND (@PaymentMethod IS NULL OR t.[PaymentMethod] = @PaymentMethod)
        AND (@MinAmount IS NULL OR t.[Amount] >= @MinAmount)
        AND (@MaxAmount IS NULL OR t.[Amount] <= @MaxAmount)
        AND (@DateFrom IS NULL OR t.[CreatedAt] >= @DateFrom)
        AND (@DateTo IS NULL OR t.[CreatedAt] <= @DateTo)
        AND (@Search IS NULL OR 
             t.[TransactionId] LIKE '%' + @Search + '%' OR
             t.[CustomerName] LIKE '%' + @Search + '%' OR
             t.[CustomerEmail] LIKE '%' + @Search + '%' OR
             dt.[Depositor] LIKE '%' + @Search + '%');
    
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
        dt.[AccountNumber],
        dt.[Depositor],
        dt.[VirtualAccountId],
        dt.[DepositedAt],
        dt.[DepositMethod],
        dt.[ReceiptUrl],
        @TotalItems AS TotalItems,
        CEILING(@TotalItems * 1.0 / @PageSize) AS TotalPages,
        @Page AS CurrentPage,
        @PageSize AS PageSize
    FROM [dbo].[Transactions] t
    INNER JOIN [dbo].[DepositTransactions] dt ON t.[TransactionId] = dt.[TransactionId]
    WHERE t.[Type] = 'deposit'
        AND (@MerchantId IS NULL OR t.[MerchantId] = @MerchantId)
        AND (@Status IS NULL OR t.[Status] = @Status)
        AND (@PaymentMethod IS NULL OR t.[PaymentMethod] = @PaymentMethod)
        AND (@MinAmount IS NULL OR t.[Amount] >= @MinAmount)
        AND (@MaxAmount IS NULL OR t.[Amount] <= @MaxAmount)
        AND (@DateFrom IS NULL OR t.[CreatedAt] >= @DateFrom)
        AND (@DateTo IS NULL OR t.[CreatedAt] <= @DateTo)
        AND (@Search IS NULL OR 
             t.[TransactionId] LIKE '%' + @Search + '%' OR
             t.[CustomerName] LIKE '%' + @Search + '%' OR
             t.[CustomerEmail] LIKE '%' + @Search + '%' OR
             dt.[Depositor] LIKE '%' + @Search + '%')
    ORDER BY t.[CreatedAt] DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
