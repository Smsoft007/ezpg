# EzPG API 파라미터 요약

## 개요

이 문서는 EzPG 전자결제 시스템의 모든 API 파라미터를 요약하여 제공합니다. 각 API의 주요 요청 파라미터와 응답 파라미터를 한눈에 확인할 수 있습니다.

## API 파라미터 테이블

| 카테고리          | API 명                   | 파일명                  | 주요 요청 파라미터                                                                                               | 주요 응답 파라미터                                                                                   | 구현 상태      |
| ----------------- | ------------------------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | -------------- |
| **로그인/인증**   | 로그인 API               | additional-apis.md      | userId, password                                                                                                 | resultCode, resultMsg, token, userInfo, requireOtp                                                   | 구현 완료      |
| **로그인/인증**   | OTP 인증 API             | additional-apis.md      | userId, otpCode                                                                                                  | resultCode, resultMsg, token                                                                         | 구현 완료      |
| **대시보드**      | 가맹점 잔액 조회 API     | additional-apis.md      | merchantId (선택적)                                                                                              | resultCode, resultMsg, balanceList                                                                   | 구현 완료      |
| **대시보드**      | 최근 거래 내역 API       | additional-apis.md      | merchantId (선택적), limit, transactionType                                                                      | resultCode, resultMsg, transactions                                                                  | 구현 완료      |
| **가맹점 관리**   | 가맹점 등록 API          | user-registration.md    | merchantInfo, contactInfo, accountInfo, feeInfo, settingInfo                                                     | resultCode, resultMsg, merchantId, merchantKey                                                       | 구현 완료      |
| **가맹점 관리**   | 가맹점 목록 조회 API     | additional-apis.md      | searchKeyword, page, limit                                                                                       | resultCode, resultMsg, totalCount, merchants                                                         | 구현 완료      |
| **가맹점 관리**   | 가맹점 설정 API          | additional-apis.md      | merchantId, depositFeeRate, withdrawalFeeRate, accountType, amountMatchRequired, allowedAmountError              | resultCode, resultMsg, merchantId, updatedSettings                                                   | 구현 완료      |
| **거래 관리**     | 입금 내역 조회 API       | additional-apis.md      | merchantId (선택적), startDate, endDate, page, limit, status                                                     | resultCode, resultMsg, totalCount, deposits                                                          | 구현 완료      |
| **거래 관리**     | 출금 내역 조회 API       | additional-apis.md      | merchantId (선택적), startDate, endDate, page, limit, status                                                     | resultCode, resultMsg, totalCount, withdrawals                                                       | 구현 완료      |
| **거래 관리**     | 출금 API                 | withdrawal.md           | merchantId, amount, bankCode, accountNo, accountHolder, memo                                                     | resultCode, resultMsg, transactionId, merchantId, amount, fee, netAmount, status                     | 구현 완료      |
| **가상계좌 관리** | 가상계좌 발급 API        | additional-apis.md      | merchantId, accountType, bankCode, amount, expireDate, depositorName                                             | resultCode, resultMsg, virtualAccount                                                                | 구현 완료      |
| **가상계좌 관리** | 가상계좌 입금 테스트 API | additional-apis.md      | accountNo, bankCode, amount, depositorName                                                                       | resultCode, resultMsg, transactionId, merchantId, accountNo, bankCode, amount, depositorName, status | 구현 완료      |
| **입금 처리**     | 수취조회 API             | api-processing-guide.md | sysid, org_c, tgrm_dsc, tr_dsc, tr_natv_no, bnk_c, rv_bnk_c, rv_acno, drw_dprnm, tram                            | tr_dt, tr_natv_no, bnk_c, rv_acno, tram, rsp_c, rv_dprnm, org_c                                      | 구현 필요      |
| **입금 처리**     | 입금사전조회 API         | api-processing-guide.md | sysid, org_c, tgrm_dsc, tr_dsc, tr_natv_no, bnk_c, rv_bnk_c, rv_acno, drw_dprnm, tram                            | tr_dt, tr_natv_no, bnk_c, rv_acno, tram, rsp_c, rv_dprnm, org_c                                      | 구현 필요      |
| **입금 처리**     | 입금 API                 | api-processing-guide.md | sysid, org_c, tgrm_dsc, tr_dsc, tr_natv_no, bnk_c, rv_bnk_c, rv_acno, drw_dprnm, tram, real_dprnm_yn, real_dprnm | tr_dt, tr_natv_no, bnk_c, rv_acno, tram, rsp_c, rv_dprnm, org_c                                      | 구현 필요      |
| **입금 처리**     | 입금정정 API             | api-processing-guide.md | sysid, org_c, tgrm_dsc, tr_dsc, tr_natv_no, bnk_c, rv_bnk_c, rv_acno, drw_dprnm, tram                            | tr_dt, tr_natv_no, bnk_c, rv_acno, tram, rsp_c, rv_dprnm, org_c                                      | 구현 필요      |
| **입금 처리**     | 집계 API                 | api-processing-guide.md | sysid, org_c, tgrm_dsc, tr_dsc, tr_natv_no, tot_dt, dz_rv_nrm_cn, dz_rv_nrm_am, dz_rv_crc_cn, dz_rv_crc_am       | rsp_c, tot_dt, rv_nrm_cn, rv_nrm_am, rv_crc_cn, rv_crc_am, org_c                                     | 구현 필요      |
| **추가 필요**     | 시스템 설정 API          | 미정의                  | settingType, settings                                                                                            | resultCode, resultMsg, updatedSettings                                                               | 추가 정의 필요 |
| **추가 필요**     | 알림 설정 API            | 미정의                  | merchantId, telegramSettings, notificationConditions                                                             | resultCode, resultMsg, merchantId, updatedSettings                                                   | 추가 정의 필요 |
| **추가 필요**     | 통계 API                 | 미정의                  | merchantId, startDate, endDate, statisticsType, groupBy                                                          | resultCode, resultMsg, statistics                                                                    | 추가 정의 필요 |
| **추가 필요**     | 로그 관리 API            | 미정의                  | startDate, endDate, logLevel, keyword, page, limit                                                               | resultCode, resultMsg, totalCount, logs                                                              | 추가 정의 필요 |

