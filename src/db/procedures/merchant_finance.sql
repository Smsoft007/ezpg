/**
 * 가맹점 잔액 및 거래 내역 관련 저장 프로시저
 */

-- 가맹점 잔액 테이블이 없는 경우 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MerchantBalances')
BEGIN
    CREATE TABLE MerchantBalances (
        MerchantId INT PRIMARY KEY,
        Balance DECIMAL(18,2) DEFAULT 0 NOT NULL,
        AvailableBalance DECIMAL(18,2) DEFAULT 0 NOT NULL,
        PendingBalance DECIMAL(18,2) DEFAULT 0 NOT NULL,
        LastUpdated DATETIME DEFAULT GETDATE() NOT NULL,
        FOREIGN KEY (MerchantId) REFERENCES Merchants(Id)
    );
    
    -- 샘플 데이터 추가
    INSERT INTO MerchantBalances (MerchantId, Balance, AvailableBalance, PendingBalance)
    SELECT Id, 
           CAST(RAND(CHECKSUM(NEWID())) * 10000000 AS DECIMAL(18,2)), -- 임의의 잔액
           CAST(RAND(CHECKSUM(NEWID())) * 9000000 AS DECIMAL(18,2)),  -- 가용 잔액
           CAST(RAND(CHECKSUM(NEWID())) * 1000000 AS DECIMAL(18,2))   -- 대기 잔액
    FROM Merchants;
END
GO

-- 가맹점 거래 내역 테이블이 없는 경우 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MerchantTransactions')
BEGIN
    CREATE TABLE MerchantTransactions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MerchantId INT NOT NULL,
        Type NVARCHAR(20) NOT NULL, -- 'deposit' 또는 'withdrawal'
        Amount DECIMAL(18,2) NOT NULL,
        Fee DECIMAL(18,2) NOT NULL,
        Status NVARCHAR(20) NOT NULL, -- 'completed', 'pending' 또는 'failed'
        Comment NVARCHAR(200) NULL,
        CreatedAt DATETIME DEFAULT GETDATE() NOT NULL,
        CompletedAt DATETIME NULL,
        FOREIGN KEY (MerchantId) REFERENCES Merchants(Id)
    );
    
    -- 샘플 거래 데이터 추가
    DECLARE @MerchantCount INT;
    SELECT @MerchantCount = COUNT(*) FROM Merchants;
    
    DECLARE @i INT = 1;
    DECLARE @MerchantId INT;
    DECLARE @TransactionsPerMerchant INT = 10; -- 각 가맹점당 거래 수
    DECLARE @Type NVARCHAR(20);
    DECLARE @Amount DECIMAL(18,2);
    DECLARE @Fee DECIMAL(18,2);
    DECLARE @Status NVARCHAR(20);
    DECLARE @CreatedDate DATETIME;
    DECLARE @CompletedDate DATETIME;
    
    WHILE @i <= @MerchantCount
    BEGIN
        SELECT @MerchantId = Id FROM Merchants ORDER BY Id OFFSET @i-1 ROWS FETCH NEXT 1 ROWS ONLY;
        
        DECLARE @j INT = 1;
        WHILE @j <= @TransactionsPerMerchant
        BEGIN
            -- 랜덤 값 생성
            SET @Type = CASE WHEN RAND() > 0.5 THEN 'deposit' ELSE 'withdrawal' END;
            SET @Amount = CAST(RAND() * 1000000 AS DECIMAL(18,2));
            SET @Fee = CAST(RAND() * 10000 AS DECIMAL(18,2));
            SET @Status = CASE 
                WHEN RAND() < 0.7 THEN 'completed' 
                WHEN RAND() < 0.9 THEN 'pending' 
                ELSE 'failed' 
            END;
            SET @CreatedDate = DATEADD(DAY, -CAST(RAND() * 30 AS INT), GETDATE());
            
            IF @Status = 'completed'
                SET @CompletedDate = DATEADD(MINUTE, CAST(RAND() * 60 AS INT), @CreatedDate);
            ELSE
                SET @CompletedDate = NULL;
            
            -- 거래 추가
            INSERT INTO MerchantTransactions (
                MerchantId,
                Type,
                Amount,
                Fee,
                Status,
                Comment,
                CreatedAt,
                CompletedAt
            ) VALUES (
                @MerchantId,
                @Type,
                @Amount,
                @Fee,
                @Status,
                CASE @Type 
                    WHEN 'deposit' THEN '결제 입금' 
                    ELSE '출금 요청' 
                END + ' #' + CAST(@j AS NVARCHAR(10)),
                @CreatedDate,
                @CompletedDate
            );
            
            SET @j = @j + 1;
        END
        
        SET @i = @i + 1;
    END
