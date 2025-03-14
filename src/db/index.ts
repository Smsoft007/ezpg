/**
 * 데이터베이스 연결 및 쿼리 실행을 관리하는 모듈
 */
import { ConnectionPool, IResult, config as mssqlConfig } from 'mssql';
import { dbConfig } from '@/db/config';

// 전역 변수 선언
declare global {
  var connectionRetries: number;
  var pool: ConnectionPool | null;
}

// 전역 변수 초기화
global.connectionRetries = 0;
global.pool = null;

const MAX_RETRIES = 3;
let isConnecting = false;

/**
 * 데이터베이스 연결 풀을 가져옵니다.
 * 연결 풀이 없으면 새로 생성합니다.
 */
export async function getPool(): Promise<ConnectionPool> {
  // 이미 연결 중이면 대기
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getPool();
  }

  // 연결 풀이 있고 연결되어 있으면 반환
  if (global.pool && global.pool.connected) {
    try {
      // 연결 상태 확인
      await global.pool.request().query('SELECT 1 AS test');
      return global.pool;
    } catch (error) {
      console.log('데이터베이스 연결 상태 확인 중 오류가 발생했습니다. 재연결을 시도합니다.');
      global.pool = null;
    }
  }

  // 연결 풀 생성
  isConnecting = true;
  try {
    global.pool = await new ConnectionPool(dbConfig).connect();
    console.log('데이터베이스 연결 풀이 생성되었습니다.');
    global.connectionRetries = 0;
    
    // 연결 풀 이벤트 처리
    global.pool.on('error', (err) => {
      console.error('데이터베이스 연결 풀 오류:', err);
      global.pool = null; // 오류 발생 시 풀 초기화
    });
    
    return global.pool;
  } catch (error) {
    console.error('데이터베이스 연결 풀 생성 중 오류가 발생했습니다:', error);
    
    // 재시도 로직
    if (global.connectionRetries < MAX_RETRIES) {
      global.connectionRetries++;
      console.log(`데이터베이스 연결 재시도 (${global.connectionRetries}/${MAX_RETRIES})...`);
      
      // 모의 데이터 모드로 전환 여부 확인
      if (global.connectionRetries >= MAX_RETRIES) {
        console.log('데이터베이스 연결 실패. 모의 데이터 모드로 전환합니다.');
      }
      
      isConnecting = false;
      return getPool();
    }
    
    throw error;
  } finally {
    isConnecting = false;
  }
}

/**
 * SQL 쿼리를 실행합니다.
 * @param query SQL 쿼리
 * @param params 쿼리 파라미터
 */
export async function executeQuery<T>(
  query: string,
  params: Record<string, any> = {}
): Promise<T[]> {
  try {
    const pool = await getPool();
    const request = pool.request();

    // 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result = await request.query<T>(query);
    return result.recordset;
  } catch (error) {
    console.error('쿼리 실행 중 오류가 발생했습니다:', error);
    
    // 모의 데이터 모드인 경우 빈 배열 반환
    if (global.connectionRetries >= MAX_RETRIES) {
      console.log('모의 데이터 모드: 빈 결과 반환');
      return [] as T[];
    }
    
    throw error;
  }
}

/**
 * 저장 프로시저를 실행합니다.
 * @param procedureName 프로시저 이름
 * @param params 프로시저 파라미터
 */
export async function executeProcedure<T>(
  procedureName: string,
  params: Record<string, any> = {}
): Promise<T[]> {
  try {
    const pool = await getPool();
    const request = pool.request();

    // 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    const result = await request.execute<T>(procedureName);
    return result.recordset;
  } catch (error) {
    console.error(`프로시저 ${procedureName} 실행 중 오류가 발생했습니다:`, error);
    
    // 모의 데이터 모드인 경우 빈 배열 반환
    if (global.connectionRetries >= MAX_RETRIES) {
      console.log(`모의 데이터 모드: 프로시저 ${procedureName}에 대한 빈 결과 반환`);
      return [] as T[];
    }
    
    throw error;
  }
}

/**
 * 데이터베이스 연결을 닫습니다.
 * 애플리케이션 종료 시 호출해야 합니다.
 */
export async function closePool(): Promise<void> {
  if (global.pool) {
    try {
      await global.pool.close();
      console.log('데이터베이스 연결 풀이 닫혔습니다.');
      global.pool = null;
    } catch (error) {
      console.error('데이터베이스 연결 풀을 닫는 중 오류가 발생했습니다:', error);
      throw error;
    }
  }
}

/**
 * 데이터베이스 연결 상태를 확인합니다.
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const pool = await getPool();
    await pool.request().query('SELECT 1 AS test');
    return true;
  } catch (error) {
    console.error('데이터베이스 연결 상태 확인 중 오류가 발생했습니다:', error);
    return false;
  }
}
