"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, ArrowDownToLine, CheckCircle2, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UserInfo {
  userId: string;
  userName: string;
  adminYn: string;
  merchantId?: string;
  merchantName?: string;
}

interface BankInfo {
  code: string;
  name: string;
}

export default function WithdrawalRequest() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 출금 신청 폼 상태
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [withdrawalType, setWithdrawalType] = useState("KRW");

  // 은행 목록
  const banks: BankInfo[] = [
    { code: "002", name: "산업은행" },
    { code: "003", name: "기업은행" },
    { code: "004", name: "국민은행" },
    { code: "007", name: "수협은행" },
    { code: "011", name: "농협은행" },
    { code: "020", name: "우리은행" },
    { code: "023", name: "SC제일은행" },
    { code: "027", name: "한국씨티은행" },
    { code: "031", name: "대구은행" },
    { code: "032", name: "부산은행" },
    { code: "034", name: "광주은행" },
    { code: "035", name: "제주은행" },
    { code: "037", name: "전북은행" },
    { code: "039", name: "경남은행" },
    { code: "045", name: "새마을금고" },
    { code: "048", name: "신협" },
    { code: "071", name: "우체국" },
    { code: "081", name: "하나은행" },
    { code: "088", name: "신한은행" },
    { code: "089", name: "케이뱅크" },
    { code: "090", name: "카카오뱅크" },
    { code: "092", name: "토스뱅크" },
  ];

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window !== "undefined") {
      try {
        // 사용자 정보 가져오기
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
          const parsedUserInfo = JSON.parse(storedUserInfo);
          setUserInfo(parsedUserInfo);
          console.log(
            "[INFO] 출금 신청 페이지 사용자 정보 로드 완료",
            parsedUserInfo
          );
        } else {
          // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
          router.push("/login");
        }
      } catch (error) {
        console.error("사용자 정보 로드 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [router]);

  // 출금 신청 처리
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    // 입력값 검증
    if (!amount || !bankCode || !accountNumber || !accountHolder) {
      setErrorMessage("모든 필수 항목을 입력해주세요.");
      return;
    }

    // 금액 검증
    const amountValue = parseInt(amount.replace(/,/g, ""), 10);
    if (isNaN(amountValue) || amountValue <= 0) {
      setErrorMessage("올바른 금액을 입력해주세요.");
      return;
    }

    // 계좌번호 검증
    if (!/^[0-9-]+$/.test(accountNumber)) {
      setErrorMessage("계좌번호는 숫자와 하이픈(-)만 입력 가능합니다.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // 실제 API 호출 대신 더미 응답 생성
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 성공 응답 시뮬레이션
      const dummyResponse = {
        resultCode: "0000",
        resultMsg: "출금 신청이 성공적으로 처리되었습니다.",
        mid: userInfo?.merchantId || "M001",
        withAmt: amountValue,
        bankCd: bankCode,
        withAccntNo: accountNumber,
        withAccntNm: accountHolder,
        natvTrNo: `WD${Date.now()}`,
      };

      console.log("[INFO] 출금 신청 결과:", dummyResponse);

      // 성공 메시지 표시
      setSuccessMessage(
        `출금 신청이 완료되었습니다. 거래번호: ${dummyResponse.natvTrNo}`
      );

      // 폼 초기화
      setAmount("");
      setBankCode("");
      setAccountNumber("");
      setAccountHolder("");
    } catch (error) {
      console.error("출금 신청 중 오류 발생:", error);
      setErrorMessage(
        "출금 신청 처리 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 금액 입력 시 천 단위 콤마 추가
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (value === "") {
      setAmount("");
      return;
    }

    const numberValue = parseInt(value, 10);
    setAmount(numberValue.toLocaleString());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">출금 신청</h1>
        <p className="text-gray-500 mt-1">
          계좌로 출금을 신청할 수 있습니다. 출금 신청 후 관리자 승인 절차가
          필요합니다.
        </p>
      </div>

      {/* 안내 카드 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center text-blue-700">
            <Info className="h-5 w-5 mr-2" />
            출금 신청 안내
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-1 text-blue-700">
            <li>
              출금 신청은 영업일 기준 당일 15시 이전 신청 건에 한해 당일
              처리됩니다.
            </li>
            <li>15시 이후 신청 건은 다음 영업일에 처리됩니다.</li>
            <li>출금 수수료는 건당 1,000원이 부과됩니다.</li>
            <li>최소 출금 금액은 10,000원입니다.</li>
            <li>
              계좌 정보를 정확히 입력해주세요. 잘못된 정보로 인한 오류는
              책임지지 않습니다.
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* 성공 메시지 */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>출금 신청 완료</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* 오류 메시지 */}
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>오류</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* 출금 신청 폼 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowDownToLine className="h-5 w-5 mr-2" />
            출금 신청 정보
          </CardTitle>
          <CardDescription>
            출금 받으실 계좌 정보를 입력해주세요.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleWithdrawalRequest}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">출금 금액</Label>
              <div className="relative">
                <Input
                  id="amount"
                  placeholder="출금 금액을 입력하세요"
                  value={amount}
                  onChange={handleAmountChange}
                  className="pl-12"
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  KRW
                </div>
              </div>
              <p className="text-xs text-gray-500">최소 출금 금액: 10,000원</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankCode">은행</Label>
              <Select value={bankCode} onValueChange={setBankCode} required>
                <SelectTrigger>
                  <SelectValue placeholder="은행을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map((bank) => (
                    <SelectItem key={bank.code} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">계좌번호</Label>
              <Input
                id="accountNumber"
                placeholder="'-' 포함하여 입력하세요"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountHolder">예금주</Label>
              <Input
                id="accountHolder"
                placeholder="예금주명을 입력하세요"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">실명과 일치해야 합니다</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawalType">출금 통화</Label>
              <Select
                value={withdrawalType}
                onValueChange={setWithdrawalType}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="출금 통화를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KRW">KRW (원화)</SelectItem>
                  <SelectItem value="USD" disabled>
                    USD (미국 달러)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/dashboard/withdrawals/history")}
            >
              출금 내역 보기
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  처리 중...
                </>
              ) : (
                "출금 신청"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
