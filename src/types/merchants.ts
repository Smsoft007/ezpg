/**
 * 가맹점 관련 타입 정의
 */

/**
 * 가맹점 인터페이스
 */
export interface Merchant {
  id: number;
  name: string;
  businessNumber: string;
  representativeName: string;
  status: 'active' | 'inactive' | 'pending';
  email: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  bank: string;
  accountNumber: string;
  accountHolder: string;
  paymentFee: number;
  withdrawalFee: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 가맹점 목록 결과 인터페이스
 */
export interface MerchantsListResult {
  merchants: Merchant[];
  pagination: PaginationInfo;
}

/**
 * 페이지네이션 정보 인터페이스
 */
export interface PaginationInfo {
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * 가맹점 검색 파라미터 인터페이스
 */
export interface MerchantSearchParams {
  name?: string;
  businessNumber?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 가맹점 잔액 인터페이스
 */
export interface MerchantBalance {
  id: number;
  name: string;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  lastUpdated: string;
}

/**
 * 가맹점 거래 내역 인터페이스
 */
export interface MerchantTransaction {
  id: number;
  merchantId: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  fee: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  completedAt?: string;
  description?: string;
}

/**
 * 가맹점 거래 내역 검색 파라미터 인터페이스
 */
export interface TransactionSearchParams {
  page?: number;
  pageSize?: number;
  type?: 'deposit' | 'withdrawal';
  status?: 'completed' | 'pending' | 'failed';
  startDate?: string;
  endDate?: string;
}

/**
 * API 오류 인터페이스
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * API 경고 인터페이스
 */
export interface ApiWarning {
  message: string;
  code: string;
  originalError?: string;
}

/**
 * API 응답 인터페이스
 */
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiError;
  warning?: ApiWarning;
  isLoading?: boolean;
}
