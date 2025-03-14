"use client";

import { useEffect, useState } from "react";
import { BarChart, LineChart, PieChart } from "lucide-react";
import InfiniteScroll from "@/components/ui/InfiniteScroll";
import ShardCard from "@/components/ui/ShardCard";

interface UserInfo {
  userId: string;
  userName: string;
  adminYn: string;
  merchantId?: string;
  merchantName?: string;
  lastLoginDt?: string;
  balance?: number;
}

interface DepositInfo {
  requestId: string;
  merchantId: string;
  amount: number;
  txId: string;
  accountNumber: string;
  depositor: string;
  timestamp: string;
  status: string;
  processedAt: string;
}

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [recentDeposits, setRecentDeposits] = useState<DepositInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    todayDeposits: 0,
    totalAmount: 0,
    todayAmount: 0,
  });
  const [balance, setBalance] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const merchantNames = {
    M001: "테스트 가맹점",
    M002: "온라인 쇼핑몰",
    M003: "모바일 게임",
  };

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== "undefined") {
      try {
        // 사용자 정보 가져오기
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          setUserInfo(parsedUserInfo);

          // 콘솔에 로그 기록 (클라이언트 사이드)
          console.log("[INFO] 대시보드 사용자 정보 로드 완료", parsedUserInfo);

          // 더미 입금 데이터 생성 (첫 페이지)
          generateDummyDeposits(parsedUserInfo, 1, false);
          
          // 현재 잔액 설정 (더미 데이터)
          const dummyBalance = parsedUserInfo.adminYn === "Y" ? 1000000 : 500000;
          setBalance(dummyBalance);
        }
      } catch (error) {
        console.error("사용자 정보 로드 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // 더미 입금 데이터 생성 함수
  const generateDummyDeposits = (user: UserInfo, currentPage = 1, append = false) => {
    setIsLoadingMore(true);
    
    // 페이지당 항목 수
    const itemsPerPage = 10;
    // 총 가능한 항목 수 (실제 API에서는 백엔드에서 제공할 값)
    const totalItems = 50;
    
    // 현재 페이지에 해당하는 데이터만 생성
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    
    // 마지막 페이지인지 확인
    const isLastPage = endIndex >= totalItems;
    setHasMore(!isLastPage);
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const newDeposits: DepositInfo[] = [];
    let totalAmount = 0;
    let todayAmount = 0;

    // 관리자인 경우 여러 가맹점의 데이터 생성
    const merchantIds =
      user.adminYn === "Y" ? ["M001", "M002", "M003"] : [user.merchantId || "M001"];

    // 현재 페이지에 해당하는 입금 내역 생성
    for (let i = startIndex; i < endIndex; i++) {
      const isToday = i % 3 === 0; // 1/3은 오늘 데이터로 설정
      const depositDate = isToday ? today : yesterday;
      const merchantId = merchantIds[Math.floor(Math.random() * merchantIds.length)];

      // 관리자가 아니고 다른 가맹점 데이터인 경우 건너뛰기
      if (user.adminYn !== "Y" && merchantId !== user.merchantId) {
        continue;
      }

      const amount = Math.floor(Math.random() * 90000) + 10000; // 10,000 ~ 100,000

      const deposit: DepositInfo = {
        requestId: `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        merchantId,
        amount,
        txId: `TX-1741${(99 - i).toString().padStart(2, '0')}${(66 - i).toString().padStart(2, '0')}2079`,
        accountNumber: "123-456-789",
        depositor: `입금자${i + 1}`,
        timestamp: new Date(depositDate.getTime() - i * 3600000).toISOString(),
        status: "COMPLETED",
        processedAt: new Date(depositDate.getTime() - i * 3600000 + 5000).toISOString(),
      };

      newDeposits.push(deposit);
      totalAmount += amount;

      if (isToday) {
        todayAmount += amount;
      }
    }

    // 첫 페이지인 경우 통계 정보 설정
    if (currentPage === 1) {
      setStats({
        totalDeposits: totalItems,
        todayDeposits: Math.floor(totalItems / 3), // 약 1/3이 오늘 데이터
        totalAmount: totalAmount * 5, // 전체 금액은 현재 페이지의 5배로 가정
        todayAmount: todayAmount * 5,
      });
    }

    // 기존 데이터에 추가 또는 대체
    if (append) {
      setRecentDeposits(prev => [...prev, ...newDeposits]);
    } else {
      setRecentDeposits(newDeposits);
    }

    // 로딩 상태 업데이트
    setIsLoading(false);
    setIsLoadingMore(false);
  };

  // 더 많은 데이터 로드 함수
  const loadMoreDeposits = () => {
    if (isLoadingMore || !hasMore || !userInfo) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    generateDummyDeposits(userInfo, nextPage, true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(date);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* 통계 카드 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">총 입금 건수</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.totalDeposits}건</p>
                  </div>
                  <div className="p-2 md:p-3 bg-blue-100 rounded-full">
                    <BarChart className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-medium text-green-500">+{Math.round(stats.todayDeposits / stats.totalDeposits * 100)}%</span>
                  <span className="text-xs text-gray-500 ml-1">전일 대비</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">오늘 입금 건수</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.todayDeposits}건</p>
                  </div>
                  <div className="p-2 md:p-3 bg-green-100 rounded-full">
                    <LineChart className="h-5 w-5 md:h-6 md:w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-medium text-green-500">실시간 업데이트</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">총 입금 금액</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.totalAmount.toLocaleString()}원</p>
                  </div>
                  <div className="p-2 md:p-3 bg-purple-100 rounded-full">
                    <PieChart className="h-5 w-5 md:h-6 md:w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-medium text-green-500">+{Math.round(stats.todayAmount / stats.totalAmount * 100)}%</span>
                  <span className="text-xs text-gray-500 ml-1">전일 대비</span>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-4 md:p-6 border-l-4 border-cyan-500 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">오늘 입금 금액</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">{stats.todayAmount.toLocaleString()}원</p>
                  </div>
                  <div className="p-2 md:p-3 bg-cyan-100 rounded-full">
                    <BarChart className="h-5 w-5 md:h-6 md:w-6 text-cyan-600" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-xs font-medium text-green-500">실시간 업데이트</span>
                </div>
              </div>
            </div>

            {/* 현재 잔액 카드 */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">현재 잔액</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-gray-800">{balance.toLocaleString()}원</p>
                    <p className="text-sm text-gray-500 mt-1">최종 업데이트: {new Date().toLocaleString('ko-KR')}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
                      입금 요청
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                      내역 조회
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 사용자 정보 카드 */}
            {userInfo && (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
                  <h2 className="text-lg font-semibold text-white">사용자 정보</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">이름</p>
                      <p className="font-medium text-gray-800">{userInfo.userName}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">아이디</p>
                      <p className="font-medium text-gray-800">{userInfo.userId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">권한</p>
                      <p className="font-medium text-gray-800">
                        {userInfo.adminYn === "Y" ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">관리자</span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">가맹점</span>
                        )}
                      </p>
                    </div>
                    {userInfo.adminYn !== "Y" && userInfo.merchantId && (
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">가맹점</p>
                        <p className="font-medium text-gray-800">{userInfo.merchantName || userInfo.merchantId}</p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">마지막 로그인</p>
                      <p className="font-medium text-gray-800">{formatDate(userInfo.lastLoginDt || "")}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 최근 입금 내역 */}
            <ShardCard
              title="최근 입금 내역"
              actionLabel="전체보기"
              onAction={() => console.log('전체보기')}
              loadMore={loadMoreDeposits}
              hasMore={hasMore}
              isLoading={isLoadingMore}
              maxHeight="600px"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        거래 ID
                      </th>
                      {userInfo?.adminYn === "Y" && (
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          가맹점
                        </th>
                      )}
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        금액
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        입금자
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        계좌번호
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        입금 시간
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        상태
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentDeposits.length > 0 ? (
                      recentDeposits.map((deposit) => (
                        <tr key={deposit.requestId} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {deposit.txId}
                          </td>
                          {userInfo?.adminYn === "Y" && (
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700">
                                {merchantNames[deposit.merchantId as keyof typeof merchantNames] ||
                                  deposit.merchantId}
                              </span>
                            </td>
                          )}
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium hidden sm:table-cell">
                            {deposit.amount.toLocaleString()}원
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                            {deposit.depositor}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                            {deposit.accountNumber}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                            {formatDate(deposit.timestamp)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap hidden lg:table-cell">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {deposit.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={userInfo?.adminYn === "Y" ? 7 : 6}
                          className="px-4 py-4 text-center text-sm text-gray-500"
                        >
                          입금 내역이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </ShardCard>
          </div>
        );
      case "transactions":
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">거래 내역</h2>
            <p className="text-gray-600">거래 내역 탭 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        );
      case "analytics":
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">분석</h2>
            <p className="text-gray-600">분석 탭 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        );
      case "settings":
        return (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">설정</h2>
            <p className="text-gray-600">설정 탭 콘텐츠가 여기에 표시됩니다.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">대시보드</h1>
          <p className="text-gray-500 mt-1">안녕하세요, {userInfo?.userName}님! 오늘의 거래 현황을 확인하세요.</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
            보고서 다운로드
          </button>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium">
            새로고침
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-xl shadow-md p-1">
        <div className="flex overflow-x-auto">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === "overview" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"} transition-colors duration-200 flex-shrink-0`}
          >
            개요
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === "transactions" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"} transition-colors duration-200 flex-shrink-0`}
          >
            거래 내역
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === "analytics" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"} transition-colors duration-200 flex-shrink-0`}
          >
            분석
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${activeTab === "settings" ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-100"} transition-colors duration-200 flex-shrink-0`}
          >
            설정
          </button>
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      {renderTabContent()}
    </div>
  );
}
