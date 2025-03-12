# 가상계좌 관리 관련 API (구현 완료)

## 개요

이 문서는 EzPG 전자결제 시스템의 가상계좌 관리 관련 API 중 현재 구현이 완료되어 사용 가능한 API들을 설명합니다.

## API 목록

| 순번 | API 명                   | 설명                 | 문서 위치                   | 구현 상태 |
| ---- | ------------------------ | -------------------- | --------------------------- | --------- |
| 1    | 가상계좌 발급 API        | 가상계좌 발급        | docs/api/additional-apis.md | 구현 완료 |
| 2    | 가상계좌 입금 테스트 API | 가상계좌 입금 테스트 | docs/api/additional-apis.md | 구현 완료 |

## API 상세 정보

### 1. 가상계좌 발급 API

#### 기능 설명

- 가맹점에 가상계좌를 발급합니다.
- 고정형(fixed) 또는 동적(dynamic) 가상계좌를 발급할 수 있습니다.
- 고정형 가상계좌는 재사용이 가능하며, 동적 가상계좌는 1회용입니다.

#### 요청 정보

- URL: `/virtual-accounts/issue`
- Method: POST
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터

```json
{
  "merchantId": "가맹점 ID",
  "accountType": "fixed | dynamic",
  "bankCode": "은행코드",
  "amount": 100000,
  "expireDate": "2023-12-31",
  "depositorName": "입금자명 (선택적)"
}
```

#### 응답 정보

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "virtualAccount": {
    "accountId": "가상계좌 ID",
    "merchantId": "가맹점 ID",
    "accountNo": "가상계좌번호",
    "bankCode": "은행코드",
    "bankName": "은행명",
    "accountType": "fixed | dynamic",
    "amount": 100000,
    "status": "active",
    "expireDate": "2023-12-31",
    "createdAt": "2023-03-12T10:30:00Z"
  }
}
```

### 2. 가상계좌 입금 테스트 API

#### 기능 설명

- 테스트 환경에서 가상계좌 입금을 시뮬레이션합니다.
- 실제 은행 연동 없이 가상계좌 입금 처리를 테스트할 수 있습니다.
- 동일 금액 여러 번 입금, 입금 신청금액 일치 여부 등을 테스트할 수 있습니다.

#### 요청 정보

- URL: `/test/deposit`
- Method: POST
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터

```json
{
  "accountNo": "가상계좌번호",
  "bankCode": "은행코드",
  "amount": 100000,
  "depositorName": "테스트 입금자"
}
```

#### 응답 정보

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "transactionId": "거래 ID",
  "merchantId": "가맹점 ID",
  "accountNo": "가상계좌번호",
  "bankCode": "은행코드",
  "amount": 100000,
  "depositorName": "테스트 입금자",
  "status": "completed",
  "createdAt": "2023-03-12T10:30:00Z"
}
```

#### 테스트 코드 예시

```javascript
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

## 테스트 시나리오

### 가상계좌 입금 테스트

#### 테스트 목적

- 동일 금액 여러 번 입금 시 API 처리 확인
- 입금 신청금액 일치 여부 설정에 따른 동작 확인

#### 테스트 단계

1. 가상계좌 발급 (고정형)

   - 가맹점 ID: ys1234
   - 계좌 유형: fixed
   - 은행 코드: 선택
   - 금액: 100,000원

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
