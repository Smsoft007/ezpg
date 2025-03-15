/**
 * 텔레그램 알림 API 클라이언트
 * 
 * 이 모듈은 텔레그램 알림 API를 호출하는 클라이언트 함수를 제공합니다.
 * 프론트엔드에서 알림 API를 호출할 때 사용합니다.
 */

import { 
  MessageResult, 
  PaymentNotificationParams,
  SettlementNotificationParams,
  ErrorNotificationParams,
  SecurityNotificationParams,
  NotificationType
} from './types';

/**
 * 텔레그램 알림 API 기본 URL
 */
const API_BASE_URL = '/api/notifications/telegram';

/**
 * API 응답 인터페이스
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

/**
 * 알림 API 요청 인터페이스
 */
interface NotificationRequest {
  type: string;
  [key: string]: any;
}

/**
 * API 요청 함수
 * @param method HTTP 메서드
 * @param url API URL
 * @param data 요청 데이터
 * @returns API 응답
 */
async function apiRequest<T>(
  method: string,
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    const result = await response.json();

    return result;
  } catch (error) {
    console.error('API 요청 오류:', error);
    return {
      success: false,
      message: '알림 API 요청 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 텔레그램 알림 설정 정보 조회 함수
 * @returns 텔레그램 알림 설정 정보
 */
export async function getTelegramConfig(): Promise<ApiResponse<{
  botToken: string;
  chatId: string;
  isConfigured: boolean;
}>> {
  return await apiRequest('GET', API_BASE_URL);
}

/**
 * 일반 메시지 전송 함수
 * @param message 전송할 메시지
 * @returns 메시지 전송 결과
 */
export async function sendMessage(message: string): Promise<ApiResponse<MessageResult>> {
  const data: NotificationRequest = {
    type: 'message',
    message,
  };

  return await apiRequest<MessageResult>('POST', API_BASE_URL, data);
}

/**
 * 결제 알림 전송 함수
 * @param params 결제 알림 파라미터
 * @returns 알림 전송 결과
 */
export async function sendPaymentNotification(
  params: PaymentNotificationParams
): Promise<ApiResponse<MessageResult>> {
  const data: NotificationRequest = {
    type: NotificationType.PAYMENT,
    ...params,
  };

  return await apiRequest<MessageResult>('POST', API_BASE_URL, data);
}

/**
 * 정산 알림 전송 함수
 * @param params 정산 알림 파라미터
 * @returns 알림 전송 결과
 */
export async function sendSettlementNotification(
  params: SettlementNotificationParams
): Promise<ApiResponse<MessageResult>> {
  const data: NotificationRequest = {
    type: NotificationType.SETTLEMENT,
    ...params,
  };

  return await apiRequest<MessageResult>('POST', API_BASE_URL, data);
}

/**
 * 오류 알림 전송 함수
 * @param params 오류 알림 파라미터
 * @returns 알림 전송 결과
 */
export async function sendErrorNotification(
  params: ErrorNotificationParams
): Promise<ApiResponse<MessageResult>> {
  const data: NotificationRequest = {
    type: NotificationType.ERROR,
    ...params,
  };

  return await apiRequest<MessageResult>('POST', API_BASE_URL, data);
}

/**
 * 보안 알림 전송 함수
 * @param params 보안 알림 파라미터
 * @returns 알림 전송 결과
 */
export async function sendSecurityNotification(
  params: SecurityNotificationParams
): Promise<ApiResponse<MessageResult>> {
  const data: NotificationRequest = {
    type: NotificationType.SECURITY,
    ...params,
  };

  return await apiRequest<MessageResult>('POST', API_BASE_URL, data);
}

/**
 * 시스템 알림 전송 함수
 * @param title 알림 제목
 * @param message 알림 메시지
 * @param details 추가 세부 정보
 * @returns 알림 전송 결과
 */
export async function sendSystemNotification(
  title: string,
  message: string,
  details?: Record<string, any>
): Promise<ApiResponse<MessageResult>> {
  const data: NotificationRequest = {
    type: NotificationType.SYSTEM,
    title,
    message,
    details,
  };

  return await apiRequest<MessageResult>('POST', API_BASE_URL, data);
}
