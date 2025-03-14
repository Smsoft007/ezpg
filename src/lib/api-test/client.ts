/**
 * API 테스트 클라이언트
 * API 테스트 상태 관리를 위한 HTTP 클라이언트
 */
import { ApiResponse, ApiTestStatus, TestStatus, UpdateTestStatusRequest } from './types';

/**
 * 테스트 상태 조회
 */
export async function fetchTestStatus(): Promise<ApiTestStatus> {
  try {
    const response = await fetch('/api/test');
    if (!response.ok) {
      throw new Error('테스트 상태를 가져오는데 실패했습니다.');
    }
    const data = await response.json() as ApiResponse<ApiTestStatus>;
    return data.data as ApiTestStatus;
  } catch (error) {
    console.error('테스트 상태 가져오기 오류:', error);
    throw error;
  }
}

/**
 * 테스트 상태 업데이트
 */
export async function updateApiTestStatus(
  category: string,
  apiName: string,
  method: string,
  endpoint: string,
  status: TestStatus,
  dbStatus: TestStatus,
  notes?: string
): Promise<ApiTestStatus> {
  try {
    const response = await fetch('/api/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category,
        apiName,
        method,
        endpoint,
        status,
        dbStatus,
        notes,
      } as UpdateTestStatusRequest),
    });

    if (!response.ok) {
      throw new Error('테스트 상태 업데이트에 실패했습니다.');
    }

    const data = await response.json() as ApiResponse<ApiTestStatus>;
    return data.data as ApiTestStatus;
  } catch (error) {
    console.error('테스트 상태 업데이트 오류:', error);
    throw error;
  }
}
