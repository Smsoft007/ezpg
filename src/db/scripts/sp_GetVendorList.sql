-- =============================================
-- 가맹점 목록 조회 프로시저
-- =============================================


IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetVendorList]') AND type in (N'P', N'PC'))
    DROP PROCEDURE [dbo].[sp_GetVendorList]
GO

CREATE PROCEDURE [dbo].[sp_GetVendorList]
    @PageNumber INT = 1,
    @PageSize INT = 10,
    @Status VARCHAR(20) = NULL,
    @SearchTerm NVARCHAR(100) = NULL,
    @BusinessType NVARCHAR(50) = NULL,
    @FromDate DATE = NULL,
    @ToDate DATE = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    -- 전체 레코드 수 계산
    SELECT COUNT(*) AS TotalCount
    FROM [dbo].[Vendors] v
    WHERE 
        (@Status IS NULL OR v.Status = @Status)
        AND (@BusinessType IS NULL OR v.BusinessType = @BusinessType)
        AND (@FromDate IS NULL OR v.CreatedAt >= @FromDate)
        AND (@ToDate IS NULL OR v.CreatedAt <= @ToDate)
        AND (@SearchTerm IS NULL OR 
            v.VendorName LIKE '%' + @SearchTerm + '%' OR 
            v.BusinessNumber LIKE '%' + @SearchTerm + '%' OR 
            v.RepresentativeName LIKE '%' + @SearchTerm + '%' OR 
            v.Email LIKE '%' + @SearchTerm + '%');
    
    -- 페이지네이션 적용하여 데이터 조회
    SELECT 
        v.Id,
        v.VendorCode,
        v.VendorName,
        v.BusinessNumber,
        v.RepresentativeName,
        v.PhoneNumber,
        v.Email,
        v.Address,
        v.BusinessType,
        v.BankCode,
        v.BankName,
        v.AccountNumber,
        v.AccountHolder,
        v.Status,
        v.ContractStartDate,
        v.ContractEndDate,
        v.LastSettlementDate,
        v.MemoInternal,
        v.CreatedAt,
        v.UpdatedAt,
        (SELECT COUNT(*) FROM [dbo].[Transactions] t WHERE t.VendorId = v.Id) AS TransactionCount,
        (SELECT COUNT(*) FROM [dbo].[VendorApiKeys] k WHERE k.VendorId = v.Id AND k.Status = 'active') AS ActiveApiKeyCount,
        (SELECT COUNT(*) FROM [dbo].[VendorContacts] c WHERE c.VendorId = v.Id) AS ContactCount
    FROM [dbo].[Vendors] v
    WHERE 
        (@Status IS NULL OR v.Status = @Status)
        AND (@BusinessType IS NULL OR v.BusinessType = @BusinessType)
        AND (@FromDate IS NULL OR v.CreatedAt >= @FromDate)
        AND (@ToDate IS NULL OR v.CreatedAt <= @ToDate)
        AND (@SearchTerm IS NULL OR 
            v.VendorName LIKE '%' + @SearchTerm + '%' OR 
            v.BusinessNumber LIKE '%' + @SearchTerm + '%' OR 
            v.RepresentativeName LIKE '%' + @SearchTerm + '%' OR 
            v.Email LIKE '%' + @SearchTerm + '%')
    ORDER BY v.CreatedAt DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO
