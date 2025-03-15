import { NextRequest, NextResponse } from 'next/server';
import { 
  sendTelegramMessage, 
  sendPaymentNotification, 
  sendSettlementNotification, 
  sendErrorNotification,
  sendSecurityNotification,
  sendSystemNotification
} from '@/lib/notifications/service';
import { 
  NotificationType,
  PaymentNotificationParams,
  SettlementNotificationParams,
  ErrorNotificationParams,
  SecurityNotificationParams
} from '@/lib/notifications/types';

/**
 * 텔레그램 알림 테스트 API
 * 
 * 다양한 유형의 텔레그램 알림을 테스트하기 위한 API 엔드포인트입니다.
 * POST 요청을 통해 알림 유형과 필요한 데이터를 전송하면 해당 알림을 발송합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { type, ...params } = data;
    
    let result;
    
    switch (type) {
      case 'message':
        // 일반 메시지 전송
        result = await sendTelegramMessage(params.message);
        break;
        
      case NotificationType.PAYMENT:
        // 결제 알림 전송
        result = await sendPaymentNotification(params as PaymentNotificationParams);
        break;
        
      case NotificationType.SETTLEMENT:
        // 정산 알림 전송
        result = await sendSettlementNotification(params as SettlementNotificationParams);
        break;
        
      case NotificationType.ERROR:
        // 오류 알림 전송
        result = await sendErrorNotification(params as ErrorNotificationParams);
        break;
        
      case NotificationType.SECURITY:
        // 보안 알림 전송
        result = await sendSecurityNotification(params as SecurityNotificationParams);
        break;
        
      case NotificationType.SYSTEM:
        // 시스템 알림 전송
        result = await sendSystemNotification(
          params.title,
          params.message,
          params.details
        );
        break;
        
      default:
        return NextResponse.json(
          { success: false, message: '알 수 없는 알림 유형입니다.' },
          { status: 400 }
        );
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('텔레그램 알림 API 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '텔레그램 알림 처리 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

/**
 * 텔레그램 알림 설정 정보 조회 API
 * 
 * 현재 설정된 텔레그램 봇 토큰과 채팅 ID 정보를 반환합니다.
 * 보안을 위해 토큰의 일부만 마스킹하여 반환합니다.
 */
export async function GET() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    const chatId = process.env.TELEGRAM_CHAT_ID || '';
    
    // 토큰 마스킹 처리 (앞 10자리만 표시하고 나머지는 *로 처리)
    const maskedToken = botToken 
      ? `${botToken.substring(0, 10)}${'*'.repeat(Math.max(0, botToken.length - 10))}`
      : '';
    
    return NextResponse.json({
      success: true,
      data: {
        botToken: maskedToken,
        chatId,
        isConfigured: Boolean(botToken && chatId)
      }
    });
  } catch (error) {
    console.error('텔레그램 설정 조회 API 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: '텔레그램 설정 정보 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
