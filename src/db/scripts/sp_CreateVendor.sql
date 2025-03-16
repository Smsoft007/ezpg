-- =============================================
-- 가맹점 생성 프로시저
-- =============================================

USE [EzPayDB]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateVendor]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_CreateVendor]
GO

CREATE PROCEDURE [dbo].[sp_CreateVendor]
    @Id VARCHAR(36),
    @VendorCode VARCHAR(20),
    @VendorName NVARCHAR(100),
    @BusinessNumber VARCHAR(20),
    @RepresentativeName NVARCHAR(50),
    @PhoneNumber VARCHAR(20),
    @Email VARCHAR(100),
    @Address NVARCHAR(200) = NULL,
    @BusinessType NVARCHAR(50) = NULL,
    @BankCode VARCHAR(10) = NULL,
    @BankName NVARCHAR(50) = NULL,
    @AccountNumber VARCHAR(30) = NULL,
    @AccountHolder NVARCHAR(50) = NULL,
    @Status VARCHAR(20) = 'active',
    @ContractStartDate DATE = NULL,
    @ContractEndDate DATE = NULL,
    @MemoInternal NVARCHAR(1000) = NULL,
    @CreatedBy VARCHAR(100) = 'SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 사업자번호 중복 확인
        IF EXISTS (SELECT 1 FROM [dbo].[Vendors] WHERE BusinessNumber = @BusinessNumber)
        BEGIN
            RAISERROR(N'이미 등록된 사업자번호입니다.', 16, 1);
            RETURN;
        END
        
        -- 가맹점 코드 중복 확인
        IF EXISTS (SELECT 1 FROM [dbo].[Vendors] WHERE VendorCode = @VendorCode)
        BEGIN
            RAISERROR(N'이미 등록된 가맹점 코드입니다.', 16, 1);
            RETURN;
        END
        
        -- 가맹점 정보 삽입
        INSERT INTO [dbo].[Vendors]
        (
            [Id], [VendorCode], [VendorName], [BusinessNumber], [RepresentativeName], [PhoneNumber], [Email],
            [Address], [BusinessType], [BankCode], [BankName], [AccountNumber], [AccountHolder],
            [Status], [ContractStartDate], [ContractEndDate], [MemoInternal]
        )
        VALUES
        (
            @Id, @VendorCode, @VendorName, @BusinessNumber, @RepresentativeName, @PhoneNumber, @Email,
            @Address, @BusinessType, @BankCode, @BankName, @AccountNumber, @AccountHolder,
            @Status, @ContractStartDate, @ContractEndDate, @MemoInternal
        );
        
        -- 가맹점 이력 기록
        INSERT INTO [dbo].[VendorHistories]
        (
            [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
        )
        VALUES
        (
            @Id, 'create', NULL, 
            N'가맹점명: ' + @VendorName + N', 사업자번호: ' + @BusinessNumber + N', 상태: ' + @Status,
            N'가맹점 최초 등록', @CreatedBy
        );
        
        -- 기본 결제 설정 추가 (카드 결제)
        INSERT INTO [dbo].[VendorPaymentSettings]
        (
            [VendorId], [PaymentMethod], [IsEnabled], [FeeRate], [FixedFee], [SettlementCycle]
        )
        VALUES
        (
            @Id, 'card', 1, 3.30, 0.00, 'daily'
        );
        
        -- 기본 결제 설정 추가 (계좌이체)
        INSERT INTO [dbo].[VendorPaymentSettings]
        (
            [VendorId], [PaymentMethod], [IsEnabled], [FeeRate], [FixedFee], [SettlementCycle]
        )
        VALUES
        (
            @Id, 'bank_transfer', 1, 1.80, 0.00, 'daily'
        );
        
        -- 기본 결제 설정 추가 (가상계좌)
        INSERT INTO [dbo].[VendorPaymentSettings]
        (
            [VendorId], [PaymentMethod], [IsEnabled], [FeeRate], [FixedFee], [SettlementCycle]
        )
        VALUES
        (
            @Id, 'virtual_account', 1, 1.00, 300.00, 'daily'
        );
        
        COMMIT TRANSACTION;
        
        -- 가맹점 정보 반환
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
