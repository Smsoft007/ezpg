/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { logError, logInfo } from "@/lib/logger";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// window.ethereum 타입 확장
declare global {
  interface Window {
    ethereum?: any;
    safeEthereum?: () => any;
  }
}

// 이더리움 확장 프로그램 충돌 방지 함수
const preventEthereumExtensionConflicts = () => {
  if (typeof window !== "undefined") {
    try {
      // window.ethereum이 이미 정의되어 있는지 확인
      const descriptor = Object.getOwnPropertyDescriptor(window, "ethereum");

      // ethereum 속성이 읽기 전용인 경우 충돌 방지
      if (descriptor && !descriptor.writable && !descriptor.configurable) {
        console.warn("이더리움 확장 프로그램 충돌 감지: window.ethereum이 읽기 전용입니다.");

        // 확장 프로그램 충돌 방지를 위한 프록시 객체 생성
        const originalEthereum = window.ethereum;

        // 안전한 ethereum 객체 접근을 위한 전역 함수 정의
        window.safeEthereum = () => originalEthereum;
      }
    } catch (error) {
      console.error("이더리움 확장 프로그램 충돌 방지 중 오류:", error);
    }
  }
};

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드 렌더링 확인 및 이더리움 확장 프로그램 충돌 방지
  useEffect(() => {
    setIsClient(true);
    console.log("로그인 페이지 마운트됨");

    // 이더리움 확장 프로그램 충돌 방지 함수 호출
    preventEthereumExtensionConflicts();
  }, []);

  // 이미 로그인되어 있으면 대시보드로 리다이렉트
  useEffect(() => {
    if (isClient) {
      try {
        const userInfo = localStorage.getItem("userInfo");
        const token = localStorage.getItem("token");
        console.log("저장된 사용자 정보 확인:", userInfo ? "있음" : "없음");

        if (userInfo && token) {
          console.log("이미 로그인되어 있음, 대시보드로 리다이렉트");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("로컬 스토리지 접근 중 오류:", error);
      }
    }
  }, [router, isClient]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    console.log("로그인 시도:", userId);

    try {
      // 클라이언트 사이드 유효성 검사
      if (!userId.trim()) {
        setError("아이디를 입력해주세요.");
        setIsLoading(false);
        return;
      }

      if (!password.trim()) {
        setError("비밀번호를 입력해주세요.");
        setIsLoading(false);
        return;
      }

      // 로그인 로직 처리
      console.log("입력된 정보:", { userId, password });

      // 개발용 더미 로그인 (실제로는 API 호출)
      if (userId === "admin" && password === "admin123") {
        console.log("관리자 계정 인증 성공");
        const userData = {
          userId: "admin",
          userName: "관리자",
          adminYn: "Y",
          lastLoginDt: new Date().toISOString(),
        };

        // 로그인 성공 처리
        await loginSuccess(userData, "관리자");
        return;
      }

      if (userId === "merchant" && password === "merchant123") {
        console.log("가맹점 계정 인증 성공");
        const userData = {
          userId: "merchant",
          userName: "가맹점",
          adminYn: "N",
          merchantId: "M001",
          merchantName: "테스트 가맹점",
          lastLoginDt: new Date().toISOString(),
        };

        // 로그인 성공 처리
        await loginSuccess(userData, "가맹점");
        return;
      }

      // 로그인 실패
      console.log("인증 실패: 아이디 또는 비밀번호가 올바르지 않음");
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      logToConsole("로그인 실패", { userId, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error("로그인 처리 중 오류 발생:", err);
      setError("로그인 중 오류가 발생했습니다.");
      logToConsole("로그인 오류", { userId, error: err, timestamp: new Date().toISOString() });
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 성공 처리 함수
  const loginSuccess = async (userData: any, userType: string) => {
    try {
      console.log(`${userType} 로그인 성공, 데이터 저장 시도:`, userData);

      // 로컬 스토리지에 사용자 정보 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("userInfo", JSON.stringify(userData));
        localStorage.setItem("token", `dummy-token-for-${userData.userId}`);
        console.log("로컬 스토리지에 데이터 저장 완료");

        // 저장 확인
        const savedUserInfo = localStorage.getItem("userInfo");
        console.log("저장된 사용자 정보:", savedUserInfo);
      }

      logToConsole(`${userType} 로그인 성공`, {
        userId: userData.userId,
        timestamp: new Date().toISOString(),
      });

      // 약간의 지연 후 리다이렉트 (로컬 스토리지 저장 완료 보장)
      setTimeout(() => {
        console.log("대시보드로 리다이렉트 시도");
        router.push("/dashboard");
      }, 100);
    } catch (storageError) {
      // 로컬 스토리지 저장 실패 시 에러 처리
      console.error("로컬 스토리지 저장 오류:", storageError);
      setError("로그인 정보를 저장하는 중 오류가 발생했습니다.");
      logToConsole("로컬 스토리지 저장 오류", {
        userId: userData.userId,
        error: storageError,
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
    }
  };

  // 클라이언트 사이드에서 안전하게 로깅하기 위한 함수
  const logToConsole = (message: string, data?: any) => {
    // 브라우저 환경에서는 console.log를 사용
    if (typeof window !== "undefined") {
      console.log(`[${new Date().toISOString()}] ${message}`, data);
    } else {
      // 서버 사이드에서는 로거 사용
      if (message.includes("오류") || message.includes("실패")) {
        logError(message, data);
      } else {
        logInfo(message, data);
      }
    }
  };

  // 클라이언트 사이드 렌더링 전에는 로딩 표시
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1e] to-[#1a1f3e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-[#0a1022] via-[#141b38] to-[#0c1a36]">
      {/* 배경 효과 */}
      <div className="absolute inset-0 z-0">
        {/* 그라데이션 배경 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/20 via-blue-900/20 to-cyan-900/20"></div>
        
        {/* 빛나는 효과 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-600 rounded-full filter blur-[100px] opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        
        {/* 패턴 오버레이 */}
        <div className="absolute inset-0 opacity-10 bg-[url('/images/grid-pattern.svg')] bg-repeat"></div>
      </div>

      {/* 움직이는 파티클 효과 */}
      <div className="absolute inset-0 z-1 overflow-hidden opacity-20">
        <div className="particles-container">
          {Array.from({ length: 20 }).map((_, i) => (
            <div 
              key={i} 
              className="particle bg-white rounded-full absolute"
              style={{
                width: `${Math.random() * 4 + 1}px`,
                height: `${Math.random() * 4 + 1}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
                animation: `floatParticle ${Math.random() * 10 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* 로그인 카드 */}
      <div className="z-10 backdrop-blur-xl bg-white/10 p-8 rounded-xl shadow-2xl w-full max-w-md border border-white/20 relative transition-all duration-300 hover:shadow-cyan-900/20 hover:border-white/30 mx-4">
        {/* 로고 아이콘 */}
        <div
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 p-4 rounded-full shadow-lg shadow-cyan-900/30"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>

        <div className="text-center mb-8 mt-4">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">EzPG</h1>
          <p className="text-cyan-200 mt-2 text-sm">안전하고 빠른 전자결제 시스템</p>
        </div>

        {/* 보안 및 속도 표시 */}
        <div className="mb-6 flex justify-center space-x-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-cyan-900/30 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <p className="text-xs text-cyan-300 font-medium">보안 최적화</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-900/30 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-xs text-blue-300 font-medium">빠른 처리 속도</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6 animate-pulse">
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="userId" className="block text-cyan-100 text-sm font-medium">
              아이디
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-500 group-hover:text-cyan-400 transition-colors duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="userId"
                className="bg-white/5 border border-white/10 text-white placeholder-cyan-200/50 text-sm rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block w-full pl-10 p-3 transition-all duration-200 hover:bg-white/10 backdrop-blur-sm"
                placeholder="아이디를 입력하세요"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-cyan-100 text-sm font-medium">
              비밀번호
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-cyan-500 group-hover:text-cyan-400 transition-colors duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <input
                type="password"
                id="password"
                className="bg-white/5 border border-white/10 text-white placeholder-cyan-200/50 text-sm rounded-lg focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 block w-full pl-10 p-3 transition-all duration-200 hover:bg-white/10 backdrop-blur-sm"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <button
              className={`w-full text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:ring-4 focus:ring-cyan-500/30 font-medium rounded-lg text-sm px-5 py-3.5 text-center transition-all duration-300 transform hover:scale-[1.02] shadow-lg shadow-cyan-900/20 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  로그인 중...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                    />
                  </svg>
                  로그인
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <div className="inline-flex items-center justify-center w-full">
            <hr className="w-full h-px my-4 bg-white/10 border-0" />
            <span className="absolute px-3 text-xs font-medium text-cyan-200 bg-[#0c1a36]/90 backdrop-blur-sm">
              테스트 계정
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/5 p-3 rounded-lg border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-900/10">
              <p className="text-xs text-cyan-100 font-medium">관리자</p>
              <p className="text-xs text-cyan-300 mt-1">admin / admin123</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-900/10">
              <p className="text-xs text-cyan-100 font-medium">가맹점</p>
              <p className="text-xs text-cyan-300 mt-1">merchant / merchant123</p>
            </div>
          </div>
        </div>

        {/* 추가 애니메이션 효과 */}
        <style jsx>{`
          @keyframes floatParticle {
            0% { transform: translateY(0) translateX(0); }
            25% { transform: translateY(-20px) translateX(10px); }
            50% { transform: translateY(-40px) translateX(-10px); }
            75% { transform: translateY(-20px) translateX(10px); }
            100% { transform: translateY(0) translateX(0); }
          }
          .particles-container {
            position: absolute;
            width: 100%;
            height: 100%;
          }
        `}</style>
      </div>
    </div>
  );
}
