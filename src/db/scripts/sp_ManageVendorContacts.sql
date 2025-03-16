-- =============================================
-- 가맹점 담당자 관리 프로시저
-- =============================================

USE [EzPayDB]
GO

-- 담당자 추가 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_AddVendorContact]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_AddVendorContact]
GO

CREATE PROCEDURE [dbo].[sp_AddVendorContact]
    @VendorId VARCHAR(36),
    @Name NVARCHAR(50),
    @Position NVARCHAR(50) = NULL,
    @Department NVARCHAR(50) = NULL,
    @PhoneNumber VARCHAR(20),
    @Email VARCHAR(100),
    @IsPrimary BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 가맹점 존재 여부 확인
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Vendors] WHERE Id = @VendorId)
        BEGIN
            RAISERROR(N'존재하지 않는 가맹점입니다.', 16, 1);
            RETURN;
        END
        
        -- 기본 담당자로 설정하는 경우 기존 기본 담당자 해제
        IF @IsPrimary = 1
        BEGIN
            UPDATE [dbo].[VendorContacts]
            SET IsPrimary = 0
            WHERE VendorId = @VendorId AND IsPrimary = 1;
        END
        
        -- 최초 등록 담당자의 경우 자동으로 기본 담당자로 설정
        IF NOT EXISTS (SELECT 1 FROM [dbo].[VendorContacts] WHERE VendorId = @VendorId)
        BEGIN
            SET @IsPrimary = 1;
        END
        
        -- 담당자 정보 삽입
        INSERT INTO [dbo].[VendorContacts]
        (
            [VendorId], [Name], [Position], [Department], [PhoneNumber], [Email], [IsPrimary]
        )
        VALUES
        (
            @VendorId, @Name, @Position, @Department, @PhoneNumber, @Email, @IsPrimary
        );
        
        -- 담당자 정보 변경 이력 기록
        INSERT INTO [dbo].[VendorHistories]
        (
            [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
        )
        VALUES
        (
            @VendorId, 'contact_add', NULL, 
            N'담당자 추가: ' + @Name + ' (' + @Position + ', ' + @Email + ')', 
            N'담당자 추가', 'SYSTEM'
        );
        
        COMMIT TRANSACTION;
        
        -- 추가된 담당자 정보 반환
        SELECT * FROM [dbo].[VendorContacts] WHERE Id = SCOPE_IDENTITY();
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

-- 담당자 수정 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateVendorContact]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_UpdateVendorContact]
GO

CREATE PROCEDURE [dbo].[sp_UpdateVendorContact]
    @ContactId INT,
    @Name NVARCHAR(50),
    @Position NVARCHAR(50) = NULL,
    @Department NVARCHAR(50) = NULL,
    @PhoneNumber VARCHAR(20),
    @Email VARCHAR(100),
    @IsPrimary BIT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 담당자 존재 여부 확인
        DECLARE @VendorId VARCHAR(36);
        DECLARE @CurrentIsPrimary BIT;
        
        SELECT 
            @VendorId = VendorId,
            @CurrentIsPrimary = IsPrimary
        FROM [dbo].[VendorContacts]
        WHERE Id = @ContactId;
        
        IF @VendorId IS NULL
        BEGIN
            RAISERROR(N'존재하지 않는 담당자입니다.', 16, 1);
            RETURN;
        END
        
        -- 기본 담당자로 설정하는 경우 기존 기본 담당자 해제
        IF @IsPrimary = 1 AND @CurrentIsPrimary = 0
        BEGIN
            UPDATE [dbo].[VendorContacts]
            SET IsPrimary = 0
            WHERE VendorId = @VendorId AND IsPrimary = 1;
        END
        
        -- 담당자 정보 업데이트
        UPDATE [dbo].[VendorContacts]
        SET 
            Name = @Name,
            Position = @Position,
            Department = @Department,
            PhoneNumber = @PhoneNumber,
            Email = @Email,
            IsPrimary = ISNULL(@IsPrimary, IsPrimary),
            UpdatedAt = GETDATE()
        WHERE Id = @ContactId;
        
        -- 담당자 정보 변경 이력 기록
        INSERT INTO [dbo].[VendorHistories]
        (
            [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
        )
        VALUES
        (
            @VendorId, 'contact_update', NULL, 
            N'담당자 정보 수정: ' + @Name + ' (' + @Position + ', ' + @Email + ')', 
            N'담당자 정보 수정', 'SYSTEM'
        );
        
        COMMIT TRANSACTION;
        
        -- 수정된 담당자 정보 반환
        SELECT * FROM [dbo].[VendorContacts] WHERE Id = @ContactId;
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

-- 담당자 삭제 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DeleteVendorContact]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_DeleteVendorContact]
GO

CREATE PROCEDURE [dbo].[sp_DeleteVendorContact]
    @ContactId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 담당자 존재 여부 확인
        DECLARE @VendorId VARCHAR(36);
        DECLARE @ContactName NVARCHAR(50);
        DECLARE @IsPrimary BIT;
        
        SELECT 
            @VendorId = VendorId,
            @ContactName = Name,
            @IsPrimary = IsPrimary
        FROM [dbo].[VendorContacts]
        WHERE Id = @ContactId;
        
        IF @VendorId IS NULL
        BEGIN
            RAISERROR(N'존재하지 않는 담당자입니다.', 16, 1);
            RETURN;
        END
        
        -- 기본 담당자인 경우 다른 담당자가 있는지 확인
        IF @IsPrimary = 1 AND EXISTS (SELECT 1 FROM [dbo].[VendorContacts] WHERE VendorId = @VendorId AND Id <> @ContactId)
        BEGIN
            -- 다른 담당자 중 하나를 기본 담당자로 설정
            UPDATE TOP(1) [dbo].[VendorContacts]
            SET IsPrimary = 1
            WHERE VendorId = @VendorId AND Id <> @ContactId;
        END
        
        -- 담당자 삭제
        DELETE FROM [dbo].[VendorContacts]
        WHERE Id = @ContactId;
        
        -- 담당자 삭제 이력 기록
        INSERT INTO [dbo].[VendorHistories]
        (
            [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
        )
        VALUES
        (
            @VendorId, 'contact_delete', @ContactName, NULL, N'담당자 삭제', 'SYSTEM'
        );
        
        COMMIT TRANSACTION;
        
        -- 성공 결과 반환
        SELECT 1 AS Success, N'담당자가 성공적으로 삭제되었습니다.' AS Message;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
            
        -- 에러 정보 반환
        SELECT 
            0 AS Success,
            ERROR_MESSAGE() AS Message,
            ERROR_NUMBER() AS ErrorNumber,
            ERROR_SEVERITY() AS ErrorSeverity,
            ERROR_STATE() AS ErrorState,
            ERROR_PROCEDURE() AS ErrorProcedure,
            ERROR_LINE() AS ErrorLine;
    END CATCH;
END
GO

-- 담당자 목록 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetVendorContacts]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetVendorContacts]
GO

CREATE PROCEDURE [dbo].[sp_GetVendorContacts]
    @VendorId VARCHAR(36)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM [dbo].[VendorContacts]
    WHERE VendorId = @VendorId
    ORDER BY IsPrimary DESC, CreatedAt;
END
GO
