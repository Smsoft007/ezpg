/*
 * 가맹점 관리 시스템 저장 프로시저
 * 
 * 데이터베이스: EZPG
 * 서버: 137.194.125.213
 * 포트: 49987
 */

-- 가맹점 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Merchants')
BEGIN
    CREATE TABLE Merchants (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        BusinessNumber NVARCHAR(20) NOT NULL,
        RepresentativeName NVARCHAR(50) NOT NULL,
        Status NVARCHAR(20) NOT NULL CHECK (Status IN ('active', 'inactive', 'pending')),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME DEFAULT GETDATE()
    );
END;

-- 가맹점 연락처 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MerchantContacts')
BEGIN
    CREATE TABLE MerchantContacts (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MerchantId INT NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        Phone NVARCHAR(20) NOT NULL,
        FOREIGN KEY (MerchantId) REFERENCES Merchants(Id) ON DELETE CASCADE
    );
END;

-- 가맹점 주소 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MerchantAddresses')
BEGIN
    CREATE TABLE MerchantAddresses (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MerchantId INT NOT NULL,
        ZipCode NVARCHAR(10) NOT NULL,
        Address1 NVARCHAR(200) NOT NULL,
        Address2 NVARCHAR(200) NULL,
        FOREIGN KEY (MerchantId) REFERENCES Merchants(Id) ON DELETE CASCADE
    );
END;

-- 가맹점 계좌 정보 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MerchantAccounts')
BEGIN
    CREATE TABLE MerchantAccounts (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MerchantId INT NOT NULL,
        Bank NVARCHAR(50) NOT NULL,
        AccountNumber NVARCHAR(50) NOT NULL,
        AccountHolder NVARCHAR(50) NOT NULL,
        FOREIGN KEY (MerchantId) REFERENCES Merchants(Id) ON DELETE CASCADE
    );
END;

-- 가맹점 수수료 정보 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MerchantFees')
BEGIN
    CREATE TABLE MerchantFees (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MerchantId INT NOT NULL,
        PaymentFee DECIMAL(5,2) NOT NULL,
        WithdrawalFee INT NOT NULL,
        FOREIGN KEY (MerchantId) REFERENCES Merchants(Id) ON DELETE CASCADE
    );
END;

-- 가맹점 API 키 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MerchantApiKeys')
BEGIN
    CREATE TABLE MerchantApiKeys (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MerchantId INT NOT NULL,
        ApiKey NVARCHAR(100) NOT NULL,
        ApiSecret NVARCHAR(100) NOT NULL,
        IsActive BIT DEFAULT 1,
        CreatedAt DATETIME DEFAULT GETDATE(),
        ExpiresAt DATETIME NULL,
        FOREIGN KEY (MerchantId) REFERENCES Merchants(Id) ON DELETE CASCADE
    );
END;

-- 가맹점 거래 내역 테이블 생성
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MerchantTransactions')
BEGIN
    CREATE TABLE MerchantTransactions (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        MerchantId INT NOT NULL,
        TransactionId NVARCHAR(50) NOT NULL,
        Amount DECIMAL(18,2) NOT NULL,
        Fee DECIMAL(18,2) NOT NULL,
        Type NVARCHAR(20) NOT NULL CHECK (Type IN ('payment', 'refund', 'withdrawal')),
        Status NVARCHAR(20) NOT NULL CHECK (Status IN ('pending', 'completed', 'failed', 'cancelled')),
        CreatedAt DATETIME DEFAULT GETDATE(),
        CompletedAt DATETIME NULL,
        FOREIGN KEY (MerchantId) REFERENCES Merchants(Id) ON DELETE CASCADE
    );
END;

-- 가맹점 목록 조회 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetMerchants')
    DROP PROCEDURE sp_GetMerchants;
GO

CREATE PROCEDURE sp_GetMerchants
    @name NVARCHAR(100) = NULL,
    @businessNumber NVARCHAR(20) = NULL,
    @status NVARCHAR(20) = NULL,
    @page INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @offset INT = (@page - 1) * @pageSize;
    
    -- 총 레코드 수 계산을 위한 CTE
    WITH MerchantsCTE AS (
        SELECT 
            m.Id, m.Name, m.BusinessNumber, m.RepresentativeName, m.Status,
            mc.Email, mc.Phone, m.CreatedAt
        FROM Merchants m
        LEFT JOIN MerchantContacts mc ON m.Id = mc.MerchantId
        WHERE 
            (@name IS NULL OR m.Name LIKE '%' + @name + '%')
            AND (@businessNumber IS NULL OR m.BusinessNumber LIKE '%' + @businessNumber + '%')
            AND (@status IS NULL OR m.Status = @status)
    )
    
    -- 결과 반환
    SELECT 
        *, 
        (SELECT COUNT(*) FROM MerchantsCTE) AS TotalCount
    FROM MerchantsCTE
    ORDER BY CreatedAt DESC
    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;
GO

-- 가맹점 상세 정보 조회 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetMerchantById')
    DROP PROCEDURE sp_GetMerchantById;
