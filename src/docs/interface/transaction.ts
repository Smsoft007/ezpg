/**
 * 거래 기본 인터페이스
 * 모든 유형의 거래에 공통적으로 적용되는 기본 속성을 정의합니다.
 */
export interface Transaction {
  /** 거래 고유 ID */
  transactionId: string;
  /** 가맹점 ID */
  merchantId: string;
  /** 거래 유형 (deposit, withdrawal, transfer, refund, adjustment) */
  type: 'deposit' | 'withdrawal' | 'transfer' | 'refund' | 'adjustment';
  /** 거래 금액 */
  amount: number;
  /** 통화 (KRW, USD 등) */
  currency: string;
  /** 거래 상태 (pending, completed, failed, canceled) */
  status: 'pending' | 'completed' | 'failed' | 'canceled';
  /** 거래 시간 */
  timestamp: string;
  /** 거래 완료 시간 */
  completedAt?: string;
  /** 거래 수수료 */
  fee?: number;
  /** 수수료 율 (%) */
  feeRate?: number;
  /** 거래 메모 */
  description?: string;
  /** 거래 요청 IP */
  ipAddress?: string;
  /** 외부 시스템 참조 ID */
  externalId?: string;
  /** 사용자 정의 메타데이터 */
  metadata?: Record<string, any>;
  /** 생성 시간 */
  createdAt: string;
  /** 수정 시간 */
  updatedAt: string;
  
  // TransactionList.tsx에서 사용되는 추가 필드들
  merchant?: {
    merchantName: string;
  };
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  paymentMethod?: string;
}

/**
 * 입금 거래 인터페이스
 * 가상계좌로 입금된 거래 정보를 정의합니다.
 */
export interface DepositTransaction extends Transaction {
  /** 입금자 이름 */
  depositor: string;
  /** 입금 계좌번호 */
  accountNumber: string;
  /** 은행 코드 */
  bankCode: string;
  /** 입금 계좌명 */
  accountName?: string;
  /** 거래 참조번호 */
  referenceId?: string;
  /** 입금 요청 ID */
  requestId?: string;
  /** 입금 확인 시간 */
  verifiedAt?: string;
}

/**
 * 출금 거래 인터페이스
 * 가맹점이 요청한 출금 거래 정보를 정의합니다.
 */
export interface WithdrawalTransaction extends Transaction {
  /** 출금 계좌번호 */
  accountNumber: string;
  /** 은행 코드 */
  bankCode: string;
  /** 계좌 예금주 */
  accountHolder: string;
  /** 출금 요청자 ID */
  requestedBy: string;
  /** 출금 승인자 ID */
  approvedBy?: string;
  /** 출금 승인 시간 */
  approvedAt?: string;
  /** 출금 요청 시간 */
  requestedAt: string;
  /** 출금 실패 사유 */
  failureReason?: string;
}

/**
 * 거래 로그 인터페이스
 * 거래 처리 과정에서 발생한 로그 정보를 정의합니다.
 */
export interface TransactionLog {
  /** 로그 ID */
  logId: string;
  /** 거래 ID */
  transactionId: string;
  /** 가맹점 ID */
  merchantId: string;
  /** 로그 레벨 (info, warning, error) */
  level: 'info' | 'warning' | 'error';
  /** 로그 메시지 */
  message: string;
  /** 로그 상세 내용 */
  details?: Record<string, any>;
  /** 시스템 오류 코드 */
  errorCode?: string;
  /** 시스템 오류 메시지 */
  errorMessage?: string;
  /** 로그 생성 시간 */
  createdAt: string;
}

/**
 * 거래 통계 인터페이스
 * 거래 통계 데이터를 정의합니다.
 */
export interface TransactionStatistics {
  /** 통계 기간 시작일 */
  startDate: string;
  /** 통계 기간 종료일 */
  endDate: string;
  /** 가맹점 ID */
  merchantId?: string;
  /** 총 거래 수 */
  totalTransactions: number;
  /** 총 거래 금액 */
  totalAmount: number;
  /** 성공 거래 수 */
  successfulTransactions: number;
  /** 성공 거래 금액 */
  successfulAmount: number;
  /** 실패 거래 수 */
  failedTransactions: number;
  /** 실패 거래 금액 */
  failedAmount: number;
  /** 평균 거래 금액 */
  averageAmount: number;
  /** 최대 거래 금액 */
  maxAmount: number;
  /** 최소 거래 금액 */
  minAmount: number;
  /** 총 수수료 */
  totalFees: number;
  /** 시간별 거래 데이터 */
  hourlyData?: Record<string, number>;
  /** 일별 거래 데이터 */
  dailyData?: Record<string, number>;
  /** 월별 거래 데이터 */
  monthlyData?: Record<string, number>;
}
