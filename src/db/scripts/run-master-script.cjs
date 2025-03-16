/**
 * 데이터베이스 마스터 스크립트 실행 유틸리티 (CommonJS 버전)
 */
const fs = require('fs');
const path = require('path');
const mssql = require('mssql');

// 데이터베이스 설정
const dbConfig = {
  server: process.env.DB_HOST || '137.184.125.213',
  port: parseInt(process.env.DB_PORT || '49987'),
  database: process.env.DB_NAME || 'EZPG',
  user: process.env.DB_USER || 'EZPG_USER',
  password: process.env.DB_PASSWORD || '8XWV5F70gorZBlZG7l0k5M3aowX8I63t',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    requestTimeout: 300000 // 5분 타임아웃 설정
  }
};

// 스크립트 경로 설정
const SCRIPTS_DIR = path.join(process.cwd(), 'src', 'db', 'scripts');
const MASTER_SCRIPT = path.join(SCRIPTS_DIR, 'master-script.sql');

// 전역 변수로 풀 저장
let pool = null;

/**
 * 데이터베이스 풀을 가져옵니다.
 */
async function getPool() {
  if (!pool) {
    try {
      console.log('데이터베이스 연결 중...');
      pool = await new mssql.ConnectionPool(dbConfig).connect();
      console.log('데이터베이스 연결 성공!');
    } catch (error) {
      console.error('데이터베이스 연결 실패:', error);
      throw error;
    }
  }
  return pool;
}

/**
 * 데이터베이스 풀을 닫습니다.
 */
async function closePool() {
  if (pool) {
    try {
      await pool.close();
      pool = null;
      console.log('데이터베이스 연결 종료');
    } catch (error) {
      console.error('데이터베이스 연결 종료 중 오류:', error);
    }
  }
}

/**
 * SQL 쿼리를 실행합니다.
 * @param {string} query 실행할 SQL 쿼리
 * @param {any} params 쿼리 파라미터 (선택 사항)
 */
async function executeQuery(query, params = {}) {
  const connection = await getPool();
  try {
    const request = connection.request();
    
    // 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('쿼리 실행 중 오류:', error);
    throw error;
  }
}

/**
 * SQL 스크립트 파일을 실행합니다.
 * @param {string} filePath 실행할 SQL 파일 경로
 */
async function runSqlScript(filePath) {
  try {
    console.log(`스크립트 실행 중: ${filePath}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // GO 문으로 구분된 배치로 분리
    const batches = sql.split(/^\s*GO\s*$/m).filter(batch => batch.trim() !== '');
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i].trim();
      if (batch) {
        try {
          await executeQuery(batch);
          console.log(`배치 ${i + 1}/${batches.length} 실행 완료`);
        } catch (error) {
          console.error(`배치 ${i + 1}/${batches.length} 실행 중 오류:`, error);
          
          // 배치 내용 출력 (오류 디버깅용)
          console.log('배치 내용:');
          console.log('-----------------------------------');
          console.log(batch.substring(0, 500) + (batch.length > 500 ? '...' : ''));
          console.log('-----------------------------------');
          
          throw error;
        }
      }
    }
    
    console.log(`스크립트 실행 완료: ${filePath}`);
  } catch (error) {
    console.error(`스크립트 실행 실패: ${filePath}`, error);
    throw error;
  }
}

/**
 * 마스터 스크립트를 실행합니다.
 */
async function runMasterScript() {
  try {
    console.log('마스터 스크립트 실행 시작...');
    await runSqlScript(MASTER_SCRIPT);
    console.log('마스터 스크립트 실행 완료!');
  } catch (error) {
    console.error('마스터 스크립트 실행 중 오류:', error);
    throw error;
  }
}

/**
 * 개별 스크립트를 순차적으로 실행합니다.
 */
async function runIndividualScripts() {
  try {
    console.log('개별 스크립트 순차 실행 시작...');
    
    // 파일 목록 가져오기 및 정렬
    const files = fs.readdirSync(SCRIPTS_DIR)
      .filter(file => file.endsWith('.sql') && file !== 'master-script.sql')
      .sort((a, b) => {
        // create-tables.sql 파일을 가장 먼저 실행
        if (a === 'create-tables.sql') return -1;
        if (b === 'create-tables.sql') return 1;
        
        // 그 다음 create로 시작하는 파일들을 실행
        if (a.startsWith('create') && !b.startsWith('create')) return -1;
        if (!a.startsWith('create') && b.startsWith('create')) return 1;
        
        // sp_로 시작하는 파일들은 나중에 실행
        if (a.startsWith('sp_') && !b.startsWith('sp_')) return 1;
        if (!a.startsWith('sp_') && b.startsWith('sp_')) return -1;
        
        // 나머지는 알파벳 순서로 실행
        return a.localeCompare(b);
      });
    
    if (files.length === 0) {
      console.log(`${SCRIPTS_DIR} 디렉토리에 실행할 SQL 스크립트가 없습니다.`);
      return;
    }
    
    console.log(`총 ${files.length}개의 스크립트 파일을 실행합니다...`);
    console.log('실행 순서:');
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });
    
    // 각 파일 실행
    for (const file of files) {
      const filePath = path.join(SCRIPTS_DIR, file);
      await runSqlScript(filePath);
    }
    
    console.log('모든 개별 스크립트 실행 완료!');
  } catch (error) {
    console.error('개별 스크립트 실행 중 오류:', error);
    throw error;
  }
}

/**
 * 메인 함수
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || 'master'; // 기본값은 마스터 스크립트 실행
  
  try {
    console.log('데이터베이스 스크립트 실행 시작...');
    
    if (mode === 'master') {
      // 마스터 스크립트 실행
      await runMasterScript();
    } else if (mode === 'individual') {
      // 개별 스크립트 순차 실행
      await runIndividualScripts();
    } else {
      console.error('잘못된 실행 모드입니다. "master" 또는 "individual"을 사용하세요.');
      process.exit(1);
    }
    
    console.log('모든 데이터베이스 스크립트 실행 완료!');
  } catch (error) {
    console.error('스크립트 실행 중 오류 발생:', error);
    process.exit(1);
  } finally {
    // 데이터베이스 연결 종료
    await closePool();
  }
}

// 스크립트 실행
main();
