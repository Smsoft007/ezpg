-- =============================================
-- 거래 목록 조회 프로시저
-- =============================================

USE [EZPG]
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetTransactions]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetTransactions]
GO

CREATE PROCEDURE [dbo].[sp_GetTransactions]
    @VendorId VARCHAR(36) = NULL,
    @Status VARCHAR(50) = NULL,
    @PaymentMethod VARCHAR(50) = NULL,
    @StartDate DATETIME = NULL,
    @EndDate DATETIME = NULL,
    @Page INT = 1,
    @PageSize INT = 10
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 페이징 계산
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    
    -- 거래 목록 조회
    SELECT 
        t.*,
        v.Name AS VendorName
    FROM 
        [dbo].[Transactions] t
    LEFT JOIN 
        [dbo].[Vendors] v ON t.VendorId = v.Id
    WHERE 
        (@VendorId IS NULL OR t.VendorId = @VendorId)
        AND (@Status IS NULL OR t.Status = @Status)
        AND (@PaymentMethod IS NULL OR t.PaymentMethod = @PaymentMethod)
        AND (@StartDate IS NULL OR t.CreatedAt >= @StartDate)
        AND (@EndDate IS NULL OR t.CreatedAt <= @EndDate)
    ORDER BY 
        t.CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    -- 총 개수 조회
    SELECT 
        COUNT(*) AS TotalCount
    FROM 
        [dbo].[Transactions] t
    WHERE 
        (@VendorId IS NULL OR t.VendorId = @VendorId)
        AND (@Status IS NULL OR t.Status = @Status)
        AND (@PaymentMethod IS NULL OR t.PaymentMethod = @PaymentMethod)
        AND (@StartDate IS NULL OR t.CreatedAt >= @StartDate)
        AND (@EndDate IS NULL OR t.CreatedAt <= @EndDate);
END
GO
