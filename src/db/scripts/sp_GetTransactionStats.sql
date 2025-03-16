-- =============================================
-- 거래 통계 조회 프로시저
-- =============================================

USE [EZPG]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetTransactionStats]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetTransactionStats]
GO

CREATE PROCEDURE [dbo].[sp_GetTransactionStats]
    @VendorId VARCHAR(36) = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 기본값 설정
    SET @StartDate = ISNULL(@StartDate, DATEADD(DAY, -30, GETDATE()));
    SET @EndDate = ISNULL(@EndDate, GETDATE());
    
    -- 요약 통계 조회
    SELECT
        COUNT(*) AS TotalCount,
        SUM(Amount) AS TotalAmount,
        SUM(CASE WHEN Status = 'completed' THEN 1 ELSE 0 END) AS CompletedCount,
        SUM(CASE WHEN Status = 'completed' THEN Amount ELSE 0 END) AS CompletedAmount,
        SUM(CASE WHEN Status IN ('canceled', 'refunded', 'partial_refunded') THEN 1 ELSE 0 END) AS CanceledCount,
        SUM(CASE WHEN Status IN ('canceled', 'refunded', 'partial_refunded') THEN Amount ELSE 0 END) AS CanceledAmount,
        SUM(CASE WHEN Status = 'pending' THEN 1 ELSE 0 END) AS PendingCount,
        SUM(CASE WHEN Status = 'pending' THEN Amount ELSE 0 END) AS PendingAmount
    FROM
        [dbo].[Transactions]
    WHERE
        (@VendorId IS NULL OR VendorId = @VendorId)
        AND CreatedAt >= @StartDate
        AND CreatedAt <= @EndDate;
    
    -- 일별 통계 조회
    SELECT
        CONVERT(DATE, CreatedAt) AS [Date],
        COUNT(*) AS [Count],
        SUM(Amount) AS Amount
    FROM
        [dbo].[Transactions]
    WHERE
        (@VendorId IS NULL OR VendorId = @VendorId)
        AND CreatedAt >= @StartDate
        AND CreatedAt <= @EndDate
    GROUP BY CONVERT(DATE, CreatedAt)
    ORDER BY [Date];
    
    -- 결제 방법별 통계 조회
    SELECT
        PaymentMethod,
        COUNT(*) AS [Count],
        SUM(Amount) AS Amount
    FROM
        [dbo].[Transactions]
    WHERE
        (@VendorId IS NULL OR VendorId = @VendorId)
        AND CreatedAt >= @StartDate
        AND CreatedAt <= @EndDate
    GROUP BY PaymentMethod
    ORDER BY [Count] DESC;
END
GO
