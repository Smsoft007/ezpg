import { MenuItem, UserRole } from './types';

/**
 * 전체 메뉴 항목 정의
 * 대메뉴와 소메뉴로 구성됩니다.
 */
const allMenuItems: MenuItem[] = [
  {
    id: 'dashboard',
    title: '대시보드',
    icon: 'LayoutDashboard',
    order: 10,
    submenu: [
      { id: 'main-dashboard', title: '메인 대시보드', href: '/dashboard', order: 10 },
      { id: 'merchant-dashboard', title: '가맹점별 대시보드', href: '/dashboard/merchant-dashboard', adminOnly: true, order: 20 },
      { id: 'transaction-dashboard', title: '거래 통계 대시보드', href: '/dashboard/transaction-dashboard', order: 30 },
      { id: 'my-merchant-dashboard', title: '내 가맹점 대시보드', href: '/dashboard/my-merchant', merchantOnly: true, order: 40 },
    ]
  },
  {
    id: 'merchant-management',
    title: '가맹점 관리',
    icon: 'Store',
    adminOnly: true,
    order: 20,
    submenu: [
      { id: 'merchant-list', title: '가맹점 목록', href: '/dashboard/merchants', order: 10 },
      { id: 'merchant-new', title: '가맹점 등록', href: '/dashboard/merchants/new', order: 20 },
      { id: 'merchant-details', title: '가맹점 상세', href: '/dashboard/merchants/details', order: 30 },
      { id: 'merchant-settings', title: '가맹점 설정', href: '/dashboard/merchants/settings', order: 40 },
      { id: 'merchant-balance', title: '가맹점 잔액 관리', href: '/dashboard/merchants/balance', order: 50 },
      { id: 'merchant-fees', title: '가맹점 수수료 관리', href: '/dashboard/merchants/fees', order: 60 },
      { id: 'merchant-api-keys', title: 'API 키 관리', href: '/dashboard/merchants/api-keys', order: 70 },
      { id: 'merchant-verification', title: '가맹점 검증', href: '/dashboard/merchants/verification', order: 80 },
    ]
  },
  {
    id: 'my-merchant',
    title: '내 가맹점 정보',
    icon: 'Store',
    merchantOnly: true,
    order: 30,
    submenu: [
      { id: 'my-merchant-info', title: '가맹점 정보', href: '/dashboard/my-merchant/info', order: 10 },
      { id: 'my-merchant-api-keys', title: 'API 키 관리', href: '/dashboard/my-merchant/api-keys', order: 20 },
      { id: 'my-merchant-settings', title: '결제 설정', href: '/dashboard/my-merchant/settings', order: 30 },
      { id: 'my-merchant-settlements', title: '정산 내역', href: '/dashboard/my-merchant/settlements', order: 40 },
    ]
  },
  {
    id: 'transaction-management',
    title: '거래 관리',
    icon: 'CreditCard',
    order: 40,
    submenu: [
      { id: 'transaction-deposits', title: '입금 거래', href: '/dashboard/transactions/deposits', order: 10 },
      { id: 'transaction-withdrawals', title: '출금 거래', href: '/dashboard/transactions/withdrawals', order: 20 },
      { id: 'transaction-failed', title: '실패 거래', href: '/dashboard/transactions/failed', order: 30 },
      { id: 'transaction-pending', title: '대기 거래', href: '/dashboard/transactions/pending', order: 40 },
      { id: 'transaction-logs', title: '거래 로그', href: '/dashboard/transactions/logs', adminOnly: true, order: 50 },
      { id: 'transaction-search', title: '거래 검색', href: '/dashboard/transactions/search', order: 60 },
      { id: 'transaction-batch', title: '일괄 작업', href: '/dashboard/transactions/batch', adminOnly: true, order: 70 },
    ]
  },
  {
    id: 'withdrawal-management',
    title: '출금 관리',
    icon: 'ArrowDownToLine',
    order: 50,
    submenu: [
      { id: 'withdrawal-request', title: '출금 신청', href: '/dashboard/withdrawals/request', order: 10 },
      { id: 'withdrawal-approve', title: '출금 승인', href: '/dashboard/withdrawals/approve', adminOnly: true, order: 20 },
      { id: 'withdrawal-history', title: '출금 내역', href: '/dashboard/withdrawals/history', order: 30 },
      { id: 'withdrawal-settings', title: '출금 설정', href: '/dashboard/withdrawals/settings', adminOnly: true, order: 40 },
      { id: 'withdrawal-reports', title: '출금 보고서', href: '/dashboard/withdrawals/reports', order: 50 },
      { id: 'withdrawal-api', title: '출금 API 관리', href: '/dashboard/withdrawals/api', adminOnly: true, order: 60 },
    ]
  },
  {
    id: 'account-management',
    title: '가상계좌 관리',
    icon: 'Wallet',
    adminOnly: true,
    order: 60,
    submenu: [
      { id: 'account-issue', title: '계좌 발급', href: '/dashboard/accounts/issue', order: 10 },
      { id: 'account-list', title: '계좌 목록', href: '/dashboard/accounts/list', order: 20 },
      { id: 'account-status', title: '계좌 상태', href: '/dashboard/accounts/status', order: 30 },
      { id: 'account-banks', title: '은행 관리', href: '/dashboard/accounts/banks', order: 40 },
      { id: 'account-settings', title: '계좌 설정', href: '/dashboard/accounts/settings', order: 50 },
      { id: 'account-verification', title: '계좌 검증', href: '/dashboard/accounts/verification', order: 60 },
    ]
  },
  {
    id: 'my-accounts',
    title: '내 가상계좌',
    icon: 'Wallet',
    merchantOnly: true,
    order: 70,
    submenu: [
      { id: 'my-accounts-list', title: '내 계좌 목록', href: '/dashboard/my-accounts/list', order: 10 },
      { id: 'my-accounts-request', title: '계좌 발급 요청', href: '/dashboard/my-accounts/request', order: 20 },
      { id: 'my-accounts-deposits', title: '입금 내역', href: '/dashboard/my-accounts/deposits', order: 30 },
    ]
  },
  {
    id: 'settlement-management',
    title: '정산 관리',
    icon: 'Percent',
    order: 80,
    submenu: [
      { id: 'settlement-history', title: '정산 내역', href: '/dashboard/settlements/history', order: 10 },
      { id: 'settlement-scheduled', title: '정산 예정', href: '/dashboard/settlements/scheduled', order: 20 },
      { id: 'settlement-settings', title: '정산 설정', href: '/dashboard/settlements/settings', adminOnly: true, order: 30 },
      { id: 'settlement-reports', title: '정산 보고서', href: '/dashboard/settlements/reports', adminOnly: true, order: 40 },
      { id: 'settlement-fees', title: '수수료 관리', href: '/dashboard/settlements/fees', adminOnly: true, order: 50 },
    ]
  },
  {
    id: 'reports',
    title: '보고서',
    icon: 'BarChart3',
    order: 90,
    submenu: [
      { id: 'report-daily', title: '일별 보고서', href: '/dashboard/reports/daily', order: 10 },
      { id: 'report-monthly', title: '월별 보고서', href: '/dashboard/reports/monthly', order: 20 },
      { id: 'report-by-merchant', title: '가맹점별 보고서', href: '/dashboard/reports/by-merchant', adminOnly: true, order: 30 },
      { id: 'report-by-type', title: '거래 유형별 보고서', href: '/dashboard/reports/by-type', order: 40 },
      { id: 'report-custom', title: '사용자 정의 보고서', href: '/dashboard/reports/custom', order: 50 },
      { id: 'report-download', title: '보고서 다운로드', href: '/dashboard/reports/download', order: 60 },
    ]
  },
  {
    id: 'system-management',
    title: '시스템 관리',
    icon: 'Settings',
    adminOnly: true,
    order: 100,
    submenu: [
      { id: 'system-users', title: '사용자 관리', href: '/dashboard/system/users', order: 10 },
      { id: 'system-permissions', title: '권한 관리', href: '/dashboard/system/permissions', order: 20 },
      { id: 'system-settings', title: '시스템 설정', href: '/dashboard/system/settings', order: 30 },
      { id: 'system-api-settings', title: 'API 설정', href: '/dashboard/system/api-settings', order: 40 },
      { id: 'system-notifications', title: '알림 설정', href: '/dashboard/system/notifications', order: 50 },
      { id: 'system-audit-logs', title: '감사 로그', href: '/dashboard/system/audit-logs', order: 60 },
      { id: 'system-backups', title: '백업 관리', href: '/dashboard/system/backups', order: 70 },
    ]
  },
  {
    id: 'notifications',
    title: '알림',
    icon: 'Bell',
    order: 110,
    submenu: [
      { id: 'notification-all', title: '모든 알림', href: '/dashboard/notifications', order: 10 },
      { id: 'notification-unread', title: '읽지 않은 알림', href: '/dashboard/notifications/unread', order: 20 },
      { id: 'notification-settings', title: '알림 설정', href: '/dashboard/notifications/settings', order: 30 },
    ]
  },
  {
    id: 'support',
    title: '고객 지원',
    icon: 'HelpCircle',
    order: 120,
    submenu: [
      { id: 'support-faq', title: 'FAQ', href: '/dashboard/support/faq', order: 10 },
      { id: 'support-inquiry', title: '문의하기', href: '/dashboard/support/inquiry', order: 20 },
      { id: 'support-history', title: '문의 내역', href: '/dashboard/support/history', order: 30 },
      { id: 'support-tickets', title: '지원 티켓', href: '/dashboard/support/tickets', adminOnly: true, order: 40 },
    ]
  },
  {
    id: 'database',
    title: '데이터베이스',
    icon: 'Database',
    adminOnly: true,
    order: 130,
    submenu: [
      { id: 'database-overview', title: '개요', href: '/dashboard/database', order: 10 },
      { id: 'database-tables', title: '테이블 관리', href: '/dashboard/database?tab=tables', order: 20 },
      { id: 'database-backups', title: '백업 관리', href: '/dashboard/database?tab=backups', order: 30 },
      { id: 'database-stored-procedures', title: '저장 프로시저', href: '/dashboard/database/stored-procedures', order: 40 },
      { id: 'database-query', title: '쿼리 도구', href: '/dashboard/database/query', order: 50 },
    ]
  }
];

