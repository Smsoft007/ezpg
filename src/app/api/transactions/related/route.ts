import { NextRequest, NextResponse } from 'next/server';
import { Transaction, TransactionStatus, TransactionType, PaymentMethod } from '@/types/transaction';

/**
 * 더미 관련 트랜잭션 생성 함수
 * @param transactionId 제외할 트랜잭션 ID
 * @param merchantId 가맹점 ID
 * @param customerId 고객 ID
 * @param count 생성할 트랜잭션 수
 * @returns 트랜잭션 배열
 */
function generateDummyRelatedTransactions(
  transactionId: string,
  merchantId?: string,
  customerId?: string,
  count: number = 5
): Transaction[] {
  // 기본 트랜잭션 데이터
  return Array.from({ length: count }, (_, i) => {
    const isDeposit = Math.random() > 0.5;
    const transactionType: TransactionType = isDeposit ? 'deposit' : 'withdrawal';
    
    // 상태 설정
    let transactionStatus: TransactionStatus;
    const statusRandom = Math.random();
    if (statusRandom > 0.7) {
      transactionStatus = statusRandom > 0.9 ? 'failed' : statusRandom > 0.8 ? 'cancelled' : 'pending';
    } else {
      transactionStatus = 'completed';
    }
    
    // 결제 방법 설정
    const paymentMethods: PaymentMethod[] = ['card', 'bank', 'virtual', 'crypto', 'other'];
    const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    // 금액 설정 (10,000원 ~ 1,000,000원)
    const amount = Math.floor(Math.random() * 990000) + 10000;
    
    // 날짜 설정 (최근 30일 내)
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const relatedTransactionId = `TX${Date.now().toString().slice(-8)}${i}`;
    
    return {
      transactionId: relatedTransactionId,
      merchantId: merchantId || `M${Math.floor(Math.random() * 1000)}`,
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
        customerId: customerId || `C${Math.floor(Math.random() * 1000)}`,
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
}

/**
 * GET 요청 처리 - 관련 트랜잭션 조회
 */
export async function GET(request: NextRequest) {
  try {
    // URL 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transactionId');
    const merchantId = searchParams.get('merchantId');
    const customerId = searchParams.get('customerId');
    
    if (!transactionId) {
      return NextResponse.json(
        { error: '트랜잭션 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 실제 환경에서는 DB에서 관련 트랜잭션을 조회하는 코드로 대체
    // const transactions = await getRelatedTransactions(transactionId, merchantId, customerId);
    
    // 더미 관련 트랜잭션 데이터 생성
    const transactions = generateDummyRelatedTransactions(
      transactionId,
      merchantId || undefined,
      customerId || undefined,
      5
    );
    
    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('관련 트랜잭션 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '관련 트랜잭션을 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
