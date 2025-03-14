/**
 * 가맹점 상태 변경 API 라우트
 * 가맹점의 상태를 변경하는 기능 제공
 */
import { NextRequest, NextResponse } from 'next/server';
import { updateMerchantStatus } from '@/db/merchants';
import { z } from 'zod';

// 가맹점 상태 변경 스키마
const statusUpdateSchema = z.object({
  status: z.enum(["active", "inactive", "pending"], {
    errorMap: () => ({ message: "상태는 'active', 'inactive', 'pending' 중 하나여야 합니다." })
  })
});

/**
 * PATCH 요청 처리 - 가맹점 상태 변경
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: '유효하지 않은 가맹점 ID입니다.' 
        },
        { status: 400 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();

    // 데이터 유효성 검증
    const validationResult = statusUpdateSchema.safeParse(body);
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

    // 가맹점 상태 변경
    await updateMerchantStatus(id, validationResult.data.status);

    return NextResponse.json({
      status: 'success',
      message: `가맹점 상태가 '${validationResult.data.status}'로 변경되었습니다.`
    });
  } catch (error: any) {
    console.error('가맹점 상태 변경 중 오류가 발생했습니다:', error);
    
    // 가맹점을 찾을 수 없는 경우
    if (error.message === '가맹점을 찾을 수 없습니다.') {
      return NextResponse.json(
        { 
          status: 'error', 
          message: '해당 ID의 가맹점을 찾을 수 없습니다.' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        status: 'error', 
        message: '가맹점 상태를 변경하는 중 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
