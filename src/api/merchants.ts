/**
 * 가맹점 API 클라이언트
 */
import { 
  fetchApi, 
  postApi, 
  putApi, 
  deleteApi, 
  ApiResponse as BaseApiResponse, 
  buildApiUrl, 
  clearApiCache 
} from '@/lib/api-client';
import { 
  Merchant, 
  MerchantSearchParams, 
  MerchantCreateParams, 
  MerchantUpdateParams 
} from '@/types/merchants';

// 경고 메시지를 포함하는 확장된 API 응답 타입
export interface ApiResponse<T = any> extends BaseApiResponse<T> {
  warning?: string;
}

const API_BASE_URL = '/api/merchants';
const MERCHANTS_CACHE_KEY = 'merchants_list';

/**
 * 샘플 가맹점 데이터 생성 함수
 * @param count 생성할 가맹점 수
 * @returns 샘플 가맹점 배열
 */
export function generateSampleMerchants(count: number = 10): Merchant[] {
  const statuses: ('active' | 'inactive' | 'pending' | 'suspended')[] = ['active', 'inactive', 'pending', 'suspended'];
  const businessTypes = ['개인', '법인', '프리랜서', '소상공인'];
  const cities = ['서울', '부산', '인천', '대구', '광주', '대전', '울산', '세종'];
  
  return Array.from({ length: count }).map((_, index) => {
    const id = index + 1;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    return {
      id,
      name: `샘플 가맹점 ${id}`,
      businessNumber: `123-45-${67890 + id}`.substring(0, 12),
      representativeName: `대표자 ${id}`,
      phoneNumber: `010-1234-${5678 + id}`.substring(0, 13),
      email: `sample${id}@example.com`,
      address: `${city} 샘플구 테스트로 ${id}길 ${id * 10}`,
      businessType,
      status,
      registrationDate: new Date(Date.now() - (id * 86400000)).toISOString(),
      lastUpdated: new Date(Date.now() - (id * 43200000)).toISOString(),
      contractStartDate: new Date(Date.now() - (id * 86400000 * 30)).toISOString(),
      contractEndDate: new Date(Date.now() + (id * 86400000 * 30)).toISOString(),
      commissionRate: (0.5 + (id % 10) / 10).toFixed(2),
      bankName: '샘플은행',
      accountNumber: `123-456-${7890 + id}`.substring(0, 14),
      accountHolder: `계좌주 ${id}`,
      memo: id % 3 === 0 ? `샘플 메모 ${id}` : undefined,
      tags: id % 2 === 0 ? ['샘플', `태그${id}`] : undefined
    };
  });
}

/**
 * 가맹점 목록 조회 함수
 * @param params 검색 파라미터
 * @returns API 응답 (가맹점 목록 및 총 개수)
 */
export async function fetchMerchants(params?: MerchantSearchParams): Promise<ApiResponse<{
  merchants: Merchant[],
  totalCount: number
}>> {
  try {
    // 캐시 키 생성 (검색 조건마다 다른 캐시 키 사용)
    const cacheKey = params 
      ? `${MERCHANTS_CACHE_KEY}_${JSON.stringify(params)}`
      : MERCHANTS_CACHE_KEY;
    
    // API URL 생성
    const url = buildApiUrl(API_BASE_URL, params);
    
    // API 호출 (캐싱 사용)
    const response = await fetchApi<{
      merchants: Merchant[],
      totalCount: number
    }>(url, {
      cacheKey,
      cacheTTL: 60000, // 1분 캐시
      showError: true,
      errorMessage: '가맹점 목록을 불러오는 중 오류가 발생했습니다.'
    });
    
    // 데이터베이스 오류 발생 시 샘플 데이터 반환
    if (!response.success) {
      console.warn('가맹점 데이터 조회 중 오류가 발생하여 샘플 데이터를 반환합니다.');
      
      const sampleData = generateSampleMerchants(20);
      const filteredData = filterSampleData(sampleData, params);
      const pageSize = params?.pageSize || 10;
      const page = params?.page || 1;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      
      return {
        success: true,
        data: {
          merchants: filteredData.slice(startIndex, endIndex),
          totalCount: filteredData.length
        },
        warning: '데이터베이스 연결 오류로 샘플 데이터를 표시합니다.'
      };
    }
    
    return response;
  } catch (error) {
    console.error('가맹점 목록 조회 중 오류 발생:', error);
    
    // 오류 발생 시 샘플 데이터 반환
    const sampleData = generateSampleMerchants(20);
    const filteredData = filterSampleData(sampleData, params);
    const pageSize = params?.pageSize || 10;
    const page = params?.page || 1;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      success: true,
      data: {
        merchants: filteredData.slice(startIndex, endIndex),
        totalCount: filteredData.length
      },
      warning: '데이터베이스 연결 오류로 샘플 데이터를 표시합니다.'
    };
  }
}

