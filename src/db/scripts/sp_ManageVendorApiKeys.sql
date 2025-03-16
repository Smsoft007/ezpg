-- =============================================
-- 가맹점 API 키 관리 프로시저
-- =============================================

USE [EzPayDB]
GO

-- API 키 생성 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateVendorApiKey]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_CreateVendorApiKey]
GO

CREATE PROCEDURE [dbo].[sp_CreateVendorApiKey]
    @VendorId VARCHAR(36),
    @ApiKey VARCHAR(64),
    @SecretKey VARCHAR(64),
    @Name NVARCHAR(100) = NULL,
    @Environment VARCHAR(20) = 'test',
    @ExpiryDate DATETIME = NULL,
    @AllowedIps VARCHAR(255) = NULL,
    @CreatedBy VARCHAR(100) = 'SYSTEM'
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
        
        -- 가맹점 상태 확인
        DECLARE @VendorStatus VARCHAR(20);
        
        SELECT @VendorStatus = Status
        FROM [dbo].[Vendors]
        WHERE Id = @VendorId;
        
        IF @VendorStatus IN ('suspended', 'terminated')
        BEGIN
            RAISERROR(N'정지되었거나 해지된 가맹점은 API 키를 생성할 수 없습니다.', 16, 1);
            RETURN;
        END
        
        -- API 키 중복 확인
        IF EXISTS (SELECT 1 FROM [dbo].[VendorApiKeys] WHERE ApiKey = @ApiKey)
        BEGIN
            RAISERROR(N'이미 사용 중인 API 키입니다.', 16, 1);
            RETURN;
        END
        
        -- API 키 생성
        INSERT INTO [dbo].[VendorApiKeys]
        (
            [VendorId], [ApiKey], [SecretKey], [Name], [Environment], [Status], [ExpiryDate], [AllowedIps]
        )
        VALUES
        (
            @VendorId, @ApiKey, @SecretKey, @Name, @Environment, 'active', @ExpiryDate, @AllowedIps
        );
        
        -- API 키 생성 이력 기록
        INSERT INTO [dbo].[VendorHistories]
        (
            [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
        )
        VALUES
        (
            @VendorId, 'api_key_creation', NULL, 
            @Environment + ' 환경 API 키 생성: ' + LEFT(@ApiKey, 8) + '******', 
            N'API 키 생성', @CreatedBy
        );
        
        COMMIT TRANSACTION;
        
        -- 생성된 API 키 정보 반환
        SELECT * FROM [dbo].[VendorApiKeys] WHERE ApiKey = @ApiKey;
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

-- API 키 비활성화 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DeactivateVendorApiKey]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_DeactivateVendorApiKey]
GO

CREATE PROCEDURE [dbo].[sp_DeactivateVendorApiKey]
    @ApiKeyId INT,
    @Reason NVARCHAR(500) = NULL,
    @UpdatedBy VARCHAR(100) = 'SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- API 키 정보 확인
        DECLARE @VendorId VARCHAR(36);
        DECLARE @ApiKey VARCHAR(64);
        DECLARE @CurrentStatus VARCHAR(20);
        
        SELECT 
            @VendorId = VendorId, 
            @ApiKey = ApiKey,
            @CurrentStatus = Status
        FROM [dbo].[VendorApiKeys]
        WHERE Id = @ApiKeyId;
        
        -- API 키가 존재하지 않으면 오류 반환
        IF @VendorId IS NULL
        BEGIN
            RAISERROR(N'존재하지 않는 API 키입니다.', 16, 1);
            RETURN;
        END
        
        -- 이미 비활성화된 API 키인 경우
        IF @CurrentStatus <> 'active'
        BEGIN
            SELECT 1 AS Success, N'이미 비활성화된 API 키입니다.' AS Message;
            RETURN;
        END
        
        -- API 키 비활성화
        UPDATE [dbo].[VendorApiKeys]
        SET 
            Status = 'inactive',
            UpdatedAt = GETDATE()
        WHERE Id = @ApiKeyId;
        
        -- API 키 비활성화 이력 기록
        INSERT INTO [dbo].[VendorHistories]
        (
            [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
        )
        VALUES
        (
            @VendorId, 'api_key_deactivation', 'active', 'inactive', 
            ISNULL(@Reason, N'API 키 비활성화'), @UpdatedBy
        );
        
        COMMIT TRANSACTION;
        
        -- 성공 결과 반환
        SELECT 1 AS Success, N'API 키가 성공적으로 비활성화되었습니다.' AS Message;
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

-- API 키 목록 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetVendorApiKeys]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetVendorApiKeys]
GO

