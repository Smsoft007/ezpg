# EzPG 결제 시스템 메뉴 구조 및 개발 계획

## 메뉴 구조 (좌측 네비게이션)

EzPG 결제 시스템의 메뉴는 크게 다음과 같이 구성되어 있습니다. 각 대메뉴 아래에 소메뉴가 배치되어 있으며, 사용자 역할(관리자, 가맹점)에 따라 접근 가능한 메뉴가 다릅니다.

### 대메뉴 및 소메뉴 구조

1. **대시보드**
   - 메인 대시보드 (`/dashboard`)
   - 가맹점별 대시보드 (`/dashboard/merchant-dashboard`) - 관리자 전용
   - 거래 통계 대시보드 (`/dashboard/transaction-dashboard`)
   - 내 가맹점 대시보드 (`/dashboard/my-merchant`) - 가맹점 전용

2. **가맹점 관리** - 관리자 전용
   - 가맹점 목록 (`/dashboard/merchants`)
   - 가맹점 등록 (`/dashboard/merchants/new`)
   - 가맹점 상세 (`/dashboard/merchants/details`)
   - 가맹점 설정 (`/dashboard/merchants/settings`)
   - 가맹점 잔액 관리 (`/dashboard/merchants/balance`)
   - 가맹점 수수료 관리 (`/dashboard/merchants/fees`)
   - API 키 관리 (`/dashboard/merchants/api-keys`)
   - 가맹점 검증 (`/dashboard/merchants/verification`)

3. **내 가맹점 정보** - 가맹점 전용
   - 가맹점 정보 (`/dashboard/my-merchant/info`)
   - API 키 관리 (`/dashboard/my-merchant/api-keys`)
   - 결제 설정 (`/dashboard/my-merchant/settings`)
   - 정산 내역 (`/dashboard/my-merchant/settlements`)

4. **거래 관리**
   - 입금 거래 (`/dashboard/transactions/deposits`)
   - 출금 거래 (`/dashboard/transactions/withdrawals`)
   - 실패 거래 (`/dashboard/transactions/failed`)
   - 대기 거래 (`/dashboard/transactions/pending`)
   - 거래 로그 (`/dashboard/transactions/logs`) - 관리자 전용
   - 거래 검색 (`/dashboard/transactions/search`)
   - 일괄 작업 (`/dashboard/transactions/batch`) - 관리자 전용

5. **출금 관리**
   - 출금 신청 (`/dashboard/withdrawals/request`)
   - 출금 승인 (`/dashboard/withdrawals/approve`) - 관리자 전용
   - 출금 내역 (`/dashboard/withdrawals/history`)
   - 출금 설정 (`/dashboard/withdrawals/settings`) - 관리자 전용
   - 출금 보고서 (`/dashboard/withdrawals/reports`)
   - 출금 API 관리 (`/dashboard/withdrawals/api`) - 관리자 전용

6. **가상계좌 관리** - 관리자 전용
   - 계좌 발급 (`/dashboard/accounts/issue`)
   - 계좌 목록 (`/dashboard/accounts/list`)
   - 계좌 상태 (`/dashboard/accounts/status`)
   - 은행 관리 (`/dashboard/accounts/banks`)
   - 계좌 설정 (`/dashboard/accounts/settings`)
   - 계좌 검증 (`/dashboard/accounts/verification`)

7. **내 가상계좌** - 가맹점 전용
   - 내 계좌 목록 (`/dashboard/my-accounts/list`)
   - 계좌 발급 요청 (`/dashboard/my-accounts/request`)
   - 입금 내역 (`/dashboard/my-accounts/deposits`)

8. **정산 관리**
   - 정산 내역 (`/dashboard/settlements/history`)
   - 정산 예정 (`/dashboard/settlements/scheduled`)
   - 정산 설정 (`/dashboard/settlements/settings`) - 관리자 전용
   - 정산 보고서 (`/dashboard/settlements/reports`) - 관리자 전용
   - 수수료 관리 (`/dashboard/settlements/fees`) - 관리자 전용

9. **보고서**
   - 일별 보고서 (`/dashboard/reports/daily`)
   - 월별 보고서 (`/dashboard/reports/monthly`)
   - 가맹점별 보고서 (`/dashboard/reports/by-merchant`) - 관리자 전용
   - 거래 유형별 보고서 (`/dashboard/reports/by-type`)
   - 사용자 정의 보고서 (`/dashboard/reports/custom`)
   - 보고서 다운로드 (`/dashboard/reports/download`)

