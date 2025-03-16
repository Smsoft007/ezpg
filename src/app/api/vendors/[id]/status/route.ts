import { NextRequest, NextResponse } from 'next/server';
import { updateVendorStatusService } from '@/lib/api/vendor/service';
import { VendorStatus } from '@/types/vendor';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * PATCH 요청 처리 - 거래처 상태 변경
 * @param request 요청 객체
 * @param params 라우트 파라미터
 * @returns 변경된 거래처 ID 및 성공 여부
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // 요청 본문 파싱
    const data = await request.json();
    const status = data.status as VendorStatus;

    // ID 검증
    if (!id) {
      return NextResponse.json({
        status: 'error',
        message: '거래처 ID가 필요합니다.'
      }, { status: 400 });
    }

    // 상태 검증
    if (!status || !['active', 'inactive', 'pending'].includes(status)) {
      return NextResponse.json({
        status: 'error',
        message: '유효한 상태 값이 필요합니다. (active, inactive, pending)'
      }, { status: 400 });
    }

    // 서비스 함수 호출
    const result = await updateVendorStatusService({
      id,
      status
    });

    // 성공 응답 반환
    return NextResponse.json({
      status: 'success',
      data: result
    }, { status: 200 });
  } catch (error: any) {
    console.error('거래처 상태 변경 API 오류:', error);
    
    // 에러 응답 반환
    return NextResponse.json({
      status: 'error',
      message: error.message || '거래처 상태 변경에 실패했습니다.'
    }, { status: 500 });
  }
}
