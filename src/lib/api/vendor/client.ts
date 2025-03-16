import { 
  CreateVendorRequest, 
  GetVendorDetailResponse, 
  GetVendorListRequest, 
  GetVendorListResponse, 
  UpdateVendorRequest, 
  UpdateVendorStatusRequest, 
  VendorActionResponse 
} from '@/types/vendor';

/**
 * 거래처 목록을 조회하는 API 함수
 * @param params 조회 파라미터
 * @returns 거래처 목록 및 페이지네이션 정보
 */
export async function getVendorList(params: GetVendorListRequest = {}): Promise<GetVendorListResponse> {
  const { 
    searchText, 
    status, 
    page = 1, 
    limit = 10, 
    sortColumn = 'vendorName', 
    sortDirection = 'asc' 
  } = params;

  // URL 파라미터 구성
  const queryParams = new URLSearchParams();
  if (searchText) queryParams.append('searchText', searchText);
  if (status) queryParams.append('status', status);
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  queryParams.append('sortColumn', sortColumn);
  queryParams.append('sortDirection', sortDirection);

  const response = await fetch(`/api/vendors?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '거래처 목록을 불러오는데 실패했습니다.');
  }

  return await response.json();
}

/**
 * 특정 거래처의 상세 정보를 조회하는 API 함수
 * @param id 거래처 ID
 * @returns 거래처 상세 정보
 */
export async function getVendorById(id: string): Promise<GetVendorDetailResponse> {
  const response = await fetch(`/api/vendors/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '거래처 정보를 불러오는데 실패했습니다.');
  }

  return await response.json();
}

/**
 * 새로운 거래처를 생성하는 API 함수
 * @param data 거래처 생성 데이터
 * @returns 생성된 거래처 ID 및 성공 여부
 */
export async function createVendor(data: CreateVendorRequest): Promise<VendorActionResponse> {
  const response = await fetch('/api/vendors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '거래처 생성에 실패했습니다.');
  }

  return await response.json();
}

/**
 * 거래처 정보를 수정하는 API 함수
 * @param data 거래처 수정 데이터
 * @returns 수정된 거래처 ID 및 성공 여부
 */
export async function updateVendor(data: UpdateVendorRequest): Promise<VendorActionResponse> {
  const response = await fetch(`/api/vendors/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '거래처 정보 수정에 실패했습니다.');
  }

  return await response.json();
}

/**
 * 거래처 상태를 변경하는 API 함수
 * @param data 거래처 상태 변경 데이터
 * @returns 변경된 거래처 ID 및 성공 여부
 */
export async function updateVendorStatus(data: UpdateVendorStatusRequest): Promise<VendorActionResponse> {
  const response = await fetch(`/api/vendors/${data.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: data.status }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '거래처 상태 변경에 실패했습니다.');
  }

  return await response.json();
}

/**
 * 거래처를 삭제하는 API 함수
 * @param id 거래처 ID
 * @returns 삭제된 거래처 ID 및 성공 여부
 */
export async function deleteVendor(id: string): Promise<VendorActionResponse> {
  const response = await fetch(`/api/vendors/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '거래처 삭제에 실패했습니다.');
  }

  return await response.json();
}
