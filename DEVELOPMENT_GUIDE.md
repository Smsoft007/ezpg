EzPay 프로젝트 최적화 개발 가이드

1. 개발 원칙

DRY (Don't Repeat Yourself): 중복 코드를 최소화합니다.

단일 책임 원칙: 컴포넌트와 함수는 단일 책임을 갖습니다.

모듈화: 기능별로 모듈화하여 유지보수를 용이하게 합니다.

안정성: TypeScript를 활용하여 모든 코드의 타입 안전성을 보장합니다.

일관성: 명확한 네이밍과 구조를 통해 일관성을 유지합니다.

2. 프로젝트 구조 (Next.js 기반)

src/
├── api/
│   ├── client.ts
│   └── [도메인].ts
├── app/
├── components/
│   ├── ui/ (Shadcn UI 확장)
│   ├── common/
│   └── [도메인]/
├── config/
├── db/
│   └── procedures/
├── hooks/
├── lib/
├── styles/
└── types/

3. 타입 시스템

타입 정의는 반드시 src/types 폴더에 작성합니다.

배럴 파일(index.ts)로 모든 타입을 관리합니다.

공통 타입(ApiResponse)은 common.ts에 정의합니다.

4. 컴포넌트 개발 (Shadcn UI)

모든 컴포넌트는 명확한 Props 타입을 정의합니다.

Shadcn UI는 확장 또는 래핑을 통해 커스터마이징하여 유지보수를 쉽게 합니다.

데이터 안정성을 위한 SafeWrapper 컴포넌트를 적극 활용합니다.

5. API 통합

중앙화된 API 클라이언트(src/api/client.ts)를 사용하여 API 호출을 표준화합니다.

API 호출 시 에러 처리는 일관된 방식으로 진행하며, 로깅을 추가하여 추적성을 확보합니다.

6. 유틸리티 및 헬퍼 함수

데이터 처리 유틸리티 함수는 src/lib/typeUtils.ts에 작성합니다.

데이터 배열화, API 데이터 안전 추출, 상태별 카운트 함수 등을 적극 활용합니다.

7. 에러 방지 전략

데이터 접근 시 항상 배열 여부 및 null 검증을 수행합니다.

타입 가드를 사용하여 런타임 오류를 최소화합니다.

옵셔널 체이닝(?.)과 널 병합 연산자(??)를 적극 활용합니다.

8. 코드 스타일 가이드

파일당 주요 컴포넌트나 하나의 책임을 유지합니다.

라인 길이는 80~100자를 넘지 않으며, 들여쓰기는 2 스페이스로 합니다.

명확한 주석(JSDoc)을 통해 코드의 의도를 명시적으로 전달합니다.

9. 데이터베이스 관리

### 데이터베이스 모듈 구조

1. **모듈화된 데이터베이스 접근 계층**
   - `src/db/config/index.ts`: 데이터베이스 연결 설정
   - `src/db/connection/index.ts`: 연결 풀 관리
   - `src/db/query/index.ts`: SQL 쿼리 실행
   - `src/db/procedures/index.ts`: 저장 프로시저 호출
   - `src/db/index.ts`: 중앙 인터페이스

   ```typescript
   // src/db/index.ts
   import { executeQuery } from './query';
   import { executeProcedure } from './procedures';
   import { getConnection, closeConnection } from './connection';

   export {
     executeQuery,
     executeProcedure,
     getConnection,
     closeConnection
   };
   ```

### 데이터베이스 연결 및 쿼리 실행

1. **데이터베이스 연결 관리**
   - 환경 변수를 통한 연결 정보 관리
   - 연결 풀 사용으로 리소스 효율성 확보
   ```typescript
   // src/db/config/index.ts
   export const config = {
     server: process.env.DB_HOST || '137.184.125.213',
     port: parseInt(process.env.DB_PORT || '49987'),
     database: process.env.DB_NAME || 'EZPG',
     user: process.env.DB_USER || 'EZPG_USER',
     password: process.env.DB_PASSWORD,
     options: {
       encrypt: false,
       trustServerCertificate: true,
     },
     pool: {
       max: 10,
       min: 0,
       idleTimeoutMillis: 30000
     }
   };
   ```

2. **프로시저 실행 표준화**
   - 타입 안전성이 보장된 프로시저 실행 함수 사용
   ```typescript
   // src/db/procedures/index.ts
   export async function executeProcedure<T>(
     procedureName: string, 
     params: Record<string, any>
   ): Promise<T> {
     try {
       const pool = await getConnection();
       const request = pool.request();
       
       // 파라미터 추가
       for (const [key, value] of Object.entries(params)) {
         if (value !== undefined && value !== null) {
           request.input(key, value);
         }
       }
       
       const result = await request.execute(procedureName);
       return result.recordset as T;
     } catch (error) {
       console.error(`Error executing procedure ${procedureName}:`, error);
       throw error;
     }
   }
   ```

3. **에러 처리 및 로깅**
   - 데이터베이스 오류 발생 시 명확한 에러 메시지 제공
   - 민감한 정보(비밀번호, 개인정보 등)는 로그에 남기지 않음
   - 트랜잭션을 활용한 데이터 일관성 보장

### 데이터베이스 스키마 관리

1. **스키마 정의 및 버전 관리**
   - 모든 테이블 및 프로시저 정의는 `src/db/scripts` 폴더에 SQL 파일로 관리
   - 테이블 생성 스크립트와 프로시저 스크립트를 분리하여 관리
   - 외래 키 제약 조건을 고려한 테이블 생성 및 삭제 순서 관리

2. **마스터 스크립트 실행**
   - `master-script.sql`을 통해 모든 테이블과 프로시저를 순차적으로 삭제하고 재생성
   - 외래 키 제약 조건을 먼저 삭제하여 테이블 삭제 시 오류 방지
   - 테이블 생성 시 의존성 순서 준수 (부모 테이블 먼저 생성)

   ```sql
   -- 외래 키 제약 조건 삭제
   DECLARE @dropFKConstraints NVARCHAR(MAX) = N'';
   SELECT @dropFKConstraints = @dropFKConstraints + N'
   ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id)) + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) + 
   ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
   FROM sys.foreign_keys;
   EXEC sp_executesql @dropFKConstraints;
   
   -- 테이블 삭제 (의존성 역순)
   DROP TABLE [dbo].[PaymentLogs];
   DROP TABLE [dbo].[RefundHistory];
   DROP TABLE [dbo].[Transactions];
   DROP TABLE [dbo].[VendorBankAccounts];
   DROP TABLE [dbo].[VendorApiKeys];
   DROP TABLE [dbo].[VendorContacts];
   DROP TABLE [dbo].[Vendors];
   
   -- 테이블 생성 (의존성 순서)
   CREATE TABLE [dbo].[Vendors] (...);
   CREATE TABLE [dbo].[VendorContacts] (...);
   -- 나머지 테이블 생성...
   ```

3. **스크립트 실행 도구**
   - `run-master-script.cjs`를 통해 마스터 스크립트 또는 개별 스크립트 실행
   - 환경 변수를 통한 데이터베이스 연결 정보 관리
   - GO 문을 기준으로 배치 분리 실행

   ```javascript
   // 마스터 스크립트 실행
   npm run db:master

   // 개별 스크립트 순차 실행
   npm run db:scripts
   ```

4. **개발 및 테스트 환경에서의 데이터베이스 초기화**
   - 개발 환경에서 자동으로 데이터베이스 스키마 생성
   - 테스트 데이터 자동 생성 옵션 제공

   ```typescript
   // src/db/init.ts
   export async function initializeDatabase(withTestData = false) {
     try {
       // 마스터 스크립트 실행
       await runMasterScript();
       
       // 테스트 데이터 생성 (선택 사항)
       if (withTestData) {
         await generateTestData();
       }
       
       console.log('데이터베이스 초기화 완료');
     } catch (error) {
       console.error('데이터베이스 초기화 실패:', error);
       throw error;
     }
   }
   ```

### 데이터베이스 쿼리 및 프로시저 작성 가이드

1. **명명 규칙**
   - 테이블: 복수형 명사 (예: `Vendors`, `Transactions`)
   - 프로시저: `sp_동사명사` 형식 (예: `sp_GetVendorById`, `sp_CreateTransaction`)
   - 인덱스: `IX_테이블명_컬럼명` 형식 (예: `IX_Vendors_BusinessNumber`)

2. **프로시저 작성 표준**
   - 모든 프로시저는 `SET NOCOUNT ON;` 설정
   - 페이징 처리가 필요한 조회는 `OFFSET-FETCH` 구문 사용
   - 에러 처리를 위한 `TRY-CATCH` 블록 사용

   ```sql
   CREATE PROCEDURE [dbo].[sp_GetVendorList]
       @PageNumber INT = 1,
       @PageSize INT = 10,
       @SearchTerm NVARCHAR(100) = NULL,
       @Status VARCHAR(20) = NULL
   AS
   BEGIN
       SET NOCOUNT ON;
       
       DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
       
       SELECT
           v.[Id],
           v.[Name],
           v.[BusinessNumber],
           v.[Status],
           v.[CreatedAt],
           COUNT(*) OVER() AS TotalCount
       FROM
           [dbo].[Vendors] v
       WHERE
           (@SearchTerm IS NULL OR v.[Name] LIKE '%' + @SearchTerm + '%') AND
           (@Status IS NULL OR v.[Status] = @Status)
       ORDER BY
           v.[CreatedAt] DESC
       OFFSET @Offset ROWS
       FETCH NEXT @PageSize ROWS ONLY;
   END
   ```

10. 결론

이 가이드는 일관된 코드 품질, 유지보수의 용이성, 런타임 안정성을 보장하여 개발 효율을 극대화합니다.

모든 개발자는 이 가이드를 기준으로 작업을 수행하여 EzPay 프로젝트의 코드 일관성을 유지합니다.