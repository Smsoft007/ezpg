import { NextRequest, NextResponse } from 'next/server';
import { restoreDatabase } from '@/db/backup';
import { getServerSession, isAdmin, isAuthenticated } from '@/lib/session';

/**
 * POST: 데이터베이스 복원 요청
 */
export async function POST(req: NextRequest) {
  try {
    // 세션 확인 (관리자만 접근 가능)
    const session = await getServerSession();
    if (!isAuthenticated(session)) {
      return NextResponse.json({
        success: false,
        error: '인증되지 않은 사용자입니다.'
      }, { status: 401 });
    }

    // 관리자 권한 확인
    if (!isAdmin(session)) {
      return NextResponse.json({
        success: false,
        error: '관리자 권한이 필요합니다.'
      }, { status: 403 });
    }

    // 요청 데이터 파싱
    const data = await req.json();
    const { backupId, restoreOptions } = data;

    // 필수 필드 검증
    if (!backupId) {
      return NextResponse.json(
        { error: '백업 ID는 필수입니다.' },
        { status: 400 }
      );
    }

    // 복원 옵션 기본값 설정
    const options = {
      overwriteExisting: true,
      ...restoreOptions,
    };

    // 복원 요청
    const result = await restoreDatabase({
      backupId,
      restoreOptions: options,
      userId: session.user?.email || 'unknown',
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('데이터베이스 복원 중 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '데이터베이스를 복원할 수 없습니다.' },
      { status: 500 }
    );
  }
}
