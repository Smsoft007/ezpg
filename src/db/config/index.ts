/**
 * 데이터베이스 설정 모듈
 * 모든 데이터베이스 연결 설정을 중앙화하여 관리합니다.
 */
import { config as dotenvConfig } from 'dotenv';
import path from 'path';
import { ConnectionPool } from 'mssql';

// .env 파일에서 환경 변수 로드
dotenvConfig({ path: path.resolve(process.cwd(), '.env') });

/**
 * 데이터베이스 환경 변수 설정
 */
export const dbEnv = {
  host: process.env.DB_HOST || '137.194.125.213',
  port: parseInt(process.env.DB_PORT || '49987'),
  database: process.env.DB_NAME || 'EZPG',
  user: process.env.DB_USER || 'EZPG_USER',
  password: process.env.DB_PASSWORD || '8XWV5F70gorZBlZG7l0k5M3aowX8I63t',
  encrypt: process.env.DB_ENCRYPT === 'true' || false,
  trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true' || true,
  connectionTimeout: parseInt(process.env.DB_TIMEOUT || '15000'),
  requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '15000'),
  poolMax: parseInt(process.env.DB_POOL_MAX || '10'),
  poolMin: parseInt(process.env.DB_POOL_MIN || '0'),
  poolIdleTimeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000')
};

/**
 * MSSQL 연결 설정
 */
export const dbConfig = {
  server: dbEnv.host,
  port: dbEnv.port,
  database: dbEnv.database,
  user: dbEnv.user,
  password: dbEnv.password,
  options: {
    encrypt: dbEnv.encrypt,
    trustServerCertificate: dbEnv.trustServerCertificate,
    enableArithAbort: true,
    connectionTimeout: dbEnv.connectionTimeout,
    requestTimeout: dbEnv.requestTimeout
  },
  pool: {
    max: dbEnv.poolMax,
    min: dbEnv.poolMin,
    idleTimeoutMillis: dbEnv.poolIdleTimeout
  }
};

// sqlConfig는 dbConfig와 동일합니다 (이름 변경을 위한 별칭)
export const sqlConfig = dbConfig;

/**
 * 데이터베이스 설정 로깅 (개발용)
 */
export function logDbConfig() {
  console.log('DB 연결 정보 확인:', {
    host: dbEnv.host,
    port: dbEnv.port,
    database: dbEnv.database,
    user: dbEnv.user,
    // 비밀번호는 보안상 로깅하지 않음
  });
}

// 전역 타입 선언
declare global {
  var dbPool: ConnectionPool | null;
  var dbConnectionRetries: number;
}

// 전역 변수 초기화
global.dbPool = null;
global.dbConnectionRetries = 0;

// 기본 내보내기
export default {
  dbConfig,
  sqlConfig,
  logDbConfig,
  dbEnv
};
