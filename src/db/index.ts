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

const MAX_RETRIES = 5;
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
      console.log('기존 데이터베이스 연결 사용');
      return global.pool;
    } catch (error) {
      console.error('데이터베이스 연결 상태 확인 중 오류가 발생했습니다. 재연결을 시도합니다.', error);
      global.pool = null;
    }
  }

  // 연결 풀 생성
  isConnecting = true;
  try {
    console.log('새 데이터베이스 연결 시도 중...', {
      server: dbConfig.server,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user
    });
    
    global.pool = await new ConnectionPool(dbConfig).connect();
    console.log('데이터베이스 연결 풀이 성공적으로 생성되었습니다.');
    global.connectionRetries = 0;
    
    // 연결 풀 이벤트 처리
    global.pool.on('error', (err) => {
      console.error('데이터베이스 연결 풀 오류:', err);
      global.pool = null;
    });
    
    return global.pool;
  } catch (error) {
    console.error('데이터베이스 연결 풀 생성 중 오류:', error);
    global.connectionRetries++;
    
    if (global.connectionRetries < MAX_RETRIES) {
      console.log(`데이터베이스 연결 재시도 (${global.connectionRetries}/${MAX_RETRIES})...`);
      // 지수 백오프 적용
      const delay = Math.min(1000 * Math.pow(2, global.connectionRetries), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
    } else {
      console.error(`최대 재시도 횟수(${MAX_RETRIES})를 초과했습니다.`);
    }
    
    isConnecting = false;
    throw new Error('데이터베이스 연결에 실패했습니다.');
  } finally {
    isConnecting = false;
  }
}

/**
 * SQL 쿼리를 실행합니다.
 * @param query SQL 쿼리
 * @param params 쿼리 파라미터
 */
export async function executeQuery<T = any>(
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
    
    const result = await request.query(query);
    return result.recordset as T[];
  } catch (error) {
    console.error('쿼리 실행 중 오류:', error);
    throw error;
  }
}

/**
 * 저장 프로시저를 실행합니다.
 * @param procedureName 프로시저 이름
 * @param params 프로시저 파라미터
 */
export async function executeProcedure<T = any>(
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
    
    const result = await request.execute(procedureName);
    return result.recordset as T[];
  } catch (error) {
    console.error('저장 프로시저 실행 중 오류:', error);
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
      global.pool = null;
      console.log('데이터베이스 연결 풀이 닫혔습니다.');
    } catch (error) {
      console.error('데이터베이스 연결 풀 종료 중 오류:', error);
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
    console.error('데이터베이스 연결 상태 확인 중 오류:', error);
    return false;
  }
}

/**
 * 테이블 존재 여부를 확인합니다.
 * @param tableName 확인할 테이블 이름
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const pool = await getPool();
    const result = await pool.request()
      .input('tableName', tableName)
      .query(`
        SELECT COUNT(*) AS tableCount
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_NAME = @tableName
      `);
    
    return result.recordset[0].tableCount > 0;
  } catch (error) {
    console.error(`테이블 ${tableName} 존재 여부 확인 중 오류:`, error);
    return false;
  }
}
