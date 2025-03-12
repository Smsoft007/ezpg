# 입금 노티(Deposit Notification) API 문서

## 개요

입금 노티 API는 외부 결제 시스템으로부터 입금 알림을 수신하고 처리하는 엔드포인트입니다. 이 API는 입금 정보를 검증하고, 데이터베이스에 저장하며, 가맹점 잔액을 업데이트하고, 텔레그램을 통해 알림을 발송합니다.

## API 엔드포인트

- **URL**: `/api/deposit-noti`
- **Method**: POST
- **Content-Type**: application/json

## 인증

모든 API 요청은 다음 헤더를 포함해야 합니다:

| 헤더 이름 | 설명 |
|----------|------|
| `mkey` | API 인증 키 (환경 변수 `MKEY`와 일치해야 함) |
| `mid` | 가맹점 ID (환경 변수 `MID`와 일치해야 함) |

## 요청 본문 (Request Body)

```json
{
  "txId": "string",          // 거래 ID (필수)
  "merchantId": "string",    // 가맹점 ID (필수)
  "amount": number,          // 입금 금액 (필수, 양수)
  "accountNumber": "string", // 계좌번호 (선택)
  "depositor": "string",     // 입금자 이름 (선택)
  "timestamp": "string",     // 입금 시간 (ISO 형식, 선택)
  "status": "string",        // 상태 (선택, 기본값: "COMPLETED")
  "externalReference": "string", // 외부 참조 ID (선택)
  "currency": "string",      // 통화 코드 (선택, 기본값: "KRW")
  "description": "string"    // 설명 (선택)
}
```

### 필수 필드

- `txId`: 고유한 거래 ID
- `merchantId`: 가맹점 ID
- `amount`: 입금 금액 (양수)

### 선택 필드

- `accountNumber`: 입금된 계좌번호
- `depositor`: 입금자 이름
- `timestamp`: 입금 시간 (ISO 8601 형식, 예: "2023-03-15T09:30:00Z")
- `status`: 입금 상태 (기본값: "COMPLETED")
- `externalReference`: 외부 시스템의 참조 ID
- `currency`: 통화 코드 (기본값: "KRW", 지원: "KRW", "USD", "EUR", "JPY", "CNY")
- `description`: 추가 설명

## 응답 (Response)

### 성공 응답 (200 OK)

```json
{
  "resultCode": "0000",
  "resultMsg": "입금 노티 처리가 완료되었습니다.",
  "depositInfo": {
    "requestId": "string",
    "merchantId": "string",
    "amount": number,
    "txId": "string",
    "accountNumber": "string",
    "depositor": "string",
    "timestamp": "string",
    "status": "string",
    "processedAt": "string",
    "externalReference": "string",
    "currency": "string",
    "description": "string"
  },
  "requestId": "string",
  "processingTime": "string"
}
```

### 중복 거래 응답 (200 OK)

```json
{
  "resultCode": "0001",
  "resultMsg": "이미 처리된 거래입니다.",
  "requestId": "string"
}
```

### 오류 응답

#### 인증 실패 (401 Unauthorized)

```json
{
  "resultCode": "1002",
  "resultMsg": "인증에 실패했습니다.",
  "requestId": "string"
}
```

#### 잘못된 HTTP 메소드 (405 Method Not Allowed)

```json
{
  "resultCode": "1003",
  "resultMsg": "Method Not Allowed",
  "requestId": "string"
}
```

#### 필수 정보 누락 (400 Bad Request)

```json
{
  "resultCode": "1001",
  "resultMsg": "필수 정보가 누락되었습니다.",
  "requestId": "string"
}
```

#### 유효하지 않은 금액 (400 Bad Request)

```json
{
  "resultCode": "1004",
  "resultMsg": "유효하지 않은 금액입니다.",
  "requestId": "string"
}
```

#### 유효하지 않은 통화 코드 (400 Bad Request)

