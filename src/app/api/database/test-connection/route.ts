import { NextRequest, NextResponse } from 'next/server';
import { checkConnection } from '@/db';

/**
 * GET: 데이터베이스 연결 테스트
 */
export async function GET(req: NextRequest) {
  try {
    // 데이터베이스 연결 상태 확인
    const isConnected = await checkConnection();
    
    if (isConnected) {
      return NextResponse.json({
        success: true,
        message: '데이터베이스 연결이 정상적으로 작동 중입니다.',
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '데이터베이스 연결에 실패했습니다.',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('데이터베이스 연결 테스트 중 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '데이터베이스 연결을 확인할 수 없습니다.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
