# 입금 API 명세서

## 개요

입금 API는 가맹점에서 입금 정보를 등록하고 처리하기 위한 API입니다. 이 API를 통해 가맹점은 입금 정보를 시스템에 등록하고, 시스템은 이를 처리한 후 결과를 반환합니다.

## 기본 정보

- **URL**: `/api/deposit`
- **Method**: POST
- **Content-Type**: application/json
- **인증**: API 키 기반 (헤더에 `mkey`, `mid` 포함)

## 요청 헤더

| 헤더명 | 필수 여부 | 설명 |
|-------|---------|------|
| mkey | 필수 | API 인증 키 |
| mid | 필수 | 가맹점 ID |
| Content-Type | 필수 | application/json |

## 요청 본문 (Request Body)

```json
{
  "merchantId": "MERCHANT001",
  "amount": 50000,
  "txId": "TX-20230101-12345",
  "accountNumber": "123-456-789",
  "depositor": "홍길동",
  "timestamp": "2023-01-01T12:00:00Z",
  "currency": "KRW",
  "description": "테스트 입금"
}
```

### 필드 설명

| 필드명 | 타입 | 필수 여부 | 설명 |
|-------|-----|---------|------|
| merchantId | String | 필수 | 가맹점 ID |
| amount | Number | 필수 | 입금 금액 (양수) |
| txId | String | 필수 | 트랜잭션 ID (중복 방지용) |
| accountNumber | String | 선택 | 계좌번호 |
| depositor | String | 선택 | 입금자명 |
| timestamp | String | 선택 | 입금 시간 (ISO 형식) |
| currency | String | 선택 | 통화 코드 (기본값: KRW) |
| description | String | 선택 | 설명 |

### 유효성 검사 규칙

1. `merchantId`, `amount`, `txId`는 필수 필드입니다.
2. `amount`는 양수여야 합니다.
3. `currency`가 제공된 경우, 유효한 통화 코드여야 합니다 (KRW, USD, EUR, JPY, CNY).
4. `timestamp`가 제공된 경우, 유효한 ISO 형식이어야 합니다.
5. `txId`는 중복되지 않아야 합니다 (이미 처리된 트랜잭션이 아니어야 함).

## 응답 (Response)

### 성공 응답 (200 OK)

```json
{
  "resultCode": "0000",
  "resultMsg": "입금 처리가 완료되었습니다.",
  "depositInfo": {
    "requestId": "DEP-20230101-12345",
    "merchantId": "MERCHANT001",
    "amount": 50000,
    "txId": "TX-20230101-12345",
    "accountNumber": "123-456-789",
    "depositor": "홍길동",
    "timestamp": "2023-01-01T12:00:00Z",
    "status": "COMPLETED",
    "processedAt": "2023-01-01T12:01:00Z",
    "currency": "KRW",
    "description": "테스트 입금"
  },
  "requestId": "DEP-20230101-12345",
  "processingTime": "123ms"
}
```

### 중복 트랜잭션 응답 (200 OK)

```json
{
  "resultCode": "0001",
  "resultMsg": "이미 처리된 거래입니다.",
  "requestId": "DEP-20230101-12345"
}
```

### 오류 응답

#### 필수 정보 누락 (400 Bad Request)

```json
{
  "resultCode": "1001",
  "resultMsg": "필수 정보가 누락되었습니다.",
  "requestId": "DEP-20230101-12345"
}
```

#### 인증 실패 (401 Unauthorized)

```json
{
  "resultCode": "1002",
  "resultMsg": "인증에 실패했습니다.",
  "requestId": "DEP-20230101-12345"
}
```

#### 잘못된 HTTP 메소드 (405 Method Not Allowed)

```json
{
  "resultCode": "1003",
  "resultMsg": "Method Not Allowed",
  "requestId": "DEP-20230101-12345"
}
```

#### 유효하지 않은 금액 (400 Bad Request)

```json
{
  "resultCode": "1004",
  "resultMsg": "유효하지 않은 금액입니다.",
  "requestId": "DEP-20230101-12345"
}
```

#### 요청 한도 초과 (429 Too Many Requests)

```json
{
  "resultCode": "1005",
  "resultMsg": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  "requestId": "DEP-20230101-12345"
}
```

#### 유효하지 않은 통화 코드 (400 Bad Request)

