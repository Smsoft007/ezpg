"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Transaction, PaymentMethod, TransactionStatus } from "@/types/transaction";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { PaymentMethodBadge } from "./PaymentMethodBadge";
import Link from "next/link";
import { formatAmount, formatDate } from "@/utils/transactionUtils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Eye, 
  Download, 
  Filter, 
  MoreHorizontal, 
  RefreshCw, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  Ban,
  AlertCircle,
  ArrowUpDown,
  Search
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { IndeterminateCheckbox } from "@/components/ui/indeterminate-checkbox";

/**
 * 거래 테이블 컴포넌트 Props 인터페이스
 * @interface TransactionTableProps
 */
interface TransactionTableProps {
  /** 표시할 거래 목록 */
  transactions: Transaction[];
  /** 선택된 거래 ID 목록 */
  selectedTransactions: string[];
  /** 거래 선택 이벤트 핸들러 */
  onSelectTransaction: (id: string, checked: boolean) => void;
  /** 모든 거래 선택 이벤트 핸들러 */
  onSelectAll: (checked: boolean) => void;
  /** 상세 페이지 URL 접두사 */
  detailUrlPrefix: string;
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 필터 토글 이벤트 핸들러 */
  onToggleFilter?: () => void;
  /** 데이터 내보내기 이벤트 핸들러 */
  onExport?: () => void;
  /** 데이터 새로고침 이벤트 핸들러 */
  onRefresh?: () => void;
  /** 선택된 거래 일괄 처리 이벤트 핸들러 */
  onBatchAction?: (action: string) => void;
  /** 정렬 이벤트 핸들러 */
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  /** 검색 이벤트 핸들러 */
  onSearch?: (query: string) => void;
  /** 현재 정렬 필드 */
  sortField?: string;
  /** 현재 정렬 방향 */
  sortDirection?: 'asc' | 'desc';
  /** 총 거래 수 */
  totalCount?: number;
}

/**
 * 거래 테이블 컴포넌트
 * 거래 목록을 표시하고 선택, 필터링, 상세 보기 기능을 제공합니다.
 */
