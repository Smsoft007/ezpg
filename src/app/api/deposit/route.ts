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
  const requestId = `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  try {
    // API 인증 정보 확인
    const mkey = request.headers.get("mkey");
    const mid = request.headers.get("mid");
    const API_MKEY = process.env.MKEY;
    const API_MID = process.env.MID;

    // 요청 로깅
    logApiRequest(`입금 노티 수신 [${requestId}]`, {
      requestId,
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      ip: request.headers.get("x-forwarded-for") || "unknown",
      timestamp: requestTime.toISOString(),
    });

    // API 인증 확인 (실제 환경에서는 필수)
    if (mkey !== API_MKEY || mid !== API_MID) {
      logError(`입금 노티 인증 실패 [${requestId}]`, {
        providedMkey: mkey,
        providedMid: mid,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          resultCode: "1002",
          resultMsg: "API 인증 실패",
          requestId,
        },
        { status: 401 },
      );
    }

    // 요청 바디 파싱
    const depositData: DepositNotification = await request.json();

    // 입금 정보 유효성 검사
    const { merchantId, amount, txId, accountNumber, depositor, timestamp } = depositData;

    if (!merchantId || !amount || !txId) {
      logError(`입금 노티 처리 실패 [${requestId}]: 필수 정보 누락`, {
        requestId,
        receivedData: depositData,
        timestamp: new Date().toISOString(),
      });
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
    logInfo(`입금 처리 완료 [${requestId}]`, {
      requestId,
      depositInfo,
      processingTime: `${new Date().getTime() - requestTime.getTime()}ms`,
      timestamp: new Date().toISOString(),
    });

    // 텔레그램 알림 메시지 형식 (실제 발송은 구현되지 않음)
    const telegramMessage = `
      💰 입금 알림 💰
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

    logInfo(`텔레그램 알림 메시지 [${requestId}]`, {
      requestId,
      message: telegramMessage,
      timestamp: new Date().toISOString(),
    });

    // 응답 시간 측정
    const responseTime = new Date();
    const processingTime = responseTime.getTime() - requestTime.getTime();

    // 성공 응답
    const response = {
      resultCode: "0000",
      resultMsg: "입금 처리가 완료되었습니다.",
      depositInfo,
      requestId,
      processingTime: `${processingTime}ms`,
    };

    // 응답 로깅
    logApiResponse(
      `입금 노티 응답 [${requestId}]`,
      {
        id: requestId,
        url: request.url,
        method: request.method,
      },
      {
        statusCode: 200,
      },
      response,
    );

    return NextResponse.json(response);
  } catch (error) {
    // 오류 처리 및 로깅
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;

    logError(`입금 노티 처리 중 오류 발생 [${requestId}]`, {
      requestId,
      error: errorMessage,
      stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      timestamp: new Date().toISOString(),
    });

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

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = `DEP-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  logApiRequest(`입금 노티 잘못된 메소드 요청 [${requestId}]`, {
    requestId,
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    ip: request.headers.get("x-forwarded-for") || "unknown",
    timestamp: new Date().toISOString(),
  });

  return NextResponse.json(
    {
      resultCode: "1003",
      resultMsg: "Method Not Allowed - POST 요청만 허용됩니다.",
      requestId,
    },
    { status: 405 },
  );
}
