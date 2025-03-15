# 트랜잭션 유틸리티 함수

## 개요
`transactionUtils.ts` 파일은 트랜잭션 처리와 관련된 다양한 유틸리티 함수를 제공합니다. 이 문서는 주요 함수들의 사용법과 목적을 설명합니다.

## 주요 함수

### formatAmount
금액을 포맷팅하는 함수입니다.

```typescript
formatAmount(amount: number, currency: string = 'KRW'): string
```

**매개변수**:
- `amount`: 포맷팅할 금액
- `currency`: 통화 코드 (기본값: 'KRW')

**반환값**: 포맷팅된 금액 문자열 (예: '₩10,000')

**예시**:
```typescript
import { formatAmount } from "@/utils/transactionUtils";

// 결과: '₩10,000'
const formattedAmount = formatAmount(10000);

// 결과: '$100.00'
const formattedUsdAmount = formatAmount(100, 'USD');
```

### formatDate
날짜를 포맷팅하는 함수입니다.

```typescript
formatDate(dateString: string, format: 'full' | 'date' | 'time' | 'short' = 'full'): string
```

**매개변수**:
- `dateString`: 포맷팅할 날짜 문자열
- `format`: 포맷 형식 (기본값: 'full')
  - 'full': 전체 날짜 및 시간 (예: '2025. 3. 15. 오후 5:10:29')
  - 'date': 날짜만 (예: '2025. 3. 15.')
  - 'time': 시간만 (예: '오후 5:10:29')
  - 'short': 간략한 형식 (예: '3/15 17:10')

**반환값**: 포맷팅된 날짜 문자열

**예시**:
```typescript
import { formatDate } from "@/utils/transactionUtils";

const date = new Date().toISOString();

// 결과: '2025. 3. 15. 오후 5:10:29'
const fullDate = formatDate(date, 'full');

// 결과: '2025. 3. 15.'
const dateOnly = formatDate(date, 'date');

// 결과: '오후 5:10:29'
const timeOnly = formatDate(date, 'time');

// 결과: '3/15 17:10'
const shortFormat = formatDate(date, 'short');
```

### formatTransactionDate
트랜잭션 날짜를 포맷팅하는 함수입니다. `formatDate` 함수의 내부 구현에 사용됩니다.

```typescript
formatTransactionDate(dateString: string, format: 'full' | 'date' | 'time' = 'full'): string
```

### generateTransactionId
트랜잭션 ID를 생성하는 함수입니다.

```typescript
generateTransactionId(prefix: string = 'TX'): string
```

**매개변수**:
- `prefix`: 트랜잭션 ID 접두사 (기본값: 'TX')

**반환값**: 생성된 트랜잭션 ID (예: 'TX202503151234')

### logTransactionStatusUpdate
트랜잭션 상태 변경을 로깅하는 함수입니다.

```typescript
logTransactionStatusUpdate(
  transactionId: string,
  fromStatus: TransactionStatus,
  toStatus: TransactionStatus,
  reason: string,
  performedBy?: string
): Promise<string>
```

### setPendingTransaction
트랜잭션을 대기 상태로 설정하는 함수입니다.

```typescript
setPendingTransaction(
  transaction: Transaction,
  reason: string,
  estimatedCompletionTime?: string,
  priority: 'high' | 'normal' | 'low' = 'normal'
): Promise<string>
```

### updatePendingTransaction
대기 트랜잭션 상태를 업데이트하는 함수입니다.

```typescript
updatePendingTransaction(
  transactionId: string,
  status: TransactionStatus,
  reason: string,
  performedBy?: string
): Promise<boolean>
```

### formatTransactionLogs
트랜잭션 로그를 포맷팅하는 함수입니다.

```typescript
formatTransactionLogs(logs: TransactionLog[]): string
```

### getStatusBadgeColor
트랜잭션 상태에 따른 배지 색상을 반환하는 함수입니다.

```typescript
getStatusBadgeColor(status: TransactionStatus): string
```

### getPriorityBadgeColor
트랜잭션 우선순위에 따른 배지 색상을 반환하는 함수입니다.

```typescript
getPriorityBadgeColor(priority: string): string
```

### getTransactionTypeIcon
트랜잭션 타입에 따른 아이콘 이름을 반환하는 함수입니다.

```typescript
getTransactionTypeIcon(type: string): string
```
