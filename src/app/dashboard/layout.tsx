"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState, useCallback } from "react";
import { useDepositNotification } from "@/components/notifications/DepositNotification";
import { useDepositNotifications, DepositNotification } from "@/lib/socket";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 입금 알림 훅 사용
  const { showDepositNotification } = useDepositNotification();
  
  // 입금 알림 처리 콜백
  const handleDepositNotification = useCallback((data: DepositNotification) => {
    console.log("입금 알림 수신:", data);
    showDepositNotification(data);
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

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (isClient) {
      try {
        console.log("대시보드: 인증 상태 확인 중");
        const userInfo = localStorage.getItem("userInfo");
        const token = localStorage.getItem("token");

        console.log("대시보드: 저장된 사용자 정보", userInfo ? "있음" : "없음");
        console.log("대시보드: 저장된 토큰", token ? "있음" : "없음");

        if (!userInfo || !token) {
          console.log("대시보드: 인증 정보 없음, 로그인 페이지로 리다이렉트");
          router.push("/login");
        } else {
          console.log("대시보드: 인증 성공");
          // 사용자 정보 파싱 시도
          try {
            const parsedUserInfo = JSON.parse(userInfo);
            console.log("대시보드: 사용자 정보 파싱 성공", parsedUserInfo);
            setIsAuthenticated(true);
          } catch (parseError) {
            console.error("대시보드: 사용자 정보 파싱 실패", parseError);
            // 잘못된 형식의 사용자 정보인 경우 로그인 페이지로 리다이렉트
            localStorage.removeItem("userInfo");
            localStorage.removeItem("token");
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("대시보드: 로컬 스토리지 접근 중 오류", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }
  }, [router, isClient]);

  // 사이드바 상태 변경 함수
  const handleSidebarToggle = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  };

  // 클라이언트 사이드 렌더링 전이거나 로딩 중인 경우
  if (!isClient || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우 (리다이렉트 중)
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100 overflow-hidden">
      <Sidebar onToggle={handleSidebarToggle} isCollapsed={isSidebarCollapsed} />
      <main 
        className={`flex-1 transition-all duration-300 overflow-x-hidden
          ${isSidebarCollapsed ? 'ml-16 pr-4' : 'ml-64'}`}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
