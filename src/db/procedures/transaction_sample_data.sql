-- 거래 관련 샘플 데이터 생성 스크립트

-- 기존 데이터 삭제 (테스트 환경에서만 사용)
/*
DELETE FROM [dbo].[TransactionLogs];
DELETE FROM [dbo].[BatchOperationItems];
DELETE FROM [dbo].[BatchOperations];
DELETE FROM [dbo].[DepositTransactions];
DELETE FROM [dbo].[WithdrawalTransactions];
DELETE FROM [dbo].[Transactions];
*/

-- 샘플 데이터 생성
BEGIN TRANSACTION;

BEGIN TRY
    -- 변수 선언
    DECLARE @CurrentDateTime DATETIME = GETDATE();
    DECLARE @MerchantId1 NVARCHAR(50) = 'merchant_123456';
    DECLARE @MerchantId2 NVARCHAR(50) = 'merchant_789012';
    DECLARE @TransactionId NVARCHAR(50);
    DECLARE @LogId NVARCHAR(50);
    DECLARE @BatchId NVARCHAR(50) = NEWID();
    DECLARE @i INT = 1;
    DECLARE @Status NVARCHAR(20);
    DECLARE @Amount DECIMAL(18, 2);
    DECLARE @CreatedAt DATETIME;
    DECLARE @TransactionType NVARCHAR(20);
    DECLARE @PaymentMethod NVARCHAR(20);
    
    -- 배치 작업 생성
    INSERT INTO [dbo].[BatchOperations]
       ([BatchId]
       ,[Type]
       ,[Status]
       ,[TotalItems]
       ,[ProcessedItems]
       ,[SuccessItems]
       ,[FailedItems]
       ,[CreatedAt]
       ,[StartedAt]
       ,[CompletedAt]
       ,[CreatedBy]
       ,[FileName])
    VALUES
       (@BatchId
       ,'withdrawal'
       ,'completed'
       ,5
       ,5
       ,4
       ,1
       ,DATEADD(DAY, -7, @CurrentDateTime)
       ,DATEADD(DAY, -7, @CurrentDateTime)
       ,DATEADD(DAY, -7, @CurrentDateTime)
       ,@MerchantId1
       ,'sample_withdrawals.csv');
    
    -- 샘플 거래 데이터 생성 (30개)
    WHILE @i <= 30
    BEGIN
        SET @TransactionId = 'txn_' + CONVERT(NVARCHAR(50), NEWID());
        SET @LogId = NEWID();
        
        -- 랜덤 값 설정
        SET @Amount = CAST((RAND() * 9000000) + 100000 AS DECIMAL(18, 2));
        SET @CreatedAt = DATEADD(DAY, -CAST((RAND() * 30) AS INT), @CurrentDateTime);
        
        -- 거래 유형 결정 (입금 또는 출금)
        IF @i % 2 = 0
            SET @TransactionType = 'deposit'
        ELSE
            SET @TransactionType = 'withdrawal';
        
        -- 상태 결정
        IF @i % 5 = 0
            SET @Status = 'failed'
        ELSE IF @i % 7 = 0
            SET @Status = 'pending'
        ELSE IF @i % 11 = 0
            SET @Status = 'cancelled'
        ELSE
            SET @Status = 'completed';
        
        -- 결제 방법 결정
        IF @TransactionType = 'deposit'
        BEGIN
            IF @i % 3 = 0
                SET @PaymentMethod = 'virtual_account'
            ELSE IF @i % 4 = 0
                SET @PaymentMethod = 'credit_card'
            ELSE
                SET @PaymentMethod = 'bank_transfer';
        END
        ELSE
        BEGIN
            SET @PaymentMethod = 'bank';
        END
        
        -- 기본 거래 정보 삽입
        INSERT INTO [dbo].[Transactions]
           ([TransactionId]
           ,[MerchantId]
           ,[Amount]
           ,[Status]
           ,[PaymentMethod]
           ,[Type]
           ,[Currency]
           ,[CreatedAt]
           ,[UpdatedAt]
           ,[CustomerName]
           ,[CustomerEmail]
           ,[CustomerPhone]
           ,[Description]
           ,[ExternalId]
           ,[FailureReason]
           ,[FailureCode])
        VALUES
           (@TransactionId
           ,CASE WHEN @i % 3 = 0 THEN @MerchantId2 ELSE @MerchantId1 END
           ,@Amount
           ,@Status
           ,@PaymentMethod
           ,@TransactionType
           ,'KRW'
           ,@CreatedAt
           ,@CreatedAt
           ,CASE 
                WHEN @i % 4 = 0 THEN '홍길동'
                WHEN @i % 4 = 1 THEN '김철수'
                WHEN @i % 4 = 2 THEN '이영희'
                ELSE '박민준'
            END
           ,CASE 
                WHEN @i % 4 = 0 THEN 'hong@example.com'
                WHEN @i % 4 = 1 THEN 'kim@example.com'
                WHEN @i % 4 = 2 THEN 'lee@example.com'
                ELSE 'park@example.com'
            END
           ,CASE 
                WHEN @i % 4 = 0 THEN '010-1234-5678'
                WHEN @i % 4 = 1 THEN '010-2345-6789'
                WHEN @i % 4 = 2 THEN '010-3456-7890'
                ELSE '010-4567-8901'
            END
           ,CASE 
                WHEN @TransactionType = 'deposit' THEN '입금 거래 #' + CAST(@i AS NVARCHAR(10))
                ELSE '출금 거래 #' + CAST(@i AS NVARCHAR(10))
            END
           ,'ext_' + CAST(@i AS NVARCHAR(10))
           ,CASE 
                WHEN @Status = 'failed' THEN '처리 중 오류가 발생했습니다.'
                ELSE NULL
            END
           ,CASE 
                WHEN @Status = 'failed' THEN 'ERROR_' + CAST(@i AS NVARCHAR(10))
                ELSE NULL
            END);
        
        -- 입금 거래 세부 정보 삽입
        IF @TransactionType = 'deposit'
        BEGIN
            INSERT INTO [dbo].[DepositTransactions]
               ([TransactionId]
               ,[AccountNumber]
               ,[Depositor]
               ,[VirtualAccountId]
               ,[DepositedAt]
               ,[DepositMethod]
               ,[ReceiptUrl])
            VALUES
               (@TransactionId
               ,CASE 
                    WHEN @i % 3 = 0 THEN '123-456-789012'
                    WHEN @i % 3 = 1 THEN '234-567-890123'
                    ELSE '345-678-901234'
                END
               ,CASE 
                    WHEN @i % 4 = 0 THEN '홍길동'
                    WHEN @i % 4 = 1 THEN '김철수'
                    WHEN @i % 4 = 2 THEN '이영희'
                    ELSE '박민준'
                END
               ,CASE 
                    WHEN @PaymentMethod = 'virtual_account' THEN 'va_' + CAST(@i AS NVARCHAR(10))
                    ELSE NULL
                END
               ,CASE 
                    WHEN @Status = 'completed' THEN @CreatedAt
                    ELSE NULL
                END
               ,@PaymentMethod
               ,CASE 
                    WHEN @Status = 'completed' THEN 'https://example.com/receipts/' + @TransactionId
                    ELSE NULL
                END);
        END
        -- 출금 거래 세부 정보 삽입
        ELSE
        BEGIN
            INSERT INTO [dbo].[WithdrawalTransactions]
               ([TransactionId]
               ,[BankCode]
               ,[AccountNumber]
               ,[AccountHolder]
               ,[WithdrawalFee]
               ,[ApprovalStatus]
               ,[ApprovedBy]
               ,[ApprovedAt]
               ,[WithdrawalMethod]
               ,[WithdrawalReference])
            VALUES
               (@TransactionId
               ,CASE 
                    WHEN @i % 5 = 0 THEN '004'  -- 국민은행
                    WHEN @i % 5 = 1 THEN '088'  -- 신한은행
                    WHEN @i % 5 = 2 THEN '020'  -- 우리은행
                    WHEN @i % 5 = 3 THEN '081'  -- 하나은행
                    ELSE '003'  -- 기업은행
                END
               ,CASE 
                    WHEN @i % 3 = 0 THEN '123-456-789012'
                    WHEN @i % 3 = 1 THEN '234-567-890123'
                    ELSE '345-678-901234'
                END
               ,CASE 
                    WHEN @i % 4 = 0 THEN '홍길동'
                    WHEN @i % 4 = 1 THEN '김철수'
                    WHEN @i % 4 = 2 THEN '이영희'
                    ELSE '박민준'
                END
               ,CAST((RAND() * 1000) AS DECIMAL(18, 2))
               ,CASE 
                    WHEN @Status = 'completed' THEN 'approved'
                    WHEN @Status = 'failed' THEN 'rejected'
                    WHEN @Status = 'cancelled' THEN 'rejected'
                    ELSE 'pending'
                END
               ,CASE 
                    WHEN @Status = 'completed' OR @Status = 'failed' THEN 'admin_user'
                    ELSE NULL
                END
               ,CASE 
                    WHEN @Status = 'completed' OR @Status = 'failed' THEN DATEADD(HOUR, 2, @CreatedAt)
                    ELSE NULL
                END
               ,'bank_transfer'
               ,CASE 
                    WHEN @Status = 'completed' THEN 'ref_' + CAST(@i AS NVARCHAR(10))
                    ELSE NULL
                END);
            
            -- 배치 작업 아이템 추가 (처음 5개 출금 거래만)
            IF @i <= 10 AND @TransactionType = 'withdrawal'
            BEGIN
                INSERT INTO [dbo].[BatchOperationItems]
                   ([ItemId]
                   ,[BatchId]
                   ,[TransactionId]
                   ,[Status]
                   ,[Data]
                   ,[ErrorMessage]
                   ,[ProcessedAt])
                VALUES
                   (NEWID()
                   ,@BatchId
                   ,@TransactionId
                   ,CASE 
                        WHEN @i = 9 THEN 'failed'
                        ELSE 'success'
                    END
                   ,CASE 
                        WHEN @i = 9 THEN '{"accountNumber": "123-456-789012", "amount": "1000000"}'
                        ELSE '{"accountNumber": "123-456-789012", "amount": "1000000"}'
                    END
                   ,CASE 
                        WHEN @i = 9 THEN '계좌 정보 불일치'
                        ELSE NULL
                    END
                   ,DATEADD(DAY, -7, @CurrentDateTime));
            END
        END
        
        -- 거래 로그 기록
        INSERT INTO [dbo].[TransactionLogs]
           ([LogId]
           ,[TransactionId]
           ,[Action]
           ,[Status]
           ,[Message]
           ,[Timestamp]
           ,[PerformedBy]
           ,[Details]
           ,[IpAddress]
           ,[UserAgent])
        VALUES
           (@LogId
           ,@TransactionId
           ,'create'
           ,CASE 
                WHEN @Status = 'pending' THEN 'pending'
                ELSE 'created'
            END
           ,CASE 
                WHEN @TransactionType = 'deposit' THEN '입금 거래가 생성되었습니다.'
                ELSE '출금 거래가 생성되었습니다.'
            END
           ,@CreatedAt
           ,'system'
           ,NULL
           ,'192.168.1.' + CAST(@i AS NVARCHAR(3))
           ,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        -- 완료된 거래에 대한 추가 로그
        IF @Status = 'completed'
        BEGIN
            INSERT INTO [dbo].[TransactionLogs]
               ([LogId]
               ,[TransactionId]
               ,[Action]
               ,[Status]
               ,[Message]
               ,[Timestamp]
               ,[PerformedBy]
               ,[Details]
               ,[IpAddress]
               ,[UserAgent])
            VALUES
               (NEWID()
               ,@TransactionId
               ,CASE 
                    WHEN @TransactionType = 'deposit' THEN 'deposit_complete'
                    ELSE 'approve'
                END
               ,'completed'
               ,CASE 
                    WHEN @TransactionType = 'deposit' THEN '입금이 완료되었습니다.'
                    ELSE '출금이 승인되었습니다.'
                END
               ,DATEADD(HOUR, 1, @CreatedAt)
               ,CASE 
                    WHEN @TransactionType = 'deposit' THEN 'system'
                    ELSE 'admin_user'
                END
               ,NULL
               ,'192.168.1.' + CAST(@i AS NVARCHAR(3))
               ,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        END
        
        -- 실패한 거래에 대한 추가 로그
        IF @Status = 'failed'
        BEGIN
            INSERT INTO [dbo].[TransactionLogs]
               ([LogId]
               ,[TransactionId]
               ,[Action]
               ,[Status]
               ,[Message]
               ,[Timestamp]
               ,[PerformedBy]
               ,[Details]
               ,[IpAddress]
               ,[UserAgent])
            VALUES
               (NEWID()
               ,@TransactionId
               ,CASE 
                    WHEN @TransactionType = 'deposit' THEN 'deposit_failed'
                    ELSE 'reject'
                END
               ,'failed'
               ,CASE 
                    WHEN @TransactionType = 'deposit' THEN '입금 처리 중 오류가 발생했습니다.'
                    ELSE '출금이 거부되었습니다.'
                END
               ,DATEADD(HOUR, 1, @CreatedAt)
               ,CASE 
                    WHEN @TransactionType = 'deposit' THEN 'system'
                    ELSE 'admin_user'
                END
               ,'{"reason": "처리 중 오류가 발생했습니다.", "code": "ERROR_' + CAST(@i AS NVARCHAR(10)) + '"}'
               ,'192.168.1.' + CAST(@i AS NVARCHAR(3))
               ,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        END
        
        -- 취소된 거래에 대한 추가 로그
        IF @Status = 'cancelled'
        BEGIN
            INSERT INTO [dbo].[TransactionLogs]
               ([LogId]
               ,[TransactionId]
               ,[Action]
               ,[Status]
               ,[Message]
               ,[Timestamp]
               ,[PerformedBy]
               ,[Details]
               ,[IpAddress]
               ,[UserAgent])
            VALUES
               (NEWID()
               ,@TransactionId
               ,'cancel'
               ,'cancelled'
               ,'거래가 취소되었습니다.'
               ,DATEADD(HOUR, 1, @CreatedAt)
               ,CASE 
                    WHEN @i % 2 = 0 THEN 'user_' + CAST(@i AS NVARCHAR(10))
                    ELSE 'admin_user'
                END
               ,'{"reason": "사용자 요청으로 취소되었습니다."}'
               ,'192.168.1.' + CAST(@i AS NVARCHAR(3))
               ,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        END
        
        SET @i = @i + 1;
    END
    
    COMMIT TRANSACTION;
    
    PRINT '샘플 데이터가 성공적으로 생성되었습니다.';
    
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    
    DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
    DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
    DECLARE @ErrorState INT = ERROR_STATE();
    
    PRINT '샘플 데이터 생성 중 오류가 발생했습니다: ' + @ErrorMessage;
    
    RAISERROR (@ErrorMessage, @ErrorSeverity, @ErrorState);
END CATCH;
