/**
 * API 테스트 상태 관리 서비스
 */
import { ApiTestStatus, UpdateTestStatusRequest } from './types';
import { readTestStatus, saveTestStatus } from './utils';

/**
 * 테스트 상태 조회
 */
export async function getTestStatus(): Promise<ApiTestStatus> {
  return await readTestStatus();
}

/**
 * 테스트 상태 업데이트
 */
export async function updateTestStatus(
  updateData: UpdateTestStatusRequest
): Promise<ApiTestStatus> {
  const { category, apiName, method, endpoint, status, dbStatus, notes } = updateData;
  
  // 현재 테스트 상태 조회
  const testStatus = await readTestStatus();
  
  // 해당 카테고리가 없으면 생성
  if (!testStatus.apis[category]) {
    testStatus.apis[category] = [];
  }

  // API 찾기
  const apiIndex = testStatus.apis[category].findIndex(
    api => api.name === apiName && api.method === method
  );

  if (apiIndex === -1) {
    // 새 API 추가
    testStatus.apis[category].push({
      name: apiName,
      endpoint: endpoint || `알 수 없음`,
      method,
      status,
      dbStatus,
      lastTested: new Date().toISOString(),
      notes
    });
  } else {
    // 기존 API 업데이트
    testStatus.apis[category][apiIndex] = {
      ...testStatus.apis[category][apiIndex],
      status,
      dbStatus,
      lastTested: new Date().toISOString(),
      notes: notes || testStatus.apis[category][apiIndex].notes
    };
  }

  // 마지막 업데이트 시간 갱신
  testStatus.lastUpdated = new Date().toISOString();

  // 변경사항 저장
  await saveTestStatus(testStatus);
  
  return testStatus;
}
