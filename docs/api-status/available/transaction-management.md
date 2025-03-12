# 거래 관리 관련 API (구현 완료)

## 개요

이 문서는 EzPG 전자결제 시스템의 거래 관리 관련 API 중 현재 구현이 완료되어 사용 가능한 API들을 설명합니다.

## API 목록

| 순번 | API 명             | 설명                | 문서 위치                   | 구현 상태 |
| ---- | ------------------ | ------------------- | --------------------------- | --------- |
| 1    | 입금 내역 조회 API | 입금 거래 내역 조회 | docs/api/additional-apis.md | 구현 완료 |
| 2    | 출금 내역 조회 API | 출금 거래 내역 조회 | docs/api/additional-apis.md | 구현 완료 |
| 3    | 출금 API           | 출금 처리           | docs/api/withdrawal.md      | 구현 완료 |

## API 상세 정보

### 1. 입금 내역 조회 API

#### 기능 설명

- 입금 거래 내역을 조회합니다.
- 본사 계정은 모든 가맹점의 입금 내역을 조회할 수 있습니다.
- 가맹점 계정은 해당 가맹점의 입금 내역만 조회할 수 있습니다.

#### 요청 정보

- URL: `/transactions/deposit/history`
- Method: GET
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터

```json
{
  "merchantId": "가맹점 ID (선택적, 본사 계정만 사용 가능)",
  "startDate": "2023-03-01",
  "endDate": "2023-03-12",
  "page": 1,
  "limit": 10,
  "status": "all | completed | pending | failed (선택적)"
}
```

#### 응답 정보

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "totalCount": 100,
  "deposits": [
    {
      "transactionId": "거래 ID",
      "merchantId": "가맹점 ID",
      "merchantName": "가맹점 이름",
      "amount": 100000,
      "fee": 1500,
      "netAmount": 98500,
      "status": "completed | pending | failed",
      "createdAt": "2023-03-12T10:30:00Z",
      "completedAt": "2023-03-12T10:31:00Z",
      "accountNo": "가상계좌번호",
      "bankCode": "은행코드",
      "bankName": "은행명",
      "depositorName": "입금자명"
    }
  ]
}
```

### 2. 출금 내역 조회 API

#### 기능 설명

- 출금 거래 내역을 조회합니다.
- 본사 계정은 모든 가맹점의 출금 내역을 조회할 수 있습니다.
- 가맹점 계정은 해당 가맹점의 출금 내역만 조회할 수 있습니다.

#### 요청 정보

- URL: `/transactions/withdrawal/history`
- Method: GET
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터

```json
{
  "merchantId": "가맹점 ID (선택적, 본사 계정만 사용 가능)",
  "startDate": "2023-03-01",
  "endDate": "2023-03-12",
  "page": 1,
  "limit": 10,
  "status": "all | completed | pending | failed | cancelled (선택적)"
}
```

#### 응답 정보

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "totalCount": 100,
  "withdrawals": [
    {
      "transactionId": "거래 ID",
      "merchantId": "가맹점 ID",
      "merchantName": "가맹점 이름",
      "amount": 100000,
      "fee": 1000,
      "netAmount": 99000,
      "status": "completed | pending | failed | cancelled",
      "createdAt": "2023-03-12T10:30:00Z",
      "completedAt": "2023-03-12T10:35:00Z",
      "bankCode": "은행코드",
      "bankName": "은행명",
      "accountNo": "계좌번호",
      "accountHolder": "예금주명",
      "reason": "취소 사유 (취소된 경우)"
    }
  ]
}
```

### 3. 출금 API

#### 기능 설명

- 가맹점 계정에서 출금을 요청합니다.
- 출금 가능 잔액 내에서만 출금이 가능합니다.
- 출금 수수료가 적용됩니다.

#### 요청 정보

- URL: `/transactions/withdrawal/request`
- Method: POST
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터

```json
{
  "merchantId": "가맹점 ID",
  "amount": 100000,
  "bankCode": "은행코드",
  "accountNo": "계좌번호",
  "accountHolder": "예금주명",
  "memo": "출금 메모 (선택적)"
}
```

#### 응답 정보

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "transactionId": "거래 ID",
  "merchantId": "가맹점 ID",
  "amount": 100000,
  "fee": 1000,
  "netAmount": 99000,
  "status": "pending",
  "createdAt": "2023-03-12T10:30:00Z",
  "estimatedCompletionTime": "2023-03-12T11:00:00Z"
}
```

## 테스트 시나리오

### 출금 처리 테스트

#### 테스트 목적

- 출금 요청 및 처리 기능 검증
- 출금 수수료 적용 검증
- 출금 내역 조회 기능 검증

#### 테스트 단계

1. 가맹점 계정으로 로그인
2. 출금 요청 페이지 접속
3. 출금 정보 입력:
   - 출금 금액: 100,000원
   - 은행: 신한은행
   - 계좌번호: 110-123-456789
   - 예금주명: 홍길동
4. 출금 요청 버튼 클릭
5. 출금 내역 조회 페이지에서 요청한 출금 내역 확인

#### 예상 결과

- 출금 요청 성공 시 성공 메시지 표시
- 출금 내역 조회 페이지에 요청한 출금 내역이 표시되어야 함
- 출금 수수료가 정확히 계산되어 차감되어야 함
