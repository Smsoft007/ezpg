"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TransactionFilter } from "@/components/transactions/TransactionFilter";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionPagination } from "@/components/transactions/TransactionPagination";
import { TransactionFilter as TransactionFilterType, TransactionPagination as TransactionPaginationType } from "@/types/transaction";
import { Download, Filter, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function DepositsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  
  // 필터 상태
  const [filter, setFilter] = useState<TransactionFilterType>({});

  // 페이지네이션 상태
  const [pagination, setPagination] = useState<TransactionPaginationType>({
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
    totalItems: 0,
  });

  // 데이터 로드
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        
        // API 호출 URL 구성
        const url = new URL(`${window.location.origin}/api/transactions`);
        url.searchParams.append('type', 'deposit');
        url.searchParams.append('page', pagination.currentPage.toString());
        url.searchParams.append('pageSize', pagination.pageSize.toString());
        
        // 필터 조건이 있으면 추가
        if (filter) {
          Object.entries(filter).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
              url.searchParams.append(key, value.toString());
            }
          });
        }
        
        // API 호출
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`입금 거래 목록을 가져오는데 실패했습니다: ${response.status}`);
        }
        
        const data = await response.json();
        setTransactions(data.transactions);
        setPagination(data.pagination);
      } catch (error) {
        console.error("입금 거래 목록 로딩 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [filter, pagination.currentPage, pagination.pageSize]);

  // 탭 변경 핸들러
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // 탭에 따라 필터 업데이트
    if (value === "all") {
      setFilter((prev) => ({ ...prev, status: undefined }));
    } else {
      setFilter((prev) => ({ ...prev, status: value as any }));
    }
    
    // 페이지 초기화
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // 필터 변경 핸들러
  const handleFilterChange = (newFilter: TransactionFilterType) => {
    setFilter(newFilter);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setFilter({});
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  // 전체 선택 핸들러
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(transactions.map((tx) => tx.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  // 개별 선택 핸들러
  const handleSelectTransaction = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions((prev) => [...prev, id]);
    } else {
      setSelectedTransactions((prev) => prev.filter((txId) => txId !== id));
    }
  };

  // 엑셀 다운로드 핸들러
  const handleExportExcel = () => {
    alert("선택한 거래를 엑셀로 다운로드합니다.");
  };

  // 로딩 상태 UI
  if (isLoading && transactions.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="h-12 w-full bg-gray-200 rounded animate-pulse mb-6"></div>
        
        <div className="border rounded-lg p-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-full bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="p-6 max-w-7xl mx-auto"
    >
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">입금 거래 관리</h1>
          <p className="text-muted-foreground">입금 거래 내역을 조회하고 관리합니다.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter className="h-4 w-4" />
            필터
            {showFilters ? <ChevronDown className="h-4 w-4 rotate-180" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportExcel}
            disabled={selectedTransactions.length === 0}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            엑셀 다운로드
          </Button>
        </div>
      </div>

      {/* 필터 영역 */}
      {showFilters && (
        <div 
          className="mb-6"
        >
          <TransactionFilter 
            filter={filter}
            onFilterChange={handleFilterChange}
            onResetFilter={handleResetFilters}
          />
        </div>
      )}

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mb-6">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="all" className="relative">
            전체
            <Badge className="ml-1 bg-gray-100 text-gray-800 border-gray-300 absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center">
              {transactions.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="relative">
            완료
            <Badge className="ml-1 bg-emerald-100 text-emerald-800 border-emerald-300 absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center">
              {transactions.filter(t => t.status === 'completed').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            대기중
            <Badge className="ml-1 bg-yellow-100 text-yellow-800 border-yellow-300 absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center">
              {transactions.filter(t => t.status === 'pending').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="failed" className="relative">
            실패
            <Badge className="ml-1 bg-red-100 text-red-800 border-red-300 absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center">
              {transactions.filter(t => t.status === 'failed').length}
            </Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <TransactionTable 
            transactions={transactions}
            isLoading={isLoading}
            selectedTransactions={selectedTransactions}
            onSelectAll={handleSelectAll}
            onSelectTransaction={handleSelectTransaction}
            detailUrlPrefix="/dashboard/transactions/deposits"
          />
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          <TransactionTable 
            transactions={transactions.filter(t => t.status === 'completed')}
            isLoading={isLoading}
            selectedTransactions={selectedTransactions}
            onSelectAll={handleSelectAll}
            onSelectTransaction={handleSelectTransaction}
            detailUrlPrefix="/dashboard/transactions/deposits"
          />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <TransactionTable 
            transactions={transactions.filter(t => t.status === 'pending')}
            isLoading={isLoading}
            selectedTransactions={selectedTransactions}
            onSelectAll={handleSelectAll}
            onSelectTransaction={handleSelectTransaction}
            detailUrlPrefix="/dashboard/transactions/deposits"
          />
        </TabsContent>
        
        <TabsContent value="failed" className="mt-6">
          <TransactionTable 
            transactions={transactions.filter(t => t.status === 'failed')}
            isLoading={isLoading}
            selectedTransactions={selectedTransactions}
            onSelectAll={handleSelectAll}
            onSelectTransaction={handleSelectTransaction}
            detailUrlPrefix="/dashboard/transactions/deposits"
          />
        </TabsContent>
      </Tabs>
      
      {/* 페이지네이션 */}
      <div className="mt-6">
        <TransactionPagination 
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
