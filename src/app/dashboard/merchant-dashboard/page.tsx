"use client";

import BalanceTrendChart from "@/components/charts/BalanceTrendChart";
import MerchantBalancePieChart from "@/components/charts/MerchantBalancePieChart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  DollarSign,
  LineChart,
  PieChart,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserInfo {
  userId: string;
  userName: string;
  adminYn: string;
  merchantId?: string;
  merchantName?: string;
}

interface MerchantBalance {
  merchantId: string;
  merchantName: string;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  lastUpdated: string;
}

interface BalanceTrendData {
  date: string;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
}

export default function MerchantDashboard() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [merchantBalances, setMerchantBalances] = useState<MerchantBalance[]>(
    []
  );
  const [balanceTrendData, setBalanceTrendData] = useState<BalanceTrendData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

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
          console.log(
            "[INFO] 가맹점 대시보드 사용자 정보 로드 완료",
            parsedUserInfo
          );

          // 더미 가맹점 잔액 데이터 생성
          generateDummyMerchantBalances(parsedUserInfo);

          // 더미 잔액 추이 데이터 생성
          generateDummyBalanceTrendData();
        } else {
          // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
          router.push("/login");
        }
      } catch (error) {
        console.error("사용자 정보 로드 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [router]);

  // 더미 가맹점 잔액 데이터 생성 함수
  const generateDummyMerchantBalances = (user: UserInfo) => {
    const dummyMerchants = [
      { id: "M001", name: "테스트 가맹점" },
      { id: "M002", name: "온라인 쇼핑몰" },
      { id: "M003", name: "모바일 게임" },
      { id: "M004", name: "디지털 콘텐츠" },
      { id: "M005", name: "구독 서비스" },
    ];

    const balances: MerchantBalance[] = [];

    // 관리자인 경우 모든 가맹점 데이터 생성, 아니면 해당 가맹점만
    const merchantsToShow =
      user.adminYn === "Y"
        ? dummyMerchants
        : dummyMerchants.filter((m) => m.id === user.merchantId);

    merchantsToShow.forEach((merchant) => {
      const totalBalance = Math.floor(Math.random() * 10000000) + 1000000;
      const pendingBalance = Math.floor(Math.random() * (totalBalance * 0.2));
      const availableBalance = totalBalance - pendingBalance;

      balances.push({
        merchantId: merchant.id,
        merchantName: merchant.name,
        totalBalance,
        availableBalance,
        pendingBalance,
        lastUpdated: new Date().toISOString(),
      });
    });

    setMerchantBalances(balances);
  };

  // 더미 잔액 추이 데이터 생성 함수
  const generateDummyBalanceTrendData = () => {
    const data: BalanceTrendData[] = [];
    const today = new Date();

    // 최근 7일간의 데이터 생성
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // 기본 값 설정 (증가 추세)
      const baseValue = 5000000 + (6 - i) * 200000;

      // 약간의 변동성 추가
      const totalBalance = baseValue + Math.floor(Math.random() * 500000);
      const pendingBalance = Math.floor(
        totalBalance * (0.1 + Math.random() * 0.1)
      );
      const availableBalance = totalBalance - pendingBalance;

      data.push({
        date: date.toISOString(),
        totalBalance,
        availableBalance,
        pendingBalance,
      });
    }

    setBalanceTrendData(data);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // 가맹점 상세 페이지로 이동하는 함수
  const navigateToMerchantDetail = (merchantId: string) => {
    router.push(`/dashboard/merchants/details/${merchantId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // 잔액이 높은 순으로 정렬
  const sortedBalances = [...merchantBalances].sort(
    (a, b) => b.totalBalance - a.totalBalance
  );

  // 파이 차트용 데이터 변환
  const pieChartData = merchantBalances.map((merchant) => ({
    merchantId: merchant.merchantId,
    merchantName: merchant.merchantName,
    value:
      activeTab === "all"
        ? merchant.totalBalance
        : activeTab === "available"
        ? merchant.availableBalance
        : merchant.pendingBalance,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">가맹점별 대시보드</h1>
          <p className="text-gray-500 mt-1">
            {userInfo?.adminYn === "Y"
              ? "모든 가맹점의 잔액 정보를 확인할 수 있습니다."
              : "가맹점의 잔액 정보를 확인할 수 있습니다."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/reports/merchants")}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            보고서 보기
          </Button>
          <Button
            variant="default"
            onClick={() => router.push("/dashboard/merchants/balance")}
          >
            <DollarSign className="mr-2 h-4 w-4" />
            잔액 관리
          </Button>
        </div>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">총 잔액</CardTitle>
            <CardDescription className="text-indigo-200">
              모든 가맹점 합산
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {merchantBalances
                .reduce((sum, item) => sum + item.totalBalance, 0)
                .toLocaleString()}
              원
            </div>
            <div className="flex items-center mt-2 text-indigo-200">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>전일 대비 5.2% 증가</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">가용 잔액</CardTitle>
            <CardDescription className="text-gray-500">
              출금 가능한 금액
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {merchantBalances
                .reduce((sum, item) => sum + item.availableBalance, 0)
                .toLocaleString()}
              원
            </div>
            <div className="flex items-center mt-2 text-green-600">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              <span>전일 대비 3.8% 증가</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">대기 잔액</CardTitle>
            <CardDescription className="text-gray-500">
              정산 대기 중인 금액
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {merchantBalances
                .reduce((sum, item) => sum + item.pendingBalance, 0)
                .toLocaleString()}
              원
            </div>
            <div className="flex items-center mt-2 text-amber-600">
              <ArrowDownRight className="h-4 w-4 mr-1" />
              <span>전일 대비 1.2% 감소</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 가맹점별 잔액 탭 */}
      <Card>
        <CardHeader>
          <CardTitle>가맹점별 잔액 현황</CardTitle>
          <CardDescription>
            각 가맹점의 현재 잔액 상태를 확인할 수 있습니다.
          </CardDescription>
          <Tabs
            defaultValue="all"
            className="mt-4"
            onValueChange={handleTabChange}
          >
            <TabsList>
              <TabsTrigger value="all">전체 잔액</TabsTrigger>
              <TabsTrigger value="available">가용 잔액</TabsTrigger>
              <TabsTrigger value="pending">대기 잔액</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">가맹점</th>
                  <th className="text-right py-3 px-4">
                    {activeTab === "all" && "총 잔액"}
                    {activeTab === "available" && "가용 잔액"}
                    {activeTab === "pending" && "대기 잔액"}
                  </th>
                  <th className="text-right py-3 px-4">비율</th>
                  <th className="text-right py-3 px-4">최근 업데이트</th>
                  <th className="text-right py-3 px-4">관리</th>
                </tr>
              </thead>
              <tbody>
                {sortedBalances.map((merchant) => {
                  const displayBalance =
                    activeTab === "all"
                      ? merchant.totalBalance
                      : activeTab === "available"
                      ? merchant.availableBalance
                      : merchant.pendingBalance;

                  return (
                    <tr
                      key={merchant.merchantId}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        navigateToMerchantDetail(merchant.merchantId)
                      }
                    >
                      <td className="py-3 px-4 text-gray-800">
                        {merchant.merchantId}
                      </td>
                      <td className="py-3 px-4 font-medium text-indigo-600">
                        {merchant.merchantName}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {displayBalance.toLocaleString()}원
                      </td>
                      <td className="py-3 px-4 text-green-600">
                        {merchant.availableBalance.toLocaleString()}원
                      </td>
                      <td className="py-3 px-4 text-yellow-600">
                        {merchant.pendingBalance.toLocaleString()}원
                      </td>
                    </tr>
                  );
                })}
                {merchantBalances.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      가맹점 정보가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              잔액 추이
            </CardTitle>
            <CardDescription>최근 7일간 잔액 변화 추이</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {balanceTrendData.length > 0 ? (
              <BalanceTrendChart data={balanceTrendData} />
            ) : (
              <div className="text-center text-gray-500 h-full flex flex-col items-center justify-center">
                <LineChart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>차트 데이터를 불러오는 중입니다...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              가맹점별 잔액 분포
            </CardTitle>
            <CardDescription>가맹점별 잔액 비율</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {pieChartData.length > 0 ? (
              <MerchantBalancePieChart data={pieChartData} />
            ) : (
              <div className="text-center text-gray-500 h-full flex flex-col items-center justify-center">
                <PieChart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <p>차트 데이터를 불러오는 중입니다...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
