/**
 * 알림 시스템 모듈
 * 
 * 이 모듈은 다양한 채널(텔레그램, 이메일 등)을 통해 알림을 보내는 기능을 제공합니다.
 * 결제, 정산, 오류 등의 중요 이벤트가 발생했을 때 알림을 보낼 수 있습니다.
 */

// 타입 내보내기
export * from './types';

// 서비스 함수 내보내기
export {
  sendTelegramMessage,
  sendPaymentNotification as sendServicePaymentNotification,
  sendSettlementNotification as sendServiceSettlementNotification,
  sendErrorNotification as sendServiceErrorNotification,
  sendSecurityNotification as sendServiceSecurityNotification,
  sendSystemNotification as sendServiceSystemNotification
} from './service';

// 클라이언트 함수 내보내기
export {
  getTelegramConfig,
  sendMessage,
  sendPaymentNotification,
  sendSettlementNotification,
  sendErrorNotification,
  sendSecurityNotification,
  sendSystemNotification
} from './client';

// 유틸리티 함수 내보내기
export * from './utils';
