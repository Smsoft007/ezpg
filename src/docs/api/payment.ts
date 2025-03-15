/**
 * 결제 API 관련 인터페이스 정의
 */

export interface PaymentRequest {
  merchantId: string;
  amount: number;
  orderId: string;
  orderName: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
  notifyUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  paymentId: string;
  merchantId: string;
  status: PaymentStatus;
  amount: number;
  orderId: string;
  orderName: string;
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentStatusRequest {
  paymentId: string;
  merchantId: string;
}

export interface PaymentStatusResponse {
  paymentId: string;
  merchantId: string;
  status: PaymentStatus;
  amount: number;
  orderId: string;
  orderName: string;
  paidAt?: string;
  failedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentCancelRequest {
  paymentId: string;
  merchantId: string;
  reason?: string;
}

export interface PaymentCancelResponse {
  paymentId: string;
  merchantId: string;
  status: PaymentStatus;
  amount: number;
  canceledAt: string;
  cancelReason?: string;
}

export interface PaymentWebhookPayload {
  event: PaymentWebhookEvent;
  paymentId: string;
  merchantId: string;
  status: PaymentStatus;
  amount: number;
  orderId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED',
  PARTIAL_REFUNDED = 'PARTIAL_REFUNDED'
}

export enum PaymentWebhookEvent {
  PAYMENT_CREATED = 'PAYMENT_CREATED',
  PAYMENT_COMPLETED = 'PAYMENT_COMPLETED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  PAYMENT_CANCELED = 'PAYMENT_CANCELED',
  PAYMENT_REFUNDED = 'PAYMENT_REFUNDED'
}

export interface PaymentStatisticsRequest {
  merchantId?: string;
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface PaymentStatisticsResponse {
  totalAmount: number;
  totalCount: number;
  successRate: number;
  averageAmount: number;
  data: PaymentStatisticsItem[];
}

export interface PaymentStatisticsItem {
  period: string;
  amount: number;
  count: number;
  successCount: number;
  failedCount: number;
  successRate: number;
}
