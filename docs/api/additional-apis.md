# EzPG 추가 필요 API 문서

본 문서는 EzPG 전자결제 시스템 구현을 위해 추가로 필요한 API에 대한 명세를 제공합니다.

## 1. 로그인 API

### 기본 정보

- **인터페이스명**: 로그인
- **URL**: `https://api.ez-pg.com/auth/login`
- **Protocol**: HTTP POST
- **Content-Type**: application/json

### 요청 파라미터

| 파라미터명 | 필수여부 | 설명            | 최대 길이 |
| ---------- | -------- | --------------- | --------- |
| userId     | 필수     | 사용자 아이디   | 15byte    |
| password   | 필수     | 사용자 비밀번호 | 255byte   |

### 응답 정보

- **인터페이스명**: 로그인 결과
- **Protocol**: HTTPS Response
- **Content-Type**: application/json

### 응답 파라미터

| 파라미터명 | 필수여부 | 설명                              |
| ---------- | -------- | --------------------------------- |
| resultCode | 필수     | 결과코드 (0000:성공, 이외 실패)   |
| resultMsg  | 필수     | 결과메세지                        |
| token      | 조건부   | JWT 토큰 (로그인 성공 시)         |
| userInfo   | 조건부   | 사용자 정보 객체 (로그인 성공 시) |
| requireOtp | 필수     | OTP 인증 필요 여부 (Y/N)          |

### userInfo 객체 구조

| 필드명       | 설명                        |
| ------------ | --------------------------- |
| userId       | 사용자 아이디               |
| userName     | 사용자 이름                 |
| adminYn      | 관리자 여부 (Y/N)           |
| merchantId   | 가맹점 ID (가맹점인 경우)   |
| merchantName | 가맹점 이름 (가맹점인 경우) |
| lastLoginDt  | 마지막 로그인 일시          |

## 2. OTP 인증 API

### 기본 정보

- **인터페이스명**: OTP 인증
- **URL**: `https://api.ez-pg.com/auth/verify-otp`
- **Protocol**: HTTP POST
- **Content-Type**: application/json

### 요청 파라미터

| 파라미터명 | 필수여부 | 설명          | 최대 길이 |
| ---------- | -------- | ------------- | --------- |
| userId     | 필수     | 사용자 아이디 | 15byte    |
| otpCode    | 필수     | OTP 인증 코드 | 6byte     |

### 응답 정보

- **인터페이스명**: OTP 인증 결과
- **Protocol**: HTTPS Response
- **Content-Type**: application/json

### 응답 파라미터

| 파라미터명 | 필수여부 | 설명                            |
| ---------- | -------- | ------------------------------- |
| resultCode | 필수     | 결과코드 (0000:성공, 이외 실패) |
| resultMsg  | 필수     | 결과메세지                      |
| token      | 조건부   | JWT 토큰 (인증 성공 시)         |
| userInfo   | 조건부   | 사용자 정보 객체 (인증 성공 시) |

## 3. 가맹점 잔액 조회 API

### 기본 정보

- **인터페이스명**: 가맹점 잔액 조회
- **URL**: `https://api.ez-pg.com/merchants/balance`
- **Protocol**: HTTP GET
- **Content-Type**: application/json

### 요청 파라미터

| 파라미터명 | 필수여부 | 설명                                    | 최대 길이 |
| ---------- | -------- | --------------------------------------- | --------- |
| merchantId | 선택     | 가맹점 ID (본사만 사용, 미입력 시 전체) | 15byte    |

### 응답 정보

- **인터페이스명**: 가맹점 잔액 조회 결과
- **Protocol**: HTTPS Response
- **Content-Type**: application/json

### 응답 파라미터

| 파라미터명  | 필수여부 | 설명                            |
| ----------- | -------- | ------------------------------- |
| resultCode  | 필수     | 결과코드 (0000:성공, 이외 실패) |
| resultMsg   | 필수     | 결과메세지                      |
| balanceList | 조건부   | 가맹점 잔액 목록 (성공 시)      |

### balanceList 객체 구조

| 필드명       | 설명             |
| ------------ | ---------------- |
| merchantId   | 가맹점 ID        |
| merchantName | 가맹점 이름      |
| balance      | 현재 잔액        |
| lastTrxDt    | 마지막 거래 일시 |

## 4. 가맹점 설정 API

### 기본 정보

