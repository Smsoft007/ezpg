/**
 * 트랜잭션 상세 보기 컴포넌트
 * 트랜잭션의 상세 정보와 로그를 표시합니다.
 */
import React, { useState, useEffect } from 'react';
import { Transaction, TransactionLog, TransactionStatus } from '@/types/transaction';
import { TransactionLogList } from './TransactionLogList';
import { 
  formatAmount, 
  formatTransactionDate, 
  getStatusBadgeColor, 
  getTransactionTypeIcon
} from '@/utils/transactionUtils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Icons } from '../ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, 
  RefreshCw, 
  Download, 
  Printer, 
  Share2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Ban,
  Copy,
  FileText,
  MoreHorizontal,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * 트랜잭션 상세 보기 컴포넌트 Props 인터페이스
 * @interface TransactionDetailViewProps
 */
interface TransactionDetailViewProps {
  /** 표시할 트랜잭션 */
  transaction: Transaction;
  /** 트랜잭션 로그 목록 */
  logs?: TransactionLog[];
  /** 관련 트랜잭션 목록 */
  relatedTransactions?: Transaction[];
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 뒤로 가기 URL */
  backUrl?: string;
  /** 트랜잭션 새로고침 이벤트 핸들러 */
  onRefresh?: () => void;
  /** 트랜잭션 내보내기 이벤트 핸들러 */
  onExport?: () => void;
  /** 트랜잭션 인쇄 이벤트 핸들러 */
  onPrint?: () => void;
  /** 트랜잭션 공유 이벤트 핸들러 */
  onShare?: () => void;
  /** 트랜잭션 승인 이벤트 핸들러 */
  onApprove?: () => void;
  /** 트랜잭션 취소 이벤트 핸들러 */
  onCancel?: () => void;
  /** 트랜잭션 환불 이벤트 핸들러 */
  onRefund?: () => void;
  /** 트랜잭션 보류 이벤트 핸들러 */
  onHold?: () => void;
}

/**
 * 트랜잭션 상세 보기 컴포넌트
 * 트랜잭션의 상세 정보와 로그를 표시합니다.
 */
