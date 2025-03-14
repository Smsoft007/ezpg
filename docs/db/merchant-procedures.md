# 가맹점 관리 데이터베이스 프로시저

## 1. 개요
이 문서는 가맹점 관리 시스템에서 사용되는 MSSQL 데이터베이스 프로시저에 대한 상세 정보를 제공합니다. 각 프로시저의 기능, 파라미터, 반환 값, 사용 예시를 포함합니다.

## 2. 프로시저 목록

| 프로시저 명 | 기능 설명 | 호출 API | 구현 상태 |
|------------|---------|---------|-----------|
| `sp_GetMerchantList` | 가맹점 목록 조회 | `/api/merchants` | ✅ 구현 완료 |
| `sp_GetMerchantById` | 가맹점 상세 정보 조회 | `/api/merchants/{id}` | ✅ 구현 완료 |
| `sp_CreateMerchant` | 새 가맹점 등록 | `/api/merchants` | ✅ 구현 완료 |
| `sp_UpdateMerchant` | 가맹점 정보 수정 | `/api/merchants/{id}` | ✅ 구현 완료 |
| `sp_DeleteMerchant` | 가맹점 삭제 | `/api/merchants/{id}` | ✅ 구현 완료 |
| `sp_UpdateMerchantStatus` | 가맹점 상태 변경 | `/api/merchants/{id}/status` | ✅ 구현 완료 |
| `sp_GetMerchantBalance` | 가맹점 잔액 조회 | `/api/merchants/{id}/balance` | ✅ 구현 완료 |
| `sp_GetMerchantTransactions` | 가맹점 거래 내역 조회 | `/api/merchants/{id}/transactions` | ✅ 구현 완료 |
| `sp_GetMerchantApiKeys` | 가맹점 API 키 목록 조회 | `/api/merchants/{id}/api-keys` | ✅ 구현 완료 |
| `sp_CreateMerchantApiKey` | 가맹점 API 키 생성 | `/api/merchants/{id}/api-keys` | ✅ 구현 완료 |
| `sp_DeleteMerchantApiKey` | 가맹점 API 키 삭제 | `/api/merchants/{id}/api-keys/{key_id}` | ✅ 구현 완료 |
| `sp_GetMerchantFees` | 가맹점 수수료 조회 | `/api/merchants/{id}/fees` | ✅ 구현 완료 |
| `sp_UpdateMerchantFees` | 가맹점 수수료 설정 | `/api/merchants/{id}/fees` | ✅ 구현 완료 |

## 3. 프로시저 상세 정보

### 3.1 sp_GetMerchantList
**기능**: 조건에 맞는 가맹점 목록을 조회합니다.

**파라미터**:
- `@Page` INT: 페이지 번호 (기본값: 1)
- `@PageSize` INT: 페이지당 항목 수 (기본값: 10)
- `@SearchTerm` NVARCHAR(100): 검색어 (선택, 가맹점명, 사업자번호, 대표자명)
- `@Status` VARCHAR(20): 상태 필터 (선택, 'active', 'inactive', 'pending')
- `@SortColumn` VARCHAR(50): 정렬 기준 (선택, 'id', 'name', 'created_at')
- `@SortOrder` VARCHAR(4): 정렬 방향 (선택, 'asc', 'desc')

**반환 결과**:
- 가맹점 목록 (ID, 가맹점명, 사업자번호, 대표자명, 상태, 가입일, 잔액)
- 페이지네이션 정보 (총 항목 수, 총 페이지 수)

