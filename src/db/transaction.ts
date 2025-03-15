/**
 * 거래 관련 데이터베이스 작업을 처리하는 유틸리티 함수
 */
import { executeProcedure } from '@/db';
import {
  Transaction,
  DepositTransaction,
  WithdrawalTransaction,
  TransactionLog,
  TransactionStats,
  TransactionSummary,
  BatchOperation
} from '@/types/transaction';

/**
 * 입금 거래를 생성합니다.
 * @param params 입금 거래 생성에 필요한 파라미터
 */
export async function createDepositTransaction(params: {
  TransactionId: string;
  MerchantId: string;
  Amount: number;
  Currency?: string;
  PaymentMethod: string;
  Depositor?: string;
  AccountNumber?: string;
  VirtualAccountId?: string;
  CustomerName?: string;
  CustomerEmail?: string;
  CustomerPhone?: string;
  Description?: string;
  ExternalId?: string;
  DepositMethod?: string;
  ReceiptUrl?: string;
}): Promise<DepositTransaction> {
  try {
    const result = await executeProcedure<DepositTransaction>('sp_CreateDepositTransaction', params);
    return result[0];
  } catch (error) {
    console.error('입금 거래 생성 중 오류:', error);
    throw error;
  }
}

/**
 * 입금 거래를 ID로 조회합니다.
 * @param transactionId 조회할 거래 ID
 */
export async function getDepositTransactionById(transactionId: string): Promise<DepositTransaction> {
  try {
    const result = await executeProcedure<DepositTransaction>('sp_GetDepositTransactionById', {
      TransactionId: transactionId
    });
    return result[0];
  } catch (error) {
    console.error('입금 거래 조회 중 오류:', error);
    throw error;
  }
}

/**
 * 입금 거래 목록을 조회합니다.
 * @param params 조회 조건
 */
export async function getDepositTransactions(params: {
  MerchantId?: string;
  Status?: string;
  PaymentMethod?: string;
  MinAmount?: number;
  MaxAmount?: number;
  DateFrom?: Date;
  DateTo?: Date;
  Search?: string;
  Page?: number;
  PageSize?: number;
}): Promise<{
  items: DepositTransaction[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}> {
  try {
    const result = await executeProcedure<DepositTransaction & {
      TotalItems: number;
      TotalPages: number;
      CurrentPage: number;
      PageSize: number;
    }>('sp_GetDepositTransactions', {
      MerchantId: params.MerchantId,
      Status: params.Status,
      PaymentMethod: params.PaymentMethod,
      MinAmount: params.MinAmount,
      MaxAmount: params.MaxAmount,
      DateFrom: params.DateFrom,
      DateTo: params.DateTo,
      Search: params.Search,
      Page: params.Page || 1,
      PageSize: params.PageSize || 10
    });

    if (result.length === 0) {
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: params.Page || 1,
        pageSize: params.PageSize || 10
      };
    }

    return {
      items: result,
      totalItems: result[0].TotalItems,
      totalPages: result[0].TotalPages,
      currentPage: result[0].CurrentPage,
      pageSize: result[0].PageSize
    };
  } catch (error) {
    console.error('입금 거래 목록 조회 중 오류:', error);
    throw error;
  }
}

/**
 * 출금 거래를 생성합니다.
 * @param params 출금 거래 생성에 필요한 파라미터
 */
export async function createWithdrawalTransaction(params: {
  TransactionId: string;
  MerchantId: string;
  Amount: number;
  Currency?: string;
  PaymentMethod?: string;
  BankCode: string;
  AccountNumber: string;
  AccountHolder: string;
  WithdrawalFee?: number;
  CustomerName?: string;
  CustomerEmail?: string;
  CustomerPhone?: string;
  Description?: string;
  ExternalId?: string;
  WithdrawalMethod?: string;
  WithdrawalReference?: string;
}): Promise<WithdrawalTransaction> {
  try {
    const result = await executeProcedure<WithdrawalTransaction>('sp_CreateWithdrawalTransaction', params);
    return result[0];
  } catch (error) {
    console.error('출금 거래 생성 중 오류:', error);
    throw error;
  }
}

/**
 * 출금 거래를 ID로 조회합니다.
 * @param transactionId 조회할 거래 ID
 */
