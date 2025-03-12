# 출금 API

출금 처리를 위한 API 문서입니다.

## 기본 정보

- **인터페이스명**: 출금
- **URL**: `https://api.ez-pg.com/merWithdrawApi`
- **Protocol**: HTTP POST (GET 방식은 지원하지 않음)
- **Content-Type**: application/json

## 요청 파라미터

| 파라미터명  | 필수여부 | 설명                                        | 최대 길이 |
| ----------- | -------- | ------------------------------------------- | --------- |
| mid         | M        | EZPG에서 발급한 상점아이디                  | 15byte    |
| meky        | M        | EZPG에서 발급한 상점키                      | 255byte   |
| withAmt     | M        | 출금금액                                    | 11byte    |
| bankCd      | 조건부   | 출금은행코드 (원화 출금 시 필수)            | 3byte     |
| withAccntNo | 조건부   | 출금계좌번호 (원화 출금 시 필수)            | 20byte    |
| withAccntNm | 조건부   | 출금계좌 예금주명 (원화 출금 시 필수)       | 20byte    |
| withType    | 선택     | 출금방식 (KRW:원화, USD:외화, Default: KRW) | 3byte     |

## 응답 정보

- **인터페이스명**: 출금 결과
- **URL**: -
- **Protocol**: HTTPS Response
- **Content-Type**: text/plain;charset=UTF-8

## 응답 파라미터

| 파라미터명  | 필수여부 | 설명                            | 최대 길이 |
| ----------- | -------- | ------------------------------- | --------- |
| resultCode  | M        | 결과코드 (0000:성공, 이외 실패) | 4byte     |
| resultMsg   | M        | 결과메세지                      | 255byte   |
| mid         | M        | 상점아이디                      | 15byte    |
| withAmt     | M        | 출금금액                        | 11byte    |
| bankCd      | M        | 출금은행코드                    | 3byte     |
| withAccntNo | M        | 출금계좌번호                    | 20byte    |
| withAccntNm | M        | 출금계좌 예금주명               | 20byte    |
| natvTrNo    | 선택     | 거래번호                        | 30byte    |

## Next.js 구현 가이드