**SQL 예시**:
```sql
CREATE PROCEDURE sp_GetMerchantList
    @Page INT = 1,
    @PageSize INT = 10,
    @SearchTerm NVARCHAR(100) = NULL,
    @Status VARCHAR(20) = NULL,
    @SortColumn VARCHAR(50) = 'id',
    @SortOrder VARCHAR(4) = 'asc'
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@Page - 1) * @PageSize;
    DECLARE @SQL NVARCHAR(MAX);
    DECLARE @ParamDefinition NVARCHAR(500);
    DECLARE @WhereClause NVARCHAR(1000) = '';
    
    -- 검색 조건 구성
    IF @SearchTerm IS NOT NULL AND @SearchTerm <> ''
    BEGIN
        SET @WhereClause = @WhereClause + 
            ' AND (m.MerchantName LIKE ''%'' + @SearchTerm + ''%'' 
            OR m.BusinessNumber LIKE ''%'' + @SearchTerm + ''%'' 
            OR m.RepresentativeName LIKE ''%'' + @SearchTerm + ''%'')';
    END
    
    IF @Status IS NOT NULL AND @Status <> ''
    BEGIN
        SET @WhereClause = @WhereClause + ' AND m.Status = @Status';
    END
    
    -- 정렬 조건 검증
    IF @SortColumn NOT IN ('id', 'name', 'created_at')
    BEGIN
        SET @SortColumn = 'id';
    END
    
    IF @SortOrder NOT IN ('asc', 'desc')
    BEGIN
        SET @SortOrder = 'asc';
    END
    
    -- 실제 컬럼명으로 변환
    DECLARE @ActualSortColumn NVARCHAR(50);
    IF @SortColumn = 'id' SET @ActualSortColumn = 'm.MerchantId';
    ELSE IF @SortColumn = 'name' SET @ActualSortColumn = 'm.MerchantName';
    ELSE IF @SortColumn = 'created_at' SET @ActualSortColumn = 'm.JoinDate';
    
    -- 총 항목 수 조회
    SET @SQL = N'
    SELECT COUNT(*) AS TotalCount
    FROM Merchants m
    WHERE 1=1' + @WhereClause;
    
    SET @ParamDefinition = N'
        @SearchTerm NVARCHAR(100),
        @Status VARCHAR(20)';
    
    DECLARE @TotalCount INT;
    DECLARE @TotalPages INT;
    
    EXEC sp_executesql @SQL, @ParamDefinition, 
        @SearchTerm = @SearchTerm,
        @Status = @Status;
        
    -- 가맹점 목록 조회
    SET @SQL = N'
    SELECT 
        m.MerchantId AS Id,
        m.MerchantName AS Name,
        m.BusinessNumber,
        m.RepresentativeName,
        m.Status,
        m.JoinDate,
        ISNULL(b.Balance, 0) AS Balance
    FROM 
        Merchants m
    LEFT JOIN 
        MerchantBalances b ON m.MerchantId = b.MerchantId
    WHERE 
        1=1' + @WhereClause + '
    ORDER BY 
        ' + @ActualSortColumn + ' ' + @SortOrder + '
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
    
    SELECT 
        @TotalCount AS TotalCount,
        CEILING(@TotalCount * 1.0 / @PageSize) AS TotalPages,
        @Page AS CurrentPage,
        @PageSize AS PageSize';
    
    SET @ParamDefinition = N'
        @SearchTerm NVARCHAR(100),
        @Status VARCHAR(20),
        @Offset INT,
        @PageSize INT,
        @TotalCount INT OUTPUT';
    
    EXEC sp_executesql @SQL, @ParamDefinition, 
        @SearchTerm = @SearchTerm,
        @Status = @Status,
        @Offset = @Offset,
        @PageSize = @PageSize,
        @TotalCount = @TotalCount OUTPUT;
END
```

**사용 예시**:
```sql
-- 기본 조회 (1페이지, 10개 항목)
EXEC sp_GetMerchantList;

-- 검색어와 상태 필터 적용
EXEC sp_GetMerchantList @Page = 1, @PageSize = 20, @SearchTerm = '스마트', @Status = 'active';

-- 가맹점명으로 내림차순 정렬
EXEC sp_GetMerchantList @SortColumn = 'name', @SortOrder = 'desc';
```

### 3.2 sp_GetMerchantById
**기능**: 특정 가맹점의 상세 정보를 조회합니다.

**파라미터**:
- `@MerchantId` VARCHAR(20): 가맹점 ID (필수)

