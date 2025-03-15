/**
 * 거래 API 관련 인터페이스 정의
 */

export interface TransactionRequest {
  merchantId: string;
  type: TransactionType;
  amount: number;
  currency?: string;
  orderId?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface TransactionResponse {
  transactionId: string;
  merchantId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  fee?: number;
  netAmount?: number;
  orderId?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionStatusRequest {
  transactionId: string;
  merchantId: string;
}

export interface TransactionStatusResponse {
  transactionId: string;
  merchantId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  fee?: number;
  netAmount?: number;
  orderId?: string;
  description?: string;
  failReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TransactionListRequest {
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface TransactionListResponse {
  transactions: TransactionSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionSummary {
  transactionId: string;
  merchantId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  fee?: number;
  netAmount?: number;
  orderId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransactionWebhookPayload {
  event: TransactionWebhookEvent;
  transactionId: string;
  merchantId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  orderId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  REFUND = 'REFUND',
  ADJUSTMENT = 'ADJUSTMENT',
  FEE = 'FEE',
  SETTLEMENT = 'SETTLEMENT'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED'
}

export enum TransactionWebhookEvent {
  TRANSACTION_CREATED = 'TRANSACTION_CREATED',
  TRANSACTION_UPDATED = 'TRANSACTION_UPDATED',
  TRANSACTION_COMPLETED = 'TRANSACTION_COMPLETED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  TRANSACTION_CANCELED = 'TRANSACTION_CANCELED'
}

export interface TransactionStatisticsRequest {
  merchantId?: string;
  startDate: string;
  endDate: string;
  type?: TransactionType;
  groupBy?: 'day' | 'week' | 'month';
}

export interface TransactionStatisticsResponse {
  totalAmount: number;
  totalCount: number;
  successRate: number;
  averageAmount: number;
  byType: {
    [key in TransactionType]?: {
      amount: number;
      count: number;
    };
  };
  data: TransactionStatisticsItem[];
}

export interface TransactionStatisticsItem {
  period: string;
  amount: number;
  count: number;
  byType: {
    [key in TransactionType]?: {
      amount: number;
      count: number;
    };
  };
}
