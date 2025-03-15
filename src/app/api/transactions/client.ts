import { TransactionFilter, TransactionResponse, TransactionDetailResponse, WithdrawalTransaction, DepositTransaction, TransactionLog, BatchOperation, BatchOperationItem, TransactionStats, TransactionSummary } from "@/types/transaction";

/**
 * 거래 목록을 가져오는 함수
 * @param type 거래 유형 (deposit, withdrawal, all)
 * @param filter 필터 조건
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @returns 거래 목록 응답
 */
export async function getTransactions(
  type: 'deposit' | 'withdrawal' | 'all',
  filter?: TransactionFilter,
  page: number = 1,
  pageSize: number = 10
): Promise<TransactionResponse> {
  try {
    // API 호출 URL 구성
    const url = new URL(`${window.location.origin}/api/transactions`);
    url.searchParams.append('type', type);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', pageSize.toString());

    // 필터 조건이 있으면 추가
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    // API 호출
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`거래 목록을 가져오는데 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('거래 목록 조회 중 오류 발생:', error);
    // 에러 발생 시 빈 응답 반환
    return {
      transactions: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        pageSize: pageSize,
        totalItems: 0,
      },
    };
  }
}

/**
 * 거래 상세 정보를 가져오는 함수
 * @param id 거래 ID
 * @returns 거래 상세 정보 응답
 */
export async function getTransactionDetail(id: string): Promise<TransactionDetailResponse> {
  try {
    const response = await fetch(`/api/transactions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`거래 상세 정보를 가져오는데 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('거래 상세 정보 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 입금 거래 목록을 가져오는 함수
 * @param filter 필터 조건
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @returns 입금 거래 목록 응답
 */
export async function getDepositTransactions(
  filter?: TransactionFilter,
  page: number = 1,
  pageSize: number = 10
): Promise<TransactionResponse> {
  return getTransactions('deposit', filter, page, pageSize);
}

/**
 * 출금 거래 목록을 가져오는 함수
 * @param filter 필터 조건
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @returns 출금 거래 목록 응답
 */
export async function getWithdrawalTransactions(
  filter?: TransactionFilter,
  page: number = 1,
  pageSize: number = 10
): Promise<TransactionResponse> {
  return getTransactions('withdrawal', filter, page, pageSize);
}

/**
 * 실패한 거래 목록을 가져오는 함수
 * @param filter 필터 조건
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @returns 실패한 거래 목록 응답
 */
export async function getFailedTransactions(
  filter?: TransactionFilter,
  page: number = 1,
  pageSize: number = 10
): Promise<TransactionResponse> {
  const failedFilter: TransactionFilter = {
    ...filter,
    status: 'failed',
  };
  return getTransactions('all', failedFilter, page, pageSize);
}

/**
 * 대기 중인 거래 목록을 가져오는 함수
 * @param filter 필터 조건
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @returns 대기 중인 거래 목록 응답
 */
export async function getPendingTransactions(
  filter?: TransactionFilter,
  page: number = 1,
  pageSize: number = 10
): Promise<TransactionResponse> {
  try {
    // API 호출 URL 구성
    const url = new URL(`${window.location.origin}/api/transactions`);
    url.searchParams.append('type', 'all');
    url.searchParams.append('status', 'pending');
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', pageSize.toString());

    // 필터 조건이 있으면 추가
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.append(key, value.toString());
        }
      });
    }

    // API 호출
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`대기 중인 거래 목록을 가져오는데 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('대기 중인 거래 목록 조회 중 오류 발생:', error);
    // 에러 발생 시 빈 응답 반환
    return {
      transactions: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        pageSize: pageSize,
        totalItems: 0,
      },
    };
  }
}

/**
 * 거래 상태를 업데이트하는 함수
 * @param id 거래 ID
 * @param status 새로운 상태
 * @returns 업데이트된 거래 정보
 */