**반환 결과**:
- 가맹점 기본 정보 (ID, 가맹점명, 사업자번호, 대표자명, 상태, 가입일, 잔액)
- 연락처 정보 (이메일, 전화번호)
- 주소 정보 (우편번호, 기본주소, 상세주소)
- 계좌 정보 (은행명, 계좌번호, 예금주)
- 수수료 정보 (결제 수수료율, 출금 수수료)

**SQL 예시**:
```sql
CREATE PROCEDURE sp_GetMerchantById
    @MerchantId VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 가맹점 기본 정보 조회
    SELECT 
        m.MerchantId AS Id,
        m.MerchantName AS Name,
        m.BusinessNumber,
        m.RepresentativeName,
        m.Status,
        m.JoinDate,
        ISNULL(b.Balance, 0) AS Balance,
        m.Email,
        m.Phone,
        m.ZipCode,
        m.Address1,
        m.Address2,
        m.BankName,
        m.AccountNumber,
        m.AccountHolder,
        f.PaymentFeeRate,
        f.WithdrawalFee
    FROM 
        Merchants m
    LEFT JOIN 
        MerchantBalances b ON m.MerchantId = b.MerchantId
    LEFT JOIN
        MerchantFees f ON m.MerchantId = f.MerchantId
    WHERE 
        m.MerchantId = @MerchantId;
        
    -- 가맹점이 존재하지 않는 경우
    IF @@ROWCOUNT = 0
    BEGIN
        RAISERROR('가맹점을 찾을 수 없습니다.', 16, 1);
        RETURN;
    END
END
```

**사용 예시**:
```sql
-- 특정 가맹점 조회
EXEC sp_GetMerchantById @MerchantId = 'M001';
```

### 3.3 sp_CreateMerchant
**기능**: 새로운 가맹점을 등록합니다.

**파라미터**:
- `@MerchantName` NVARCHAR(100): 가맹점명 (필수)
- `@BusinessNumber` VARCHAR(20): 사업자번호 (필수)
- `@RepresentativeName` NVARCHAR(50): 대표자명 (필수)
- `@Status` VARCHAR(20): 상태 (필수, 'active', 'inactive', 'pending')
- `@Email` VARCHAR(100): 이메일 (필수)
- `@Phone` VARCHAR(20): 전화번호 (필수)
- `@ZipCode` VARCHAR(10): 우편번호 (필수)
- `@Address1` NVARCHAR(200): 기본주소 (필수)
- `@Address2` NVARCHAR(200): 상세주소 (선택)
- `@BankName` NVARCHAR(50): 은행명 (필수)
- `@AccountNumber` VARCHAR(30): 계좌번호 (필수)
- `@AccountHolder` NVARCHAR(50): 예금주 (필수)
- `@PaymentFeeRate` DECIMAL(5,2): 결제 수수료율 (필수)
- `@WithdrawalFee` INT: 출금 수수료 (필수)

**반환 결과**:
- 생성된 가맹점 ID
- 성공 메시지

