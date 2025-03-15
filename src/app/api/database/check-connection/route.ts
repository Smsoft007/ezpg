import { NextRequest, NextResponse } from 'next/server';
import { checkConnection, getPool } from '@/db';
import { dbConfig } from '@/db/config';

/**
 * GET: 데이터베이스 연결 상태 확인 및 상세 정보 제공
 */
export async function GET(req: NextRequest) {
  try {
    // 데이터베이스 연결 상태 확인
    const isConnected = await checkConnection();
    
    // 연결 정보 (비밀번호 제외)
    const connectionInfo = {
      server: dbConfig.server,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      options: {
        encrypt: dbConfig.options.encrypt,
        trustServerCertificate: dbConfig.options.trustServerCertificate,
        connectionTimeout: dbConfig.options.connectionTimeout,
        requestTimeout: dbConfig.options.requestTimeout,
        pool: dbConfig.options.pool
      }
    };
    
    if (isConnected) {
      // 추가 정보 조회 (서버 버전 등)
      try {
        const pool = await getPool();
        const versionResult = await pool.request().query('SELECT @@VERSION as version');
        const version = versionResult.recordset[0]?.version || '알 수 없음';
        
        return NextResponse.json({
          success: true,
          message: '데이터베이스 연결이 정상적으로 작동 중입니다.',
          connectionInfo,
          serverInfo: {
            version: version.split('\n')[0], // 첫 번째 줄만 표시
          },
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        // 버전 정보 조회 실패해도 연결은 성공으로 간주
        return NextResponse.json({
          success: true,
          message: '데이터베이스 연결이 정상적으로 작동 중이지만, 서버 정보를 조회할 수 없습니다.',
          connectionInfo,
          error: error instanceof Error ? error.message : '서버 정보 조회 실패',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      return NextResponse.json({
        success: false,
        message: '데이터베이스 연결에 실패했습니다.',
        connectionInfo,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('데이터베이스 연결 확인 중 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '데이터베이스 연결을 확인할 수 없습니다.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
