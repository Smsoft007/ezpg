import { NextRequest, NextResponse } from 'next/server';
import { TransactionFilter, TransactionResponse, TransactionStatus, TransactionType, PaymentMethod, TransactionLog, CurrencyCode } from '@/types/transaction';
import { getPendingTransactions } from '@/db/services/pendingTransactions';
import { getRecentTransactionLogs, getTransactionLogs } from '@/db/services/transactionLogs';

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
      paymentMethod,
      type: transactionType,
      currency: 'KRW',
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
      customer: {
        name: `고객 ${Math.floor(Math.random() * 100)}`,
        email: `customer${Math.floor(Math.random() * 100)}@example.com`,
        phone: `010-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      },
      description: `거래 설명 ${i}`,
      externalId: `EXT${Math.floor(Math.random() * 10000)}`,
      ...(transactionStatus === 'failed' && {
        failureReason: '결제 처리 중 오류가 발생했습니다.',
        failureCode: `ERR${Math.floor(Math.random() * 1000)}`,
      }),
      ...(transactionType === 'deposit' && {
        accountNumber: `${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`,
        depositor: `입금자 ${Math.floor(Math.random() * 100)}`,
        depositedAt: date.toISOString(),
      }),
      ...(transactionType === 'withdrawal' && {
        bankCode: `${Math.floor(Math.random() * 100).toString().padStart(3, '0')}`,
        accountNumber: `${Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0')}`,
        accountHolder: `예금주 ${Math.floor(Math.random() * 100)}`,
        withdrawalFee: Math.floor(Math.random() * 1000),
        approvalStatus: Math.random() > 0.3 ? 'approved' : Math.random() > 0.5 ? 'pending' : 'rejected',
      }),
    };
  });

  // 필터링된 트랜잭션
  let filteredTransactions = baseTransactions;
  
  // 트랜잭션 유형으로 필터링
  if (type !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.type === type);
  }
  
  // 상태로 필터링
  if (status) {
    filteredTransactions = filteredTransactions.filter(tx => tx.status === status);
  }
  
  // 페이지네이션 적용
  const totalItems = filteredTransactions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + pageSize);
  
  return {
    transactions: paginatedTransactions,
    pagination: {
      currentPage: page,
      totalPages,
      pageSize,
      totalItems,
    },
  };
}

// 더미 트랜잭션 로그 생성 함수
function generateDummyTransactionLogs(transactionId: string, count: number = 5): TransactionLog[] {
  const actions = ['CREATED', 'STATUS_CHANGED', 'PAYMENT_ATTEMPTED', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED', 'CANCELLED'];
  const statuses: TransactionStatus[] = ['pending', 'completed', 'failed', 'cancelled'];
  
  return Array.from({ length: count }, (_, i) => {
    const date = new Date();
    date.setHours(date.getHours() - i);
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id: `LOG${Date.now().toString().slice(-8)}${i}`,
      transactionId,
      action,
      status,
      message: `거래 ${action} 작업이 수행되었습니다.`,
      timestamp: date.toISOString(),
      performedBy: Math.random() > 0.5 ? '시스템' : `사용자 ${Math.floor(Math.random() * 10)}`,
      details: {
        reason: Math.random() > 0.7 ? '사용자 요청' : '자동 처리',
        additionalInfo: `추가 정보 ${i}`
      },
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    };
  });
}

// GET 요청 처리
export async function GET(request: NextRequest) {
  try {
    // URL 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const type = (searchParams.get('type') as 'deposit' | 'withdrawal' | 'all') || 'all';
    const statusParam = searchParams.get('status');
    const status = statusParam ? statusParam as TransactionStatus : undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const transactionId = searchParams.get('transactionId');
    const logsOnly = searchParams.get('logsOnly') === 'true';
    
    // 트랜잭션 로그만 요청한 경우
    if (logsOnly && transactionId) {
      try {
        // 실제 DB에서 로그 조회 시도
        const logs = await getTransactionLogs(transactionId);
        if (logs.length > 0) {
          return NextResponse.json({ logs });
        }
      } catch (error) {
        console.log('DB에서 로그 조회 실패, 더미 데이터 사용:', error);
      }
      
      // 더미 로그 데이터 반환
      const logs = generateDummyTransactionLogs(transactionId);
      return NextResponse.json({ logs });
    }
    
    // 필터 객체 생성
    const filter: TransactionFilter = {};
    
    // 필터 파라미터 추출
    if (searchParams.has('merchantId')) filter.merchantId = searchParams.get('merchantId') || undefined;
    if (searchParams.has('paymentMethod')) filter.paymentMethod = searchParams.get('paymentMethod') as PaymentMethod || undefined;
    if (searchParams.has('minAmount')) filter.minAmount = parseInt(searchParams.get('minAmount') || '0', 10);
    if (searchParams.has('maxAmount')) filter.maxAmount = parseInt(searchParams.get('maxAmount') || '0', 10);
    if (searchParams.has('dateFrom')) filter.dateFrom = searchParams.get('dateFrom') || undefined;
    if (searchParams.has('dateTo')) filter.dateTo = searchParams.get('dateTo') || undefined;
    if (searchParams.has('search')) filter.search = searchParams.get('search') || undefined;
    if (searchParams.has('bankCode')) filter.bankCode = searchParams.get('bankCode') || undefined;
    if (searchParams.has('customerName')) filter.customerName = searchParams.get('customerName') || undefined;
    if (searchParams.has('externalId')) filter.externalId = searchParams.get('externalId') || undefined;
    
    // 대기 거래인 경우 실제 DB에서 조회 시도
    if (status === 'pending') {
      try {
        const pendingResult = await getPendingTransactions(
          'pending',
          filter.merchantId,
          type !== 'all' ? type as TransactionType : undefined,
          page,
          pageSize
        );
        
        if (pendingResult.transactions.length > 0) {
          const response: TransactionResponse = {
            transactions: pendingResult.transactions,
            pagination: pendingResult.pagination,
            filter
          };
          
          return NextResponse.json(response);
        }
      } catch (error) {
        console.log('DB에서 대기 거래 조회 실패, 더미 데이터 사용:', error);
      }
    }
    
    // 더미 데이터 생성
    const dummyData = generateDummyTransactions(type, status, page, pageSize);
    
    // 더미 데이터의 currency 필드를 CurrencyCode 타입으로 변환
    const transactions = dummyData.transactions.map(tx => ({
      ...tx,
      currency: tx.currency as CurrencyCode
    }));
    
    const response: TransactionResponse = {
      transactions,
      pagination: dummyData.pagination,
      filter
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('트랜잭션 API 오류:', error);
    return NextResponse.json(
      { error: '트랜잭션 데이터를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
