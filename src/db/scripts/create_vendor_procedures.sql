-- 거래처 관리를 위한 저장 프로시저

-- 기존 프로시저가 있다면 삭제
IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetVendorList')
DROP PROCEDURE sp_GetVendorList
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_GetVendorById')
DROP PROCEDURE sp_GetVendorById
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_CreateVendor')
DROP PROCEDURE sp_CreateVendor
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateVendor')
DROP PROCEDURE sp_UpdateVendor
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_UpdateVendorStatus')
DROP PROCEDURE sp_UpdateVendorStatus
GO

IF EXISTS (SELECT * FROM sys.objects WHERE type = 'P' AND name = 'sp_DeleteVendor')
DROP PROCEDURE sp_DeleteVendor
GO

-- 거래처 목록 조회 프로시저
CREATE PROCEDURE sp_GetVendorList
    @SearchText NVARCHAR(100) = NULL,
    @Status NVARCHAR(20) = NULL,
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @SortColumn NVARCHAR(50) = 'Id',
    @SortDirection NVARCHAR(4) = 'ASC'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @ParamDefinition NVARCHAR(500);
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    SET @SQL = N'
    WITH FilteredVendors AS (
        SELECT 
            Id, VendorName, BusinessNumber, RepresentativeName, 
            PhoneNumber, Email, Address, BusinessType,
            Status, CreatedAt, UpdatedAt,
            TaxRate, PaymentTerms, ContactPerson
        FROM Vendors
        WHERE 1=1';
    
    -- 검색 조건 추가
    IF @SearchText IS NOT NULL
    BEGIN
        SET @SQL = @SQL + N'
        AND (
            VendorName LIKE ''%'' + @SearchText + ''%'' OR
            BusinessNumber LIKE ''%'' + @SearchText + ''%'' OR
            RepresentativeName LIKE ''%'' + @SearchText + ''%'' OR
            Email LIKE ''%'' + @SearchText + ''%''
        )';
    END
    
    -- 상태 필터 추가
    IF @Status IS NOT NULL
    BEGIN
        SET @SQL = @SQL + N'
        AND Status = @Status';
    END
    
    -- 정렬 및 페이징 추가
    SET @SQL = @SQL + N'
    )
    SELECT 
        Id, VendorName, BusinessNumber, RepresentativeName, 
        PhoneNumber, Email, Address, BusinessType,
        Status, CreatedAt, UpdatedAt,
        TaxRate, PaymentTerms, ContactPerson,
        (SELECT COUNT(*) FROM FilteredVendors) AS TotalCount
    FROM FilteredVendors
    ORDER BY ' + QUOTENAME(@SortColumn) + ' ' + @SortDirection + '
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;';
    
    SET @ParamDefinition = N'
        @SearchText NVARCHAR(100),
        @Status NVARCHAR(20),
        @Offset INT,
        @PageSize INT';
    
    EXEC sp_executesql @SQL, @ParamDefinition, 
        @SearchText = @SearchText,
        @Status = @Status,
        @Offset = @Offset,
        @PageSize = @PageSize;
END
GO

-- 거래처 상세 조회 프로시저
CREATE PROCEDURE sp_GetVendorById
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        v.Id, v.VendorName, v.BusinessNumber, v.RepresentativeName, 
        v.PhoneNumber, v.Email, v.Address, v.BusinessType,
        v.Status, v.CreatedAt, v.UpdatedAt,
        v.TaxRate, v.PaymentTerms, v.ContactPerson,
        
        -- 거래처 은행 정보
        vb.BankName, vb.AccountNumber, vb.AccountHolder,
        
        -- 거래처 비즈니스 정보
        vbi.CompanyName, vbi.CeoName, vbi.BusinessType AS DetailBusinessType, 
        vbi.BusinessCategory
    FROM 
        Vendors v
    LEFT JOIN 
        VendorBankInfo vb ON v.Id = vb.VendorId
    LEFT JOIN 
        VendorBusinessInfo vbi ON v.Id = vbi.VendorId
    WHERE 
        v.Id = @Id;
