/**
 * 가맹점 API 라우트
 * 가맹점 목록 조회 및 등록 기능 제공
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMerchants, createMerchant } from '@/db/merchants';
import { z } from 'zod';

// 가맹점 생성 스키마
const merchantCreateSchema = z.object({
  name: z.string().min(1, "가맹점 이름은 필수입니다."),
  businessNumber: z.string().min(1, "사업자 번호는 필수입니다."),
  representativeName: z.string().min(1, "대표자 이름은 필수입니다."),
  status: z.enum(["active", "inactive", "pending"]),
  email: z.string().email("유효한 이메일 주소를 입력해주세요."),
  phone: z.string().min(1, "연락처는 필수입니다."),
  zipCode: z.string().min(1, "우편번호는 필수입니다."),
  address1: z.string().min(1, "주소는 필수입니다."),
  address2: z.string().optional(),
  bank: z.string().min(1, "은행명은 필수입니다."),
  accountNumber: z.string().min(1, "계좌번호는 필수입니다."),
  accountHolder: z.string().min(1, "예금주는 필수입니다."),
  paymentFee: z.string().min(1, "결제 수수료는 필수입니다."),
  withdrawalFee: z.string().min(1, "출금 수수료는 필수입니다.")
});

/**
 * GET 요청 처리 - 가맹점 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // URL 쿼리 파라미터 추출
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get('name') || undefined;
    const businessNumber = searchParams.get('businessNumber') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    // 가맹점 목록 조회
    const result = await getMerchants({
      name,
      businessNumber,
      status,
      page,
      pageSize
    });

    return NextResponse.json({
      status: 'success',
      data: {
        merchants: result.merchants,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('가맹점 목록 조회 중 오류가 발생했습니다:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: '가맹점 목록을 조회하는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST 요청 처리 - 가맹점 등록
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문 파싱
    const body = await request.json();

    // 데이터 유효성 검증
    const validationResult = merchantCreateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: '유효하지 않은 데이터입니다.',
          errors: validationResult.error.errors 
        },
        { status: 400 }
      );
    }

    // 가맹점 등록
    const result = await createMerchant(validationResult.data);

    return NextResponse.json({
      status: 'success',
      data: {
        id: result.id,
        message: '가맹점이 성공적으로 등록되었습니다.'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('가맹점 등록 중 오류가 발생했습니다:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: '가맹점을 등록하는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
