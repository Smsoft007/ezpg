-- 가맹점 관련 저장 프로시저 생성 스크립트

-- 기존 저장 프로시저 삭제
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetMerchantList]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[sp_GetMerchantList]
    PRINT 'sp_GetMerchantList 프로시저가 삭제되었습니다.'
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GetMerchantById]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[sp_GetMerchantById]
    PRINT 'sp_GetMerchantById 프로시저가 삭제되었습니다.'
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_CreateMerchant]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[sp_CreateMerchant]
    PRINT 'sp_CreateMerchant 프로시저가 삭제되었습니다.'
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateMerchant]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[sp_UpdateMerchant]
    PRINT 'sp_UpdateMerchant 프로시저가 삭제되었습니다.'
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_UpdateMerchantStatus]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[sp_UpdateMerchantStatus]
    PRINT 'sp_UpdateMerchantStatus 프로시저가 삭제되었습니다.'
END
GO

IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_DeleteMerchant]') AND type in (N'P', N'PC'))
BEGIN
    DROP PROCEDURE [dbo].[sp_DeleteMerchant]
    PRINT 'sp_DeleteMerchant 프로시저가 삭제되었습니다.'
END
GO

-- 가맹점 목록 조회 프로시저
GO
CREATE PROCEDURE [dbo].[sp_GetMerchantList]
    @Name NVARCHAR(100) = NULL,
    @BusinessNumber NVARCHAR(20) = NULL,
    @Status NVARCHAR(20) = NULL,
    @Page INT = 1,
    @PageSize INT = 10,
    @SortColumn NVARCHAR(50) = 'Id',
    @SortOrder NVARCHAR(4) = 'DESC'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @ParamDefinition NVARCHAR(1000);
    DECLARE @OrderByClause NVARCHAR(100);
    
    -- 정렬 컬럼 검증 및 설정
    SET @OrderByClause = 
        CASE 
            WHEN @SortColumn IN ('Id', 'Name', 'BusinessNumber', 'RepresentativeName', 'Status') 
            THEN @SortColumn 
            ELSE 'Id' 
        END;
        
    -- 정렬 방향 검증 및 설정
    SET @SortOrder = 
        CASE 
            WHEN @SortOrder IN ('ASC', 'DESC') 
            THEN @SortOrder 
            ELSE 'DESC' 
        END;
    
    -- 총 레코드 수 계산
    SELECT COUNT(*) AS TotalCount,
           CEILING(CAST(COUNT(*) AS FLOAT) / @PageSize) AS TotalPages
    FROM Merchants
    WHERE 
        (@Name IS NULL OR Name LIKE '%' + @Name + '%') AND
        (@BusinessNumber IS NULL OR BusinessNumber LIKE '%' + @BusinessNumber + '%') AND
        (@Status IS NULL OR Status = @Status);
    
    -- 페이징된 결과 반환
    SET @SQL = N'
    SELECT 
        Id, Name, BusinessNumber, RepresentativeName, Status
    FROM Merchants
    WHERE 
        (@Name IS NULL OR Name LIKE ''%'' + @Name + ''%'') AND
        (@BusinessNumber IS NULL OR BusinessNumber LIKE ''%'' + @BusinessNumber + ''%'') AND
        (@Status IS NULL OR Status = @Status)
    ORDER BY ' + @OrderByClause + ' ' + @SortOrder + '
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    ';
    
    SET @ParamDefinition = N'
        @Name NVARCHAR(100),
        @BusinessNumber NVARCHAR(20),
        @Status NVARCHAR(20),
        @Offset INT,
        @PageSize INT
    ';
    
    EXEC sp_executesql @SQL, @ParamDefinition, 
        @Name, @BusinessNumber, @Status, @Offset, @PageSize;
END
GO
PRINT 'sp_GetMerchantList 프로시저가 생성되었습니다.'
GO

-- 가맹점 상세 조회 프로시저
GO
CREATE PROCEDURE [dbo].[sp_GetMerchantById]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        Id, Name, BusinessNumber, RepresentativeName, Status
    FROM Merchants
    WHERE Id = @Id;
END
GO
PRINT 'sp_GetMerchantById 프로시저가 생성되었습니다.'
GO

-- 가맹점 등록 프로시저
GO
CREATE PROCEDURE [dbo].[sp_CreateMerchant]
    @Name NVARCHAR(100),
    @BusinessNumber NVARCHAR(20),
    @RepresentativeName NVARCHAR(50),
    @Status NVARCHAR(20) = 'pending'
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO Merchants (
        Name, BusinessNumber, RepresentativeName, Status
    ) VALUES (
        @Name, @BusinessNumber, @RepresentativeName, @Status
    );
    
    -- 새로 생성된 가맹점 ID 반환
    DECLARE @NewId INT = SCOPE_IDENTITY();
    
    -- 생성된 가맹점 정보 반환
    SELECT 
        Id, Name, BusinessNumber, RepresentativeName, Status
    FROM Merchants
    WHERE Id = @NewId;
END
GO
PRINT 'sp_CreateMerchant 프로시저가 생성되었습니다.'
GO

-- 가맹점 수정 프로시저
GO
CREATE PROCEDURE [dbo].[sp_UpdateMerchant]
    @Id INT,
    @Name NVARCHAR(100),
    @BusinessNumber NVARCHAR(20),
    @RepresentativeName NVARCHAR(50),
    @Status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Merchants
    SET 
        Name = @Name,
        BusinessNumber = @BusinessNumber,
        RepresentativeName = @RepresentativeName,
        Status = @Status
    WHERE Id = @Id;
    
    -- 수정된 가맹점 정보 반환
    SELECT 
        Id, Name, BusinessNumber, RepresentativeName, Status
    FROM Merchants
    WHERE Id = @Id;
END
GO
PRINT 'sp_UpdateMerchant 프로시저가 생성되었습니다.'
GO

-- 가맹점 상태 변경 프로시저
GO
CREATE PROCEDURE [dbo].[sp_UpdateMerchantStatus]
    @Id INT,
    @Status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE Merchants
    SET 
        Status = @Status
    WHERE Id = @Id;
    
    -- 수정된 가맹점 정보 반환
    SELECT 
        Id, Name, BusinessNumber, RepresentativeName, Status
    FROM Merchants
    WHERE Id = @Id;
END
GO
PRINT 'sp_UpdateMerchantStatus 프로시저가 생성되었습니다.'
GO

-- 가맹점 삭제 프로시저
GO
CREATE PROCEDURE [dbo].[sp_DeleteMerchant]
    @Id INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 삭제 전 가맹점 존재 여부 확인
    IF EXISTS (SELECT 1 FROM Merchants WHERE Id = @Id)
    BEGIN
        DELETE FROM Merchants WHERE Id = @Id;
        SELECT 1 AS Success;
    END
    ELSE
    BEGIN
        SELECT 0 AS Success;
    END
END
GO
PRINT 'sp_DeleteMerchant 프로시저가 생성되었습니다.'
GO
