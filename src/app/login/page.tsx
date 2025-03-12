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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* 고급 배경 효과 */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
        {/* 애니메이션 효과 레이어 */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/circuit-pattern.svg')] bg-repeat opacity-10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/digital-bg.svg')] bg-repeat opacity-15"></div>
        </div>

        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 via-blue-900/20 to-cyan-900/30"></div>

        {/* 빛나는 원형 효과 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-[100px] opacity-20 animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-[100px] opacity-20 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-500 rounded-full filter blur-[80px] opacity-10 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      {/* 데이터 흐름 애니메이션 */}
      <div className="absolute inset-0 z-1 overflow-hidden opacity-20">
        <div className="data-flow-animation"></div>
      </div>

      {/* 보안 시각화 요소 */}
      <div className="absolute inset-0 z-1 overflow-hidden">
        <div
          className="absolute top-1/4 left-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-ping"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-3/4 left-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping"
          style={{ animationDuration: "4s", animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping"
          style={{ animationDuration: "5s", animationDelay: "0.5s" }}
        ></div>
        <div
          className="absolute top-2/3 right-1/3 w-1 h-1 bg-cyan-400 rounded-full animate-ping"
          style={{ animationDuration: "4.5s", animationDelay: "1.5s" }}
        ></div>
      </div>

      {/* 로그인 카드 */}
      <div className="z-10 backdrop-blur-xl bg-white/10 p-8 rounded-xl shadow-2xl w-full max-w-md border border-white/20 relative">
        {/* 보안 아이콘 */}
        <div
          className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full shadow-lg"
          style={{ animation: "pulse 2s infinite" }}
        >
          <img src="/images/security-icon.svg" className="h-6 w-6 text-white" alt="Security" />
        </div>

        {/* 암호화 시각화 */}
        <div className="absolute -right-3 top-1/4 w-6 h-24 overflow-hidden opacity-70">
          <div className="encryption-code text-[8px] text-cyan-400 font-mono">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="opacity-70" style={{ animationDelay: `${i * 0.2}s` }}>
                {Math.random().toString(36).substring(2, 5)}
              </div>
            ))}
          </div>
        </div>

        {/* 암호화 시각화 (왼쪽) */}
        <div className="absolute -left-3 top-2/4 w-6 h-24 overflow-hidden opacity-70">
          <div className="encryption-code text-[8px] text-blue-400 font-mono">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="opacity-70" style={{ animationDelay: `${i * 0.15}s` }}>
                {Math.random().toString(36).substring(2, 5)}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mb-6 mt-2">
          <h1 className="text-3xl font-bold gradient-text">EzPG</h1>
          <p className="text-cyan-200 mt-2">전자결제 시스템</p>
        </div>

        {/* 빠른 전송 시스템 & 보안 강조 메시지 */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <img
              src="/images/fast-transaction.svg"
              className="h-4 w-4 text-cyan-400"
              alt="Fast Transaction"
            />
            <p className="text-xs text-cyan-300 font-medium">빠른 전송 시스템</p>
          </div>
          <div className="transaction-speed" title="빠른 거래 속도"></div>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <div className="security-shield">
              <img
                src="/images/security-icon.svg"
                className="h-4 w-4 text-cyan-400"
                alt="Security"
              />
            </div>
            <p className="text-xs text-cyan-300 font-medium">보안 암호화 최적화</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6">
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="userId" className="block text-cyan-100 text-sm font-medium mb-2">
              아이디
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-cyan-400"
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
                className="bg-white/5 border border-white/10 text-white placeholder-cyan-200/50 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 p-2.5 transition-all duration-200 hover:bg-white/10"
                placeholder="아이디를 입력하세요"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="block text-cyan-100 text-sm font-medium mb-2">
              비밀번호
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-cyan-400"
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
                className="bg-white/5 border border-white/10 text-white placeholder-cyan-200/50 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 p-2.5 transition-all duration-200 hover:bg-white/10"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div>
            <button
              className={`w-full text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:ring-4 focus:ring-cyan-300/50 font-medium rounded-lg text-sm px-5 py-3 text-center transition-all duration-300 transform hover:scale-[1.02] fast-transaction ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
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
            <span className="absolute px-3 text-xs font-medium text-cyan-200 bg-[#0f172a]/90 backdrop-blur-sm">
              테스트 계정
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/5 p-3 rounded-lg border border-white/10 transition-all duration-300 hover:bg-white/10">
              <p className="text-xs text-cyan-100 font-medium">관리자</p>
              <p className="text-xs text-cyan-300 mt-1">admin / admin123</p>
            </div>
            <div className="bg-white/5 p-3 rounded-lg border border-white/10 transition-all duration-300 hover:bg-white/10">
              <p className="text-xs text-cyan-100 font-medium">가맹점</p>
              <p className="text-xs text-cyan-300 mt-1">merchant / merchant123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
