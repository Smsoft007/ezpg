/**
 * 결제 관련 데이터베이스 프로시저 호출 모듈
 */
import { executeProcedure, executeQuery } from '@/db';
import { PaymentStatus } from '@/docs/api/payment';

interface PaymentData {
  paymentId: string;
  merchantId: string;
  status: PaymentStatus;
  amount: number;
  orderId: string;
  orderName: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
  notifyUrl?: string;
  paymentUrl?: string;
  metadata?: string;
  paidAt?: Date;
  failedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PaymentSummaryData {
  paymentId: string;
  merchantId: string;
  businessName: string;
  status: PaymentStatus;
  amount: number;
  orderId: string;
  orderName: string;
  customerName?: string;
  createdAt: Date;
  paidAt?: Date;
}

interface PaymentStatisticsData {
  period: string;
  amount: number;
  count: number;
  successCount: number;
  failedCount: number;
  successRate: number;
}

/**
 * 결제 목록을 조회합니다.
 */
export async function getPayments(params: {
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  status?: PaymentStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}): Promise<{ payments: PaymentSummaryData[]; total: number }> {
  const result = await executeProcedure<PaymentSummaryData & { TotalCount: number }>('sp_GetPayments', {
    MerchantId: params.merchantId || null,
    StartDate: params.startDate || null,
    EndDate: params.endDate || null,
    Status: params.status || null,
    PageNumber: params.page || 1,
    PageSize: params.limit || 10,
    SortBy: params.sortBy || 'createdAt',
    SortOrder: params.sortOrder || 'DESC'
  });

  const total = result.length > 0 ? result[0].TotalCount : 0;
  return {
    payments: result.map(item => ({
      paymentId: item.paymentId,
      merchantId: item.merchantId,
      businessName: item.businessName,
      status: item.status as PaymentStatus,
      amount: item.amount,
      orderId: item.orderId,
      orderName: item.orderName,
      customerName: item.customerName,
      createdAt: item.createdAt,
      paidAt: item.paidAt
    })),
    total
  };
}

/**
 * 결제 상세 정보를 조회합니다.
 */
export async function getPaymentById(paymentId: string): Promise<PaymentData | null> {
  const result = await executeProcedure<PaymentData>('sp_GetPaymentById', {
    PaymentId: paymentId
  });

  if (result.length === 0) {
    return null;
  }

  return {
    ...result[0],
    status: result[0].status as PaymentStatus,
    metadata: result[0].metadata ? JSON.parse(result[0].metadata as string) : undefined
  };
}

/**
 * 주문 ID로 결제 정보를 조회합니다.
 */
export async function getPaymentByOrderId(merchantId: string, orderId: string): Promise<PaymentData | null> {
  const result = await executeProcedure<PaymentData>('sp_GetPaymentByOrderId', {
    MerchantId: merchantId,
    OrderId: orderId
  });

  if (result.length === 0) {
    return null;
  }

  return {
    ...result[0],
    status: result[0].status as PaymentStatus,
    metadata: result[0].metadata ? JSON.parse(result[0].metadata as string) : undefined
  };
}

/**
 * 새로운 결제를 생성합니다.
 */
export async function createPayment(data: {
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
}): Promise<PaymentData> {
  const result = await executeProcedure<PaymentData>('sp_CreatePayment', {
    MerchantId: data.merchantId,
    Amount: data.amount,
    OrderId: data.orderId,
    OrderName: data.orderName,
    CustomerName: data.customerName || null,
    CustomerEmail: data.customerEmail || null,
    CustomerPhone: data.customerPhone || null,
    ReturnUrl: data.returnUrl || null,
    NotifyUrl: data.notifyUrl || null,
    Metadata: data.metadata ? JSON.stringify(data.metadata) : null
  });

  return {
    ...result[0],
    status: result[0].status as PaymentStatus,
    metadata: result[0].metadata ? JSON.parse(result[0].metadata as string) : undefined
  };
}

/**
 * 결제 상태를 업데이트합니다.
 */
export async function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  failedReason?: string
): Promise<PaymentData> {
  const result = await executeProcedure<PaymentData>('sp_UpdatePaymentStatus', {
    PaymentId: paymentId,
    Status: status,
    FailedReason: failedReason || null
  });

  return {
    ...result[0],
    status: result[0].status as PaymentStatus,
    metadata: result[0].metadata ? JSON.parse(result[0].metadata as string) : undefined
  };
}

/**
 * 결제를 취소합니다.
 */
export async function cancelPayment(
  paymentId: string,
  reason?: string
): Promise<PaymentData> {
  const result = await executeProcedure<PaymentData>('sp_CancelPayment', {
    PaymentId: paymentId,
    CancelReason: reason || null
  });

  return {
    ...result[0],
    status: result[0].status as PaymentStatus,
    metadata: result[0].metadata ? JSON.parse(result[0].metadata as string) : undefined
  };
}

/**
 * 결제 통계를 조회합니다.
 */
export async function getPaymentStatistics(params: {
  merchantId?: string;
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
}): Promise<{
  totalAmount: number;
  totalCount: number;
  successRate: number;
  averageAmount: number;
  data: PaymentStatisticsData[];
}> {
  const result = await executeProcedure<PaymentStatisticsData & { 
    TotalAmount: number; 
    TotalCount: number;
    SuccessRate: number;
    AverageAmount: number;
  }>('sp_GetPaymentStatistics', {
    MerchantId: params.merchantId || null,
    StartDate: params.startDate,
    EndDate: params.endDate,
    GroupBy: params.groupBy || 'day'
  });

  const totalAmount = result.length > 0 ? result[0].TotalAmount : 0;
  const totalCount = result.length > 0 ? result[0].TotalCount : 0;
  const successRate = result.length > 0 ? result[0].SuccessRate : 0;
  const averageAmount = result.length > 0 ? result[0].AverageAmount : 0;

  return {
    totalAmount,
    totalCount,
    successRate,
    averageAmount,
    data: result.map(item => ({
      period: item.period,
      amount: item.amount,
      count: item.count,
      successCount: item.successCount,
      failedCount: item.failedCount,
      successRate: item.successRate
    }))
  };
}
