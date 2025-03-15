import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';
import { Search, ArrowUpDown, Download, Copy, Check, Filter, X } from 'lucide-react';
import { Eye, RefreshCw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

// 타입 정의 가져오기
import { 
  Transaction, 
  TransactionType, 
  TransactionStatus, 
  TransactionFilter as TransactionFilterType,
  CurrencyCode
} from '@/types/transaction';

// 정렬 방향 타입
type SortDirection = 'asc' | 'desc';

// 확장된 상태 및 유형 타입 (필터링용)
type ExtendedTransactionStatus = TransactionStatus | 'all';
type ExtendedTransactionType = TransactionType | 'all';

// 거래 목록 컴포넌트 Props 타입
interface TransactionListProps {
  title?: string;
  description?: string;
  transactions: Transaction[];
  isLoading?: boolean;
  onFilter?: (filter: TransactionFilterType) => void;
  onExport?: () => void;
  onViewTransaction?: (transactionId: string) => void;
  onRefresh?: () => void;
}

// 거래 상태별 배지 색상 매핑
const statusColorMap: Record<TransactionStatus, string> = {
  completed: 'bg-green-100 text-green-800 hover:bg-green-200',
  pending: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  failed: 'bg-red-100 text-red-800 hover:bg-red-200',
  canceled: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  cancelled: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  refunded: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
};

// 거래 유형별 배지 색상 매핑
const typeColorMap: Record<TransactionType, string> = {
  deposit: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  withdrawal: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  transfer: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
  refund: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  adjustment: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
  payment: 'bg-green-100 text-green-800 hover:bg-green-200',
};

// 거래 유형별 한글 표시
const typeDisplayMap: Record<TransactionType, string> = {
  deposit: '입금',
  withdrawal: '출금',
  transfer: '이체',
  refund: '환불',
  adjustment: '조정',
  payment: '결제',
};

// 거래 상태별 한글 표시
const statusDisplayMap: Record<TransactionStatus, string> = {
  completed: '완료됨',
  pending: '대기중',
  failed: '실패',
  canceled: '취소됨',
  cancelled: '취소됨',
  refunded: '환불됨',
};

// 통화 기호 매핑
const currencySymbolMap: Record<CurrencyCode, string> = {
  KRW: '₩',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  CNY: '¥',
};

export const TransactionList: React.FC<TransactionListProps> = ({
  title = '거래 내역',
  description = '모든 거래 내역을 확인하고 관리합니다.',
  transactions,
  isLoading = false,
  onFilter,
  onExport,
  onViewTransaction,
  onRefresh,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ExtendedTransactionStatus>('all');
  const [typeFilter, setTypeFilter] = useState<ExtendedTransactionType>('all');
  const [sortField, setSortField] = useState<keyof Transaction>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // 거래 상태에 따른 배지 색상 설정
  const getStatusBadgeVariant = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return { variant: 'outline', className: statusColorMap[status] };
      case 'pending':
        return { variant: 'outline', className: statusColorMap[status] };
      case 'failed':
        return { variant: 'outline', className: statusColorMap[status] };
      case 'canceled':
      case 'cancelled':
        return { variant: 'outline', className: statusColorMap[status] };
      case 'refunded':
        return { variant: 'outline', className: statusColorMap[status] };
      default:
        return { variant: 'outline', className: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
  };

  // 거래 유형에 따른 배지 색상 설정
  const getTypeBadgeVariant = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return { variant: 'outline', className: typeColorMap[type] };
      case 'withdrawal':
        return { variant: 'outline', className: typeColorMap[type] };
      case 'transfer':
        return { variant: 'outline', className: typeColorMap[type] };
      case 'refund':
        return { variant: 'outline', className: typeColorMap[type] };
      case 'adjustment':
        return { variant: 'outline', className: typeColorMap[type] };
      case 'payment':
        return { variant: 'outline', className: typeColorMap[type] };
      default:
        return { variant: 'outline', className: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
  };

  // 금액 형식화 함수
  const formatAmount = (amount: number, currency: CurrencyCode) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency || 'KRW',
    }).format(amount);
  };

  // 날짜 형식화 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'yyyy.MM.dd HH:mm:ss', { locale: ko });
  };

  // 정렬 함수
  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // 날짜 필터링 함수
  const isWithinDateRange = (dateString: string) => {
    if (!dateRange.from && !dateRange.to) return true;
    
    const date = new Date(dateString);
    
    if (dateRange.from && dateRange.to) {
      return date >= dateRange.from && date <= dateRange.to;
    }
    
    if (dateRange.from) {
      return date >= dateRange.from;
    }
    
    if (dateRange.to) {
      return date <= dateRange.to;
    }
    
    return true;
  };

  // 거래 ID 복사 함수
  const handleCopyTransactionId = (transactionId: string) => {
    navigator.clipboard.writeText(transactionId);
    setCopiedId(transactionId);
    
    // 토스트 알림 표시
    toast({
      title: "거래 ID 복사됨",
      description: "거래 ID가 클립보드에 복사되었습니다.",
      variant: "success",
    });
    
    // 1초 후 복사 아이콘 상태 초기화
    setTimeout(() => {
      setCopiedId(null);
    }, 1000);
  };

  // 필터링된 거래 목록
  const filteredTransactions = transactions
    .filter((transaction) => {
      // 검색어 필터링
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          transaction.transactionId.toLowerCase().includes(searchLower) ||
          transaction.merchantId.toLowerCase().includes(searchLower) ||
          (transaction.description && transaction.description.toLowerCase().includes(searchLower)) ||
          (transaction.customer?.name && transaction.customer.name.toLowerCase().includes(searchLower))
        );
      }
      return true;
    })
    .filter((transaction) => {
      // 상태 필터링
      if (statusFilter !== 'all') {
        return transaction.status === statusFilter;
      }
      return true;
    })
    .filter((transaction) => {
      // 유형 필터링
      if (typeFilter !== 'all') {
        return transaction.type === typeFilter;
      }
      return true;
    })
    .filter((transaction) => {
      // 날짜 필터링
      return isWithinDateRange(transaction.createdAt);
    })
    .sort((a, b) => {
      // 정렬
      const aValue = a[sortField] ?? '';
      const bValue = b[sortField] ?? '';
      
      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // 페이지네이션 처리된 거래 목록
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 총 페이지 수 계산
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // 페이지 변경 시 스크롤을 맨 위로 이동
  useEffect(() => {
    if (document.querySelector('.scroll-area')) {
      document.querySelector('.scroll-area')?.scrollTo(0, 0);
    }
  }, [currentPage]);

  // 필터 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, dateRange, sortField, sortDirection]);

  // 페이지네이션 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // 전체 페이지가 maxPagesToShow 이하인 경우 모든 페이지 표시
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 현재 페이지 주변 페이지 표시
      if (currentPage <= 3) {
        // 1, 2, 3, ..., totalPages
        for (let i = 1; i <= 3; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // 1, ..., totalPages-2, totalPages-1, totalPages
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      }
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) setCurrentPage(currentPage - 1);
              }}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis') {
              return (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            return (
              <PaginationItem key={page}>
                <PaginationLink 
                  href="#" 
                  isActive={currentPage === page}
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage(page as number);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) setCurrentPage(currentPage + 1);
              }}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // 거래 유형 한글화
  const getTransactionTypeText = (type: TransactionType): string => {
    return typeDisplayMap[type];
  };

  // 거래 상태 한글화
  const getTransactionStatusText = (status: TransactionStatus): string => {
    return statusDisplayMap[status];
  };

  // 정렬 방향 아이콘 렌더링
  const renderSortIcon = (field: keyof Transaction) => {
    if (sortField !== field) return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />;
    return (
      <ArrowUpDown 
        className={cn(
          "ml-2 h-4 w-4", 
          sortDirection === 'asc' ? "text-blue-600 rotate-180 transform" : "text-blue-600"
        )} 
      />
    );
  };

  return (
    <Card className="w-full shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-gray-800">{title}</CardTitle>
            <CardDescription className="text-gray-500 mt-1">{description}</CardDescription>
          </div>
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    onClick={onRefresh}
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span className="hidden md:inline">새로고침</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>거래 내역 새로고침</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                    onClick={onExport}
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden md:inline">내보내기</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>거래 내역 내보내기</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="거래 ID, 가맹점 ID, 고객명 또는 설명 검색..."
              className="pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Select 
                      value={statusFilter} 
                      onValueChange={(value: string) => setStatusFilter(value as ExtendedTransactionStatus)}
                    >
                      <SelectTrigger className="w-[140px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ 
                            backgroundColor: statusFilter === 'all' ? '#9CA3AF' : 
                              statusFilter === 'completed' ? '#10B981' : 
                              statusFilter === 'pending' ? '#F59E0B' : 
                              statusFilter === 'failed' ? '#EF4444' : 
                              statusFilter === 'canceled' ? '#6B7280' : 
                              statusFilter === 'refunded' ? '#8B5CF6' : '#9CA3AF'
                          }}></div>
                          <SelectValue placeholder="상태 필터" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 상태</SelectItem>
                        <SelectItem value="pending">대기중</SelectItem>
                        <SelectItem value="completed">완료됨</SelectItem>
                        <SelectItem value="failed">실패</SelectItem>
                        <SelectItem value="canceled">취소됨</SelectItem>
                        <SelectItem value="refunded">환불됨</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>거래 상태로 필터링</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Select 
                      value={typeFilter} 
                      onValueChange={(value: string) => setTypeFilter(value as ExtendedTransactionType)}
                    >
                      <SelectTrigger className="w-[140px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <div className="flex items-center">
                          <div className="w-2 h-2 rounded-full mr-2" style={{ 
                            backgroundColor: typeFilter === 'all' ? '#9CA3AF' : 
                              typeFilter === 'deposit' ? '#3B82F6' : 
                              typeFilter === 'withdrawal' ? '#8B5CF6' : 
                              typeFilter === 'transfer' ? '#6366F1' : 
                              typeFilter === 'refund' ? '#F97316' : 
                              typeFilter === 'adjustment' ? '#14B8A6' : 
                              typeFilter === 'payment' ? '#10B981' : '#9CA3AF'
                          }}></div>
                          <SelectValue placeholder="유형 필터" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">모든 유형</SelectItem>
                        <SelectItem value="deposit">입금</SelectItem>
                        <SelectItem value="withdrawal">출금</SelectItem>
                        <SelectItem value="transfer">이체</SelectItem>
                        <SelectItem value="refund">환불</SelectItem>
                        <SelectItem value="adjustment">조정</SelectItem>
                        <SelectItem value="payment">결제</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>거래 유형으로 필터링</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <DateRangePicker
                      value={dateRange}
                      onChange={setDateRange}
                      className="w-auto border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      align="end"
                      locale="ko"
                      placeholder="날짜 범위 선택"
                      calendarButtonLabel="날짜 선택"
                      clearButtonLabel="초기화"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>날짜 범위로 필터링</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateRange.from || dateRange.to) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="h-10 w-10 border-gray-300 hover:bg-gray-100"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setTypeFilter('all');
                        setDateRange({ from: undefined, to: undefined });
                      }}
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>필터 초기화</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-md">
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-5 w-[80px]" />
              <Skeleton className="h-5 w-[80px]" />
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-5 w-[120px]" />
              <Skeleton className="h-5 w-[80px]" />
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="h-6 w-[70px] rounded-full" />
                <Skeleton className="h-6 w-[70px] rounded-full" />
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-5 w-[150px]" />
                <Skeleton className="h-8 w-[100px]" />
              </div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-64 text-gray-500">
            <Search className="h-12 w-12 mb-4 text-gray-400" />
            <p className="text-lg font-medium">거래 내역이 없습니다.</p>
            <p className="text-sm mt-1">필터 조건을 변경하거나 새로운 거래를 기다려주세요.</p>
            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateRange.from || dateRange.to) && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setDateRange({ from: undefined, to: undefined });
                }}
              >
                필터 초기화
              </Button>
            )}
          </div>
        ) : (
          <ScrollArea className="h-[500px] scroll-area">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="w-[180px] cursor-pointer hover:text-blue-600" onClick={() => handleSort('transactionId')}>
                      <div className="flex items-center">
                        거래 ID
                        {renderSortIcon('transactionId')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-blue-600" onClick={() => handleSort('type')}>
                      <div className="flex items-center">
                        유형
                        {renderSortIcon('type')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-blue-600" onClick={() => handleSort('status')}>
                      <div className="flex items-center">
                        상태
                        {renderSortIcon('status')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right cursor-pointer hover:text-blue-600" onClick={() => handleSort('amount')}>
                      <div className="flex items-center justify-end">
                        금액
                        {renderSortIcon('amount')}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:text-blue-600" onClick={() => handleSort('createdAt')}>
                      <div className="flex items-center">
                        시간
                        {renderSortIcon('createdAt')}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((transaction) => (
                    <TableRow 
                      key={transaction.transactionId}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900">
                        <div className="flex items-center">
                          <span className="font-mono">{transaction.transactionId.substring(0, 10)}...</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-6 w-6 ml-1 text-gray-400 hover:text-gray-600"
                                  onClick={() => handleCopyTransactionId(transaction.transactionId)}
                                >
                                  {copiedId === transaction.transactionId ? (
                                    <Check className="h-3.5 w-3.5 text-green-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>거래 ID 복사</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge {...getTypeBadgeVariant(transaction.type)}>
                          {getTransactionTypeText(transaction.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge {...getStatusBadgeVariant(transaction.status)}>
                          {getTransactionStatusText(transaction.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatAmount(transaction.amount, transaction.currency)}
                      </TableCell>
                      <TableCell className="text-gray-600">{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => onViewTransaction && onViewTransaction(transaction.transactionId)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          상세보기
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        )}
      </CardContent>
      {filteredTransactions.length > 0 && !isLoading && (
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center border-t pt-6">
          <div className="text-sm text-gray-500 mb-4 sm:mb-0">
            총 {filteredTransactions.length}개 중 {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredTransactions.length)}개 표시
          </div>
          <div className="flex items-center gap-4">
            <Select 
              value={itemsPerPage.toString()} 
              onValueChange={(value) => {
                setItemsPerPage(parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                <SelectValue placeholder="페이지 당 항목" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5개씩 보기</SelectItem>
                <SelectItem value="10">10개씩 보기</SelectItem>
                <SelectItem value="20">20개씩 보기</SelectItem>
                <SelectItem value="50">50개씩 보기</SelectItem>
              </SelectContent>
            </Select>
            {renderPagination()}
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default TransactionList;
