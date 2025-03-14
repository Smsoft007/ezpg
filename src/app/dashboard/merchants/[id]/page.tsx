"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMerchantById } from "@/api/merchants";
import { formatDate, formatCurrency } from "@/lib/utils";

// 가맹점 상세 정보 인터페이스
interface MerchantDetail {
  id: number;
  name: string;
  businessNumber: string;
  representativeName: string;
  status: string;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt?: Date;
  contact?: {
    id: number;
    merchantId: number;
    name: string;
    email: string;
    phone: string;
    position?: string;
    createdAt: Date;
    updatedAt?: Date;
  };
  address?: {
    id: number;
    merchantId: number;
    zipCode: string;
    address1: string;
    address2?: string;
    createdAt: Date;
    updatedAt?: Date;
  };
  account?: {
    id: number;
    merchantId: number;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    createdAt: Date;
    updatedAt?: Date;
  };
  fees?: {
    id: number;
    merchantId: number;
    paymentFee: string;
    withdrawalFee: string;
    createdAt: Date;
    updatedAt?: Date;
  };
}

// 거래 내역 인터페이스
interface Transaction {
  id: string;
  type: "deposit" | "withdrawal";
  amount: number;
  fee: number;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  completedAt?: string;
}

// 샘플 거래 내역 데이터 (추후 API 연동 시 제거)
const sampleTransactions: Transaction[] = [
  {
    id: "T001",
    type: "deposit",
    amount: 500000,
    fee: 17500,
    status: "completed",
    createdAt: "2025-03-14T09:30:00Z",
    completedAt: "2025-03-14T09:35:00Z",
  },
  {
    id: "T002",
    type: "withdrawal",
    amount: 200000,
    fee: 1000,
    status: "completed",
    createdAt: "2025-03-13T14:20:00Z",
    completedAt: "2025-03-13T14:30:00Z",
  },
  {
    id: "T003",
    type: "deposit",
    amount: 300000,
    fee: 10500,
    status: "pending",
    createdAt: "2025-03-14T11:15:00Z",
  },
  {
    id: "T004",
    type: "withdrawal",
    amount: 100000,
    fee: 1000,
    status: "failed",
    createdAt: "2025-03-12T16:45:00Z",
  },
  {
    id: "T005",
    type: "deposit",
    amount: 1000000,
    fee: 35000,
    status: "completed",
    createdAt: "2025-03-10T10:10:00Z",
    completedAt: "2025-03-10T10:20:00Z",
  },
];

