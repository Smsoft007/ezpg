/**
 * 데이터베이스 초기 설정 및 샘플 데이터 생성 스크립트
 */
import { runAllScripts } from './run-scripts';
import path from 'path';

const SCRIPTS_DIR = path.join(process.cwd(), 'src', 'db', 'procedures');

/**
 * 데이터베이스 초기 설정 및 샘플 데이터 생성
 */
async function setupDatabase() {
  try {
    console.log('데이터베이스 초기 설정을 시작합니다...');
    
    // 기본 테이블 스크립트 실행
    console.log('1. 기본 테이블 생성 중...');
    await runAllScripts(SCRIPTS_DIR, /_base\.sql$/);
    
    // 거래 관련 저장 프로시저 실행
    console.log('2. 거래 관련 저장 프로시저 생성 중...');
    await runAllScripts(SCRIPTS_DIR, /transaction_(deposit|withdrawal|common)\.sql$/);
    
    // 샘플 데이터 생성 (선택적)
    const createSampleData = process.argv.includes('--with-sample-data');
    if (createSampleData) {
      console.log('3. 샘플 데이터 생성 중...');
      await runAllScripts(SCRIPTS_DIR, /transaction_sample_data\.sql$/);
    }
    
    console.log('데이터베이스 초기 설정이 완료되었습니다.');
  } catch (error) {
    console.error('데이터베이스 초기 설정 중 오류가 발생했습니다:', error);
    process.exit(1);
  }
}

// 스크립트가 직접 실행된 경우에만 setupDatabase 함수 호출
if (require.main === module) {
  setupDatabase();
}

export { setupDatabase };
