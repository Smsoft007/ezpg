"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TransactionFilter } from "@/components/transactions/TransactionFilter";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionPagination } from "@/components/transactions/TransactionPagination";
import { TransactionFilter as TransactionFilterType, TransactionPagination as TransactionPaginationType } 
                  from "@/types/transaction";
import { getFailedTransactions, retryTransaction } from "@/app/api/transactions/client";
import { Download, Filter, ChevronDown, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function FailedTransactionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // 필터 상태
  const [filter, setFilter] = useState<TransactionFilterType>({
    status: 'failed',
    type: undefined,
  });

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
        
        // 실제 API 호출
        const response = await getFailedTransactions(
          filter,
          pagination.currentPage,
          pagination.pageSize
        );
        
        setTransactions(response.transactions);
        setPagination(response.pagination);
      } catch (error) {
        console.error("실패 거래 목록 로딩 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [filter, pagination.currentPage, pagination.pageSize]);

  // 필터 변경 핸들러
  const handleFilterChange = (newFilter: TransactionFilterType) => {
    // 항상 실패 상태 유지
    setFilter({ ...newFilter, status: 'failed' });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setFilter({ status: 'failed', type: undefined });
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

  // 거래 재시도 핸들러
  const handleRetryTransaction = async () => {
    if (selectedTransactions.length === 0) return;
    
    try {
      setIsRetrying(true);
      
      // 선택된 모든 거래 재시도
      for (const id of selectedTransactions) {
        const result = await retryTransaction(id);
        
        if (result.success) {
          toast({
            title: "거래 재시도 성공",
            description: `거래 ID: ${id} - ${result.message}`,
          });
        } else {
          toast({
            title: "거래 재시도 실패",
            description: `거래 ID: ${id} - ${result.message}`,
            variant: "destructive",
          });
        }
      }
      
      // 거래 목록 새로고침
      const response = await getFailedTransactions(
        filter,
        pagination.currentPage,
        pagination.pageSize
      );
      
      setTransactions(response.transactions);
      setPagination(response.pagination);
      
      // 선택 초기화
      setSelectedTransactions([]);
    } catch (error) {
      console.error("거래 재시도 중 오류 발생:", error);
      toast({
        title: "거래 재시도 오류",
        description: "거래 재시도 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
    }
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
      className="p-6 max-w-7xl mx-auto opacity-0 transition-opacity duration-500 ease-in-out"
      style={{ opacity: 1 }}
    >
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">실패 거래 관리</h1>
          <p className="text-muted-foreground">실패한 거래 내역을 조회하고 재시도할 수 있습니다.</p>
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
          
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleRetryTransaction}
            disabled={selectedTransactions.length === 0 || isRetrying}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? '재시도 중...' : '선택 거래 재시도'}
          </Button>
        </div>
      </div>
      
      {/* 필터 영역 */}
      <div 
        className={`mb-6 transition-all duration-300 ease-in-out overflow-hidden ${
          showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <TransactionFilter 
                filter={filter} 
                onFilterChange={handleFilterChange} 
                onResetFilter={handleResetFilters}
                showTypeFilter={true}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* 거래 목록 */}
      <Card className="border-t-4 border-t-red-500 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle>실패 거래 목록</CardTitle>
          <CardDescription>
            {transactions.length > 0 
              ? `총 ${pagination.totalItems}개의 실패한 거래가 있습니다.`
              : "조건에 맞는 실패 거래가 없습니다."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TransactionTable 
            transactions={transactions}
            selectedTransactions={selectedTransactions}
            onSelectTransaction={handleSelectTransaction}
            onSelectAll={handleSelectAll}
            detailUrlPrefix="/dashboard/transactions/failed"
          />

          {/* 페이지네이션 */}
          {transactions.length > 0 && (
            <TransactionPagination 
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
