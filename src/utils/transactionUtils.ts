/**
 * 트랜잭션 관련 유틸리티 함수
 * 트랜잭션 로그 및 대기 거래 처리를 위한 유틸리티 함수를 제공합니다.
 */
import { TransactionLog, Transaction, TransactionStatus, PendingTransaction } from '@/types/transaction';
import { addTransactionLog, logTransactionStatusChange } from '@/db/services/transactionLogs';
import { addPendingTransaction, updatePendingTransactionStatus } from '@/db/services/pendingTransactions';
import { Icons } from '@/components/ui/icons';
import React from 'react';

/**
 * 트랜잭션 ID를 생성합니다.
 * @param prefix 트랜잭션 ID 접두사 (기본값: 'TX')
 * @returns 생성된 트랜잭션 ID
 */
export function generateTransactionId(prefix: string = 'TX'): string {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}${timestamp.slice(-8)}${random}`;
}

/**
 * 트랜잭션 상태 변경을 로깅합니다.
 * @param transactionId 트랜잭션 ID
 * @param fromStatus 이전 상태
 * @param toStatus 변경된 상태
 * @param reason 상태 변경 이유
 * @param performedBy 작업 수행자
 * @returns 로그 ID
 */
export async function logTransactionStatusUpdate(
  transactionId: string,
  fromStatus: TransactionStatus,
  toStatus: TransactionStatus,
  reason: string,
  performedBy?: string
): Promise<string> {
  const message = `상태가 '${fromStatus}'에서 '${toStatus}'로 변경되었습니다. 이유: ${reason}`;
  
  return await logTransactionStatusChange(
    transactionId,
    toStatus,
    message,
    performedBy
  );
}

/**
 * 트랜잭션을 대기 상태로 설정합니다.
 * @param transaction 트랜잭션 정보
 * @param reason 대기 이유
 * @param estimatedCompletionTime 예상 완료 시간
 * @param priority 우선순위 (기본값: 'normal')
 * @returns 대기 트랜잭션 ID
 */
export async function setPendingTransaction(
  transaction: Transaction,
  reason: string,
  estimatedCompletionTime?: string,
  priority: 'high' | 'normal' | 'low' = 'normal'
): Promise<string> {
  // 대기 트랜잭션 추가
  const pendingId = await addPendingTransaction({
    ...transaction,
    status: 'pending',
    pendingSince: new Date().toISOString(),
    pendingReason: reason,
    estimatedCompletionTime,
    priority
  });
  
  // 상태 변경 로깅
  await logTransactionStatusChange(
    transaction.transactionId,
    'pending',
    `트랜잭션이 대기 상태로 설정되었습니다. 이유: ${reason}`,
    'system'
  );
  
  return pendingId;
}

/**
 * 대기 트랜잭션 상태를 업데이트합니다.
 * @param transactionId 트랜잭션 ID
 * @param status 변경할 상태
 * @param reason 상태 변경 이유
 * @param performedBy 작업 수행자
 * @returns 성공 여부
 */
export async function updatePendingTransaction(
  transactionId: string,
  status: TransactionStatus,
  reason: string,
  performedBy?: string
): Promise<boolean> {
  try {
    // 대기 트랜잭션 상태 업데이트
    const affectedRows = await updatePendingTransactionStatus(
      transactionId,
      status,
      reason,
      performedBy
    );
    
    // 상태 변경 로깅
    if (affectedRows > 0) {
      await logTransactionStatusChange(
        transactionId,
        status,
        `대기 트랜잭션 상태가 '${status}'로 변경되었습니다. 이유: ${reason}`,
        performedBy || 'system'
      );
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('대기 트랜잭션 상태 업데이트 중 오류 발생:', error);
    return false;
  }
}

/**
 * 트랜잭션 로그를 포맷팅합니다.
 * @param logs 트랜잭션 로그 배열
 * @returns 포맷팅된 로그 문자열
 */
export function formatTransactionLogs(logs: TransactionLog[]): string {
  if (!logs || logs.length === 0) {
    return '로그가 없습니다.';
  }
  
  return logs.map(log => {
    const date = new Date(log.timestamp).toLocaleString('ko-KR');
    return `[${date}] ${log.action} - ${log.status}: ${log.message} ${log.performedBy ? `(by ${log.performedBy})` : ''}`;
  }).join('\n');
}

/**
 * 트랜잭션 상태에 따른 배지 색상을 반환합니다.
 * @param status 트랜잭션 상태
 * @returns 배지 색상 클래스
 */
export function getStatusBadgeColor(status: TransactionStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'cancelled':
    case 'canceled':
      return 'bg-gray-100 text-gray-800';
    case 'refunded':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * 트랜잭션 우선순위에 따른 배지 색상을 반환합니다.
 * @param priority 우선순위
 * @returns 배지 색상 클래스
 */
export function getPriorityBadgeColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'normal':
      return 'bg-blue-100 text-blue-800';
    case 'low':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * 트랜잭션 타입에 따른 아이콘 이름을 반환합니다.
 * @param type 트랜잭션 타입
 * @returns 아이콘 이름
 */
export function getTransactionTypeIcon(type: string): string {
  switch (type) {
    case 'deposit':
      return 'arrowDownCircle';
    case 'withdrawal':
      return 'arrowUpCircle';
    case 'refund':
      return 'refreshCcw';
    case 'adjustment':
      return 'edit';
    case 'transfer':
      return 'repeat';
    default:
      return 'circle';
  }
}

/**
 * 트랜잭션 금액을 포맷팅합니다.
 * @param amount 금액
 * @param currency 통화 코드
 * @returns 포맷팅된 금액 문자열
 */
export function formatAmount(amount: number, currency: string = 'KRW'): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'KRW' ? 0 : 2
  }).format(amount);
}

/**
 * 트랜잭션 날짜를 포맷팅합니다.
 * @param dateString 날짜 문자열
 * @param format 포맷 (기본값: 'full')
 * @returns 포맷팅된 날짜 문자열
 */
export function formatTransactionDate(dateString: string, format: 'full' | 'date' | 'time' = 'full'): string {
  const date = new Date(dateString);
  
  switch (format) {
    case 'date':
      return date.toLocaleDateString('ko-KR');
    case 'time':
      return date.toLocaleTimeString('ko-KR');
    case 'full':
    default:
      return date.toLocaleString('ko-KR');
  }
}

/**
 * 날짜를 포맷팅합니다.
 * @param dateString 날짜 문자열
 * @param format 포맷 (기본값: 'full')
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(dateString: string, format: 'full' | 'date' | 'time' | 'short' = 'full'): string {
  if (format === 'short') {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
  return formatTransactionDate(dateString, format as 'full' | 'date' | 'time');
}
