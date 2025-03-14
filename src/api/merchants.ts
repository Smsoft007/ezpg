/**
 * 가맹점 관리 API 클라이언트
 */
import { Merchant, MerchantsListResult } from '@/db/merchants';

/**
 * 가맹점 목록 조회 API 응답 타입
 */
export type MerchantsResponse = MerchantsListResult;

/**
 * 가맹점 목록 조회
 * @param searchParams 검색 파라미터
 */
export async function fetchMerchants(searchParams?: {
  name?: string;
  businessNumber?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<MerchantsResponse> {
  try {
    // 서버 API 엔드포인트 호출
    const queryParams = new URLSearchParams();
    
    if (searchParams?.name) queryParams.append('name', searchParams.name);
    if (searchParams?.businessNumber) queryParams.append('businessNumber', searchParams.businessNumber);
    if (searchParams?.status) queryParams.append('status', searchParams.status);
    if (searchParams?.page) queryParams.append('page', searchParams.page.toString());
    if (searchParams?.pageSize) queryParams.append('pageSize', searchParams.pageSize.toString());
    
    const queryString = queryParams.toString();
    const url = `/api/merchants${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('가맹점 목록 조회 중 오류가 발생했습니다:', error);
    throw error;
  }
}

/**
 * 가맹점 상세 정보 조회
 * @param id 가맹점 ID
 */
export async function fetchMerchantById(id: number): Promise<Merchant> {
  try {
    const response = await fetch(`/api/merchants/${id}`);
    
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`가맹점 ID ${id} 조회 중 오류가 발생했습니다:`, error);
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
}): Promise<{ id: number }> {
  try {
    const response = await fetch('/api/merchants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(merchantData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('가맹점 등록 중 오류가 발생했습니다:', error);
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
): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/merchants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(merchantData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`가맹점 ID ${id} 수정 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 상태 변경
 * @param id 가맹점 ID
 * @param status 변경할 상태
 */
export async function updateMerchantStatus(id: number, status: 'active' | 'inactive' | 'pending'): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/merchants/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`가맹점 ID ${id} 상태 변경 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 삭제
 * @param id 가맹점 ID
 */
export async function deleteMerchant(id: number): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/merchants/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API 요청 실패: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`가맹점 ID ${id} 삭제 중 오류가 발생했습니다:`, error);
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
};
