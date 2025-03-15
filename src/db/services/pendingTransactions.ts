/**
 * 대기 거래 관련 데이터베이스 서비스
 * 대기 거래 추가, 조회, 상태 업데이트 등의 기능을 제공합니다.
 */
import { getPool } from '@/db';
import { PendingTransaction, TransactionStatus, TransactionType, PaymentMethod, CurrencyCode } from '@/types/transaction';
import { logTransactionStatusChange } from './transactionLogs';
import { IRecordSet, IResult } from 'mssql';

/**
 * 대기 거래를 추가합니다.
 * @param transaction 추가할 대기 거래 정보
 * @returns 추가된 대기 거래의 ID
 */
export async function addPendingTransaction(transaction: Omit<PendingTransaction, 'pendingId'>): Promise<string> {
  try {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('TransactionId', transaction.transactionId)
      .input('MerchantId', transaction.merchantId)
      .input('Amount', transaction.amount)
      .input('PaymentMethod', transaction.paymentMethod)
      .input('Type', transaction.type)
      .input('Currency', transaction.currency || 'KRW')
      .input('PendingReason', transaction.pendingReason || null)
      .input('Priority', transaction.priority || 'normal')
      .input('CustomerName', transaction.customer?.name || null)
      .input('CustomerEmail', transaction.customer?.email || null)
      .input('CustomerPhone', transaction.customer?.phone || null)
      .input('Description', transaction.description || null)
      .input('ExternalId', transaction.externalId || null)
      .input('EstimatedCompletionTime', transaction.estimatedCompletionTime || null)
      .execute('usp_AddPendingTransaction');
    
    return result.recordset[0].PendingId;
  } catch (error) {
    console.error('대기 거래 추가 중 오류 발생:', error);
    throw new Error('대기 거래를 추가하는 중 오류가 발생했습니다.');
  }
}

/**
 * 대기 거래 상태를 업데이트합니다.
 * @param transactionId 트랜잭션 ID
 * @param status 변경할 상태
 * @param reason 상태 변경 이유
 * @param performedBy 작업 수행자
 * @returns 영향받은 행 수
 */
export async function updatePendingTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  reason?: string,
  performedBy?: string
): Promise<number> {
  try {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('TransactionId', transactionId)
      .input('Status', status)
      .input('Reason', reason || null)
      .input('PerformedBy', performedBy || null)
      .execute('usp_UpdatePendingTransactionStatus');
    
    return result.recordset[0].AffectedRows;
  } catch (error) {
    console.error('대기 거래 상태 업데이트 중 오류 발생:', error);
    throw new Error('대기 거래 상태를 업데이트하는 중 오류가 발생했습니다.');
  }
}

/**
 * 대기 거래 목록을 조회합니다.
 * @param status 조회할 상태 (기본값: 'pending')
 * @param merchantId 가맹점 ID (선택 사항)
 * @param type 거래 유형 (선택 사항)
 * @param page 페이지 번호 (기본값: 1)
 * @param pageSize 페이지 크기 (기본값: 10)
 * @returns 대기 거래 목록 및 페이지네이션 정보
 */
export async function getPendingTransactions(
  status: TransactionStatus = 'pending',
  merchantId?: string,
  type?: TransactionType,
  page: number = 1,
  pageSize: number = 10
): Promise<{
  transactions: PendingTransaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
  };
}> {
  try {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('Status', status)
      .input('MerchantId', merchantId || null)
      .input('Type', type || null)
      .input('Page', page)
      .input('PageSize', pageSize)
      .execute('usp_GetPendingTransactions');
    
    // 결과가 배열인 경우 (recordsets)
    if (Array.isArray(result.recordsets) && result.recordsets.length > 0) {
      const totalCount = result.recordsets[0][0]?.TotalCount || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      const transactions = result.recordsets[1]?.map((record: any) => {
        return {
          transactionId: record.TransactionId,
          merchantId: record.MerchantId,
          amount: record.Amount,
          status: record.Status as TransactionStatus,
          paymentMethod: record.PaymentMethod as PaymentMethod,
          type: record.Type as TransactionType,
          currency: record.Currency as CurrencyCode,
          pendingSince: record.PendingSince,
          estimatedCompletionTime: record.EstimatedCompletionTime,
          pendingReason: record.PendingReason,
          priority: record.Priority,
          customer: {
            name: record.CustomerName,
            email: record.CustomerEmail,
            phone: record.CustomerPhone
          },
          description: record.Description,
          externalId: record.ExternalId,
          createdAt: record.CreatedAt,
          updatedAt: record.UpdatedAt
        } as PendingTransaction;
      }) || [];
      
      return {
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          pageSize,
          totalItems: totalCount
        }
      };
    } else {
      // 결과가 객체인 경우 (recordset)
      const totalCount = 0;
      return {
        transactions: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          pageSize,
          totalItems: totalCount
        }
      };
    }
  } catch (error) {
    console.error('대기 거래 목록 조회 중 오류 발생:', error);
    return {
      transactions: [],
      pagination: {
        currentPage: page,
        totalPages: 0,
        pageSize,
        totalItems: 0
      }
    };
  }
}

/**
 * 특정 트랜잭션 ID의 대기 거래를 조회합니다.
 * @param transactionId 트랜잭션 ID
 * @returns 대기 거래 정보 또는 null
 */
export async function getPendingTransactionById(transactionId: string): Promise<PendingTransaction | null> {
  try {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('TransactionId', transactionId)
      .query(`
        SELECT * FROM [dbo].[PendingTransactions]
        WHERE [TransactionId] = @TransactionId
      `);
    
    if (result.recordset.length === 0) {
      return null;
    }
    
    const record = result.recordset[0];
    
    return {
      transactionId: record.TransactionId,
      merchantId: record.MerchantId,
      amount: record.Amount,
      status: record.Status as TransactionStatus,
      paymentMethod: record.PaymentMethod as PaymentMethod,
      type: record.Type as TransactionType,
      currency: record.Currency as CurrencyCode,
      pendingSince: record.PendingSince,
      estimatedCompletionTime: record.EstimatedCompletionTime,
      pendingReason: record.PendingReason,
      priority: record.Priority,
      customer: {
        name: record.CustomerName,
        email: record.CustomerEmail,
        phone: record.CustomerPhone
      },
      description: record.Description,
      externalId: record.ExternalId,
      createdAt: record.CreatedAt,
      updatedAt: record.UpdatedAt
    } as PendingTransaction;
  } catch (error) {
    console.error('대기 거래 조회 중 오류 발생:', error);
    return null;
  }
}
