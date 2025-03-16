-- =============================================
-- 가맹점 결제 설정 관리 프로시저
-- =============================================

USE [EZPG]
GO

-- 결제 설정 추가/수정 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_SetVendorPaymentSetting]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_SetVendorPaymentSetting]
GO

CREATE PROCEDURE [dbo].[sp_SetVendorPaymentSetting]
    @VendorId VARCHAR(36),
    @PaymentMethod VARCHAR(50),
    @IsEnabled BIT,
    @FeeRate DECIMAL(5, 2),
    @FixedFee DECIMAL(10, 2) = 0.00,
    @MinFee DECIMAL(10, 2) = NULL,
    @MaxFee DECIMAL(10, 2) = NULL,
    @SettlementCycle VARCHAR(20) = NULL,
    @Settings NVARCHAR(MAX) = NULL,
    @UpdatedBy VARCHAR(100) = 'SYSTEM'
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
        
        -- 기존 설정 확인
        DECLARE @Exists BIT = 0;
        DECLARE @OldFeeRate DECIMAL(5, 2);
        DECLARE @OldEnabled BIT;
        
        SELECT 
            @Exists = 1,
            @OldFeeRate = FeeRate,
            @OldEnabled = IsEnabled
        FROM [dbo].[VendorPaymentSettings]
        WHERE VendorId = @VendorId AND PaymentMethod = @PaymentMethod;
        
        -- 설정이 존재하면 업데이트, 없으면 삽입
        IF @Exists = 1
        BEGIN
            UPDATE [dbo].[VendorPaymentSettings]
            SET 
                IsEnabled = @IsEnabled,
                FeeRate = @FeeRate,
                FixedFee = @FixedFee,
                MinFee = @MinFee,
                MaxFee = @MaxFee,
                SettlementCycle = @SettlementCycle,
                Settings = @Settings,
                UpdatedAt = GETDATE()
            WHERE VendorId = @VendorId AND PaymentMethod = @PaymentMethod;
            
            -- 주요 변경 사항에 대한 이력 기록
            IF @OldFeeRate <> @FeeRate
            BEGIN
                INSERT INTO [dbo].[VendorHistories]
                (
                    [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
                )
                VALUES
                (
                    @VendorId, 'payment_setting_update', 
                    N'수수료율: ' + CAST(@OldFeeRate AS NVARCHAR(10)) + '%', 
                    N'수수료율: ' + CAST(@FeeRate AS NVARCHAR(10)) + '%', 
                    N'결제 수단 [' + @PaymentMethod + N'] 수수료율 변경', @UpdatedBy
                );
            END
            
            IF @OldEnabled <> @IsEnabled
            BEGIN
                INSERT INTO [dbo].[VendorHistories]
                (
                    [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
                )
                VALUES
                (
                    @VendorId, 'payment_setting_update', 
                    CASE WHEN @OldEnabled = 1 THEN N'활성화' ELSE N'비활성화' END, 
                    CASE WHEN @IsEnabled = 1 THEN N'활성화' ELSE N'비활성화' END, 
                    N'결제 수단 [' + @PaymentMethod + N'] ' + CASE WHEN @IsEnabled = 1 THEN N'활성화' ELSE N'비활성화' END, 
                    @UpdatedBy
                );
            END
        END
        ELSE
        BEGIN
            -- 새 설정 추가
            INSERT INTO [dbo].[VendorPaymentSettings]
            (
                [VendorId], [PaymentMethod], [IsEnabled], [FeeRate], [FixedFee], 
                [MinFee], [MaxFee], [SettlementCycle], [Settings]
            )
            VALUES
            (
                @VendorId, @PaymentMethod, @IsEnabled, @FeeRate, @FixedFee,
                @MinFee, @MaxFee, @SettlementCycle, @Settings
            );
            
            -- 설정 추가 이력 기록
            INSERT INTO [dbo].[VendorHistories]
            (
                [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
            )
            VALUES
            (
                @VendorId, 'payment_setting_add', NULL, 
                N'결제 수단: ' + @PaymentMethod + N', 수수료율: ' + CAST(@FeeRate AS NVARCHAR(10)) + '%', 
                N'결제 수단 설정 추가', @UpdatedBy
            );
        END
        
        COMMIT TRANSACTION;
        
        -- 설정 정보 반환
        SELECT * 
        FROM [dbo].[VendorPaymentSettings] 
        WHERE VendorId = @VendorId AND PaymentMethod = @PaymentMethod;
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

-- 결제 설정 조회 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetVendorPaymentSettings]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetVendorPaymentSettings]
GO

CREATE PROCEDURE [dbo].[sp_GetVendorPaymentSettings]
    @VendorId VARCHAR(36),
    @PaymentMethod VARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT *
    FROM [dbo].[VendorPaymentSettings]
    WHERE 
        VendorId = @VendorId
        AND (@PaymentMethod IS NULL OR PaymentMethod = @PaymentMethod)
    ORDER BY PaymentMethod;
END
GO

-- 결제 설정 삭제 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DeleteVendorPaymentSetting]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_DeleteVendorPaymentSetting]
GO