GO

CREATE PROCEDURE sp_GetMerchantById
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 가맹점 기본 정보
    SELECT 
        m.Id, m.Name, m.BusinessNumber, m.RepresentativeName, m.Status,
        m.CreatedAt, m.UpdatedAt,
        -- 연락처 정보
        JSON_OBJECT(
            'email': mc.Email,
            'phone': mc.Phone
        ) AS Contact,
        -- 주소 정보
        JSON_OBJECT(
            'zipCode': ma.ZipCode,
            'address1': ma.Address1,
            'address2': ma.Address2
        ) AS Address,
        -- 계좌 정보
        JSON_OBJECT(
            'bank': macc.Bank,
            'accountNumber': macc.AccountNumber,
            'accountHolder': macc.AccountHolder
        ) AS Account,
        -- 수수료 정보
        JSON_OBJECT(
            'payment': mf.PaymentFee,
            'withdrawal': mf.WithdrawalFee
        ) AS Fees
    FROM Merchants m
    LEFT JOIN MerchantContacts mc ON m.Id = mc.MerchantId
    LEFT JOIN MerchantAddresses ma ON m.Id = ma.MerchantId
    LEFT JOIN MerchantAccounts macc ON m.Id = macc.MerchantId
    LEFT JOIN MerchantFees mf ON m.Id = mf.MerchantId
    WHERE m.Id = @id;
END;
GO

-- 가맹점 거래 내역 조회 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetMerchantTransactions')
    DROP PROCEDURE sp_GetMerchantTransactions;
GO

CREATE PROCEDURE sp_GetMerchantTransactions
    @merchantId INT,
    @startDate DATETIME = NULL,
    @endDate DATETIME = NULL,
    @type NVARCHAR(20) = NULL,
    @page INT = 1,
    @pageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @offset INT = (@page - 1) * @pageSize;
    
    -- 총 레코드 수 계산을 위한 CTE
    WITH TransactionsCTE AS (
        SELECT 
            Id, TransactionId, Amount, Fee, Type, Status, CreatedAt, CompletedAt
        FROM MerchantTransactions
        WHERE 
            MerchantId = @merchantId
            AND (@startDate IS NULL OR CreatedAt >= @startDate)
            AND (@endDate IS NULL OR CreatedAt <= @endDate)
            AND (@type IS NULL OR Type = @type)
    )
    
    -- 결과 반환
    SELECT 
        *, 
        (SELECT COUNT(*) FROM TransactionsCTE) AS TotalCount
    FROM TransactionsCTE
    ORDER BY CreatedAt DESC
    OFFSET @offset ROWS
    FETCH NEXT @pageSize ROWS ONLY;
END;
GO

-- 가맹점 API 키 조회 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_GetMerchantApiKeys')
    DROP PROCEDURE sp_GetMerchantApiKeys;
GO

CREATE PROCEDURE sp_GetMerchantApiKeys
    @merchantId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id, ApiKey, ApiSecret, IsActive, CreatedAt, ExpiresAt
    FROM MerchantApiKeys
    WHERE MerchantId = @merchantId
    ORDER BY CreatedAt DESC;
END;
GO

-- 가맹점 등록 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateMerchant')
    DROP PROCEDURE sp_CreateMerchant;
GO

CREATE PROCEDURE sp_CreateMerchant
    @name NVARCHAR(100),
    @businessNumber NVARCHAR(20),
    @representativeName NVARCHAR(50),
    @status NVARCHAR(20),
    @email NVARCHAR(100),
    @phone NVARCHAR(20),
    @zipCode NVARCHAR(10),
    @address1 NVARCHAR(200),
    @address2 NVARCHAR(200) = NULL,
    @bank NVARCHAR(50),
    @accountNumber NVARCHAR(50),
    @accountHolder NVARCHAR(50),
    @paymentFee DECIMAL(5,2),
    @withdrawalFee INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 가맹점 기본 정보 등록
        INSERT INTO Merchants (Name, BusinessNumber, RepresentativeName, Status)
        VALUES (@name, @businessNumber, @representativeName, @status);
        
        DECLARE @merchantId INT = SCOPE_IDENTITY();
        
        -- 연락처 정보 등록
        INSERT INTO MerchantContacts (MerchantId, Email, Phone)
        VALUES (@merchantId, @email, @phone);
        
        -- 주소 정보 등록
        INSERT INTO MerchantAddresses (MerchantId, ZipCode, Address1, Address2)
        VALUES (@merchantId, @zipCode, @address1, @address2);
        
        -- 계좌 정보 등록
        INSERT INTO MerchantAccounts (MerchantId, Bank, AccountNumber, AccountHolder)
        VALUES (@merchantId, @bank, @accountNumber, @accountHolder);
        
        -- 수수료 정보 등록
        INSERT INTO MerchantFees (MerchantId, PaymentFee, WithdrawalFee)
        VALUES (@merchantId, @paymentFee, @withdrawalFee);
        
        -- API 키 생성
        DECLARE @apiKey NVARCHAR(100) = CONCAT('key_', LOWER(NEWID()));
        DECLARE @apiSecret NVARCHAR(100) = CONCAT('secret_', LOWER(NEWID()));
        
        INSERT INTO MerchantApiKeys (MerchantId, ApiKey, ApiSecret, ExpiresAt)
        VALUES (@merchantId, @apiKey, @apiSecret, DATEADD(YEAR, 1, GETDATE()));
        
        COMMIT TRANSACTION;
        
        -- 생성된 가맹점 ID 반환
        SELECT @merchantId AS Id;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- 가맹점 정보 수정 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateMerchant')
    DROP PROCEDURE sp_UpdateMerchant;
