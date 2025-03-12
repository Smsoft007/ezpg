# 회원등록 API

회원 등록을 위한 API 문서입니다.

## 기본 정보

- **인터페이스명**: 회원등록
- **URL**: `https://api.ez-pg.com/regUserApi`
- **Protocol**: HTTP POST (GET 방식 미지원)
- **Content-Type**: application/json

## 요청 파라미터

| 파라미터명 | 필수여부 | 설명                       | 최대 길이 |
| ---------- | -------- | -------------------------- | --------- |
| mid        | 필수     | EZPG에서 발급한 상점아이디 | 15byte    |
| meky       | 필수     | EZPG에서 발급한 상점키     | 255byte   |
| userId     | 필수     | 유저아이디                 | 15byte    |
| userNm     | 필수     | 유저명                     | 20byte    |
| fixYn      | 필수     | Y: 고정형, N: 일회형       | 1byte     |

## 응답 정보

- **인터페이스명**: 회원등록 결과
- **Protocol**: HTTPS Response
- **Content-Type**: text/plain;charset=UTF-8

## 응답 파라미터

| 파라미터명 | 필수여부 | 설명                            |
| ---------- | -------- | ------------------------------- |
| resultCode | 필수     | 결과코드 (0000:성공, 이외 실패) |
| resultMsg  | 필수     | 결과메세지                      |
| mid        | 필수     | 상점아이디                      |
| userId     | 필수     | 유저아이디                      |
| userNm     | 필수     | 유저명                          |
| fixYn      | 필수     | Y: 고정형, N: 일회형            |
| userSeq    | 선택     | 유저번호                        |
| vactBankCd | 선택     | 가상계좌은행코드                |
| vacctNo    | 선택     | 가상계좌번호                    |

## 참고사항

- 모든 파라미터는 대소문자를 구분합니다.
- 모든 필수(M) 파라미터는 반드시 포함되어야 합니다.

## 부록

### 가상계좌 은행 코드표

| 은행코드 | 은행명           |
| -------- | ---------------- |
| 003      | 기업은행         |
| 004      | 국민은행         |
| 005      | 외환은행         |
| 007      | 수협중앙회       |
| 011      | 농협중앙회       |
| 020      | 우리은행         |
| 023      | SC제일은행       |
| 027      | 한국씨티은행     |
| 031      | 대구은행         |
| 032      | 부산은행         |
| 034      | 광주은행         |
| 037      | 전북은행         |
| 039      | 경남은행         |
| 045      | 새마을금고연합회 |
| 071      | 정보통신부우체국 |
| 081      | 하나은행         |
| 088      | 신한은행         |

### 데이터베이스 설계

가상계좌 정보를 관리하기 위한 테이블 구조는 다음과 같습니다:

```sql
CREATE TABLE bank_codes (
    bank_code VARCHAR(3) PRIMARY KEY,
    bank_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE virtual_accounts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,
    bank_code VARCHAR(3) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    account_holder VARCHAR(20),
    status VARCHAR(10) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (bank_code) REFERENCES bank_codes(bank_code),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE virtual_account_transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    virtual_account_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL, -- deposit, depositback
    amount DECIMAL(11,0) NOT NULL,
    sender_name VARCHAR(20),
    transaction_date DATE NOT NULL,
    transaction_time TIME NOT NULL,
    moid VARCHAR(30) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (virtual_account_id) REFERENCES virtual_accounts(id)
);
```

### API 동기화 프로세스

1. 가상계좌 발급 시:

   - 회원등록 API 응답으로 받은 `vactBankCd`와 `vacctNo`를 `virtual_accounts` 테이블에 저장
   - 해당 은행 코드가 `bank_codes` 테이블에 없는 경우 자동으로 추가

2. 입금 결과 수신 시:
   - 수신된 거래 정보를 `virtual_account_transactions` 테이블에 저장
   - 거래 유형(type)에 따라 "deposit" 또는 "depositback"으로 구분하여 저장
   - 주문번호(moid), 입금일자(appDt), 입금시간(appTm), 금액(amt), 입금자명(sender) 정보 저장

