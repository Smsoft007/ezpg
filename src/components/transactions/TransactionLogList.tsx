/**
 * 트랜잭션 로그 목록 컴포넌트
 * 특정 트랜잭션의 로그 목록을 표시합니다.
 */
import React from 'react';
import { TransactionLog } from '@/types/transaction';
import { formatTransactionDate } from '@/utils/transactionUtils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TransactionLogListProps {
  logs: TransactionLog[];
  maxHeight?: string;
  className?: string;
}

export function TransactionLogList({ logs, maxHeight = '400px', className = '' }: TransactionLogListProps) {
  if (!logs || logs.length === 0) {
    return (
      <Card className={`w-full ${className}`}>
        <CardHeader>
          <CardTitle className="text-lg">트랜잭션 로그</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">로그 정보가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  // 로그를 시간순으로 정렬 (최신순)
  const sortedLogs = [...logs].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg">트랜잭션 로그</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className={`pr-4`} style={{ maxHeight }}>
          <div className="space-y-4">
            {sortedLogs.map((log) => (
              <LogItem key={log.id} log={log} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function LogItem({ log }: { log: TransactionLog }) {
  // 상태에 따른 배지 색상 설정
  const getBadgeColor = (status: string) => {
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

  // 액션에 따른 배지 색상 설정
  const getActionBadgeColor = (action: string) => {
    if (action.includes('CREATED')) return 'bg-blue-100 text-blue-800';
    if (action.includes('STATUS_CHANGED')) return 'bg-purple-100 text-purple-800';
    if (action.includes('PAYMENT')) return 'bg-indigo-100 text-indigo-800';
    if (action.includes('APPROVED')) return 'bg-green-100 text-green-800';
    if (action.includes('REJECTED')) return 'bg-red-100 text-red-800';
    if (action.includes('COMPLETED')) return 'bg-green-100 text-green-800';
    if (action.includes('FAILED')) return 'bg-red-100 text-red-800';
    if (action.includes('CANCELLED')) return 'bg-gray-100 text-gray-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="border rounded-md p-4 bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Badge className={getActionBadgeColor(log.action)} variant="outline">
            {log.action}
          </Badge>
          <Badge className={getBadgeColor(log.status)} variant="outline">
            {log.status}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatTransactionDate(log.timestamp, 'full')}
        </span>
      </div>
      
      <p className="text-sm mb-2">{log.message}</p>
      
      {log.performedBy && (
        <div className="text-xs text-muted-foreground">
          처리자: {log.performedBy}
        </div>
      )}
      
      {log.details && Object.keys(log.details).length > 0 && (
        <div className="mt-2 pt-2 border-t">
          <details className="text-xs">
            <summary className="font-medium cursor-pointer">상세 정보</summary>
            <pre className="mt-2 p-2 bg-muted rounded-md overflow-x-auto">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
