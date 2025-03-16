import { NextRequest, NextResponse } from 'next/server';
import { createVendorService, getVendorListService } from '@/lib/api/vendor/service';
import { CreateVendorRequest, GetVendorListRequest } from '@/types/vendor';

/**
 * GET 요청 처리 - 거래처 목록 조회
 * @param request 요청 객체
 * @returns 거래처 목록 및 페이지네이션 정보
 */
export async function GET(request: NextRequest) {
  try {
    // URL 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const searchText = searchParams.get('searchText') || undefined;
    const status = searchParams.get('status') as any || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const sortColumn = searchParams.get('sortColumn') || 'vendorName';
    const sortDirection = (searchParams.get('sortDirection') || 'asc') as 'asc' | 'desc';

    // 요청 파라미터 구성
    const params: GetVendorListRequest = {
      searchText,
      status,
      page,
      limit,
      sortColumn,
      sortDirection
    };

    // 서비스 함수 호출
    const result = await getVendorListService(params);

    // 성공 응답 반환
    return NextResponse.json({
      status: 'success',
      data: result
    }, { status: 200 });
  } catch (error: any) {
    console.error('거래처 목록 조회 API 오류:', error);
    
    // 에러 응답 반환
    return NextResponse.json({
      status: 'error',
      message: error.message || '거래처 목록을 불러오는데 실패했습니다.'
    }, { status: 500 });
  }
}

/**
 * POST 요청 처리 - 새로운 거래처 생성
 * @param request 요청 객체
 * @returns 생성된 거래처 ID 및 성공 여부
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const data: CreateVendorRequest = await request.json();

    // 필수 필드 검증
    if (!data.vendorName || !data.businessNumber || !data.representativeName) {
      return NextResponse.json({
        status: 'error',
        message: '거래처명, 사업자번호, 대표자명은 필수 입력 항목입니다.'
      }, { status: 400 });
    }

    // 서비스 함수 호출
    const result = await createVendorService(data);

    // 성공 응답 반환
    return NextResponse.json({
      status: 'success',
      data: result
    }, { status: 201 });
  } catch (error: any) {
    console.error('거래처 생성 API 오류:', error);
    
    // 에러 응답 반환
    return NextResponse.json({
      status: 'error',
      message: error.message || '거래처 생성에 실패했습니다.'
    }, { status: 500 });
  }
}
