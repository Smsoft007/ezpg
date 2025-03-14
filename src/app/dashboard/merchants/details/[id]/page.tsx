"use client";

import BalanceTrendChart from "@/components/charts/BalanceTrendChart";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building,
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  LineChart,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface MerchantDetail {
  merchantId: string;
  merchantName: string;
  businessNumber: string;
  representativeName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  registrationDate: string;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  date: string;
  type: "deposit" | "withdrawal" | "fee" | "refund";
  amount: number;
  status: "completed" | "pending" | "failed";
  description: string;
}

interface BalanceTrendData {
  date: string;
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
}

export default function MerchantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const merchantId = params.id as string;

  const [merchantDetail, setMerchantDetail] = useState<MerchantDetail | null>(
    null
  );
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balanceTrendData, setBalanceTrendData] = useState<BalanceTrendData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== "undefined") {
      try {
        // 사용자 정보 확인
        const storedUserInfo = localStorage.getItem("userInfo");
        if (!storedUserInfo) {
          // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
          router.push("/login");
          return;
        }

        // 더미 가맹점 상세 정보 생성
        generateDummyMerchantDetail(merchantId);

        // 더미 거래 내역 생성
        generateDummyTransactions();

        // 더미 잔액 추이 데이터 생성
        generateDummyBalanceTrendData();
      } catch (error) {
        console.error("가맹점 정보 로드 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [merchantId, router]);

  // 더미 가맹점 상세 정보 생성 함수
  const generateDummyMerchantDetail = (id: string) => {
    const dummyMerchants = [
      {
        merchantId: "M001",
        merchantName: "테스트 가맹점",
        businessNumber: "123-45-67890",
        representativeName: "홍길동",
        contactPhone: "02-1234-5678",
        contactEmail: "test@example.com",
        address: "서울시 강남구 테헤란로 123",
        registrationDate: "2023-01-15T00:00:00Z",
      },
      {
        merchantId: "M002",
        merchantName: "온라인 쇼핑몰",
        businessNumber: "234-56-78901",
        representativeName: "김철수",
        contactPhone: "02-2345-6789",
        contactEmail: "shop@example.com",
        address: "서울시 서초구 서초대로 456",
        registrationDate: "2023-02-20T00:00:00Z",
      },
      {
        merchantId: "M003",
        merchantName: "모바일 게임",
        businessNumber: "345-67-89012",
        representativeName: "이영희",
        contactPhone: "02-3456-7890",
        contactEmail: "game@example.com",
        address: "경기도 성남시 분당구 판교로 789",
        registrationDate: "2023-03-10T00:00:00Z",
      },
      {
        merchantId: "M004",
        merchantName: "디지털 콘텐츠",
        businessNumber: "456-78-90123",
        representativeName: "박민수",
        contactPhone: "02-4567-8901",
        contactEmail: "content@example.com",
        address: "서울시 마포구 월드컵북로 101",
        registrationDate: "2023-04-05T00:00:00Z",
      },
      {
        merchantId: "M005",
        merchantName: "구독 서비스",
        businessNumber: "567-89-01234",
        representativeName: "최지은",
        contactPhone: "02-5678-9012",
        contactEmail: "subscribe@example.com",
        address: "서울시 영등포구 여의대로 202",
        registrationDate: "2023-05-15T00:00:00Z",
      },
    ];

    const merchant = dummyMerchants.find((m) => m.merchantId === id);

    if (merchant) {
      const totalBalance = Math.floor(Math.random() * 10000000) + 1000000;
      const pendingBalance = Math.floor(Math.random() * (totalBalance * 0.2));
      const availableBalance = totalBalance - pendingBalance;

      setMerchantDetail({
        ...merchant,
        totalBalance,
        availableBalance,
        pendingBalance,
        lastUpdated: new Date().toISOString(),
      });
    } else {
      // 가맹점을 찾을 수 없는 경우
      router.push("/dashboard/merchant-dashboard");
    }
  };

  // 더미 거래 내역 생성 함수
  const generateDummyTransactions = () => {
    const transactionTypes: ("deposit" | "withdrawal" | "fee" | "refund")[] = [
      "deposit",
      "withdrawal",
      "fee",
      "refund",
    ];
    const descriptions = [
      "정기 결제",
      "환불 처리",
      "수수료 정산",
      "월 정산",
      "일일 정산",
      "예치금 입금",
      "출금 요청",
    ];

    const dummyTransactions: Transaction[] = [];
    const today = new Date();

    // 최근 20개의 거래 내역 생성
    for (let i = 0; i < 20; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // 최근 30일 내

      const type =
        transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const amount = Math.floor(Math.random() * 1000000) + 10000;

      // 상태 결정 (최근 거래일수록 pending 확률 높게)
      const daysDiff = Math.floor(
        (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );
      let status: "completed" | "pending" | "failed";

      if (daysDiff < 2) {
        // 최근 2일 내 거래는 pending 확률 높게
        status = Math.random() < 0.6 ? "pending" : "completed";
      } else if (daysDiff < 7) {
        // 최근 7일 내 거래는 completed 확률 높게
        status =
          Math.random() < 0.8
            ? "completed"
            : Math.random() < 0.5
            ? "pending"
            : "failed";
      } else {
        // 오래된 거래는 대부분 completed
        status = Math.random() < 0.95 ? "completed" : "failed";
      }

      dummyTransactions.push({
        id: `T${String(i + 1).padStart(3, "0")}`,
        date: date.toISOString(),
        type,
        amount,
        status,
        description:
          descriptions[Math.floor(Math.random() * descriptions.length)],
      });
    }

    // 날짜 기준 내림차순 정렬
    dummyTransactions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setTransactions(dummyTransactions);
  };

  // 더미 잔액 추이 데이터 생성 함수
  const generateDummyBalanceTrendData = () => {
    const data: BalanceTrendData[] = [];
    const today = new Date();

    // 최근 30일간의 데이터 생성
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // 기본 값 설정 (증가 추세)
      const baseValue = 5000000 + (29 - i) * 50000;

      // 약간의 변동성 추가
      const totalBalance = baseValue + Math.floor(Math.random() * 300000);
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

  // 숫자 포맷팅 함수
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ko-KR").format(value) + "원";
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 거래 유형에 따른 스타일 및 텍스트
  const getTransactionTypeStyle = (type: string) => {
    switch (type) {
      case "deposit":
        return { color: "text-green-600", text: "입금" };
      case "withdrawal":
        return { color: "text-red-600", text: "출금" };
      case "fee":
        return { color: "text-orange-600", text: "수수료" };
      case "refund":
        return { color: "text-blue-600", text: "환불" };
      default:
        return { color: "text-gray-600", text: type };
    }
  };

  // 거래 상태에 따른 스타일 및 텍스트
  const getTransactionStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return { color: "bg-green-100 text-green-800", text: "완료" };
      case "pending":
        return { color: "bg-yellow-100 text-yellow-800", text: "처리중" };
      case "failed":
        return { color: "bg-red-100 text-red-800", text: "실패" };
      default:
        return { color: "bg-gray-100 text-gray-800", text: status };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!merchantDetail) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">가맹점을 찾을 수 없습니다</h1>
        <Button onClick={() => router.push("/dashboard/merchant-dashboard")}>
          대시보드로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/merchant-dashboard")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">가맹점 상세 정보</h1>
      </div>

      {/* 가맹점 기본 정보 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center">
            <Building className="h-5 w-5 mr-2" />
            {merchantDetail.merchantName}
          </CardTitle>
          <CardDescription>
            가맹점 ID: {merchantDetail.merchantId} | 등록일:{" "}
            {formatDate(merchantDetail.registrationDate)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <User className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">대표자</p>
                  <p className="font-medium">
                    {merchantDetail.representativeName}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">사업자 번호</p>
                  <p className="font-medium">{merchantDetail.businessNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">이메일</p>
                  <p className="font-medium">{merchantDetail.contactEmail}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">연락처</p>
                  <p className="font-medium">{merchantDetail.contactPhone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">등록일</p>
                  <p className="font-medium">
                    {formatDate(merchantDetail.registrationDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">주소</p>
                  <p className="font-medium">{merchantDetail.address}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 잔액 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">총 잔액</CardTitle>
            <CardDescription className="text-indigo-200">
              마지막 업데이트: {formatDate(merchantDetail.lastUpdated)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(merchantDetail.totalBalance)}
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
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(merchantDetail.availableBalance)}
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
            <div className="text-3xl font-bold text-yellow-600">
              {formatCurrency(merchantDetail.pendingBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">거래 내역</TabsTrigger>
          <TabsTrigger value="balance-trend">잔액 추이</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  거래 내역
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  내보내기
                </Button>
              </div>
              <CardDescription>최근 거래 내역을 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        거래 ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        날짜
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        유형
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        금액
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        상태
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        설명
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => {
                      const typeStyle = getTransactionTypeStyle(
                        transaction.type
                      );
                      const statusStyle = getTransactionStatusStyle(
                        transaction.status
                      );

                      return (
                        <tr
                          key={transaction.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-gray-800">
                            {transaction.id}
                          </td>
                          <td className="py-3 px-4 text-gray-800">
                            {formatDate(transaction.date)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={typeStyle.color}>
                              {typeStyle.text}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-medium">
                            {formatCurrency(transaction.amount)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${statusStyle.color}`}
                            >
                              {statusStyle.text}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {transaction.description}
                          </td>
                        </tr>
                      );
                    })}
                    {transactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-4 text-gray-500"
                        >
                          거래 내역이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-trend">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                잔액 추이
              </CardTitle>
              <CardDescription>최근 30일간 잔액 변화 추이</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
