/**
 * 트랜잭션 로그 관련 데이터베이스 서비스
 * 트랜잭션 로그 추가, 조회 등의 기능을 제공합니다.
 */
import { getPool } from '@/db';
import { TransactionLog, TransactionStatus } from '@/types/transaction';

/**
 * 트랜잭션 로그를 추가합니다.
 * @param log 추가할 트랜잭션 로그 정보
 * @returns 추가된 로그의 ID
 */
export async function addTransactionLog(log: Omit<TransactionLog, 'id'>): Promise<string> {
  try {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('TransactionId', log.transactionId)
      .input('Action', log.action)
      .input('Status', log.status)
      .input('Message', log.message)
      .input('PerformedBy', log.performedBy || null)
      .input('Details', log.details ? JSON.stringify(log.details) : null)
      .input('IpAddress', log.ipAddress || null)
      .input('UserAgent', log.userAgent || null)
      .execute('usp_AddTransactionLog');
    
    return result.recordset[0].LogId;
  } catch (error) {
    console.error('트랜잭션 로그 추가 중 오류 발생:', error);
    throw new Error('트랜잭션 로그를 추가하는 중 오류가 발생했습니다.');
  }
}

/**
 * 특정 트랜잭션의 로그를 조회합니다.
 * @param transactionId 트랜잭션 ID
 * @returns 트랜잭션 로그 배열
 */
export async function getTransactionLogs(transactionId: string): Promise<TransactionLog[]> {
  try {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('TransactionId', transactionId)
      .execute('usp_GetTransactionLogs');
    
    return result.recordset.map(record => ({
      id: record.id,
      transactionId: record.transactionId,
      action: record.action,
      status: record.status as TransactionStatus,
      message: record.message,
      timestamp: record.timestamp,
      performedBy: record.performedBy,
      details: record.details ? JSON.parse(record.details) : undefined,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent
    }));
  } catch (error) {
    console.error('트랜잭션 로그 조회 중 오류 발생:', error);
    return [];
  }
}

/**
 * 최근 트랜잭션 로그를 조회합니다.
 * @param count 조회할 로그 수
 * @returns 최근 트랜잭션 로그 배열
 */
export async function getRecentTransactionLogs(count: number = 100): Promise<TransactionLog[]> {
  try {
    const pool = await getPool();
    
    const result = await pool.request()
      .input('Count', count)
      .execute('usp_GetRecentTransactionLogs');
    
    return result.recordset.map(record => ({
      id: record.id,
      transactionId: record.transactionId,
      action: record.action,
      status: record.status as TransactionStatus,
      message: record.message,
      timestamp: record.timestamp,
      performedBy: record.performedBy,
      details: record.details ? JSON.parse(record.details) : undefined,
      ipAddress: record.ipAddress,
      userAgent: record.userAgent
    }));
  } catch (error) {
    console.error('최근 트랜잭션 로그 조회 중 오류 발생:', error);
    return [];
  }
}

/**
 * 트랜잭션 상태 변경 로그를 추가합니다.
 * @param transactionId 트랜잭션 ID
 * @param status 변경된 상태
 * @param message 상태 변경 메시지
 * @param performedBy 작업 수행자
 * @returns 추가된 로그의 ID
 */
export async function logTransactionStatusChange(
  transactionId: string,
  status: TransactionStatus,
  message: string,
  performedBy?: string
): Promise<string> {
  return addTransactionLog({
    transactionId,
    action: `STATUS_CHANGED_TO_${status.toUpperCase()}`,
    status,
    message,
    performedBy,
    timestamp: new Date().toISOString()
  });
}

/**
 * 트랜잭션 작업 로그를 추가합니다.
 * @param transactionId 트랜잭션 ID
 * @param action 수행된 작업
 * @param status 현재 상태
 * @param message 작업 메시지
 * @param details 추가 상세 정보
 * @param performedBy 작업 수행자
 * @returns 추가된 로그의 ID
 */
export async function logTransactionAction(
  transactionId: string,
  action: string,
  status: TransactionStatus,
  message: string,
  details?: Record<string, any>,
  performedBy?: string
): Promise<string> {
  return addTransactionLog({
    transactionId,
    action,
    status,
    message,
    performedBy,
    details,
    timestamp: new Date().toISOString()
  });
}
