/**
 * 가맹점 API 라우트
 * 가맹점 목록 조회 및 등록 기능 제공
 */
import { NextRequest, NextResponse } from 'next/server';
import { getMerchants, createMerchant, Merchant } from '@/db/merchants';
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
  paymentFee: z.string().min(1, "결제 수수료는 필수입니다.").transform(val => parseFloat(val)),
  withdrawalFee: z.string().min(1, "출금 수수료는 필수입니다.").transform(val => parseFloat(val))
});

/**
 * API 응답 헬퍼 함수
 */
function successResponse<T>(data: T) {
  return NextResponse.json({
    status: 'success',
    data
  });
}

function errorResponse(message: string, status = 400, code?: string, details?: any) {
  return NextResponse.json(
    {
      status: 'error',
      error: {
        message,
        code,
        details
      }
    },
    { status }
  );
}

/**
 * 샘플 가맹점 데이터 생성 함수
 */
function generateSampleMerchants(params: any) {
  const { name, businessNumber, status, page = 1, pageSize = 10 } = params;
  
  // 샘플 데이터 생성
  const sampleMerchants: Merchant[] = Array.from({ length: 15 }).map((_, index) => ({
    id: index + 1,
    name: `가맹점 ${index + 1}`,
    businessNumber: `123-45-6789${index}`,
    representativeName: `대표자 ${index + 1}`,
    status: index % 3 === 0 ? 'active' : (index % 3 === 1 ? 'inactive' : 'pending'),
    email: `merchant${index + 1}@example.com`,
    phone: `010-1234-${5678 + index}`,
    zipCode: '12345',
    address1: '서울시 강남구 테헤란로',
    address2: `${index + 1}층`,
    bank: '국민은행',
    accountNumber: `123-456-7890${index}`,
    accountHolder: `홍길동${index + 1}`,
    paymentFee: 3.5,
    withdrawalFee: 1.0,
    createdAt: new Date(2025, 0, index + 1).toISOString(),
    updatedAt: new Date().toISOString()
  }));
  
  // 필터링 로직
  let filteredMerchants = [...sampleMerchants];
  
  if (name) {
    filteredMerchants = filteredMerchants.filter(m => 
      m.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  
  if (businessNumber) {
    filteredMerchants = filteredMerchants.filter(m => 
      m.businessNumber.includes(businessNumber)
    );
  }
  
  if (status && status !== 'all') {
    filteredMerchants = filteredMerchants.filter(m => 
      m.status === status
    );
  }
  
  // 페이지네이션 적용
  const totalCount = filteredMerchants.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedMerchants = filteredMerchants.slice(startIndex, startIndex + pageSize);
  
  return {
    merchants: paginatedMerchants,
    pagination: {
      totalCount,
      page,
      pageSize,
      totalPages
    }
  };
}

/**
 * GET 요청 핸들러 - 가맹점 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    // URL 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name') || undefined;
    const businessNumber = searchParams.get('businessNumber') || undefined;
    const status = searchParams.get('status') || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize') as string, 10) : 10;

    console.log('가맹점 목록 조회 요청:', { name, businessNumber, status, page, pageSize });

    // 데이터베이스에서 가맹점 목록 조회
    try {
      const result = await getMerchants({
        name,
        businessNumber,
        status,
        page,
        pageSize
      });

      return successResponse(result);
    } catch (dbError) {
      console.error('데이터베이스 조회 중 오류 발생:', dbError);
      
      // 저장 프로시저 오류인 경우 샘플 데이터 반환
      if (dbError instanceof Error) {
        const errorMessage = dbError.message;
        const isMissingProcedure = errorMessage.includes('Could not find stored procedure') || 
                                  errorMessage.includes('sp_GetMerchantList');
        
        if (isMissingProcedure) {
          console.log('저장 프로시저 오류, 샘플 데이터 제공');
          
          // 샘플 데이터 생성 및 반환
          const sampleData = generateSampleMerchants({
            name,
            businessNumber,
            status,
            page,
            pageSize
          });
          
          // 개발 환경에서는 샘플 데이터와 함께 경고 메시지 포함
          return NextResponse.json({
            status: 'success',
            data: sampleData,
            warning: {
              message: '저장 프로시저를 찾을 수 없어 샘플 데이터를 제공합니다.',
              code: 'USING_SAMPLE_DATA',
              originalError: errorMessage
            }
          });
        }
        
        // 다른 데이터베이스 오류
        return errorResponse(
          '데이터베이스 오류가 발생했습니다.',
          500,
          'DATABASE_ERROR',
          { originalError: errorMessage }
        );
      }
      
      // 기타 오류
      throw dbError;
    }
  } catch (error) {
    console.error('가맹점 목록 조회 중 오류 발생:', error);
    
    return errorResponse(
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.',
      500,
      'SERVER_ERROR'
    );
  }
}

/**
 * POST 요청 핸들러 - 가맹점 등록
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    const requiredFields = [
      'name', 
      'businessNumber', 
      'representativeName', 
      'status',
      'email',
      'phone'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return errorResponse(`${field} 필드는 필수입니다.`, 400, 'VALIDATION_ERROR');
      }
    }
    
    // 데이터 유효성 검증
    const validationResult = merchantCreateSchema.safeParse(body);
    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return errorResponse(
        '유효하지 않은 데이터입니다.',
        400,
        'VALIDATION_ERROR',
        formattedErrors
      );
    }
    
    // 가맹점 등록
    try {
      const result = await createMerchant(validationResult.data);
      return successResponse({ id: result.id });
    } catch (dbError) {
      console.error('가맹점 등록 중 데이터베이스 오류:', dbError);
      
      if (dbError instanceof Error && dbError.message.includes('Could not find stored procedure')) {
        return errorResponse(
          '저장 프로시저를 찾을 수 없습니다. 데이터베이스 관리자에게 문의하세요.',
          500,
          'DB_PROCEDURE_NOT_FOUND'
        );
      }
      
      return errorResponse(
        '데이터베이스 오류가 발생했습니다.',
        500,
        'DATABASE_ERROR',
        { originalError: dbError instanceof Error ? dbError.message : String(dbError) }
      );
    }
  } catch (error) {
    console.error('가맹점 등록 중 오류 발생:', error);
    return errorResponse(
      error instanceof Error ? error.message : '서버 오류가 발생했습니다.',
      500,
      'SERVER_ERROR'
    );
  }
}
