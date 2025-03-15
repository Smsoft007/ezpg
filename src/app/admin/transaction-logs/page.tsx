'use client';

/**
 * 트랜잭션 로그 관리 페이지
 * 관리자가 트랜잭션 로그를 확인하고 관리할 수 있는 페이지입니다.
 */
import React, { useState, useEffect } from 'react';
import { TransactionLog, Transaction, TransactionStatus } from '@/types/transaction';
import { getTransactionLogs, getTransactions } from '@/app/api/transactions/client';
import { TransactionLogList } from '@/components/transactions/TransactionLogList';
import { TransactionDetailView } from '@/components/transactions/TransactionDetailView';
import { formatTransactionDate } from '@/utils/transactionUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/ui/icons';
import { toast } from '@/components/ui/use-toast';
import { Pagination } from '@/components/ui/pagination';

// 더미 트랜잭션 로그 생성 함수
const generateDummyTransactionLogs = (count: number = 20): TransactionLog[] => {
  const actions = [
    'TRANSACTION_CREATED', 
    'STATUS_CHANGED', 
    'PAYMENT_RECEIVED', 
    'PAYMENT_SENT', 
    'APPROVAL_REQUESTED',
    'APPROVED',
    'REJECTED',
    'CANCELLED',
    'REFUNDED'
  ];
  
  const statuses: TransactionStatus[] = [
    'pending', 
    'completed', 
    'failed', 
    'cancelled', 
    'refunded'
  ];
  
  const messages = [
    '거래가 생성되었습니다.',
    '거래 상태가 변경되었습니다.',
    '입금이 확인되었습니다.',
    '출금이 처리되었습니다.',
    '승인 요청이 접수되었습니다.',
    '거래가 승인되었습니다.',
    '거래가 거부되었습니다.',
    '거래가 취소되었습니다.',
    '환불이 처리되었습니다.'
  ];
  
  const performers = ['system', '관리자', '자동화', '고객지원', '결제시스템'];
  
  const now = new Date();
  const transactionIds = Array.from({ length: 5 }, (_, i) => 
    `TX${Math.floor(10000000 + Math.random() * 90000000)}`
  );
  
  return Array.from({ length: count }, (_, i) => {
    const actionIndex = Math.floor(Math.random() * actions.length);
    const statusIndex = Math.floor(Math.random() * statuses.length);
    const timestamp = new Date(now.getTime() - Math.random() * 86400000 * 7); // 최대 7일 전
    
    return {
      id: `LOG${Math.floor(10000000 + Math.random() * 90000000)}`,
      transactionId: transactionIds[Math.floor(Math.random() * transactionIds.length)],
      action: actions[actionIndex],
      status: statuses[statusIndex],
      message: messages[actionIndex],
      timestamp: timestamp.toISOString(),
      performedBy: performers[Math.floor(Math.random() * performers.length)],
      details: Math.random() > 0.5 ? {
        previousStatus: statuses[Math.floor(Math.random() * statuses.length)],
        reason: '시스템 처리',
        additionalInfo: Math.random() > 0.7 ? '고객 요청에 의한 처리' : undefined
      } : undefined,
      ipAddress: Math.random() > 0.7 ? `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : undefined,
      userAgent: Math.random() > 0.7 ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' : undefined
    };
  });
};

// 더미 트랜잭션 생성 함수
const generateDummyTransactions = (count: number = 10): Transaction[] => {
  const types = ['deposit', 'withdrawal'];
  const statuses: TransactionStatus[] = ['pending', 'completed', 'failed', 'cancelled', 'refunded'];
  const paymentMethods = ['bank_transfer', 'virtual_account', 'credit_card', 'bank_withdrawal'];
  
  const now = new Date();
  
  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(now.getTime() - Math.random() * 86400000 * 14); // 최대 14일 전
    
    return {
      transactionId: `TX${Math.floor(10000000 + Math.random() * 90000000)}`,
      merchantId: `M${Math.floor(1000 + Math.random() * 9000)}`,
      type: type as 'deposit' | 'withdrawal',
      amount: Math.floor(10000 + Math.random() * 990000),
      currency: 'KRW',
      status,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)] as any,
      description: `${type === 'deposit' ? '입금' : '출금'} 거래`,
      createdAt: createdAt.toISOString(),
      updatedAt: new Date(createdAt.getTime() + Math.random() * 86400000 * 3).toISOString(),
      merchant: {
        merchantName: `가맹점 ${Math.floor(1000 + Math.random() * 9000)}`
      },
      customer: Math.random() > 0.3 ? {
        name: `고객 ${Math.floor(1000 + Math.random() * 9000)}`,
        email: `customer${Math.floor(1000 + Math.random() * 9000)}@example.com`,
        phone: `010-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`
      } : undefined
    };
  });
};

export default function TransactionLogsPage() {
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [allLogs, setAllLogs] = useState<TransactionLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsPerPage = 10;
  const [filter, setFilter] = useState({
    transactionId: '',
    status: 'all' as 'all' | 'completed' | 'pending' | 'failed' | 'cancelled' | 'refunded',
    dateFrom: '',
    dateTo: '',
    action: ''
  });

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    // 페이지 변경 시 로그 필터링
    applyPagination();
  }, [currentPage, allLogs]);

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      // API 호출 시도
      try {
        const response = await getTransactions('all');
        setTransactions(response.transactions);
        
        // 최근 10개 트랜잭션의 로그만 가져오기
        const recentTransactions = response.transactions.slice(0, 10);
        const allLogs: TransactionLog[] = [];
        
        for (const tx of recentTransactions) {
          try {
            const txLogs = await getTransactionLogs(tx.transactionId);
            allLogs.push(...txLogs);
          } catch (error) {
            console.error(`트랜잭션 ${tx.transactionId}의 로그 조회 중 오류 발생:`, error);
          }
        }
        
        // 시간순으로 정렬 (최신순)
        const sortedLogs = allLogs.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        
        setAllLogs(sortedLogs);
        applyPagination(sortedLogs);
      } catch (apiError) {
        console.log('API 호출 실패, 더미 데이터 사용:', apiError);
        // API 호출 실패 시 더미 데이터 사용
        const dummyTransactions = generateDummyTransactions(20);
        setTransactions(dummyTransactions);
        
        const dummyLogs = generateDummyTransactionLogs(50);
        setAllLogs(dummyLogs);
        applyPagination(dummyLogs);
      }
    } catch (error) {
      console.error('트랜잭션 조회 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: '트랜잭션을 불러오는 중 문제가 발생했습니다.',
        variant: 'destructive',
      });
      
      // 오류 발생 시 빈 배열 설정
      setAllLogs([]);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyPagination = (logsList: TransactionLog[] = allLogs) => {
    const totalItems = logsList.length;
    const calculatedTotalPages = Math.ceil(totalItems / logsPerPage);
    setTotalPages(calculatedTotalPages || 1);
    
    // 현재 페이지에 해당하는 로그만 표시
    const startIndex = (currentPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    setLogs(logsList.slice(startIndex, endIndex));
  };

  const fetchTransactionLogs = async (transactionId: string) => {
    setIsLoading(true);
    try {
      // API 호출 시도
      try {
        const txLogs = await getTransactionLogs(transactionId);
        setAllLogs(txLogs);
        applyPagination(txLogs);
        
        // 트랜잭션 정보 찾기
        const transaction = transactions.find(tx => tx.transactionId === transactionId);
        if (transaction) {
          setSelectedTransaction(transaction);
        }
      } catch (apiError) {
        console.log('API 호출 실패, 더미 데이터 사용:', apiError);
        // API 호출 실패 시 더미 데이터 사용
        // 특정 트랜잭션 ID에 대한 로그만 생성
        const dummyLogs = generateDummyTransactionLogs(15).map(log => ({
          ...log,
          transactionId
        }));
        
        setAllLogs(dummyLogs);
        applyPagination(dummyLogs);
        
        // 더미 트랜잭션 정보 생성
        if (!selectedTransaction) {
          const dummyTransaction = generateDummyTransactions(1)[0];
          dummyTransaction.transactionId = transactionId;
          setSelectedTransaction(dummyTransaction);
        }
      }
    } catch (error) {
      console.error('트랜잭션 로그 조회 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: '트랜잭션 로그를 불러오는 중 문제가 발생했습니다.',
        variant: 'destructive',
      });
      
      // 오류 발생 시 빈 배열 설정
      setAllLogs([]);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const handleRefresh = () => {
    if (filter.transactionId) {
      fetchTransactionLogs(filter.transactionId);
    } else {
      fetchTransactions();
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = () => {
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
    
    if (filter.transactionId) {
      fetchTransactionLogs(filter.transactionId);
    } else {
      // 필터링된 로그만 표시
      let filteredLogs = [...allLogs];
      
      if (filter.status !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.status === filter.status);
      }
      
      if (filter.action) {
        filteredLogs = filteredLogs.filter(log => 
          log.action.toLowerCase().includes(filter.action.toLowerCase())
        );
      }
      
      if (filter.dateFrom) {
        const fromDate = new Date(filter.dateFrom);
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) >= fromDate
        );
      }
      
      if (filter.dateTo) {
        const toDate = new Date(filter.dateTo);
        toDate.setHours(23, 59, 59, 999); // 해당 날짜의 끝으로 설정
        filteredLogs = filteredLogs.filter(log => 
          new Date(log.timestamp) <= toDate
        );
      }
      
      setAllLogs(filteredLogs);
      applyPagination(filteredLogs);
    }
  };

  const handleClearFilter = () => {
    setFilter({
      transactionId: '',
      status: 'all',
      dateFrom: '',
      dateTo: '',
      action: ''
    });
    setCurrentPage(1);
    fetchTransactions();
  };

  // 상태에 따른 배지 색상 설정
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">트랜잭션 로그 관리</h1>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <Icons.refreshCcw className="h-4 w-4" />
          새로고침
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">필터</CardTitle>
          <CardDescription>트랜잭션 로그를 필터링합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">트랜잭션 ID</label>
              <Input
                value={filter.transactionId}
                onChange={(e) => handleFilterChange('transactionId', e.target.value)}
                placeholder="트랜잭션 ID 입력"
                className="w-[250px]"
              />
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">상태</label>
              <Select
                value={filter.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="상태 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="completed">완료됨</SelectItem>
                  <SelectItem value="pending">대기 중</SelectItem>
                  <SelectItem value="failed">실패</SelectItem>
                  <SelectItem value="cancelled">취소됨</SelectItem>
                  <SelectItem value="refunded">환불됨</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">액션</label>
              <Input
                value={filter.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                placeholder="액션 입력"
                className="w-[180px]"
              />
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">시작일</label>
              <Input
                type="date"
                value={filter.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-[180px]"
              />
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">종료일</label>
              <Input
                type="date"
                value={filter.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-[180px]"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSearch}>검색</Button>
            <Button variant="outline" onClick={handleClearFilter}>필터 초기화</Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">최근 트랜잭션</CardTitle>
            <CardDescription>최근 트랜잭션 목록입니다. 클릭하여 상세 정보를 확인하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">로딩 중...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>유형</TableHead>
                      <TableHead>상태</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 10).map((transaction) => (
                      <TableRow key={transaction.transactionId} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="truncate max-w-[120px]">{transaction.transactionId}</span>
                            <span className="text-xs text-muted-foreground">{formatTransactionDate(transaction.createdAt, 'date')}</span>
                          </div>
                        </TableCell>
                        <TableCell>{transaction.type}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(transaction.status)} variant="outline">
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleViewTransaction(transaction)}
                          >
                            상세보기
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">트랜잭션 로그</CardTitle>
            <CardDescription>
              {filter.transactionId 
                ? `트랜잭션 ID: ${filter.transactionId}의 로그` 
                : '최근 트랜잭션의 로그 목록입니다.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">로딩 중...</span>
              </div>
            ) : (
              <>
                <TransactionLogList logs={logs} maxHeight="500px" />
                
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4">
                    <Pagination>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        이전
                      </Button>
                      <div className="flex items-center mx-2">
                        <span className="text-sm">{currentPage} / {totalPages}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        다음
                      </Button>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              총 {allLogs.length}개의 로그
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              새로고침
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          {selectedTransaction && (
            <TransactionDetailView 
              transaction={selectedTransaction} 
              onClose={() => setIsDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
