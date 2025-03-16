-- =============================================
-- 결제 취소 프로시저
-- =============================================

USE [EZPG]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CancelPayment]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_CancelPayment]
GO

CREATE PROCEDURE [dbo].[sp_CancelPayment]
    @TransactionId VARCHAR(36),
    @Reason NVARCHAR(500),
    @RefundAmount DECIMAL(18, 2) = NULL,
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
        
        -- 이미 취소된 거래인지 확인
        IF @CurrentStatus = 'canceled' OR @CurrentStatus = 'refunded' OR @CurrentStatus = 'partial_refunded'
        BEGIN
            RAISERROR('이미 취소된 거래입니다.', 16, 1);
            RETURN;
        END
        
        -- 완료되지 않은 거래인지 확인
        IF @CurrentStatus != 'completed'
        BEGIN
            -- 완료되지 않은 거래는 취소 상태로 변경
            UPDATE [dbo].[Transactions]
            SET 
                Status = 'canceled',
                CanceledAt = GETDATE(),
                CancelReason = @Reason,
                Metadata = CASE 
                    WHEN @Metadata IS NULL THEN Metadata
                    WHEN Metadata IS NULL THEN @Metadata
                    ELSE JSON_MODIFY(Metadata, 'append $', JSON_QUERY(@Metadata))
                END,
                UpdatedAt = GETDATE()
            WHERE 
                Id = @TransactionId;
        END
        ELSE
        BEGIN
            -- 환불 금액 설정
            DECLARE @ActualRefundAmount DECIMAL(18, 2) = ISNULL(@RefundAmount, @CurrentAmount);
            
            -- 환불 금액 검증
            IF @ActualRefundAmount <= 0 OR @ActualRefundAmount > @CurrentAmount
            BEGIN
                RAISERROR('유효하지 않은 환불 금액입니다.', 16, 1);
                RETURN;
            END
            
            -- 부분 환불 여부 확인
            DECLARE @NewStatus VARCHAR(50) = CASE 
                WHEN @ActualRefundAmount = @CurrentAmount THEN 'refunded'
                ELSE 'partial_refunded'
            END;
            
            -- 거래 정보 업데이트
            UPDATE [dbo].[Transactions]
            SET 
                Status = @NewStatus,
                RefundedAt = GETDATE(),
                RefundAmount = @ActualRefundAmount,
                CancelReason = @Reason,
                Metadata = CASE 
                    WHEN @Metadata IS NULL THEN Metadata
                    WHEN Metadata IS NULL THEN @Metadata
                    ELSE JSON_MODIFY(Metadata, 'append $', JSON_QUERY(@Metadata))
                END,
                UpdatedAt = GETDATE()
            WHERE 
                Id = @TransactionId;
            
            -- 환불 내역 저장
            INSERT INTO [dbo].[RefundHistory] (
                Id,
                TransactionId,
                Amount,
                Reason,
                CreatedAt
            ) VALUES (
                NEWID(),
                @TransactionId,
                @ActualRefundAmount,
                @Reason,
                GETDATE()
            );
        END
        
        -- 결과 반환
        SELECT 
            Id AS TransactionId,
            VendorId,
            OrderNumber,
            Amount,
            Status,
            PaymentMethod,
            RefundAmount,
            CancelReason,
            CanceledAt,
            RefundedAt
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