export async function updateTransactionStatus(
  id: string,
  status: 'completed' | 'failed' | 'cancelled'
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`/api/transactions/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`거래 상태 업데이트에 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('거래 상태 업데이트 중 오류 발생:', error);
    return {
      success: false,
      message: `오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
    };
  }
}

/**
 * 거래를 재시도하는 함수
 * @param id 거래 ID
 * @returns 재시도 결과
 */
export async function retryTransaction(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    // API 호출
    const response = await fetch(`/api/transactions/${id}/retry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`거래 재시도에 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('거래 재시도 중 오류 발생:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 거래를 취소하는 함수
 * @param id 거래 ID
 * @returns 취소 결과
 */
export async function cancelTransaction(
  id: string
): Promise<{ success: boolean; message: string }> {
  try {
    // API 호출
    const response = await fetch(`/api/transactions/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`거래 취소에 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('거래 취소 중 오류 발생:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 특정 출금 거래의 상세 정보를 가져오는 함수
 * @param id 출금 거래 ID
 * @returns 출금 거래 상세 정보
 */
export async function getWithdrawalTransactionById(id: string): Promise<WithdrawalTransaction> {
  try {
    // API 호출
    const response = await fetch(`/api/transactions/withdrawal/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`출금 거래 상세 정보를 가져오는데 실패했습니다: ${response.status}`);
    }

    const data = await response.json();
    return data.transaction;
  } catch (error) {
    console.error('출금 거래 상세 정보 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 특정 입금 거래의 상세 정보를 가져오는 함수
 * @param id 입금 거래 ID
 * @returns 입금 거래 상세 정보
 */
export async function getDepositTransactionById(id: string): Promise<DepositTransaction> {
  try {
    // API 호출
    const response = await fetch(`/api/transactions/deposit/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`입금 거래 상세 정보를 가져오는데 실패했습니다: ${response.status}`);
    }

    const data = await response.json();
    return data.transaction;
  } catch (error) {
    console.error('입금 거래 상세 정보 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 특정 트랜잭션의 로그를 가져오는 함수
 * @param transactionId 트랜잭션 ID
 * @returns 트랜잭션 로그 배열
 */
export async function getTransactionLogs(transactionId: string): Promise<TransactionLog[]> {
  try {
    // API 호출 URL 구성
    const url = new URL(`${window.location.origin}/api/transactions`);
    url.searchParams.append('transactionId', transactionId);
    url.searchParams.append('logsOnly', 'true');

    // API 호출
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`트랜잭션 로그를 가져오는데 실패했습니다: ${response.status}`);
    }

    const data = await response.json();
    return data.logs || [];
  } catch (error) {
    console.error('트랜잭션 로그 조회 중 오류 발생:', error);
    return [];
  }
}

/**
 * 입금 처리 함수
 * @param depositData 입금 데이터
 * @returns 처리 결과
 */
export async function processDeposit(depositData: {
  merchantId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  depositor?: string;
  accountNumber?: string;
  description?: string;
  externalId?: string;
}): Promise<{ success: boolean; message: string; transactionId?: string }> {
  try {
    // API 호출
    const response = await fetch('/api/transactions/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(depositData),
    });

    if (!response.ok) {
      throw new Error(`입금 처리에 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('입금 처리 중 오류 발생:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 출금 요청 함수
 * @param withdrawalData 출금 데이터
 * @returns 처리 결과
 */
export async function requestWithdrawal(withdrawalData: {
  merchantId: string;
  amount: number;
  currency?: string;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  description?: string;
  withdrawalMethod?: string;
}): Promise<{ success: boolean; message: string; transactionId?: string }> {
  try {
    // API 호출
    const response = await fetch('/api/transactions/withdrawal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(withdrawalData),
    });

    if (!response.ok) {
      throw new Error(`출금 요청에 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('출금 요청 중 오류 발생:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 출금 승인 함수
 * @param transactionId 거래 ID
 * @returns 처리 결과
 */
export async function approveWithdrawal(
  transactionId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // API 호출
    const response = await fetch(`/api/transactions/withdrawal/${transactionId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`출금 승인에 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('출금 승인 중 오류 발생:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 출금 거부 함수
 * @param transactionId 거래 ID
 * @param reason 거부 사유
 * @returns 처리 결과
 */
export async function rejectWithdrawal(
  transactionId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  try {
    // API 호출
    const response = await fetch(`/api/transactions/withdrawal/${transactionId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`출금 거부에 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('출금 거부 중 오류 발생:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 거래 통계를 가져오는 함수
 * @param merchantId 상점 ID (선택적)
 * @param dateFrom 시작 날짜 (선택적)
 * @param dateTo 종료 날짜 (선택적)
 * @returns 거래 통계
 */
export async function getTransactionStats(
  merchantId?: string,
  dateFrom?: string,
  dateTo?: string
): Promise<TransactionStats> {
  try {
    // URL 파라미터 구성
    const params = new URLSearchParams();
    if (merchantId) params.append('merchantId', merchantId);
    if (dateFrom) params.append('dateFrom', dateFrom);
    if (dateTo) params.append('dateTo', dateTo);

    // API 호출
    const response = await fetch(`/api/transactions/stats?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`거래 통계를 가져오는데 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('거래 통계 조회 중 오류 발생:', error);
    // 기본 통계 반환
    return {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalAmount: 0,
      successRate: 0,
      depositCount: 0,
      withdrawalCount: 0,
      failedCount: 0,
      pendingCount: 0,
      dailyTransactions: [],
    };
  }
}

/**
 * 거래 요약을 가져오는 함수
 * @param merchantId 상점 ID (선택적)
 * @returns 거래 요약
 */
export async function getTransactionSummary(merchantId?: string): Promise<TransactionSummary> {
  try {
    // URL 파라미터 구성
    const params = new URLSearchParams();
    if (merchantId) params.append('merchantId', merchantId);

    // API 호출
    const response = await fetch(`/api/transactions/summary?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`거래 요약을 가져오는데 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('거래 요약 조회 중 오류 발생:', error);
    // 기본 요약 반환
    return {
      today: { count: 0, amount: 0 },
      thisWeek: { count: 0, amount: 0 },
      thisMonth: { count: 0, amount: 0 },
      total: { count: 0, amount: 0 },
    };
  }
}

/**
 * 일괄 작업 목록을 가져오는 함수
 * @param type 일괄 작업 유형 (선택적)
 * @param status 일괄 작업 상태 (선택적)
 * @param page 페이지 번호
 * @param pageSize 페이지 크기
 * @returns 일괄 작업 목록
 */
export async function getBatchOperations(
  type?: 'deposit' | 'withdrawal' | 'status_update' | 'refund',
  status?: 'pending' | 'processing' | 'completed' | 'failed',
  page: number = 1,
  pageSize: number = 10
): Promise<{ operations: BatchOperation[]; pagination: { currentPage: number; totalPages: number; pageSize: number; totalItems: number } }> {
  try {
    // URL 파라미터 구성
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (type) params.append('type', type);
    if (status) params.append('status', status);

    // API 호출
    const response = await fetch(`/api/batch-operations?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`일괄 작업 목록을 가져오는데 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('일괄 작업 목록 조회 중 오류 발생:', error);
    // 빈 목록 반환
    return {
      operations: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        pageSize: pageSize,
        totalItems: 0,
      },
    };
  }
}

/**
 * 일괄 작업 상세 정보를 가져오는 함수
 * @param id 일괄 작업 ID
 * @returns 일괄 작업 상세 정보
 */
export async function getBatchOperationDetail(id: string): Promise<{ operation: BatchOperation; items: BatchOperationItem[] }> {
  try {
    // API 호출
    const response = await fetch(`/api/batch-operations/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`일괄 작업 상세 정보를 가져오는데 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('일괄 작업 상세 정보 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 일괄 작업을 생성하는 함수
 * @param type 일괄 작업 유형
 * @param data 일괄 작업 데이터
 * @returns 생성 결과
 */
export async function createBatchOperation(
  type: 'deposit' | 'withdrawal' | 'status_update' | 'refund',
  data: any[]
): Promise<{ success: boolean; message: string; batchId?: string }> {
  try {
    // API 호출
    const response = await fetch('/api/batch-operations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    });

    if (!response.ok) {
      throw new Error(`일괄 작업 생성에 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('일괄 작업 생성 중 오류 발생:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}

/**
 * 일괄 작업을 취소하는 함수
 * @param id 일괄 작업 ID
 * @returns 취소 결과
 */
export async function cancelBatchOperation(id: string): Promise<{ success: boolean; message: string }> {
  try {
    // API 호출
    const response = await fetch(`/api/batch-operations/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`일괄 작업 취소에 실패했습니다: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('일괄 작업 취소 중 오류 발생:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
    };
  }
}
