# 가맹점 관리 관련 API (구현 완료)

## 개요

이 문서는 EzPG 전자결제 시스템의 가맹점 관리 관련 API 중 현재 구현이 완료되어 사용 가능한 API들을 설명합니다.

## API 목록

| 순번 | API 명               | 설명                  | 문서 위치                     | 구현 상태 |
| ---- | -------------------- | --------------------- | ----------------------------- | --------- |
| 1    | 가맹점 등록 API      | 가맹점 정보 등록      | docs/api/user-registration.md | 구현 완료 |
| 2    | 가맹점 목록 조회 API | 가맹점 목록 조회      | docs/api/additional-apis.md   | 구현 완료 |
| 3    | 가맹점 설정 API      | 가맹점 설정 정보 관리 | docs/api/additional-apis.md   | 구현 완료 |

## API 상세 정보

### 1. 가맹점 등록 API

#### 기능 설명

- 새로운 가맹점을 시스템에 등록합니다.
- 가맹점 기본 정보, 담당자 정보, 계좌 정보 등을 설정합니다.
- 본사 계정만 사용 가능합니다.

#### 요청 정보

- URL: `/merchants/register`
- Method: POST
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터

```json
{
  "merchantInfo": {
    "merchantName": "가맹점 이름",
    "businessNumber": "사업자등록번호",
    "representativeName": "대표자명",
    "businessType": "업종",
    "businessCategory": "업태",
    "address": "주소",
    "phoneNumber": "전화번호"
  },
  "contactInfo": {
    "managerName": "담당자명",
    "managerEmail": "담당자 이메일",
    "managerPhone": "담당자 전화번호"
  },
  "accountInfo": {
    "bankCode": "은행코드",
    "accountNumber": "계좌번호",
    "accountHolder": "예금주명"
  },
  "feeInfo": {
    "depositFeeRate": 1.5,
    "withdrawalFeeRate": 1.0
  },
  "settingInfo": {
    "accountType": "fixed | dynamic",
    "amountMatchRequired": "Y | N",
    "allowedAmountError": 5000
  }
}
```

#### 응답 정보

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "merchantId": "생성된 가맹점 ID",
  "merchantKey": "생성된 가맹점 키"
}
```

### 2. 가맹점 목록 조회 API

#### 기능 설명

- 등록된 가맹점 목록을 조회합니다.
- 본사 계정은 모든 가맹점을 조회할 수 있습니다.
- 가맹점 계정은 자신의 정보만 조회할 수 있습니다.

#### 요청 정보

- URL: `/merchants/list`
- Method: GET
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터

```json
{
  "searchKeyword": "검색어 (선택적)",
  "page": 1,
  "limit": 10
}
```

#### 응답 정보

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "totalCount": 100,
  "merchants": [
    {
      "merchantId": "가맹점 ID",
      "merchantName": "가맹점 이름",
      "businessNumber": "사업자등록번호",
      "representativeName": "대표자명",
      "status": "active | inactive",
      "createdAt": "2023-03-01T10:00:00Z",
      "totalBalance": 1000000
    }
  ]
}
```

### 3. 가맹점 설정 API

#### 기능 설명

- 가맹점의 설정 정보를 관리합니다.
- 수수료율, 가상계좌 유형, 입금 신청금액 일치 여부 등을 설정합니다.
- 본사 계정만 사용 가능합니다.

#### 요청 정보

- URL: `/merchants/settings`
- Method: POST
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터

```json
{
  "merchantId": "가맹점 ID",
  "depositFeeRate": 1.5,
  "withdrawalFeeRate": 1.0,
  "accountType": "fixed | dynamic",
  "amountMatchRequired": "Y | N",
  "allowedAmountError": 5000
}
```

#### 응답 정보

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "merchantId": "가맹점 ID",
  "updatedSettings": {
    "depositFeeRate": 1.5,
    "withdrawalFeeRate": 1.0,
    "accountType": "fixed",
    "amountMatchRequired": "Y",
    "allowedAmountError": 5000
  }
}
```

#### 테스트 코드 예시

```javascript
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

## 테스트 시나리오

### 가맹점 설정 테스트

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