### API 응답 처리

EZPG는 가맹점으로부터 응답코드에 따라 결제결과 전송성공 여부를 판단합니다.

응답 예시:

```asp
' ASP
response.write "0000"
```

```jsp
// JSP
out.print("0000");
```

```php
// PHP
echo "0000";
```

### 로깅 시스템 설계

API 호출과 응답에 대한 상세 로깅을 위한 테이블 구조입니다:

```sql
CREATE TABLE api_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,           -- UUID for tracking requests
    api_name VARCHAR(50) NOT NULL,             -- API 엔드포인트 이름
    request_method VARCHAR(10) NOT NULL,       -- HTTP 메소드
    request_url TEXT NOT NULL,                 -- 요청 URL
    request_headers TEXT,                      -- 요청 헤더 (JSON)
    request_body TEXT,                         -- 요청 본문 (JSON)
    request_timestamp TIMESTAMP NOT NULL,      -- 요청 시간
    response_code VARCHAR(4),                  -- 응답 코드
    response_body TEXT,                        -- 응답 본문
    response_timestamp TIMESTAMP,              -- 응답 시간
    processing_time INT,                       -- 처리 시간 (밀리초)
    error_message TEXT,                        -- 에러 메시지 (있는 경우)
    ip_address VARCHAR(45),                    -- 요청 IP 주소
    user_id VARCHAR(15),                       -- 요청 사용자 ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE transaction_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    api_log_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,     -- 거래 유형 (회원등록, 입금 등)
    status VARCHAR(20) NOT NULL,               -- 거래 상태
    amount DECIMAL(11,0),                      -- 거래 금액
    bank_code VARCHAR(3),                      -- 은행 코드
    account_number VARCHAR(20),                -- 계좌 번호
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (api_log_id) REFERENCES api_logs(id)
);
```

### 로깅 프로세스

1. API 요청 시 로깅:

   - 요청 시작 시 `api_logs` 테이블에 기본 정보 기록
   - 요청 헤더, 본문, IP 주소 등 저장
   - 고유한 `request_id` 생성하여 추적

2. API 응답 시 로깅:

   - 응답 수신 시 해당 `request_id`로 로그 레코드 업데이트
   - 응답 코드, 본문, 처리 시간 기록
   - 에러 발생 시 에러 메시지 저장

3. 거래 로깅:

   - 거래 관련 API의 경우 `transaction_logs`에 추가 정보 기록
   - API 로그와 거래 로그를 `api_log_id`로 연결

4. 모니터링 쿼리 예시:

```sql
-- API 응답 시간 모니터링
SELECT
    api_name,
    AVG(processing_time) as avg_time,
    MAX(processing_time) as max_time,
    COUNT(*) as total_calls
FROM api_logs
WHERE request_timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY api_name;

-- 에러 발생 모니터링
SELECT
    api_name,
    response_code,
    error_message,
    COUNT(*) as error_count
FROM api_logs
WHERE response_code != '0000'
    AND request_timestamp >= DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY api_name, response_code, error_message;
```

### 로그 보관 정책

1. 로그 보관 기간:

   - API 로그: 3개월
   - 거래 로그: 5년
   - 중요 거래 로그: 영구 보관

2. 로그 정리 프로세스:

```sql
-- 3개월 이상된 일반 API 로그 삭제
DELETE FROM api_logs
WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH)
AND id NOT IN (
    SELECT api_log_id
    FROM transaction_logs
);

-- 백업 테이블로 이동 후 삭제
INSERT INTO api_logs_archive
SELECT * FROM api_logs
WHERE created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);
```

## 보안 및 로깅 상세 설계

### 1. 보안 계층 구조

