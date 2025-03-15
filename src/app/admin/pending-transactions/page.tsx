'use client';

/**
 * 대기 중인 거래 관리 페이지
 * 관리자가 대기 중인 거래를 확인하고 관리할 수 있는 페이지입니다.
 */
import React, { useState, useEffect } from 'react';
import { PendingTransactionList } from '@/components/transactions/PendingTransactionList';
import { getPendingTransactions } from '@/app/api/transactions/client';
import { Transaction, TransactionStatus, PendingTransaction, TransactionType } from '@/types/transaction';
import { updatePendingTransaction } from '@/utils/transactionUtils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/ui/icons';
import { toast } from '@/components/ui/use-toast';

// 더미 대기 거래 생성 함수
const generateDummyPendingTransactions = (count: number = 10): PendingTransaction[] => {
  const types: TransactionType[] = ['deposit', 'withdrawal'];
  const statuses: TransactionStatus[] = ['pending'];
  const priorities: ('high' | 'normal' | 'low')[] = ['high', 'normal', 'low'];
  const pendingReasons = [
    '은행 확인 대기 중',
    '수동 승인 필요',
    '금액 확인 중',
    '고객 정보 확인 필요',
    '시스템 처리 대기 중'
  ];
  
  const now = new Date();
  
  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const pendingSince = new Date(now.getTime() - Math.random() * 86400000 * 3); // 최대 3일 전
    const estimatedCompletionTime = new Date(now.getTime() + Math.random() * 86400000 * 2); // 최대 2일 후
    
    return {
      transactionId: `TX${Math.floor(10000000 + Math.random() * 90000000)}`,
      merchantId: `M${Math.floor(1000 + Math.random() * 9000)}`,
      type,
      amount: Math.floor(10000 + Math.random() * 990000),
      currency: 'KRW',
      status: 'pending',
      paymentMethod: type === 'deposit' ? 'bank_transfer' : 'bank_withdrawal',
      description: `${type === 'deposit' ? '입금' : '출금'} 거래`,
      createdAt: pendingSince.toISOString(),
      updatedAt: pendingSince.toISOString(),
      pendingSince: pendingSince.toISOString(),
      estimatedCompletionTime: estimatedCompletionTime.toISOString(),
      pendingReason: pendingReasons[Math.floor(Math.random() * pendingReasons.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)]
    };
  });
};

export default function PendingTransactionsPage() {
  const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    type: 'all' as 'all' | 'deposit' | 'withdrawal',
    merchantId: '',
    priority: 'all' as 'all' | 'high' | 'normal' | 'low'
  });

  useEffect(() => {
    fetchPendingTransactions();
  }, [filter]);

  const fetchPendingTransactions = async () => {
    setIsLoading(true);
    try {
      // API 호출 시도
      try {
        const response = await getPendingTransactions(
          filter.type !== 'all' ? filter.type as TransactionType : undefined,
          filter.merchantId || undefined
        );
        
        // API 응답에서 PendingTransaction으로 변환
        const pendingTxs = response.transactions.map((tx: Transaction) => {
          return {
            ...tx,
            pendingSince: (tx as any).pendingSince || tx.createdAt,
            estimatedCompletionTime: (tx as any).estimatedCompletionTime,
            pendingReason: (tx as any).pendingReason || '이유 없음',
            priority: (tx as any).priority || 'normal'
          } as PendingTransaction;
        });
        
        // 우선순위 필터링
        let filteredTransactions = pendingTxs;
        if (filter.priority !== 'all') {
          filteredTransactions = filteredTransactions.filter(tx => tx.priority === filter.priority);
        }
        
        setPendingTransactions(filteredTransactions);
      } catch (apiError) {
        console.log('API 호출 실패, 더미 데이터 사용:', apiError);
        // API 호출 실패 시 더미 데이터 사용
        const dummyData = generateDummyPendingTransactions(15);
        
        // 필터 적용
        let filteredDummyData = dummyData;
        if (filter.type !== 'all') {
          filteredDummyData = filteredDummyData.filter(tx => tx.type === filter.type);
        }
        if (filter.merchantId) {
          filteredDummyData = filteredDummyData.filter(tx => 
            tx.merchantId.includes(filter.merchantId)
          );
        }
        if (filter.priority !== 'all') {
          filteredDummyData = filteredDummyData.filter(tx => tx.priority === filter.priority);
        }
        
        setPendingTransactions(filteredDummyData);
      }
    } catch (error) {
      console.error('대기 중인 거래 조회 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: '대기 중인 거래를 불러오는 중 문제가 발생했습니다.',
        variant: 'destructive',
      });
      
      // 오류 발생 시 빈 배열 설정
      setPendingTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (transactionId: string, newStatus: TransactionStatus) => {
    try {
      const reason = `관리자에 의해 ${newStatus} 상태로 변경됨`;
      const success = await updatePendingTransaction(
        transactionId,
        newStatus,
        reason,
        '관리자'
      );
      
      if (success) {
        toast({
          title: '상태 변경 완료',
          description: `거래 ${transactionId}의 상태가 ${newStatus}로 변경되었습니다.`,
        });
        
        // 목록에서 해당 거래 제거
        setPendingTransactions(prev => prev.filter(tx => tx.transactionId !== transactionId));
      } else {
        toast({
          title: '상태 변경 실패',
          description: '거래 상태를 변경하는 중 문제가 발생했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('거래 상태 변경 중 오류 발생:', error);
      toast({
        title: '오류 발생',
        description: '거래 상태를 변경하는 중 문제가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  const handleRefresh = () => {
    fetchPendingTransactions();
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilter(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">대기 중인 거래 관리</h1>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <Icons.refreshCcw className="h-4 w-4" />
          새로고침
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">필터</CardTitle>
          <CardDescription>대기 중인 거래를 필터링합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">거래 유형</label>
              <Select
                value={filter.type}
                onValueChange={(value) => handleFilterChange('type', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="거래 유형 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="deposit">입금</SelectItem>
                  <SelectItem value="withdrawal">출금</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">우선순위</label>
              <Select
                value={filter.priority}
                onValueChange={(value) => handleFilterChange('priority', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="우선순위 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="high">높음</SelectItem>
                  <SelectItem value="normal">보통</SelectItem>
                  <SelectItem value="low">낮음</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label className="text-sm font-medium mb-1 block">가맹점 ID</label>
              <div className="flex gap-2">
                <Input
                  value={filter.merchantId}
                  onChange={(e) => handleFilterChange('merchantId', e.target.value)}
                  placeholder="가맹점 ID 입력"
                  className="w-[180px]"
                />
                {filter.merchantId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleFilterChange('merchantId', '')}
                  >
                    <Icons.xCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="deposit">입금</TabsTrigger>
          <TabsTrigger value="withdrawal">출금</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <PendingTransactionList 
            transactions={pendingTransactions} 
            onStatusChange={handleStatusChange}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="deposit">
          <PendingTransactionList 
            transactions={pendingTransactions.filter(tx => tx.type === 'deposit')} 
            onStatusChange={handleStatusChange}
            isLoading={isLoading}
          />
        </TabsContent>
        
        <TabsContent value="withdrawal">
          <PendingTransactionList 
            transactions={pendingTransactions.filter(tx => tx.type === 'withdrawal')} 
            onStatusChange={handleStatusChange}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
