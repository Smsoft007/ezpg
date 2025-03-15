import { NextRequest, NextResponse } from 'next/server';
import { TransactionLog } from '@/types/transaction';

/**
 * 더미 트랜잭션 로그 생성 함수
 * @param transactionId 트랜잭션 ID
 * @param count 생성할 로그 수
 * @returns 트랜잭션 로그 배열
 */
function generateDummyTransactionLogs(transactionId: string, count: number = 5): TransactionLog[] {
  const actions = ['CREATED', 'STATUS_CHANGED', 'PAYMENT_ATTEMPTED', 'APPROVED', 'REJECTED', 'COMPLETED', 'FAILED', 'CANCELLED'];
  const statuses = ['pending', 'completed', 'failed', 'cancelled'];
  
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

/**
 * GET 요청 처리 - 트랜잭션 로그 조회
 */
export async function GET(request: NextRequest) {
  try {
    // URL 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const transactionId = searchParams.get('transactionId');
    
    if (!transactionId) {
      return NextResponse.json(
        { error: '트랜잭션 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 실제 환경에서는 DB에서 로그를 조회하는 코드로 대체
    // const logs = await getTransactionLogs(transactionId);
    
    // 더미 로그 데이터 생성
    const logs = generateDummyTransactionLogs(transactionId, 8);
    
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('트랜잭션 로그 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '트랜잭션 로그를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