CREATE PROCEDURE [dbo].[sp_DeleteVendorPaymentSetting]
    @VendorId VARCHAR(36),
    @PaymentMethod VARCHAR(50),
    @UpdatedBy VARCHAR(100) = 'SYSTEM'
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 설정이 존재하는지 확인
        IF NOT EXISTS (SELECT 1 FROM [dbo].[VendorPaymentSettings] WHERE VendorId = @VendorId AND PaymentMethod = @PaymentMethod)
        BEGIN
            SELECT 0 AS Success, N'해당 결제 설정이 존재하지 않습니다.' AS Message;
            RETURN;
        END
        
        -- 설정 삭제
        DELETE FROM [dbo].[VendorPaymentSettings]
        WHERE VendorId = @VendorId AND PaymentMethod = @PaymentMethod;
        
        -- 설정 삭제 이력 기록
        INSERT INTO [dbo].[VendorHistories]
        (
            [VendorId], [ChangeType], [PreviousValue], [NewValue], [ChangeReason], [ChangedBy]
        )
        VALUES
        (
            @VendorId, 'payment_setting_delete', @PaymentMethod, NULL, 
            N'결제 수단 [' + @PaymentMethod + N'] 설정 삭제', @UpdatedBy
        );
        
        COMMIT TRANSACTION;
        
        -- 성공 결과 반환
        SELECT 1 AS Success, N'결제 설정이 성공적으로 삭제되었습니다.' AS Message;
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

-- 가맹점 결제 수단별 거래 통계 프로시저
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetVendorPaymentMethodStats]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetVendorPaymentMethodStats]
GO

