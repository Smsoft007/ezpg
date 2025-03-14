/**
 * API 테스트 상태 관리 유틸리티 함수
 */
import fs from 'fs/promises';
import path from 'path';
import { ApiTestStatus } from './types';

// 테스트 상태 파일 경로
const TEST_STATUS_FILE = path.join(process.cwd(), 'docs', 'api', 'test-status.json');

/**
 * 기본 테스트 상태 데이터 생성
 */
export function getDefaultTestStatus(): ApiTestStatus {
  return {
    lastUpdated: new Date().toISOString(),
    apis: {
      merchants: [
        {
          name: '가맹점 목록 조회',
          endpoint: '/api/merchants',
          method: 'GET',
          status: 'not-tested',
          dbStatus: 'not-tested'
        },
        {
          name: '가맹점 등록',
          endpoint: '/api/merchants',
          method: 'POST',
          status: 'not-tested',
          dbStatus: 'not-tested'
        },
        {
          name: '가맹점 상세 조회',
          endpoint: '/api/merchants/[id]',
          method: 'GET',
          status: 'not-tested',
          dbStatus: 'not-tested'
        },
        {
          name: '가맹점 정보 수정',
          endpoint: '/api/merchants/[id]',
          method: 'PUT',
          status: 'not-tested',
          dbStatus: 'not-tested'
        },
        {
          name: '가맹점 삭제',
          endpoint: '/api/merchants/[id]',
          method: 'DELETE',
          status: 'not-tested',
          dbStatus: 'not-tested'
        },
        {
          name: '가맹점 상태 변경',
          endpoint: '/api/merchants/[id]/status',
          method: 'PATCH',
          status: 'not-tested',
          dbStatus: 'not-tested'
        }
      ],
      transactions: [
        {
          name: '거래 내역 조회',
          endpoint: '/api/transactions',
          method: 'GET',
          status: 'not-tested',
          dbStatus: 'not-tested'
        }
      ],
      deposits: [
        {
          name: '입금 알림 조회',
          endpoint: '/api/deposit',
          method: 'GET',
          status: 'not-tested',
          dbStatus: 'not-tested'
        },
        {
          name: '테스트 입금 생성',
          endpoint: '/api/test-deposit',
          method: 'POST',
          status: 'not-tested',
          dbStatus: 'not-tested'
        }
      ]
    }
  };
}

/**
 * 테스트 상태 파일 읽기
 */
export async function readTestStatus(): Promise<ApiTestStatus> {
  try {
    const data = await fs.readFile(TEST_STATUS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // 파일이 없거나 읽을 수 없는 경우 기본 구조 반환
    return getDefaultTestStatus();
  }
}

/**
 * 테스트 상태 파일 저장
 */
export async function saveTestStatus(data: ApiTestStatus): Promise<void> {
  try {
    // docs/api 디렉토리가 없으면 생성
    await fs.mkdir(path.join(process.cwd(), 'docs', 'api'), { recursive: true });
    await fs.writeFile(TEST_STATUS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('테스트 상태 파일 저장 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 날짜 포맷팅
 */
export function formatDate(dateString?: string): string {
  if (!dateString) return '없음';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}
