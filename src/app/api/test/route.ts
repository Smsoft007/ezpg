/**
 * API 테스트 상태 관리 라우트
 * 각 API 엔드포인트의 테스트 상태를 추적하고 기록하는 기능 제공
 */
import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse, UpdateTestStatusRequest } from '@/lib/api-test/types';
import { getTestStatus, updateTestStatus } from '@/lib/api-test/service';

/**
 * GET 요청 처리 - 테스트 상태 조회
 */
export async function GET() {
  try {
    const testStatus = await getTestStatus();
    return NextResponse.json({
      status: 'success',
      data: testStatus
    } as ApiResponse<any>);
  } catch (error) {
    console.error('테스트 상태 조회 중 오류 발생:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: '테스트 상태를 조회하는 중 오류가 발생했습니다.'
      } as ApiResponse<any>,
      { status: 500 }
    );
  }
}

/**
 * POST 요청 처리 - 테스트 상태 업데이트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as UpdateTestStatusRequest;
    const { category, apiName, method, status, dbStatus } = body;

    if (!category || !apiName || !method || !status || !dbStatus) {
      return NextResponse.json(
        {
          status: 'error',
          message: '필수 필드가 누락되었습니다.'
        } as ApiResponse<any>,
        { status: 400 }
      );
    }

    const updatedTestStatus = await updateTestStatus(body);

    return NextResponse.json({
      status: 'success',
      message: '테스트 상태가 성공적으로 업데이트되었습니다.',
      data: updatedTestStatus
    } as ApiResponse<any>);
  } catch (error) {
    console.error('테스트 상태 업데이트 중 오류 발생:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: '테스트 상태를 업데이트하는 중 오류가 발생했습니다.'
      } as ApiResponse<any>,
      { status: 500 }
    );
  }
}
