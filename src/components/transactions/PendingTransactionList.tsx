/**
 * 대기 거래 목록 컴포넌트
 * 대기 중인 거래 목록을 표시합니다.
 */
import React from 'react';
import { PendingTransaction } from '@/types/transaction';
import { formatAmount, formatTransactionDate, getStatusBadgeColor, getPriorityBadgeColor, getTransactionTypeIcon } from '@/utils/transactionUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { updatePendingTransaction } from '@/utils/transactionUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Icons } from '../ui/icons';

interface PendingTransactionListProps {
  transactions: PendingTransaction[];
  onStatusChange?: (transactionId: string, newStatus: 'completed' | 'failed' | 'cancelled') => void;
  isLoading?: boolean;
  className?: string;
}

export function PendingTransactionList({ 
  transactions, 
  onStatusChange, 
  isLoading = false,
  className = '' 
}: PendingTransactionListProps) {
  if (isLoading) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg">대기 중인 거래</CardTitle>
          <CardDescription>처리 대기 중인 거래 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <Icons.spinner className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">로딩 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg">대기 중인 거래</CardTitle>
          <CardDescription>처리 대기 중인 거래 목록입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <Icons.inbox className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">대기 중인 거래가 없습니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 우선순위와 대기 시간에 따라 정렬
  const sortedTransactions = [...transactions].sort((a, b) => {
    // 우선순위 정렬 (high > normal > low)
    const priorityOrder = { high: 0, normal: 1, low: 2 };
    const priorityA = a.priority ? priorityOrder[a.priority] : 1;
    const priorityB = b.priority ? priorityOrder[b.priority] : 1;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // 대기 시간 정렬 (오래된 순)
    return new Date(a.pendingSince).getTime() - new Date(b.pendingSince).getTime();
  });

  const handleStatusChange = async (transactionId: string, newStatus: 'completed' | 'failed' | 'cancelled', reason: string) => {
    if (onStatusChange) {
      onStatusChange(transactionId, newStatus);
    } else {
      // 기본 상태 변경 처리
      await updatePendingTransaction(
        transactionId,
        newStatus,
        reason,
        '관리자'
      );
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">대기 중인 거래</CardTitle>
        <CardDescription>처리 대기 중인 거래 목록입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>거래 ID</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>금액</TableHead>
              <TableHead>우선순위</TableHead>
              <TableHead>대기 시작</TableHead>
              <TableHead>대기 이유</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.transactionId}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{transaction.transactionId}</span>
                    <span className="text-xs text-muted-foreground">{transaction.merchantId}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    <div className="flex items-center gap-1">
                      {(() => {
                        const iconName = getTransactionTypeIcon(transaction.type);
                        const IconComponent = Icons[iconName as keyof typeof Icons];
                        return IconComponent ? <IconComponent className="h-3 w-3 mr-1" /> : null;
                      })()}
                      {transaction.type}
                    </div>
                  </Badge>
                </TableCell>
                <TableCell>
                  {formatAmount(transaction.amount, transaction.currency)}
                </TableCell>
                <TableCell>
                  <Badge className={getPriorityBadgeColor(transaction.priority || 'normal')} variant="outline">
                    {transaction.priority || 'normal'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-help">
                          {formatTransactionDate(transaction.pendingSince, 'date')}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{formatTransactionDate(transaction.pendingSince, 'full')}</p>
                        {transaction.estimatedCompletionTime && (
                          <p className="text-xs mt-1">
                            예상 완료: {formatTransactionDate(transaction.estimatedCompletionTime, 'full')}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  <span className="line-clamp-2 text-sm">
                    {transaction.pendingReason || '이유 없음'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 bg-green-100 hover:bg-green-200 text-green-800"
                      onClick={() => handleStatusChange(
                        transaction.transactionId, 
                        'completed', 
                        '관리자에 의해 완료 처리됨'
                      )}
                    >
                      완료
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 bg-red-100 hover:bg-red-200 text-red-800"
                      onClick={() => handleStatusChange(
                        transaction.transactionId, 
                        'failed', 
                        '관리자에 의해 실패 처리됨'
                      )}
                    >
                      실패
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8"
                      onClick={() => handleStatusChange(
                        transaction.transactionId, 
                        'cancelled', 
                        '관리자에 의해 취소 처리됨'
                      )}
                    >
                      취소
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
