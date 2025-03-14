/**
 * 가맹점 정보 인터페이스
 * 결제 시스템에 등록된 가맹점 정보를 정의합니다.
 */
export interface Merchant {
  /** 가맹점 고유 ID */
  merchantId: string;
  /** 가맹점 이름 */
  merchantName: string;
  /** 사업자등록번호 */
  businessNumber: string;
  /** 대표자 이름 */
  representativeName: string;
  /** 가맹점 유형 (individual, corporation, etc.) */
  merchantType: 'individual' | 'corporation' | 'sole_proprietor' | 'partnership';
  /** 업종 카테고리 */
  businessCategory: string;
  /** 업종 세부 카테고리 */
  businessSubCategory?: string;
  /** 연락처 전화번호 */
  contactPhone: string;
  /** 연락처 이메일 */
  contactEmail: string;
  /** 우편번호 */
  postalCode?: string;
  /** 주소 */
  address: string;
  /** 상세 주소 */
  addressDetail?: string;
  /** 웹사이트 URL */
  websiteUrl?: string;
  /** 로고 이미지 URL */
  logoUrl?: string;
  /** 가맹점 상태 (active, pending, suspended, inactive) */
  status: 'active' | 'pending' | 'suspended' | 'inactive';
  /** 승인 상태 (approved, pending, rejected) */
  approvalStatus: 'approved' | 'pending' | 'rejected';
  /** 승인 내용 */
  approvalNotes?: string;
  /** 승인 날짜 */
  approvedAt?: string;
  /** 승인한 관리자 ID */
  approvedBy?: string;
  /** 등록 날짜 */
  createdAt: string;
  /** 수정 날짜 */
  updatedAt: string;
  
  // MerchantProfile.tsx에서 사용되는 추가 필드들
  email?: string;
  phone?: string;
  virtualAccountCount?: number;
  feeRate?: number;
  settlementCycle?: 'daily' | 'weekly' | 'monthly';
  webhookUrl?: string;
  verifiedYn?: string;
  businessInfo?: {
    companyName: string;
    ceoName: string;
    businessType: string;
    businessCategory: string;
  };
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
}

/**
 * 가맹점 재무 정보 인터페이스
 * 가맹점의 재무 관련 정보를 정의합니다.
 */
export interface MerchantFinancial {
  /** 가맹점 ID */
  merchantId: string;
  /** 현재 잔액 */
  balance: number;
  /** 예약된 잔액 (출금 진행중 등) */
  reservedBalance?: number;
  /** 가용 잔액 */
  availableBalance?: number;
  /** 수수료 정책 ID */
  feeScheduleId?: string;
  /** 기본 수수료 율 (%) */
  defaultFeeRate: number;
  /** 최소 수수료 */
  minimumFee?: number;
  /** 최대 수수료 */
  maximumFee?: number;
  /** 정산 주기 (daily, weekly, biweekly, monthly) */
  settlementCycle: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  /** 정산일 (주기가 weekly/biweekly/monthly인 경우) */
  settlementDay?: number;
  /** 정산 계좌 은행 */
  settlementBankCode: string;
  /** 정산 계좌번호 */
  settlementAccountNumber: string;
  /** 정산 계좌 예금주 */
  settlementAccountHolder: string;
}

/**
 * 가맹점 API 키 정보 인터페이스
 * 가맹점의 API 연동을 위한 키 정보를 정의합니다.
 */
export interface MerchantApiKey {
  /** API 키 ID */
  apiKeyId: string;
  /** 가맹점 ID */
  merchantId: string;
  /** API 키 이름 */
  keyName: string;
  /** API 키 값 */
  apiKey: string;
  /** API 비밀키 */
  apiSecret: string;
  /** 허용 IP 주소 목록 */
  allowedIps?: string[];
  /** 허용 도메인 목록 */
  allowedDomains?: string[];
  /** 허용 기능 목록 */
  permissions: string[];
  /** 활성화 여부 */
  isActive: boolean;
  /** 만료일 */
  expiresAt?: string;
  /** 마지막 사용 시간 */
  lastUsedAt?: string;
  /** 생성 시간 */
  createdAt: string;
  /** 수정 시간 */
  updatedAt: string;
}

/**
 * 가맹점 설정 인터페이스
 * 가맹점별 설정 정보를 정의합니다.
 */
export interface MerchantSettings {
  /** 가맹점 ID */
  merchantId: string;
  /** 콜백 URL */
  callbackUrl?: string;
  /** 알림 수신 이메일 */
  notificationEmail?: string;
  /** 알림 수신 전화번호 */
  notificationPhone?: string;
  /** 일일 거래 한도 금액 */
  dailyTransactionLimit?: number;
  /** 건당 거래 한도 금액 */
  perTransactionLimit?: number;
  /** 자동 정산 사용 여부 */
  autoSettlement: boolean;
  /** 자동 정산 최소 금액 */
  autoSettlementMinAmount?: number;
  /** 자동 정산 시간 (24시간 형식, e.g. "14:00") */
  autoSettlementTime?: string;
  /** 거래 승인 요구 여부 */
  requiresApproval: boolean;
  /** 사용자 정의 설정 (확장 가능한 설정) */
  customSettings?: Record<string, any>;
}