/**
 * 샘플 데이터 필터링 함수 (검색 조건에 맞게 필터링)
 */
function filterSampleData(data: Merchant[], params?: MerchantSearchParams): Merchant[] {
  if (!params) return data;
  
  return data.filter(merchant => {
    // 가맹점명 필터
    if (params.name && !merchant.name.includes(params.name)) {
      return false;
    }
    
    // 사업자번호 필터
    if (params.businessNumber && !merchant.businessNumber.includes(params.businessNumber)) {
      return false;
    }
    
    // 상태 필터
    if (params.status && params.status !== 'all' && merchant.status !== params.status) {
      return false;
    }
    
    return true;
  });
}

/**
 * 가맹점 상세 조회 함수
 * @param id 가맹점 ID
 * @returns API 응답 (가맹점 정보)
 */
export async function fetchMerchantById(id: number | string): Promise<ApiResponse<Merchant>> {
  try {
    // ID 유효성 검사 강화
    if (id === undefined || id === null || id === '') {
      return {
        success: false,
        error: '가맹점 ID가 제공되지 않았습니다.'
      };
    }
    
    // 문자열 ID를 숫자로 변환 시도
    const merchantId = typeof id === 'string' ? parseInt(id) : id;
    
    // 숫자 ID 유효성 검사
    if (isNaN(merchantId) || merchantId <= 0) {
      return {
        success: false,
        error: '유효하지 않은 가맹점 ID입니다.'
      };
    }
    
    // 캐시 키 생성
    const cacheKey = `merchant_${merchantId}`;
    
    // API 호출 (캐싱 사용)
    const response = await fetchApi<Merchant>(`${API_BASE_URL}/${merchantId}`, {
      cacheKey,
      cacheTTL: 60000, // 1분 캐시
      showError: true,
      errorMessage: `가맹점 정보를 불러오는 중 오류가 발생했습니다. (ID: ${merchantId})`
    });
    
    // 데이터베이스 오류 발생 시 샘플 데이터 반환
    if (!response.success) {
      console.warn(`가맹점 ID ${merchantId} 조회 중 오류가 발생하여 샘플 데이터를 반환합니다.`);
      
      const sampleData = generateSampleMerchants(merchantId)[0];
      
      return {
        success: true,
        data: sampleData,
        warning: '데이터베이스 연결 오류로 샘플 데이터를 표시합니다.'
      };
    }
    
    return response;
  } catch (error) {
    console.error(`가맹점 ID ${id} 조회 중 오류 발생:`, error);
    
    // 오류 발생 시 샘플 데이터 반환
    const merchantId = typeof id === 'string' ? parseInt(id) : id;
    const sampleData = !isNaN(merchantId) && merchantId > 0 ? generateSampleMerchants(merchantId)[0] : generateSampleMerchants(1)[0];
    
    return {
      success: true,
      data: sampleData,
      warning: '데이터베이스 연결 오류로 샘플 데이터를 표시합니다.'
    };
  }
}

/**
 * 가맹점 등록 함수
 * @param params 가맹점 등록 정보
 * @returns API 응답
 */
