"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Download, Edit, Trash2, AlertCircle, Building2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMerchantById } from "@/api/merchants";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Merchant, MerchantTransaction } from "@/types/merchants";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { MerchantStatusBadge } from "@/components/merchants/MerchantStatusBadge";

// Skeleton 컴포넌트 직접 구현
const Skeleton = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`animate-pulse rounded-md bg-muted ${className}`}
    {...props}
  />
);

// 가맹점 상세 정보 인터페이스
interface MerchantDetail extends Merchant {
  contact?: {
    name: string;
    email: string;
    phoneNumber: string;
    position?: string;
  };
  transactions?: MerchantTransaction[];
}

// 샘플 거래 내역 데이터 (추후 API 연동 시 제거)
const sampleTransactions: MerchantTransaction[] = [
  {
    id: 1,
    merchantId: 1,
    type: "deposit",
    amount: 500000,
    fee: 17500,
    status: "completed",
    createdAt: "2025-03-14T09:30:00Z",
    completedAt: "2025-03-14T09:35:00Z",
    description: "카드 결제 입금"
  },
  {
    id: 2,
    merchantId: 1,
    type: "withdrawal",
    amount: 200000,
    fee: 1000,
    status: "completed",
    createdAt: "2025-03-13T14:20:00Z",
    completedAt: "2025-03-13T14:30:00Z",
    description: "정산 출금"
  },
  {
    id: 3,
    merchantId: 1,
    type: "deposit",
    amount: 300000,
    fee: 10500,
    status: "pending",
    createdAt: "2025-03-14T11:15:00Z",
    description: "카드 결제 입금 대기"
  },
  {
    id: 4,
    merchantId: 1,
    type: "withdrawal",
    amount: 100000,
    fee: 1000,
    status: "failed",
    createdAt: "2025-03-12T16:45:00Z",
    description: "계좌 정보 오류"
  },
  {
    id: 5,
    merchantId: 1,
    type: "deposit",
    amount: 1000000,
    fee: 35000,
    status: "completed",
    createdAt: "2025-03-10T10:10:00Z",
    completedAt: "2025-03-10T10:20:00Z",
    description: "카드 결제 입금"
  },
];