export async function getWithdrawalTransactionById(transactionId: string): Promise<WithdrawalTransaction> {
  try {
    const result = await executeProcedure<WithdrawalTransaction>('sp_GetWithdrawalTransactionById', {
      TransactionId: transactionId
    });
    return result[0];
  } catch (error) {
    console.error('출금 거래 조회 중 오류:', error);
    throw error;
  }
}

/**
 * 출금 거래 목록을 조회합니다.
 * @param params 조회 조건
 */
export async function getWithdrawalTransactions(params: {
  MerchantId?: string;
  Status?: string;
  ApprovalStatus?: string;
  PaymentMethod?: string;
  MinAmount?: number;
  MaxAmount?: number;
  DateFrom?: Date;
  DateTo?: Date;
  Search?: string;
  BankCode?: string;
  Page?: number;
  PageSize?: number;
}): Promise<{
  items: WithdrawalTransaction[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}> {
  try {
    const result = await executeProcedure<WithdrawalTransaction & {
      TotalItems: number;
      TotalPages: number;
      CurrentPage: number;
      PageSize: number;
    }>('sp_GetWithdrawalTransactions', {
      MerchantId: params.MerchantId,
      Status: params.Status,
      ApprovalStatus: params.ApprovalStatus,
      PaymentMethod: params.PaymentMethod,
      MinAmount: params.MinAmount,
      MaxAmount: params.MaxAmount,
      DateFrom: params.DateFrom,
      DateTo: params.DateTo,
      Search: params.Search,
      BankCode: params.BankCode,
      Page: params.Page || 1,
      PageSize: params.PageSize || 10
    });

    if (result.length === 0) {
      return {
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: params.Page || 1,
        pageSize: params.PageSize || 10
      };
    }

    return {
      items: result,
      totalItems: result[0].TotalItems,
      totalPages: result[0].TotalPages,
      currentPage: result[0].CurrentPage,
      pageSize: result[0].PageSize
    };
  } catch (error) {
    console.error('출금 거래 목록 조회 중 오류:', error);
    throw error;
  }
}

/**
 * 출금 거래를 승인합니다.
 * @param transactionId 승인할 거래 ID
 * @param approvedBy 승인자 ID
 */
export async function approveWithdrawalTransaction(
  transactionId: string,
  approvedBy: string
): Promise<{ result: string; message: string }> {
  try {
    const result = await executeProcedure<{ Result: string; Message: string }>('sp_ApproveWithdrawalTransaction', {
      TransactionId: transactionId,
      ApprovedBy: approvedBy
    });
    return {
      result: result[0].Result,
      message: result[0].Message
    };
  } catch (error) {
    console.error('출금 거래 승인 중 오류:', error);
    throw error;
  }
}

/**
 * 출금 거래를 거부합니다.
 * @param transactionId 거부할 거래 ID
 * @param rejectedBy 거부자 ID
 * @param rejectReason 거부 사유
 */
export async function rejectWithdrawalTransaction(
  transactionId: string,
  rejectedBy: string,
  rejectReason: string
): Promise<{ result: string; message: string }> {
  try {
    const result = await executeProcedure<{ Result: string; Message: string }>('sp_RejectWithdrawalTransaction', {
      TransactionId: transactionId,
      RejectedBy: rejectedBy,
      RejectReason: rejectReason
    });
    return {
      result: result[0].Result,
      message: result[0].Message
    };
  } catch (error) {
    console.error('출금 거래 거부 중 오류:', error);
    throw error;
  }
}

/**
 * 거래 상태를 업데이트합니다.
 * @param transactionId 업데이트할 거래 ID
 * @param status 새 상태
 * @param performedBy 수행자 ID
 * @param failureReason 실패 사유 (실패 상태인 경우)
 * @param failureCode 실패 코드 (실패 상태인 경우)
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: string,
  performedBy?: string,
  failureReason?: string,
  failureCode?: string
): Promise<{ result: string; message: string }> {
  try {
    const result = await executeProcedure<{ Result: string; Message: string }>('sp_UpdateTransactionStatus', {
      TransactionId: transactionId,
      Status: status,
      PerformedBy: performedBy,
      FailureReason: failureReason,
      FailureCode: failureCode
    });
    return {
      result: result[0].Result,
      message: result[0].Message
    };
  } catch (error) {
    console.error('거래 상태 업데이트 중 오류:', error);
    throw error;
  }
}

/**
 * 거래를 취소합니다.
 * @param transactionId 취소할 거래 ID
 * @param performedBy 수행자 ID
 * @param cancelReason 취소 사유
 */
export async function cancelTransaction(
  transactionId: string,
  performedBy?: string,
  cancelReason?: string
): Promise<{ result: string; message: string }> {
  try {
    const result = await executeProcedure<{ Result: string; Message: string }>('sp_CancelTransaction', {
      TransactionId: transactionId,
      PerformedBy: performedBy,
      CancelReason: cancelReason
    });
    return {
      result: result[0].Result,
      message: result[0].Message
    };
  } catch (error) {
    console.error('거래 취소 중 오류:', error);
    throw error;
  }
}

/**
 * 거래를 재시도합니다.
 * @param transactionId 재시도할 거래 ID
 * @param performedBy 수행자 ID
 */
export async function retryTransaction(
  transactionId: string,
  performedBy?: string
): Promise<{ result: string; message: string }> {
  try {
    const result = await executeProcedure<{ Result: string; Message: string }>('sp_RetryTransaction', {
      TransactionId: transactionId,
      PerformedBy: performedBy
    });
    return {
      result: result[0].Result,
      message: result[0].Message
    };
  } catch (error) {
    console.error('거래 재시도 중 오류:', error);
    throw error;
  }
}

/**
 * 거래 로그를 조회합니다.
 * @param transactionId 조회할 거래 ID
 */
export async function getTransactionLogs(transactionId: string): Promise<TransactionLog[]> {
  try {
    return await executeProcedure<TransactionLog>('sp_GetTransactionLogs', {
      TransactionId: transactionId
    });
  } catch (error) {
    console.error('거래 로그 조회 중 오류:', error);
    throw error;
  }
}

/**
 * 거래 통계를 조회합니다.
 * @param params 조회 조건
 */
export async function getTransactionStats(params: {
  MerchantId?: string;
  DateFrom?: Date;
  DateTo?: Date;
}): Promise<{
  summary: TransactionStats;
  dailyStats: { Date: string; Count: number; Amount: number }[];
}> {
  try {
    const results = await executeProcedure('sp_GetTransactionStats', {
      MerchantId: params.MerchantId,
      DateFrom: params.DateFrom,
      DateTo: params.DateTo
    });
    
    // 첫 번째 결과 집합은 요약 통계
    const summary = results[0] as TransactionStats;
    
    // 두 번째 결과 집합은 일별 통계
    const dailyStats = results.length > 1 ? results.slice(1) as { Date: string; Count: number; Amount: number }[] : [];
    
    return { summary, dailyStats };
  } catch (error) {
    console.error('거래 통계 조회 중 오류:', error);
    throw error;
  }
}

/**
 * 거래 요약을 조회합니다.
 * @param merchantId 조회할 상점 ID
 */
export async function getTransactionSummary(merchantId?: string): Promise<{
  today: TransactionSummary;
  thisWeek: TransactionSummary;
  thisMonth: TransactionSummary;
  total: TransactionSummary;
}> {
  try {
    const results = await executeProcedure<TransactionSummary>('sp_GetTransactionSummary', {
      MerchantId: merchantId
    });
    
    return {
      today: results[0],
      thisWeek: results[1],
      thisMonth: results[2],
      total: results[3]
    };
  } catch (error) {
    console.error('거래 요약 조회 중 오류:', error);
    throw error;
  }
}

/**
 * 모든 거래 관련 함수를 내보냅니다.
 */
export const transactionDb = {
  createDepositTransaction,
  getDepositTransactionById,
  getDepositTransactions,
  createWithdrawalTransaction,
  getWithdrawalTransactionById,
  getWithdrawalTransactions,
  approveWithdrawalTransaction,
  rejectWithdrawalTransaction,
  updateTransactionStatus,
  cancelTransaction,
  retryTransaction,
  getTransactionLogs,
  getTransactionStats,
  getTransactionSummary
};
