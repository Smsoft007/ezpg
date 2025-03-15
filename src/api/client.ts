/**
 * API 클라이언트 공통 함수
 */
import { ApiResponse, ApiError, ApiWarning } from '@/types/merchants';

/**
 * GET 요청 함수
 * @param url API 엔드포인트 URL
 * @param params 쿼리 파라미터
 */
export async function fetchApi<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
  try {
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    
    const queryString = queryParams.toString();
    const requestUrl = `${url}${queryString ? `?${queryString}` : ''}`;
    
    console.log('API 요청 URL:', requestUrl);
    const response = await fetch(requestUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API 오류 응답:', errorData);
      
      const error: ApiError = {
        message: errorData.error?.message || `API 요청 실패: ${response.status}`,
        code: errorData.error?.code,
        details: errorData.error?.details
      };
      
      return {
        status: 'error',
        error
      };
    }
    
    const data = await response.json();
    
    // 경고 메시지가 있는 경우 처리
    if (data.warning) {
      console.warn('API 경고:', data.warning);
    }
    
    return data;
  } catch (error) {
    console.error(`API 요청 중 오류 발생 (${url}):`, error);
    
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      code: 'NETWORK_ERROR'
    };
    
    return {
      status: 'error',
      error: apiError
    };
  }
}

/**
 * POST 요청 함수
 * @param url API 엔드포인트 URL
 * @param data 요청 본문 데이터
 */
export async function postApi<T>(url: string, data: any): Promise<ApiResponse<T>> {
  try {
    console.log('POST 요청:', url, data);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API 오류 응답:', errorData);
      
      const error: ApiError = {
        message: errorData.error?.message || `API 요청 실패: ${response.status}`,
        code: errorData.error?.code,
        details: errorData.error?.details
      };
      
      return {
        status: 'error',
        error
      };
    }
    
    const responseData = await response.json();
    
    // 경고 메시지가 있는 경우 처리
    if (responseData.warning) {
      console.warn('API 경고:', responseData.warning);
    }
    
    return responseData;
  } catch (error) {
    console.error(`API 요청 중 오류 발생 (${url}):`, error);
    
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      code: 'NETWORK_ERROR'
    };
    
    return {
      status: 'error',
      error: apiError
    };
  }
}

/**
 * PUT 요청 함수
 * @param url API 엔드포인트 URL
 * @param data 요청 본문 데이터
 */
export async function putApi<T>(url: string, data: any): Promise<ApiResponse<T>> {
  try {
    console.log('PUT 요청:', url, data);
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API 오류 응답:', errorData);
      
      const error: ApiError = {
        message: errorData.error?.message || `API 요청 실패: ${response.status}`,
        code: errorData.error?.code,
        details: errorData.error?.details
      };
      
      return {
        status: 'error',
        error
      };
    }
    
    const responseData = await response.json();
    
    // 경고 메시지가 있는 경우 처리
    if (responseData.warning) {
      console.warn('API 경고:', responseData.warning);
    }
    
    return responseData;
  } catch (error) {
    console.error(`API 요청 중 오류 발생 (${url}):`, error);
    
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      code: 'NETWORK_ERROR'
    };
    
    return {
      status: 'error',
      error: apiError
    };
  }
}

/**
 * DELETE 요청 함수
 * @param url API 엔드포인트 URL
 */
export async function deleteApi<T>(url: string): Promise<ApiResponse<T>> {
  try {
    console.log('DELETE 요청:', url);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API 오류 응답:', errorData);
      
      const error: ApiError = {
        message: errorData.error?.message || `API 요청 실패: ${response.status}`,
        code: errorData.error?.code,
        details: errorData.error?.details
      };
      
      return {
        status: 'error',
        error
      };
    }
    
    const responseData = await response.json();
    
    // 경고 메시지가 있는 경우 처리
    if (responseData.warning) {
      console.warn('API 경고:', responseData.warning);
    }
    
    return responseData;
  } catch (error) {
    console.error(`API 요청 중 오류 발생 (${url}):`, error);
    
    const apiError: ApiError = {
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      code: 'NETWORK_ERROR'
    };
    
    return {
      status: 'error',
      error: apiError
    };
  }
}
