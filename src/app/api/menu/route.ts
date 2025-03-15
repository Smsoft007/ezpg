import { NextRequest, NextResponse } from 'next/server';
import { getMenuItems } from '@/app/api/menu/service';

/**
 * GET: 메뉴 항목 가져오기
 * 사용자 역할에 따른 메뉴 항목을 제공합니다.
 */
export async function GET(req: NextRequest) {
  try {
    // URL에서 사용자 역할 쿼리 파라미터 가져오기
    const url = new URL(req.url);
    const role = url.searchParams.get('role') || 'user';
    
    // 사용자 역할에 맞는 메뉴 항목 가져오기
    const menuItems = getMenuItems(role);
    
    return NextResponse.json({
      success: true,
      data: menuItems
    });
  } catch (error) {
    console.error('메뉴 항목을 가져오는 중 오류 발생:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '메뉴 항목을 가져올 수 없습니다.'
    }, { status: 500 });
  }
}
