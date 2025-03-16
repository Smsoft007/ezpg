/**
 * 데이터베이스 모듈 테스트 파일
 * 데이터베이스 연결 및 쿼리 기능을 테스트합니다.
 */
// CommonJS 스타일 import 사용
const db = require('./index');

async function testDbConnection() {
  try {
    console.log('데이터베이스 설정:', {
      server: db.dbConfig.server,
      port: db.dbConfig.port,
      database: db.dbConfig.database,
      user: db.dbConfig.user,
      // 비밀번호는 보안상 로깅하지 않음
    });

    console.log('데이터베이스 연결 테스트 시작...');
    const pool = await db.getConnection();
    console.log('데이터베이스 연결 성공!');

    // 간단한 쿼리 테스트
    console.log('간단한 쿼리 테스트 실행...');
    const result = await db.executeQuery('SELECT @@VERSION AS Version');
    console.log('SQL Server 버전:', result[0].Version);

    // 연결 종료
    await pool.close();
    console.log('데이터베이스 연결 종료');

    return true;
  } catch (error) {
    console.error('데이터베이스 테스트 중 오류 발생:', error);
    return false;
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
