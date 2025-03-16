/**
 * 데이터베이스 연결 테스트 API
 * 데이터베이스 연결 및 쿼리 기능을 테스트합니다.
 */
import { NextResponse } from 'next/server';
import { dbConfig, getConnection, executeQuery } from '@/db';

/**
 * GET 요청 처리
 * 데이터베이스 연결 테스트를 수행합니다.
 */
export async function GET() {
  try {
    // 데이터베이스 설정 정보 (비밀번호 제외)
    const configInfo = {
      server: dbConfig.server,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      // 비밀번호는 보안상 포함하지 않음
    };

    // 데이터베이스 연결 테스트
    const pool = await getConnection();
    
    // 간단한 쿼리 테스트
    const result = await executeQuery('SELECT @@VERSION AS Version');
    
    // 결과 반환
    return NextResponse.json({
      success: true,
      message: '데이터베이스 연결 테스트 성공',
      config: configInfo,
      version: result[0]?.Version || '알 수 없음'
    });
  } catch (error) {
    console.error('데이터베이스 테스트 API 오류:', error);
    
    return NextResponse.json({
      success: false,
      message: '데이터베이스 연결 테스트 실패',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
