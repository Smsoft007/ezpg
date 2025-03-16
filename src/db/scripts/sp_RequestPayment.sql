-- =============================================
-- 결제 요청 프로시저
-- =============================================

USE [EZPG]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_RequestPayment]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_RequestPayment]
GO

CREATE PROCEDURE [dbo].[sp_RequestPayment]
    @VendorId VARCHAR(36),
    @OrderNumber VARCHAR(100),
    @Amount DECIMAL(18, 2),
    @PaymentMethod VARCHAR(50),
    @CustomerName NVARCHAR(100),
    @CustomerEmail VARCHAR(255) = NULL,
    @CustomerPhone VARCHAR(50) = NULL,
    @ProductName NVARCHAR(255),
    @ReturnUrl VARCHAR(500) = NULL,
    @NotifyUrl VARCHAR(500) = NULL,
    @Metadata NVARCHAR(MAX) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 트랜잭션 시작
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 가맹점 존재 여부 확인
        IF NOT EXISTS (SELECT 1 FROM [dbo].[Vendors] WHERE Id = @VendorId)
        BEGIN
            RAISERROR('가맹점이 존재하지 않습니다.', 16, 1);
            RETURN;
        END
        
        -- 주문번호 중복 확인
        IF EXISTS (SELECT 1 FROM [dbo].[Transactions] WHERE VendorId = @VendorId AND OrderNumber = @OrderNumber)
        BEGIN
            RAISERROR('이미 존재하는 주문번호입니다.', 16, 1);
            RETURN;
        END
        
        -- 거래 ID 생성
        DECLARE @TransactionId VARCHAR(36) = NEWID();
        
        -- 결제 URL 생성 (실제로는 결제 게이트웨이 연동 필요)
        DECLARE @PaymentUrl VARCHAR(500) = 'https://pay.ezpg.co.kr/payment/' + @TransactionId;
        
        -- 가상계좌 정보 (가상계좌 결제인 경우)
        DECLARE @BankCode VARCHAR(10) = NULL;
        DECLARE @BankName NVARCHAR(50) = NULL;
        DECLARE @AccountNumber VARCHAR(50) = NULL;
        DECLARE @AccountHolder NVARCHAR(100) = NULL;
        DECLARE @ExpiresAt DATETIME = NULL;
        
        IF @PaymentMethod = 'virtual_account'
        BEGIN
            -- 가상계좌 정보 설정 (실제로는 결제 게이트웨이 연동 필요)
            SET @BankCode = '004';
            SET @BankName = 'KB국민은행';
            SET @AccountNumber = '123456789' + RIGHT('0000000' + CAST(ABS(CHECKSUM(NEWID())) % 1000 AS VARCHAR), 7);
            SET @AccountHolder = 'EZPG';
            SET @ExpiresAt = DATEADD(DAY, 3, GETDATE()); -- 3일 후 만료
        END
        
        -- 거래 정보 저장
        INSERT INTO [dbo].[Transactions] (
            Id,
            VendorId,
            OrderNumber,
            Amount,
            Status,
            PaymentMethod,
            CustomerName,
            CustomerEmail,
            CustomerPhone,
            ProductName,
            ReturnUrl,
            NotifyUrl,
            PaymentUrl,
            BankCode,
            BankName,
            AccountNumber,
            AccountHolder,
            ExpiresAt,
            Metadata,
            CreatedAt,
            UpdatedAt
        ) VALUES (
            @TransactionId,
            @VendorId,
            @OrderNumber,
            @Amount,
            'pending', -- 초기 상태는 pending
            @PaymentMethod,
            @CustomerName,
            @CustomerEmail,
            @CustomerPhone,
            @ProductName,
            @ReturnUrl,
            @NotifyUrl,
            @PaymentUrl,
            @BankCode,
            @BankName,
            @AccountNumber,
            @AccountHolder,
            @ExpiresAt,
            @Metadata,
            GETDATE(),
            GETDATE()
        );
        
        -- 결과 반환
        SELECT
            @TransactionId AS TransactionId,
            @VendorId AS VendorId,
            @OrderNumber AS OrderNumber,
            @Amount AS Amount,
            'pending' AS Status,
            @PaymentMethod AS PaymentMethod,
            @PaymentUrl AS PaymentUrl,
            @BankCode AS BankCode,
            @BankName AS BankName,
            @AccountNumber AS AccountNumber,
            @AccountHolder AS AccountHolder,
            @ExpiresAt AS ExpiresAt
        
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
