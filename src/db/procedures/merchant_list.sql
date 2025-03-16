/**
 * 가맹점 목록 및 상세 조회 관련 저장 프로시저
 */

-- 테이블이 없는 경우 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Merchants')
BEGIN
    CREATE TABLE Merchants (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        BusinessNumber NVARCHAR(20) NOT NULL,
        RepresentativeName NVARCHAR(50) NOT NULL,
        Status NVARCHAR(20) DEFAULT 'pending' NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        Phone NVARCHAR(20) NOT NULL,
        ZipCode NVARCHAR(10) NOT NULL,
        Address1 NVARCHAR(200) NOT NULL,
        Address2 NVARCHAR(200) NULL,
        BankName NVARCHAR(50) NOT NULL,
        AccountNumber NVARCHAR(50) NOT NULL,
        AccountHolder NVARCHAR(50) NOT NULL,
        PaymentFeeRate DECIMAL(5,2) DEFAULT 3.5 NOT NULL,
        WithdrawalFee DECIMAL(10,2) DEFAULT 1000 NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
        UpdatedAt DATETIME DEFAULT GETDATE() NOT NULL
    );
    
    -- 샘플 데이터 추가
    INSERT INTO Merchants (
        Name,
        BusinessNumber,
        RepresentativeName,
        Status,
        Email,
        Phone,
        ZipCode,
        Address1,
        Address2,
        BankName,
        AccountNumber,
        AccountHolder,
        PaymentFeeRate,
        WithdrawalFee
    ) VALUES 
    ('스마일벤딩', '123-45-67890', '김철수', 'active', 'smile@example.com', '02-1234-5678', '12345', '서울시 강남구', '테헤란로 123', '국민은행', '123-456-789012', '김철수', 3.5, 1000),
    ('해피페이', '234-56-78901', '이영희', 'active', 'happy@example.com', '02-2345-6789', '23456', '서울시 서초구', '반포대로 234', '신한은행', '234-567-890123', '이영희', 3.2, 800),
    ('원더판매', '345-67-89012', '박지민', 'inactive', 'wonder@example.com', '02-3456-7890', '34567', '서울시 마포구', '홍대로 345', '우리은행', '345-678-901234', '박지민', 3.8, 1200),
    ('드림샵', '456-78-90123', '최동욱', 'pending', 'dream@example.com', '02-4567-8901', '45678', '서울시 용산구', '이태원로 456', '하나은행', '456-789-012345', '최동욱', 3.3, 900);
END
GO

-- 가맹점 목록 조회 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetMerchantList')
    DROP PROCEDURE sp_GetMerchantList
GO

CREATE PROCEDURE sp_GetMerchantList
    @Name NVARCHAR(100) = NULL,
    @BusinessNumber NVARCHAR(20) = NULL,
    @Status NVARCHAR(20) = NULL,
    @Page INT = 1,
    @PageSize INT = 10,
    @SortColumn NVARCHAR(50) = 'Id',
    @SortOrder NVARCHAR(4) = 'ASC'
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 페이지네이션 변수
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    DECLARE @TotalCount INT;
    DECLARE @TotalPages INT;
    
    -- 기본 쿼리 생성
    DECLARE @SQL NVARCHAR(MAX) = N'
        WITH MerchantsCTE AS (
            SELECT *
            FROM Merchants
            WHERE 1=1';
    
    -- 조건절 추가
    IF @Name IS NOT NULL AND @Name <> ''
        SET @SQL = @SQL + N' AND Name LIKE ''%'' + @Name + ''%''';
    
    IF @BusinessNumber IS NOT NULL AND @BusinessNumber <> ''
        SET @SQL = @SQL + N' AND BusinessNumber LIKE ''%'' + @BusinessNumber + ''%''';
    
    IF @Status IS NOT NULL AND @Status <> ''
        SET @SQL = @SQL + N' AND Status = @Status';
    
    -- 총 레코드 수 조회
    DECLARE @CountSQL NVARCHAR(MAX) = N'
        SELECT @TotalCount = COUNT(*)
        FROM (' + @SQL + N') AS CountQuery';
    
    EXEC sp_executesql @CountSQL, 
        N'@Name NVARCHAR(100), @BusinessNumber NVARCHAR(20), @Status NVARCHAR(20), @TotalCount INT OUTPUT',
        @Name, @BusinessNumber, @Status, @TotalCount OUTPUT;
    
    -- 총 페이지 수 계산
    SET @TotalPages = CEILING(CAST(@TotalCount AS FLOAT) / @PageSize);
    
    -- 정렬 및 페이지네이션 적용
    SET @SQL = @SQL + N')
        SELECT 
            Id,
            Name,
            BusinessNumber,
            RepresentativeName,
            Status,
            Email,
            Phone,
            ZipCode,
            Address1,
            Address2,
            BankName,
            AccountNumber,
            AccountHolder,
            PaymentFeeRate,
            WithdrawalFee,
            CreatedAt,
            UpdatedAt,
            ' + CAST(@TotalCount AS NVARCHAR(10)) + N' AS TotalCount,
            ' + CAST(@TotalPages AS NVARCHAR(10)) + N' AS TotalPages
        FROM MerchantsCTE
        ORDER BY ' + QUOTENAME(@SortColumn) + N' ' + @SortOrder + N'
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY;';
    
    -- 최종 쿼리 실행
    EXEC sp_executesql @SQL, 
        N'@Name NVARCHAR(100), @BusinessNumber NVARCHAR(20), @Status NVARCHAR(20), @Offset INT, @PageSize INT',
        @Name, @BusinessNumber, @Status, @Offset, @PageSize;
END
GO

-- 가맹점 상세 조회 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetMerchantById')
    DROP PROCEDURE sp_GetMerchantById
GO

CREATE PROCEDURE sp_GetMerchantById
    @MerchantId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id,
        Name,
        BusinessNumber,
        RepresentativeName,
        Status,
        Email,
        Phone,
        ZipCode,
        Address1,
        Address2,
        BankName,
        AccountNumber,
        AccountHolder,
        PaymentFeeRate,
        WithdrawalFee,
        CreatedAt,
        UpdatedAt
    FROM Merchants
    WHERE Id = @MerchantId;
END
GO