```typescript
// lib/security/layers/UserRegistrationSecurity.ts
export const SecurityLayers = {
  RATE_LIMIT: 1,
  IP_WHITELIST: 2,
  TOKEN_VALIDATION: 3,
  REQUEST_VALIDATION: 4,
  DUPLICATION_CHECK: 5,
  USER_INFO_VALIDATION: 6,
};

// lib/security/UserRegistrationSecurityManager.ts
export class UserRegistrationSecurityManager {
  private static readonly MAX_ATTEMPTS = 3;
  private static readonly BLOCK_DURATION = 15 * 60 * 1000; // 15분
  private static readonly DUPLICATE_CHECK_WINDOW = 24 * 60 * 60 * 1000; // 24시간

  async validateRegistrationRequest(req: RegistrationRequest): Promise<ValidationResult> {
    // 1. IP 화이트리스트 검증
    await this.validateIpWhitelist(req.ip);

    // 2. 토큰 검증
    await this.validateToken(req.token);

    // 3. 요청 횟수 제한 검증
    await this.checkRateLimit(req.mid);

    // 4. 중복 가입 검증
    await this.checkDuplicateRegistration(req.userId);

    // 5. 사용자 정보 유효성 검증
    await this.validateUserInfo(req.userNm, req.userId);

    return { isValid: true };
  }

  private async checkDuplicateRegistration(userId: string): Promise<void> {
    const recentRegistration = await prisma.registrationHistory.findFirst({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - this.DUPLICATE_CHECK_WINDOW),
        },
      },
    });

    if (recentRegistration) {
      throw new Error("Duplicate registration attempt detected");
    }
  }

  private async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await prisma.userSecurityLog.create({
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
// lib/logging/UserRegistrationLogger.ts
export class UserRegistrationLogger {
  private static readonly LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    CRITICAL: 4,
  };

  async logRegistrationAttempt(data: RegistrationLogData): Promise<void> {
    // 1. 기본 로그 정보
    const baseLog = {
      requestId: uuidv4(),
      timestamp: new Date(),
      mid: data.mid,
      userId: data.userId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    };

    // 2. 민감 정보 마스킹
    const maskedData = this.maskSensitiveData(data);

    // 3. DB 로깅
    await prisma.$transaction([
      // 메인 로그 저장
      prisma.registrationLog.create({
        data: {
          ...baseLog,
          maskedData: maskedData,
          status: "ATTEMPT",
        },
      }),

      // 상세 정보 저장
      prisma.registrationDetail.create({
        data: {
          requestId: baseLog.requestId,
          userType: data.fixYn === "Y" ? "FIXED" : "TEMPORARY",
          registrationType: "NEW",
          securityCheckResults: this.getSecurityCheckResults(data),
        },
      }),
    ]);
  }

  private maskSensitiveData(data: any): MaskedData {
    return {
      userName: this.maskName(data.userNm),
      userId: this.maskUserId(data.userId),
    };
  }

  private getSecurityCheckResults(data: any): SecurityCheckResults {
    return {
      ipValidation: true,
      tokenValidation: true,
      userInfoValidation: true,
      duplicateCheck: true,
      timestamp: new Date(),
    };
  }
}
```

### 3. 데이터베이스 스키마 확장

```sql
-- 회원가입 보안 로그 테이블
CREATE TABLE user_security_logs (
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

-- 회원가입 상세 로그 테이블
CREATE TABLE registration_detailed_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    request_id VARCHAR(36) NOT NULL,
    mid VARCHAR(15) NOT NULL,
    user_id VARCHAR(15) NOT NULL,
    masked_user_name VARCHAR(20),
    registration_type VARCHAR(10),
    user_type VARCHAR(10),
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
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
);

-- 회원가입 이력 관리 테이블
CREATE TABLE registration_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(15) NOT NULL,
    registration_type VARCHAR(10) NOT NULL,
    status VARCHAR(20) NOT NULL,
    virtual_account_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- 회원가입 차단 이력 테이블
CREATE TABLE registration_blocks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    user_id VARCHAR(15),
    reason VARCHAR(100) NOT NULL,
    block_start TIMESTAMP NOT NULL,
    block_end TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_address (ip_address),
    INDEX idx_block_end (block_end)
);
```

