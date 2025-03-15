/**
 * 가맹점 관리 API 클라이언트
 */
import { 
  Merchant, 
  MerchantsListResult, 
  MerchantSearchParams, 
  ApiResponse,
  ApiWarning
} from '@/types/merchants';
import { fetchApi, postApi, putApi, deleteApi } from '@/api/client';

/**
 * 샘플 가맹점 데이터 생성
 * @param count 생성할 가맹점 수
 */
export function generateSampleMerchants(count: number = 10): Merchant[] {
  const statuses: ('active' | 'inactive' | 'pending')[] = ['active', 'inactive', 'pending'];
  const banks = ['신한은행', '국민은행', '우리은행', '하나은행', '기업은행'];
  
  return Array.from({ length: count }).map((_, index) => {
    const id = index + 1;
    const now = new Date().toISOString();
    
    return {
      id,
      name: `샘플 가맹점 ${id}`,
      businessNumber: `123-45-${67890 + id}`.substring(0, 12),
      representativeName: `대표자 ${id}`,
      status: statuses[id % statuses.length],
      email: `merchant${id}@example.com`,
      phone: `010-1234-${5678 + id}`.substring(0, 13),
      zipCode: `0${5000 + id}`.substring(0, 5),
      address1: `서울시 강남구 테헤란로 ${123 + id}`,
      address2: `${id}층 ${id}호`,
      bank: banks[id % banks.length],
      accountNumber: `110-123-${456789 + id}`.substring(0, 14),
      accountHolder: `계좌주 ${id}`,
      paymentFee: 3.5 + (id % 10) / 10,
      withdrawalFee: 1000 + (id % 5) * 100,
      createdAt: now,
      updatedAt: now
    };
  });
}

/**
 * 가맹점 목록 조회
 * @param searchParams 검색 파라미터
 */
