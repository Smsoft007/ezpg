/**
 * 거래 관련 타입 정의
 * 모든 거래 관련 타입과 인터페이스를 정의합니다.
 * @module transaction
 */

/**
 * 거래 상태 타입
 * @typedef {string} TransactionStatus
 */
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled' | 'canceled' | 'refunded';

/**
 * 결제 방법 타입
 * @typedef {string} PaymentMethod
 */
export type PaymentMethod = 'card' | 'bank' | 'bank_transfer' | 'virtual' | 'virtual_account' | 'crypto' | 'mobile' | 'other';

/**
 * 거래 유형 타입
 * @typedef {string} TransactionType
 */
export type TransactionType = 'deposit' | 'withdrawal' | 'refund' | 'adjustment' | 'transfer' | 'payment';

/**
 * 통화 타입
 * @typedef {string} CurrencyCode
 */
export type CurrencyCode = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY';

/**
 * 승인 상태 타입
 * @typedef {string} ApprovalStatus
 */
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

/**
 * 가맹점 정보 인터페이스
 * @interface Merchant
 */
export interface Merchant {
  /** 가맹점 이름 */
  merchantName: string;
  /** 사업자 등록 번호 */
  businessNumber?: string;
  /** 연락 이메일 */
  contactEmail?: string;
  /** 연락 전화번호 */
  contactPhone?: string;
}

/**
 * 고객 정보 인터페이스
 * @interface Customer
 */
export interface Customer {
  /** 고객 고유 ID */
  customerId?: string;
  /** 고객 이름 */
  name?: string;
  /** 고객 이메일 */
  email?: string;
  /** 고객 전화번호 */
  phone?: string;
}

/**
 * 결제 상세 정보 인터페이스
 * @interface PaymentDetails
 */
export interface PaymentDetails {
  /** 카드 번호 */
  cardNumber?: string;
  /** 카드 종류 */
  cardType?: string;
  /** 할부 개월 수 */
  installmentMonths?: number;
  /** 계좌 번호 */
  accountNumber?: string;
  /** 은행 코드 */
  bankCode?: string;
  /** 가상 계좌 */
  virtualAccount?: string;
}

/**
 * 기본 거래 인터페이스
 * 모든 거래 유형의 기본이 되는 인터페이스입니다.
 * @interface Transaction
 */
export interface Transaction {
  /** 거래 고유 ID */
  transactionId: string;
  /** 가맹점 ID */
  merchantId: string;
  /** 가맹점 정보 */
  merchant?: Merchant;
  /** 거래 금액 */
  amount: number;
  /** 거래 상태 */
  status: TransactionStatus;
  /** 결제 방법 */
  paymentMethod: PaymentMethod;
  /** 거래 유형 */
  type: TransactionType;
  /** 통화 코드 */
  currency: CurrencyCode;
  /** 생성 일시 (ISO 문자열) */
  createdAt: string;
  /** 수정 일시 (ISO 문자열) */
  updatedAt: string;
  /** 고객 정보 */
  customer?: Customer;
  /** 거래 설명 */
  description?: string;
  /** 외부 시스템 ID */
  externalId?: string;
  /** 실패 이유 */
  failureReason?: string;
  /** 실패 코드 */
  failureCode?: string;
  /** 결제 상세 정보 */
  paymentDetails?: PaymentDetails;
}

/**
 * 입금 거래 인터페이스
 * 입금 관련 거래에 대한 확장 인터페이스입니다.
 * @interface DepositTransaction
 * @extends {Transaction}
 */
export interface DepositTransaction extends Transaction {
  /** 거래 유형 (입금) */
  type: 'deposit';
  /** 계좌 번호 */
  accountNumber?: string;
  /** 입금자명 */
  depositor?: string;
  /** 가상 계좌 ID */
  virtualAccountId?: string;
  /** 입금 일시 (ISO 문자열) */
  depositedAt?: string;
  /** 입금 방법 */
  depositMethod?: string;
  /** 영수증 URL */
  receiptUrl?: string;
}

/**
 * 출금 거래 인터페이스
 * 출금 관련 거래에 대한 확장 인터페이스입니다.
 * @interface WithdrawalTransaction
 * @extends {Transaction}
 */