## 공통 파라미터

### 공통 요청 헤더

| 헤더명        | 설명                    | 필수 여부                       | 예시                                           |
| ------------- | ----------------------- | ------------------------------- | ---------------------------------------------- |
| Content-Type  | 요청 본문의 형식        | 필수                            | application/json                               |
| Authorization | 인증 토큰 (Bearer 방식) | 필수 (로그인/OTP 인증 API 제외) | Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... |
| X-API-KEY     | API 키                  | 선택                            | test03                                         |

### 공통 응답 파라미터

| 파라미터명 | 설명        | 타입   | 예시          |
| ---------- | ----------- | ------ | ------------- |
| resultCode | 응답 코드   | String | "0000" (성공) |
| resultMsg  | 응답 메시지 | String | "성공"        |

### 응답 코드 정의

| 응답 코드 | 설명               |
| --------- | ------------------ |
| 0000      | 성공               |
| 1000      | 시스템 오류        |
| 1001      | 인증 오류          |
| 1002      | 권한 오류          |
| 1003      | 파라미터 오류      |
| 1004      | 데이터 없음        |
| 2001      | 가맹점 정보 없음   |
| 2002      | 잔액 부족          |
| 3001      | 가상계좌 발급 오류 |
| 3002      | 가상계좌 정보 없음 |
| 4001      | 출금 처리 오류     |
| 4002      | 입금 처리 오류     |

## 파라미터 상세 설명

### 로그인 및 인증 관련 API

#### 로그인 API

- **요청 파라미터**:

  - `userId`: 사용자 ID (String, 필수)
  - `password`: 비밀번호 (String, 필수)

- **응답 파라미터**:
  - `resultCode`: 응답 코드 (String)
  - `resultMsg`: 응답 메시지 (String)
  - `token`: JWT 토큰 (String)
  - `userInfo`: 사용자 정보 (Object)
    - `userId`: 사용자 ID (String)
    - `userName`: 사용자 이름 (String)
    - `role`: 사용자 권한 (String)
  - `requireOtp`: OTP 인증 필요 여부 (Boolean)

#### OTP 인증 API

- **요청 파라미터**:

  - `userId`: 사용자 ID (String, 필수)
  - `otpCode`: OTP 코드 (String, 필수)

- **응답 파라미터**:
  - `resultCode`: 응답 코드 (String)
  - `resultMsg`: 응답 메시지 (String)
  - `token`: 완전한 접근 권한이 부여된 JWT 토큰 (String)

### 대시보드 관련 API

#### 가맹점 잔액 조회 API

- **요청 파라미터**:

  - `merchantId`: 가맹점 ID (String, 선택적, 본사 계정만 사용 가능)

- **응답 파라미터**:
  - `resultCode`: 응답 코드 (String)
  - `resultMsg`: 응답 메시지 (String)
  - `balanceList`: 잔액 목록 (Array)
    - `merchantId`: 가맹점 ID (String)
    - `merchantName`: 가맹점 이름 (String)
    - `totalBalance`: 총 잔액 (Number)
    - `availableBalance`: 사용 가능 잔액 (Number)
    - `pendingBalance`: 대기 중인 잔액 (Number)
    - `currency`: 통화 (String)

### 가상계좌 관리 관련 API

#### 가상계좌 발급 API

- **요청 파라미터**:

  - `merchantId`: 가맹점 ID (String, 필수)
  - `accountType`: 계좌 유형 (String, 필수, "fixed" 또는 "dynamic")
  - `bankCode`: 은행 코드 (String, 필수)
  - `amount`: 금액 (Number, 필수)
  - `expireDate`: 만료일 (String, 선택적)
  - `depositorName`: 입금자명 (String, 선택적)

- **응답 파라미터**:
  - `resultCode`: 응답 코드 (String)
  - `resultMsg`: 응답 메시지 (String)
  - `virtualAccount`: 가상계좌 정보 (Object)
    - `accountId`: 가상계좌 ID (String)
    - `merchantId`: 가맹점 ID (String)
    - `accountNo`: 가상계좌번호 (String)
    - `bankCode`: 은행코드 (String)
    - `bankName`: 은행명 (String)
    - `accountType`: 계좌 유형 (String)
    - `amount`: 금액 (Number)
    - `status`: 상태 (String)
    - `expireDate`: 만료일 (String)
    - `createdAt`: 생성일시 (String)