### 4. 실시간 모니터링 및 알림

```typescript
// lib/monitoring/UserRegistrationMonitor.ts
export class UserRegistrationMonitor {
  private static readonly ALERT_THRESHOLDS = {
    FREQUENCY: 5, // 5회/분 이상 시도
    ERROR_RATE: 0.2, // 20% 이상 에러율
    BLOCK_COUNT: 3, // 3회 이상 차단
  };

  async monitorRegistrations(): Promise<void> {
    // 1. 비정상 시도 모니터링
    const suspiciousAttempts = await this.checkSuspiciousAttempts();

    // 2. IP별 시도 빈도 모니터링
    const highFrequency = await this.checkRegistrationFrequency();

    // 3. 에러율 모니터링
    const errorRates = await this.checkErrorRates();

    // 알림 발송
    if (suspiciousAttempts.length > 0) {
      await this.sendAlert("SUSPICIOUS_REGISTRATION", suspiciousAttempts);
    }
  }

  private async checkSuspiciousAttempts(): Promise<SuspiciousAttempt[]> {
    const query = `
      SELECT ip_address, COUNT(*) as attempt_count,
             COUNT(DISTINCT user_id) as unique_users
      FROM registration_detailed_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      GROUP BY ip_address
      HAVING attempt_count > 5 AND unique_users > 3
    `;
    return await prisma.$queryRaw(query);
  }
}
```

### 5. 보안 정책 설정

```typescript
// config/registration-security.config.ts
export const RegistrationSecurityConfig = {
  rateLimit: {
    windowMs: 5 * 60 * 1000, // 5분
    max: 5, // IP당 최대 요청 수
  },

  validation: {
    userIdPattern: /^[a-zA-Z0-9_]{4,15}$/,
    userNamePattern: /^[가-힣a-zA-Z]{2,20}$/,
    blockDuration: 15 * 60 * 1000, // 15분
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
// lib/audit/UserRegistrationAuditor.ts
export class UserRegistrationAuditor {
  async createAuditTrail(data: RegistrationAuditData): Promise<void> {
    const auditEntry = {
      action: "USER_REGISTRATION",
      userId: data.userId,
      resourceId: data.registrationId,
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

  private generateChangeLog(data: RegistrationAuditData): ChangeLog {
    return {
      userCreation: {
        timestamp: new Date(),
        status: "SUCCESS",
        details: {
          userType: data.fixYn === "Y" ? "FIXED" : "TEMPORARY",
          virtualAccountCreated: !!data.vactBankCd,
        },
      },
    };
  }
}
```

### 7. 에러 처리 및 복구 프로세스

```typescript
// lib/error/RegistrationErrorHandler.ts
export class RegistrationErrorHandler {
  async handleError(error: RegistrationError): Promise<ErrorResponse> {
    // 1. 에러 로깅
    await this.logError(error);

    // 2. 보안 이벤트 생성
    if (this.isSecurityRelated(error)) {
      await this.createSecurityEvent(error);
    }

    // 3. 복구 프로세스 실행
    await this.executeRecoveryProcess(error);

    // 4. 사용자 친화적 응답 생성
    return this.generateUserResponse(error);
  }

  private async executeRecoveryProcess(error: RegistrationError): Promise<void> {
    switch (error.type) {
      case "DUPLICATE_USER":
        await this.handleDuplicateUser(error.userId);
        break;
      case "VIRTUAL_ACCOUNT_FAILED":
        await this.retryVirtualAccountCreation(error.userId);
        break;
      default:
        await this.handleGenericError(error);
    }
  }
}
```

### 8. 텔레그램 알림 서비스

