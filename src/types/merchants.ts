/**
 * 가맹점 관련 타입 정의
 */

/**
 * 가맹점 상태 타입
 * 가맹점의 현재 상태를 나타내는 문자열 리터럴 타입입니다.
 * - active: 활성 상태
 * - inactive: 비활성 상태
 * - pending: 대기 상태
 * - suspended: 정지 상태
 */
export type MerchantStatus = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * 가맹점 인터페이스
 * 가맹점 정보를 나타내는 타입입니다.
 */
export interface Merchant {
  id: number;
  name: string;
  businessNumber: string;
  representativeName: string;
  phoneNumber: string;
  email: string;
  address: string;
  businessType: string;
  status: MerchantStatus;
  registrationDate: string;
  lastUpdated: string;
  contractStartDate: string;
  contractEndDate: string;
  commissionRate: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  memo?: string;
  tags?: string[];
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
 * 가맹점 생성 파라미터 인터페이스
 * 새 가맹점 등록 시 필요한 정보를 정의합니다.
 */
export interface MerchantCreateParams {
  name: string;
  businessNumber: string;
  representativeName: string;
  phoneNumber: string;
  email: string;
  address: string;
  businessType: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  contractStartDate?: string;
  contractEndDate?: string;
  commissionRate?: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  memo?: string;
  tags?: string[];
}

/**
 * 가맹점 수정 파라미터 인터페이스
 * 가맹점 정보 수정 시 필요한 정보를 정의합니다.
 */
export interface MerchantUpdateParams {
  name?: string;
  businessNumber?: string;
  representativeName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  businessType?: string;
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  contractStartDate?: string;
  contractEndDate?: string;
  commissionRate?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  memo?: string;
  tags?: string[];
}

/**
 * API 응답 인터페이스
 * 모든 API 응답의 기본 구조를 정의합니다.
 */
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiError;
  warning?: ApiWarning;
}

/**
 * API 에러 인터페이스
 * API 요청 중 발생한 에러 정보를 담습니다.
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

/**
 * API 경고 인터페이스
 * API 요청은 성공했지만 주의가 필요한 경우 경고 정보를 담습니다.
 */
export interface ApiWarning {
  message: string;
  code?: string;
  originalError?: string;
}
