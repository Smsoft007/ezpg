"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState, useCallback } from "react";
import { useDepositNotification } from "@/components/notifications/DepositNotification";
import { useDepositNotifications, DepositNotification } from "@/lib/socket";
import { Toaster } from "@/components/ui/toaster";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Bell, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// @ts-ignore
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// 간단한 Skeleton 컴포넌트 직접 정의
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse rounded-md bg-muted ${className || ''}`}
    {...props}
  />
);

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [notificationCount, setNotificationCount] = useState(0);

  // 입금 알림 훅 사용
  const { showDepositNotification } = useDepositNotification();
  
  // 입금 알림 처리 콜백
  const handleDepositNotification = useCallback((data: DepositNotification) => {
    console.log("입금 알림 수신:", data);
    showDepositNotification(data);
    setNotificationCount(prev => prev + 1);
  }, [showDepositNotification]);
  
  // 소켓 연결 및 입금 알림 구독
  const { notifications } = useDepositNotifications(handleDepositNotification);

  // 클라이언트 사이드 렌더링 확인
  useEffect(() => {
    setIsClient(true);
    console.log("대시보드 레이아웃 마운트됨");

    // 화면 크기에 따라 사이드바 상태 설정
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 1280);
    };

    // 초기 화면 크기 확인
    handleResize();

    // 화면 크기 변경 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 인증 상태 확인
  useEffect(() => {
    if (isClient) {
      const storedUserInfo = localStorage.getItem("userInfo");
      const token = localStorage.getItem("token");
      
      if (storedUserInfo && token) {
        setUserInfo(JSON.parse(storedUserInfo));
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        router.push("/login");
      }
    }
  }, [isClient, router]);

  // 사이드바 토글 핸들러
  const handleSidebarToggle = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  }, []);

  // 모바일 메뉴 토글 핸들러
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(prev => !prev);
  };

  // 로딩 중이거나 클라이언트 사이드가 아닌 경우 로딩 UI 표시
  if (isLoading || !isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <h2 className="text-xl font-semibold">EzPG 전자결제 시스템</h2>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 빈 컴포넌트 반환 (리다이렉트 처리됨)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 사이드바 */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block z-20 h-full fixed md:relative md:z-auto`}>
        <Sidebar 
          onToggle={handleSidebarToggle} 
          isCollapsed={isSidebarCollapsed} 
        />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        {/* 헤더 */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          {/* 왼쪽: 모바일 메뉴 토글 버튼 */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2" 
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <h1 className="text-lg font-semibold md:text-xl">
              EzPG 전자결제 시스템
            </h1>
          </div>

          {/* 오른쪽: 사용자 메뉴, 알림, 테마 토글 */}
          <div className="flex items-center space-x-2">
            {/* 알림 버튼 */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  {notificationCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
                      variant="destructive"
                    >
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>알림</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications && notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <DropdownMenuItem key={index} className="flex flex-col items-start py-2">
                      <span className="font-medium">{notification.title}</span>
                      <span className="text-sm text-muted-foreground">{notification.message}</span>
                      <span className="text-xs text-muted-foreground mt-1">{new Date(notification.timestamp).toLocaleString()}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="py-4 text-center text-muted-foreground">
                    새로운 알림이 없습니다
                  </div>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center font-medium">
                  모든 알림 보기
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* 테마 토글 */}
            <ModeToggle />

            {/* 사용자 메뉴 */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button variant="ghost" className="relative h-8 flex items-center gap-2 pl-2 pr-2">
                  <Avatar className="h-8 w-8">
                    {/* 기본 아바타 이미지 경로 수정 및 조건부 렌더링 */}
                    {userInfo?.profileImage ? (
                      <AvatarImage src={userInfo.profileImage} alt={userInfo?.name || '사용자'} />
                    ) : (
                      <AvatarFallback>{userInfo?.name?.charAt(0) || 'U'}</AvatarFallback>
                    )}
                  </Avatar>
                  <span className="hidden md:inline-block font-medium text-sm">
                    {userInfo?.name || '사용자'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
                  프로필 설정
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                  계정 설정
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    localStorage.removeItem("userInfo");
                    localStorage.removeItem("token");
                    router.push("/login");
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>

        {/* 푸터 */}
        <footer className="py-3 px-4 text-center border-t text-xs text-muted-foreground">
          <p> 2024 EzPG Payment System. All rights reserved.</p>
        </footer>
      </div>

      {/* 토스트 알림 */}
      <Toaster />
    </div>
  );
}