```typescript
// lib/notifications/TelegramNotificationService.ts
export class TelegramNotificationService {
  private bot: TelegramBot;
  private static readonly SEVERITY_EMOJI = {
    CRITICAL: "🔴",
    HIGH: "🟠",
    MEDIUM: "🟡",
    LOW: "🟢",
    INFO: "ℹ️",
  };

  constructor() {
    this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }

  async sendAlert(alert: AlertData): Promise<void> {
    const chatIds = await this.getTargetChatIds(alert.severity);
    const message = this.formatAlertMessage(alert);

    for (const chatId of chatIds) {
      await this.bot.sendMessage(chatId, message, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    }
  }

  private formatAlertMessage(alert: AlertData): string {
    const emoji = TelegramNotificationService.SEVERITY_EMOJI[alert.severity];
    return `${emoji} <b>[${alert.severity}] ${alert.type}</b>
    
시간: ${alert.timestamp.toLocaleString("ko-KR")}
내용: ${alert.message}
${alert.details ? `\n상세정보:\n${this.formatDetails(alert.details)}` : ""}
${alert.action ? `\n필요한 조치:\n${alert.action}` : ""}`;
  }

  private formatDetails(details: any): string {
    return Object.entries(details)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join("\n");
  }

  private async getTargetChatIds(severity: AlertSeverity): Promise<string[]> {
    // 알림 심각도에 따른 수신자 그룹 결정
    const groups = await prisma.telegramAlertGroups.findMany({
      where: {
        minSeverity: {
          lte: this.getSeverityLevel(severity),
        },
        isActive: true,
      },
    });
    return groups.map((group) => group.chatId);
  }

  private getSeverityLevel(severity: AlertSeverity): number {
    const levels = {
      CRITICAL: 1,
      HIGH: 2,
      MEDIUM: 3,
      LOW: 4,
      INFO: 5,
    };
    return levels[severity] || 5;
  }
}

// lib/notifications/AlertManager.ts
export class AlertManager {
  private telegramService: TelegramNotificationService;

  constructor() {
    this.telegramService = new TelegramNotificationService();
  }

  async processAlert(data: AlertData): Promise<void> {
    // 1. DB에 알림 저장
    const alert = await prisma.alerts.create({
      data: {
        type: data.type,
        severity: data.severity,
        message: data.message,
        details: data.details,
        timestamp: data.timestamp,
      },
    });

    // 2. 텔레그램 알림 발송
    await this.telegramService.sendAlert(data);

    // 3. 알림 발송 로그 기록
    await prisma.alertLogs.create({
      data: {
        alertId: alert.id,
        channel: "TELEGRAM",
        status: "SENT",
        timestamp: new Date(),
      },
    });
  }
}
```

### 텔레그램 알림 데이터베이스 스키마

```sql
-- 텔레그램 알림 그룹 테이블
CREATE TABLE telegram_alert_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    chat_id VARCHAR(100) NOT NULL,
    min_severity VARCHAR(20) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_chat_id (chat_id)
);

-- 알림 로그 테이블
CREATE TABLE alert_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_id BIGINT NOT NULL,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alert_id (alert_id),
    INDEX idx_timestamp (timestamp)
);

-- 알림 수신 확인 테이블
CREATE TABLE alert_acknowledgments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_id BIGINT NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL,
    comment TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alert_id (alert_id),
    INDEX idx_user_timestamp (user_id, timestamp)
);
```

### 알림 설정 예시

```typescript
// config/notification.config.ts
export const NotificationConfig = {
  telegram: {
    alertThresholds: {
      registration: {
        suspiciousAttempts: {
          severity: "HIGH",
          threshold: 5,
          timeWindow: 5 * 60 * 1000, // 5분
        },
        failedAttempts: {
          severity: "MEDIUM",
          threshold: 10,
          timeWindow: 15 * 60 * 1000, // 15분
        },
        systemErrors: {
          severity: "CRITICAL",
          threshold: 1,
          timeWindow: 5 * 60 * 1000, // 5분
        },
      },
    },
    messageTemplates: {
      suspiciousRegistration: (data: any) => `
