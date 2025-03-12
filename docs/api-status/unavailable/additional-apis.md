# 추가 필요 API (구현 필요)

## 개요

이 문서는 EzPG 전자결제 시스템의 추가로 구현이 필요한 API들을 설명합니다. 이 API들은 시스템의 완전한 기능을 위해 필요하지만 아직 구현되지 않았습니다.

## API 목록

| 순번 | API 명          | 설명                | 구현 상태      |
| ---- | --------------- | ------------------- | -------------- |
| 1    | 시스템 설정 API | 시스템 설정 관리    | 추가 정의 필요 |
| 2    | 알림 설정 API   | 알림 설정 관리      | 추가 정의 필요 |
| 3    | 통계 API        | 거래 통계 정보 제공 | 추가 정의 필요 |
| 4    | 로그 관리 API   | 시스템 로그 관리    | 추가 정의 필요 |

## API 상세 정보

### 1. 시스템 설정 API

#### 기능 설명

- 시스템 전반의 설정을 관리합니다.
- 시스템 환경 설정, 보안 설정, 로그 설정 등을 관리합니다.
- 본사 계정만 사용 가능합니다.

#### 요청 정보 (예상)

- URL: `/system/settings`
- Method: POST
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터 (예상)

```json
{
  "settingType": "environment | security | log",
  "settings": {
    "key1": "value1",
    "key2": "value2",
    "key3": "value3"
  }
}
```

#### 응답 정보 (예상)

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "updatedSettings": {
    "key1": "value1",
    "key2": "value2",
    "key3": "value3"
  }
}
```

### 2. 알림 설정 API

#### 기능 설명

- 텔레그램 알림 등 알림 설정을 관리합니다.
- 텔레그램 봇 연동 설정, 알림 조건 설정, 알림 대상 설정 등을 관리합니다.
- 본사 계정과 가맹점 계정 모두 사용 가능합니다.

#### 요청 정보 (예상)

- URL: `/notifications/settings`
- Method: POST
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터 (예상)

```json
{
  "merchantId": "가맹점 ID (선택적, 본사 계정만 사용 가능)",
  "telegramSettings": {
    "botToken": "텔레그램 봇 토큰",
    "chatId": "텔레그램 채팅 ID",
    "enabled": true
  },
  "notificationConditions": {
    "depositNotification": true,
    "withdrawalNotification": true,
    "errorNotification": true,
    "minAmount": 100000
  }
}
```

#### 응답 정보 (예상)

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "merchantId": "가맹점 ID",
  "updatedSettings": {
    "telegramSettings": {
      "botToken": "텔레그램 봇 토큰",
      "chatId": "텔레그램 채팅 ID",
      "enabled": true
    },
    "notificationConditions": {
      "depositNotification": true,
      "withdrawalNotification": true,
      "errorNotification": true,
      "minAmount": 100000
    }
  }
}
```

### 3. 통계 API

#### 기능 설명

- 거래 통계 정보를 제공합니다.
- 기간별 거래 통계, 가맹점별 거래 통계, 수수료 통계 등을 제공합니다.
- 본사 계정은 모든 가맹점의 통계를 조회할 수 있습니다.
- 가맹점 계정은 해당 가맹점의 통계만 조회할 수 있습니다.

#### 요청 정보 (예상)

- URL: `/statistics`
- Method: GET
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터 (예상)

```json
{
  "merchantId": "가맹점 ID (선택적, 본사 계정만 사용 가능)",
  "startDate": "2023-03-01",
  "endDate": "2023-03-31",
  "statisticsType": "transaction | fee | merchant",
  "groupBy": "day | week | month"
}
```

#### 응답 정보 (예상)

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "statistics": {
    "totalDeposit": 10000000,
    "totalWithdrawal": 8000000,
    "totalDepositFee": 150000,
    "totalWithdrawalFee": 80000,
    "netProfit": 230000,
    "details": [
      {
        "date": "2023-03-01",
        "deposit": 1000000,
        "withdrawal": 800000,
        "depositFee": 15000,
        "withdrawalFee": 8000,
        "profit": 23000
      }
      // ... 추가 데이터
    ]
  }
}
```

### 4. 로그 관리 API

#### 기능 설명

- 시스템 로그를 관리합니다.
- 로그 조회, 로그 레벨 설정, 로그 보관 기간 설정 등을 관리합니다.
- 본사 계정만 사용 가능합니다.

#### 요청 정보 (예상)

- URL: `/logs`
- Method: GET
- Content-Type: application/json
- Authorization: Bearer {token}

#### 요청 파라미터 (예상)

```json
{
  "startDate": "2023-03-01",
  "endDate": "2023-03-31",
  "logLevel": "info | warn | error | debug",
  "keyword": "검색어 (선택적)",
  "page": 1,
  "limit": 100
}
```

#### 응답 정보 (예상)

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "totalCount": 1000,
  "logs": [
    {
      "timestamp": "2023-03-12T10:30:00Z",
      "level": "error",
      "message": "로그 메시지",
      "source": "로그 소스",
      "details": {
        "key1": "value1",
        "key2": "value2"
      }
    }
    // ... 추가 로그
  ]
}
```

## 구현 우선순위

추가 필요 API의 구현 우선순위는 다음과 같습니다:

1. **알림 설정 API**: 시스템 운영 모니터링을 위해 가장 먼저 구현이 필요합니다.
2. **통계 API**: 비즈니스 분석 및 의사결정을 위해 두 번째로 구현이 필요합니다.
3. **시스템 설정 API**: 시스템 환경 설정을 위해 세 번째로 구현이 필요합니다.
4. **로그 관리 API**: 시스템 문제 해결 및 디버깅을 위해 네 번째로 구현이 필요합니다.
