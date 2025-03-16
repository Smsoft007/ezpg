-- =============================================
-- 데이터베이스 마스터 스크립트
-- 모든 테이블과 프로시저를 순차적으로 삭제하고 재생성
-- =============================================

USE [EZPG]
GO

PRINT '마스터 스크립트 실행 시작'
GO

-- =============================================
-- 1. 모든 외래 키 제약 조건 삭제
-- =============================================
PRINT '1. 모든 외래 키 제약 조건 삭제 중...'
GO

DECLARE @dropFKConstraints NVARCHAR(MAX) = N'';

SELECT @dropFKConstraints = @dropFKConstraints + N'
ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys;

IF LEN(@dropFKConstraints) > 0
BEGIN
    EXEC sp_executesql @dropFKConstraints;
    PRINT '외래 키 제약 조건 삭제 완료'
END
ELSE
BEGIN
    PRINT '삭제할 외래 키 제약 조건이 없습니다.'
END
GO

-- =============================================
-- 2. 모든 저장 프로시저 삭제
-- =============================================
PRINT '2. 모든 저장 프로시저 삭제 중...'
GO

DECLARE @dropProcedures NVARCHAR(MAX) = N'';

SELECT @dropProcedures = @dropProcedures + N'
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N''[' + SCHEMA_NAME(schema_id) + '].[' + name + ']'') AND type in (N''P'', N''PC''))
    DROP PROCEDURE [' + SCHEMA_NAME(schema_id) + '].[' + name + '];'
FROM sys.procedures
WHERE SCHEMA_NAME(schema_id) = 'dbo';

IF LEN(@dropProcedures) > 0
BEGIN
    EXEC sp_executesql @dropProcedures;
    PRINT '저장 프로시저 삭제 완료'
END
ELSE
BEGIN
    PRINT '삭제할 저장 프로시저가 없습니다.'
END
GO

-- =============================================
-- 3. 테이블 삭제 (의존성 역순)
-- =============================================
PRINT '3. 테이블 삭제 중...'
GO

-- 결제 로그 테이블 삭제
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PaymentLogs]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[PaymentLogs];
    PRINT '[dbo].[PaymentLogs] 테이블 삭제 완료'
END
GO

-- 환불 내역 테이블 삭제
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RefundHistory]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[RefundHistory];
    PRINT '[dbo].[RefundHistory] 테이블 삭제 완료'
END
GO

-- 거래 테이블 삭제
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Transactions]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[Transactions];
    PRINT '[dbo].[Transactions] 테이블 삭제 완료'
END
GO

-- 가맹점 계좌 정보 테이블 삭제
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorBankAccounts]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[VendorBankAccounts];
    PRINT '[dbo].[VendorBankAccounts] 테이블 삭제 완료'
END
GO

-- 가맹점 API 키 테이블 삭제
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorApiKeys]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[VendorApiKeys];
    PRINT '[dbo].[VendorApiKeys] 테이블 삭제 완료'
END
GO

-- 가맹점 담당자 테이블 삭제
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[VendorContacts]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[VendorContacts];
    PRINT '[dbo].[VendorContacts] 테이블 삭제 완료'
END
GO

-- 가맹점 테이블 삭제
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Vendors]') AND type in (N'U'))
BEGIN
    DROP TABLE [dbo].[Vendors];
    PRINT '[dbo].[Vendors] 테이블 삭제 완료'
END
GO

-- =============================================
-- 4. 테이블 생성 (의존성 순서)
-- =============================================
PRINT '4. 테이블 생성 중...'
GO

-- 가맹점 테이블 생성
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
PRINT '[dbo].[Vendors] 테이블 생성 완료'
GO

-- 가맹점 담당자 테이블 생성
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
PRINT '[dbo].[VendorContacts] 테이블 생성 완료'
GO

-- 가맹점 API 키 테이블 생성
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
PRINT '[dbo].[VendorApiKeys] 테이블 생성 완료'
GO

