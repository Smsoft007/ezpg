/**
 * 텔레그램 알림 기능 구현
 * 
 * 이 모듈은 텔레그램 봇을 통해 알림을 보내는 기능을 제공합니다.
 * 결제, 정산, 오류 등의 중요 이벤트가 발생했을 때 텔레그램으로 알림을 보낼 수 있습니다.
 */

/**
 * 텔레그램 메시지 전송 함수
 * @param message 전송할 메시지 내용
 * @param chatId 메시지를 보낼 채팅 ID (기본값: 환경 변수에 설정된 TELEGRAM_CHAT_ID)
 * @returns 메시지 전송 결과
 */
export async function sendTelegramMessage(
  message: string,
  chatId: string = process.env.TELEGRAM_CHAT_ID || ''
): Promise<{ success: boolean; message?: string; error?: any }> {
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
 * @param merchantName 가맹점 이름
 * @param amount 결제 금액
 * @param orderId 주문 ID
 * @returns 메시지 전송 결과
 */
export async function sendPaymentNotification(
  merchantName: string,
  amount: number,
  orderId: string
): Promise<{ success: boolean; message?: string; error?: any }> {
  const formattedAmount = new Intl.NumberFormat('ko-KR').format(amount);
  const message = `
<b>💰 새로운 결제가 완료되었습니다</b>

🏪 가맹점: ${merchantName}
💵 금액: ${formattedAmount}원
🔢 주문번호: ${orderId}
⏰ 시간: ${new Date().toLocaleString('ko-KR')}
`;

  return await sendTelegramMessage(message);
}

/**
 * 정산 알림 메시지 전송 함수
 * @param merchantName 가맹점 이름
 * @param amount 정산 금액
 * @param settlementId 정산 ID
 * @returns 메시지 전송 결과
 */
export async function sendSettlementNotification(
  merchantName: string,
  amount: number,
  settlementId: string
): Promise<{ success: boolean; message?: string; error?: any }> {
  const formattedAmount = new Intl.NumberFormat('ko-KR').format(amount);
  const message = `
<b>🏦 정산이 완료되었습니다</b>

🏪 가맹점: ${merchantName}
💵 금액: ${formattedAmount}원
🔢 정산번호: ${settlementId}
⏰ 시간: ${new Date().toLocaleString('ko-KR')}
`;

  return await sendTelegramMessage(message);
}

/**
 * 오류 알림 메시지 전송 함수
 * @param errorType 오류 유형
 * @param errorMessage 오류 메시지
 * @param details 추가 세부 정보
 * @returns 메시지 전송 결과
 */
export async function sendErrorNotification(
  errorType: string,
  errorMessage: string,
  details?: Record<string, any>
): Promise<{ success: boolean; message?: string; error?: any }> {
  let detailsText = '';
  if (details) {
    detailsText = Object.entries(details)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
  }

  const message = `
<b>⚠️ 시스템 오류가 발생했습니다</b>

🔴 오류 유형: ${errorType}
📝 오류 메시지: ${errorMessage}
${detailsText ? `\n📋 세부 정보:\n${detailsText}` : ''}
⏰ 시간: ${new Date().toLocaleString('ko-KR')}
`;

  return await sendTelegramMessage(message);
}

/**
 * 보안 알림 메시지 전송 함수
 * @param eventType 보안 이벤트 유형
 * @param userName 사용자 이름
 * @param ipAddress IP 주소
 * @param details 추가 세부 정보
 * @returns 메시지 전송 결과
 */
export async function sendSecurityNotification(
  eventType: string,
  userName: string,
  ipAddress: string,
  details?: Record<string, any>
): Promise<{ success: boolean; message?: string; error?: any }> {
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
⏰ 시간: ${new Date().toLocaleString('ko-KR')}
`;

  return await sendTelegramMessage(message);
}