export async function fetchMerchants(searchParams?: MerchantSearchParams): Promise<ApiResponse<MerchantsListResult>> {
  try {
    const response = await fetchApi<MerchantsListResult>('/api/merchants', searchParams);
    
    // 오류 발생 시 샘플 데이터 생성 여부 확인
    if (response.status === 'error' && response.error?.code === 'SP_NOT_FOUND') {
      console.warn('가맹점 목록 조회 중 저장 프로시저 오류 발생, 샘플 데이터 생성');
      
      const sampleMerchants = generateSampleMerchants(20);
      const page = searchParams?.page || 1;
      const pageSize = searchParams?.pageSize || 10;
      
      // 페이지네이션 적용
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMerchants = sampleMerchants.slice(startIndex, endIndex);
      
      // 필터링 적용
      let filteredMerchants = paginatedMerchants;
      if (searchParams?.name) {
        filteredMerchants = filteredMerchants.filter(m => 
          m.name.toLowerCase().includes(searchParams.name!.toLowerCase())
        );
      }
      if (searchParams?.businessNumber) {
        filteredMerchants = filteredMerchants.filter(m => 
          m.businessNumber.includes(searchParams.businessNumber!)
        );
      }
      if (searchParams?.status) {
        filteredMerchants = filteredMerchants.filter(m => 
          m.status === searchParams.status
        );
      }
      
      const warning: ApiWarning = {
        message: '데이터베이스 연결에 문제가 있어 샘플 데이터를 표시합니다.',
        code: 'USING_SAMPLE_DATA',
        originalError: response.error?.message
      };
      
      return {
        status: 'success',
        data: {
          merchants: filteredMerchants,
          pagination: {
            totalCount: sampleMerchants.length,
            page,
            pageSize,
            totalPages: Math.ceil(sampleMerchants.length / pageSize)
          }
        },
        warning
      };
    }
    
    return response;
  } catch (error) {
    console.error('가맹점 목록 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 가맹점 상세 정보 조회
 * @param id 가맹점 ID
 */
export async function fetchMerchantById(id: number): Promise<ApiResponse<Merchant>> {
  try {
    const response = await fetchApi<Merchant>(`/api/merchants/${id}`);
    
    // 오류 발생 시 샘플 데이터 생성 여부 확인
    if (response.status === 'error' && response.error?.code === 'SP_NOT_FOUND') {
      console.warn(`가맹점 상세 정보 조회 중 저장 프로시저 오류 발생 (ID: ${id}), 샘플 데이터 생성`);
      
      const sampleMerchant = generateSampleMerchants(1)[0];
      sampleMerchant.id = id;
      
      const warning: ApiWarning = {
        message: '데이터베이스 연결에 문제가 있어 샘플 데이터를 표시합니다.',
        code: 'USING_SAMPLE_DATA',
        originalError: response.error?.message
      };
      
      return {
        status: 'success',
        data: sampleMerchant,
        warning
      };
    }
    
    return response;
  } catch (error) {
    console.error(`가맹점 상세 정보 조회 중 오류 발생 (ID: ${id}):`, error);
    throw error;
  }
}

/**
 * 가맹점 등록
 * @param merchantData 가맹점 데이터
 */
export async function createMerchant(merchantData: {
  name: string;
  businessNumber: string;
  representativeName: string;
  status: string;
  email: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  bank: string;
  accountNumber: string;
  accountHolder: string;
  paymentFee: string;
  withdrawalFee: string;
}): Promise<ApiResponse<{ id: number }>> {
  try {
    const response = await postApi<{ id: number }>('/api/merchants', merchantData);
    
    // 오류 발생 시 샘플 응답 생성 여부 확인
    if (response.status === 'error' && response.error?.code === 'SP_NOT_FOUND') {
      console.warn('가맹점 등록 중 저장 프로시저 오류 발생, 샘플 응답 생성');
      
      const warning: ApiWarning = {
        message: '데이터베이스 연결에 문제가 있어 가맹점이 실제로 등록되지 않았습니다.',
        code: 'USING_SAMPLE_RESPONSE',
        originalError: response.error?.message
      };
      
      return {
        status: 'success',
        data: { id: Math.floor(Math.random() * 1000) + 1 },
        warning
      };
    }
    
    return response;
  } catch (error) {
    console.error('가맹점 등록 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 가맹점 정보 수정
 * @param id 가맹점 ID
 * @param merchantData 가맹점 데이터
 */
export async function updateMerchant(
  id: number,
  merchantData: {
    name: string;
    businessNumber: string;
    representativeName: string;
    status: string;
    email: string;
    phone: string;
    zipCode: string;
    address1: string;
    address2?: string;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    paymentFee: string;
    withdrawalFee: string;
  }
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await putApi<{ success: boolean }>(`/api/merchants/${id}`, merchantData);
    
    // 오류 발생 시 샘플 응답 생성 여부 확인
    if (response.status === 'error' && response.error?.code === 'SP_NOT_FOUND') {
      console.warn(`가맹점 정보 수정 중 저장 프로시저 오류 발생 (ID: ${id}), 샘플 응답 생성`);
      
      const warning: ApiWarning = {
        message: '데이터베이스 연결에 문제가 있어 가맹점 정보가 실제로 수정되지 않았습니다.',
        code: 'USING_SAMPLE_RESPONSE',
        originalError: response.error?.message
      };
      
      return {
        status: 'success',
        data: { success: true },
        warning
      };
    }
    
    return response;
  } catch (error) {
    console.error(`가맹점 정보 수정 중 오류 발생 (ID: ${id}):`, error);
    throw error;
  }
}

/**
 * 가맹점 상태 변경
 * @param id 가맹점 ID
 * @param status 변경할 상태
 */
export async function updateMerchantStatus(id: number, status: 'active' | 'inactive' | 'pending'): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await putApi<{ success: boolean }>(`/api/merchants/${id}/status`, { status });
    
    // 오류 발생 시 샘플 응답 생성 여부 확인
    if (response.status === 'error' && response.error?.code === 'SP_NOT_FOUND') {
      console.warn(`가맹점 상태 변경 중 저장 프로시저 오류 발생 (ID: ${id}), 샘플 응답 생성`);
      
      const warning: ApiWarning = {
        message: '데이터베이스 연결에 문제가 있어 가맹점 상태가 실제로 변경되지 않았습니다.',
        code: 'USING_SAMPLE_RESPONSE',
        originalError: response.error?.message
      };
      
      return {
        status: 'success',
        data: { success: true },
        warning
      };
    }
    
    return response;
  } catch (error) {
    console.error(`가맹점 상태 변경 중 오류 발생 (ID: ${id}):`, error);
    throw error;
  }
}

/**
 * 가맹점 삭제
 * @param id 가맹점 ID
 */
export async function deleteMerchant(id: number): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await deleteApi<{ success: boolean }>(`/api/merchants/${id}`);
    
    // 오류 발생 시 샘플 응답 생성 여부 확인
    if (response.status === 'error' && response.error?.code === 'SP_NOT_FOUND') {
      console.warn(`가맹점 삭제 중 저장 프로시저 오류 발생 (ID: ${id}), 샘플 응답 생성`);
      
      const warning: ApiWarning = {
        message: '데이터베이스 연결에 문제가 있어 가맹점이 실제로 삭제되지 않았습니다.',
        code: 'USING_SAMPLE_RESPONSE',
        originalError: response.error?.message
      };
      
      return {
        status: 'success',
        data: { success: true },
        warning
      };
    }
    
    return response;
  } catch (error) {
    console.error(`가맹점 삭제 중 오류 발생 (ID: ${id}):`, error);
    throw error;
  }
}

export default {
  fetchMerchants,
  fetchMerchantById,
  createMerchant,
  updateMerchant,
  updateMerchantStatus,
  deleteMerchant,
  generateSampleMerchants
};
