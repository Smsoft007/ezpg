import { NextRequest, NextResponse } from 'next/server';
import { getJobStatus } from '@/db/backup';
import { getServerSession, isAdmin, isAuthenticated } from '@/lib/session';

/**
 * GET: 데이터베이스 작업 상태 조회
 */
export async function GET(req: NextRequest) {
  try {
    // 세션 확인 (관리자만 접근 가능)
    const session = await getServerSession();
    if (!isAuthenticated(session)) {
      return NextResponse.json(
        { error: '인증되지 않은 요청입니다.' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인 
    if (!isAdmin(session)) {
      return NextResponse.json(
        { error: '권한이 없습니다.' },
        { status: 403 }
      );
    }

    // URL 파라미터에서 작업 ID 추출
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { error: '작업 ID는 필수입니다.' },
        { status: 400 }
      );
    }

    // 작업 상태 조회
    const result = await getJobStatus({ jobId });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('작업 상태 조회 중 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '작업 상태를 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}