export async function createMerchant(params: MerchantCreateParams): Promise<ApiResponse<Merchant>> {
  try {
    const response = await postApi<Merchant>(API_BASE_URL, params, {
      showSuccess: true,
      successMessage: '가맹점이 성공적으로 등록되었습니다.',
      showError: true,
      errorMessage: '가맹점 등록 중 오류가 발생했습니다.'
    });
    
    // 캐시 초기화 (목록 다시 불러오기 위함)
    clearApiCache(MERCHANTS_CACHE_KEY);
    
    return response;
  } catch (error) {
    console.error('가맹점 등록 중 오류 발생:', error);
    
    return {
      success: false,
      error: '가맹점 등록 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 가맹점 정보 수정 함수
 * @param id 가맹점 ID
 * @param params 수정할 가맹점 정보
 * @returns API 응답
 */
export async function updateMerchant(id: number | string, params: MerchantUpdateParams): Promise<ApiResponse<Merchant>> {
  try {
    // ID 유효성 검사
    if (id === undefined || id === null || id === '') {
      return {
        success: false,
        error: '가맹점 ID가 제공되지 않았습니다.'
      };
    }
    
    const merchantId = typeof id === 'string' ? parseInt(id) : id;
    
    if (isNaN(merchantId) || merchantId <= 0) {
      return {
        success: false,
        error: '유효하지 않은 가맹점 ID입니다.'
      };
    }
    
    const response = await putApi<Merchant>(`${API_BASE_URL}/${merchantId}`, params, {
      showSuccess: true,
      successMessage: '가맹점 정보가 성공적으로 수정되었습니다.',
      showError: true,
      errorMessage: '가맹점 정보 수정 중 오류가 발생했습니다.'
    });
    
    // 캐시 초기화
    clearApiCache(`merchant_${merchantId}`);
    clearApiCache(MERCHANTS_CACHE_KEY);
    
    return response;
  } catch (error) {
    console.error(`가맹점 ID ${id} 수정 중 오류 발생:`, error);
    
    return {
      success: false,
      error: '가맹점 정보 수정 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 가맹점 삭제 함수
 * @param id 가맹점 ID
 * @returns API 응답
 */
export async function deleteMerchant(id: number | string): Promise<ApiResponse<void>> {
  try {
    // ID 유효성 검사
    if (id === undefined || id === null || id === '') {
      return {
        success: false,
        error: '가맹점 ID가 제공되지 않았습니다.'
      };
    }
    
    const merchantId = typeof id === 'string' ? parseInt(id) : id;
    
    if (isNaN(merchantId) || merchantId <= 0) {
      return {
        success: false,
        error: '유효하지 않은 가맹점 ID입니다.'
      };
    }
    
    const response = await deleteApi<void>(`${API_BASE_URL}/${merchantId}`, {
      showSuccess: true,
      successMessage: '가맹점이 성공적으로 삭제되었습니다.',
      showError: true,
      errorMessage: '가맹점 삭제 중 오류가 발생했습니다.'
    });
    
    // 캐시 초기화
    clearApiCache(`merchant_${merchantId}`);
    clearApiCache(MERCHANTS_CACHE_KEY);
    
    return response;
  } catch (error) {
    console.error(`가맹점 ID ${id} 삭제 중 오류 발생:`, error);
    
    return {
      success: false,
      error: '가맹점 삭제 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 가맹점 상태 변경 함수
 * @param id 가맹점 ID
 * @param status 변경할 상태
 * @returns API 응답
 */
export async function updateMerchantStatus(
  id: number | string, 
  status: 'active' | 'inactive' | 'pending' | 'suspended'
): Promise<ApiResponse<Merchant>> {
  try {
    const merchantId = typeof id === 'string' ? parseInt(id) : id;
    
    const response = await putApi<Merchant>(`${API_BASE_URL}/${merchantId}/status`, { status }, {
      showSuccess: true,
      successMessage: `가맹점 상태가 '${status}'로 변경되었습니다.`,
      showError: true,
      errorMessage: '가맹점 상태 변경 중 오류가 발생했습니다.'
    });
    
    // 캐시 초기화
    clearApiCache(`merchant_${merchantId}`);
    clearApiCache(MERCHANTS_CACHE_KEY);
    
    return response;
  } catch (error) {
    console.error(`가맹점 ID ${id} 상태 변경 중 오류 발생:`, error);
    
    return {
      success: false,
      error: '가맹점 상태 변경 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 가맹점 목록 캐시 초기화 함수
 */
export function clearMerchantsCache(): void {
  clearApiCache(MERCHANTS_CACHE_KEY);
}

export default {
  fetchMerchants,
  fetchMerchantById,
  createMerchant,
  updateMerchant,
  deleteMerchant,
  updateMerchantStatus,
  clearMerchantsCache,
  generateSampleMerchants
};