END
GO

-- 가맹점 잔액 조회 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetMerchantBalance')
    DROP PROCEDURE sp_GetMerchantBalance
GO

CREATE PROCEDURE sp_GetMerchantBalance
    @MerchantId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 가맹점 존재 체크
    IF NOT EXISTS (SELECT 1 FROM Merchants WHERE Id = @MerchantId)
    BEGIN
        RAISERROR('해당 ID의 가맹점이 존재하지 않습니다.', 16, 1);
        RETURN;
    END
    
    -- 가맹점 잔액이 없는 경우 초기화
    IF NOT EXISTS (SELECT 1 FROM MerchantBalances WHERE MerchantId = @MerchantId)
    BEGIN
        INSERT INTO MerchantBalances (MerchantId, Balance, AvailableBalance, PendingBalance)
        VALUES (@MerchantId, 0, 0, 0);
    END
    
    -- 가맹점 잔액 조회
    SELECT 
        m.Id AS MerchantId,
        m.Name AS MerchantName,
        b.Balance,
        b.AvailableBalance,
        b.PendingBalance,
        b.LastUpdated
    FROM MerchantBalances b
    JOIN Merchants m ON b.MerchantId = m.Id
    WHERE b.MerchantId = @MerchantId;
END
GO

-- 가맹점 거래 내역 조회 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetMerchantTransactions')
    DROP PROCEDURE sp_GetMerchantTransactions
GO

CREATE PROCEDURE sp_GetMerchantTransactions
    @MerchantId INT,
    @Type NVARCHAR(20) = NULL,
    @Status NVARCHAR(20) = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @Page INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 페이지네이션 변수
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    DECLARE @TotalCount INT;
    
    -- 가맹점 존재 체크
    IF NOT EXISTS (SELECT 1 FROM Merchants WHERE Id = @MerchantId)
    BEGIN
        RAISERROR('해당 ID의 가맹점이 존재하지 않습니다.', 16, 1);
        RETURN;
    END
    
    -- 총 거래 수 조회
    SELECT @TotalCount = COUNT(*)
    FROM MerchantTransactions
    WHERE MerchantId = @MerchantId
      AND (@Type IS NULL OR Type = @Type)
      AND (@Status IS NULL OR Status = @Status)
      AND (@StartDate IS NULL OR CreatedAt >= @StartDate)
      AND (@EndDate IS NULL OR CreatedAt <= @EndDate);
    
    -- 총 페이지 수 계산
    DECLARE @TotalPages INT = CEILING(CAST(@TotalCount AS FLOAT) / @PageSize);
    
    -- 거래 내역 조회
    SELECT 
        Id,
        MerchantId,
        Type,
        Amount,
        Fee,
        Status,
        Comment,
        CreatedAt,
        CompletedAt,
        @TotalCount AS TotalCount,
        @TotalPages AS TotalPages
    FROM MerchantTransactions
    WHERE MerchantId = @MerchantId
      AND (@Type IS NULL OR Type = @Type)
      AND (@Status IS NULL OR Status = @Status)
      AND (@StartDate IS NULL OR CreatedAt >= @StartDate)
      AND (@EndDate IS NULL OR CreatedAt <= @EndDate)
    ORDER BY CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
