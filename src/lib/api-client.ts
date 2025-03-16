/**
 * API 클라이언트 유틸리티
 * 중앙화된 API 호출 및 에러 처리를 제공합니다.
 */

import { toast } from "@/components/ui/use-toast";

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

// API 요청 옵션
export interface ApiRequestOptions {
  /**
   * 에러 발생 시 토스트 메시지 표시 여부
   */
  showError?: boolean;
  
  /**
   * 커스텀 에러 메시지
   */
  errorMessage?: string;
  
  /**
   * 성공 시 토스트 메시지 표시 여부
   */
  showSuccess?: boolean;
  
  /**
   * 성공 시 표시할 메시지
   */
  successMessage?: string;
  
  /**
   * 캐시 키 (캐싱 사용 시)
   */
  cacheKey?: string;
  
  /**
   * 캐시 유효 시간 (밀리초)
   */
  cacheTTL?: number;
}

// API 캐시 저장소
const apiCache = new Map<string, { data: any; timestamp: number }>();

/**
 * API 요청 함수
 * 
 * @param url - API 엔드포인트 URL
 * @param method - HTTP 메서드
 * @param body - 요청 바디 (객체)
 * @param options - API 요청 옵션
 * @returns API 응답
 */
export async function apiRequest<T = any>(
  url: string,
  method: string = "GET",
  body?: any,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  // 기본 옵션 설정
  const {
    showError = true,
    errorMessage = "요청 처리 중 오류가 발생했습니다.",
    showSuccess = false,
    successMessage = "요청이 성공적으로 처리되었습니다.",
    cacheKey,
    cacheTTL = 60000, // 기본 1분
  } = options;

  // 캐시된 데이터 확인
  if (method === "GET" && cacheKey && apiCache.has(cacheKey)) {
    const cachedData = apiCache.get(cacheKey)!;
    const now = Date.now();
    
    // 캐시가 유효한 경우
    if (now - cachedData.timestamp < cacheTTL) {
      return cachedData.data;
    }
    
    // 캐시가 만료된 경우 삭제
    apiCache.delete(cacheKey);
  }

  try {
    // 요청 헤더 설정
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // 요청 옵션 설정
    const requestOptions: RequestInit = {
      method,
      headers,
      credentials: "include",
    };

    // GET 요청이 아닌 경우 바디 추가
    if (method !== "GET" && body) {
      requestOptions.body = JSON.stringify(body);
    }

    // API 요청 실행
    const response = await fetch(url, requestOptions);
    const data = await response.json();

    // 응답 형식화
    const result: ApiResponse<T> = {
      success: response.ok,
      data: response.ok ? data : undefined,
      error: response.ok ? undefined : data.message || errorMessage,
      statusCode: response.status,
    };

    // 요청 실패 시 에러 처리
    if (!response.ok && showError) {
      toast({
        variant: "destructive",
        title: "오류",
        description: result.error,
      });
    }

    // 요청 성공 시 성공 메시지 표시
    if (response.ok && showSuccess) {
      toast({
        title: "성공",
        description: successMessage,
      });
    }

    // 성공한 GET 요청 결과 캐싱
    if (response.ok && method === "GET" && cacheKey) {
      apiCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });
    }

    return result;
  } catch (error) {
    // 네트워크 오류 등 예외 처리
    console.error("API 요청 오류:", error);
    
    const errorResponse: ApiResponse<T> = {
      success: false,
      error: error instanceof Error ? error.message : errorMessage,
    };

    // 에러 메시지 표시
    if (showError) {
      toast({
        variant: "destructive",
        title: "오류",
        description: errorResponse.error,
      });
    }

    return errorResponse;
  }
}

/**
 * GET 요청 헬퍼 함수
 */
export async function fetchApi<T = any>(
  url: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, "GET", undefined, options);
}

/**
 * POST 요청 헬퍼 함수
 */
export async function postApi<T = any>(
  url: string,
  body?: any,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, "POST", body, options);
}

/**
 * PUT 요청 헬퍼 함수
 */
export async function putApi<T = any>(
  url: string,
  body?: any,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, "PUT", body, options);
}

/**
 * DELETE 요청 헬퍼 함수
 */
export async function deleteApi<T = any>(
  url: string,
  options?: ApiRequestOptions
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, "DELETE", undefined, options);
}

/**
 * API 캐시 삭제 함수
 */
export function clearApiCache(cacheKey?: string): void {
  if (cacheKey) {
    apiCache.delete(cacheKey);
  } else {
    apiCache.clear();
  }
}

/**
 * API 요청 URL에 쿼리 파라미터 추가
 */
export function buildApiUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!params) return baseUrl;
  
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
