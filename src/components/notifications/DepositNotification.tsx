import React, { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';

export interface DepositNotificationProps {
  merchantId: string;
  merchantName: string;
  amount: number;
  transactionId: string;
  timestamp: string;
}

export function useDepositNotification() {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // 컴포넌트가 마운트될 때 오디오 요소 생성
    audioRef.current = new Audio('/sounds/notification.mp3');
    
    return () => {
      // 컴포넌트가 언마운트될 때 오디오 요소 정리
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const showDepositNotification = (data: DepositNotificationProps) => {
    // 소리 재생
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(error => {
        console.error('오디오 재생 실패:', error);
      });
    }

    // 토스트 알림 표시
    toast({
      variant: "success",
      title: "입금 알림",
      description: (
        <div className="flex flex-col gap-1">
          <p><strong>{data.merchantName}</strong>님이 입금했습니다.</p>
          <p>금액: {formatCurrency(data.amount)}</p>
          <p>거래 ID: {data.transactionId}</p>
          <p>시간: {new Date(data.timestamp).toLocaleString('ko-KR')}</p>
        </div>
      ),
    });
  };

  return { showDepositNotification };
}

export default function DepositNotificationDemo() {
  const { showDepositNotification } = useDepositNotification();
  
  // 데모 용도로 버튼 클릭 시 알림 표시
  const handleTestNotification = () => {
    showDepositNotification({
      merchantId: 'test-merchant-id',
      merchantName: '테스트 가맹점',
      amount: 50000,
      transactionId: 'TX' + Math.floor(Math.random() * 1000000),
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div>
      <button 
        onClick={handleTestNotification}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      >
        입금 알림 테스트
      </button>
    </div>
  );
}
