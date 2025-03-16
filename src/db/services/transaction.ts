/**
 * 거래 관련 데이터베이스 서비스
 * 결제, 취소, 조회 등의 거래 관련 기능을 제공합니다.
 */
import { executeProcedure, executeQuery, executeTransaction } from '@/db';

/**
 * 거래 상태 열거형
 */
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELED = 'canceled',
  REFUNDED = 'refunded',
  PARTIAL_REFUNDED = 'partial_refunded'
}

/**
 * 결제 방법 열거형
 */
export enum PaymentMethod {
  CARD = 'card',
  VIRTUAL_ACCOUNT = 'virtual_account',
  ACCOUNT_TRANSFER = 'account_transfer',
  MOBILE = 'mobile'
}

/**
 * 거래 정보 인터페이스
 * @interface Transaction
 */
interface Transaction {
  id: string;
  vendorId: string;
  orderNumber: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productName: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  canceledAt?: Date;
  refundedAt?: Date;
  metadata?: Record<string, any>;
}

/**
 * 결제 요청 인터페이스
 * @interface PaymentRequest
 */
interface PaymentRequest {
  vendorId: string;
  orderNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  productName: string;
  returnUrl?: string;
  notifyUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * 결제 응답 인터페이스
 * @interface PaymentResponse
 */
interface PaymentResponse {
  transactionId: string;
  vendorId: string;
  orderNumber: string;
  amount: number;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  paymentUrl?: string;
  virtualAccount?: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    expiresAt: Date;
  };
}

/**
 * 결제를 요청합니다.
 * @param paymentData 결제 요청 데이터
 * @returns 결제 응답 정보
 */
export async function requestPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
  try {
    // 저장 프로시저 실행
    const result = await executeProcedure('sp_RequestPayment', paymentData);
    
    // 결제 응답 정보
    return result[0][0];
  } catch (error) {
    console.error('결제 요청 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 거래 ID로 거래 정보를 조회합니다.
 * @param transactionId 거래 ID
 * @returns 거래 정보
 */
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  try {
    // 저장 프로시저 실행
    const result = await executeProcedure('sp_GetTransactionById', { transactionId });
    
    // 결과가 없는 경우
    if (!result || result.length === 0 || !result[0] || result[0].length === 0) {
      return null;
    }
    
    // 거래 정보
    return result[0][0];
  } catch (error) {
    console.error('거래 정보 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 주문 번호로 거래 정보를 조회합니다.
 * @param vendorId 가맹점 ID
 * @param orderNumber 주문 번호
 * @returns 거래 정보
 */
export async function getTransactionByOrderNumber(vendorId: string, orderNumber: string): Promise<Transaction | null> {
  try {
    // 저장 프로시저 실행
    const result = await executeProcedure('sp_GetTransactionByOrderNumber', {
      vendorId,
      orderNumber
    });
    
    // 결과가 없는 경우
    if (!result || result.length === 0 || !result[0] || result[0].length === 0) {
      return null;
    }
    
    // 거래 정보
    return result[0][0];
  } catch (error) {
    console.error('거래 정보 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 거래 목록을 조회합니다.
 * @param filter 필터 조건
 * @returns 거래 목록 및 총 개수
 */
export async function getTransactions(filter: {
  vendorId?: string;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
}): Promise<{ transactions: Transaction[], total: number }> {
  try {
    const params = {
      vendorId: filter.vendorId || null,
      status: filter.status || null,
      paymentMethod: filter.paymentMethod || null,
      startDate: filter.startDate || null,
      endDate: filter.endDate || null,
      page: filter.page || 1,
      pageSize: filter.pageSize || 10
    };
    
    // 저장 프로시저 실행
    const results = await executeProcedure('sp_GetTransactions', params);
    
    // 결과가 없는 경우
    if (!results || results.length === 0) {
      return { transactions: [], total: 0 };
    }
    
    // 거래 목록
    const transactions = results[0] || [];
    
    // 총 개수
    const total = results[1] && results[1][0] ? results[1][0].TotalCount : 0;
    
    return { transactions, total };
  } catch (error) {
    console.error('거래 목록 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 결제를 완료합니다.
 * @param transactionId 거래 ID
 * @param paymentData 결제 완료 데이터
 * @returns 완료 성공 여부
 */
export async function completePayment(transactionId: string, paymentData: {
  paymentKey?: string;
  amount: number;
  metadata?: Record<string, any>;
}): Promise<boolean> {
  try {
    // 저장 프로시저 실행
    await executeProcedure('sp_CompletePayment', {
      transactionId,
      ...paymentData
    });
    
    return true;
  } catch (error) {
    console.error('결제 완료 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 결제를 취소합니다.
 * @param transactionId 거래 ID
 * @param cancelData 취소 데이터
 * @returns 취소 성공 여부
 */
export async function cancelPayment(transactionId: string, cancelData: {
  reason: string;
  refundAmount?: number;
  metadata?: Record<string, any>;
}): Promise<boolean> {
  try {
    // 저장 프로시저 실행
    await executeProcedure('sp_CancelPayment', {
      transactionId,
      ...cancelData
    });
    
    return true;
  } catch (error) {
    console.error('결제 취소 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 보류 중인 거래를 처리합니다.
 * @returns 처리된 거래 수
 */
export async function processPendingTransactions(): Promise<number> {
  try {
    // 저장 프로시저 실행
    const result = await executeProcedure('sp_ProcessPendingTransactions', {});
    
    // 처리된 거래 수
    return result[0][0].ProcessedCount;
  } catch (error) {
    console.error('보류 중인 거래 처리 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 거래 통계를 조회합니다.
 * @param filter 필터 조건
 * @returns 거래 통계
 */
export async function getTransactionStats(filter: {
  vendorId?: string;
  startDate?: Date;
  endDate?: Date;
}): Promise<{
  totalCount: number;
  totalAmount: number;
  completedCount: number;
  completedAmount: number;
  canceledCount: number;
  canceledAmount: number;
  pendingCount: number;
  pendingAmount: number;
  dailyStats: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
}> {
  try {
    const params = {
      vendorId: filter.vendorId || null,
      startDate: filter.startDate || new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: filter.endDate || new Date()
    };
    
    // 저장 프로시저 실행
    const results = await executeProcedure('sp_GetTransactionStats', params);
    
    // 결과가 없는 경우
    if (!results || results.length === 0) {
      return {
        totalCount: 0,
        totalAmount: 0,
        completedCount: 0,
        completedAmount: 0,
        canceledCount: 0,
        canceledAmount: 0,
        pendingCount: 0,
        pendingAmount: 0,
        dailyStats: []
      };
    }
    
    // 통계 요약
    const summary = results[0][0] || {
      totalCount: 0,
      totalAmount: 0,
      completedCount: 0,
      completedAmount: 0,
      canceledCount: 0,
      canceledAmount: 0,
      pendingCount: 0,
      pendingAmount: 0
    };
    
    // 일별 통계
    const dailyStats = results[1] || [];
    
    return {
      ...summary,
      dailyStats
    };
  } catch (error) {
    console.error('거래 통계 조회 중 오류 발생:', error);
    throw error;
  }
}