export default function MerchantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [transactions, setTransactions] = useState<MerchantTransaction[]>([]);
  const [loading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 가맹점 ID가 없는 경우
        if (!params.id) {
          setError("가맹점 ID가 유효하지 않습니다.");
          setIsLoading(false);
          return;
        }
        
        // 실제 API 호출
        const response = await fetchMerchantById(Number(params.id));
        
        if (response.status === 'error') {
          setError(response.error?.message || "가맹점 정보를 불러오는 중 오류가 발생했습니다.");
          setIsLoading(false);
          return;
        }
        
        // 경고 메시지가 있는 경우 표시
        if (response.warning) {
          setError(response.warning.message);
        }
        
        const merchantData = response.data;
        
        if (!merchantData) {
          setError("가맹점 정보가 존재하지 않습니다.");
          setIsLoading(false);
          return;
        }
        
        // Merchant 타입을 MerchantDetail 타입으로 변환
        const merchantDetail: MerchantDetail = {
          ...merchantData,
          // 연락처 정보 매핑
          contact: {
            name: merchantData.representativeName,
            email: merchantData.email,
            phoneNumber: merchantData.phoneNumber,
            position: '대표자'
          },
          transactions: sampleTransactions
        };
        
        setMerchant(merchantDetail);
        
        // 거래 내역은 아직 샘플 데이터 사용 (추후 API 연동)
        setTransactions(sampleTransactions);
        
        setIsLoading(false);
      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        setError("가맹점 정보를 불러오는 중 오류가 발생했습니다.");
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // 거래 유형에 따른 배지 색상
  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return <Badge className="bg-blue-500">입금</Badge>;
      case "withdrawal":
        return <Badge className="bg-orange-500">출금</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  // 거래 상태에 따른 배지 색상
  const getTransactionStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500">완료</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">처리중</Badge>;
      case "failed":
        return <Badge variant="destructive">실패</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            뒤로가기
          </Button>
          <div>
            <h2 className="text-2xl font-semibold">가맹점 상세 정보</h2>
          </div>
        </div>
        
        <div className="flex justify-center items-center h-[60vh]">
          <LoadingSpinner size="lg" text="가맹점 정보를 불러오는 중..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            뒤로가기
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="rounded-full bg-destructive/10 p-3">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-xl font-semibold">오류가 발생했습니다</h3>
          <p className="text-muted-foreground text-center max-w-md">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            뒤로가기
          </Button>
        </div>
        
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <div className="rounded-full bg-muted p-3">
            <Building2 className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold">가맹점 정보를 찾을 수 없습니다</h3>
          <p className="text-muted-foreground text-center max-w-md">
            요청하신 가맹점 정보가 존재하지 않거나 접근 권한이 없습니다.
          </p>
          <Button variant="outline" onClick={() => router.push('/dashboard/merchants')}>
            가맹점 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => router.back()} className="mr-4">
            <ArrowLeft className="h-5 w-5 mr-1" />
            뒤로가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {merchant.name} <MerchantStatusBadge status={merchant.status} />
            </h1>
            <p className="text-muted-foreground mt-1">
              사업자번호: {merchant.businessNumber} | 등록일: {formatDate(merchant.registrationDate)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/merchants/${merchant.id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              수정
            </Button>
          </Link>
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      {/* 요약 정보 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">대표자명</dt>
                <dd className="font-medium">{merchant.representativeName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">이메일</dt>
                <dd className="font-medium">{merchant.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">연락처</dt>
                <dd className="font-medium">{merchant.phoneNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">주소</dt>
                <dd className="font-medium">
                  {merchant.address}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">정산 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">은행</dt>
                <dd className="font-medium">{merchant.bankName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">계좌번호</dt>
                <dd className="font-medium">{merchant.accountNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">예금주</dt>
                <dd className="font-medium">{merchant.accountHolder}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">수수료율</dt>
                <dd className="font-medium">{merchant.commissionRate}%</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">계약 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">계약 시작일</dt>
                <dd className="font-medium">{formatDate(merchant.contractStartDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">계약 종료일</dt>
                <dd className="font-medium">{formatDate(merchant.contractEndDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">등록일</dt>
                <dd className="font-medium">{formatDate(merchant.registrationDate)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">최종 수정일</dt>
                <dd className="font-medium">{formatDate(merchant.lastUpdated)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">잔액 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">총 잔액</dt>
                <dd className="font-medium text-xl">{formatCurrency(1500000)}원</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">출금 가능 잔액</dt>
                <dd className="font-medium text-emerald-600">{formatCurrency(1200000)}원</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">출금 대기 잔액</dt>
                <dd className="font-medium text-amber-600">{formatCurrency(300000)}원</dd>
              </div>
              <div className="mt-4">
                <Button className="w-full">출금 신청</Button>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      {/* 탭 컨텐츠 */}
      <Tabs defaultValue="transactions" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">거래 내역</TabsTrigger>
          <TabsTrigger value="settlements">정산 내역</TabsTrigger>
          <TabsTrigger value="logs">활동 로그</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">거래 내역</CardTitle>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  내보내기
                </Button>
              </div>
              <CardDescription>
                최근 거래 내역을 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-muted/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        거래번호
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        유형
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        금액
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        수수료
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        일시
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        설명
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getTransactionTypeBadge(transaction.type)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(transaction.amount)}원
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatCurrency(transaction.fee)}원
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getTransactionStatusBadge(transaction.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(transaction.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {transaction.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="settlements">
          <Card>
            <CardHeader>
              <CardTitle>정산 내역</CardTitle>
              <CardDescription>
                정산 내역 기능은 아직 개발 중입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center py-12">
                <p className="text-muted-foreground">준비 중입니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>활동 로그</CardTitle>
              <CardDescription>
                활동 로그 기능은 아직 개발 중입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-center py-12">
                <p className="text-muted-foreground">준비 중입니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
