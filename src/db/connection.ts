import sql from 'mssql';
import { ENV } from '@/lib/env';

// 데이터베이스 연결 설정
export const sqlConfig = {
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  server: ENV.DB_HOST,
  port: Number(ENV.DB_PORT),
  database: ENV.DB_NAME,
  options: {
    encrypt: false, // Azure일 경우 true로 설정
    trustServerCertificate: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// SQL 연결 풀 생성
let pool: sql.ConnectionPool | null = null;

/**
 * 데이터베이스 연결 풀을 가져오거나 새로 생성합니다.
 */
export async function getConnection(): Promise<sql.ConnectionPool> {
  try {
    if (pool) return pool;
    
    console.log('DB 연결 정보 확인:', {
      host: ENV.DB_HOST,
      port: ENV.DB_PORT,
      database: ENV.DB_NAME,
      user: ENV.DB_USER
    });
    
    pool = await new sql.ConnectionPool(sqlConfig).connect();
    return pool;
  } catch (error) {
    console.error('데이터베이스 연결 오류:', error);
    throw error;
  }
}

/**
 * 데이터베이스 연결을 종료합니다.
 */
export async function closeConnection(): Promise<void> {
  try {
    if (pool) {
      await pool.close();
      pool = null;
    }
  } catch (error) {
    console.error('데이터베이스 연결 종료 오류:', error);
  }
}