/**
 * 역할에 따른 메뉴 항목 필터링 함수
 * @param role 사용자 역할
 * @returns 필터링된 메뉴 항목 목록
 */
export function getMenuItems(role: string): MenuItem[] {
  // 역할에 따른 메뉴 필터링
  return allMenuItems
    .filter(menu => {
      // 관리자 전용 메뉴이고 사용자가 관리자가 아닌 경우 필터링
      if (menu.adminOnly && role !== 'admin') return false;
      
      // 가맹점 전용 메뉴이고 사용자가 가맹점이 아닌 경우 필터링
      if (menu.merchantOnly && role !== 'merchant') return false;
      
      return true;
    })
    .map(menu => {
      // 서브메뉴가 있는 경우 서브메뉴도 필터링
      if (menu.submenu) {
        return {
          ...menu,
          submenu: menu.submenu.filter(submenu => {
            if (submenu.adminOnly && role !== 'admin') return false;
            if (submenu.merchantOnly && role !== 'merchant') return false;
            return true;
          }).sort((a, b) => a.order - b.order) // 서브메뉴 정렬
        };
      }
      return menu;
    })
    .filter(menu => !menu.submenu || menu.submenu.length > 0) // 빈 서브메뉴가 있는 메뉴 제거
    .sort((a, b) => a.order - b.order); // 메뉴 정렬
}