```json
{
  "resultCode": "1006",
  "resultMsg": "유효하지 않은 통화 코드입니다.",
  "requestId": "string"
}
```

#### 유효하지 않은 타임스탬프 (400 Bad Request)

```json
{
  "resultCode": "1007",
  "resultMsg": "유효하지 않은 타임스탬프입니다.",
  "requestId": "string"
}
```

#### 요청 한도 초과 (429 Too Many Requests)

```json
{
  "resultCode": "1005",
  "resultMsg": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  "requestId": "string"
}
```

#### 서버 오류 (500 Internal Server Error)

```json
{
  "resultCode": "9999",
  "resultMsg": "서버 내부 오류가 발생했습니다.",
  "requestId": "string"
}
```

## 결과 코드 요약

| 결과 코드 | 설명 |
|----------|------|
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

## 로깅

입금 노티 API는 다음과 같은 로깅을 수행합니다:

1. 모든 요청 수신 시 로깅
2. 유효성 검사 실패 시 오류 로깅
3. 데이터베이스 저장 성공/실패 로깅
4. 가맹점 잔액 업데이트 성공/실패 로깅
5. 텔레그램 알림 발송 성공/실패 로깅
6. 최종 응답 로깅

모든 로그는 다음 정보를 포함합니다:
- 요청 ID
- 타임스탬프
- 관련 데이터
- 오류 정보 (해당하는 경우)

## 속도 제한 (Rate Limiting)

API는 IP 주소당 분당 최대 100개의 요청을 허용합니다. 이 한도를 초과하면 429 상태 코드와 함께 오류 응답이 반환됩니다.

## 멱등성 (Idempotency)

동일한 `txId`로 여러 번 요청을 보내도 한 번만 처리됩니다. 중복 요청은 `resultCode: "0001"`로 응답합니다.

## 예제

### 요청 예제

```http
POST /api/deposit-noti HTTP/1.1
Host: api.ezpg.com
Content-Type: application/json
mkey: your-api-key
mid: your-merchant-id

{
  "txId": "TX123456789",
  "merchantId": "MERCHANT001",
  "amount": 50000,
  "accountNumber": "123-456-789",
  "depositor": "홍길동",
  "timestamp": "2023-03-15T09:30:00Z",
  "currency": "KRW",
  "description": "월 정기 결제"
}
```

### 응답 예제

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "resultCode": "0000",
  "resultMsg": "입금 노티 처리가 완료되었습니다.",
  "depositInfo": {
    "requestId": "DEPNOTI-1678872600000-abc12",
    "merchantId": "MERCHANT001",
    "amount": 50000,
    "txId": "TX123456789",
    "accountNumber": "123-456-789",
    "depositor": "홍길동",
    "timestamp": "2023-03-15T09:30:00Z",
    "status": "COMPLETED",
    "processedAt": "2023-03-15T09:30:01Z",
    "externalReference": "TX123456789",
    "currency": "KRW",
    "description": "월 정기 결제"
  },
  "requestId": "DEPNOTI-1678872600000-abc12",
  "processingTime": "120ms"
}
```

## 구현 참고사항

1. 실제 운영 환경에서는 모의(Mock) 구현을 실제 데이터베이스 및 알림 시스템과 연동하는 코드로 대체해야 합니다.
2. 데이터베이스 연결 실패, 네트워크 오류 등의 예외 상황에 대한 처리가 구현되어 있습니다.
3. 모든 입력값에 대한 유효성 검사가 수행됩니다.
4. 보안을 위해 API 키 인증이 필요합니다.

## 보안 고려사항

1. API 키는 안전하게 관리하고 정기적으로 교체해야 합니다.
2. 모든 통신은 HTTPS를 통해 이루어져야 합니다.
3. 입금 정보는 민감한 데이터이므로 적절한 접근 제어가 필요합니다.
4. 로그에는 민감한 정보가 포함되지 않도록 주의해야 합니다. 
