import { NextRequest, NextResponse } from 'next/server';
import { getBackupList, createBackup, deleteBackup, getBackupDownloadUrl } from '@/db/backup';
import { getServerSession, isAdmin, isAuthenticated } from '@/lib/session';

/**
 * GET: 백업 목록 조회
 */
export async function GET(req: NextRequest) {
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

    // 백업 목록 조회
    const result = await getBackupList();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('백업 목록 조회 중 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '백업 목록을 조회할 수 없습니다.' },
      { status: 500 }
    );
  }
}

/**
 * POST: 새 백업 생성
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
    const { backupName, description, includeSchema } = data;

    // 필수 필드 검증
    if (!backupName) {
      return NextResponse.json(
        { error: '백업 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    // 백업 생성 요청
    const result = await createBackup({
      backupName,
      description,
      includeSchema: includeSchema !== false, // 기본값은 true
      userId: session.user?.email || 'unknown',
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('백업 생성 중 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '백업을 생성할 수 없습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: 백업 삭제
 */
export async function DELETE(req: NextRequest) {
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

    // URL 파라미터에서 백업 ID 추출
    const url = new URL(req.url);
    const backupId = url.searchParams.get('id');

    if (!backupId) {
      return NextResponse.json(
        { error: '백업 ID는 필수입니다.' },
        { status: 400 }
      );
    }

    // 백업 삭제 요청
    const result = await deleteBackup({
      backupId,
      userId: session.user?.email || 'unknown',
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('백업 삭제 중 오류:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '백업을 삭제할 수 없습니다.' },
      { status: 500 }
    );
  }
}