**SQL 예시**:
```sql
CREATE PROCEDURE sp_CreateMerchant
    @MerchantName NVARCHAR(100),
    @BusinessNumber VARCHAR(20),
    @RepresentativeName NVARCHAR(50),
    @Status VARCHAR(20) = 'pending',
    @Email VARCHAR(100),
    @Phone VARCHAR(20),
    @ZipCode VARCHAR(10),
    @Address1 NVARCHAR(200),
    @Address2 NVARCHAR(200) = NULL,
    @BankName NVARCHAR(50),
    @AccountNumber VARCHAR(30),
    @AccountHolder NVARCHAR(50),
    @PaymentFeeRate DECIMAL(5,2),
    @WithdrawalFee INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 파라미터 유효성 검사
    IF @MerchantName IS NULL OR @MerchantName = ''
    BEGIN
        RAISERROR('가맹점명은 필수 입력 항목입니다.', 16, 1);
        RETURN;
    END
    
    IF @BusinessNumber IS NULL OR @BusinessNumber = ''
    BEGIN
        RAISERROR('사업자번호는 필수 입력 항목입니다.', 16, 1);
        RETURN;
    END
    
    -- 사업자번호 중복 체크
    IF EXISTS (SELECT 1 FROM Merchants WHERE BusinessNumber = @BusinessNumber)
    BEGIN
        RAISERROR('이미 등록된 사업자번호입니다.', 16, 1);
        RETURN;
    END
    
    -- 상태 유효성 검사
    IF @Status NOT IN ('active', 'inactive', 'pending')
    BEGIN
        SET @Status = 'pending';
    END
    
    -- 가맹점 ID 생성 (M + 일련번호)
    DECLARE @NewMerchantId VARCHAR(20);
    DECLARE @MaxId INT;
    
    SELECT @MaxId = ISNULL(MAX(CAST(SUBSTRING(MerchantId, 2, LEN(MerchantId)) AS INT)), 0)
    FROM Merchants
    WHERE MerchantId LIKE 'M%';
    
    SET @NewMerchantId = 'M' + RIGHT('000' + CAST(@MaxId + 1 AS VARCHAR), 3);
    
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- 가맹점 기본 정보 등록
        INSERT INTO Merchants (
            MerchantId, MerchantName, BusinessNumber, RepresentativeName, 
            Status, Email, Phone, ZipCode, Address1, Address2,
            BankName, AccountNumber, AccountHolder, JoinDate
        )
        VALUES (
            @NewMerchantId, @MerchantName, @BusinessNumber, @RepresentativeName,
            @Status, @Email, @Phone, @ZipCode, @Address1, @Address2,
            @BankName, @AccountNumber, @AccountHolder, GETDATE()
        );
        
        -- 가맹점 잔액 초기화
        INSERT INTO MerchantBalances (MerchantId, Balance, AvailableBalance, PendingBalance, LastUpdated)
        VALUES (@NewMerchantId, 0, 0, 0, GETDATE());
        
        -- 가맹점 수수료 설정
        INSERT INTO MerchantFees (MerchantId, PaymentFeeRate, WithdrawalFee, LastUpdated)
        VALUES (@NewMerchantId, @PaymentFeeRate, @WithdrawalFee, GETDATE());
        
        COMMIT TRANSACTION;
        
        -- 결과 반환
        SELECT 
            @NewMerchantId AS MerchantId,
            @MerchantName AS MerchantName,
            '가맹점이 성공적으로 등록되었습니다.' AS Message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        RAISERROR(@ErrorMessage, @ErrorSeverity, @ErrorState);
    END CATCH
END
```

**사용 예시**:
```sql
-- 새 가맹점 등록
EXEC sp_CreateMerchant
    @MerchantName = '새 가맹점',
    @BusinessNumber = '123-45-67890',
    @RepresentativeName = '홍길동',
    @Status = 'pending',
    @Email = 'contact@newmerchant.com',
    @Phone = '02-1234-5678',
    @ZipCode = '12345',
    @Address1 = '서울특별시 강남구',
    @Address2 = '테헤란로 123',
    @BankName = '국민은행',
    @AccountNumber = '110-123-456789',
    @AccountHolder = '홍길동',
    @PaymentFeeRate = 3.5,
    @WithdrawalFee = 1000;
```

### 3.4 sp_GetMerchantBalance
**기능**: 가맹점의 잔액 정보를 조회합니다.

**파라미터**:
- `@MerchantId` VARCHAR(20): 가맹점 ID (필수)

**반환 결과**:
- 가맹점 ID
- 가맹점명
- 총 잔액
- 가용 잔액
- 대기 잔액
- 최종 업데이트 시간

**SQL 예시**:
```sql
CREATE PROCEDURE sp_GetMerchantBalance
    @MerchantId VARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 가맹점 존재 여부 확인
    IF NOT EXISTS (SELECT 1 FROM Merchants WHERE MerchantId = @MerchantId)
    BEGIN
        RAISERROR('가맹점을 찾을 수 없습니다.', 16, 1);
        RETURN;
    END
    
    -- 잔액 정보 조회
    SELECT 
        m.MerchantId AS Id,
        m.MerchantName AS Name,
        ISNULL(b.Balance, 0) AS Balance,
        ISNULL(b.AvailableBalance, 0) AS AvailableBalance,
        ISNULL(b.PendingBalance, 0) AS PendingBalance,
        b.LastUpdated
    FROM 
        Merchants m
    LEFT JOIN 
        MerchantBalances b ON m.MerchantId = b.MerchantId
    WHERE 
        m.MerchantId = @MerchantId;
END
```

