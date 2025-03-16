/**
 * 데이터베이스 모듈
 * 데이터베이스 연결, 쿼리 실행, 프로시저 호출을 위한 중앙화된 인터페이스를 제공합니다.
 */
import { dbConfig } from './config';
import { getConnection, closeConnection } from './connection';
import { 
  executeProcedure, 
  executeProcedureWithFullResult, 
  executeProcedureWithOutput 
} from './procedures';
import {
  executeQuery,
  executeQuerySingle,
  executeTransaction,
  executeNonQuery
} from './query';

/**
 * 데이터베이스 연결 상태를 확인합니다.
 */
export async function checkConnection(): Promise<boolean> {
  try {
    const pool = await getConnection();
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
    const pool = await getConnection();
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

// 데이터베이스 설정 내보내기
export { dbConfig };

// 데이터베이스 연결 관리 함수 내보내기
export { getConnection, closeConnection };

// 쿼리 실행 함수 내보내기
export { executeQuery, executeQuerySingle, executeTransaction, executeNonQuery };

// 프로시저 실행 함수 내보내기
export { executeProcedure, executeProcedureWithFullResult, executeProcedureWithOutput };

// 기존 함수명 호환성 유지
export const getPool = getConnection;
export const closePool = closeConnection;
export const sqlConfig = dbConfig;

/**
 * 데이터베이스 설정 로깅 (개발용)
 */
export function logDbConfig() {
  console.log('DB 연결 정보 확인:', {
    host: dbConfig.server,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    // 비밀번호는 보안상 로깅하지 않음
  });
}

// 기본 내보내기
export default {
  // 설정
  dbConfig,
  sqlConfig: dbConfig,
  logDbConfig,
  
  // 연결 관리
  getConnection,
  closeConnection,
  
  // 쿼리 실행
  executeQuery,
  executeQuerySingle,
  executeTransaction,
  executeNonQuery,
  
  // 프로시저 실행
  executeProcedure,
  executeProcedureWithFullResult,
  executeProcedureWithOutput,
  
  // 유틸리티
  checkConnection,
  tableExists,
  
  // 기존 함수명 호환성 유지
  getPool: getConnection,
  closePool: closeConnection
};
