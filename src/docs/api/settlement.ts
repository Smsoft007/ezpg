/**
 * 정산 API 관련 인터페이스 정의
 */

export interface SettlementRequest {
  merchantId: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  description?: string;
}

export interface SettlementResponse {
  settlementId: string;
  merchantId: string;
  status: SettlementStatus;
  amount: number;
  fee: number;
  netAmount: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  description?: string;
  createdAt: string;
  scheduledAt?: string;
}

export interface SettlementStatusRequest {
  settlementId: string;
  merchantId: string;
}

export interface SettlementStatusResponse {
  settlementId: string;
  merchantId: string;
  status: SettlementStatus;
  amount: number;
  fee: number;
  netAmount: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  description?: string;
  createdAt: string;
  scheduledAt?: string;
  processedAt?: string;
  failReason?: string;
}

export interface SettlementListRequest {
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  status?: SettlementStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface SettlementListResponse {
  settlements: SettlementSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SettlementSummary {
  settlementId: string;
  merchantId: string;
  status: SettlementStatus;
  amount: number;
  fee: number;
  netAmount: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  createdAt: string;
  scheduledAt?: string;
  processedAt?: string;
}

export interface SettlementScheduleRequest {
  merchantId: string;
  cycleType: SettlementCycleType;
  dayOfWeek?: number; // 1-7 (월-일)
  dayOfMonth?: number; // 1-31
  minAmount?: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}

export interface SettlementScheduleResponse {
  scheduleId: string;
  merchantId: string;
  cycleType: SettlementCycleType;
  dayOfWeek?: number;
  dayOfMonth?: number;
  minAmount?: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementFeeConfigRequest {
  merchantId: string;
  feeType: SettlementFeeType;
  feeValue: number;
  minFee?: number;
  maxFee?: number;
}

export interface SettlementFeeConfigResponse {
  configId: string;
  merchantId: string;
  feeType: SettlementFeeType;
  feeValue: number;
  minFee?: number;
  maxFee?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SettlementWebhookPayload {
  event: SettlementWebhookEvent;
  settlementId: string;
  merchantId: string;
  status: SettlementStatus;
  amount: number;
  fee: number;
  netAmount: number;
  timestamp: string;
}

export enum SettlementStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED'
}

export enum SettlementCycleType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  MANUAL = 'MANUAL'
}

export enum SettlementFeeType {
  FIXED = 'FIXED',
  PERCENTAGE = 'PERCENTAGE'
}

export enum SettlementWebhookEvent {
  SETTLEMENT_CREATED = 'SETTLEMENT_CREATED',
  SETTLEMENT_SCHEDULED = 'SETTLEMENT_SCHEDULED',
  SETTLEMENT_PROCESSING = 'SETTLEMENT_PROCESSING',
  SETTLEMENT_COMPLETED = 'SETTLEMENT_COMPLETED',
  SETTLEMENT_FAILED = 'SETTLEMENT_FAILED',
  SETTLEMENT_CANCELED = 'SETTLEMENT_CANCELED'
}
