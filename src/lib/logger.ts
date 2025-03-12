/* eslint-disable @typescript-eslint/no-explicit-any */
// 서버 사이드에서만 fs와 path 모듈을 임포트
import type * as FileSystem from "fs";
import type * as PathModule from "path";

// 서버 사이드에서만 사용할 모듈 선언
let fs: typeof FileSystem | null = null;
let path: typeof PathModule | null = null;

// 날짜 포맷 함수
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

// 로그 디렉토리 및 파일 경로 (서버 사이드에서만 사용)
const LOG_DIR = "logs";
let API_LOG_DIR: string;
let TEST_LOG_DIR: string;
let ERROR_LOG_DIR: string;
let OUTBOUND_API_LOG_DIR: string;
let INBOUND_API_LOG_DIR: string;
let LOG_FILE: string;
let API_LOG_FILE: string;
let DEPOSIT_LOG_FILE: string;
let ERROR_LOG_FILE: string;
let OUTBOUND_API_LOG_FILE: string;
let INBOUND_API_LOG_FILE: string;

// 서버 사이드에서만 실행되는 코드
if (typeof window === "undefined") {
  // 동적 임포트를 사용하여 서버 사이드에서만 모듈 로드
  Promise.all([
    import("fs").then((module) => {
      fs = module;
    }),
    import("path").then((module) => {
      path = module;
    }),
  ])
    .then(() => {
      // 모듈 로딩이 완료된 후에만 디렉토리 설정 및 생성
      try {
        if (fs && path) {
          // 경로 설정
          API_LOG_DIR = path.join(LOG_DIR, "api");
          TEST_LOG_DIR = path.join(LOG_DIR, "test");
          ERROR_LOG_DIR = path.join(LOG_DIR, "error");
          OUTBOUND_API_LOG_DIR = path.join(LOG_DIR, "outbound-api");
          INBOUND_API_LOG_DIR = path.join(LOG_DIR, "inbound-api");

          // 기본 로그 디렉토리들 생성
          const directories = [
            LOG_DIR,
            API_LOG_DIR,
            TEST_LOG_DIR,
            ERROR_LOG_DIR,
            OUTBOUND_API_LOG_DIR,
            INBOUND_API_LOG_DIR,
          ];

          for (const dir of directories) {
            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir, { recursive: true });
              console.log(`로그 디렉토리 생성 완료: ${dir}`);
            }
          }

          // 로그 파일 경로 설정
          LOG_FILE = path.join(LOG_DIR, "ezpg.log");
          API_LOG_FILE = path.join(API_LOG_DIR, "api-requests.log");
          DEPOSIT_LOG_FILE = path.join(API_LOG_DIR, "deposit-notifications.log");
          ERROR_LOG_FILE = path.join(ERROR_LOG_DIR, "errors.log");
          OUTBOUND_API_LOG_FILE = path.join(OUTBOUND_API_LOG_DIR, "outbound-api.log");
          INBOUND_API_LOG_FILE = path.join(INBOUND_API_LOG_DIR, "inbound-api.log");
        }
      } catch (error) {
        console.error("로그 디렉토리 생성 중 오류 발생:", error);
      }
    })
    .catch((err) => {
      console.error("로거 모듈 초기화 중 오류:", err);
    });
}

// 현재 날짜로 로그 파일명 생성 (서버 사이드에서만 사용)
const getDateBasedLogFile = (baseFilePath: string): string => {
  if (typeof window !== "undefined" || !path) return "";

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const fileNameWithoutExt = path.basename(baseFilePath, path.extname(baseFilePath));
  const fileExt = path.extname(baseFilePath);
  const dirName = path.dirname(baseFilePath);

  return path.join(dirName, `${fileNameWithoutExt}_${year}${month}${day}${fileExt}`);
};

// 객체를 문자열로 안전하게 변환

const safeStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    return `[객체를 문자열로 변환할 수 없음: ${
      error instanceof Error ? error.message : String(error)
    }]`;
  }
};

// 요청 바디 마스킹 처리 (비밀번호 등 민감 정보)
const maskSensitiveData = (body: any): any => {
  if (!body) return body;

  const maskedBody = { ...body };

  // 비밀번호 마스킹
  if (maskedBody.password) {
    maskedBody.password = "********";
  }

  // 신용카드 정보 마스킹
  if (maskedBody.cardNumber) {
    maskedBody.cardNumber =
      maskedBody.cardNumber.slice(0, 6) + "******" + maskedBody.cardNumber.slice(-4);
  }

  if (maskedBody.cvv) {
    maskedBody.cvv = "***";
  }

  // 개인정보 마스킹
  if (maskedBody.socialSecurityNumber) {
    maskedBody.socialSecurityNumber =
      "***-**-" + (maskedBody.socialSecurityNumber?.slice(-4) || "****");
  }

  return maskedBody;
};

