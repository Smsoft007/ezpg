/**
 * 거래처 상태 타입
 */
export type VendorStatus = 'active' | 'inactive' | 'pending';

/**
 * 거래처 기본 정보 인터페이스
 */
export interface Vendor {
  id: string;
  vendorName: string;
  businessNumber: string;
  representativeName: string;
  phoneNumber: string;
  email: string;
  address: string;
  businessType: string;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
  taxRate: number;
  paymentTerms: string;
  contactPerson?: string;
}

/**
 * 거래처 은행 정보 인터페이스
 */
export interface VendorBankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

/**
 * 거래처 비즈니스 정보 인터페이스
 */
export interface VendorBusinessInfo {
  companyName: string;
  ceoName: string;
  businessType: string;
  businessCategory: string;
}

/**
 * 거래처 담당자 정보 인터페이스
 */
export interface VendorContact {
  id: string;
  vendorId: string;
  name: string;
  position?: string;
  department?: string;
  phoneNumber: string;
  email: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 거래처 API 키 정보 인터페이스
 */
export interface VendorApiKey {
  id: string;
  vendorId: string;
  apiKey: string;
  secretKey: string;
  name: string;
  environment: string;
  status: string;
  expiryDate?: string;
  allowedIps?: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

/**
 * 거래처 결제 설정 정보 인터페이스
 */
export interface VendorPaymentSetting {
  id: string;
  vendorId: string;
  paymentMethod: string;
  isEnabled: boolean;
  feeRate: number;
  fixedFee: number;
  minFee?: number;
  maxFee?: number;
  settlementCycle?: string;
  settings?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 거래 내역 인터페이스
 */
export interface Transaction {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  paymentMethod: string;
  status: string;
  orderId: string;
  customerName?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * 정산 내역 인터페이스
 */
export interface VendorSettlement {
  id: string;
  settlementDate: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  totalFee: number;
  netAmount: number;
  transactionCount: number;
  status: string;
  transferDate?: string;
  transferReference?: string;
}

/**
 * 거래 통계 정보 인터페이스
 */
export interface TransactionStats {
  totalTransactions: number;
  completedTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalAmount: number;
  completedAmount: number;
  totalFee: number;
}

/**
 * 거래처 상세 정보 인터페이스 (기본 정보 + 은행 정보 + 비즈니스 정보)
 */
export interface VendorDetail extends Vendor {
  bankInfo?: VendorBankInfo;
  businessInfo?: VendorBusinessInfo;
  contacts?: VendorContact[];
  apiKeys?: VendorApiKey[];
  paymentSettings?: VendorPaymentSetting[];
  recentTransactions?: Transaction[];
  recentSettlements?: VendorSettlement[];
  transactionStats?: TransactionStats;
}

/**
 * 거래처 생성 요청 인터페이스
 */
export interface CreateVendorRequest {
  vendorName: string;
  businessNumber: string;
  representativeName: string;
  phoneNumber: string;
  email: string;
  address: string;
  businessType: string;
  status?: VendorStatus;
  taxRate?: number;
  paymentTerms?: string;
  contactPerson?: string;
  
  // 은행 정보
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  
  // 비즈니스 정보
  companyName?: string;
  ceoName?: string;
  detailBusinessType?: string;
  businessCategory?: string;
}

/**
 * 거래처 수정 요청 인터페이스
 */
export interface UpdateVendorRequest extends CreateVendorRequest {
  id: string;
}

/**
 * 거래처 상태 변경 요청 인터페이스
 */
export interface UpdateVendorStatusRequest {
  id: string;
  status: VendorStatus;
}

/**
 * 거래처 목록 조회 요청 인터페이스
 */
export interface GetVendorListRequest {
  searchText?: string;
  status?: VendorStatus;
  page?: number;
  limit?: number;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * 거래처 목록 조회 응답 인터페이스
 */
export interface GetVendorListResponse {
  vendors: Vendor[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * 거래처 상세 조회 응답 인터페이스
 */
export interface GetVendorDetailResponse {
  vendor: VendorDetail;
}

/**
 * 거래처 생성/수정/삭제 응답 인터페이스
 */
export interface VendorActionResponse {
  id: string;
  success: boolean;
  message?: string;
}
