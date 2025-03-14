import React, { useState } from 'react';
import { Transaction } from '@/docs/interface/transaction';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Filter, ArrowUpDown, Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onViewDetails?: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  isLoading = false,
  onViewDetails,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Transaction>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // 거래 상태에 따른 배지 색상 설정
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return { variant: 'outline', className: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
      case 'pending':
        return { variant: 'outline', className: 'text-yellow-600 bg-yellow-50 border-yellow-200' };
      case 'failed':
        return { variant: 'outline', className: 'text-red-600 bg-red-50 border-red-200' };
      case 'canceled':
        return { variant: 'outline', className: 'text-gray-600 bg-gray-50 border-gray-200' };
      default:
        return { variant: 'outline', className: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
  };

  // 거래 유형에 따른 배지 색상 설정
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'deposit':
        return { variant: 'outline', className: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'withdrawal':
        return { variant: 'outline', className: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'transfer':
        return { variant: 'outline', className: 'text-indigo-600 bg-indigo-50 border-indigo-200' };
      case 'refund':
        return { variant: 'outline', className: 'text-orange-600 bg-orange-50 border-orange-200' };
      case 'adjustment':
        return { variant: 'outline', className: 'text-teal-600 bg-teal-50 border-teal-200' };
      default:
        return { variant: 'outline', className: 'text-gray-600 bg-gray-50 border-gray-200' };
    }
  };

  // 금액 형식화 함수
  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency || 'KRW',
    }).format(amount);
  };

  // 날짜 형식화 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
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

  // 필터링된 거래 목록
  const filteredTransactions = transactions
    .filter((transaction) => {
      // 검색어 필터링
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          transaction.transactionId.toLowerCase().includes(searchLower) ||
          transaction.merchantId.toLowerCase().includes(searchLower) ||
          (transaction.description && transaction.description.toLowerCase().includes(searchLower))
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

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>거래 내역</CardTitle>
            <CardDescription>모든 거래 내역을 확인하고 관리합니다.</CardDescription>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            내보내기
          </Button>
        </div>

        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="거래 ID, 가맹점 ID 또는 설명 검색..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 상태</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="completed">완료됨</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
                <SelectItem value="canceled">취소됨</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="유형 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">모든 유형</SelectItem>
                <SelectItem value="deposit">입금</SelectItem>
                <SelectItem value="withdrawal">출금</SelectItem>
                <SelectItem value="transfer">이체</SelectItem>
                <SelectItem value="refund">환불</SelectItem>
                <SelectItem value="adjustment">조정</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>로딩 중...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p>거래 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px] cursor-pointer" onClick={() => handleSort('transactionId')}>
                    <div className="flex items-center">
                      거래 ID
                      {sortField === 'transactionId' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('type')}>
                    <div className="flex items-center">
                      유형
                      {sortField === 'type' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center">
                      상태
                      {sortField === 'status' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort('amount')}>
                    <div className="flex items-center justify-end">
                      금액
                      {sortField === 'amount' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('timestamp')}>
                    <div className="flex items-center">
                      시간
                      {sortField === 'timestamp' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.transactionId}>
                    <TableCell className="font-medium">
                      {transaction.transactionId.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge {...getTypeBadgeVariant(transaction.type)}>
                        {transaction.type === 'deposit' && '입금'}
                        {transaction.type === 'withdrawal' && '출금'}
                        {transaction.type === 'transfer' && '이체'}
                        {transaction.type === 'refund' && '환불'}
                        {transaction.type === 'adjustment' && '조정'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge {...getStatusBadgeVariant(transaction.status)}>
                        {transaction.status === 'completed' && '완료'}
                        {transaction.status === 'pending' && '대기중'}
                        {transaction.status === 'failed' && '실패'}
                        {transaction.status === 'canceled' && '취소'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatAmount(transaction.amount, transaction.currency)}
                    </TableCell>
                    <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails && onViewDetails(transaction)}
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
  );
};

export default TransactionList;
