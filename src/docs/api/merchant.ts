/**
 * 가맹점 API 관련 인터페이스 정의
 */

export interface MerchantCreateRequest {
  businessName: string;
  businessNumber: string;
  representativeName: string;
  businessType: string;
  businessCategory: string;
  email: string;
  phone: string;
  address: string;
  detailAddress?: string;
  zipCode?: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  settlementCycle?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  callbackUrl?: string;
  notificationUrl?: string;
}

export interface MerchantCreateResponse {
  merchantId: string;
  apiKey: string;
  secretKey: string;
  status: MerchantStatus;
  createdAt: string;
}

export interface MerchantUpdateRequest {
  merchantId: string;
  email?: string;
  phone?: string;
  address?: string;
  detailAddress?: string;
  zipCode?: string;
  bankCode?: string;
  bankAccountNumber?: string;
  bankAccountHolder?: string;
  settlementCycle?: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  callbackUrl?: string;
  notificationUrl?: string;
}

export interface MerchantUpdateResponse {
  merchantId: string;
  updatedAt: string;
}

export interface MerchantGetRequest {
  merchantId: string;
}

export interface MerchantGetResponse {
  merchantId: string;
  businessName: string;
  businessNumber: string;
  representativeName: string;
  businessType: string;
  businessCategory: string;
  email: string;
  phone: string;
  address: string;
  detailAddress?: string;
  zipCode?: string;
  bankCode: string;
  bankAccountNumber: string;
  bankAccountHolder: string;
  settlementCycle: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  callbackUrl?: string;
  notificationUrl?: string;
  status: MerchantStatus;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantListRequest {
  page?: number;
  limit?: number;
  status?: MerchantStatus;
  searchKeyword?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface MerchantListResponse {
  merchants: MerchantSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MerchantSummary {
  merchantId: string;
  businessName: string;
  businessNumber: string;
  representativeName: string;
  status: MerchantStatus;
  balance: number;
  createdAt: string;
}

export interface MerchantStatusUpdateRequest {
  merchantId: string;
  status: MerchantStatus;
  reason?: string;
}

export interface MerchantStatusUpdateResponse {
  merchantId: string;
  status: MerchantStatus;
  updatedAt: string;
}

export interface MerchantApiKeyRegenerateRequest {
  merchantId: string;
  keyType: 'API_KEY' | 'SECRET_KEY' | 'BOTH';
}

export interface MerchantApiKeyRegenerateResponse {
  merchantId: string;
  apiKey?: string;
  secretKey?: string;
  updatedAt: string;
}

export enum MerchantStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TERMINATED = 'TERMINATED',
  REJECTED = 'REJECTED'
}