-- 가맹점 계좌 정보 테이블 생성
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
PRINT '[dbo].[VendorBankAccounts] 테이블 생성 완료'
GO

-- 거래 테이블 생성
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
PRINT '[dbo].[Transactions] 테이블 생성 완료'
GO

-- 환불 내역 테이블 생성
CREATE TABLE [dbo].[RefundHistory] (
    [Id] VARCHAR(36) PRIMARY KEY,
    [TransactionId] VARCHAR(36) NOT NULL,
    [Amount] DECIMAL(18, 2) NOT NULL,
    [Reason] NVARCHAR(500),
    [CreatedAt] DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [FK_RefundHistory_Transactions] FOREIGN KEY ([TransactionId]) REFERENCES [dbo].[Transactions] ([Id])
);
    
CREATE INDEX [IX_RefundHistory_TransactionId] ON [dbo].[RefundHistory]([TransactionId]);
PRINT '[dbo].[RefundHistory] 테이블 생성 완료'
GO

-- 결제 로그 테이블 생성
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
PRINT '[dbo].[PaymentLogs] 테이블 생성 완료'
GO

PRINT '모든 테이블 생성 완료'
GO

-- =============================================
-- 5. 저장 프로시저 생성
-- =============================================
PRINT '5. 저장 프로시저 생성 중...'
GO

-- 가맹점 관련 저장 프로시저
-- =============================================

-- 가맹점 생성 프로시저
CREATE PROCEDURE [dbo].[sp_CreateVendor]
    @Id VARCHAR(36),
    @Name NVARCHAR(100),
    @BusinessNumber VARCHAR(20),
    @RepresentativeName NVARCHAR(50),
    @Address NVARCHAR(200) = NULL,
    @PhoneNumber VARCHAR(20) = NULL,
    @Email VARCHAR(100) = NULL,
    @Status VARCHAR(20) = 'active'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        INSERT INTO [dbo].[Vendors]
        (
            [Id], [Name], [BusinessNumber], [RepresentativeName], 
            [Address], [PhoneNumber], [Email], [Status]
        )
        VALUES
        (
            @Id, @Name, @BusinessNumber, @RepresentativeName, 
            @Address, @PhoneNumber, @Email, @Status
        );
        
        COMMIT TRANSACTION;
        
        SELECT * FROM [dbo].[Vendors] WHERE Id = @Id;
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

-- 가맹점 목록 조회 프로시저
CREATE PROCEDURE [dbo].[sp_GetVendorList]
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @Status VARCHAR(20) = NULL,
    @SearchTerm NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- 전체 레코드 수 계산
    SELECT COUNT(*) AS TotalCount
    FROM [dbo].[Vendors]
    WHERE 
        (@Status IS NULL OR Status = @Status)
        AND (@SearchTerm IS NULL OR 
            Name LIKE '%' + @SearchTerm + '%' OR 
            BusinessNumber LIKE '%' + @SearchTerm + '%' OR
            RepresentativeName LIKE '%' + @SearchTerm + '%')
    
    -- 페이지네이션 적용하여 데이터 조회
    SELECT 
        v.*,
        (SELECT COUNT(*) FROM [dbo].[Transactions] WHERE VendorId = v.Id) AS TransactionCount
    FROM [dbo].[Vendors] v
    WHERE 
        (@Status IS NULL OR v.Status = @Status)
        AND (@SearchTerm IS NULL OR 
            v.Name LIKE '%' + @SearchTerm + '%' OR 
            v.BusinessNumber LIKE '%' + @SearchTerm + '%' OR
            v.RepresentativeName LIKE '%' + @SearchTerm + '%')
    ORDER BY v.CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- 가맹점 상세 조회 프로시저
