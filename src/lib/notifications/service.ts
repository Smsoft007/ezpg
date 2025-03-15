/**
 * 텔레그램 알림 서비스 구현
 * 
 * 이 모듈은 텔레그램 봇을 통해 알림을 보내는 서비스 로직을 제공합니다.
 * 결제, 정산, 오류 등의 중요 이벤트가 발생했을 때 텔레그램으로 알림을 보낼 수 있습니다.
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
 * 텔레그램 메시지 전송 함수
 * @param message 전송할 메시지 내용
 * @param chatId 메시지를 보낼 채팅 ID (기본값: 환경 변수에 설정된 TELEGRAM_CHAT_ID)
 * @returns 메시지 전송 결과
 */
export async function sendTelegramMessage(
  message: string,
  chatId: string = process.env.TELEGRAM_CHAT_ID || ''
): Promise<MessageResult> {
  try {
    // 환경 변수에서 봇 토큰 가져오기
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    // 봇 토큰이나 채팅 ID가 없으면 오류 반환
    if (!botToken || !chatId) {
      console.error('텔레그램 봇 토큰 또는 채팅 ID가 설정되지 않았습니다.');
      return { 
        success: false, 
        message: '텔레그램 봇 토큰 또는 채팅 ID가 설정되지 않았습니다.' 
      };
    }

    // 텔레그램 API URL 생성
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    
    // API 요청 옵션 설정
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML', // HTML 형식 지원 (굵게, 기울임, 링크 등)
      }),
    };

    // 텔레그램 API 호출
    const response = await fetch(url, options);
    const data = await response.json();

    // 응답 확인
    if (data.ok) {
      return { success: true, message: '메시지가 성공적으로 전송되었습니다.' };
    } else {
      console.error('텔레그램 메시지 전송 실패:', data);
      return { 
        success: false, 
        message: '텔레그램 메시지 전송에 실패했습니다.', 
        error: data 
      };
    }
  } catch (error) {
    console.error('텔레그램 메시지 전송 중 오류 발생:', error);
    return { 
      success: false, 
      message: '텔레그램 메시지 전송 중 오류가 발생했습니다.', 
      error 
    };
  }
}

/**
 * 결제 알림 메시지 전송 함수
 * @param params 결제 알림 파라미터
 * @returns 메시지 전송 결과
 */
export async function sendPaymentNotification(
  params: PaymentNotificationParams
): Promise<MessageResult> {
  const { merchantName, amount, orderId, paymentMethod, customerInfo } = params;
  const formattedAmount = new Intl.NumberFormat('ko-KR').format(amount);
  
  let message = `
<b>💰 새로운 결제가 완료되었습니다</b>

🏪 가맹점: ${merchantName}
💵 금액: ${formattedAmount}원
🔢 주문번호: ${orderId}
⏰ 시간: ${new Date().toLocaleString('ko-KR')}
`;

  // 추가 정보가 있는 경우 메시지에 포함
  if (paymentMethod) {
    message += `💳 결제수단: ${paymentMethod}\n`;
  }
  
  if (customerInfo) {
    message += `👤 고객정보: ${customerInfo}\n`;
  }

  return await sendTelegramMessage(message);
}

/**
 * 정산 알림 메시지 전송 함수
 * @param params 정산 알림 파라미터
 * @returns 메시지 전송 결과
 */
export async function sendSettlementNotification(
  params: SettlementNotificationParams
): Promise<MessageResult> {
  const { merchantName, amount, settlementId, bankInfo, settlementDate } = params;
  const formattedAmount = new Intl.NumberFormat('ko-KR').format(amount);
  
  let message = `
<b>🏦 정산이 완료되었습니다</b>

🏪 가맹점: ${merchantName}
💵 금액: ${formattedAmount}원
🔢 정산번호: ${settlementId}
⏰ 시간: ${new Date().toLocaleString('ko-KR')}
`;

  // 추가 정보가 있는 경우 메시지에 포함
  if (bankInfo) {
    message += `🏛️ 은행정보: ${bankInfo}\n`;
  }
  
  if (settlementDate) {
    message += `📅 정산일자: ${settlementDate.toLocaleDateString('ko-KR')}\n`;
  }

  return await sendTelegramMessage(message);
}

/**
 * 오류 알림 메시지 전송 함수
 * @param params 오류 알림 파라미터
 * @returns 메시지 전송 결과
 */
export async function sendErrorNotification(
  params: ErrorNotificationParams
): Promise<MessageResult> {
  const { errorType, errorMessage, details, stackTrace } = params;
  
  let detailsText = '';
  if (details) {
    detailsText = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  let message = `
<b>⚠️ 시스템 오류가 발생했습니다</b>

🔴 오류 유형: ${errorType}
📝 오류 메시지: ${errorMessage}
${detailsText ? `\n📋 세부 정보:\n${detailsText}` : ''}
⏰ 시간: ${new Date().toLocaleString('ko-KR')}
`;

  // 스택 트레이스가 있는 경우 메시지에 포함
  if (stackTrace) {
    message += `\n🔍 스택 트레이스:\n<pre>${stackTrace}</pre>\n`;
  }

  return await sendTelegramMessage(message);
}

/**
 * 보안 알림 메시지 전송 함수
 * @param params 보안 알림 파라미터
 * @returns 메시지 전송 결과
 */
export async function sendSecurityNotification(
  params: SecurityNotificationParams
): Promise<MessageResult> {
  const { eventType, userName, ipAddress, details, timestamp } = params;
  
  let detailsText = '';
  if (details) {
    detailsText = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  const message = `
<b>🔒 보안 알림</b>

🚨 이벤트: ${eventType}
👤 사용자: ${userName}
🌐 IP 주소: ${ipAddress}
${detailsText ? `\n📋 세부 정보:\n${detailsText}` : ''}
⏰ 시간: ${timestamp ? timestamp.toLocaleString('ko-KR') : new Date().toLocaleString('ko-KR')}
`;

  return await sendTelegramMessage(message);
}

/**
 * 시스템 알림 메시지 전송 함수
 * @param title 알림 제목
 * @param message 알림 메시지
 * @param details 추가 세부 정보
 * @returns 메시지 전송 결과
 */
export async function sendSystemNotification(
  title: string,
  message: string,
  details?: Record<string, any>
): Promise<MessageResult> {
  let detailsText = '';
  if (details) {
    detailsText = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  const telegramMessage = `
<b>🖥️ ${title}</b>

📢 ${message}
${detailsText ? `\n📋 세부 정보:\n${detailsText}` : ''}
⏰ 시간: ${new Date().toLocaleString('ko-KR')}
`;

  return await sendTelegramMessage(telegramMessage);
}
