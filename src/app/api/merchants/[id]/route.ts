/**
 * 가맹점 상세 API 라우트
 * 특정 가맹점의 조회, 수정, 삭제 기능 제공
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMerchantById, updateMerchant, deleteMerchant, updateMerchantStatus } from '@/db/merchants';
import { z } from 'zod';

// 가맹점 수정 스키마
const merchantUpdateSchema = z.object({
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
  paymentFee: z.number().min(0, "결제 수수료는 0 이상이어야 합니다."),
  withdrawalFee: z.number().min(0, "출금 수수료는 0 이상이어야 합니다.")
});

// 가맹점 상태 변경 스키마
const merchantStatusSchema = z.object({
  status: z.enum(["active", "inactive", "pending"])
});

/**
 * GET 요청 처리 - 가맹점 상세 정보 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // params 처리 (비동기 처리 제거)
    const { id } = params;
    const merchantId = parseInt(id);
    
    if (isNaN(merchantId)) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: '유효하지 않은 가맹점 ID입니다.' 
        },
        { status: 400 }
      );
    }

    const merchant = await getMerchantById(merchantId);
    
    if (!merchant) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: '가맹점을 찾을 수 없습니다.' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      status: 'success', 
      data: merchant 
    });
  } catch (error) {
    console.error('가맹점 조회 오류:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: '가맹점 조회 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT 요청 처리 - 가맹점 정보 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // params 처리 (비동기 처리 제거)
    const { id } = params;
    const merchantId = parseInt(id);
    
    if (isNaN(merchantId)) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: '유효하지 않은 가맹점 ID입니다.' 
        },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // 데이터 유효성 검사
    const validationResult = merchantUpdateSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: '입력 데이터가 유효하지 않습니다.', 
          errors: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const updatedMerchant = await updateMerchant(merchantId, validationResult.data);
    
    return NextResponse.json({ 
      status: 'success', 
      data: updatedMerchant,
      message: '가맹점 정보가 성공적으로 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('가맹점 업데이트 오류:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: '가맹점 업데이트 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH 요청 처리 - 가맹점 상태 변경
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // params 처리 (비동기 처리 제거)
    const { id } = params;
    const merchantId = parseInt(id);
    
    if (isNaN(merchantId)) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: '유효하지 않은 가맹점 ID입니다.' 
        },
        { status: 400 }
      );
    }

    const data = await request.json();
    
    // 데이터 유효성 검사
    const validationResult = merchantStatusSchema.safeParse(data);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: '입력 데이터가 유효하지 않습니다.', 
          errors: validationResult.error.format() 
        },
        { status: 400 }
      );
    }

    const { status } = validationResult.data;
    const updatedMerchant = await updateMerchantStatus(merchantId, status);
    
    return NextResponse.json({ 
      status: 'success', 
      data: updatedMerchant,
      message: '가맹점 상태가 성공적으로 업데이트되었습니다.'
    });
  } catch (error) {
    console.error('가맹점 상태 업데이트 오류:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: '가맹점 상태 업데이트 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE 요청 처리 - 가맹점 삭제
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // params 처리 (비동기 처리 제거)
    const { id } = params;
    const merchantId = parseInt(id);
    
    if (isNaN(merchantId)) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: '유효하지 않은 가맹점 ID입니다.' 
        },
        { status: 400 }
      );
    }

    await deleteMerchant(merchantId);
    
    return NextResponse.json({ 
      status: 'success', 
      message: '가맹점이 성공적으로 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('가맹점 삭제 오류:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: '가맹점 삭제 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
