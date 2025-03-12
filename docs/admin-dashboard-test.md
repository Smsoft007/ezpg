# EzPG 관리자 대시보드 테스트 문서

## 테스트 환경 설정

EzPG 전자결제 시스템의 관리자 대시보드 테스트를 위한 환경 설정 및 테스트 시나리오를 제공합니다.

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음과 같이 설정합니다:

```
# EzPG 전자결제 시스템 환경 설정

# API 접속 정보
API_BASE_URL=https://api.ez-pg.com
WEB_BASE_URL=https://mer.ez-pg.com

# 가맹점 정보
MERCHANT_ID=ys1234
MERCHANT_KEY=letsgo123

# 데이터베이스 연결 정보 (MSSQL)
DB_HOST=localhost
DB_PORT=1433
DB_NAME=ezpg_db
DB_USER=ezpg_user
DB_PASSWORD=ezpg_password

# JWT 설정
JWT_SECRET=ezpg_jwt_secret_key_for_secure_authentication
JWT_EXPIRES_IN=24h

# 구글 OTP 설정
GOOGLE_OTP_ISSUER=EzPG
GOOGLE_OTP_LABEL=EzPG Payment System

# 테스트 API 키
TEST_API_KEY=test03
TEST_API_SECRET=asd123!@#
```

## 테스트 시나리오

### 1. 로그인 및 OTP 인증 테스트

#### 테스트 목적

- 로그인 기능 검증
- 구글 OTP 인증 기능 검증

#### 테스트 단계

1. 로그인 페이지 접속
2. 사용자 ID/PW 입력 (ys1234/letsgo123)
3. 로그인 버튼 클릭
4. OTP 인증 화면 전환 확인
5. OTP 코드 입력
6. 인증 버튼 클릭
7. 대시보드 페이지 이동 확인

#### 예상 결과

- 올바른 ID/PW 입력 시 OTP 인증 화면으로 전환
- 올바른 OTP 코드 입력 시 대시보드로 이동
- 잘못된 ID/PW 또는 OTP 코드 입력 시 오류 메시지 표시

### 2. 가상계좌 입금 테스트

#### 테스트 목적

- 동일 금액 여러 번 입금 시 API 처리 확인
- 입금 신청금액 일치 여부 설정에 따른 동작 확인

#### 테스트 단계

1. 가상계좌 발급 (고정형)

   - 가맹점 ID: ys1234
   - 계좌 유형: fixed
   - 은행 코드: 선택

2. 동일 금액 3회 연속 입금 테스트

   - 가상계좌 번호: 발급된 계좌번호
   - 은행 코드: 발급된 은행코드
   - 금액: 100,000원
   - 3회 반복 입금

3. 입금 신청금액 일치 필요 설정 테스트

   - 가맹점 설정에서 amountMatchRequired = 'Y' 설정
   - 신청금액: 20,000원
   - 실제 입금액: 25,000원 (불일치)

4. 허용 오차 설정 테스트
   - 가맹점 설정에서 allowedAmountError = 5,000원 설정
   - 신청금액: 20,000원
   - 실제 입금액: 25,000원 (허용 오차 내)
   - 실제 입금액: 30,000원 (허용 오차 초과)

#### 예상 결과

- 동일 금액 3회 입금 시 각각 별도 거래로 처리되어야 함
- 입금 신청금액 일치 필요 설정 시 불일치 금액은 거부되어야 함
- 허용 오차 내 금액은 처리되고, 초과 금액은 거부되어야 함

### 3. 가맹점별 잔액 조회 테스트

#### 테스트 목적

- 가맹점별 총 합산 잔액 표시 기능 검증
- 권한별 조회 범위 검증

#### 테스트 단계

1. 본사 계정으로 로그인
2. 대시보드에서 가맹점별 잔액 확인
3. 가맹점 계정으로 로그인
4. 대시보드에서 해당 가맹점 잔액만 확인

#### 예상 결과

- 본사 계정: 모든 가맹점의 잔액 정보 표시
- 가맹점 계정: 해당 가맹점의 잔액 정보만 표시

### 4. 가맹점 설정 테스트

#### 테스트 목적

