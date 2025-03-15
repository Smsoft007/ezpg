/**
 * 거래 관련 데이터베이스 프로시저 호출 모듈
 */
import { executeProcedure, executeQuery } from '@/db';
import { TransactionStatus, TransactionType } from '@/docs/api/transaction';

interface TransactionData {
  transactionId: string;
  merchantId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee?: number;
  netAmount?: number;
  orderId?: string;
  description?: string;
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface TransactionSummaryData {
  transactionId: string;
  merchantId: string;
  businessName: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee?: number;
  netAmount?: number;
  orderId?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface TransactionStatisticsData {
  period: string;
  amount: number;
  count: number;
  depositAmount: number;
  depositCount: number;
  withdrawalAmount: number;
  withdrawalCount: number;
  refundAmount: number;
  refundCount: number;
}

/**
 * 거래 목록을 조회합니다.
 */
export async function getTransactions(params: {
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}): Promise<{ transactions: TransactionSummaryData[]; total: number }> {
  const result = await executeProcedure<TransactionSummaryData & { TotalCount: number }>('sp_GetTransactions', {
    MerchantId: params.merchantId || null,
    StartDate: params.startDate || null,
    EndDate: params.endDate || null,
    Type: params.type || null,
    Status: params.status || null,
    PageNumber: params.page || 1,
    PageSize: params.limit || 10,
    SortBy: params.sortBy || 'createdAt',
    SortOrder: params.sortOrder || 'DESC'
  });

  const total = result.length > 0 ? result[0].TotalCount : 0;
  return {
    transactions: result.map(item => ({
      transactionId: item.transactionId,
      merchantId: item.merchantId,
      businessName: item.businessName,
      type: item.type as TransactionType,
      status: item.status as TransactionStatus,
      amount: item.amount,
      fee: item.fee,
      netAmount: item.netAmount,
      orderId: item.orderId,
      createdAt: item.createdAt,
      completedAt: item.completedAt
    })),
    total
  };
}

/**
 * 거래 상세 정보를 조회합니다.
 */
export async function getTransactionById(transactionId: string): Promise<TransactionData | null> {
  const result = await executeProcedure<TransactionData>('sp_GetTransactionById', {
    TransactionId: transactionId
  });

  if (result.length === 0) {
    return null;
  }

  return {
    ...result[0],
    type: result[0].type as TransactionType,
    status: result[0].status as TransactionStatus,
    metadata: result[0].metadata ? JSON.parse(result[0].metadata as string) : undefined
  };
}

/**
 * 새로운 거래를 생성합니다.
 */
export async function createTransaction(data: {
  merchantId: string;
  type: TransactionType;
  amount: number;
  orderId?: string;
  description?: string;
  metadata?: Record<string, any>;
}): Promise<TransactionData> {
  const result = await executeProcedure<TransactionData>('sp_CreateTransaction', {
    MerchantId: data.merchantId,
    Type: data.type,
    Amount: data.amount,
    OrderId: data.orderId || null,
    Description: data.description || null,
    Metadata: data.metadata ? JSON.stringify(data.metadata) : null
  });

  return {
    ...result[0],
    type: result[0].type as TransactionType,
    status: result[0].status as TransactionStatus,
    metadata: result[0].metadata ? JSON.parse(result[0].metadata as string) : undefined
  };
}

/**
 * 거래 상태를 업데이트합니다.
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  failReason?: string
): Promise<TransactionData> {
  const result = await executeProcedure<TransactionData>('sp_UpdateTransactionStatus', {
    TransactionId: transactionId,
    Status: status,
    FailReason: failReason || null
  });

  return {
    ...result[0],
    type: result[0].type as TransactionType,
    status: result[0].status as TransactionStatus,
    metadata: result[0].metadata ? JSON.parse(result[0].metadata as string) : undefined
  };
}

/**
 * 거래 통계를 조회합니다.
 */
export async function getTransactionStatistics(params: {
  merchantId?: string;
  startDate: string;
  endDate: string;
  groupBy?: 'day' | 'week' | 'month';
}): Promise<{
  totalAmount: number;
  totalCount: number;
  data: TransactionStatisticsData[];
}> {
  const result = await executeProcedure<TransactionStatisticsData & { TotalAmount: number; TotalCount: number }>('sp_GetTransactionStatistics', {
    MerchantId: params.merchantId || null,
    StartDate: params.startDate,
    EndDate: params.endDate,
    GroupBy: params.groupBy || 'day'
  });

  const totalAmount = result.length > 0 ? result[0].TotalAmount : 0;
  const totalCount = result.length > 0 ? result[0].TotalCount : 0;

  return {
    totalAmount,
    totalCount,
    data: result.map(item => ({
      period: item.period,
      amount: item.amount,
      count: item.count,
      depositAmount: item.depositAmount,
      depositCount: item.depositCount,
      withdrawalAmount: item.withdrawalAmount,
      withdrawalCount: item.withdrawalCount,
      refundAmount: item.refundAmount,
      refundCount: item.refundCount
    }))
  };
}
