"use client";

import { useEffect, useState } from "react";

interface UserInfo {
  userId: string;
  userName: string;
  adminYn: string;
  merchantId?: string;
  merchantName?: string;
  lastLoginDt?: string;
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
  const [stats, setStats] = useState({
    totalDeposits: 0,
    todayDeposits: 0,
    totalAmount: 0,
    todayAmount: 0,
  });

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

          // 더미 입금 데이터 생성
          generateDummyDeposits(parsedUserInfo);
        }
      } catch (error) {
        console.error("사용자 정보 로드 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // 더미 입금 데이터 생성 함수
  const generateDummyDeposits = (user: UserInfo) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const deposits: DepositInfo[] = [];
    let totalAmount = 0;
    let todayAmount = 0;

    // 관리자인 경우 여러 가맹점의 데이터 생성
    const merchantIds =
      user.adminYn === "Y" ? ["M001", "M002", "M003"] : [user.merchantId || "M001"];

    // 최근 10개의 입금 내역 생성
    for (let i = 0; i < 10; i++) {
      const isToday = i < 4; // 처음 4개는 오늘 데이터
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
        txId: `TX-${Date.now() - i * 1000000}`,
        accountNumber: "123-456-789",
        depositor: `입금자${i + 1}`,
        timestamp: new Date(depositDate.getTime() - i * 3600000).toISOString(),
        status: "COMPLETED",
        processedAt: new Date(depositDate.getTime() - i * 3600000 + 5000).toISOString(),
      };

      deposits.push(deposit);
      totalAmount += amount;

      if (isToday) {
        todayAmount += amount;
      }
    }

    setRecentDeposits(deposits);
    setStats({
      totalDeposits: deposits.length,
      todayDeposits: deposits.filter(
        (d) => new Date(d.timestamp).toDateString() === today.toDateString(),
      ).length,
      totalAmount,
      todayAmount,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      {/* 사용자 정보 */}
      {userInfo && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">사용자 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">이름</p>
              <p className="font-medium">{userInfo.userName}</p>
            </div>
            <div>
              <p className="text-gray-600">아이디</p>
              <p className="font-medium">{userInfo.userId}</p>
            </div>
            <div>
              <p className="text-gray-600">권한</p>
              <p className="font-medium">{userInfo.adminYn === "Y" ? "관리자" : "가맹점"}</p>
            </div>
            {userInfo.adminYn !== "Y" && userInfo.merchantId && (
              <div>
                <p className="text-gray-600">가맹점</p>
                <p className="font-medium">{userInfo.merchantName || userInfo.merchantId}</p>
              </div>
            )}
            <div>
              <p className="text-gray-600">마지막 로그인</p>
              <p className="font-medium">{new Date(userInfo.lastLoginDt || "").toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">총 입금 건수</h3>
          <p className="text-2xl font-bold">{stats.totalDeposits}건</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">오늘 입금 건수</h3>
          <p className="text-2xl font-bold">{stats.todayDeposits}건</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">총 입금 금액</h3>
          <p className="text-2xl font-bold">{stats.totalAmount.toLocaleString()}원</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">오늘 입금 금액</h3>
          <p className="text-2xl font-bold">{stats.todayAmount.toLocaleString()}원</p>
        </div>
      </div>

      {/* 최근 입금 내역 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">최근 입금 내역</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  거래 ID
                </th>
                {userInfo?.adminYn === "Y" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    가맹점
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  입금자
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  계좌번호
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  입금 시간
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentDeposits.map((deposit) => (
                <tr key={deposit.requestId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {deposit.txId}
                  </td>
                  {userInfo?.adminYn === "Y" && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {merchantNames[deposit.merchantId as keyof typeof merchantNames] ||
                        deposit.merchantId}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    {deposit.amount.toLocaleString()}원
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deposit.depositor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deposit.accountNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(deposit.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {deposit.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentDeposits.length === 0 && (
                <tr>
                  <td
                    colSpan={userInfo?.adminYn === "Y" ? 7 : 6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    입금 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