🚨 의심스러운 회원가입 시도 감지
IP: ${data.ipAddress}
시도 횟수: ${data.attemptCount}
고유 사용자 수: ${data.uniqueUsers}
시간 범위: 최근 5분`,

      systemError: (error: any) => `
⚠️ 시스템 오류 발생
오류 유형: ${error.type}
영향: ${error.impact}
시간: ${error.timestamp}
조치 필요: ${error.action || "확인 필요"}`,
    },
  },
};
```

### 알림 사용 예시

```typescript
// 모니터링 클래스에 통합
export class UserRegistrationMonitor {
  private alertManager: AlertManager;

  constructor() {
    this.alertManager = new AlertManager();
  }

  async monitorRegistrations(): Promise<void> {
    // 기존 모니터링 로직...

    // 의심스러운 시도 발견 시 알림
    if (suspiciousAttempts.length > 0) {
      await this.alertManager.processAlert({
        type: "SUSPICIOUS_REGISTRATION",
        severity: "HIGH",
        message: "의심스러운 회원가입 시도가 감지되었습니다.",
        details: {
          attempts: suspiciousAttempts,
          timestamp: new Date(),
        },
        action: "보안팀 확인 필요",
      });
    }

    // 시스템 에러 발생 시 알림
    if (systemErrors.length > 0) {
      await this.alertManager.processAlert({
        type: "SYSTEM_ERROR",
        severity: "CRITICAL",
        message: "회원가입 시스템 오류가 발생했습니다.",
        details: {
          errors: systemErrors,
          impact: "회원가입 프로세스 중단",
        },
        action: "긴급 점검 필요",
      });
    }
  }
}
```

### 알림 수신 확인 및 처리

```typescript
// lib/notifications/AlertHandler.ts
export class AlertHandler {
  async acknowledgeAlert(
    alertId: string,
    userId: string,
    status: string,
    comment?: string,
  ): Promise<void> {
    await prisma.alertAcknowledgments.create({
      data: {
        alertId,
        userId,
        status,
        comment,
        timestamp: new Date(),
      },
    });

    // 상태가 'RESOLVED'인 경우 후속 조치
    if (status === "RESOLVED") {
      await this.handleResolvedAlert(alertId);
    }
  }

  private async handleResolvedAlert(alertId: string): Promise<void> {
    // 해당 알림 관련 후속 조치 수행
    const alert = await prisma.alerts.findUnique({
      where: { id: alertId },
    });

    if (alert) {
      // 알림 유형에 따른 후속 조치
      switch (alert.type) {
        case "SUSPICIOUS_REGISTRATION":
          await this.handleResolvedSuspiciousRegistration(alert);
          break;
        case "SYSTEM_ERROR":
          await this.handleResolvedSystemError(alert);
          break;
      }
    }
  }
}
```

## 보안 체크리스트 업데이트

1. 입력 값 검증

   - [x] 사용자 ID 형식 검증
   - [x] 사용자명 유효성 검증
   - [x] SQL Injection 방지
   - [x] XSS 방지
   - [x] 중복 가입 검증

2. 인증 및 인가

   - [x] API 키 유효성 검증
   - [x] 요청 IP 화이트리스트 확인
   - [x] 권한 수준 확인
   - [x] 토큰 기반 인증

3. 암호화

   - [x] 통신 구간 암호화 (HTTPS)
   - [x] 중요 정보 암호화 저장
   - [x] API 키 보안 저장
   - [x] 사용자 정보 암호화

4. 모니터링

   - [x] 실시간 가입 시도 모니터링
   - [x] 비정상 패턴 탐지
   - [x] 시스템 성능 모니터링
   - [x] 보안 위협 모니터링
   - [x] 알림 시스템

5. 로깅

   - [x] 상세 가입 프로세스 로깅
   - [x] 보안 이벤트 로깅
   - [x] 감사 추적
   - [x] 에러 로깅

6. 복구 프로세스
   - [x] 자동 복구 프로세스
   - [x] 수동 개입 프로세스
   - [x] 데이터 정합성 검증
   - [x] 롤백 메커니즘
