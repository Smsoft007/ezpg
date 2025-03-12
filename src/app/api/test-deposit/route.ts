import { logApiRequest, logApiResponse, logError, logInfo } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

interface DepositNotification {
  merchantId: string;
  amount: number;
  txId: string;
  accountNumber?: string;
  depositor?: string;
  timestamp?: string;
}

interface DepositResponse {
  resultCode: string;
  resultMsg: string;
  depositInfo?: {
    requestId: string;
    merchantId: string;
    amount: number;
    txId: string;
    accountNumber: string;
    depositor: string;
    timestamp: string;
    status: string;
    processedAt: string;
  };
  requestId?: string;
  processingTime?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse<DepositResponse>> {
  // API 요청 시간 기록
  const requestTime = new Date();
  const requestId = `TEST-DEP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  try {
    // 요청 로깅
    logApiRequest(
      `테스트 입금 노티 수신 [${requestId}]`,
      {
        requestId,
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        ip: request.headers.get("x-forwarded-for") || "unknown",
        timestamp: requestTime.toISOString(),
      },
      { category: "test" },
    );

    // 요청 바디 파싱
    const depositData: DepositNotification = await request.json();

    // 입금 정보 유효성 검사
    const { merchantId, amount, txId, accountNumber, depositor, timestamp } = depositData;

    if (!merchantId || !amount || !txId) {
      logError(
        `테스트 입금 노티 처리 실패 [${requestId}]: 필수 정보 누락`,
        {
          requestId,
          receivedData: depositData,
          timestamp: new Date().toISOString(),
        },
        { category: "test" },
      );

      return NextResponse.json(
        {
          resultCode: "1001",
          resultMsg: "필수 정보가 누락되었습니다.",
          requestId,
        },
        { status: 400 },
      );
    }

    // 입금 처리 로직 (실제로는 데이터베이스에 저장)
    const depositInfo = {
      requestId,
      merchantId,
      amount,
      txId,
      accountNumber: accountNumber || "Unknown",
      depositor: depositor || "Unknown",
      timestamp: timestamp || new Date().toISOString(),
      status: "COMPLETED",
      processedAt: new Date().toISOString(),
    };

    // 로그에 입금 처리 완료 기록
    logInfo(
      `테스트 입금 처리 완료 [${requestId}]`,
      {
        requestId,
        depositInfo,
        processingTime: `${new Date().getTime() - requestTime.getTime()}ms`,
        timestamp: new Date().toISOString(),
      },
      { category: "test" },
    );

    // 텔레그램 알림 메시지 형식 (실제 발송은 구현되지 않음)
    const telegramMessage = `
      💰 테스트 입금 알림 💰
      -------------------
      🆔 요청 ID: ${requestId}
      🏢 가맹점: ${merchantId}
      💵 금액: ${amount}원
      🔢 계좌번호: ${depositInfo.accountNumber}
      👤 입금자: ${depositInfo.depositor}
      🕒 시간: ${depositInfo.timestamp}
      ✅ 처리 시간: ${depositInfo.processedAt}
      -------------------
    `;

    logInfo(
      `테스트 텔레그램 알림 메시지 [${requestId}]`,
      {
        requestId,
        message: telegramMessage,
        timestamp: new Date().toISOString(),
      },
      { category: "test" },
    );

    // 응답 시간 측정
    const responseTime = new Date();
    const processingTime = responseTime.getTime() - requestTime.getTime();

    // 성공 응답
    const response = {
      resultCode: "0000",
      resultMsg: "테스트 입금 처리가 완료되었습니다.",
      depositInfo,
      requestId,
      processingTime: `${processingTime}ms`,
    };

    // 응답 로깅
    logApiResponse(
      `테스트 입금 노티 응답 [${requestId}]`,
      {
        id: requestId,
        url: request.url,
        method: request.method,
      },
      {
        statusCode: 200,
      },
      response,
      { category: "test" },
    );

    return NextResponse.json(response);
  } catch (error) {
    // 오류 처리 및 로깅
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;

    logError(
      `테스트 입금 노티 처리 중 오류 발생 [${requestId}]`,
      {
        requestId,
        error: errorMessage,
        stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        timestamp: new Date().toISOString(),
      },
      { category: "test" },
    );

    // 에러 응답
    return NextResponse.json(
      {
        resultCode: "9999",
        resultMsg: "서버 내부 오류가 발생했습니다.",
        requestId,
      },
      { status: 500 },
    );
  }
}