- **인터페이스명**: 가맹점 설정
- **URL**: `https://api.ez-pg.com/merchants/settings`
- **Protocol**: HTTP POST
- **Content-Type**: application/json

### 요청 파라미터

| 파라미터명          | 필수여부 | 설명                               | 최대 길이 |
| ------------------- | -------- | ---------------------------------- | --------- |
| merchantId          | 필수     | 가맹점 ID                          | 15byte    |
| depositFeeRate      | 선택     | 입금 수수료율 (%)                  | 5byte     |
| withdrawalFeeRate   | 선택     | 출금 수수료율 (%)                  | 5byte     |
| accountType         | 선택     | 가상계좌 유형 (fixed/one-time)     | 10byte    |
| amountMatchRequired | 선택     | 입금 신청금액 일치 필요 여부 (Y/N) | 1byte     |
| allowedAmountError  | 선택     | 허용 오차 금액 (원)                | 10byte    |

### 응답 정보

- **인터페이스명**: 가맹점 설정 결과
- **Protocol**: HTTPS Response
- **Content-Type**: application/json

### 응답 파라미터

| 파라미터명 | 필수여부 | 설명                            |
| ---------- | -------- | ------------------------------- |
| resultCode | 필수     | 결과코드 (0000:성공, 이외 실패) |
| resultMsg  | 필수     | 결과메세지                      |
| merchantId | 필수     | 가맹점 ID                       |
| settings   | 조건부   | 설정 정보 객체 (성공 시)        |

### settings 객체 구조

| 필드명              | 설명                         |
| ------------------- | ---------------------------- |
| depositFeeRate      | 입금 수수료율 (%)            |
| withdrawalFeeRate   | 출금 수수료율 (%)            |
| accountType         | 가상계좌 유형                |
| amountMatchRequired | 입금 신청금액 일치 필요 여부 |
| allowedAmountError  | 허용 오차 금액               |

## 5. 가상계좌 발급 API

### 기본 정보

- **인터페이스명**: 가상계좌 발급
- **URL**: `https://api.ez-pg.com/accounts/issue`
- **Protocol**: HTTP POST
- **Content-Type**: application/json

### 요청 파라미터

| 파라미터명  | 필수여부 | 설명                                 | 최대 길이 |
| ----------- | -------- | ------------------------------------ | --------- |
| merchantId  | 필수     | 가맹점 ID                            | 15byte    |
| accountType | 필수     | 가상계좌 유형 (fixed/one-time)       | 10byte    |
| bankCode    | 선택     | 은행 코드 (미입력 시 랜덤 할당)      | 3byte     |
| amount      | 조건부   | 입금 예정 금액 (일회성 계좌 시 필수) | 11byte    |

### 응답 정보

- **인터페이스명**: 가상계좌 발급 결과
- **Protocol**: HTTPS Response
- **Content-Type**: application/json

### 응답 파라미터

| 파라미터명  | 필수여부 | 설명                            |
| ----------- | -------- | ------------------------------- |
| resultCode  | 필수     | 결과코드 (0000:성공, 이외 실패) |
| resultMsg   | 필수     | 결과메세지                      |
| merchantId  | 필수     | 가맹점 ID                       |
| accountInfo | 조건부   | 가상계좌 정보 객체 (성공 시)    |

### accountInfo 객체 구조

| 필드명      | 설명                                |
| ----------- | ----------------------------------- |
| accountId   | 가상계좌 ID                         |
| bankCode    | 은행 코드                           |
| bankName    | 은행 이름                           |
| accountNo   | 가상계좌 번호                       |
| accountType | 가상계좌 유형 (fixed/one-time)      |
| amount      | 입금 예정 금액 (일회성 계좌의 경우) |
| issueDt     | 발급 일시                           |
| expireDt    | 만료 일시 (일회성 계좌의 경우)      |

## 6. 입금 내역 조회 API

### 기본 정보

- **인터페이스명**: 입금 내역 조회
- **URL**: `https://api.ez-pg.com/transactions/deposits`
- **Protocol**: HTTP GET
- **Content-Type**: application/json

### 요청 파라미터

| 파라미터명 | 필수여부 | 설명                                    | 최대 길이 |
| ---------- | -------- | --------------------------------------- | --------- |
| merchantId | 선택     | 가맹점 ID (본사만 사용, 미입력 시 전체) | 15byte    |
| startDate  | 선택     | 조회 시작 일자 (YYYYMMDD)               | 8byte     |
| endDate    | 선택     | 조회 종료 일자 (YYYYMMDD)               | 8byte     |
| page       | 선택     | 페이지 번호 (기본값: 1)                 | 5byte     |
| limit      | 선택     | 페이지당 항목 수 (기본값: 20)           | 5byte     |

