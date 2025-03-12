"use client";

import Sidebar from "@/components/layout/Sidebar";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드 렌더링 확인
  useEffect(() => {
    setIsClient(true);
    console.log("대시보드 레이아웃 마운트됨");
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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1">
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
