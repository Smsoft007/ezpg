"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchMerchants } from "@/api/merchants";
import { formatDate } from "@/lib/utils";

export default function MerchantsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  // 검색 필터
  const [filters, setFilters] = useState({
    name: "",
    businessNumber: "",
    status: "all",
  });

  // 가맹점 목록 조회
  const loadMerchants = async () => {
    setIsLoading(true);
    try {
      const response = await fetchMerchants({
        name: filters.name || undefined,
        businessNumber: filters.businessNumber || undefined,
        status: filters.status === "all" ? undefined : filters.status || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      
      setMerchants(response.merchants);
      setPagination(response.pagination);
    } catch (error) {
      console.error("가맹점 목록 조회 중 오류가 발생했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 가맹점 목록 조회
  useEffect(() => {
    loadMerchants();
  }, [pagination.page, pagination.pageSize]);

  // 검색 버튼 클릭 시 가맹점 목록 조회
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // 페이지 초기화
    loadMerchants();
  };

  // 필터 변경 핸들러
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 상태에 따른 배지 색상 및 텍스트
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

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">가맹점 관리</h1>
        <Link href="/dashboard/merchants/register">
          <Button>새 가맹점 등록</Button>
        </Link>
      </div>

      {/* 검색 필터 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>가맹점 검색</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">가맹점명</Label>
              <Input
                id="name"
                placeholder="가맹점명 입력"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessNumber">사업자번호</Label>
              <Input
                id="businessNumber"
                placeholder="000-00-00000"
                value={filters.businessNumber}
                onChange={(e) =>
                  handleFilterChange("businessNumber", e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">상태</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                  <SelectItem value="pending">대기중</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSearch}>검색</Button>
          </div>
        </CardContent>
      </Card>

      {/* 가맹점 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>가맹점 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>가맹점명</TableHead>
                  <TableHead>사업자번호</TableHead>
                  <TableHead>대표자</TableHead>
                  <TableHead>연락처</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>등록일</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      데이터를 불러오는 중입니다...
                    </TableCell>
                  </TableRow>
                ) : merchants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      등록된 가맹점이 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  merchants.map((merchant) => (
                    <TableRow key={merchant.id}>
                      <TableCell className="font-medium">
                        {merchant.name}
                      </TableCell>
                      <TableCell>{merchant.businessNumber}</TableCell>
                      <TableCell>{merchant.representativeName}</TableCell>
                      <TableCell>{merchant.phone}</TableCell>
                      <TableCell>{getStatusBadge(merchant.status)}</TableCell>
                      <TableCell>{formatDate(merchant.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/merchants/${merchant.id}`}>
                            <Button variant="outline" size="sm">
                              상세
                            </Button>
                          </Link>
                          <Link href={`/dashboard/merchants/${merchant.id}/edit`}>
                            <Button variant="outline" size="sm">
                              수정
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 0 && (
            <div className="flex justify-center mt-4 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                이전
              </Button>
              <span className="flex items-center px-2">
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
