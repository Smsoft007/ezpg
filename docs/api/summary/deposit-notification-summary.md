# 입금 노티(Deposit Notification) API 요약

## 기본 정보

- **엔드포인트**: `/api/deposit-noti`
- **메소드**: POST
- **인증**: `mkey`, `mid` 헤더 필요
- **Content-Type**: application/json

## 주요 기능

- 외부 결제 시스템으로부터 입금 알림 수신
- 입금 정보 검증 및 데이터베이스 저장
- 가맹점 잔액 업데이트
- 텔레그램을 통한 알림 발송
- 상세 로깅

## 요청 예시

```json
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

## 응답 예시

```json
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

## 주요 결과 코드

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

## 특징

- **속도 제한**: IP 주소당 분당 최대 100개 요청
- **멱등성**: 동일한 `txId`로 여러 번 요청해도 한 번만 처리
- **유효성 검사**: 모든 입력값에 대한 철저한 검증
- **로깅**: 모든 단계에서 상세 로깅 수행

## 보안

- API 키 인증 필요
- HTTPS 통신 필수
- 민감 정보 보호

## 자세한 문서

전체 API 문서는 [입금 노티 API 문서](/docs/api/deposit-notification.md)를 참조하세요. 
