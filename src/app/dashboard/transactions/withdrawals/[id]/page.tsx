"use client";

import { Button } from "../../../../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../../../components/ui/card";
import { Separator } from "../../../../../components/ui/separator";
import { Skeleton } from "../../../../../components/ui/skeleton";
import { TransactionStatusBadge } from "../../../../../components/transactions/TransactionStatusBadge";
import { PaymentMethodBadge } from "../../../../../components/transactions/PaymentMethodBadge";
import { getWithdrawalTransactionById, cancelTransaction, retryTransaction } from "../../../../../app/api/transactions/client";
import { PaymentMethod, WithdrawalTransaction } from "@/types/transaction";
import { ArrowLeft, Download, Printer, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "../../../../../components/ui/use-toast";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "../../../../../components/ui/alert-dialog";

// 은행 코드를 은행 이름으로 변환하는 함수
const getBankName = (bankCode: string): string => {
  const bankMap: Record<string, string> = {
    '002': '산업은행',
    '003': '기업은행',
    '004': 'KB국민은행',
    '007': '수협은행',
    '011': 'NH농협은행',
    '020': '우리은행',
    '023': 'SC제일은행',
    '027': '씨티은행',
    '031': '대구은행',
    '032': '부산은행',
    '034': '광주은행',
    '035': '제주은행',
    '037': '전북은행',
    '039': '경남은행',
    '045': '새마을금고',
    '048': '신협',
    '071': '우체국',
    '081': '하나은행',
    '088': '신한은행',
    '089': '케이뱅크',
    '090': '카카오뱅크',
    '092': '토스뱅크',
  };
  
  return bankMap[bankCode] || `미확인 은행(${bankCode})`;
};

export default function WithdrawalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<WithdrawalTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const transactionId = params.id as string;
  
  // 거래 데이터 로드
  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        setIsLoading(true);
        const data = await getWithdrawalTransactionById(transactionId);
        setTransaction(data as WithdrawalTransaction);
      } catch (error) {
        console.error("출금 거래 데이터 로딩 중 오류 발생:", error);
        toast({
          title: "데이터 로딩 오류",
          description: "거래 정보를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (transactionId) {
      fetchTransaction();
    }
  }, [transactionId]);

  // 금액 포맷팅 함수
  const formatAmount = (amount: number, currency: string = 'KRW') => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // 거래 취소 핸들러
  const handleCancelTransaction = async () => {
    if (!transaction) return;
    
    try {
      setIsProcessing(true);
      const result = await cancelTransaction(transaction.transactionId);
      
      if (result.success) {
        toast({
          title: "거래 취소 성공",
          description: result.message,
        });
        
        // 거래 정보 새로고침
        const updatedTransaction = await getWithdrawalTransactionById(transactionId);
        setTransaction(updatedTransaction as WithdrawalTransaction);
      } else {
        toast({
          title: "거래 취소 실패",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("거래 취소 중 오류 발생:", error);
      toast({
        title: "거래 취소 오류",
        description: "거래 취소 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 거래 재시도 핸들러
  const handleRetryTransaction = async () => {
    if (!transaction) return;
    
    try {
      setIsProcessing(true);
      const result = await retryTransaction(transaction.transactionId);
      
      if (result.success) {
        toast({
          title: "거래 재시도 성공",
          description: result.message,
        });
        
        // 거래 정보 새로고침
        const updatedTransaction = await getWithdrawalTransactionById(transactionId);
        setTransaction(updatedTransaction as WithdrawalTransaction);
      } else {
        toast({
          title: "거래 재시도 실패",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("거래 재시도 중 오류 발생:", error);
      toast({
        title: "거래 재시도 오류",
        description: "거래 재시도 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // 영수증 인쇄 핸들러
  const handlePrintReceipt = () => {
    window.print();
  };

  // 영수증 다운로드 핸들러
  const handleDownloadReceipt = () => {
    alert("영수증을 PDF로 다운로드합니다.");
  };

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-6 w-48 ml-2" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        
        <Skeleton className="h-64 mb-6" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  // 거래가 없는 경우
  if (!transaction) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/transactions/withdrawals">
              <ArrowLeft className="h-4 w-4 mr-2" />
              출금 거래 목록으로 돌아가기
            </Link>
          </Button>
        </div>
        
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>거래 정보를 찾을 수 없습니다</CardTitle>
            <CardDescription>
              요청하신 거래 ID ({transactionId})에 해당하는 정보를 찾을 수 없습니다.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="default" asChild>
              <Link href="/dashboard/transactions/withdrawals">
                출금 거래 목록으로 돌아가기
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/transactions/withdrawals">
            <ArrowLeft className="h-4 w-4 mr-2" />
            출금 거래 목록으로 돌아가기
          </Link>
        </Button>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePrintReceipt}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4" />
            인쇄
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleDownloadReceipt}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            PDF 다운로드
          </Button>
          
          {transaction.status === "pending" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  disabled={isProcessing}
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
                    이 출금 거래를 취소하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancelTransaction}>
                    {isProcessing ? "처리 중..." : "확인"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          
          {transaction.status === "failed" && (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleRetryTransaction}
              disabled={isProcessing}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
              거래 재시도
            </Button>
          )}
        </div>
      </div>

      {/* 거래 요약 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">거래 금액</CardTitle>
            <CardDescription>출금 금액</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {formatAmount(transaction.amount, transaction.currency)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">거래 상태</CardTitle>
            <CardDescription>현재 처리 상태</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TransactionStatusBadge status={transaction.status} />
              <span className="ml-2 text-sm text-muted-foreground">
                {transaction.status === "completed" && "출금이 성공적으로 완료되었습니다."}
                {transaction.status === "pending" && "출금 처리가 진행 중입니다."}
                {transaction.status === "failed" && "출금 처리 중 오류가 발생했습니다."}
                {transaction.status === "canceled" && "출금이 취소되었습니다."}
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">거래 일시</CardTitle>
            <CardDescription>거래 생성 및 업데이트 시간</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">생성:</span>
                <span>{formatDate(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">업데이트:</span>
                <span>{formatDate(transaction.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 거래 상세 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>거래 상세 정보</CardTitle>
          <CardDescription>출금 거래에 대한 상세 정보입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">거래 ID</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">{transaction.transactionId}</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">외부 참조 ID</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">
                  {transaction.externalId || "-"}
                </p>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">가맹점 정보</p>
                <div className="text-sm bg-muted p-2 rounded">
                  <p>가맹점 ID: {transaction.merchantId}</p>
                  <p>가맹점명: {transaction.merchant?.merchantName || "-"}</p>
                </div>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium">결제 방법</p>
                <div className="text-sm bg-muted p-2 rounded flex items-center">
                  <PaymentMethodBadge method={transaction.paymentMethod as PaymentMethod} />
                  <span className="ml-2">
                    {transaction.paymentMethod === "bank" && "계좌이체"}
                    {transaction.paymentMethod === "virtual" && "가상계좌"}
                    {transaction.paymentMethod === "card" && "신용카드"}
                    {transaction.paymentMethod === "crypto" && "암호화폐"}
                    {transaction.paymentMethod === "other" && "기타"}
                  </span>
                </div>
              </div>
              
              {transaction.bankCode && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">은행 정보</p>
                  <div className="text-sm bg-muted p-2 rounded">
                    <p>은행 코드: {transaction.bankCode}</p>
                    <p>은행명: {getBankName(transaction.bankCode)}</p>
                  </div>
                </div>
              )}
              
              {transaction.accountNumber && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">계좌 정보</p>
                  <div className="text-sm bg-muted p-2 rounded">
                    <p>계좌번호: {transaction.accountNumber}</p>
                    <p>예금주: {transaction.accountHolder || "-"}</p>
                  </div>
                </div>
              )}
              
              {transaction.customer && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">고객 정보</p>
                  <div className="text-sm bg-muted p-2 rounded">
                    <p>고객명: {transaction.customer.name}</p>
                    {transaction.customer.email && <p>이메일: {transaction.customer.email}</p>}
                    {transaction.customer.phone && <p>전화번호: {transaction.customer.phone}</p>}
                  </div>
                </div>
              )}
              
              {transaction.description && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">거래 설명</p>
                  <p className="text-sm bg-muted p-2 rounded">{transaction.description}</p>
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* 거래 이력 */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">거래 이력</h3>
              <div className="space-y-2">
                {/* 여기에 거래 이력 표시 */}
                <div className="flex items-start gap-2 text-sm">
                  <div className="w-32 text-muted-foreground">{formatDate(transaction.createdAt)}</div>
                  <div className="flex-1">거래가 생성되었습니다.</div>
                </div>
                
                {transaction.status !== "pending" && (
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-32 text-muted-foreground">{formatDate(transaction.updatedAt)}</div>
                    <div className="flex-1">
                      {transaction.status === "completed" && "출금이 성공적으로 완료되었습니다."}
                      {transaction.status === "failed" && "출금 처리 중 오류가 발생했습니다."}
                      {transaction.status === "canceled" && "출금이 취소되었습니다."}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="default" asChild>
            <Link href="/dashboard/transactions/withdrawals">
              출금 거래 목록으로 돌아가기
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* 오류 정보 (실패한 경우에만 표시) */}
      {transaction.status === "failed" && transaction.failureReason && (
        <Card className="border-red-200 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-red-600">오류 정보</CardTitle>
            <CardDescription>거래 처리 중 발생한 오류 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <div className="w-32 text-muted-foreground">실패 사유:</div>
                <div>{transaction.failureReason}</div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-red-50">
            <p className="text-sm text-red-600">
              이 거래는 실패했습니다. 위의 &quot;거래 재시도&quot; 버튼을 클릭하여 다시 시도하거나 오류를 해결한 후 다시 시도하세요.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
