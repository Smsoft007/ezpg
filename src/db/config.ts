/**
 * 데이터베이스 연결 설정
 */
import { config as dotenvConfig } from 'dotenv';

// .env 파일에서 환경 변수 로드
dotenvConfig({ path: './.env' });

/**
 * 데이터베이스 설정
 */
export const dbConfig = {
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_NAME || 'EZPG',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourPassword',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true' || true,
    enableArithAbort: true,
    connectionTimeout: parseInt(process.env.DB_TIMEOUT || '30000'),
    requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '30000'),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '0'),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000')
    }
  }
};

// 데이터베이스 연결 정보 (개발용)
export const devDbConfig = {
  server: '137.194.125.213',
  port: 49987,
  database: 'EZPG',
  user: 'EZPG_USER',
  password: '8XWV5F70gorZBlZG7l0k5M3aowX8I63t',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    connectionTimeout: 15000,
    requestTimeout: 15000,
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  }
};