```json
{
  "resultCode": "1006",
  "resultMsg": "유효하지 않은 통화 코드입니다.",
  "requestId": "DEP-20230101-12345"
}
```

#### 유효하지 않은 타임스탬프 (400 Bad Request)

```json
{
  "resultCode": "1007",
  "resultMsg": "유효하지 않은 타임스탬프입니다.",
  "requestId": "DEP-20230101-12345"
}
```

#### 서버 내부 오류 (500 Internal Server Error)

```json
{
  "resultCode": "9999",
  "resultMsg": "서버 내부 오류가 발생했습니다.",
  "requestId": "DEP-20230101-12345"
}
```

## 결과 코드 요약

| 결과 코드 | 설명 |
|---------|------|
| 0000 | 성공 |
| 0001 | 이미 처리된 거래 |
| 1001 | 필수 정보 누락 |
| 1002 | 인증 실패 |
| 1003 | 잘못된 HTTP 메소드 |
| 1004 | 유효하지 않은 금액 |
| 1005 | 요청 한도 초과 |
| 1006 | 유효하지 않은 통화 코드 |
| 1007 | 유효하지 않은 타임스탬프 |
| 9999 | 서버 내부 오류 |

## 알림 기능

입금 처리가 완료되면 다음과 같은 알림이 발송됩니다:

1. 텔레그램 알림: 입금 정보가 포함된 메시지가 텔레그램 봇을 통해 발송됩니다.
2. 로그 기록: 입금 처리 과정이 로그 파일에 기록됩니다.

## 테스트 방법

입금 API를 테스트하기 위해 `test-deposit.js` 스크립트를 사용할 수 있습니다. 이 스크립트는 다양한 테스트 케이스를 실행하고 결과를 콘솔에 출력합니다.

```bash
node test-deposit.js
```

## 예제 코드

### Node.js (Axios)

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:45451/api/deposit';
const API_MKEY = 'your_mkey_here';
const API_MID = 'your_mid_here';

const depositData = {
  merchantId: 'MERCHANT001',
  amount: 50000,
  txId: `TX-${Date.now()}`,
  accountNumber: '123-456-789',
  depositor: '홍길동',
  timestamp: new Date().toISOString(),
  currency: 'KRW',
  description: '테스트 입금'
};

async function processDeposit() {
  try {
    const response = await axios.post(API_URL, depositData, {
      headers: {
        'Content-Type': 'application/json',
        'mkey': API_MKEY,
        'mid': API_MID
      }
    });
    
    console.log('응답 상태:', response.status);
    console.log('응답 데이터:', response.data);
    
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('에러 응답 상태:', error.response.status);
      console.error('에러 응답 데이터:', error.response.data);
    } else {
      console.error('요청 오류:', error.message);
    }
    throw error;
  }
}

processDeposit();
```

### Python (Requests)

```python
import requests
import json
from datetime import datetime
import time

API_URL = 'http://localhost:45451/api/deposit'
API_MKEY = 'your_mkey_here'
API_MID = 'your_mid_here'

deposit_data = {
    'merchantId': 'MERCHANT001',
    'amount': 50000,
    'txId': f'TX-{int(time.time())}',
    'accountNumber': '123-456-789',
    'depositor': '홍길동',
    'timestamp': datetime.now().isoformat(),
    'currency': 'KRW',
    'description': '테스트 입금'
}

headers = {
    'Content-Type': 'application/json',
    'mkey': API_MKEY,
    'mid': API_MID
}

try:
    response = requests.post(API_URL, json=deposit_data, headers=headers)
    
    print(f'응답 상태: {response.status_code}')
    print(f'응답 데이터: {response.json()}')
    
except Exception as e:
    print(f'요청 오류: {str(e)}')
```

## 주의사항

1. 모든 API 요청에는 인증 헤더(`mkey`, `mid`)가 포함되어야 합니다.
2. 트랜잭션 ID(`txId`)는 중복되지 않도록 유니크한 값을 사용해야 합니다.
3. 금액(`amount`)은 항상 양수여야 합니다.
4. 통화 코드(`currency`)는 지원되는 값(KRW, USD, EUR, JPY, CNY)만 사용해야 합니다.
5. 타임스탬프(`timestamp`)는 ISO 형식(예: "2023-01-01T12:00:00Z")이어야 합니다.