### 응답 정보

- **인터페이스명**: 입금 내역 조회 결과
- **Protocol**: HTTPS Response
- **Content-Type**: application/json

### 응답 파라미터

| 파라미터명  | 필수여부 | 설명                            |
| ----------- | -------- | ------------------------------- |
| resultCode  | 필수     | 결과코드 (0000:성공, 이외 실패) |
| resultMsg   | 필수     | 결과메세지                      |
| totalCount  | 조건부   | 전체 항목 수 (성공 시)          |
| page        | 조건부   | 현재 페이지 번호 (성공 시)      |
| limit       | 조건부   | 페이지당 항목 수 (성공 시)      |
| depositList | 조건부   | 입금 내역 목록 (성공 시)        |

### depositList 객체 구조

| 필드명       | 설명                        |
| ------------ | --------------------------- |
| trxId        | 거래 ID                     |
| merchantId   | 가맹점 ID                   |
| merchantName | 가맹점 이름                 |
| accountNo    | 가상계좌 번호               |
| bankCode     | 은행 코드                   |
| bankName     | 은행 이름                   |
| amount       | 입금 금액                   |
| fee          | 수수료                      |
| netAmount    | 순 입금액 (입금액 - 수수료) |
| depositDt    | 입금 일시                   |
| status       | 상태 (완료/취소 등)         |

## 7. 출금 내역 조회 API

### 기본 정보

- **인터페이스명**: 출금 내역 조회
- **URL**: `https://api.ez-pg.com/transactions/withdrawals`
- **Protocol**: HTTP GET
- **Content-Type**: application/json

### 요청 파라미터

| 파라미터명 | 필수여부 | 설명                                    | 최대 길이 |
| ---------- | -------- | --------------------------------------- | --------- |
| merchantId | 선택     | 가맹점 ID (본사만 사용, 미입력 시 전체) | 15byte    |
| startDate  | 선택     | 조회 시작 일자 (YYYYMMDD)               | 8byte     |
| endDate    | 선택     | 조회 종료 일자 (YYYYMMDD)               | 8byte     |
| page       | 선택     | 페이지 번호 (기본값: 1)                 | 5byte     |
| limit      | 선택     | 페이지당 항목 수 (기본값: 20)           | 5byte     |

### 응답 정보

- **인터페이스명**: 출금 내역 조회 결과
- **Protocol**: HTTPS Response
- **Content-Type**: application/json

### 응답 파라미터

| 파라미터명     | 필수여부 | 설명                            |
| -------------- | -------- | ------------------------------- |
| resultCode     | 필수     | 결과코드 (0000:성공, 이외 실패) |
| resultMsg      | 필수     | 결과메세지                      |
| totalCount     | 조건부   | 전체 항목 수 (성공 시)          |
| page           | 조건부   | 현재 페이지 번호 (성공 시)      |
| limit          | 조건부   | 페이지당 항목 수 (성공 시)      |
| withdrawalList | 조건부   | 출금 내역 목록 (성공 시)        |

### withdrawalList 객체 구조

| 필드명       | 설명                        |
| ------------ | --------------------------- |
| trxId        | 거래 ID                     |
| merchantId   | 가맹점 ID                   |
| merchantName | 가맹점 이름                 |
| bankCode     | 은행 코드                   |
| bankName     | 은행 이름                   |
| accountNo    | 출금 계좌번호               |
| accountName  | 예금주명                    |
| amount       | 출금 금액                   |
| fee          | 수수료                      |
| netAmount    | 순 출금액 (출금액 - 수수료) |
| withdrawalDt | 출금 일시                   |
| status       | 상태 (완료/처리중/취소 등)  |

## 8. 가맹점 목록 조회 API

### 기본 정보

- **인터페이스명**: 가맹점 목록 조회
- **URL**: `https://api.ez-pg.com/merchants/list`
- **Protocol**: HTTP GET
- **Content-Type**: application/json

### 요청 파라미터

| 파라미터명    | 필수여부 | 설명                          | 최대 길이 |
| ------------- | -------- | ----------------------------- | --------- |
| searchKeyword | 선택     | 검색 키워드 (가맹점명, ID 등) | 50byte    |
| page          | 선택     | 페이지 번호 (기본값: 1)       | 5byte     |
| limit         | 선택     | 페이지당 항목 수 (기본값: 20) | 5byte     |

