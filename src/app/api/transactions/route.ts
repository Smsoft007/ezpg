import { TransactionFilter, TransactionResponse, TransactionStatus, TransactionType, PaymentMethod, TransactionLog, CurrencyCode } from '@/types/transaction';

// 더미 트랜잭션 데이터 생성 함수
function generateDummyTransactions(
  type: 'deposit' | 'withdrawal' | 'all',
  status?: TransactionStatus,
  page: number = 1,
  pageSize: number = 10
) {
  // 기본 트랜잭션 데이터
  const baseTransactions = Array.from({ length: 100 }, (_, i) => {
    const isDeposit = type === 'all' ? i % 2 === 0 : type === 'deposit';
    const transactionType: TransactionType = isDeposit ? 'deposit' : 'withdrawal';
    
    // 상태 설정
    let transactionStatus: TransactionStatus = 'completed';
    if (status) {
      transactionStatus = status;
    } else {
      // 랜덤 상태 생성 (대부분 completed, 일부는 pending, failed, cancelled)
      const statusRandom = Math.random();
      if (statusRandom > 0.7) {
        transactionStatus = statusRandom > 0.9 ? 'failed' : statusRandom > 0.8 ? 'cancelled' : 'pending';
      }
    }
    
    // 결제 방법 설정
    const paymentMethods: PaymentMethod[] = ['card', 'bank', 'virtual', 'crypto', 'other'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // 금액 설정 (10,000원 ~ 1,000,000원)
    const amount = Math.floor(Math.random() * 990000) + 10000;
    
    // 날짜 설정 (최근 30일 내)
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    return {
      transactionId: `TX${Date.now().toString().slice(-8)}${i}`,
      merchantId: `M${Math.floor(Math.random() * 1000)}`,
      merchant: {
        merchantName: `가맹점 ${Math.floor(Math.random() * 100)}`,
        businessNumber: `123-45-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        contactEmail: `merchant${Math.floor(Math.random() * 100)}@example.com`,
        contactPhone: `010-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      },
      amount,
      status: transactionStatus,
      type: transactionType,
      paymentMethod,
      currency: 'KRW' as CurrencyCode,
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      description: `${isDeposit ? '입금' : '출금'} 거래 #${i}`,
      metadata: {
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      customer: {
        customerId: `C${Math.floor(Math.random() * 1000)}`,
        name: `고객 ${Math.floor(Math.random() * 100)}`,
        email: `customer${Math.floor(Math.random() * 100)}@example.com`,
        phone: `010-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      }
    };
  });
  
  // 필터링된 트랜잭션
  let filteredTransactions = [...baseTransactions];
  
  // 페이지네이션 적용
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  
  return {
    transactions: paginatedTransactions,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filteredTransactions.length / pageSize),
      pageSize,
      totalItems: filteredTransactions.length,
    }
  };
}

// 더미 트랜잭션 로그 생성 함수
function generateDummyTransactionLogs(transactionId: string, count: number = 5): TransactionLog[] {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - i);
    
    const actions = ['created', 'updated', 'processed', 'completed', 'failed', 'cancelled'];
    const statuses: TransactionStatus[] = ['pending', 'completed', 'failed', 'cancelled'];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: `LOG${Date.now().toString().slice(-8)}${i}`,
      transactionId,
      action,
      status,
      message: `트랜잭션이 ${action} 상태로 ${status} 되었습니다.`,
      timestamp: date.toISOString(),
      performedBy: Math.random() > 0.5 ? 'system' : `user${Math.floor(Math.random() * 10)}`,
      details: {
        reason: `자동 ${action} 처리`,
        additionalInfo: `추가 정보 ${i}`
      }
    };
  });
}

export { generateDummyTransactions, generateDummyTransactionLogs };
