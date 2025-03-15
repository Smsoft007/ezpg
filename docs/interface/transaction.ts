// 거래 상태 타입
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled' | 'refunded';

// 결제 방법 타입
export type PaymentMethod = 'card' | 'bank' | 'virtual' | 'crypto' | 'other';

// 거래 유형 타입
export type TransactionType = 'deposit' | 'withdrawal' | 'refund' | 'adjustment';

// 통화 타입
export type CurrencyCode = 'KRW' | 'USD' | 'EUR' | 'JPY' | 'CNY';

// 기본 거래 인터페이스
export interface Transaction {
  id: string;
  merchantId: string;
  merchantName: string;
  amount: number;
  status: TransactionStatus;
  method: PaymentMethod;
  type: TransactionType;
  currency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
  customerName?: string;
  customerEmail?: string;
  description?: string;
  externalReference?: string;
}

// 입금 거래 인터페이스
export interface DepositTransaction extends Transaction {
  type: 'deposit';
  accountNumber?: string;
  depositor?: string;
  virtualAccountId?: string;
}

// 출금 거래 인터페이스
export interface WithdrawalTransaction extends Transaction {
  type: 'withdrawal';
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;
  withdrawalFee?: number;
  approvalStatus?: 'approved' | 'pending' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
}

// 실패한 거래 인터페이스
export interface FailedTransaction extends Transaction {
  errorCode?: string;
  errorMessage?: string;
  failedAt: string;
  retryCount?: number;
  lastRetryAt?: string;
}

// 거래 필터 인터페이스
export interface TransactionFilter {
  merchantId?: string;
  status?: TransactionStatus;
  method?: PaymentMethod;
  type?: TransactionType;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

// 거래 페이지네이션 인터페이스
export interface TransactionPagination {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}

// 거래 응답 인터페이스
export interface TransactionResponse {
  transactions: Transaction[];
  pagination: TransactionPagination;
  filter?: TransactionFilter;
}

// 입금 알림 인터페이스
export interface DepositNotification {
  merchantId: string;
  merchantName: string;
  amount: number;
  transactionId: string;
  timestamp: string;
  title: string;
  message: string;
  status: TransactionStatus;
  seen: boolean;
}

// 거래 통계 인터페이스
export interface TransactionStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalAmount: number;
  successRate: number;
  depositCount: number;
  withdrawalCount: number;
  failedCount: number;
  pendingCount: number;
  dailyTransactions: {
    date: string;
    count: number;
    amount: number;
  }[];
}

// 거래 요약 인터페이스
export interface TransactionSummary {
  today: {
    count: number;
    amount: number;
  };
  thisWeek: {
    count: number;
    amount: number;
  };
  thisMonth: {
    count: number;
    amount: number;
  };
  total: {
    count: number;
    amount: number;
  };
}

// 거래 상세 조회 응답 인터페이스
export interface TransactionDetailResponse {
  transaction: Transaction;
  logs: TransactionLog[];
  relatedTransactions?: Transaction[];
}

// 거래 로그 인터페이스
export interface TransactionLog {
  id: string;
  transactionId: string;
  action: string;
  status: TransactionStatus;
  message: string;
  timestamp: string;
  performedBy?: string;
}
