/**
 * 데이터베이스 연결 설정
 */
import { config as dotenvConfig } from 'dotenv';
import path from 'path';

// .env 파일에서 환경 변수 로드 (절대 경로 사용)
dotenvConfig({ path: path.resolve(process.cwd(), '.env') });

// 환경 변수 로깅 (디버깅용)
console.log('DB 연결 정보 확인:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  // 비밀번호는 보안상 로깅하지 않음
});

/**
 * 데이터베이스 설정
 * 환경 변수가 없는 경우 개발용 설정을 기본값으로 사용
 */
export const dbConfig = {
  server: process.env.DB_HOST || '137.194.125.213',
  port: parseInt(process.env.DB_PORT || '49987'),
  database: process.env.DB_NAME || 'EZPG',
  user: process.env.DB_USER || 'EZPG_USER',
  password: process.env.DB_PASSWORD || '8XWV5F70gorZBlZG7l0k5M3aowX8I63t',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || false,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true' || true,
    enableArithAbort: true,
    connectionTimeout: parseInt(process.env.DB_TIMEOUT || '15000'),
    requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '15000'),
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '0'),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000')
    }
  }
};
