"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransactionFilter } from "@/components/transactions/TransactionFilter";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionPagination } from "@/components/transactions/TransactionPagination";
import { TransactionFilter as TransactionFilterType, TransactionPagination as TransactionPaginationType } from "@/types/transaction";
import { getPendingTransactions, cancelTransaction } from "@/app/api/transactions/client";
import { Download, Filter, ChevronDown, X, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { 
  Dialog as AlertDialog,
  DialogTrigger as AlertDialogTrigger,
  DialogContent as AlertDialogContent,
  DialogHeader as AlertDialogHeader,
  DialogFooter as AlertDialogFooter,
  DialogTitle as AlertDialogTitle,
  DialogDescription as AlertDialogDescription
} from "@/components/ui/dialog";
import { DialogClose } from "@radix-ui/react-dialog";

const AlertDialogAction = Button;
const AlertDialogCancel = (props: React.ComponentProps<typeof Button>) => (
  <Button variant="outline" {...props} />
);

export default function PendingTransactionsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // 필터 상태
  const [filter, setFilter] = useState<TransactionFilterType>({
    status: 'pending',
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
        const response = await getPendingTransactions(
          filter,
          pagination.currentPage,
          pagination.pageSize
        );
        
        setTransactions(response.transactions);
        setPagination(response.pagination);
      } catch (error) {
        console.error("대기 중인 거래 목록 로딩 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [filter, pagination.currentPage, pagination.pageSize]);

  // 필터 변경 핸들러
  const handleFilterChange = (newFilter: TransactionFilterType) => {
    // 항상 대기 중 상태 유지
    setFilter({ ...newFilter, status: 'pending' });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setFilter({ status: 'pending' });
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

  // 거래 취소 핸들러
  const handleCancelTransactions = async () => {
    if (selectedTransactions.length === 0) return;
    
    try {
      setIsCancelling(true);
      
      // 선택된 모든 거래 취소
      for (const id of selectedTransactions) {
        const result = await cancelTransaction(id);
        
        if (result.success) {
          toast({
            title: "거래 취소 성공",
            description: `거래 ID: ${id} - ${result.message}`,
          });
        } else {
          toast({
            title: "거래 취소 실패",
            description: `거래 ID: ${id} - ${result.message}`,
            variant: "destructive",
          });
        }
      }
      
      // 거래 목록 새로고침
      const response = await getPendingTransactions(
        filter,
        pagination.currentPage,
        pagination.pageSize
      );
      
      setTransactions(response.transactions);
      setPagination(response.pagination);
      
      // 선택 초기화
      setSelectedTransactions([]);
    } catch (error) {
      console.error("거래 취소 중 오류 발생:", error);
      toast({
        title: "거래 취소 오류",
        description: "거래 취소 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  // 남은 시간 계산 함수
  const getRemainingTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const expiryTime = new Date(created.getTime() + 24 * 60 * 60 * 1000); // 24시간 후 만료
    
    const diff = expiryTime.getTime() - now.getTime();
    if (diff <= 0) return "만료됨";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}시간 ${minutes}분 남음`;
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
          <h1 className="text-2xl font-bold">대기 중인 거래 관리</h1>
          <p className="text-muted-foreground">대기 중인 거래 내역을 조회하고 관리할 수 있습니다.</p>
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
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm" 
                disabled={selectedTransactions.length === 0 || isCancelling}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                거래 취소
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>거래 취소 확인</AlertDialogTitle>
                <AlertDialogDescription>
                  선택한 {selectedTransactions.length}개의 거래를 취소하시겠습니까? 
                  이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancelTransactions}>
                  {isCancelling ? "처리 중..." : "확인"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* 필터 영역 */}
      {showFilters && (
        <div 
          className="overflow-hidden mb-6"
        >
          <TransactionFilter 
            filter={filter}
            onFilterChange={handleFilterChange}
            onResetFilter={handleResetFilters}
            showTypeFilter={true}
          />
        </div>
      )}

      {/* 거래 목록 */}
      <Card className="border-t-4 border-t-yellow-500 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle>대기 중인 거래 목록</CardTitle>
          <CardDescription>
            {transactions.length > 0 
              ? `총 ${pagination.totalItems}개의 대기 중인 거래가 있습니다.`
              : "조건에 맞는 대기 중인 거래가 없습니다."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center">
            <Clock className="h-5 w-5 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-700">
              대기 중인 거래는 24시간 후 자동으로 만료됩니다. 만료된 거래는 취소 처리됩니다.
            </p>
          </div>

          <TransactionTable 
            transactions={transactions}
            selectedTransactions={selectedTransactions}
            onSelectTransaction={handleSelectTransaction}
            onSelectAll={handleSelectAll}
            detailUrlPrefix="/dashboard/transactions/pending"
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
