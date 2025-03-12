"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserInfo {
  userId: string;
  userName: string;
  adminYn: string;
  merchantId?: string;
  merchantName?: string;
}

export default function Sidebar() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

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
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="h-screen bg-gray-800 text-white w-64 flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <h2 className="text-2xl font-bold">EzPG 시스템</h2>
        {userInfo && (
          <div className="mt-3">
            <p className="text-sm text-gray-300">환영합니다</p>
            <p className="font-medium">{userInfo.userName}님</p>
            <p className="text-xs text-gray-400 mt-1">
              {userInfo.adminYn === "Y" ? "관리자" : "가맹점 계정"}
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2">
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gray-900 focus:outline-none focus:text-white focus:bg-gray-700"
            >
              대시보드
            </Link>

            {userInfo?.adminYn === "Y" && (
              <>
                <Link
                  href="/dashboard/merchants"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                >
                  가맹점 관리
                </Link>
                <Link
                  href="/dashboard/deposits"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                >
                  입금 내역 관리
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                >
                  시스템 설정
                </Link>
              </>
            )}

            {userInfo?.adminYn === "N" && (
              <>
                <Link
                  href="/dashboard/my-deposits"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                >
                  나의 입금 내역
                </Link>
                <Link
                  href="/dashboard/account"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700"
                >
                  계정 정보
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full py-2 px-4 rounded bg-red-600 hover:bg-red-700 transition-colors duration-200 text-white"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