- 가맹점 수수료 설정 기능 검증
- 가상계좌 유형 설정 기능 검증
- 입금 신청금액 일치 여부 설정 기능 검증

#### 테스트 단계

1. 본사 계정으로 로그인
2. 가맹점 관리 메뉴 접속
3. 가맹점 선택 및 설정 페이지 접속
4. 다음 설정 변경:
   - 입금 수수료율: 1.5%
   - 출금 수수료율: 1.0%
   - 가상계좌 유형: fixed
   - 입금 신청금액 일치 필요 여부: Y
   - 허용 오차 금액: 5,000원
5. 설정 저장
6. 변경된 설정 적용 확인

#### 예상 결과

- 설정 변경 후 저장 시 성공 메시지 표시
- 변경된 설정이 실제 거래에 적용되어야 함

## API 테스트

### 1. 로그인 API 테스트

```javascript
// 테스트 코드
async function testLogin() {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: process.env.MERCHANT_ID,
        password: process.env.MERCHANT_KEY,
      }),
    });

    const data = await response.json();
    console.log("로그인 결과:", data);

    return data;
  } catch (error) {
    console.error("로그인 테스트 오류:", error);
  }
}
```

### 2. 가상계좌 입금 테스트 API

```javascript
// 테스트 코드
async function testDeposit(accountNo, bankCode, amount) {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/test/deposit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        accountNo,
        bankCode,
        amount,
        depositorName: "테스트 입금자",
      }),
    });

    const data = await response.json();
    console.log("입금 테스트 결과:", data);

    return data;
  } catch (error) {
    console.error("입금 테스트 오류:", error);
  }
}

// 동일 금액 3회 입금 테스트
async function testMultipleDeposits() {
  const accountNo = "1234567890"; // 발급된 가상계좌 번호
  const bankCode = "004"; // 발급된 은행 코드
  const amount = 100000; // 10만원

  for (let i = 0; i < 3; i++) {
    console.log(`${i + 1}번째 입금 테스트`);
    await testDeposit(accountNo, bankCode, amount);
    // 약간의 시간 간격을 두고 테스트
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
```

### 3. 가맹점 설정 API 테스트

```javascript
// 테스트 코드
async function testMerchantSettings() {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/merchants/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        merchantId: process.env.MERCHANT_ID,
        depositFeeRate: 1.5,
        withdrawalFeeRate: 1.0,
        accountType: "fixed",
        amountMatchRequired: "Y",
        allowedAmountError: 5000,
      }),
    });

    const data = await response.json();
    console.log("가맹점 설정 결과:", data);

    return data;
  } catch (error) {
    console.error("가맹점 설정 테스트 오류:", error);
  }
}
```

## 테스트 결과 기록

테스트 실행 후 다음 정보를 기록합니다:

1. 테스트 일시
2. 테스트 항목
3. 테스트 결과 (성공/실패)
4. 오류 메시지 (실패 시)
5. 응답 시간
6. 특이사항

## 테스트 자동화

테스트 자동화를 위해 Jest 또는 Cypress를 사용할 수 있습니다:

### Jest 설정 예시

```javascript
// login.test.js
const fetch = require("node-fetch");
require("dotenv").config();

describe("로그인 API 테스트", () => {
  test("올바른 ID/PW로 로그인 시 성공해야 함", async () => {
    const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: process.env.MERCHANT_ID,
        password: process.env.MERCHANT_KEY,
      }),
    });

    const data = await response.json();
    expect(data.resultCode).toBe("0000");
    expect(data.requireOtp).toBeDefined();
  });
});
```

## 문제 해결 가이드

테스트 중 발생할 수 있는 일반적인 문제와 해결 방법:

1. **API 연결 오류**

   - 환경 변수 설정 확인
   - 네트워크 연결 확인
   - API 서버 상태 확인

2. **인증 오류**

   - 토큰 만료 여부 확인
   - ID/PW 정확성 확인
   - OTP 코드 정확성 확인

3. **가상계좌 입금 테스트 실패**

   - 가상계좌 상태 확인 (활성화 여부)
   - 입금 금액 제한 확인
   - 가맹점 설정 확인

4. **권한 오류**
   - 사용자 권한 확인 (본사/가맹점)
   - API 접근 권한 확인