export interface WithdrawalTransaction extends Transaction {
  /** 거래 유형 (출금) */
  type: 'withdrawal';
  /** 은행 코드 */
  bankCode?: string;
  /** 계좌 번호 */
  accountNumber?: string;
  /** 예금주 */
  accountHolder?: string;
  /** 출금 수수료 */
  withdrawalFee?: number;
  /** 승인 상태 */
  approvalStatus?: ApprovalStatus;
  /** 승인자 */
  approvedBy?: string;
  /** 승인 일시 (ISO 문자열) */
  approvedAt?: string;
  /** 출금 방법 */
  withdrawalMethod?: string;
  /** 출금 참조 번호 */
  withdrawalReference?: string;
}

/**
 * 실패한 거래 인터페이스
 * 실패한 거래에 대한 확장 인터페이스입니다.
 * @interface FailedTransaction
 * @extends {Transaction}
 */
export interface FailedTransaction extends Transaction {
  /** 오류 코드 */
  errorCode?: string;
  /** 오류 메시지 */
  errorMessage?: string;
  /** 실패 일시 (ISO 문자열) */
  failedAt: string;
  /** 재시도 횟수 */
  retryCount?: number;
  /** 마지막 재시도 일시 (ISO 문자열) */
  lastRetryAt?: string;
  /** 원본 거래 정보 */
  originalTransaction?: Transaction;
}

/**
 * 대기 거래 인터페이스
 * 대기 중인 거래에 대한 확장 인터페이스입니다.
 * @interface PendingTransaction
 * @extends {Transaction}
 */
export interface PendingTransaction extends Transaction {
  /** 대기 시작 일시 (ISO 문자열) */
  pendingSince: string;
  /** 예상 완료 시간 (ISO 문자열) */
  estimatedCompletionTime?: string;
  /** 대기 이유 */
  pendingReason?: string;
  /** 우선순위 */
  priority?: 'high' | 'normal' | 'low';
}

/**
 * 거래 로그 인터페이스
 * 거래 로그에 대한 인터페이스입니다.
 * @interface TransactionLog
 */
export interface TransactionLog {
  /** 로그 ID */
  id: string;
  /** 거래 ID */
  transactionId: string;
  /** 수행된 작업 */
  action: string;
  /** 거래 상태 */
  status: TransactionStatus;
  /** 로그 메시지 */
  message: string;
  /** 타임스탬프 (ISO 문자열) */
  timestamp: string;
  /** 수행자 */
  performedBy?: string;
  /** 추가 상세 정보 */
  details?: Record<string, any>;
  /** IP 주소 */
  ipAddress?: string;
  /** 사용자 에이전트 */
  userAgent?: string;
}

/**
 * 거래 필터 인터페이스
 * 거래 목록 조회 시 사용되는 필터 인터페이스입니다.
 * @interface TransactionFilter
 */
export interface TransactionFilter {
  /** 가맹점 ID */
  merchantId?: string;
  /** 거래 상태 */
  status?: TransactionStatus;
  /** 결제 방법 */
  paymentMethod?: PaymentMethod;
  /** 거래 유형 */
  type?: TransactionType;
  /** 최소 금액 */
  minAmount?: number;
  /** 최대 금액 */
  maxAmount?: number;
  /** 시작 날짜 (ISO 문자열) */
  dateFrom?: string;
  /** 종료 날짜 (ISO 문자열) */
  dateTo?: string;
  /** 검색어 */
  search?: string;
  /** 은행 코드 */
  bankCode?: string;
  /** 고객 이름 */
  customerName?: string;
  /** 외부 ID */
  externalId?: string;
}

/**
 * 거래 페이지네이션 인터페이스
 * 거래 목록 조회 시 사용되는 페이지네이션 인터페이스입니다.
 * @interface TransactionPagination
 */
export interface TransactionPagination {
  /** 현재 페이지 */
  currentPage: number;
  /** 전체 페이지 수 */
  totalPages: number;
  /** 페이지 크기 */
  pageSize: number;
  /** 전체 항목 수 */
  totalItems: number;
}

/**
 * 거래 응답 인터페이스
 * 거래 목록 조회 API 응답 인터페이스입니다.
 * @interface TransactionResponse
 */
export interface TransactionResponse {
  /** 거래 목록 */
  transactions: Transaction[];
  /** 페이지네이션 정보 */
  pagination: TransactionPagination;
  /** 적용된 필터 */
  filter?: TransactionFilter;
}

/**
 * 거래 상세 조회 응답 인터페이스
 * 거래 상세 조회 API 응답 인터페이스입니다.
 * @interface TransactionDetailResponse
 */
