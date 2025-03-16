/**
 * API 호출 관련 유틸리티 함수
 */

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
};

/**
 * API 응답을 처리하는 공통 함수
 * 응답 형식을 일관되게 유지하고 에러 처리를 담당합니다.
 */
export async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  try {
    if (!response.ok) {
      // 서버에서 반환한 에러 메시지가 있으면 사용, 없으면 HTTP 상태 텍스트 사용
      let errorMessage: string;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error || errorBody.message || response.statusText;
      } catch {
        errorMessage = response.statusText;
      }

      return {
        success: false,
        error: errorMessage,
        statusCode: response.status
      };
    }

    // 응답 본문이 없는 경우(204 No Content 등)를 처리
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();
    return {
      success: true,
      data,
      statusCode: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      statusCode: 500
    };
  }
}

/**
 * GET 요청을 보내는 함수
 */
export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });
    return handleApiResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 연결에 문제가 있습니다.',
      statusCode: 500
    };
  }
}

/**
 * POST 요청을 보내는 함수
 */
export async function postApi<T, U = any>(endpoint: string, data: U, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: JSON.stringify(data),
      ...options
    });
    return handleApiResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 연결에 문제가 있습니다.',
      statusCode: 500
    };
  }
}

/**
 * PUT 요청을 보내는 함수
 */
export async function putApi<T, U = any>(endpoint: string, data: U, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      body: JSON.stringify(data),
      ...options
    });
    return handleApiResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 연결에 문제가 있습니다.',
      statusCode: 500
    };
  }
}

/**
 * DELETE 요청을 보내는 함수
 */
export async function deleteApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      },
      ...options
    });
    return handleApiResponse<T>(response);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 연결에 문제가 있습니다.',
      statusCode: 500
    };
  }
}
