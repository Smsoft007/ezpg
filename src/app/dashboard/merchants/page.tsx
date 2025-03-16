"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Download, RefreshCw, Filter, Search, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTemplate } from "@/components/layout/PageTemplate";
import { DataTable, TableColumn } from "@/components/ui/DataTable";
import { AsyncWrapper } from "@/components/ui/AsyncWrapper";
import { Merchant, MerchantSearchParams } from "@/types/merchants";
import { MerchantStatusBadge } from "@/components/merchants/MerchantStatusBadge";
import { MerchantSearchForm } from "@/components/merchants/MerchantSearchForm";
import { fetchMerchants } from "@/api/merchants";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * 가맹점 관리 페이지
 * 가맹점 목록 조회 및 검색, 필터링 기능을 제공합니다.
 */
export default function MerchantsPage() {
  const router = useRouter();
  
  // 상태 관리
  const [filters, setFilters] = useState<MerchantSearchParams>({
    name: "",
    businessNumber: "",
    status: "all",
    page: 1,
    pageSize: 10,
    sortColumn: "id",
    sortOrder: "desc"
  });
  
  const [activeTab, setActiveTab] = useState("all");
  const [merchantsData, setMerchantsData] = useState<{
    merchants: Merchant[],
    totalCount: number
  }>({
    merchants: [],
    totalCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  // 가맹점 데이터 로드 함수
  const loadMerchantData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // API 요청 파라미터 구성
      const requestParams: MerchantSearchParams = {
        ...filters,
        status: activeTab === "all" ? undefined : activeTab
      };
      
      // API 호출
      const response = await fetchMerchants(requestParams);
      
      if (response.success && response.data) {
        setMerchantsData(response.data);
      } else {
        setError(response.error || "가맹점 목록을 불러오는 중 오류가 발생했습니다.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "가맹점 목록을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // 페이지 로드 시 가맹점 목록 조회
  useEffect(() => {
    loadMerchantData();
  }, [filters.page, filters.pageSize, activeTab, filters.sortColumn, filters.sortOrder, refreshTrigger]);
  
  // 검색 필터 변경 핸들러
  const handleFilterChange = (newFilters: Partial<MerchantSearchParams>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };
  
  // 검색 버튼 핸들러
  const handleSearch = () => {
    loadMerchantData();
    setIsFilterVisible(false);
  };
  
  // 검색 초기화 핸들러
  const handleResetSearch = () => {
    setFilters({
      name: "",
      businessNumber: "",
      status: "all",
      page: 1,
      pageSize: 10,
      sortColumn: "id",
      sortOrder: "desc"
    });
    setActiveTab("all");
  };
  
  // 새로고침 핸들러
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  
  // 정렬 변경 핸들러
  const handleSortChange = (sortColumn: string, sortDirection: 'asc' | 'desc') => {
    setFilters(prev => ({
      ...prev,
      sortColumn,
      sortOrder: sortDirection
    }));
  };
  
  // 탭 변경 핸들러
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFilters(prev => ({ ...prev, page: 1 }));
  };
  
  // 엑셀 다운로드 핸들러
  const handleExportExcel = () => {
    alert("가맹점 목록을 엑셀로 다운로드합니다.");
  };

  // 필터 토글 핸들러
  const toggleFilter = () => {
    setIsFilterVisible(!isFilterVisible);
  };
  
  // 가맹점 테이블 컬럼 정의
  const columns: TableColumn<Merchant>[] = [
    {
      id: "id",
      header: "번호",
      cell: (merchant) => <span className="text-sm text-muted-foreground">{merchant.id}</span>,
      sortable: true
    },
    {
      id: "name",
      header: "가맹점명",
      cell: (merchant) => (
        <Link 
          href={`/dashboard/merchants/${merchant.id}`}
          className="font-medium text-primary hover:underline transition-colors"
        >
          {merchant.name}
        </Link>
      ),
      sortable: true
    },
    {
      id: "businessNumber",
      header: "사업자번호",
      cell: (merchant) => <span className="text-sm">{merchant.businessNumber}</span>,
      sortable: true
    },
    {
      id: "representativeName",
      header: "대표자명",
      cell: (merchant) => <span className="text-sm">{merchant.representativeName}</span>
    },
    {
      id: "status",
      header: "상태",
      cell: (merchant) => <MerchantStatusBadge status={merchant.status} />,
      sortable: true
    },
    {
      id: "registrationDate",
      header: "등록일",
      cell: (merchant) => (
        <span className="text-sm text-muted-foreground">
          {new Date(merchant.registrationDate).toLocaleDateString()}
        </span>
      ),
      sortable: true
    },
    {
      id: "actions",
      header: "관리",
      cell: (merchant) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs hover:bg-primary/10 hover:text-primary"
            onClick={() => router.push(`/dashboard/merchants/${merchant.id}`)}
          >
            상세
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs hover:bg-primary/10 hover:text-primary"
            onClick={() => router.push(`/dashboard/merchants/${merchant.id}/edit`)}
          >
            수정
          </Button>
        </div>
      )
    }
  ];
  
  // 가맹점 리스트 액션 버튼
  const merchantListActions = (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleFilter}
        className="border-dashed"
      >
        <Filter className="w-4 h-4 mr-2" />
        필터
        {(filters.name || filters.businessNumber) && (
          <Badge variant="secondary" className="ml-2 bg-primary/10">
            {(filters.name ? 1 : 0) + (filters.businessNumber ? 1 : 0)}
          </Badge>
        )}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRefresh} 
        disabled={isLoading}
        className="text-muted-foreground"
      >
        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        새로고침
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExportExcel}
        className="text-muted-foreground"
      >
        <Download className="w-4 h-4 mr-2" />
        내보내기
      </Button>
      <Button asChild className="bg-primary hover:bg-primary/90">
        <Link href="/dashboard/merchants/register">
          <Plus className="w-4 h-4 mr-2" />
          새 가맹점 등록
        </Link>
      </Button>
    </div>
  );
  
  return (
    <PageTemplate 
      title="가맹점 관리" 
      subtitle="등록된 가맹점을 관리하고 새로운 가맹점을 등록할 수 있습니다."
      actions={merchantListActions}
      fullWidth
    >
      <div className="space-y-6">
        {/* 검색 필터 */}
        {isFilterVisible && (
          <Card className="overflow-hidden border-primary/20 shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  검색 필터
                </h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleFilter}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <MerchantSearchForm
                filters={filters}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onReset={handleResetSearch}
              />
            </CardContent>
          </Card>
        )}
        
        {/* 상태별 탭 */}
        <Card className="border-none shadow-none">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="border-b">
              <ScrollArea className="max-w-full pb-2">
                <TabsList className="bg-transparent h-12 p-0">
                  <TabsTrigger 
                    value="all" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none h-12 px-4"
                  >
                    전체
                    <Badge variant="secondary" className="ml-2 bg-muted">
                      {merchantsData?.totalCount || 0}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="active" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none h-12 px-4"
                  >
                    활성
                  </TabsTrigger>
                  <TabsTrigger 
                    value="inactive" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none h-12 px-4"
                  >
                    비활성
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none h-12 px-4"
                  >
                    대기
                  </TabsTrigger>
                  <TabsTrigger 
                    value="suspended" 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none h-12 px-4"
                  >
                    정지
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>
            
            <TabsContent value={activeTab} className="mt-6">
              <AsyncWrapper
                isLoading={isLoading}
                error={error}
                isEmpty={!merchantsData?.merchants || merchantsData.merchants.length === 0}
                emptyMessage="등록된 가맹점이 없습니다."
                retryAction={handleRefresh}
              >
                <DataTable 
                  data={merchantsData?.merchants || []}
                  columns={columns}
                  pageSize={filters.pageSize}
                  currentPage={filters.page}
                  totalItems={merchantsData?.totalCount || 0}
                  onPageChange={handlePageChange}
                  onSortChange={handleSortChange}
                  sortColumn={filters.sortColumn}
                  sortDirection={filters.sortOrder as 'asc' | 'desc'}
                  className="border rounded-md shadow-sm"
                />
              </AsyncWrapper>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </PageTemplate>
  );
}
