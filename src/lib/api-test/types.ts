/**
 * API 테스트 관련 타입 정의
 */

// API 테스트 상태 타입
export type TestStatus = 'success' | 'fail' | 'not-tested';

// API 테스트 항목 인터페이스
export interface ApiTest {
  name: string;
  endpoint: string;
  method: string;
  status: TestStatus;
  dbStatus: TestStatus;
  lastTested?: string;
  notes?: string;
}

// API 테스트 상태 인터페이스
export interface ApiTestStatus {
  lastUpdated: string;
  apis: {
    [key: string]: ApiTest[];
  };
}

// API 테스트 상태 업데이트 요청 인터페이스
export interface UpdateTestStatusRequest {
  category: string;
  apiName: string;
  method: string;
  endpoint: string;
  status: TestStatus;
  dbStatus: TestStatus;
  notes?: string;
}

// API 응답 인터페이스
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: any;
}
