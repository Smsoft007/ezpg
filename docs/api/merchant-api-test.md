# 가맹점 관리 API 테스트 문서

## 1. API 개요
이 문서는 가맹점 관리와 관련된 API 목록과 각 API의 통신 테스트 결과를 정리한 문서입니다. 개발 및 테스트 과정에서 API의 동작 상태를 추적하고 문제점을 파악하기 위한 용도로 사용됩니다.

## 2. API 목록 및 테스트 상태

| API 명 | 엔드포인트 | 메서드 | 기능 설명 | DB 통신 | 테스트 상태 | 최종 테스트 일자 |
|-------|-----------|-------|---------|--------|-----------|--------------|
| 가맹점 목록 조회 | `/api/merchants` | GET | 가맹점 목록을 조회합니다. | ✅ | ✅ 성공 | 2025-03-14 |
| 가맹점 상세 조회 | `/api/merchants/{id}` | GET | 특정 가맹점의 상세 정보를 조회합니다. | ✅ | ✅ 성공 | 2025-03-14 |
| 가맹점 등록 | `/api/merchants` | POST | 새로운 가맹점을 등록합니다. | ✅ | ⚠️ 부분 성공 | 2025-03-14 |
| 가맹점 수정 | `/api/merchants/{id}` | PUT | 특정 가맹점의 정보를 수정합니다. | ✅ | ❌ 미테스트 | - |
| 가맹점 삭제 | `/api/merchants/{id}` | DELETE | 특정 가맹점을 삭제합니다. | ✅ | ❌ 미테스트 | - |
| 가맹점 상태 변경 | `/api/merchants/{id}/status` | PATCH | 가맹점의 상태를 변경합니다. | ✅ | ❌ 미테스트 | - |
| 가맹점 잔액 조회 | `/api/merchants/{id}/balance` | GET | 가맹점의 현재 잔액을 조회합니다. | ✅ | ✅ 성공 | 2025-03-14 |
| 가맹점 거래 내역 조회 | `/api/merchants/{id}/transactions` | GET | 가맹점의 거래 내역을 조회합니다. | ✅ | ⚠️ 부분 성공 | 2025-03-14 |
| API 키 목록 조회 | `/api/merchants/{id}/api-keys` | GET | 가맹점의 API 키 목록을 조회합니다. | ✅ | ❌ 미테스트 | - |
| API 키 생성 | `/api/merchants/{id}/api-keys` | POST | 가맹점의 새 API 키를 생성합니다. | ✅ | ❌ 미테스트 | - |
| API 키 삭제 | `/api/merchants/{id}/api-keys/{key_id}` | DELETE | 가맹점의 API 키를 삭제합니다. | ✅ | ❌ 미테스트 | - |
| 가맹점 수수료 조회 | `/api/merchants/{id}/fees` | GET | 가맹점의 수수료 정보를 조회합니다. | ✅ | ❌ 미테스트 | - |
| 가맹점 수수료 설정 | `/api/merchants/{id}/fees` | PUT | 가맹점의 수수료를 설정합니다. | ✅ | ❌ 미테스트 | - |

## 3. API 상세 테스트 결과

### 3.1 가맹점 목록 조회 API
- **엔드포인트**: `/api/merchants`
- **메서드**: GET
- **파라미터**:
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `search`: 검색어 (선택)
  - `status`: 상태 필터 (선택, 'active', 'inactive', 'pending')
  - `sort`: 정렬 기준 (선택, 'id', 'name', 'created_at')
  - `order`: 정렬 방향 (선택, 'asc', 'desc')
- **응답 예시**:
```json
{
  "status": "success",
  "data": {
    "merchants": [
      {
        "id": "M001",
        "name": "스마트 페이먼트",
        "businessNumber": "123-45-67890",
        "representativeName": "김대표",
        "status": "active",
        "joinDate": "2024-01-15",
        "balance": 1500000
      },
      // ... 추가 가맹점 데이터
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "pages": 10
    }
  }
}
```
- **테스트 결과**: ✅ 성공
- **테스트 노트**: 
  - 페이지네이션 정상 작동
  - 검색 기능 정상 작동
  - 상태 필터링 정상 작동
  - 정렬 기능 정상 작동

