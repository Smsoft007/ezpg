-- =============================================
-- 결제 완료 프로시저
-- =============================================

USE [EZPG]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CompletePayment]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_CompletePayment]
GO

CREATE PROCEDURE [dbo].[sp_CompletePayment]
    @TransactionId VARCHAR(36),
    @PaymentKey VARCHAR(100) = NULL,
    @Amount DECIMAL(18, 2),
    @Metadata NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 트랜잭션 시작
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 거래 존재 여부 확인
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Transactions] WHERE Id = @TransactionId)
        BEGIN
            RAISERROR('거래 정보가 존재하지 않습니다.', 16, 1);
            RETURN;
        END
        
        -- 거래 상태 확인
        DECLARE @CurrentStatus VARCHAR(50);
        DECLARE @CurrentAmount DECIMAL(18, 2);
        
        SELECT 
            @CurrentStatus = Status,
            @CurrentAmount = Amount
        FROM 
            [dbo].[Transactions]
        WHERE 
            Id = @TransactionId;
        
        -- 이미 완료된 거래인지 확인
        IF @CurrentStatus = 'completed'
        BEGIN
            RAISERROR('이미 완료된 거래입니다.', 16, 1);
            RETURN;
        END
        
        -- 취소된 거래인지 확인
        IF @CurrentStatus = 'canceled' OR @CurrentStatus = 'refunded' OR @CurrentStatus = 'partial_refunded'
        BEGIN
            RAISERROR('취소된 거래는 완료할 수 없습니다.', 16, 1);
            RETURN;
        END
        
        -- 금액 일치 여부 확인
        IF @CurrentAmount != @Amount
        BEGIN
            RAISERROR('결제 금액이 일치하지 않습니다.', 16, 1);
            RETURN;
        END
        
        -- 거래 정보 업데이트
        UPDATE [dbo].[Transactions]
        SET 
            Status = 'completed',
            PaymentKey = @PaymentKey,
            CompletedAt = GETDATE(),
            Metadata = CASE 
                WHEN @Metadata IS NULL THEN Metadata
                WHEN Metadata IS NULL THEN @Metadata
                ELSE JSON_MODIFY(Metadata, 'append $', JSON_QUERY(@Metadata))
            END,
            UpdatedAt = GETDATE()
        WHERE 
            Id = @TransactionId;
        
        -- 결과 반환
        SELECT 
            Id AS TransactionId,
            VendorId,
            OrderNumber,
            Amount,
            Status,
            PaymentMethod,
            CompletedAt
        FROM 
            [dbo].[Transactions]
        WHERE 
            Id = @TransactionId;
        
        -- 트랜잭션 커밋
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- 오류 발생 시 롤백
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- 오류 정보 반환
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
GO