export function TransactionDetailView({ 
  transaction, 
  logs: initialLogs, 
  relatedTransactions: initialRelatedTransactions,
  isLoading = false,
  backUrl = '/admin/transactions',
  onRefresh,
  onExport,
  onPrint,
  onShare,
  onApprove,
  onCancel,
  onRefund,
  onHold
}: TransactionDetailViewProps) {
  const [logs, setLogs] = useState<TransactionLog[]>(initialLogs || []);
  const [relatedTransactions, setRelatedTransactions] = useState<Transaction[]>(initialRelatedTransactions || []);
  const [activeTab, setActiveTab] = useState('details');
  const [isLoadingLogs, setIsLoadingLogs] = useState(!initialLogs);
  const [isLoadingRelatedTransactions, setIsLoadingRelatedTransactions] = useState(!initialRelatedTransactions);

  useEffect(() => {
    if (!initialLogs) {
      fetchTransactionLogs();
    }
  }, [transaction.transactionId]);

  useEffect(() => {
    if (initialLogs) {
      setLogs(initialLogs);
    }
  }, [initialLogs]);

  useEffect(() => {
    if (!initialRelatedTransactions) {
      fetchRelatedTransactions();
    }
  }, [transaction.transactionId]);

  useEffect(() => {
    if (initialRelatedTransactions) {
      setRelatedTransactions(initialRelatedTransactions);
    }
  }, [initialRelatedTransactions]);

  const fetchTransactionLogs = async () => {
    setIsLoadingLogs(true);
    try {
      // API 호출 URL 구성
      const url = new URL(`${window.location.origin}/api/transactions/logs`);
      url.searchParams.append('transactionId', transaction.transactionId);
      
      // API 호출
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`거래 로그를 가져오는데 실패했습니다: ${response.status}`);
      }
      
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Failed to fetch transaction logs:', error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchRelatedTransactions = async () => {
    setIsLoadingRelatedTransactions(true);
    try {
      // API 호출 URL 구성
      const url = new URL(`${window.location.origin}/api/transactions/related`);
      url.searchParams.append('transactionId', transaction.transactionId);
      
      if (transaction.merchantId) {
        url.searchParams.append('merchantId', transaction.merchantId);
      }
      
      if (transaction.customer?.customerId) {
        url.searchParams.append('customerId', transaction.customer.customerId);
      }
      
      // API 호출
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`관련 거래를 가져오는데 실패했습니다: ${response.status}`);
      }
      
      const data = await response.json();
      setRelatedTransactions(data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch related transactions:', error);
    } finally {
      setIsLoadingRelatedTransactions(false);
    }
  };

  // 트랜잭션 상태에 따른 아이콘 및 색상 가져오기
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'canceled':
      case 'cancelled':
        return <Ban className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // 트랜잭션 ID 복사 핸들러
  const handleCopyTransactionId = () => {
    navigator.clipboard.writeText(transaction.transactionId);
    toast({
      title: "거래 ID가 복사되었습니다",
      description: transaction.transactionId,
      duration: 3000,
    });
  };

  // 트랜잭션 상태에 따른 액션 버튼 렌더링
  const renderActionButtons = () => {
    switch (transaction.status) {
      case 'pending':
        return (
          <div className="flex flex-wrap gap-2">
            {onApprove && (
              <Button 
                variant="default" 
                size="sm"
                onClick={onApprove}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                승인
              </Button>
            )}
            {onCancel && (
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-amber-500 text-amber-600 hover:bg-amber-50"
                  >
                    <Ban className="mr-1 h-4 w-4" />
                    취소
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>거래를 취소하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 거래 ID {transaction.transactionId}가 취소됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>아니오</AlertDialogCancel>
                    <AlertDialogAction onClick={onCancel} className="bg-amber-600 hover:bg-amber-700">
                      예, 취소합니다
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {onHold && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onHold}
              >
                <Clock className="mr-1 h-4 w-4" />
                보류
              </Button>
            )}
          </div>
        );
      case 'completed':
        return (
          <div className="flex flex-wrap gap-2">
            {onRefund && (
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <RotateCcw className="mr-1 h-4 w-4" />
                    환불
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>거래를 환불하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 거래 ID {transaction.transactionId}에 대한 환불이 진행됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>아니오</AlertDialogCancel>
                    <AlertDialogAction onClick={onRefund} className="bg-red-600 hover:bg-red-700">
                      예, 환불합니다
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button 
              variant="outline" 
              size="sm"
            >
              <FileText className="mr-1 h-4 w-4" />
              영수증
            </Button>
          </div>
        );
      case 'failed':
        return (
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="default" 
              size="sm"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              재시도
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  // 트랜잭션 정보 테이블 렌더링
  const renderTransactionInfo = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="space-y-4">
          <div className="bg-muted/40 rounded-lg p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">거래 정보</h3>
            <dl className="space-y-2">
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">거래 ID</dt>
                <dd className="text-sm font-mono flex items-center">
                  {transaction.transactionId}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 ml-1"
                    onClick={handleCopyTransactionId}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">거래 유형</dt>
                <dd className="text-sm">
                  {transaction.type === 'deposit' ? '입금' : 
                   transaction.type === 'withdrawal' ? '출금' : 
                   transaction.type === 'transfer' ? '이체' : 
                   transaction.type === 'payment' ? '결제' : 
                   transaction.type === 'refund' ? '환불' :
                   transaction.type === 'adjustment' ? '조정' :
                   transaction.type || '알 수 없음'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">상태</dt>
                <dd className="text-sm">
                  <Badge 
                    variant="outline" 
                    className={`rounded-md ${getStatusBadgeColor(transaction.status)}`}
                  >
                    <span className="flex items-center">
                      {getStatusIcon(transaction.status)}
                      <span className="ml-1">
                        {transaction.status === 'completed' ? '완료' : 
                         transaction.status === 'pending' ? '대기중' : 
                         transaction.status === 'failed' ? '실패' : 
                         transaction.status === 'canceled' || transaction.status === 'cancelled' ? '취소됨' : 
                         transaction.status || '알 수 없음'}
                      </span>
                    </span>
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">금액</dt>
                <dd className="text-sm font-semibold">
                  {formatAmount(transaction.amount, transaction.currency)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">결제 방법</dt>
                <dd className="text-sm">
                  {transaction.paymentMethod === 'card' ? '카드' : 
                   transaction.paymentMethod === 'bank' || transaction.paymentMethod === 'bank_transfer' ? '계좌이체' : 
                   transaction.paymentMethod === 'virtual' || transaction.paymentMethod === 'virtual_account' ? '가상계좌' : 
                   transaction.paymentMethod === 'mobile' ? '모바일결제' : 
                   transaction.paymentMethod || '알 수 없음'}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-muted-foreground">생성일</dt>
                <dd className="text-sm">
                  {formatTransactionDate(transaction.createdAt)}
                </dd>
              </div>
              {transaction.updatedAt && (
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">업데이트일</dt>
                  <dd className="text-sm">
                    {formatTransactionDate(transaction.updatedAt)}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {transaction.merchant && (
            <div className="bg-muted/40 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">가맹점 정보</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-muted-foreground">가맹점 ID</dt>
                  <dd className="text-sm font-mono">{transaction.merchantId}</dd>
                </div>
                {transaction.merchant.merchantName && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">가맹점명</dt>
                    <dd className="text-sm">{transaction.merchant.merchantName}</dd>
                  </div>
                )}
                {transaction.merchant.businessNumber && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">사업자번호</dt>
                    <dd className="text-sm">{transaction.merchant.businessNumber}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {transaction.customer && (
            <div className="bg-muted/40 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">고객 정보</h3>
              <dl className="space-y-2">
                {transaction.customer.customerId && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">고객 ID</dt>
                    <dd className="text-sm font-mono">{transaction.customer.customerId}</dd>
                  </div>
                )}
                {transaction.customer.name && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">이름</dt>
                    <dd className="text-sm">{transaction.customer.name}</dd>
                  </div>
                )}
                {transaction.customer.email && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">이메일</dt>
                    <dd className="text-sm">{transaction.customer.email}</dd>
                  </div>
                )}
                {transaction.customer.phone && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">전화번호</dt>
                    <dd className="text-sm">{transaction.customer.phone}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {transaction.paymentDetails && (
            <div className="bg-muted/40 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">결제 상세</h3>
              <dl className="space-y-2">
                {transaction.paymentDetails.cardNumber && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">카드번호</dt>
                    <dd className="text-sm">
                      {transaction.paymentDetails.cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-$2-$3-$4')}
                    </dd>
                  </div>
                )}
                {transaction.paymentDetails.cardType && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">카드종류</dt>
                    <dd className="text-sm">{transaction.paymentDetails.cardType}</dd>
                  </div>
                )}
                {transaction.paymentDetails.installmentMonths && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">할부개월</dt>
                    <dd className="text-sm">
                      {transaction.paymentDetails.installmentMonths === 0 
                        ? '일시불' 
                        : `${transaction.paymentDetails.installmentMonths}개월`}
                    </dd>
                  </div>
                )}
                {transaction.paymentDetails.accountNumber && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">계좌번호</dt>
                    <dd className="text-sm">{transaction.paymentDetails.accountNumber}</dd>
                  </div>
                )}
                {transaction.paymentDetails.bankCode && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">은행코드</dt>
                    <dd className="text-sm">{transaction.paymentDetails.bankCode}</dd>
                  </div>
                )}
                {transaction.paymentDetails.virtualAccount && (
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">가상계좌</dt>
                    <dd className="text-sm">{transaction.paymentDetails.virtualAccount}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {transaction.description && (
            <div className="bg-muted/40 rounded-lg p-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">설명</h3>
              <p className="text-sm whitespace-pre-wrap">{transaction.description}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 트랜잭션 로그 렌더링
  const renderTransactionLogs = () => {
    return (
      <div className="mt-4">
        {isLoadingLogs ? (
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : logs.length > 0 ? (
          <TransactionLogList logs={logs} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>로그 기록이 없습니다</p>
          </div>
        )}
      </div>
    );
  };

  // 관련 트랜잭션 렌더링
  const renderRelatedTransactions = () => {
    return (
      <div className="mt-4">
        {isLoadingRelatedTransactions ? (
          <div className="flex flex-col space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : relatedTransactions.length > 0 ? (
          <div className="space-y-4">
            {relatedTransactions.map((relatedTx) => (
              <Link 
                href={`/admin/transactions/${relatedTx.transactionId}`} 
                key={relatedTx.transactionId}
                className="block"
              >
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${getStatusBadgeColor(relatedTx.status)}`}>
                      {getStatusIcon(relatedTx.status)}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{relatedTx.transactionId}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTransactionDate(relatedTx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        {formatAmount(relatedTx.amount, relatedTx.currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {relatedTx.paymentMethod === 'card' ? '카드' : 
                         relatedTx.paymentMethod === 'bank' || relatedTx.paymentMethod === 'bank_transfer' ? '계좌이체' : 
                         relatedTx.paymentMethod === 'virtual' || relatedTx.paymentMethod === 'virtual_account' ? '가상계좌' : 
                         relatedTx.paymentMethod === 'mobile' ? '모바일결제' : 
                         relatedTx.paymentMethod || '알 수 없음'}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>관련 거래가 없습니다</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            asChild
            className="h-9"
          >
            <Link href={backUrl}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              뒤로
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">거래 상세</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefresh}
              className="h-9"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              새로고침
            </Button>
          )}
          
          {onPrint && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onPrint}
              className="h-9"
            >
              <Printer className="h-4 w-4 mr-1" />
              인쇄
            </Button>
          )}
          
          {onExport && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onExport}
              className="h-9"
            >
              <Download className="h-4 w-4 mr-1" />
              내보내기
            </Button>
          )}
          
          {onShare && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onShare}
              className="h-9"
            >
              <Share2 className="h-4 w-4 mr-1" />
              공유
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button 
                variant="outline" 
                size="sm"
                className="h-9"
              >
                <MoreHorizontal className="h-4 w-4 mr-1" />
                더 보기
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>거래 작업</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCopyTransactionId}>
                <Copy className="mr-2 h-4 w-4" />
                <span>거래 ID 복사</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                <span>영수증 보기</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {transaction.status === 'pending' && (
                <>
                  {onApprove && (
                    <DropdownMenuItem onClick={onApprove}>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                      <span>승인</span>
                    </DropdownMenuItem>
                  )}
                  {onCancel && (
                    <DropdownMenuItem onClick={onCancel}>
                      <Ban className="mr-2 h-4 w-4 text-amber-500" />
                      <span>취소</span>
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {transaction.status === 'completed' && onRefund && (
                <DropdownMenuItem onClick={onRefund}>
                  <RotateCcw className="mr-2 h-4 w-4 text-red-500" />
                  <span>환불</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Card className="border border-border/40 shadow-sm">
        <CardHeader className="pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold">거래 상세 정보</CardTitle>
              <CardDescription className="text-muted-foreground mt-1">
                거래 ID: {transaction.transactionId}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant="outline" 
                className={`rounded-md ${getStatusBadgeColor(transaction.status)}`}
              >
                <span className="flex items-center">
                  {getStatusIcon(transaction.status)}
                  <span className="ml-1">
                    {transaction.status === 'completed' ? '완료' : 
                     transaction.status === 'pending' ? '대기중' : 
                     transaction.status === 'failed' ? '실패' : 
                     transaction.status === 'canceled' || transaction.status === 'cancelled' ? '취소됨' : 
                     transaction.status || '알 수 없음'}
                  </span>
                </span>
              </Badge>
              <div className="text-2xl font-bold">
                {formatAmount(transaction.amount, transaction.currency)}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            {renderActionButtons()}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">상세 정보</TabsTrigger>
              <TabsTrigger value="logs">로그 ({logs.length})</TabsTrigger>
              <TabsTrigger value="related">관련 거래 ({relatedTransactions.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                  <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                  </div>
                </div>
              ) : (
                renderTransactionInfo()
              )}
            </TabsContent>
            
            <TabsContent value="logs">
              {renderTransactionLogs()}
            </TabsContent>
            
            <TabsContent value="related">
              {renderRelatedTransactions()}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="border-t border-border/30 flex justify-between pt-4">
          <div className="text-sm text-muted-foreground">
            마지막 업데이트: {formatTransactionDate(transaction.updatedAt || transaction.createdAt)}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