export default function MerchantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [merchant, setMerchant] = useState<MerchantDetail | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 가맹점 ID가 없는 경우
        if (!params.id) {
          setError("가맹점 ID가 유효하지 않습니다.");
          setLoading(false);
          return;
        }
        
        // 실제 API 호출
        const merchantData = await fetchMerchantById(Number(params.id));
        setMerchant(merchantData);
        
        // 거래 내역은 아직 샘플 데이터 사용 (추후 API 연동)
        setTransactions(sampleTransactions);
        
        setLoading(false);
      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        setError("가맹점 정보를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // 상태에 따른 배지 색상
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">활성</Badge>;
      case "inactive":
        return <Badge className="bg-gray-500">비활성</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">대기중</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // 거래 유형에 따른 배지 색상
  const getTransactionTypeBadge = (type: Transaction["type"]) => {
    switch (type) {
      case "deposit":
        return <Badge className="bg-blue-500">입금</Badge>;
      case "withdrawal":
        return <Badge className="bg-purple-500">출금</Badge>;
      default:
        return null;
    }
  };

  // 거래 상태에 따른 배지 색상
  const getTransactionStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">완료</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">처리중</Badge>;
      case "failed":
        return <Badge className="bg-red-500">실패</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg">데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error || !merchant) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-lg text-red-500">{error || "가맹점 정보를 찾을 수 없습니다."}</p>
          <Button onClick={() => router.push("/dashboard/merchants")}>
            가맹점 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          뒤로 가기
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{merchant.name}</h1>
          <p className="text-gray-500">가맹점 ID: {merchant.id}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/merchants/${merchant.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              수정
            </Button>
          </Link>
          <Button variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <TabsTrigger value="info">기본 정보</TabsTrigger>
          <TabsTrigger value="transactions">거래 내역</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-gray-500">가맹점명</dt>
                    <dd className="mt-1">{merchant.name}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-gray-500">사업자번호</dt>
                    <dd className="mt-1">{merchant.businessNumber}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-gray-500">대표자명</dt>
                    <dd className="mt-1">{merchant.representativeName}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-gray-500">상태</dt>
                    <dd className="mt-1">{getStatusBadge(merchant.status)}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-gray-500">등록일</dt>
                    <dd className="mt-1">{formatDate(merchant.createdAt)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* 연락처 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>연락처 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4">
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-gray-500">이메일</dt>
                    <dd className="mt-1">{merchant.email}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="text-sm font-medium text-gray-500">전화번호</dt>
                    <dd className="mt-1">{merchant.phone}</dd>
                  </div>
                  {merchant.contact && (
                    <>
                      <div className="flex flex-col">
                        <dt className="text-sm font-medium text-gray-500">담당자명</dt>
                        <dd className="mt-1">{merchant.contact.name}</dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="text-sm font-medium text-gray-500">담당자 이메일</dt>
                        <dd className="mt-1">{merchant.contact.email}</dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="text-sm font-medium text-gray-500">담당자 연락처</dt>
                        <dd className="mt-1">{merchant.contact.phone}</dd>
                      </div>
                    </>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* 주소 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>주소 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4">
                  {merchant.address ? (
                    <>
                      <div className="flex flex-col">
                        <dt className="text-sm font-medium text-gray-500">우편번호</dt>
                        <dd className="mt-1">{merchant.address.zipCode}</dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="text-sm font-medium text-gray-500">주소</dt>
                        <dd className="mt-1">{merchant.address.address1}</dd>
                      </div>
                      {merchant.address.address2 && (
                        <div className="flex flex-col">
                          <dt className="text-sm font-medium text-gray-500">상세주소</dt>
                          <dd className="mt-1">{merchant.address.address2}</dd>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">등록된 주소 정보가 없습니다.</p>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* 계좌 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>계좌 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4">
                  {merchant.account ? (
                    <>
                      <div className="flex flex-col">
                        <dt className="text-sm font-medium text-gray-500">은행</dt>
                        <dd className="mt-1">{merchant.account.bank}</dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="text-sm font-medium text-gray-500">계좌번호</dt>
                        <dd className="mt-1">{merchant.account.accountNumber}</dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="text-sm font-medium text-gray-500">예금주</dt>
                        <dd className="mt-1">{merchant.account.accountHolder}</dd>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">등록된 계좌 정보가 없습니다.</p>
                  )}
                </dl>
              </CardContent>
            </Card>

            {/* 수수료 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>수수료 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-4">
                  {merchant.fees ? (
                    <>
                      <div className="flex flex-col">
                        <dt className="text-sm font-medium text-gray-500">결제 수수료</dt>
                        <dd className="mt-1">{merchant.fees.paymentFee}%</dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="text-sm font-medium text-gray-500">출금 수수료</dt>
                        <dd className="mt-1">{formatCurrency(parseInt(merchant.fees.withdrawalFee))}원</dd>
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500">등록된 수수료 정보가 없습니다.</p>
                  )}
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>거래 내역</CardTitle>
              <CardDescription>최근 거래 내역을 확인할 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        거래 ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        유형
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        금액
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        수수료
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        생성일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        완료일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                          거래 내역이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getTransactionTypeBadge(transaction.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(transaction.amount)}원
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(transaction.fee)}원
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getTransactionStatusBadge(transaction.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(new Date(transaction.createdAt))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {transaction.completedAt
                              ? formatDate(new Date(transaction.completedAt))
                              : "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  내역 다운로드
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