10. **시스템 관리** - 관리자 전용
    - 사용자 관리 (`/dashboard/system/users`)
    - 권한 관리 (`/dashboard/system/permissions`)
    - 시스템 설정 (`/dashboard/system/settings`)
    - API 설정 (`/dashboard/system/api-settings`)
    - 알림 설정 (`/dashboard/system/notifications`)
    - 감사 로그 (`/dashboard/system/audit-logs`)
    - 백업 관리 (`/dashboard/system/backups`)

11. **알림**
    - 모든 알림 (`/dashboard/notifications`)
    - 읽지 않은 알림 (`/dashboard/notifications/unread`)
    - 알림 설정 (`/dashboard/notifications/settings`)

12. **고객 지원**
    - FAQ (`/dashboard/support/faq`)
    - 문의하기 (`/dashboard/support/inquiry`)
    - 문의 내역 (`/dashboard/support/history`)
    - 지원 티켓 (`/dashboard/support/tickets`) - 관리자 전용

13. **데이터베이스** - 관리자 전용
    - 개요 (`/dashboard/database`)
    - 테이블 관리 (`/dashboard/database?tab=tables`)
    - 백업 관리 (`/dashboard/database?tab=backups`)
    - 저장 프로시저 (`/dashboard/database/stored-procedures`)
    - 쿼리 도구 (`/dashboard/database/query`)

## API 및 데이터베이스 연결 계획

`docs` 폴더를 검토한 결과, API와 데이터베이스 관련 문서가 구조화되어 있습니다. 이를 바탕으로 다음과 같은 개발 계획을 수립했습니다.

### 1. API 구현 계획

EzPG 결제 시스템의 API는 `src/app/api` 폴더에 구현되어 있으며, 각 기능별로 다음과 같이 폴더 구조를 구성합니다:

1. **메뉴 관련 API**
   - `/api/menu` - 메뉴 정보 제공 (✅ 구현 완료)

2. **인증 관련 API**
   - `/api/auth/login` - 로그인
   - `/api/auth/logout` - 로그아웃
   - `/api/auth/refresh` - 토큰 갱신
   - `/api/auth/register` - 회원가입 (관리자용)

3. **가맹점 관련 API**
   - `/api/merchants` - 가맹점 목록, 생성, 수정, 삭제
   - `/api/merchants/[id]` - 가맹점 상세 정보
   - `/api/merchants/[id]/balance` - 가맹점 잔액 관리
   - `/api/merchants/[id]/fees` - 가맹점 수수료 관리
   - `/api/merchants/[id]/api-keys` - 가맹점 API 키 관리

4. **거래 관련 API**
   - `/api/transactions` - 거래 목록, 생성
   - `/api/transactions/[id]` - 거래 상세 정보
   - `/api/transactions/deposits` - 입금 거래 관리
   - `/api/transactions/withdrawals` - 출금 거래 관리
   - `/api/transactions/batch` - 일괄 작업

5. **가상계좌 관련 API**
   - `/api/accounts` - 가상계좌 목록, 생성
   - `/api/accounts/[id]` - 가상계좌 상세 정보
   - `/api/accounts/banks` - 은행 정보 관리
   - `/api/accounts/issue` - 계좌 발급

6. **정산 관련 API**
   - `/api/settlements` - 정산 목록, 생성
   - `/api/settlements/[id]` - 정산 상세 정보
   - `/api/settlements/scheduled` - 정산 예정 목록

7. **보고서 관련 API**
   - `/api/reports/daily` - 일별 보고서
   - `/api/reports/monthly` - 월별 보고서
   - `/api/reports/by-merchant` - 가맹점별 보고서
   - `/api/reports/by-type` - 거래 유형별 보고서
   - `/api/reports/custom` - 사용자 정의 보고서
   - `/api/reports/download` - 보고서 다운로드

8. **시스템 관리 API**
   - `/api/system/users` - 사용자 관리
   - `/api/system/permissions` - 권한 관리
   - `/api/system/settings` - 시스템 설정

9. **데이터베이스 관리 API**
   - `/api/database/tables` - 테이블 관리
   - `/api/database/backup` - 백업 관리
   - `/api/database/query` - 쿼리 실행
   - `/api/database/test-connection` - 연결 테스트 (✅ 구현 완료)

