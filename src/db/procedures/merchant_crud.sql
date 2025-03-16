/**
 * 가맹점 생성, 수정, 삭제 관련 저장 프로시저
 */

-- 가맹점 등록 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateMerchant')
    DROP PROCEDURE sp_CreateMerchant
GO

CREATE PROCEDURE sp_CreateMerchant
    @MerchantName NVARCHAR(100),
    @BusinessNumber NVARCHAR(20),
    @RepresentativeName NVARCHAR(50),
    @Status NVARCHAR(20) = 'pending',
    @Email NVARCHAR(100),
    @Phone NVARCHAR(20),
    @ZipCode NVARCHAR(10),
    @Address1 NVARCHAR(200),
    @Address2 NVARCHAR(200) = NULL,
    @BankName NVARCHAR(50),
    @AccountNumber NVARCHAR(50),
    @AccountHolder NVARCHAR(50),
    @PaymentFeeRate DECIMAL(5,2) = 3.5,
    @WithdrawalFee DECIMAL(10,2) = 1000
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 중복 체크 (사업자번호)
    IF EXISTS (SELECT 1 FROM Merchants WHERE BusinessNumber = @BusinessNumber)
    BEGIN
        RAISERROR('이미 동일한 사업자번호의 가맹점이 존재합니다.', 16, 1);
        RETURN;
    END
    
    -- 가맹점 추가
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
        WithdrawalFee,
        CreatedAt,
        UpdatedAt
    ) VALUES (
        @MerchantName,
        @BusinessNumber,
        @RepresentativeName,
        @Status,
        @Email,
        @Phone,
        @ZipCode,
        @Address1,
        @Address2,
        @BankName,
        @AccountNumber,
        @AccountHolder,
        @PaymentFeeRate,
        @WithdrawalFee,
        GETDATE(),
        GETDATE()
    );
    
    -- 생성된 가맹점 ID 반환
    SELECT SCOPE_IDENTITY() AS Id;
END
GO

-- 가맹점 정보 수정 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateMerchant')
    DROP PROCEDURE sp_UpdateMerchant
GO

CREATE PROCEDURE sp_UpdateMerchant
    @MerchantId INT,
    @MerchantName NVARCHAR(100),
    @BusinessNumber NVARCHAR(20),
    @RepresentativeName NVARCHAR(50),
    @Status NVARCHAR(20),
    @Email NVARCHAR(100),
    @Phone NVARCHAR(20),
    @ZipCode NVARCHAR(10),
    @Address1 NVARCHAR(200),
    @Address2 NVARCHAR(200) = NULL,
    @BankName NVARCHAR(50),
    @AccountNumber NVARCHAR(50),
    @AccountHolder NVARCHAR(50),
    @PaymentFeeRate DECIMAL(5,2),
    @WithdrawalFee DECIMAL(10,2)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 가맹점 존재 체크
    IF NOT EXISTS (SELECT 1 FROM Merchants WHERE Id = @MerchantId)
    BEGIN
        RAISERROR('해당 ID의 가맹점이 존재하지 않습니다.', 16, 1);
        RETURN;
    END
    
    -- 다른 가맹점과 사업자번호 중복 체크
    IF EXISTS (SELECT 1 FROM Merchants WHERE BusinessNumber = @BusinessNumber AND Id <> @MerchantId)
    BEGIN
        RAISERROR('이미 동일한 사업자번호의 다른 가맹점이 존재합니다.', 16, 1);
        RETURN;
    END
    
    -- 가맹점 정보 수정
    UPDATE Merchants
    SET 
        Name = @MerchantName,
        BusinessNumber = @BusinessNumber,
        RepresentativeName = @RepresentativeName,
        Status = @Status,
        Email = @Email,
        Phone = @Phone,
        ZipCode = @ZipCode,
        Address1 = @Address1,
        Address2 = @Address2,
        BankName = @BankName,
        AccountNumber = @AccountNumber,
        AccountHolder = @AccountHolder,
        PaymentFeeRate = @PaymentFeeRate,
        WithdrawalFee = @WithdrawalFee,
        UpdatedAt = GETDATE()
    WHERE Id = @MerchantId;
    
    -- 수정된 행 수 반환
    SELECT @@ROWCOUNT AS AffectedRows;
END
GO

-- 가맹점 상태 수정 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateMerchantStatus')
    DROP PROCEDURE sp_UpdateMerchantStatus
GO

CREATE PROCEDURE sp_UpdateMerchantStatus
    @MerchantId INT,
    @Status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 가맹점 존재 체크
    IF NOT EXISTS (SELECT 1 FROM Merchants WHERE Id = @MerchantId)
    BEGIN
        RAISERROR('해당 ID의 가맹점이 존재하지 않습니다.', 16, 1);
        RETURN;
    END
    
    -- 상태 유효성 체크
    IF @Status NOT IN ('active', 'inactive', 'pending')
    BEGIN
        RAISERROR('상태는 active, inactive 또는 pending 중 하나여야 합니다.', 16, 1);
        RETURN;
    END
    
    -- 가맹점 상태 수정
    UPDATE Merchants
    SET 
        Status = @Status,
        UpdatedAt = GETDATE()
    WHERE Id = @MerchantId;
    
    -- 수정된 행 수 반환
    SELECT @@ROWCOUNT AS AffectedRows;
END
GO

-- 가맹점 삭제 프로시저
IF EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_DeleteMerchant')
    DROP PROCEDURE sp_DeleteMerchant
GO

CREATE PROCEDURE sp_DeleteMerchant
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
    
    -- 가맹점 삭제 (실제로는 상태만 변경)
    -- 실제 삭제가 필요한 경우 DELETE 문을 사용할 수 있음
    UPDATE Merchants
    SET 
        Status = 'deleted',
        UpdatedAt = GETDATE()
    WHERE Id = @MerchantId;
    
    -- 수정된 행 수 반환
    SELECT @@ROWCOUNT AS AffectedRows;
END
GO