**사용 예시**:
```sql
-- 가맹점 잔액 조회
EXEC sp_GetMerchantBalance @MerchantId = 'M001';
```

## 4. 테이블 구조

### 4.1 Merchants 테이블
```sql
CREATE TABLE Merchants (
    MerchantId VARCHAR(20) PRIMARY KEY,
    MerchantName NVARCHAR(100) NOT NULL,
    BusinessNumber VARCHAR(20) NOT NULL UNIQUE,
    RepresentativeName NVARCHAR(50) NOT NULL,
    Status VARCHAR(20) NOT NULL DEFAULT 'pending',
    Email VARCHAR(100) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    ZipCode VARCHAR(10) NOT NULL,
    Address1 NVARCHAR(200) NOT NULL,
    Address2 NVARCHAR(200) NULL,
    BankName NVARCHAR(50) NOT NULL,
    AccountNumber VARCHAR(30) NOT NULL,
    AccountHolder NVARCHAR(50) NOT NULL,
    JoinDate DATETIME NOT NULL DEFAULT GETDATE(),
    LastModified DATETIME NULL,
    CONSTRAINT CK_Merchants_Status CHECK (Status IN ('active', 'inactive', 'pending'))
);
```

### 4.2 MerchantBalances 테이블
```sql
CREATE TABLE MerchantBalances (
    MerchantId VARCHAR(20) PRIMARY KEY,
    Balance DECIMAL(18, 2) NOT NULL DEFAULT 0,
    AvailableBalance DECIMAL(18, 2) NOT NULL DEFAULT 0,
    PendingBalance DECIMAL(18, 2) NOT NULL DEFAULT 0,
    LastUpdated DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_MerchantBalances_Merchants FOREIGN KEY (MerchantId) REFERENCES Merchants(MerchantId)
);
```

### 4.3 MerchantFees 테이블
```sql
CREATE TABLE MerchantFees (
    MerchantId VARCHAR(20) PRIMARY KEY,
    PaymentFeeRate DECIMAL(5, 2) NOT NULL DEFAULT 3.5,
    WithdrawalFee INT NOT NULL DEFAULT 1000,
    LastUpdated DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_MerchantFees_Merchants FOREIGN KEY (MerchantId) REFERENCES Merchants(MerchantId)
);
```

### 4.4 MerchantApiKeys 테이블
```sql
CREATE TABLE MerchantApiKeys (
    ApiKeyId VARCHAR(50) PRIMARY KEY,
    MerchantId VARCHAR(20) NOT NULL,
    ApiKey VARCHAR(100) NOT NULL UNIQUE,
    ApiSecret VARCHAR(100) NOT NULL,
    Description NVARCHAR(200) NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    ExpiresAt DATETIME NULL,
    LastUsed DATETIME NULL,
    CONSTRAINT FK_MerchantApiKeys_Merchants FOREIGN KEY (MerchantId) REFERENCES Merchants(MerchantId)
);
```

### 4.5 MerchantTransactions 테이블
```sql
CREATE TABLE MerchantTransactions (
    TransactionId VARCHAR(50) PRIMARY KEY,
    MerchantId VARCHAR(20) NOT NULL,
    Type VARCHAR(20) NOT NULL,
    Amount DECIMAL(18, 2) NOT NULL,
    Fee DECIMAL(18, 2) NOT NULL DEFAULT 0,
    Status VARCHAR(20) NOT NULL DEFAULT 'pending',
    Description NVARCHAR(500) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT GETDATE(),
    CompletedAt DATETIME NULL,
    CONSTRAINT FK_MerchantTransactions_Merchants FOREIGN KEY (MerchantId) REFERENCES Merchants(MerchantId),
    CONSTRAINT CK_MerchantTransactions_Type CHECK (Type IN ('deposit', 'withdrawal', 'adjustment')),
    CONSTRAINT CK_MerchantTransactions_Status CHECK (Status IN ('pending', 'completed', 'failed', 'cancelled'))
);
```

