-- =============================================
-- 가맹점 목록 조회 저장 프로시저
-- =============================================
CREATE PROCEDURE [dbo].[sp_GetMerchantList]
    @Name NVARCHAR(100) = NULL,
    @BusinessNumber NVARCHAR(20) = NULL,
    @Status NVARCHAR(20) = NULL,
    @Page INT = 1,
    @PageSize INT = 10,
    @SortColumn NVARCHAR(50) = 'Id',
    @SortOrder NVARCHAR(4) = 'ASC'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @Params NVARCHAR(MAX);
    DECLARE @WhereClause NVARCHAR(MAX) = ' WHERE 1=1 ';
    DECLARE @OrderByClause NVARCHAR(MAX);
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    
    -- 검색 조건 추가
    IF @Name IS NOT NULL AND @Name <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND Name LIKE ''%'' + @Name + ''%'' ';
    END
    
    IF @BusinessNumber IS NOT NULL AND @BusinessNumber <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND BusinessNumber LIKE ''%'' + @BusinessNumber + ''%'' ';
    END
    
    IF @Status IS NOT NULL AND @Status <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND Status = @Status ';
    END
    
    -- 정렬 조건 설정
    SET @OrderByClause = ' ORDER BY ' + 
        CASE 
            WHEN @SortColumn = 'Id' THEN 'Id'
            WHEN @SortColumn = 'Name' THEN 'Name'
            WHEN @SortColumn = 'BusinessNumber' THEN 'BusinessNumber'
            WHEN @SortColumn = 'RepresentativeName' THEN 'RepresentativeName'
            WHEN @SortColumn = 'Status' THEN 'Status'
            WHEN @SortColumn = 'CreatedAt' THEN 'CreatedAt'
            WHEN @SortColumn = 'UpdatedAt' THEN 'UpdatedAt'
            ELSE 'Id'
        END + 
        CASE 
            WHEN @SortOrder = 'DESC' THEN ' DESC'
            ELSE ' ASC'
        END;
    
    -- 전체 레코드 수 조회
    DECLARE @TotalCount INT;
    DECLARE @TotalSQL NVARCHAR(MAX);
    
    SET @TotalSQL = N'
        SELECT @TotalCount = COUNT(*)
        FROM Merchants' + @WhereClause;
    
    SET @Params = N'
        @Name NVARCHAR(100),
        @BusinessNumber NVARCHAR(20),
        @Status NVARCHAR(20),
        @TotalCount INT OUTPUT';
    
    EXEC sp_executesql @TotalSQL, @Params, 
        @Name = @Name,
        @BusinessNumber = @BusinessNumber,
        @Status = @Status,
        @TotalCount = @TotalCount OUTPUT;
    
    -- 페이지네이션 정보 계산
    DECLARE @TotalPages INT = CEILING(CAST(@TotalCount AS FLOAT) / @PageSize);
    
    -- 데이터 조회 쿼리 구성
    SET @SQL = N'
        SELECT 
            Id,
            Name,
            BusinessNumber,
            RepresentativeName,
            Status,
            Email,
            Phone,
            ZipCode,
            Address1,
            Address2,
            BankName,
            AccountNumber,
            AccountHolder,
            PaymentFeeRate,
            WithdrawalFee,
            CreatedAt,
            UpdatedAt,
            ' + CAST(@TotalCount AS NVARCHAR(20)) + ' AS TotalCount,
            ' + CAST(@TotalPages AS NVARCHAR(20)) + ' AS TotalPages
        FROM Merchants' + 
        @WhereClause + 
        @OrderByClause + '
        OFFSET @Offset ROWS
        FETCH NEXT @PageSize ROWS ONLY';
    
    SET @Params = N'
        @Name NVARCHAR(100),
        @BusinessNumber NVARCHAR(20),
        @Status NVARCHAR(20),
        @Offset INT,
        @PageSize INT';
    
    -- 최종 쿼리 실행
    EXEC sp_executesql @SQL, @Params, 
        @Name = @Name,
        @BusinessNumber = @BusinessNumber,
        @Status = @Status,
        @Offset = @Offset,
        @PageSize = @PageSize;
END
