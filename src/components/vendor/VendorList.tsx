import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { getVendorList } from '@/lib/api/vendor/client';
import { Vendor, VendorStatus } from '@/types/vendor';
import { useAsyncCall } from '@/hooks/useAsyncCall';
import { useLoading } from '@/context/LoadingContext';
import { Search, Plus, RefreshCw, Filter } from 'lucide-react';

/**
 * 거래처 목록 컴포넌트
 */
export default function VendorList() {
  const router = useRouter();
  const { setLoading } = useLoading();
  
  // 상태 관리
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchText, setSearchText] = useState('');
  const [status, setStatus] = useState<VendorStatus | ''>('');
  const [sortColumn, setSortColumn] = useState('vendorName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // API 호출 함수
  const { execute: fetchVendors, isLoading, error } = useAsyncCall(async () => {
    setLoading(true);
    try {
      const response = await getVendorList({
        searchText: searchText || undefined,
        status: status || undefined,
        page: currentPage,
        limit: itemsPerPage,
        sortColumn,
        sortDirection
      });
      
      setVendors(response.vendors);
      setTotalItems(response.pagination.total);
    } finally {
      setLoading(false);
    }
  });

  // 초기 데이터 로딩 및 필터 변경 시 데이터 다시 로딩
  useEffect(() => {
    fetchVendors();
  }, [currentPage, itemsPerPage, sortColumn, sortDirection]);

  // 검색 처리
  const handleSearch = () => {
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
    fetchVendors();
  };

  // 정렬 처리
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // 같은 컬럼을 클릭한 경우 정렬 방향 전환
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // 다른 컬럼을 클릭한 경우 해당 컬럼으로 정렬 변경
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // 페이지 변경 처리
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 상태에 따른 배지 색상 및 텍스트 반환
  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">활성</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500">비활성</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">대기중</Badge>;
      default:
        return <Badge className="bg-gray-500">알 수 없음</Badge>;
    }
  };

  // 페이지 수 계산
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-xl font-bold">거래처 관리</CardTitle>
            <CardDescription>
              등록된 거래처 목록을 관리합니다.
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              필터
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchVendors()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              새로고침
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => router.push('/dashboard/vendors/new')}
            >
              <Plus className="mr-2 h-4 w-4" />
              거래처 등록
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 검색 및 필터 영역 */}
          <div className="flex flex-col space-y-4 mb-4">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="거래처명, 사업자번호, 대표자명으로 검색"
                  className="pl-8"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>검색</Button>
            </div>

            {/* 필터 영역 - 토글 가능 */}
            {showFilters && (
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="w-full md:w-auto">
                  <Select
                    value={status}
                    onValueChange={(value) => setStatus(value as VendorStatus | '')}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="상태 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">모든 상태</SelectItem>
                      <SelectItem value="active">활성</SelectItem>
                      <SelectItem value="inactive">비활성</SelectItem>
                      <SelectItem value="pending">대기중</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-full md:w-auto">
                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={(value) => setItemsPerPage(Number(value))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="페이지당 항목 수" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5개씩 보기</SelectItem>
                      <SelectItem value="10">10개씩 보기</SelectItem>
                      <SelectItem value="20">20개씩 보기</SelectItem>
                      <SelectItem value="50">50개씩 보기</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* 거래처 목록 테이블 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('id')}
                  >
                    ID {sortColumn === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('vendorName')}
                  >
                    거래처명 {sortColumn === 'vendorName' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>사업자번호</TableHead>
                  <TableHead>대표자명</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('createdAt')}
                  >
                    등록일 {sortColumn === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {isLoading ? '로딩 중...' : '거래처 정보가 없습니다.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.id}</TableCell>
                      <TableCell>{vendor.vendorName}</TableCell>
                      <TableCell>{vendor.businessNumber}</TableCell>
                      <TableCell>{vendor.representativeName}</TableCell>
                      <TableCell>{getStatusBadge(vendor.status)}</TableCell>
                      <TableCell>{new Date(vendor.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)}
                          >
                            상세
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/dashboard/vendors/${vendor.id}/edit`)}
                          >
                            수정
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter>
          {/* 페이지네이션 */}
          {totalPages > 0 && (
            <Pagination className="mx-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // 현재 페이지 주변의 페이지 번호만 표시
                  let pageNum: number;
                  if (totalPages <= 5) {
                    // 전체 페이지가 5개 이하면 모든 페이지 표시
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    // 현재 페이지가 앞쪽이면 1~5 표시
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    // 현재 페이지가 뒤쪽이면 마지막 5개 표시
                    pageNum = totalPages - 4 + i;
                  } else {
                    // 그 외에는 현재 페이지 중심으로 표시
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