CREATE PROCEDURE [dbo].[sp_GetVendorApiKeys]
    @VendorId VARCHAR(36),
    @Environment VARCHAR(20) = NULL,
    @Status VARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ak.Id,
        ak.VendorId,
        v.VendorName,
        ak.ApiKey,
        LEFT(ak.SecretKey, 4) + '************' AS MaskedSecretKey,
        ak.Name,
        ak.Environment,
        ak.Status,
        ak.ExpiryDate,
        ak.AllowedIps,
        ak.CreatedAt,
        ak.UpdatedAt,
        ak.LastUsedAt
    FROM [dbo].[VendorApiKeys] ak
    JOIN [dbo].[Vendors] v ON ak.VendorId = v.Id
    WHERE 
        ak.VendorId = @VendorId
        AND (@Environment IS NULL OR ak.Environment = @Environment)
        AND (@Status IS NULL OR ak.Status = @Status)
    ORDER BY ak.Environment, ak.CreatedAt DESC;
END
GO

-- API 키 재발급 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_RegenerateVendorSecretKey]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_RegenerateVendorSecretKey]
GO

CREATE PROCEDURE [dbo].[sp_RegenerateVendorSecretKey]
    @ApiKeyId INT,
    @NewSecretKey VARCHAR(64),
    @Reason NVARCHAR(500) = NULL,
    @UpdatedBy VARCHAR(100) = 'SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- API 키 정보 확인
        DECLARE @VendorId VARCHAR(36);
        DECLARE @ApiKey VARCHAR(64);
        DECLARE @CurrentStatus VARCHAR(20);
        
        SELECT 
            @VendorId = VendorId, 
            @ApiKey = ApiKey,
            @CurrentStatus = Status
        FROM [dbo].[VendorApiKeys]
        WHERE Id = @ApiKeyId;
        
        -- API 키가 존재하지 않으면 오류 반환
        IF @VendorId IS NULL
        BEGIN
            RAISERROR(N'존재하지 않는 API 키입니다.', 16, 1);
            RETURN;
        END
        
        -- 비활성화된 API 키인 경우
        IF @CurrentStatus <> 'active'
        BEGIN
            RAISERROR(N'비활성화된 API 키는 시크릿 키를 재발급할 수 없습니다.', 16, 1);
            RETURN;
        END
        
        -- 시크릿 키 재발급
        UPDATE [dbo].[VendorApiKeys]
        SET 
            SecretKey = @NewSecretKey,
            UpdatedAt = GETDATE()
        WHERE Id = @ApiKeyId;
        
        -- 시크릿 키 재발급 이력 기록
        INSERT INTO [dbo].[VendorHistories]
        (
            [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
        )
        VALUES
        (
            @VendorId, 'secret_key_regeneration', NULL, 
            N'API 키 ' + LEFT(@ApiKey, 8) + '****** 의 시크릿 키 재발급', 
            ISNULL(@Reason, N'시크릿 키 재발급'), @UpdatedBy
        );
        
        COMMIT TRANSACTION;
        
        -- 재발급된 API 키 정보 반환
        SELECT 
            Id,
            VendorId,
            ApiKey,
            SecretKey,
            Name,
            Environment,
            Status,
            ExpiryDate,
            AllowedIps,
            CreatedAt,
            UpdatedAt,
            LastUsedAt
        FROM [dbo].[VendorApiKeys] 
        WHERE Id = @ApiKeyId;
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
