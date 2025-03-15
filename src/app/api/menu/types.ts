/**
 * 메뉴 항목 인터페이스
 */
export interface MenuItem {
  id: string;         // 메뉴 고유 ID
  title: string;      // 메뉴 제목
  href?: string;      // 링크 경로 (소메뉴인 경우에만)
  icon?: string;      // 아이콘 이름
  submenu?: MenuItem[]; // 서브메뉴 항목
  adminOnly?: boolean;  // 관리자 전용 메뉴 여부
  merchantOnly?: boolean; // 가맹점 전용 메뉴 여부
  roles?: string[];    // 접근 가능한 역할 목록
  order: number;      // 정렬 순서
  isActive?: boolean; // 활성화 여부
}

/**
 * 메뉴 응답 인터페이스
 */
export interface MenuResponse {
  success: boolean;
  data?: MenuItem[];
  error?: string;
}

/**
 * 사용자 역할 타입
 */
export type UserRole = 'admin' | 'merchant' | 'user';