### 응답 정보

- **인터페이스명**: 가맹점 목록 조회 결과
- **Protocol**: HTTPS Response
- **Content-Type**: application/json

### 응답 파라미터

| 파라미터명   | 필수여부 | 설명                            |
| ------------ | -------- | ------------------------------- |
| resultCode   | 필수     | 결과코드 (0000:성공, 이외 실패) |
| resultMsg    | 필수     | 결과메세지                      |
| totalCount   | 조건부   | 전체 항목 수 (성공 시)          |
| page         | 조건부   | 현재 페이지 번호 (성공 시)      |
| limit        | 조건부   | 페이지당 항목 수 (성공 시)      |
| merchantList | 조건부   | 가맹점 목록 (성공 시)           |

### merchantList 객체 구조

| 필드명              | 설명                         |
| ------------------- | ---------------------------- |
| merchantId          | 가맹점 ID                    |
| merchantName        | 가맹점 이름                  |
| contactPerson       | 담당자명                     |
| contactPhone        | 연락처                       |
| email               | 이메일                       |
| registDt            | 등록일시                     |
| status              | 상태 (활성/비활성)           |
| balance             | 현재 잔액                    |
| depositFeeRate      | 입금 수수료율                |
| withdrawalFeeRate   | 출금 수수료율                |
| accountType         | 가상계좌 유형                |
| amountMatchRequired | 입금 신청금액 일치 필요 여부 |

## 9. 가상계좌 입금 테스트 API

### 기본 정보

- **인터페이스명**: 가상계좌 입금 테스트
- **URL**: `https://api.ez-pg.com/test/deposit`
- **Protocol**: HTTP POST
- **Content-Type**: application/json

### 요청 파라미터

| 파라미터명    | 필수여부 | 설명          | 최대 길이 |
| ------------- | -------- | ------------- | --------- |
| accountNo     | 필수     | 가상계좌 번호 | 20byte    |
| bankCode      | 필수     | 은행 코드     | 3byte     |
| amount        | 필수     | 입금 금액     | 11byte    |
| depositorName | 선택     | 입금자명      | 50byte    |

### 응답 정보

- **인터페이스명**: 가상계좌 입금 테스트 결과
- **Protocol**: HTTPS Response
- **Content-Type**: application/json

### 응답 파라미터

| 파라미터명 | 필수여부 | 설명                            |
| ---------- | -------- | ------------------------------- |
| resultCode | 필수     | 결과코드 (0000:성공, 이외 실패) |
| resultMsg  | 필수     | 결과메세지                      |
| trxId      | 조건부   | 거래 ID (성공 시)               |
| accountNo  | 필수     | 가상계좌 번호                   |
| amount     | 필수     | 입금 금액                       |
| depositDt  | 조건부   | 입금 일시 (성공 시)             |
| status     | 필수     | 처리 상태                       |
| reason     | 조건부   | 실패 사유 (실패 시)             |

## 구현 가이드

### API 호출 예시 (JavaScript)

```javascript
// 로그인 API 호출 예시
async function login(userId, password) {
  try {
    const response = await fetch("https://api.ez-pg.com/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        password,
      }),
    });

    const data = await response.json();

    if (data.resultCode === "0000") {
      if (data.requireOtp === "Y") {
        // OTP 인증 화면으로 이동
        return { success: true, requireOtp: true, userId };
      } else {
        // 로그인 성공, 토큰 저장
        localStorage.setItem("token", data.token);
        localStorage.setItem("userInfo", JSON.stringify(data.userInfo));
        return { success: true, requireOtp: false, userInfo: data.userInfo };
      }
    } else {
      // 로그인 실패
      return { success: false, message: data.resultMsg };
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "서버 연결 오류" };
  }
}
```

### 보안 고려사항

1. 모든 API 호출은 HTTPS를 통해 이루어져야 합니다.
2. 인증이 필요한 API는 요청 헤더에 JWT 토큰을 포함해야 합니다.
3. 민감한 정보(비밀번호 등)는 암호화하여 전송해야 합니다.
4. API 호출 횟수 제한을 통해 DDoS 공격을 방지해야 합니다.
5. 로그인 실패 시 일정 횟수 이상 시도할 경우 계정을 일시적으로 잠금 처리해야 합니다.
