"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // 로그인 페이지로 리다이렉트
    router.push("/login");
  }, [router]);

  // 리다이렉트 중 표시할 로딩 화면
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700">EzPG 전자결제 시스템</h2>
        <p className="text-gray-500 mt-2">로딩 중...</p>
      </div>
    </div>
  );
}
