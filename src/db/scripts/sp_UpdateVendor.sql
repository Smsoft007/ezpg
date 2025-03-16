-- =============================================
-- 가맹점 정보 업데이트 프로시저
-- =============================================

USE [EzPayDB]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateVendor]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_UpdateVendor]
GO

CREATE PROCEDURE [dbo].[sp_UpdateVendor]
    @Id VARCHAR(36),
    @VendorCode VARCHAR(20) = NULL,
    @VendorName NVARCHAR(100),
    @RepresentativeName NVARCHAR(50),
    @PhoneNumber VARCHAR(20),
    @Email VARCHAR(100),
    @Address NVARCHAR(200) = NULL,
    @BusinessType NVARCHAR(50) = NULL,
    @BankCode VARCHAR(10) = NULL,
    @BankName NVARCHAR(50) = NULL,
    @AccountNumber VARCHAR(30) = NULL,
    @AccountHolder NVARCHAR(50) = NULL,
    @Status VARCHAR(20) = NULL,
    @ContractStartDate DATE = NULL,
    @ContractEndDate DATE = NULL,
    @MemoInternal NVARCHAR(1000) = NULL,
    @UpdatedBy VARCHAR(100) = 'SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 기존 데이터 조회
        DECLARE @OldVendorName NVARCHAR(100);
        DECLARE @OldStatus VARCHAR(20);
        DECLARE @OldVendorCode VARCHAR(20);
        
        SELECT 
            @OldVendorName = VendorName,
            @OldStatus = Status,
            @OldVendorCode = VendorCode
        FROM [dbo].[Vendors]
        WHERE Id = @Id;
        
        -- 가맹점 코드 중복 확인 (코드 변경 시)
        IF @VendorCode IS NOT NULL AND @VendorCode <> @OldVendorCode AND EXISTS (SELECT 1 FROM [dbo].[Vendors] WHERE VendorCode = @VendorCode)
        BEGIN
            RAISERROR(N'이미 등록된 가맹점 코드입니다.', 16, 1);
            RETURN;
        END
        
        -- 가맹점 정보 업데이트
        UPDATE [dbo].[Vendors]
        SET 
            VendorCode = ISNULL(@VendorCode, VendorCode),
            VendorName = @VendorName,
            RepresentativeName = @RepresentativeName,
            PhoneNumber = @PhoneNumber,
            Email = @Email,
            Address = @Address,
            BusinessType = @BusinessType,
            BankCode = @BankCode,
            BankName = @BankName,
            AccountNumber = @AccountNumber,
            AccountHolder = @AccountHolder,
            Status = ISNULL(@Status, Status),
            ContractStartDate = ISNULL(@ContractStartDate, ContractStartDate),
            ContractEndDate = ISNULL(@ContractEndDate, ContractEndDate),
            MemoInternal = @MemoInternal,
            UpdatedAt = GETDATE()
        WHERE Id = @Id;
        
        -- 가맹점 이름 변경 이력 기록
        IF @OldVendorName <> @VendorName
        BEGIN
            INSERT INTO [dbo].[VendorHistories]
            (
                [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
            )
            VALUES
            (
                @Id, 'update', @OldVendorName, @VendorName, N'가맹점명 변경', @UpdatedBy
            );
        END
        
        -- 상태 변경 이력 기록
        IF @Status IS NOT NULL AND @OldStatus <> @Status
        BEGIN
            INSERT INTO [dbo].[VendorHistories]
            (
                [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
            )
            VALUES
            (
                @Id, 'status_change', @OldStatus, @Status, N'가맹점 상태 변경', @UpdatedBy
            );
        END
        
        -- 가맹점 코드 변경 이력 기록
        IF @VendorCode IS NOT NULL AND @OldVendorCode <> @VendorCode
        BEGIN
            INSERT INTO [dbo].[VendorHistories]
            (
                [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
            )
            VALUES
            (
                @Id, 'code_change', @OldVendorCode, @VendorCode, N'가맹점 코드 변경', @UpdatedBy
            );
        END
        
        COMMIT TRANSACTION;
        
        -- 업데이트된 가맹점 정보 반환
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
