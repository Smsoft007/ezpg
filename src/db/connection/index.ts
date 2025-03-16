/**
 * 데이터베이스 연결 관리 모듈
 * 연결 풀 생성, 관리 및 종료 기능을 제공합니다.
 */
import sql, { ConnectionPool } from 'mssql';
import { dbConfig } from '../config';

// 상수 정의
const MAX_RETRIES = 5;
let isConnecting = false;

/**
 * 데이터베이스 연결 풀을 가져옵니다.
 * 연결 풀이 없으면 새로 생성합니다.
 */
export async function getConnection(): Promise<ConnectionPool> {
  // 이미 연결 중이면 대기
  if (isConnecting) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return getConnection();
  }

  // 연결 풀이 있고 연결되어 있으면 반환
  if (global.dbPool && global.dbPool.connected) {
    try {
      // 연결 상태 확인
      await global.dbPool.request().query('SELECT 1 AS test');
      return global.dbPool;
    } catch (error) {
      console.error('데이터베이스 연결 상태 확인 중 오류가 발생했습니다. 재연결을 시도합니다.', error);
      global.dbPool = null;
    }
  }

  // 연결 풀 생성
  isConnecting = true;
  try {
    console.log('DB 연결 정보 확인:', {
      host: dbConfig.server,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      // 비밀번호는 보안상 로깅하지 않음
    });
    
    global.dbPool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('데이터베이스 연결 풀이 성공적으로 생성되었습니다.');
    global.dbConnectionRetries = 0;
    
    // 연결 풀 이벤트 처리
    global.dbPool.on('error', (err) => {
      console.error('데이터베이스 연결 풀 오류:', err);
      global.dbPool = null;
    });
    
    return global.dbPool;
  } catch (error) {
    console.error('데이터베이스 연결 풀 생성 중 오류:', error);
    global.dbConnectionRetries++;
    
    if (global.dbConnectionRetries < MAX_RETRIES) {
      console.log(`데이터베이스 연결 재시도 (${global.dbConnectionRetries}/${MAX_RETRIES})...`);
      // 지수 백오프 적용
      const delay = Math.min(1000 * Math.pow(2, global.dbConnectionRetries), 30000);
      await new Promise(resolve => setTimeout(resolve, delay));
      isConnecting = false;
      return getConnection();
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
 * 데이터베이스 연결을 닫습니다.
 * 애플리케이션 종료 시 호출해야 합니다.
 */
export async function closeConnection(): Promise<void> {
  if (global.dbPool) {
    try {
      await global.dbPool.close();
      global.dbPool = null;
      console.log('데이터베이스 연결 풀이 닫혔습니다.');
    } catch (error) {
      console.error('데이터베이스 연결 풀 종료 중 오류:', error);
      throw error;
    }
  }
}

export default {
  getConnection,
  closeConnection
};