END
GO

-- 거래처 등록 프로시저
CREATE PROCEDURE sp_CreateVendor
    @VendorName NVARCHAR(100),
    @BusinessNumber NVARCHAR(20),
    @RepresentativeName NVARCHAR(50),
    @PhoneNumber NVARCHAR(20),
    @Email NVARCHAR(100),
    @Address NVARCHAR(200),
    @BusinessType NVARCHAR(50),
    @Status NVARCHAR(20) = 'active',
    @TaxRate DECIMAL(5,2) = 10.00,
    @PaymentTerms NVARCHAR(50) = '30일',
    @ContactPerson NVARCHAR(50) = NULL,
    
    -- 은행 정보
    @BankName NVARCHAR(50) = NULL,
    @AccountNumber NVARCHAR(50) = NULL,
    @AccountHolder NVARCHAR(50) = NULL,
    
    -- 비즈니스 정보
    @CompanyName NVARCHAR(100) = NULL,
    @CeoName NVARCHAR(50) = NULL,
    @DetailBusinessType NVARCHAR(50) = NULL,
    @BusinessCategory NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 새 거래처 ID 생성 (V + 현재 날짜 + 3자리 순번)
        DECLARE @NewId NVARCHAR(50);
        DECLARE @Date NVARCHAR(8) = FORMAT(GETDATE(), 'yyyyMMdd');
        DECLARE @Sequence INT;
        
        -- 오늘 생성된 거래처 중 가장 높은 순번 찾기
        SELECT @Sequence = ISNULL(MAX(CAST(SUBSTRING(Id, 10, 3) AS INT)), 0) + 1
        FROM Vendors
        WHERE SUBSTRING(Id, 2, 8) = @Date;
        
        SET @NewId = 'V' + @Date + RIGHT('000' + CAST(@Sequence AS NVARCHAR(3)), 3);
        
        -- 거래처 기본 정보 삽입
        INSERT INTO Vendors (
            Id, VendorName, BusinessNumber, RepresentativeName, 
            PhoneNumber, Email, Address, BusinessType,
            Status, CreatedAt, UpdatedAt,
            TaxRate, PaymentTerms, ContactPerson
        ) VALUES (
            @NewId, @VendorName, @BusinessNumber, @RepresentativeName,
            @PhoneNumber, @Email, @Address, @BusinessType,
            @Status, GETDATE(), GETDATE(),
            @TaxRate, @PaymentTerms, @ContactPerson
        );
        
        -- 은행 정보가 제공된 경우 삽입
        IF @BankName IS NOT NULL AND @AccountNumber IS NOT NULL
        BEGIN
            INSERT INTO VendorBankInfo (
                VendorId, BankName, AccountNumber, AccountHolder
            ) VALUES (
                @NewId, @BankName, @AccountNumber, @AccountHolder
            );
        END
        
        -- 비즈니스 정보가 제공된 경우 삽입
        IF @CompanyName IS NOT NULL
        BEGIN
            INSERT INTO VendorBusinessInfo (
                VendorId, CompanyName, CeoName, BusinessType, BusinessCategory
            ) VALUES (
                @NewId, @CompanyName, @CeoName, @DetailBusinessType, @BusinessCategory
            );
        END
        
        -- 생성된 거래처 ID 반환
        SELECT @NewId AS Id;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END
GO

