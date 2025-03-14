"use client";

import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowDownToLine,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Percent,
  Settings,
  Store,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@/docs/interface/user";

interface UserInfo extends User {}

interface MenuItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  submenu?: MenuItem[];
  adminOnly?: boolean;
  merchantOnly?: boolean;
}

interface SidebarProps {
  onToggle?: (collapsed: boolean) => void;
  isCollapsed?: boolean;
}

export default function Sidebar({ onToggle, isCollapsed: externalCollapsed }: SidebarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [collapsedMenus, setCollapsedMenus] = useState<Record<string, boolean>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== "undefined") {
      const storedUserInfo = localStorage.getItem("userInfo");
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      } else {
        // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
        router.push("/login");
      }

      // 화면 크기에 따라 메뉴 상태 설정
      const handleResize = () => {
        // 외부에서 collapsed 상태가 제공되지 않은 경우에만 내부 상태 업데이트
        if (externalCollapsed === undefined) {
          setIsCollapsed(window.innerWidth < 1280);
        }
      };

      // 초기 화면 크기 확인
      handleResize();

      // 화면 크기 변경 이벤트 리스너 등록
      window.addEventListener('resize', handleResize);
      
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [router, externalCollapsed]);

  // 외부에서 collapsed 상태가 변경되면 내부 상태도 업데이트
  useEffect(() => {
    if (externalCollapsed !== undefined) {
      setIsCollapsed(externalCollapsed);
    }
  }, [externalCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const toggleSubmenu = (title: string) => {
    setCollapsedMenus((prev) => {
      // 현재 메뉴가 이미 열려있는 경우 닫기 (토글 기능)
      if (prev[title]) {
        return {
          ...prev,
          [title]: false
        };
      }
      
      // 다른 모든 메뉴를 닫고 선택한 메뉴만 열기
      const newState: Record<string, boolean> = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      
      return {
        ...newState,
        [title]: true
      };
    });
  };

  // 사이드바 토글 함수
  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // 사이드바가 접힐 때 모든 서브메뉴도 닫기
    if (newCollapsedState) {
      setCollapsedMenus({});
      setIsMobileMenuOpen(false);
    }
    
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };

  // 모바일 메뉴 토글 함수
  const toggleMobileMenu = () => {
    const newMobileMenuState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newMobileMenuState);
    
    // 모바일 메뉴가 닫힐 때 모든 서브메뉴도 닫기
    if (!newMobileMenuState) {
      setCollapsedMenus({});
    }
  };

  const menuItems: MenuItem[] = [
    {
      title: "대시보드",
      icon: <LayoutDashboard size={20} />,
      submenu: [
        { title: "메인 대시보드", href: "/dashboard" },
        { title: "가맹점별 대시보드", href: "/dashboard/merchant-dashboard", adminOnly: true },
        {
          title: "거래 통계 대시보드",
          href: "/dashboard/transaction-dashboard",
        },
        {
          title: "내 가맹점 대시보드",
          href: "/dashboard/my-merchant",
          merchantOnly: true,
        },
      ],
    },
    {
      title: "가맹점 관리",
      icon: <Store size={20} />,
      adminOnly: true,
      submenu: [
        { title: "가맹점 목록", href: "/dashboard/merchants" },
        { title: "가맹점 등록", href: "/dashboard/merchants/new" },
        { title: "가맹점 상세", href: "/dashboard/merchants/details" },
        { title: "가맹점 설정", href: "/dashboard/merchants/settings" },
        { title: "가맹점 잔액 관리", href: "/dashboard/merchants/balance" },
        { title: "가맹점 수수료 관리", href: "/dashboard/merchants/fees" },
        { title: "API 키 관리", href: "/dashboard/merchants/api-keys" },
        { title: "가맹점 검증", href: "/dashboard/merchants/verification" },
      ],
    },
    {
      title: "내 가맹점 정보",
      icon: <Store size={20} />,
      merchantOnly: true,
      submenu: [
        { title: "가맹점 정보", href: "/dashboard/my-merchant/info" },
        { title: "API 키 관리", href: "/dashboard/my-merchant/api-keys" },
        { title: "결제 설정", href: "/dashboard/my-merchant/settings" },
        { title: "정산 내역", href: "/dashboard/my-merchant/settlements" },
      ],
    },
    {
      title: "거래 관리",
      icon: <CreditCard size={20} />,
      submenu: [
        { title: "입금 거래", href: "/dashboard/transactions/deposits" },
        { title: "출금 거래", href: "/dashboard/transactions/withdrawals" },
        { title: "실패 거래", href: "/dashboard/transactions/failed" },
        { title: "대기 거래", href: "/dashboard/transactions/pending" },
        { title: "거래 로그", href: "/dashboard/transactions/logs", adminOnly: true },
        { title: "거래 검색", href: "/dashboard/transactions/search" },
        { title: "일괄 작업", href: "/dashboard/transactions/batch", adminOnly: true },
      ],
    },
    {
      title: "출금 관리",
      icon: <ArrowDownToLine size={20} />,
      submenu: [
        { title: "출금 신청", href: "/dashboard/withdrawals/request" },
        {
          title: "출금 승인",
          href: "/dashboard/withdrawals/approve",
          adminOnly: true,
        },
        { title: "출금 내역", href: "/dashboard/withdrawals/history" },
        {
          title: "출금 설정",
          href: "/dashboard/withdrawals/settings",
          adminOnly: true,
        },
        { title: "출금 보고서", href: "/dashboard/withdrawals/reports" },
        {
          title: "출금 API 관리",
          href: "/dashboard/withdrawals/api",
          adminOnly: true,
        },
      ],
    },
    {
      title: "가상계좌 관리",
      icon: <Wallet size={20} />,
      adminOnly: true,
      submenu: [
        { title: "계좌 발급", href: "/dashboard/accounts/issue" },
        { title: "계좌 목록", href: "/dashboard/accounts/list" },
        { title: "계좌 상태", href: "/dashboard/accounts/status" },
        { title: "은행 관리", href: "/dashboard/accounts/banks" },
        { title: "계좌 설정", href: "/dashboard/accounts/settings" },
        { title: "계좌 검증", href: "/dashboard/accounts/verification" },
      ],
    },
    {
      title: "내 가상계좌",
      icon: <Wallet size={20} />,
      merchantOnly: true,
      submenu: [
        { title: "내 계좌 목록", href: "/dashboard/my-accounts/list" },
        { title: "계좌 발급 요청", href: "/dashboard/my-accounts/request" },
        { title: "입금 내역", href: "/dashboard/my-accounts/deposits" },
      ],
    },
    {
      title: "정산 관리",
      icon: <Percent size={20} />,
      submenu: [
        { title: "정산 내역", href: "/dashboard/settlements/history" },
        { title: "정산 예정", href: "/dashboard/settlements/scheduled" },
        {
          title: "정산 설정",
          href: "/dashboard/settlements/settings",
          adminOnly: true,
        },
        {
          title: "정산 보고서",
          href: "/dashboard/settlements/reports",
          adminOnly: true,
        },
        {
          title: "수수료 관리",
          href: "/dashboard/settlements/fees",
          adminOnly: true,
        },
      ],
    },
    {
      title: "보고서",
      icon: <BarChart3 size={20} />,
      submenu: [
        { title: "일별 보고서", href: "/dashboard/reports/daily" },
        { title: "월별 보고서", href: "/dashboard/reports/monthly" },
        { title: "가맹점별 보고서", href: "/dashboard/reports/by-merchant", adminOnly: true },
        { title: "거래 유형별 보고서", href: "/dashboard/reports/by-type" },
        { title: "사용자 정의 보고서", href: "/dashboard/reports/custom" },
        { title: "보고서 다운로드", href: "/dashboard/reports/download" },
      ],
    },
    {
      title: "시스템 관리",
      icon: <Settings size={20} />,
      adminOnly: true,
      submenu: [
        { title: "사용자 관리", href: "/dashboard/system/users" },
        { title: "권한 관리", href: "/dashboard/system/permissions" },
        { title: "시스템 설정", href: "/dashboard/system/settings" },
        { title: "API 설정", href: "/dashboard/system/api-settings" },
        { title: "알림 설정", href: "/dashboard/system/notifications" },
        { title: "감사 로그", href: "/dashboard/system/audit-logs" },
        { title: "백업 관리", href: "/dashboard/system/backups" },
      ],
    },
    {
      title: "고객 지원",
      icon: <HelpCircle size={20} />,
      submenu: [
        { title: "공지사항", href: "/dashboard/support/notices" },
        { title: "FAQ", href: "/dashboard/support/faq" },
        { title: "1:1 문의", href: "/dashboard/support/inquiries" },
        { title: "API 문서", href: "/dashboard/support/api-docs" },
        { title: "이용 가이드", href: "/dashboard/support/guides" },
      ],
    },
    {
      title: "활동 내역",
      icon: <Activity size={20} />,
      submenu: [
        { title: "로그인 내역", href: "/dashboard/activities/logins" },
        { title: "작업 내역", href: "/dashboard/activities/actions" },
        { title: "알림 내역", href: "/dashboard/activities/notifications" },
      ],
    },
  ];

  // 메뉴 항목 렌더링 함수
  const renderMenuItems = () => {
    return menuItems
      .filter((item) => {
        // 관리자만 볼 수 있는 메뉴는 관리자만 표시
        if (item.adminOnly && userInfo?.adminYn !== "Y") {
          return false;
        }
        // 가맹점만 볼 수 있는 메뉴는 가맹점만 표시
        if (item.merchantOnly && userInfo?.adminYn === "Y") {
          return false;
        }
        return true;
      })
      .map((item, index) => {
        const hasSubmenu = item.submenu && item.submenu.length > 0;
        const isActive = hasSubmenu
          ? item.submenu?.some((subItem) => pathname === subItem.href)
          : pathname === item.href;
        const isOpen = collapsedMenus[item.title];

        // 서브메뉴 필터링 (관리자/가맹점 권한에 따라)
        const filteredSubmenu = item.submenu
          ? item.submenu.filter((subItem) => {
              if (subItem.adminOnly && userInfo?.adminYn !== "Y") {
                return false;
              }
              if (subItem.merchantOnly && userInfo?.adminYn === "Y") {
                return false;
              }
              return true;
            })
          : [];

        return (
          <div key={index}>
            {/* 메뉴 아이템 */}
            <div
              className={cn(
                "flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={() => {
                if (hasSubmenu) {
                  toggleSubmenu(item.title);
                } else if (item.href) {
                  router.push(item.href);
                }
              }}
            >
              <div className="flex items-center space-x-3">
                {item.icon && (
                  <span
                    className={cn(
                      "flex-shrink-0",
                      isActive ? "text-blue-700" : "text-gray-500"
                    )}
                  >
                    {item.icon}
                  </span>
                )}
                <span
                  className={cn(
                    "font-medium text-sm",
                    isCollapsed && !isHovering ? "hidden" : "block"
                  )}
                >
                  {item.title}
                </span>
              </div>
              {hasSubmenu && filteredSubmenu.length > 0 && (
                <span
                  className={cn(
                    "transform transition-transform duration-200",
                    isOpen ? "rotate-180" : "",
                    isCollapsed && !isHovering ? "hidden" : "block"
                  )}
                >
                  <ChevronDown size={16} />
                </span>
              )}
            </div>

            {/* 서브메뉴 */}
            {hasSubmenu && filteredSubmenu.length > 0 && isOpen && (
              <div
                className={cn(
                  "pl-10 mt-1 space-y-1",
                  isCollapsed && !isHovering ? "hidden" : "block"
                )}
              >
                {filteredSubmenu.map((subItem, subIndex) => {
                  const isSubActive = pathname === subItem.href;
                  return (
                    <Link
                      key={subIndex}
                      href={subItem.href || "#"}
                      className={cn(
                        "block py-2 px-3 rounded-lg text-sm transition-colors",
                        isSubActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      {subItem.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      });
  };

  return (
    <>
      {/* 사이드바 */}
      <aside
        className={cn(
          "h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out overflow-hidden shadow-xl",
          isCollapsed && !isMobileMenuOpen
            ? "w-16" // 축소 모드
            : isMobileMenuOpen
            ? "w-64 translate-x-0" // 모바일에서 열린 상태
            : isCollapsed
            ? "w-64 -translate-x-full" // 모바일에서 닫힌 상태
            : "w-64" // 기본 상태
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* 사이드바 헤더 */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-700">
          <div className="flex items-center">
            {!isCollapsed && (
              <div className="text-xl font-bold text-white">EZ Pay</div>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* 사용자 정보 */}
        {!isCollapsed && userInfo && (
          <div className="px-4 py-3 border-b border-gray-700 bg-gradient-to-r from-indigo-900 to-purple-900">
            <p className="text-sm text-gray-300">환영합니다</p>
            <p className="font-medium">{userInfo.userName}님</p>
            <p className="text-xs text-gray-400 mt-1">
              {userInfo.adminYn === "Y" ? "관리자" : "가맹점 계정"}
            </p>
          </div>
        )}

        {/* 모바일 메뉴 닫기 버튼 - 모바일에서 메뉴가 열렸을 때만 표시 */}
        {isMobileMenuOpen && (
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1 rounded-full bg-gray-700 text-white hover:bg-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {/* 메뉴 항목 */}
        <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
          <nav className="space-y-1">{renderMenuItems()}</nav>
        </div>

        {/* 로그아웃 버튼 */}
        <div className={cn(
          "border-t border-gray-700 flex-shrink-0",
          isCollapsed ? "p-2" : "p-4"
        )}>
          {isCollapsed ? (
            <button
              onClick={handleLogout}
              className="w-full py-2 px-2 rounded bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 transition-colors duration-200 text-white flex items-center justify-center"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full py-2 px-4 rounded bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 transition-colors duration-200 text-white flex items-center justify-center"
            >
              <LogOut size={18} className="mr-2" />
              로그아웃
            </button>
          )}
        </div>
      </aside>

      {/* 모바일 오버레이 */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 축소된 상태에서 토글 버튼 표시 (사이드바 외부) */}
      {isCollapsed && !isMobileMenuOpen && !isHovering && (
        <div className="fixed top-4 left-4 z-50">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md bg-white shadow-lg text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Menu size={24} />
          </button>
        </div>
      )}
    </>
  );
}
