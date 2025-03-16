/**
 * 데이터베이스 모듈 테스트 파일
 * 데이터베이스 연결 및 쿼리 기능을 테스트합니다.
 */
// 필요한 모듈 직접 가져오기
const sql = require('mssql');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

// 데이터베이스 설정
const dbConfig = {
  server: process.env.DB_HOST || '137.184.125.213',
  port: parseInt(process.env.DB_PORT || '49987'),
  database: process.env.DB_NAME || 'EZPG',
  user: process.env.DB_USER || 'EZPG_USER',
  password: process.env.DB_PASSWORD || '8XWV5F70gorZBlZG7l0k5M3aowX8I63t',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || false,
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERT === 'true' || true,
    enableArithAbort: true,
    connectionTimeout: parseInt(process.env.DB_TIMEOUT || '15000'),
    requestTimeout: parseInt(process.env.DB_REQUEST_TIMEOUT || '15000')
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10'),
    min: parseInt(process.env.DB_POOL_MIN || '0'),
    idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000')
  }
};

async function testDbConnection() {
  let pool = null;
  
  try {
    console.log('데이터베이스 설정:', {
      server: dbConfig.server,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      // 비밀번호는 보안상 로깅하지 않음
    });

    console.log('데이터베이스 연결 테스트 시작...');
    pool = await new sql.ConnectionPool(dbConfig).connect();
    console.log('데이터베이스 연결 성공!');

    // 간단한 쿼리 테스트
    console.log('간단한 쿼리 테스트 실행...');
    const result = await pool.request().query('SELECT @@VERSION AS Version');
    console.log('SQL Server 버전:', result.recordset[0].Version);

    return true;
  } catch (error) {
    console.error('데이터베이스 테스트 중 오류 발생:', error);
    return false;
  } finally {
    // 연결 종료
    if (pool) {
      await pool.close();
      console.log('데이터베이스 연결 종료');
    }
  }
}

// 테스트 실행
testDbConnection()
  .then(success => {
    if (success) {
      console.log('모든 테스트가 성공적으로 완료되었습니다.');
    } else {
      console.error('테스트 실패');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('테스트 실행 중 예외 발생:', error);
    process.exit(1);
  });