export interface TransactionDetailResponse {
  /** 거래 정보 */
  transaction: Transaction;
  /** 거래 로그 목록 */
  logs: TransactionLog[];
  /** 관련 거래 목록 */
  relatedTransactions?: Transaction[];
}

/**
 * 거래 통계 인터페이스
 * 거래 통계 정보 인터페이스입니다.
 * @interface TransactionStats
 */
export interface TransactionStats {
  /** 총 입금액 */
  totalDeposits: number;
  /** 총 출금액 */
  totalWithdrawals: number;
  /** 총 거래액 */
  totalAmount: number;
  /** 성공률 (%) */
  successRate: number;
  /** 입금 건수 */
  depositCount: number;
  /** 출금 건수 */
  withdrawalCount: number;
  /** 실패 건수 */
  failedCount: number;
  /** 대기 건수 */
  pendingCount: number;
  /** 일별 거래 통계 */
  dailyTransactions: {
    /** 날짜 (YYYY-MM-DD) */
    date: string;
    /** 거래 건수 */
    count: number;
    /** 거래 금액 */
    amount: number;
  }[];
}

/**
 * 거래 요약 인터페이스
 * 대시보드 등에서 사용되는 거래 요약 정보 인터페이스입니다.
 * @interface TransactionSummary
 */
export interface TransactionSummary {
  /** 오늘 거래 요약 */
  today: {
    /** 거래 건수 */
    count: number;
    /** 거래 금액 */
    amount: number;
  };
  /** 이번 주 거래 요약 */
  thisWeek: {
    /** 거래 건수 */
    count: number;
    /** 거래 금액 */
    amount: number;
  };
  /** 이번 달 거래 요약 */
  thisMonth: {
    /** 거래 건수 */
    count: number;
    /** 거래 금액 */
    amount: number;
  };
  /** 전체 거래 요약 */
  total: {
    /** 거래 건수 */
    count: number;
    /** 거래 금액 */
    amount: number;
  };
}

/**
 * 일괄 작업 인터페이스
 * 대량의 거래를 처리하는 일괄 작업 인터페이스입니다.
 * @interface BatchOperation
 */
export interface BatchOperation {
  /** 일괄 작업 ID */
  id: string;
  /** 작업 유형 */
  type: 'deposit' | 'withdrawal' | 'status_update' | 'refund';
  /** 작업 상태 */
  status: 'pending' | 'processing' | 'completed' | 'failed';
  /** 전체 항목 수 */
  totalItems: number;
  /** 처리된 항목 수 */
  processedItems: number;
  /** 성공한 항목 수 */
  successItems: number;
  /** 실패한 항목 수 */
  failedItems: number;
  /** 생성 일시 (ISO 문자열) */
  createdAt: string;
  /** 시작 일시 (ISO 문자열) */
  startedAt?: string;
  /** 완료 일시 (ISO 문자열) */
  completedAt?: string;
  /** 생성자 */
  createdBy: string;
  /** 파일명 */
  fileName?: string;
  /** 오류 상세 정보 */
  errorDetails?: string;
}

/**
 * 일괄 작업 항목 인터페이스
 * 일괄 작업의 개별 항목에 대한 인터페이스입니다.
 * @interface BatchOperationItem
 */
export interface BatchOperationItem {
  /** 항목 ID */
  id: string;
  /** 일괄 작업 ID */
  batchId: string;
  /** 거래 ID */
  transactionId?: string;
  /** 항목 상태 */
  status: 'pending' | 'success' | 'failed';
  /** 항목 데이터 */
  data: Record<string, any>;
  /** 오류 메시지 */
  errorMessage?: string;
  /** 처리 일시 (ISO 문자열) */
  processedAt?: string;
}

/**
 * 입금 알림 인터페이스
 * 입금 알림에 대한 인터페이스입니다.
 * @interface DepositNotification
 */
export interface DepositNotification {
  /** 알림 ID */
  id: string;
  /** 가맹점 ID */
  merchantId: string;
  /** 가맹점 이름 */
  merchantName: string;
  /** 입금 금액 */
  amount: number;
  /** 거래 ID */
  transactionId: string;
  /** 타임스탬프 (ISO 문자열) */
  timestamp: string;
  /** 알림 제목 */
  title: string;
  /** 알림 메시지 */
  message: string;
  /** 거래 상태 */
  status: TransactionStatus;
  /** 읽음 여부 */
  seen: boolean;
  /** 우선순위 */
  priority: 'high' | 'normal' | 'low';
}
