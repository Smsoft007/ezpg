-- =============================================
-- 가맹점 상태 변경 프로시저
-- =============================================

USE [EzPayDB]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateVendorStatus]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_UpdateVendorStatus]
GO

CREATE PROCEDURE [dbo].[sp_UpdateVendorStatus]
    @VendorId VARCHAR(36),
    @Status VARCHAR(20),
    @Reason NVARCHAR(500) = NULL,
    @UpdatedBy VARCHAR(100) = 'SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 기존 상태 조회
        DECLARE @OldStatus VARCHAR(20);
        
        SELECT @OldStatus = Status
        FROM [dbo].[Vendors]
        WHERE Id = @VendorId;
        
        -- 상태가 같으면 업데이트하지 않음
        IF @OldStatus = @Status
        BEGIN
            SELECT 1 AS Success, N'이미 해당 상태입니다.' AS Message;
            RETURN;
        END
        
        -- 가맹점 상태 업데이트
        UPDATE [dbo].[Vendors]
        SET 
            Status = @Status,
            UpdatedAt = GETDATE()
        WHERE Id = @VendorId;
        
        -- 계약 시작/종료일 업데이트
        IF @Status = 'active'
        BEGIN
            UPDATE [dbo].[Vendors]
            SET 
                ContractStartDate = CASE WHEN ContractStartDate IS NULL THEN GETDATE() ELSE ContractStartDate END
            WHERE Id = @VendorId;
        END
        ELSE IF @Status = 'terminated'
        BEGIN
            UPDATE [dbo].[Vendors]
            SET 
                ContractEndDate = GETDATE()
            WHERE Id = @VendorId;
        END
        
        -- 상태 변경 이력 기록
        INSERT INTO [dbo].[VendorHistories]
        (
            [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
        )
        VALUES
        (
            @VendorId, 'status_change', @OldStatus, @Status, ISNULL(@Reason, N'상태 변경'), @UpdatedBy
        );
        
        -- 상태가 'suspended' 또는 'terminated'인 경우 모든 API 키 비활성화
        IF @Status IN ('suspended', 'terminated')
        BEGIN
            UPDATE [dbo].[VendorApiKeys]
            SET 
                Status = 'inactive',
                UpdatedAt = GETDATE()
            WHERE VendorId = @VendorId AND Status = 'active';
            
            -- API 키 비활성화 이력 기록
            INSERT INTO [dbo].[VendorHistories]
            (
                [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
            )
            VALUES
            (
                @VendorId, 'api_key_deactivation', 'active', 'inactive', 
                CASE 
                    WHEN @Status = 'suspended' THEN N'가맹점 이용 정지로 인한 API 키 비활성화'
                    WHEN @Status = 'terminated' THEN N'가맹점 계약 해지로 인한 API 키 비활성화'
                    ELSE N'가맹점 상태 변경으로 인한 API 키 비활성화'
                END,
                @UpdatedBy
            );
        END
        
        COMMIT TRANSACTION;
        
        -- 성공 결과 반환
        SELECT 1 AS Success, N'가맹점 상태가 성공적으로 변경되었습니다: ' + @OldStatus + N' → ' + @Status AS Message;
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