-- 거래처 정보 수정 프로시저
CREATE PROCEDURE sp_UpdateVendor
    @Id NVARCHAR(50),
    @VendorName NVARCHAR(100),
    @BusinessNumber NVARCHAR(20),
    @RepresentativeName NVARCHAR(50),
    @PhoneNumber NVARCHAR(20),
    @Email NVARCHAR(100),
    @Address NVARCHAR(200),
    @BusinessType NVARCHAR(50),
    @TaxRate DECIMAL(5,2),
    @PaymentTerms NVARCHAR(50),
    @ContactPerson NVARCHAR(50) = NULL,
    
    -- 은행 정보
    @BankName NVARCHAR(50) = NULL,
    @AccountNumber NVARCHAR(50) = NULL,
    @AccountHolder NVARCHAR(50) = NULL,
    
    -- 비즈니스 정보
    @CompanyName NVARCHAR(100) = NULL,
    @CeoName NVARCHAR(50) = NULL,
    @DetailBusinessType NVARCHAR(50) = NULL,
    @BusinessCategory NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 거래처 기본 정보 업데이트
        UPDATE Vendors
        SET 
            VendorName = @VendorName,
            BusinessNumber = @BusinessNumber,
            RepresentativeName = @RepresentativeName,
            PhoneNumber = @PhoneNumber,
            Email = @Email,
            Address = @Address,
            BusinessType = @BusinessType,
            TaxRate = @TaxRate,
            PaymentTerms = @PaymentTerms,
            ContactPerson = @ContactPerson,
            UpdatedAt = GETDATE()
        WHERE 
            Id = @Id;
        
        -- 은행 정보 업데이트
        IF EXISTS (SELECT 1 FROM VendorBankInfo WHERE VendorId = @Id)
        BEGIN
            IF @BankName IS NOT NULL AND @AccountNumber IS NOT NULL
            BEGIN
                UPDATE VendorBankInfo
                SET 
                    BankName = @BankName,
                    AccountNumber = @AccountNumber,
                    AccountHolder = @AccountHolder
                WHERE 
                    VendorId = @Id;
            END
            ELSE
            BEGIN
                -- 은행 정보가 제공되지 않았다면 삭제
                DELETE FROM VendorBankInfo WHERE VendorId = @Id;
            END
        END
        ELSE
        BEGIN
            -- 은행 정보가 없었는데 새로 제공된 경우 삽입
            IF @BankName IS NOT NULL AND @AccountNumber IS NOT NULL
            BEGIN
                INSERT INTO VendorBankInfo (
                    VendorId, BankName, AccountNumber, AccountHolder
                ) VALUES (
                    @Id, @BankName, @AccountNumber, @AccountHolder
                );
            END
        END
        
        -- 비즈니스 정보 업데이트
        IF EXISTS (SELECT 1 FROM VendorBusinessInfo WHERE VendorId = @Id)
        BEGIN
            IF @CompanyName IS NOT NULL
            BEGIN
                UPDATE VendorBusinessInfo
                SET 
                    CompanyName = @CompanyName,
                    CeoName = @CeoName,
                    BusinessType = @DetailBusinessType,
                    BusinessCategory = @BusinessCategory
                WHERE 
                    VendorId = @Id;
            END
            ELSE
            BEGIN
                -- 비즈니스 정보가 제공되지 않았다면 삭제
                DELETE FROM VendorBusinessInfo WHERE VendorId = @Id;
            END
        END
        ELSE
        BEGIN
            -- 비즈니스 정보가 없었는데 새로 제공된 경우 삽입
            IF @CompanyName IS NOT NULL
            BEGIN
                INSERT INTO VendorBusinessInfo (
                    VendorId, CompanyName, CeoName, BusinessType, BusinessCategory
                ) VALUES (
                    @Id, @CompanyName, @CeoName, @DetailBusinessType, @BusinessCategory
                );
            END
        END
        
        -- 업데이트된 거래처 ID 반환
        SELECT @Id AS Id;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END
GO

-- 거래처 상태 변경 프로시저
CREATE PROCEDURE sp_UpdateVendorStatus
    @Id NVARCHAR(50),
    @Status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Vendors
    SET 
        Status = @Status,
        UpdatedAt = GETDATE()
    WHERE 
        Id = @Id;
    
    SELECT @Id AS Id;
END
GO

-- 거래처 삭제 프로시저
CREATE PROCEDURE sp_DeleteVendor
    @Id NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 관련 은행 정보 삭제
        DELETE FROM VendorBankInfo WHERE VendorId = @Id;
        
        -- 관련 비즈니스 정보 삭제
        DELETE FROM VendorBusinessInfo WHERE VendorId = @Id;
        
        -- 거래처 삭제
        DELETE FROM Vendors WHERE Id = @Id;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END
GO
