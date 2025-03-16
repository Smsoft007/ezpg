/**
 * SQL 쿼리 실행 모듈
 * SQL 쿼리 실행을 위한 표준화된 인터페이스를 제공합니다.
 */
import { getConnection } from '../connection';

/**
 * SQL 쿼리를 실행합니다.
 * @param query SQL 쿼리
 * @param params 쿼리 파라미터
 * @returns 쿼리 실행 결과
 */
export async function executeQuery<T = any>(
  query: string,
  params: Record<string, any> = {}
): Promise<T[]> {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.query(query);
    return result.recordset as T[];
  } catch (error) {
    console.error('쿼리 실행 중 오류:', error);
    console.error('실행된 쿼리:', query);
    console.error('파라미터:', params);
    throw error;
  }
}

/**
 * 단일 결과를 반환하는 SQL 쿼리를 실행합니다.
 * @param query SQL 쿼리
 * @param params 쿼리 파라미터
 * @returns 단일 결과 객체 또는 undefined
 */
export async function executeQuerySingle<T = any>(
  query: string,
  params: Record<string, any> = {}
): Promise<T | undefined> {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : undefined;
}

/**
 * 트랜잭션 내에서 여러 쿼리를 실행합니다.
 * @param queries 실행할 쿼리 배열 {query: string, params: Record<string, any>}
 * @returns 각 쿼리의 실행 결과 배열
 */
export async function executeTransaction<T = any>(
  queries: Array<{query: string, params?: Record<string, any>}>
): Promise<T[][]> {
  const pool = await getConnection();
  const transaction = pool.transaction();
  
  try {
    await transaction.begin();
    
    const results: T[][] = [];
    
    for (const { query, params = {} } of queries) {
      const request = transaction.request();
      
      // 파라미터 추가
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });
      
      const result = await request.query(query);
      results.push(result.recordset as T[]);
    }
    
    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();
    console.error('트랜잭션 실행 중 오류:', error);
    throw error;
  }
}

/**
 * 데이터베이스 변경(INSERT, UPDATE, DELETE)을 수행하는 쿼리를 실행합니다.
 * @param query SQL 쿼리
 * @param params 쿼리 파라미터
 * @returns 영향받은 행 수
 */
export async function executeNonQuery(
  query: string,
  params: Record<string, any> = {}
): Promise<number> {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.query(query);
    return result.rowsAffected.reduce((sum, count) => sum + count, 0);
  } catch (error) {
    console.error('쿼리 실행 중 오류:', error);
    console.error('실행된 쿼리:', query);
    console.error('파라미터:', params);
    throw error;
  }
}

export default {
  executeQuery,
  executeQuerySingle,
  executeTransaction,
  executeNonQuery
};