## 5. 인덱스 정보

### 5.1 Merchants 테이블 인덱스
```sql
-- 사업자번호 인덱스
CREATE UNIQUE INDEX IX_Merchants_BusinessNumber ON Merchants(BusinessNumber);

-- 가맹점명 인덱스
CREATE INDEX IX_Merchants_MerchantName ON Merchants(MerchantName);

-- 상태 인덱스
CREATE INDEX IX_Merchants_Status ON Merchants(Status);

-- 가입일 인덱스
CREATE INDEX IX_Merchants_JoinDate ON Merchants(JoinDate);
```

### 5.2 MerchantTransactions 테이블 인덱스
```sql
-- 가맹점 ID + 생성일 인덱스
CREATE INDEX IX_MerchantTransactions_MerchantId_CreatedAt 
ON MerchantTransactions(MerchantId, CreatedAt);

-- 상태 인덱스
CREATE INDEX IX_MerchantTransactions_Status 
ON MerchantTransactions(Status);

-- 유형 인덱스
CREATE INDEX IX_MerchantTransactions_Type 
ON MerchantTransactions(Type);
```

## 6. 트리거

### 6.1 가맹점 잔액 업데이트 트리거
```sql
CREATE TRIGGER trg_UpdateMerchantBalance
ON MerchantTransactions
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 완료된 거래에 대해서만 잔액 업데이트
    IF EXISTS (
        SELECT 1 
        FROM inserted i 
        JOIN deleted d ON i.TransactionId = d.TransactionId
        WHERE i.Status = 'completed' AND d.Status <> 'completed'
    )
    BEGIN
        DECLARE @MerchantId VARCHAR(20);
        DECLARE @Amount DECIMAL(18, 2);
        DECLARE @Fee DECIMAL(18, 2);
        DECLARE @Type VARCHAR(20);
        
        SELECT 
            @MerchantId = i.MerchantId,
            @Amount = i.Amount,
            @Fee = i.Fee,
            @Type = i.Type
        FROM 
            inserted i 
        JOIN 
            deleted d ON i.TransactionId = d.TransactionId
        WHERE 
            i.Status = 'completed' AND d.Status <> 'completed';
        
        -- 잔액 업데이트
        IF @Type = 'deposit'
        BEGIN
            UPDATE MerchantBalances
            SET 
                Balance = Balance + @Amount - @Fee,
                AvailableBalance = AvailableBalance + @Amount - @Fee,
                PendingBalance = PendingBalance - @Amount,
                LastUpdated = GETDATE()
            WHERE 
                MerchantId = @MerchantId;
        END
        ELSE IF @Type = 'withdrawal'
        BEGIN
            UPDATE MerchantBalances
            SET 
                Balance = Balance - @Amount - @Fee,
                AvailableBalance = AvailableBalance - @Amount - @Fee,
                LastUpdated = GETDATE()
            WHERE 
                MerchantId = @MerchantId;
        END
    END
END
```

## 7. 성능 최적화 팁

1. **인덱스 활용**:
   - 자주 조회하는 컬럼에 인덱스 생성
   - 복합 인덱스를 통한 검색 성능 향상

2. **페이지네이션 최적화**:
   - OFFSET-FETCH 구문 사용
   - 대용량 데이터 조회 시 커서 기반 페이지네이션 고려

3. **트랜잭션 관리**:
   - 트랜잭션 범위 최소화
   - 장시간 실행되는 트랜잭션 분할

4. **저장 프로시저 캐싱**:
   - 자주 사용되는 프로시저는 서버 메모리에 캐싱됨
   - 파라미터화된 쿼리 사용으로 실행 계획 재사용

5. **통계 업데이트**:
   - 정기적인 통계 업데이트로 쿼리 최적화기 성능 향상
   - `UPDATE STATISTICS` 명령 활용
