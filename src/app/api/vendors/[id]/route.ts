import { NextRequest, NextResponse } from 'next/server';
import { deleteVendorService, getVendorByIdService, updateVendorService } from '@/lib/api/vendor/service';
import { UpdateVendorRequest } from '@/types/vendor';

interface RouteParams {
  params: {
    id: string;
  };
}

/**
 * GET 요청 처리 - 특정 거래처 상세 정보 조회
 * @param request 요청 객체
 * @param params 라우트 파라미터
 * @returns 거래처 상세 정보
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // ID 검증
    if (!id) {
      return NextResponse.json({
        status: 'error',
        message: '거래처 ID가 필요합니다.'
      }, { status: 400 });
    }

    // 서비스 함수 호출
    const result = await getVendorByIdService(id);

    // 성공 응답 반환
    return NextResponse.json({
      status: 'success',
      data: result
    }, { status: 200 });
  } catch (error: any) {
    console.error('거래처 상세 정보 조회 API 오류:', error);
    
    // 에러 응답 반환
    return NextResponse.json({
      status: 'error',
      message: error.message || '거래처 정보를 불러오는데 실패했습니다.'
    }, { status: 500 });
  }
}

/**
 * PUT 요청 처리 - 거래처 정보 수정
 * @param request 요청 객체
 * @param params 라우트 파라미터
 * @returns 수정된 거래처 ID 및 성공 여부
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    
    // 요청 본문 파싱
    const data: Omit<UpdateVendorRequest, 'id'> = await request.json();

    // ID 검증
    if (!id) {
      return NextResponse.json({
        status: 'error',
        message: '거래처 ID가 필요합니다.'
      }, { status: 400 });
    }

    // 필수 필드 검증
    if (!data.vendorName || !data.businessNumber || !data.representativeName) {
      return NextResponse.json({
        status: 'error',
        message: '거래처명, 사업자번호, 대표자명은 필수 입력 항목입니다.'
      }, { status: 400 });
    }

    // 서비스 함수 호출
    const result = await updateVendorService({
      ...data,
      id
    });

    // 성공 응답 반환
    return NextResponse.json({
      status: 'success',
      data: result
    }, { status: 200 });
  } catch (error: any) {
    console.error('거래처 정보 수정 API 오류:', error);
    
    // 에러 응답 반환
    return NextResponse.json({
      status: 'error',
      message: error.message || '거래처 정보 수정에 실패했습니다.'
    }, { status: 500 });
  }
}

/**
 * DELETE 요청 처리 - 거래처 삭제
 * @param request 요청 객체
 * @param params 라우트 파라미터
 * @returns 삭제된 거래처 ID 및 성공 여부
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;

    // ID 검증
    if (!id) {
      return NextResponse.json({
        status: 'error',
        message: '거래처 ID가 필요합니다.'
      }, { status: 400 });
    }

    // 서비스 함수 호출
    const result = await deleteVendorService(id);

    // 성공 응답 반환
    return NextResponse.json({
      status: 'success',
      data: result
    }, { status: 200 });
  } catch (error: any) {
    console.error('거래처 삭제 API 오류:', error);
    
    // 에러 응답 반환
    return NextResponse.json({
      status: 'error',
      message: error.message || '거래처 삭제에 실패했습니다.'
    }, { status: 500 });
  }
}
