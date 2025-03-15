import { NextRequest, NextResponse } from 'next/server';
import { generateDummyData, generateAllDummyData } from '@/db/dummy';

/**
 * POST: 더미 데이터 생성
 * 
 * 요청 본문 예시:
 * {
 *   "type": "merchants", // 생성할 데이터 타입 (merchants, users, transactions, settlements, payments)
 *   "count": 10 // 생성할 데이터 수
 * }
 * 
 * 또는 모든 타입의 더미 데이터를 생성하려면:
 * {
 *   "type": "all",
 *   "count": 10 // 각 타입별 생성할 데이터 수
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, count = 10 } = body;
    
    if (!type) {
      return NextResponse.json({
        success: false,
        message: '데이터 타입을 지정해주세요.',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    if (typeof count !== 'number' || count <= 0 || count > 100) {
      return NextResponse.json({
        success: false,
        message: '유효한 데이터 수를 지정해주세요. (1-100)',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // 모든 타입의 더미 데이터 생성
    if (type === 'all') {
      await generateAllDummyData(count);
      return NextResponse.json({
        success: true,
        message: `모든 타입의 더미 데이터 ${count}개씩 생성이 완료되었습니다.`,
        timestamp: new Date().toISOString()
      });
    }
    
    // 특정 타입의 더미 데이터 생성
    const validTypes = ['merchants', 'users', 'transactions', 'settlements', 'payments'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({
        success: false,
        message: `유효하지 않은 데이터 타입입니다. 다음 중 하나를 사용하세요: ${validTypes.join(', ')} 또는 'all'`,
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    await generateDummyData(type, count);
    
    return NextResponse.json({
      success: true,
      message: `${type} 더미 데이터 ${count}개 생성이 완료되었습니다.`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('더미 데이터 생성 중 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '더미 데이터를 생성할 수 없습니다.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