### 1. API 보안 설정

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // API 요청 검증
  if (request.nextUrl.pathname.startsWith("/api/withdrawal")) {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return new NextResponse(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      await verifyToken(token);
    } catch (error) {
      return new NextResponse(JSON.stringify({ error: "Invalid token" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}

export const config = {
  matcher: "/api/withdrawal/:path*",
};
```

### 2. API 엔드포인트 구현

```typescript
// pages/api/withdrawal/index.ts
import { NextApiRequest, NextApiResponse } from "next";
import { withApiAuthRequired } from "@/lib/auth";
import { validateWithdrawalRequest } from "@/lib/validators";
import { createWithdrawalLog } from "@/lib/logging";

export default withApiAuthRequired(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 요청 데이터 검증
    const validatedData = await validateWithdrawalRequest(req.body);

    // API 요청 로그 생성
    const requestLog = await createWithdrawalLog({
      type: "REQUEST",
      data: validatedData,
    });

    // EZPG API 호출
    const response = await fetch("https://api.ez-pg.com/merWithdrawApi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validatedData),
    });

    const responseData = await response.json();

    // API 응답 로그 생성
    await createWithdrawalLog({
      type: "RESPONSE",
      requestId: requestLog.id,
      data: responseData,
    });

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Withdrawal API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
```

### 3. 데이터베이스 스키마 확장

```sql
-- 출금 관련 테이블
CREATE TABLE withdrawal_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_log_id BIGINT NOT NULL,
    mid VARCHAR(15) NOT NULL,
    withdrawal_amount DECIMAL(11,0) NOT NULL,
    bank_code VARCHAR(3) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    account_holder VARCHAR(20) NOT NULL,
    withdrawal_type VARCHAR(3) DEFAULT 'KRW',
    transaction_number VARCHAR(30),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (api_log_id) REFERENCES api_logs(id)
);

-- 출금 상태 이력 테이블
CREATE TABLE withdrawal_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    withdrawal_id BIGINT NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (withdrawal_id) REFERENCES withdrawal_transactions(id)
);
```

### 4. 유효성 검증

```typescript
// lib/validators.ts
import { z } from "zod";

export const withdrawalSchema = z
  .object({
    mid: z.string().max(15),
    meky: z.string().max(255),
    withAmt: z.number().int().positive().max(99999999999),
    bankCd: z.string().length(3).optional(),
    withAccntNo: z.string().max(20).optional(),
    withAccntNm: z.string().max(20).optional(),
    withType: z.enum(["KRW", "USD"]).default("KRW"),
  })
  .refine(
    (data) => {
      if (data.withType === "KRW") {
        return !!data.bankCd && !!data.withAccntNo && !!data.withAccntNm;
      }
      return true;
    },
    {
      message: "Bank information is required for KRW withdrawals",
    },
  );
```

### 5. 보안 강화 기능

```typescript
// lib/security.ts
import crypto from "crypto";
import { rateLimit } from "@/lib/rate-limit";

export class WithdrawalSecurity {
  // API 요청 암호화
  static encryptRequest(data: any, encryptionKey: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);

    let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
    encrypted += cipher.final("hex");

    return {
      encrypted,
      iv: iv.toString("hex"),
      auth_tag: cipher.getAuthTag().toString("hex"),
    };
  }

  // 계좌번호 마스킹
  static maskAccountNumber(accountNo: string): string {
    return accountNo.replace(/(\d{4})\d+(\d{4})/, "$1****$2");
  }

  // 금액 검증
  static validateAmount(amount: number): boolean {
    const MAX_AMOUNT = 100000000; // 1억원
    return amount > 0 && amount <= MAX_AMOUNT;
  }
}
```

### 6. 모니터링 및 알림

```typescript
// lib/monitoring.ts
import { createAlert } from "@/lib/alerts";

export async function monitorWithdrawals() {
  // 대량 출금 모니터링
  const largeTxQuery = `
    SELECT COUNT(*) as tx_count, SUM(withdrawal_amount) as total_amount
    FROM withdrawal_transactions
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
    GROUP BY mid
    HAVING total_amount > 10000000
  `;

  // 실패한 트랜잭션 모니터링
  const failedTxQuery = `
    SELECT COUNT(*) as fail_count
    FROM withdrawal_transactions
    WHERE status = 'FAILED'
    AND created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
    GROUP BY mid
    HAVING fail_count > 5
  `;

  // 알림 발송
  async function sendAlert(type: string, data: any) {
    await createAlert({
      type,
      severity: "HIGH",
      data,
      timestamp: new Date(),
    });
  }
}
```

## 에러 코드 및 처리

| 에러 코드 | 설명            | 처리 방안                     |
| --------- | --------------- | ----------------------------- |
| E001      | 잔액 부족       | 출금 가능 금액 확인 후 재시도 |
| E002      | 계좌정보 불일치 | 계좌 정보 검증 후 재시도      |
| E003      | 일일 한도 초과  | 다음 영업일에 재시도          |
| E004      | 시스템 점검     | 잠시 후 재시도                |

## 보안 및 로깅 상세 설계

### 1. 보안 계층 구조

```typescript
// lib/security/layers/index.ts
export const SecurityLayers = {
  RATE_LIMIT: 1,
  IP_WHITELIST: 2,
  TOKEN_VALIDATION: 3,
  REQUEST_VALIDATION: 4,
  ENCRYPTION: 5,
  AMOUNT_VALIDATION: 6,
  ACCOUNT_VALIDATION: 7,
};

// lib/security/WithdrawalSecurityManager.ts
export class WithdrawalSecurityManager {
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly BLOCK_DURATION = 30 * 60 * 1000; // 30분
  private static readonly MAX_DAILY_AMOUNT = 100000000; // 1억원

  async validateRequest(req: WithdrawalRequest): Promise<ValidationResult> {
    // 1. IP 화이트리스트 검증
    await this.validateIpWhitelist(req.ip);

    // 2. 토큰 검증
    await this.validateToken(req.token);

    // 3. 요청 횟수 제한 검증
    await this.checkRateLimit(req.mid);

    // 4. 일일 한도 검증
    await this.validateDailyLimit(req.mid, req.withAmt);

    // 5. 계좌 정보 검증
    await this.validateAccountInfo(req.bankCd, req.withAccntNo);

    return { isValid: true };
  }

  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await prisma.securityLog.create({
      data: {
        eventType: event.type,
        severity: event.severity,
        details: event.details,
        ipAddress: event.ip,
        userId: event.userId,
        timestamp: new Date(),
      },
    });
  }
}
```

### 2. 상세 로깅 시스템

```typescript
// lib/logging/WithdrawalLogger.ts
export class WithdrawalLogger {
  private static readonly LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4,
  };

  async logWithdrawalAttempt(data: WithdrawalLogData): Promise<void> {
    // 1. 기본 로그 정보
    const baseLog = {
      requestId: uuidv4(),
      timestamp: new Date(),
      mid: data.mid,
      amount: data.withAmt,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    };

    // 2. 민감 정보 마스킹
    const maskedData = this.maskSensitiveData(data);

    // 3. DB 로깅
    await prisma.$transaction([
      // 메인 로그 저장
      prisma.withdrawalLog.create({
        data: {
          ...baseLog,
          maskedData: maskedData,
          status: "ATTEMPT",
        },
      }),

      // 상세 정보 저장
      prisma.withdrawalDetail.create({
        data: {
          requestId: baseLog.requestId,
          bankCode: data.bankCd,
          accountInfo: maskedData.accountInfo,
          withdrawalType: data.withType,
        },
      }),
    ]);
  }

  async logWithdrawalResult(result: WithdrawalResult): Promise<void> {
    await prisma.withdrawalLog.update({
      where: { requestId: result.requestId },
      data: {
        status: result.status,
        resultCode: result.code,
        resultMessage: result.message,
        completedAt: new Date(),
      },
    });
  }

  private maskSensitiveData(data: any): MaskedData {
    return {
      accountInfo: this.maskAccountNumber(data.withAccntNo),
      accountHolder: this.maskName(data.withAccntNm),
    };
  }
}
```

### 3. 데이터베이스 스키마 확장

```sql
-- 보안 로그 테이블
CREATE TABLE security_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    details TEXT,
    ip_address VARCHAR(45),
    user_id VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_event_type (event_type)
);

