import { logApiRequest, logApiResponse, logError, logInfo } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import crypto from 'crypto';
import { getSocketIO } from "../socket/route";

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

const ERROR_CODES = {
  SUCCESS: { code: "0000", message: "입금 처리가 완료되었습니다." },
  AUTH_FAILED: { code: "1002", message: "API 인증 실패" },
  METHOD_NOT_ALLOWED: { code: "1003", message: "Method Not Allowed - POST 요청만 허용됩니다." },
  INVALID_PARAMS: { code: "1004", message: "필수 파라미터가 누락되었습니다." },
  INVALID_AMOUNT: { code: "1005", message: "유효하지 않은 금액입니다." },
  DUPLICATE_TX: { code: "1006", message: "중복된 거래입니다." },
  SERVER_ERROR: { code: "9999", message: "서버 내부 오류가 발생했습니다." }
};

function validateApiKey(mkey: string | null, mid: string | null): boolean {
  const API_MKEY = process.env.MKEY;
  const API_MID = process.env.MID;
  
  if (!mkey || !mid || !API_MKEY || !API_MID) return false;
  
  // HMAC을 사용한 보안 강화된 키 검증
  const hmac = crypto.createHmac('sha256', API_MKEY);
  const expectedHash = hmac.update(mid).digest('hex');
  const providedHash = mkey;
  
  return crypto.timingSafeEqual(
    Buffer.from(expectedHash),
    Buffer.from(providedHash)
  );
}

// 트랜잭션 중복 체크를 위한 메모리 캐시 (실제로는 Redis 등 사용 권장)
const processedTxIds = new Set<string>();

export async function POST(request: NextRequest): Promise<NextResponse<DepositResponse>> {
  const requestTime = new Date();
  const requestId = `DEP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  try {
    const mkey = request.headers.get("mkey");
    const mid = request.headers.get("mid");

    logApiRequest(`입금 노티 수신 [${requestId}]`, {
      requestId,
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      ip: request.headers.get("x-forwarded-for") || "unknown",
      timestamp: requestTime.toISOString(),
    });

    if (!validateApiKey(mkey, mid)) {
      logError(`입금 노티 인증 실패 [${requestId}]`, {
        providedMkey: mkey,
        providedMid: mid,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          resultCode: ERROR_CODES.AUTH_FAILED.code,
          resultMsg: ERROR_CODES.AUTH_FAILED.message,
          requestId,
        },
        { status: 401 },
      );
    }

    const depositData: DepositNotification = await request.json();
    const { merchantId, amount, txId, accountNumber, depositor, timestamp } = depositData;

    // 필수 파라미터 검증
    if (!merchantId || !amount || !txId) {
      logError(`입금 노티 처리 실패 [${requestId}]: 필수 정보 누락`, {
        requestId,
        receivedData: depositData,
        timestamp: new Date().toISOString(),
      });

      return NextResponse.json(
        {
          resultCode: ERROR_CODES.INVALID_PARAMS.code,
          resultMsg: ERROR_CODES.INVALID_PARAMS.message,
          requestId,
        },
        { status: 400 },
      );
    }

    // 금액 유효성 검사
    if (amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json(
        {
          resultCode: ERROR_CODES.INVALID_AMOUNT.code,
          resultMsg: ERROR_CODES.INVALID_AMOUNT.message,
          requestId,
        },
        { status: 400 },
      );
    }

    // 중복 트랜잭션 체크
    if (processedTxIds.has(txId)) {
      return NextResponse.json(
        {
          resultCode: ERROR_CODES.DUPLICATE_TX.code,
          resultMsg: ERROR_CODES.DUPLICATE_TX.message,
          requestId,
        },
        { status: 400 },
      );
    }

    // 트랜잭션 ID 저장
    processedTxIds.add(txId);
    // 캐시 크기 제한 (최근 1000개만 유지)
    if (processedTxIds.size > 1000) {
      const firstItem = processedTxIds.values().next().value;
      if (firstItem !== undefined) {
        processedTxIds.delete(firstItem);
      }
    }

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

    logInfo(`입금 처리 완료 [${requestId}]`, {
      requestId,
      depositInfo,
      processingTime: `${new Date().getTime() - requestTime.getTime()}ms`,
      timestamp: new Date().toISOString(),
    });

    // 소켓을 통해 실시간 입금 알림 전송
    try {
      const io = getSocketIO();
      if (io) {
        // 가맹점 정보 조회 (실제 구현에서는 DB에서 가맹점 정보를 조회해야 함)
        // 여기서는 간단히 merchantId를 가맹점명으로 사용
        const merchantName = merchantId; // 실제로는 DB에서 조회한 가맹점명을 사용
        
        const notificationData = {
          merchantId,
          merchantName,
          amount,
          transactionId: txId,
          timestamp: timestamp || new Date().toISOString(),
        };
        
        // 모든 연결된 클라이언트에게 입금 알림 이벤트 발송
        io.emit('deposit', notificationData);
        
        logInfo(`소켓 입금 알림 전송 완료 [${requestId}]`, {
          requestId,
          notificationData,
          timestamp: new Date().toISOString(),
        });
      } else {
        logError(`소켓 서버가 초기화되지 않음 [${requestId}]`, {
          requestId,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (socketError) {
      logError(`소켓 알림 전송 실패 [${requestId}]`, {
        requestId,
        error: socketError,
        timestamp: new Date().toISOString(),
      });
    }

    const telegramMessage = `
      💰 입금 알림 💰
      -------------------
      🆔 요청 ID: ${requestId}
      🏢 가맹점: ${merchantId}
      💵 금액: ${amount.toLocaleString()}원
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

    const responseTime = new Date();
    const processingTime = responseTime.getTime() - requestTime.getTime();

    const response = {
      resultCode: ERROR_CODES.SUCCESS.code,
      resultMsg: ERROR_CODES.SUCCESS.message,
      depositInfo,
      requestId,
      processingTime: `${processingTime}ms`,
    };

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
    const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
    const errorStack = error instanceof Error ? error.stack : undefined;

    logError(`입금 노티 처리 중 오류 발생 [${requestId}]`, {
      requestId,
      error: errorMessage,
      stack: process.env.NODE_ENV === "development" ? errorStack : undefined,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        resultCode: ERROR_CODES.SERVER_ERROR.code,
        resultMsg: ERROR_CODES.SERVER_ERROR.message,
        requestId,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestId = `DEP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

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
      resultCode: ERROR_CODES.METHOD_NOT_ALLOWED.code,
      resultMsg: ERROR_CODES.METHOD_NOT_ALLOWED.message,
      requestId,
    },
    { status: 405 },
  );
}