### 3.2 가맹점 상세 조회 API
- **엔드포인트**: `/api/merchants/{id}`
- **메서드**: GET
- **파라미터**:
  - `id`: 가맹점 ID (필수)
- **응답 예시**:
```json
{
  "status": "success",
  "data": {
    "id": "M001",
    "name": "스마트 페이먼트",
    "businessNumber": "123-45-67890",
    "representativeName": "김대표",
    "status": "active",
    "joinDate": "2024-01-15",
    "balance": 1500000,
    "contact": {
      "email": "contact@smartpayment.com",
      "phone": "02-1234-5678"
    },
    "address": {
      "zipCode": "12345",
      "address1": "서울특별시 강남구",
      "address2": "테헤란로 123"
    },
    "account": {
      "bank": "신한은행",
      "accountNumber": "110-123-456789",
      "accountHolder": "김대표"
    },
    "fees": {
      "payment": 3.5,
      "withdrawal": 1000
    }
  }
}
```
- **테스트 결과**: ✅ 성공
- **테스트 노트**: 
  - 존재하는 가맹점 ID로 요청 시 정상 응답
  - 존재하지 않는 가맹점 ID로 요청 시 적절한 에러 응답
  - 모든 필드가 정상적으로 반환됨

### 3.3 가맹점 등록 API
- **엔드포인트**: `/api/merchants`
- **메서드**: POST
- **요청 본문 예시**:
```json
{
  "name": "새 가맹점",
  "businessNumber": "123-45-67890",
  "representativeName": "홍길동",
  "status": "pending",
  "contact": {
    "email": "contact@newmerchant.com",
    "phone": "02-1234-5678"
  },
  "address": {
    "zipCode": "12345",
    "address1": "서울특별시 강남구",
    "address2": "테헤란로 123"
  },
  "account": {
    "bank": "국민은행",
    "accountNumber": "110-123-456789",
    "accountHolder": "홍길동"
  },
  "fees": {
    "payment": 3.5,
    "withdrawal": 1000
  }
}
```
- **응답 예시**:
```json
{
  "status": "success",
  "data": {
    "id": "M099",
    "name": "새 가맹점",
    "message": "가맹점이 성공적으로 등록되었습니다."
  }
}
```
- **테스트 결과**: ⚠️ 부분 성공
- **테스트 노트**: 
  - 기본 정보 등록은 정상 작동
  - 중복된 사업자번호 체크 기능 미구현
  - 계좌 정보 검증 로직 필요
  - 수수료 설정 시 최소/최대 범위 검증 필요

### 3.4 가맹점 잔액 조회 API
- **엔드포인트**: `/api/merchants/{id}/balance`
- **메서드**: GET
- **파라미터**:
  - `id`: 가맹점 ID (필수)
- **응답 예시**:
```json
{
  "status": "success",
  "data": {
    "id": "M001",
    "name": "스마트 페이먼트",
    "balance": 1500000,
    "availableBalance": 1200000,
    "pendingBalance": 300000,
    "lastUpdated": "2025-03-14T10:30:00Z"
  }
}
```
- **테스트 결과**: ✅ 성공
- **테스트 노트**: 
  - 잔액 정보 정확히 반환
  - 가용 잔액과 대기 잔액 구분 정상 작동
  - 최종 업데이트 시간 정확히 표시

### 3.5 가맹점 거래 내역 조회 API
- **엔드포인트**: `/api/merchants/{id}/transactions`
- **메서드**: GET
- **파라미터**:
  - `id`: 가맹점 ID (필수)
  - `page`: 페이지 번호 (기본값: 1)
  - `limit`: 페이지당 항목 수 (기본값: 10)
  - `type`: 거래 유형 필터 (선택, 'deposit', 'withdrawal')
  - `status`: 상태 필터 (선택, 'completed', 'pending', 'failed')
  - `startDate`: 시작 날짜 (선택, 'YYYY-MM-DD')
  - `endDate`: 종료 날짜 (선택, 'YYYY-MM-DD')
