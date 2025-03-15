/**
 * 텔레그램 알림 관련 타입 정의
 */

/**
 * 메시지 전송 결과 인터페이스
 */
export interface MessageResult {
  success: boolean;
  message?: string;
  error?: any;
}

/**
 * 결제 알림 파라미터 인터페이스
 */
export interface PaymentNotificationParams {
  merchantName: string;
  amount: number;
  orderId: string;
  paymentMethod?: string;
  customerInfo?: string;
}

/**
 * 정산 알림 파라미터 인터페이스
 */
export interface SettlementNotificationParams {
  merchantName: string;
  amount: number;
  settlementId: string;
  bankInfo?: string;
  settlementDate?: Date;
}

/**
 * 오류 알림 파라미터 인터페이스
 */
export interface ErrorNotificationParams {
  errorType: string;
  errorMessage: string;
  details?: Record<string, any>;
  stackTrace?: string;
}

/**
 * 보안 알림 파라미터 인터페이스
 */
export interface SecurityNotificationParams {
  eventType: string;
  userName: string;
  ipAddress: string;
  details?: Record<string, any>;
  timestamp?: Date;
}

/**
 * 알림 유형 열거형
 */
export enum NotificationType {
  PAYMENT = 'payment',
  SETTLEMENT = 'settlement',
  ERROR = 'error',
  SECURITY = 'security',
  SYSTEM = 'system',
}

/**
 * 알림 채널 열거형
 */
export enum NotificationChannel {
  TELEGRAM = 'telegram',
  EMAIL = 'email',
  SMS = 'sms',
  WEBHOOK = 'webhook',
}

/**
 * 알림 설정 인터페이스
 */
export interface NotificationConfig {
  enabled: boolean;
  channels: NotificationChannel[];
  recipients?: string[];
  telegramChatId?: string;
}