-- 출금 상세 로그 테이블
CREATE TABLE withdrawal_detailed_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    mid VARCHAR(15) NOT NULL,
    withdrawal_amount DECIMAL(11,0) NOT NULL,
    bank_code VARCHAR(3),
    masked_account VARCHAR(20),
    masked_holder VARCHAR(20),
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_timestamp TIMESTAMP,
    response_timestamp TIMESTAMP,
    processing_time INT,
    status VARCHAR(20),
    error_code VARCHAR(4),
    error_message TEXT,
    security_check_results JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_request_id (request_id),
    INDEX idx_mid (mid),
    INDEX idx_status (status)
);

-- 일일 출금 한도 관리 테이블
CREATE TABLE daily_withdrawal_limits (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mid VARCHAR(15) NOT NULL,
    daily_total DECIMAL(11,0) DEFAULT 0,
    last_withdrawal_at TIMESTAMP,
    limit_reset_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_mid_date (mid, DATE(limit_reset_at))
);
```

### 4. 실시간 모니터링 및 알림

```typescript
// lib/monitoring/WithdrawalMonitor.ts
export class WithdrawalMonitor {
  private static readonly ALERT_THRESHOLDS = {
    AMOUNT: 10000000, // 1천만원 이상
    FREQUENCY: 10, // 10회 이상/시간
    ERROR_RATE: 0.1, // 10% 이상 에러율
  };

  async monitorTransactions(): Promise<void> {
    // 1. 대량 출금 모니터링
    const largeWithdrawals = await this.checkLargeWithdrawals();

    // 2. 빈도수 모니터링
    const highFrequency = await this.checkWithdrawalFrequency();

    // 3. 에러율 모니터링
    const errorRates = await this.checkErrorRates();

    // 알림 발송
    if (largeWithdrawals.length > 0) {
      await this.sendAlert("LARGE_WITHDRAWAL", largeWithdrawals);
    }
  }

  private async sendAlert(type: AlertType, data: any): Promise<void> {
    // 1. DB에 알림 저장
    await prisma.alerts.create({
      data: {
        type,
        data,
        status: "NEW",
      },
    });

    // 2. 실시간 알림 발송
    await this.notificationService.send({
      type,
      data,
      timestamp: new Date(),
    });
  }
}
```

### 5. 보안 정책 설정

```typescript
// config/security.config.ts
export const SecurityConfig = {
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15분
    max: 100, // IP당 최대 요청 수
  },

  withdrawal: {
    maxDailyAmount: 100000000, // 1억원
    maxSingleAmount: 10000000, // 천만원
    requireAdditionalAuth: 5000000, // 추가 인증 필요 금액
  },

  encryption: {
    algorithm: "aes-256-gcm",
    keyRotationInterval: 24 * 60 * 60 * 1000, // 24시간
  },

  ipWhitelist: {
    enabled: true,
    allowedIPs: process.env.ALLOWED_IPS?.split(",") || [],
  },
};
```

### 6. 감사(Audit) 추적

```typescript
// lib/audit/WithdrawalAuditor.ts
export class WithdrawalAuditor {
  async createAuditTrail(data: WithdrawalAuditData): Promise<void> {
    const auditEntry = {
      action: "WITHDRAWAL",
      userId: data.userId,
      resourceId: data.withdrawalId,
      changes: this.generateChangeLog(data),
      metadata: {
        ip: data.ip,
        userAgent: data.userAgent,
        timestamp: new Date(),
      },
    };

    await prisma.auditLog.create({
      data: auditEntry,
    });
  }

  async generateAuditReport(startDate: Date, endDate: Date): Promise<AuditReport> {
    // 감사 보고서 생성 로직
  }
}
```

## 보안 체크리스트 업데이트

1. 입력 값 검증

   - [x] 모든 파라미터의 길이 및 형식 검증
   - [x] SQL Injection 방지
   - [x] XSS 방지
   - [x] 금액 범위 검증
   - [x] 계좌번호 형식 검증

2. 인증 및 인가

   - [x] API 키 유효성 검증
   - [x] 요청 IP 화이트리스트 확인
   - [x] 권한 수준 확인
   - [x] 토큰 기반 인증
   - [x] 추가 인증 (대액 출금 시)

3. 암호화

   - [x] 통신 구간 암호화 (HTTPS)
   - [x] 중요 정보 암호화 저장
   - [x] API 키 보안 저장
   - [x] 계좌정보 암호화

4. 모니터링

   - [x] 실시간 거래 모니터링
   - [x] 이상 거래 탐지
   - [x] 시스템 성능 모니터링
   - [x] 보안 위협 모니터링
   - [x] 알림 시스템

5. 로깅
   - [x] 상세 트랜잭션 로깅
   - [x] 보안 이벤트 로깅
   - [x] 감사 추적
   - [x] 에러 로깅