- **응답 예시**:
```json
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "id": "T001",
        "merchantId": "M001",
        "type": "deposit",
        "amount": 100000,
        "fee": 3500,
        "status": "completed",
        "createdAt": "2025-03-14T09:30:00Z",
        "completedAt": "2025-03-14T09:35:00Z"
      },
      // ... 추가 거래 데이터
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "pages": 5
    },
    "summary": {
      "totalDeposit": 1500000,
      "totalWithdrawal": 500000,
      "totalFees": 70000
    }
  }
}
```
- **테스트 결과**: ⚠️ 부분 성공
- **테스트 노트**: 
  - 기본 거래 내역 조회 정상 작동
  - 날짜 필터링 시 일부 데이터 누락 발생
  - 거래 유형별 요약 정보 계산 오류 발견
  - 대량 데이터 조회 시 응답 속도 개선 필요

## 4. 데이터베이스 프로시저 목록

| 프로시저 명 | 기능 설명 | 호출 API | 테스트 상태 |
|------------|---------|---------|-----------|
| `sp_GetMerchantList` | 가맹점 목록 조회 | `/api/merchants` | ✅ 성공 |
| `sp_GetMerchantById` | 가맹점 상세 정보 조회 | `/api/merchants/{id}` | ✅ 성공 |
| `sp_CreateMerchant` | 새 가맹점 등록 | `/api/merchants` | ✅ 성공 |
| `sp_UpdateMerchant` | 가맹점 정보 수정 | `/api/merchants/{id}` | ❌ 미테스트 |
| `sp_DeleteMerchant` | 가맹점 삭제 | `/api/merchants/{id}` | ❌ 미테스트 |
| `sp_UpdateMerchantStatus` | 가맹점 상태 변경 | `/api/merchants/{id}/status` | ❌ 미테스트 |
| `sp_GetMerchantBalance` | 가맹점 잔액 조회 | `/api/merchants/{id}/balance` | ✅ 성공 |
| `sp_GetMerchantTransactions` | 가맹점 거래 내역 조회 | `/api/merchants/{id}/transactions` | ⚠️ 부분 성공 |
| `sp_GetMerchantApiKeys` | 가맹점 API 키 목록 조회 | `/api/merchants/{id}/api-keys` | ❌ 미테스트 |
| `sp_CreateMerchantApiKey` | 가맹점 API 키 생성 | `/api/merchants/{id}/api-keys` | ❌ 미테스트 |
| `sp_DeleteMerchantApiKey` | 가맹점 API 키 삭제 | `/api/merchants/{id}/api-keys/{key_id}` | ❌ 미테스트 |
| `sp_GetMerchantFees` | 가맹점 수수료 조회 | `/api/merchants/{id}/fees` | ❌ 미테스트 |
| `sp_UpdateMerchantFees` | 가맹점 수수료 설정 | `/api/merchants/{id}/fees` | ❌ 미테스트 |

## 5. 개선 사항 및 이슈

### 5.1 API 개선 사항
- 가맹점 등록 API에 중복 사업자번호 체크 로직 추가 필요
- 가맹점 거래 내역 API의 날짜 필터링 버그 수정 필요
- 대량 데이터 조회 시 페이지네이션 및 캐싱 최적화 필요
- 모든 API에 적절한 인증 및 권한 체크 추가 필요

### 5.2 데이터베이스 개선 사항
- `sp_GetMerchantTransactions` 프로시저의 성능 최적화 필요
- 트랜잭션 처리 로직 보완 필요
- 인덱스 추가를 통한 조회 성능 개선 필요

### 5.3 보안 이슈
- API 키 관리 시스템의 보안 강화 필요
- 민감 정보(계좌번호 등) 암호화 저장 필요
- API 요청 제한(Rate Limiting) 구현 필요

## 6. 다음 단계 계획
- 미테스트 API 테스트 완료
- 부분 성공 API의 이슈 해결
- 보안 강화 작업 진행
- 성능 최적화 작업 진행