GO

CREATE PROCEDURE sp_UpdateMerchant
    @id INT,
    @name NVARCHAR(100),
    @businessNumber NVARCHAR(20),
    @representativeName NVARCHAR(50),
    @status NVARCHAR(20),
    @email NVARCHAR(100),
    @phone NVARCHAR(20),
    @zipCode NVARCHAR(10),
    @address1 NVARCHAR(200),
    @address2 NVARCHAR(200) = NULL,
    @bank NVARCHAR(50),
    @accountNumber NVARCHAR(50),
    @accountHolder NVARCHAR(50),
    @paymentFee DECIMAL(5,2),
    @withdrawalFee INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 가맹점 기본 정보 수정
        UPDATE Merchants
        SET 
            Name = @name,
            BusinessNumber = @businessNumber,
            RepresentativeName = @representativeName,
            Status = @status,
            UpdatedAt = GETDATE()
        WHERE Id = @id;
        
        -- 연락처 정보 수정
        UPDATE MerchantContacts
        SET 
            Email = @email,
            Phone = @phone
        WHERE MerchantId = @id;
        
        -- 주소 정보 수정
        UPDATE MerchantAddresses
        SET 
            ZipCode = @zipCode,
            Address1 = @address1,
            Address2 = @address2
        WHERE MerchantId = @id;
        
        -- 계좌 정보 수정
        UPDATE MerchantAccounts
        SET 
            Bank = @bank,
            AccountNumber = @accountNumber,
            AccountHolder = @accountHolder
        WHERE MerchantId = @id;
        
        -- 수수료 정보 수정
        UPDATE MerchantFees
        SET 
            PaymentFee = @paymentFee,
            WithdrawalFee = @withdrawalFee
        WHERE MerchantId = @id;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- 가맹점 상태 변경 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateMerchantStatus')
    DROP PROCEDURE sp_UpdateMerchantStatus;
GO

CREATE PROCEDURE sp_UpdateMerchantStatus
    @id INT,
    @status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Merchants
    SET 
        Status = @status,
        UpdatedAt = GETDATE()
    WHERE Id = @id;
END;
GO

-- 가맹점 삭제 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_DeleteMerchant')
    DROP PROCEDURE sp_DeleteMerchant;
GO

CREATE PROCEDURE sp_DeleteMerchant
    @id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 연관 테이블 데이터 삭제 (CASCADE 설정이 있지만 명시적으로 삭제)
        DELETE FROM MerchantApiKeys WHERE MerchantId = @id;
        DELETE FROM MerchantFees WHERE MerchantId = @id;
        DELETE FROM MerchantAccounts WHERE MerchantId = @id;
        DELETE FROM MerchantAddresses WHERE MerchantId = @id;
        DELETE FROM MerchantContacts WHERE MerchantId = @id;
        DELETE FROM MerchantTransactions WHERE MerchantId = @id;
        
        -- 가맹점 삭제
        DELETE FROM Merchants WHERE Id = @id;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END;
GO

-- 가맹점 API 키 생성 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateMerchantApiKey')
    DROP PROCEDURE sp_CreateMerchantApiKey;
GO

CREATE PROCEDURE sp_CreateMerchantApiKey
    @merchantId INT,
    @expiresInDays INT = 365
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @apiKey NVARCHAR(100) = CONCAT('key_', LOWER(NEWID()));
    DECLARE @apiSecret NVARCHAR(100) = CONCAT('secret_', LOWER(NEWID()));
    
    INSERT INTO MerchantApiKeys (MerchantId, ApiKey, ApiSecret, ExpiresAt)
    VALUES (@merchantId, @apiKey, @apiSecret, DATEADD(DAY, @expiresInDays, GETDATE()));
    
    SELECT Id, ApiKey, ApiSecret, IsActive, CreatedAt, ExpiresAt
    FROM MerchantApiKeys
    WHERE Id = SCOPE_IDENTITY();
END;
GO

-- 가맹점 API 키 비활성화 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_DeactivateMerchantApiKey')
    DROP PROCEDURE sp_DeactivateMerchantApiKey;
GO

CREATE PROCEDURE sp_DeactivateMerchantApiKey
    @apiKeyId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE MerchantApiKeys
    SET IsActive = 0
    WHERE Id = @apiKeyId;
END;
GO