CREATE PROCEDURE [dbo].[sp_GetVendorById]
    @VendorId VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 가맹점 기본 정보 조회
    SELECT *
    FROM [dbo].[Vendors]
    WHERE Id = @VendorId;
    
    -- 가맹점 담당자 정보 조회
    SELECT *
    FROM [dbo].[VendorContacts]
    WHERE VendorId = @VendorId
    ORDER BY IsPrimary DESC, CreatedAt ASC;
    
    -- 가맹점 API 키 정보 조회
    SELECT *
    FROM [dbo].[VendorApiKeys]
    WHERE VendorId = @VendorId
    ORDER BY CreatedAt DESC;
    
    -- 가맹점 계좌 정보 조회
    SELECT *
    FROM [dbo].[VendorBankAccounts]
    WHERE VendorId = @VendorId
    ORDER BY IsPrimary DESC, CreatedAt ASC;
    
    -- 가맹점 거래 통계 조회
    SELECT
        COUNT(*) AS TotalTransactions,
        SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) AS CompletedTransactions,
        SUM(CASE WHEN Status = 'completed' THEN Amount ELSE 0 END) AS TotalAmount,
        SUM(Fee) AS TotalFee
    FROM [dbo].[Transactions]
    WHERE VendorId = @VendorId;
END
GO

-- 거래 관련 저장 프로시저
-- =============================================

-- 거래 목록 조회 프로시저
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

-- 거래 상세 조회 프로시저
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

-- 거래 통계 조회 프로시저
CREATE PROCEDURE [dbo].[sp_GetTransactionStats]
    @VendorId VARCHAR(36) = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 기본값 설정
    SET @StartDate = ISNULL(@StartDate, DATEADD(DAY, -30, GETDATE()));
    SET @EndDate = ISNULL(@EndDate, GETDATE());
    
    -- 요약 통계 조회
    SELECT
        COUNT(*) AS TotalCount,
        SUM(Amount) AS TotalAmount,
        SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) AS CompletedCount,
        SUM(CASE WHEN Status = 'completed' THEN Amount ELSE 0 END) AS CompletedAmount,
        SUM(CASE WHEN Status IN ('canceled', 'refunded', 'partial_refunded') THEN 1 ELSE 0 END) AS CanceledCount,
        SUM(CASE WHEN Status IN ('canceled', 'refunded', 'partial_refunded') THEN Amount ELSE 0 END) AS CanceledAmount,
        SUM(CASE WHEN Status = 'pending' THEN 1 ELSE 0 END) AS PendingCount,
        SUM(CASE WHEN Status = 'pending' THEN Amount ELSE 0 END) AS PendingAmount
    FROM
        [dbo].[Transactions]
    WHERE
        (@VendorId IS NULL OR VendorId = @VendorId)
        AND CreatedAt >= @StartDate
        AND CreatedAt <= @EndDate;
    
    -- 일별 통계 조회
    SELECT
        CONVERT(DATE, CreatedAt) AS [Date],
        COUNT(*) AS [Count],
        SUM(Amount) AS Amount
    FROM
        [dbo].[Transactions]
    WHERE
        (@VendorId IS NULL OR VendorId = @VendorId)
        AND CreatedAt >= @StartDate
        AND CreatedAt <= @EndDate
    GROUP BY CONVERT(DATE, CreatedAt)
    ORDER BY [Date];
    
    -- 결제 방법별 통계 조회
    SELECT
        PaymentMethod,
        COUNT(*) AS [Count],
        SUM(Amount) AS Amount
    FROM
        [dbo].[Transactions]
    WHERE
        (@VendorId IS NULL OR VendorId = @VendorId)
        AND CreatedAt >= @StartDate
        AND CreatedAt <= @EndDate
    GROUP BY PaymentMethod
    ORDER BY [Count] DESC;
END
GO

PRINT '모든 저장 프로시저 생성 완료'
GO

-- =============================================
-- 마스터 스크립트 실행 완료
-- =============================================
PRINT '마스터 스크립트 실행 완료'
GO