/**
 * 특정 메뉴 아이템 ID로 메뉴 찾기
 * @param menuId 메뉴 ID
 * @returns 해당 메뉴 항목 또는 undefined
 */
export function findMenuItemById(menuId: string): MenuItem | undefined {
  for (const menuItem of allMenuItems) {
    if (menuItem.id === menuId) return menuItem;
    
    if (menuItem.submenu) {
      const submenuItem = menuItem.submenu.find(item => item.id === menuId);
      if (submenuItem) return submenuItem;
    }
  }
  
  return undefined;
}

/**
 * 활성 메뉴 찾기
 * @param path 현재 경로
 * @returns 활성 메뉴 항목
 */
export function findActiveMenu(path: string): MenuItem[] {
  const activePath = path.split('?')[0]; // 쿼리 파라미터 제거
  const activeMenus: MenuItem[] = [];
  
  for (const menuItem of allMenuItems) {
    let hasActiveSubmenu = false;
    
    if (menuItem.submenu) {
      for (const submenuItem of menuItem.submenu) {
        if (submenuItem.href && activePath === submenuItem.href) {
          activeMenus.push({ ...menuItem, isActive: true });
          activeMenus.push({ ...submenuItem, isActive: true });
          hasActiveSubmenu = true;
          break;
        }
      }
    }
    
    if (!hasActiveSubmenu && menuItem.href && activePath === menuItem.href) {
      activeMenus.push({ ...menuItem, isActive: true });
    }
  }
  
  return activeMenus;
}

/**
 * 메뉴 구조 가져오기 (대메뉴와 소메뉴 구분)
 */
export function getMenuStructure() {
  const mainMenus = allMenuItems.map(item => ({
    id: item.id,
    title: item.title,
    icon: item.icon,
    adminOnly: item.adminOnly,
    merchantOnly: item.merchantOnly,
    order: item.order
  }));
  
  const subMenus = allMenuItems.reduce((acc, item) => {
    if (item.submenu) {
      acc[item.id] = item.submenu;
    }
    return acc;
  }, {} as Record<string, MenuItem[]>);
  
  return {
    mainMenus,
    subMenus
  };
}