export function TransactionTable({
  transactions,
  selectedTransactions,
  onSelectTransaction,
  onSelectAll,
  detailUrlPrefix,
  isLoading = false,
  onToggleFilter,
  onExport,
  onRefresh,
  onBatchAction,
  onSort,
  onSearch,
  sortField,
  sortDirection,
  totalCount
}: TransactionTableProps) {
  // 모든 거래가 선택되었는지 확인
  const allChecked = transactions.length > 0 && selectedTransactions.length === transactions.length;
  
  // 일부 거래만 선택되었는지 확인
  const indeterminate = selectedTransactions.length > 0 && selectedTransactions.length < transactions.length;

  // 검색어 상태 관리
  const [searchQuery, setSearchQuery] = useState("");

  // 정렬 토글 핸들러
  const handleSortToggle = (field: string) => {
    if (!onSort) return;
    
    const newDirection = 
      field === sortField && sortDirection === 'asc' ? 'desc' : 'asc';
    
    onSort(field, newDirection);
  };

  // 검색 핸들러
  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchQuery);
    }
  };

  // 검색어 입력 핸들러
  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 상태별 거래 수 계산
  const getStatusCount = (status: TransactionStatus) => {
    return transactions.filter(t => t.status === status).length;
  };

  return (
    <Card className="w-full border border-border/40 shadow-sm">
      <CardHeader className="pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold">거래 목록</CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              {totalCount !== undefined ? `총 ${totalCount}개의 거래` : 
               `${transactions.length}개의 거래가 표시됨`}
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="거래 ID, 금액, 가맹점 검색..."
                className="pl-9 h-10 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchInputKeyDown}
              />
            </div>
            <div className="flex gap-2">
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRefresh}
                  className="h-10"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  새로고침
                </Button>
              )}
              {onToggleFilter && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onToggleFilter}
                  className="h-10"
                >
                  <Filter className="h-4 w-4 mr-1" />
                  필터
                </Button>
              )}
              {onExport && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onExport}
                  className="h-10"
                >
                  <Download className="h-4 w-4 mr-1" />
                  내보내기
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="outline" className="rounded-md bg-muted/40 hover:bg-muted">
            전체 ({transactions.length})
          </Badge>
          <Badge variant="outline" className="rounded-md bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
            완료 ({getStatusCount('completed')})
          </Badge>
          <Badge variant="outline" className="rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
            대기중 ({getStatusCount('pending')})
          </Badge>
          <Badge variant="outline" className="rounded-md bg-red-50 text-red-700 hover:bg-red-100 border-red-200">
            실패 ({getStatusCount('failed')})
          </Badge>
          <Badge variant="outline" className="rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200">
            취소 ({getStatusCount('canceled') + getStatusCount('cancelled')})
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 pt-4">
        <div className="flex items-center justify-between p-4 border-y border-border/30">
          <div className="flex items-center space-x-2">
            <IndeterminateCheckbox 
              checked={allChecked}
              indeterminate={indeterminate}
              onCheckedChange={onSelectAll}
              aria-label="모든 거래 선택"
              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <span className="text-sm font-medium">
              {selectedTransactions.length > 0 
                ? `${selectedTransactions.length}개 선택됨` 
                : "거래 선택"}
            </span>
          </div>
          
          {selectedTransactions.length > 0 && onBatchAction && (
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="outline" size="sm">
                    일괄 작업
                    <MoreHorizontal className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>선택된 {selectedTransactions.length}개 항목</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onBatchAction('approve')}>
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                    <span>일괄 승인</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBatchAction('cancel')}>
                    <Ban className="mr-2 h-4 w-4 text-amber-500" />
                    <span>일괄 취소</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onBatchAction('export')}>
                    <FileText className="mr-2 h-4 w-4 text-blue-500" />
                    <span>선택 항목 내보내기</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onBatchAction('delete')}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>일괄 삭제</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        
        <ScrollArea className="h-[calc(100vh-22rem)] rounded-md">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0">
              <TableRow>
                <TableHead className="w-[50px]">
                  <IndeterminateCheckbox 
                    checked={allChecked}
                    indeterminate={indeterminate}
                    onCheckedChange={onSelectAll}
                    aria-label="모든 거래 선택"
                  />
                </TableHead>
                <TableHead className="w-[180px]">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSortToggle('transactionId')}>
                    거래 ID
                    {onSort && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'transactionId' ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center cursor-pointer" onClick={() => handleSortToggle('merchantId')}>
                    가맹점
                    {onSort && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'merchantId' ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[120px]">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSortToggle('amount')}>
                    금액
                    {onSort && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'amount' ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSortToggle('paymentMethod')}>
                    결제 방법
                    {onSort && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'paymentMethod' ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[100px]">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSortToggle('status')}>
                    상태
                    {onSort && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'status' ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[150px]">
                  <div className="flex items-center cursor-pointer" onClick={() => handleSortToggle('createdAt')}>
                    생성일
                    {onSort && (
                      <ArrowUpDown className={`ml-1 h-4 w-4 ${sortField === 'createdAt' ? 'text-primary' : 'text-muted-foreground'}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="w-[100px] text-right">액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                      <p className="mt-2 text-sm text-muted-foreground">로딩 중...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <TableRow 
                    key={transaction.transactionId}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <IndeterminateCheckbox 
                        checked={selectedTransactions.includes(transaction.transactionId)}
                        onCheckedChange={(checked) => 
                          onSelectTransaction(transaction.transactionId, checked as boolean)
                        }
                        aria-label={`${transaction.transactionId} 선택`}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-xs">
                      <Link 
                        href={`${detailUrlPrefix}/${transaction.transactionId}`}
                        className="text-primary hover:text-primary/80 transition-colors hover:underline"
                      >
                        {transaction.transactionId}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-help text-sm">
                            {transaction.merchant?.merchantName || transaction.merchantId}
                          </TooltipTrigger>
                          <TooltipContent className="bg-popover border border-border shadow-md">
                            <div className="space-y-1 p-1">
                              <p className="text-xs font-medium">가맹점 ID: {transaction.merchantId}</p>
                              {transaction.customer?.name && (
                                <p className="text-xs">고객명: {transaction.customer.name}</p>
                              )}
                              {transaction.customer?.email && (
                                <p className="text-xs">이메일: {transaction.customer.email}</p>
                              )}
                              {transaction.description && (
                                <p className="text-xs">설명: {transaction.description}</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>
                      <PaymentMethodBadge method={transaction.paymentMethod as PaymentMethod} />
                    </TableCell>
                    <TableCell>
                      <TransactionStatusBadge status={transaction.status} />
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="cursor-help text-sm">
                            {formatDate(transaction.createdAt, 'short')}
                          </TooltipTrigger>
                          <TooltipContent>
                            {formatDate(transaction.createdAt, 'full')}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          asChild
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        >
                          <Link href={`${detailUrlPrefix}/${transaction.transactionId}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">상세보기</span>
                          </Link>
                        </Button>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">더 보기</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>거래 작업</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Link href={`${detailUrlPrefix}/${transaction.transactionId}`} className="flex items-center w-full">
                                <Eye className="mr-2 h-4 w-4" />
                                <span>상세 보기</span>
                              </Link>
                            </DropdownMenuItem>
                            
                            {transaction.status === 'pending' && (
                              <>
                                <DropdownMenuItem>
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                  <span>승인</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Ban className="mr-2 h-4 w-4 text-amber-500" />
                                  <span>취소</span>
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {transaction.status === 'completed' && (
                              <DropdownMenuItem>
                                <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                                <span>환불</span>
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              <span>영수증 보기</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <p className="text-muted-foreground">거래 내역이 없습니다</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        새로운 거래가 생성되면 여기에 표시됩니다
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center border-t border-border/30 p-4">
        <div className="text-sm text-muted-foreground">
          {totalCount !== undefined ? (
            <span>{totalCount}개 중 {transactions.length}개 표시됨</span>
          ) : (
            <span>{transactions.length}개 항목</span>
          )}
        </div>
        
        {/* 여기에 페이지네이션 컴포넌트를 추가할 수 있습니다 */}
      </CardFooter>
    </Card>
  );
}
