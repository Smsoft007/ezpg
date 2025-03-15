/**
 * 데이터베이스 스크립트를 실행하는 유틸리티
 */
import fs from 'fs';
import path from 'path';
import { executeQuery, getPool, closePool } from '@/db';

// 스크립트 경로 설정
const SCRIPTS_DIR = path.join(process.cwd(), 'src', 'db', 'procedures');

/**
 * SQL 스크립트 파일을 실행합니다.
 * @param filePath 실행할 SQL 파일 경로
 */
async function runSqlScript(filePath: string): Promise<void> {
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
          throw error;
        }
      }
    }
    
    console.log(`스크립트 실행 완료: ${filePath}`);
  } catch (error) {
    console.error(`스크립트 실행 중 오류 (${filePath}):`, error);
    throw error;
  }
}

/**
 * 지정된 디렉토리의 모든 SQL 스크립트 파일을 실행합니다.
 * @param directory 스크립트 파일이 있는 디렉토리 경로
 * @param filePattern 실행할 파일 패턴 (정규식)
 */
async function runAllScripts(directory: string, filePattern: RegExp = /\.sql$/): Promise<void> {
  try {
    // 파일 목록 가져오기
    const files = fs.readdirSync(directory)
      .filter(file => filePattern.test(file))
      .sort(); // 파일 이름 순으로 정렬
    
    console.log(`실행할 스크립트 파일 (${files.length}개):`);
    files.forEach(file => console.log(`- ${file}`));
    
    // 스크립트 순서 정의 (기본 테이블 스크립트가 먼저 실행되도록)
    const orderedFiles = [
      ...files.filter(file => file.includes('_base')),
      ...files.filter(file => !file.includes('_base') && !file.includes('_sample_data')),
      ...files.filter(file => file.includes('_sample_data'))
    ];
    
    // 스크립트 실행
    for (const file of orderedFiles) {
      const filePath = path.join(directory, file);
      await runSqlScript(filePath);
    }
    
    console.log('모든 스크립트 실행 완료');
  } catch (error) {
    console.error('스크립트 실행 중 오류:', error);
    throw error;
  }
}

/**
 * 메인 함수
 */
async function main() {
  try {
    // 데이터베이스 연결
    await getPool();
    
    // 모든 스크립트 실행
    await runAllScripts(SCRIPTS_DIR);
    
    console.log('데이터베이스 스크립트 실행이 완료되었습니다.');
  } catch (error) {
    console.error('스크립트 실행 중 오류가 발생했습니다:', error);
    process.exit(1);
  } finally {
    // 데이터베이스 연결 종료
    await closePool();
  }
}

// 스크립트가 직접 실행된 경우에만 main 함수 호출
if (require.main === module) {
  main();
}

export { runSqlScript, runAllScripts };