### 2. 데이터베이스 연결 계획

데이터베이스는 MSSQL을 사용하며, `src/db` 폴더에 다음과 같은 파일들로 구성됩니다:

1. **기본 연결 설정**
   - `config.ts` - DB 연결 구성 (✅ 구현 완료)
   - `index.ts` - DB 연결 관리 (✅ 구현 완료)

2. **데이터 접근 계층 (Data Access Layer)**
   - `merchants.ts` - 가맹점 관련 DB 함수
   - `transactions.ts` - 거래 관련 DB 함수
   - `accounts.ts` - 가상계좌 관련 DB 함수
   - `settlements.ts` - 정산 관련 DB 함수
   - `users.ts` - 사용자 관련 DB 함수
   - `reports.ts` - 보고서 관련 DB 함수
   - `backup.ts` - 백업 관련 DB 함수 (✅ 구현 완료)

3. **저장 프로시저 호출**
   - `procedures/index.ts` - 저장 프로시저 호출 유틸리티 함수
   - `procedures/merchants.ts` - 가맹점 관련 저장 프로시저
   - `procedures/transactions.ts` - 거래 관련 저장 프로시저
   - `procedures/accounts.ts` - 가상계좌 관련 저장 프로시저
   - `procedures/settlements.ts` - 정산 관련 저장 프로시저

### 3. 컴포넌트 구현 계획

각 페이지와 기능에 필요한 UI 컴포넌트를 다음과 같이 구성합니다:

1. **공통 컴포넌트**
   - `src/components/ui/` - 재사용 가능한 UI 컴포넌트 (버튼, 카드, 테이블 등)
   - `src/components/layout/` - 레이아웃 관련 컴포넌트 (사이드바, 헤더 등)

2. **기능별 컴포넌트**
   - `src/components/merchants/` - 가맹점 관련 컴포넌트
   - `src/components/transactions/` - 거래 관련 컴포넌트
   - `src/components/accounts/` - 가상계좌 관련 컴포넌트
   - `src/components/settlements/` - 정산 관련 컴포넌트
   - `src/components/reports/` - 보고서 관련 컴포넌트
   - `src/components/system/` - 시스템 관리 관련 컴포넌트
   - `src/components/database/` - 데이터베이스 관련 컴포넌트 (✅ 구현 완료)

### 4. 단계별 개발 계획

프로젝트 개발은 다음과 같은 단계로 진행합니다:

#### 1단계: 기반 기능 구현 (현재)
- [x] 데이터베이스 연결 설정
- [x] 메뉴 API 및 구조 정의
- [ ] 인증 시스템 구현
- [ ] 기본 대시보드 구현

#### 2단계: 핵심 기능 구현
- [ ] 가맹점 관리 기능 구현
- [ ] 거래 관리 기능 구현
- [ ] 가상계좌 관리 기능 구현
- [ ] 출금 관리 기능 구현

#### 3단계: 부가 기능 구현
- [ ] 정산 관리 기능 구현
- [ ] 보고서 기능 구현
- [ ] 시스템 관리 기능 구현
- [ ] 알림 시스템 구현

#### 4단계: 고급 기능 및 최적화
- [ ] 데이터베이스 관리 도구 고도화
- [ ] API 성능 최적화
- [ ] UI/UX 개선
- [ ] 보안 강화

## 기술 스택

EzPG 결제 시스템은 다음과 같은 기술 스택을 사용합니다:

- **프론트엔드**
  - Next.js (App Router)
  - TypeScript
  - TailwindCSS
  - Shadcn/UI
  - Lucide Icons

- **백엔드**
  - Next.js API Routes
  - TypeScript
  - MSSQL

- **데이터베이스**
  - Microsoft SQL Server

- **인프라**
  - 우분투 서버를 사용합니다. 

## 향후 업데이트 사항

이 문서는 프로젝트 진행에 따라 지속적으로 업데이트됩니다. 주요 업데이트 사항:

1. 각 기능별 API 명세 추가
2. 데이터베이스 스키마 정의
3. 저장 프로시저 목록 및 명세
4. UI/UX 디자인 가이드
5. 테스트 계획 및 결과

---

**최종 업데이트:** 2025-03-15 10:23