// 로그 함수 - 년월일시 포맷으로 로깅
const logWithTimestamp = (
  level: string,
  message: string,
  data: any = null,
  options: { category?: string } = {},
): Date => {
  const timestamp = new Date();
  const formattedTimestamp = formatDate(timestamp);
  const category = options.category || "general";

  // 트랜잭션 ID 생성 (없는 경우)
  const transactionId =
    data?.transactionId ||
    data?.txId ||
    `TX-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  let logMessage = `[${formattedTimestamp}] [${level.toUpperCase()}] [${category}] [${transactionId}]: ${message}`;

  if (data) {
    // 중요 데이터는 마스킹 처리
    const maskedData = maskSensitiveData(data);
    logMessage += `\n데이터: ${safeStringify(maskedData)}`;
  }

  logMessage += "\n";

  // 서버 사이드에서만 파일에 기록
  if (typeof window === "undefined" && fs && path) {
    try {
      // 기본 로그 파일에 항상 기록
      fs.appendFileSync(getDateBasedLogFile(LOG_FILE), logMessage);

      // 카테고리별 로깅
      if (category === "api" || message.includes("API") || message.includes("api")) {
        fs.appendFileSync(getDateBasedLogFile(API_LOG_FILE), logMessage);
      }

      if (message.includes("입금 노티") || message.includes("deposit")) {
        fs.appendFileSync(getDateBasedLogFile(DEPOSIT_LOG_FILE), logMessage);
      }

      if (level === "error") {
        fs.appendFileSync(getDateBasedLogFile(ERROR_LOG_FILE), logMessage);
      }

      if (category === "outbound-api") {
        fs.appendFileSync(getDateBasedLogFile(OUTBOUND_API_LOG_FILE), logMessage);
      }

      if (category === "inbound-api") {
        fs.appendFileSync(getDateBasedLogFile(INBOUND_API_LOG_FILE), logMessage);
      }
    } catch (error) {
      console.error("로그 파일 기록 중 오류 발생:", error);
    }
  }

  // 콘솔에도 출력
  console.log(logMessage);

  return timestamp;
};

// 기본 로그 함수들
export const logInfo = (message: string, data?: any, options?: { category?: string }): Date =>
  logWithTimestamp("info", message, data, options);

export const logWarn = (message: string, data?: any, options?: { category?: string }): Date =>
  logWithTimestamp("warn", message, data, options);

export const logError = (message: string, data?: any, options?: { category?: string }): Date =>
  logWithTimestamp("error", message, data, options);

export const logDebug = (message: string, data?: any, options?: { category?: string }): Date =>
  logWithTimestamp("debug", message, data, options);

// 특화된 로그 함수들
export const logApiRequest = (message: string, req: any, options?: any): Date => {
  const requestTime = new Date();
  const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  // 요청 정보
  const requestInfo = {
    id: requestId,
    timestamp: formatDate(requestTime),
    method: req.method,
    url: req.url,
    path: req.url?.split("?")[0],
    query: req.query,
    params: req.params,
    headers: req.headers,
    body: maskSensitiveData(req.body),
    ip: req.socket?.remoteAddress || "unknown",
    userAgent: req.headers?.["user-agent"],
    ...options,
  };

  return logInfo(message, requestInfo, { category: "inbound-api" });
};

export const logApiResponse = (
  message: string,
  req: any,
  res: any,
  responseData: any,
  options?: any,
): Date => {
  const responseTime = new Date();
  const requestId = req.id || `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  // 응답 정보
  const responseInfo = {
    id: requestId,
    timestamp: formatDate(responseTime),
    method: req.method,
    url: req.url,
    path: req.url?.split("?")[0],
    statusCode: res.statusCode,
    responseTime: `${
      responseTime.getTime() - (req.startTime?.getTime() || responseTime.getTime())
    }ms`,
    responseData: maskSensitiveData(responseData),
    ...options,
  };

  return logInfo(message, responseInfo, { category: "inbound-api" });
};

export const logOutboundApiRequest = (
  message: string,
  url: string,
  method: string,
  data: any,
  headers: any,
  options?: any,
): Date => {
  const requestTime = new Date();
  const requestId = `OUT-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  // 외부 API 요청 정보
  const requestInfo = {
    id: requestId,
    timestamp: formatDate(requestTime),
    method,
    url,
    headers: maskSensitiveData(headers),
    data: maskSensitiveData(data),
    ...options,
  };

  return logInfo(message, requestInfo, { category: "outbound-api" });
};

export const logOutboundApiResponse = (
  message: string,
  requestId: string,
  response: any,
  error: any = null,
  options?: any,
): Date => {
  const responseTime = new Date();

  // 외부 API 응답 정보
  const responseInfo = {
    id: requestId,
    timestamp: formatDate(responseTime),
    statusCode: response?.status,
    responseData: maskSensitiveData(response?.data),
    error: error
      ? {
          message: error.message,
          code: error.code,
          stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        }
      : null,
    ...options,
  };

  if (error) {
    return logError(message, responseInfo, { category: "outbound-api" });
  }

  return logInfo(message, responseInfo, { category: "outbound-api" });
};

// API 요청 로깅 미들웨어 (Next.js API 라우트에서 사용)
export const apiLogger = (req: any, res: any, next?: () => void): void => {
  req.id = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  req.startTime = new Date();

  logApiRequest(`API 요청 [${req.id}]: ${req.method} ${req.url}`, req);

  // 응답 객체에 메소드 추가해서 응답 로깅
  const originalJson = res.json;
  res.json = function (data: any) {
    logApiResponse(`API 응답 [${req.id}]: ${req.method} ${req.url}`, req, res, data);
    return originalJson.call(this, data);
  };

  // Next.js API 라우트에서는 next() 함수가 없음
  if (next) {
    next();
  }
};

export default {
  logInfo,
  logWarn,
  logError,
  logDebug,
  logApiRequest,
  logApiResponse,
  logOutboundApiRequest,
  logOutboundApiResponse,
  apiLogger,
};