CREATE PROCEDURE [dbo].[sp_GetVendorPaymentMethodStats]
    @VendorId VARCHAR(36),
    @StartDate DATE = NULL,
    @EndDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 날짜 범위가 지정되지 않은 경우 기본값 설정 (최근 30일)
    IF @StartDate IS NULL
        SET @StartDate = DATEADD(DAY, -30, GETDATE());
    
    IF @EndDate IS NULL
        SET @EndDate = GETDATE();
    
    -- VendorPaymentSettings 테이블 존재 여부 확인
    IF OBJECT_ID('dbo.VendorPaymentSettings', 'U') IS NULL
    BEGIN
        -- 빈 결과셋 반환
        SELECT 
            '' AS PaymentMethod,
            0 AS TotalCount,
            0 AS CompletedCount,
            0 AS FailedCount,
            0 AS PendingCount,
            0 AS TotalAmount,
            0 AS CompletedAmount,
            0 AS TotalFee,
            0 AS IsEnabled,
            0 AS FeeRate,
            0 AS FixedFee,
            NULL AS MinFee,
            NULL AS MaxFee,
            NULL AS SettlementCycle,
            0 AS SuccessRate,
            0 AS EffectiveFeeRate
        WHERE 1 = 0;
        RETURN;
    END
    
    -- Transactions 테이블 존재 여부 확인
    IF OBJECT_ID('dbo.Transactions', 'U') IS NOT NULL
    BEGIN
        -- Fee 필드 존재 여부 확인
        DECLARE @HasFeeColumn BIT = 0;
        
        IF EXISTS (
            SELECT 1 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'Transactions' 
            AND COLUMN_NAME = 'Fee'
        )
        BEGIN
            SET @HasFeeColumn = 1;
        END
        
        -- 결제 수단별 설정 정보 조회
        WITH PaymentSettings AS (
            SELECT 
                PaymentMethod,
                IsEnabled,
                FeeRate,
                FixedFee,
                MinFee,
                MaxFee,
                SettlementCycle
            FROM [dbo].[VendorPaymentSettings]
            WHERE VendorId = @VendorId
        ),
        -- 결제 수단별 거래 통계 조회
        PaymentStats AS (
            SELECT 
                PaymentMethod,
                COUNT(*) AS TotalCount,
                SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) AS CompletedCount,
                SUM(CASE WHEN Status = 'failed' THEN 1 ELSE 0 END) AS FailedCount,
                SUM(CASE WHEN Status = 'pending' THEN 1 ELSE 0 END) AS PendingCount,
                SUM(Amount) AS TotalAmount,
                SUM(CASE WHEN Status = 'completed' THEN Amount ELSE 0 END) AS CompletedAmount,
                CASE WHEN @HasFeeColumn = 1 THEN SUM(Fee) ELSE 0 END AS TotalFee
            FROM [dbo].[Transactions]
            WHERE 
                VendorId = @VendorId
                AND CAST(CreatedAt AS DATE) BETWEEN @StartDate AND @EndDate
            GROUP BY PaymentMethod
        )
        
        -- 결제 설정과 거래 통계 정보 결합
        SELECT 
            COALESCE(ps.PaymentMethod, s.PaymentMethod) AS PaymentMethod,
            COALESCE(s.TotalCount, 0) AS TotalCount,
            COALESCE(s.CompletedCount, 0) AS CompletedCount,
            COALESCE(s.FailedCount, 0) AS FailedCount,
            COALESCE(s.PendingCount, 0) AS PendingCount,
            COALESCE(s.TotalAmount, 0) AS TotalAmount,
            COALESCE(s.CompletedAmount, 0) AS CompletedAmount,
            COALESCE(s.TotalFee, 0) AS TotalFee,
            ps.IsEnabled,
            ps.FeeRate,
            ps.FixedFee,
            ps.MinFee,
            ps.MaxFee,
            ps.SettlementCycle,
            CASE 
                WHEN s.TotalCount > 0 THEN 
                    CAST((CAST(s.CompletedCount AS FLOAT) / CAST(s.TotalCount AS FLOAT)) * 100 AS DECIMAL(5,2))
                ELSE 0 
            END AS SuccessRate,
            CASE 
                WHEN s.CompletedAmount > 0 THEN 
                    CAST((CAST(s.TotalFee AS FLOAT) / CAST(s.CompletedAmount AS FLOAT)) * 100 AS DECIMAL(5,2))
                ELSE 0 
            END AS EffectiveFeeRate
        FROM PaymentSettings ps
        FULL OUTER JOIN PaymentStats s ON ps.PaymentMethod = s.PaymentMethod
        ORDER BY COALESCE(s.CompletedAmount, 0) DESC;
    END
    ELSE
    BEGIN
        -- Transactions 테이블이 존재하지 않는 경우 결제 설정 정보만 반환
        SELECT 
            PaymentMethod,
            0 AS TotalCount,
            0 AS CompletedCount,
            0 AS FailedCount,
            0 AS PendingCount,
            0 AS TotalAmount,
            0 AS CompletedAmount,
            0 AS TotalFee,
            IsEnabled,
            FeeRate,
            FixedFee,
            MinFee,
            MaxFee,
            SettlementCycle,
            0 AS SuccessRate,
            0 AS EffectiveFeeRate
        FROM [dbo].[VendorPaymentSettings]
        WHERE VendorId = @VendorId
        ORDER BY PaymentMethod;
    END
END
GO
