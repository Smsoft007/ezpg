/**
 * 데이터베이스 쿼리 실행 API 라우트 핸들러
 */
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/db';
import { DatabaseQueryResponse } from '@/docs/api/database';

/**
 * POST 요청 핸들러 - 데이터베이스 쿼리 실행
 */
export async function POST(request: NextRequest) {
  try {
    const { query, parameters, maxRows = 1000 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { message: '쿼리 문자열이 필요합니다.' },
        { status: 400 }
      );
    }

    // 쿼리 실행 시작 시간
    const startTime = Date.now();

    // 쿼리 실행
    const result = await executeQuery(query, parameters || {});

    // 쿼리 실행 종료 시간
    const executionTime = Date.now() - startTime;

    // 결과 행 수 제한
    const limitedResult = result.slice(0, maxRows);

    // 결과가 비어있지 않은 경우 컬럼 이름 추출
    const columns = limitedResult.length > 0 
      ? Object.keys(limitedResult[0]) 
      : [];

    const response: DatabaseQueryResponse = {
      columns,
      rows: limitedResult,
      rowCount: result.length,
      executionTime
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('쿼리 실행 중 오류가 발생했습니다:', error);
    
    // 오류 메시지 추출
    const errorMessage = error instanceof Error 
      ? error.message 
      : '쿼리 실행 중 오류가 발생했습니다.';
    
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
