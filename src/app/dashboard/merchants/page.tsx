"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Plus, AlertCircle, Search, X, Filter, RefreshCw, Download } from "lucide-react";
import { fetchMerchants } from "@/api/merchants";
import { Merchant, MerchantSearchParams } from "@/types/merchants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MerchantTable, MerchantSearchForm } from "@/components/merchants";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function MerchantsPage() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  
  // 페이지네이션 상태
  const [pagination, setPagination] = useState({
    totalCount: 0,
    page: 1,
    pageSize: 10,
    totalPages: 0,
  });

  // 검색 필터
  const [filters, setFilters] = useState<MerchantSearchParams>({
    name: "",
    businessNumber: "",
    status: "all",
    page: 1,
    pageSize: 10,
  });

  // 가맹점 목록 조회
  const loadMerchants = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchMerchants({
        name: filters.name || undefined,
        businessNumber: filters.businessNumber || undefined,
        status: activeTab === "all" ? undefined : activeTab,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      
      if (response.status === 'error') {
        setError(response.error?.message || '가맹점 목록을 불러오는 중 오류가 발생했습니다.');
        // 샘플 데이터 사용 여부 확인
        if (response.error?.code === 'DB_PROCEDURE_NOT_FOUND') {
          setError('저장 프로시저를 찾을 수 없습니다. 샘플 데이터를 사용합니다.');
        }
        setMerchants([]);
        setPagination({
          totalCount: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        });
      } else {
        setMerchants(response.data?.merchants || []);
        setPagination(response.data?.pagination || {
          totalCount: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        });
      }
    } catch (error) {
      console.error("가맹점 목록 조회 중 오류가 발생했습니다:", error);
      setError('가맹점 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지 로드 시 가맹점 목록 조회
  useEffect(() => {
    loadMerchants();
  }, [pagination.page, pagination.pageSize, activeTab]);

  // 검색 버튼 클릭 시 가맹점 목록 조회
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 })); // 페이지 초기화
    loadMerchants();
  };

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof MerchantSearchParams, value: MerchantSearchParams[keyof MerchantSearchParams]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // 검색 초기화
  const handleResetSearch = () => {
    setFilters({
      name: "",
      businessNumber: "",
      status: "all",
      page: 1,
      pageSize: 10,
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    setActiveTab("all");
    loadMerchants();
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  // 페이지네이션 아이템 생성
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    const startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={pagination.page === i}
            onClick={() => handlePageChange(i)}
            className="transition-all duration-200 hover:scale-105"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  // 탭 변경 핸들러
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // 엑셀 다운로드 핸들러
  const handleExportExcel = () => {
    alert("가맹점 목록을 엑셀로 다운로드합니다.");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl opacity-100 transition-all duration-500 ease-in-out">
      <PageHeader
        title="가맹점 관리"
        description="등록된 가맹점을 관리하고 새로운 가맹점을 등록할 수 있습니다."
        icon={Building2}
        action={{
          label: "새 가맹점 등록",
          href: "/dashboard/merchants/register",
          icon: Plus
        }}
      />

      {error && (
        <Alert variant="destructive" className="mb-6 animate-shake">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>알림</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <TabsList className="bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-background">
              전체
              <Badge variant="outline" className="ml-2 bg-background">{pagination.totalCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="rounded-md data-[state=active]:bg-background">
              활성
              <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
                {merchants.filter(m => m.status === 'active').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="inactive" className="rounded-md data-[state=active]:bg-background">
              비활성
              <Badge variant="outline" className="ml-2 bg-red-50 text-red-600 border-red-200">
                {merchants.filter(m => m.status === 'inactive').length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-md data-[state=active]:bg-background">
              대기중
              <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-600 border-yellow-200">
                {merchants.filter(m => m.status === 'pending').length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>상세 필터</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleResetSearch}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>필터 초기화</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleExportExcel}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>엑셀 다운로드</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <TabsContent value="all" className="m-0">
          {showFilters && (
            <div className="transition-all duration-300 ease-in-out overflow-hidden opacity-100 transform translate-y-0">
              <Card className="mb-6 shadow-sm border-muted bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-medium">상세 검색</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">가맹점명</Label>
                      <div className="relative">
                        <Input
                          id="name"
                          value={filters.name}
                          onChange={(e) => handleFilterChange("name", e.target.value)}
                          placeholder="가맹점명 검색"
                          className="pl-9"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="businessNumber" className="text-sm font-medium">사업자번호</Label>
                      <Input
                        id="businessNumber"
                        value={filters.businessNumber}
                        onChange={(e) => handleFilterChange("businessNumber", e.target.value)}
                        placeholder="000-00-00000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium">상태</Label>
                      <Select
                        value={filters.status}
                        onValueChange={(value: string) => handleFilterChange("status", value)}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="상태 선택" />
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
                </CardContent>
                <CardFooter className="border-t bg-muted/10 pt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={handleResetSearch}>
                    초기화
                  </Button>
                  <Button onClick={handleSearch}>
                    검색
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}

          <div className="space-y-4">
            <SectionHeader
              title="가맹점 목록"
              description={`총 ${pagination.totalCount}개의 가맹점`}
            />

            {isLoading ? (
              <div className="relative min-h-[400px] flex items-center justify-center">
                <LoadingSpinner 
                  size="lg" 
                  text="가맹점 목록을 불러오는 중입니다..." 
                />
              </div>
            ) : merchants.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="rounded-full bg-muted p-3">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">가맹점이 없습니다</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    등록된 가맹점이 없거나 검색 조건에 맞는 가맹점이 없습니다. 새 가맹점을 등록하거나 검색 조건을 변경해 보세요.
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" onClick={handleResetSearch}>
                      검색 초기화
                    </Button>
                    <Button asChild>
                      <Link href="/dashboard/merchants/register">
                        새 가맹점 등록
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <div className="transition-all duration-500 ease-in-out opacity-100 transform translate-y-0">
                <MerchantTable merchants={merchants} isLoading={isLoading} />
              </div>
            )}

            {/* 페이지네이션 */}
            {pagination.totalPages > 0 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:scale-105 transition-transform"}
                      />
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:scale-105 transition-transform"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="active" className="m-0">
          <div className="space-y-4">
            {isLoading ? (
              <div className="relative min-h-[400px] flex items-center justify-center">
                <LoadingSpinner 
                  size="lg" 
                  text="활성 가맹점 목록을 불러오는 중입니다..." 
                />
              </div>
            ) : (
              <div className="transition-all duration-500 ease-in-out opacity-100 transform translate-y-0">
                <MerchantTable merchants={merchants} isLoading={isLoading} />
              </div>
            )}

            {/* 페이지네이션 */}
            {pagination.totalPages > 0 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:scale-105 transition-transform"}
                      />
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:scale-105 transition-transform"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="inactive" className="m-0">
          <div className="space-y-4">
            {isLoading ? (
              <div className="relative min-h-[400px] flex items-center justify-center">
                <LoadingSpinner 
                  size="lg" 
                  text="비활성 가맹점 목록을 불러오는 중입니다..." 
                />
              </div>
            ) : (
              <div className="transition-all duration-500 ease-in-out opacity-100 transform translate-y-0">
                <MerchantTable merchants={merchants} isLoading={isLoading} />
              </div>
            )}

            {/* 페이지네이션 */}
            {pagination.totalPages > 0 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:scale-105 transition-transform"}
                      />
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:scale-105 transition-transform"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="m-0">
          <div className="space-y-4">
            {isLoading ? (
              <div className="relative min-h-[400px] flex items-center justify-center">
                <LoadingSpinner 
                  size="lg" 
                  text="대기중 가맹점 목록을 불러오는 중입니다..." 
                />
              </div>
            ) : (
              <div className="transition-all duration-500 ease-in-out opacity-100 transform translate-y-0">
                <MerchantTable merchants={merchants} isLoading={isLoading} />
              </div>
            )}

            {/* 페이지네이션 */}
            {pagination.totalPages > 0 && (
              <div className="flex justify-center mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer hover:scale-105 transition-transform"}
                      />
                    </PaginationItem>
                    
                    {renderPaginationItems()}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer hover:scale-105 transition-transform"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
