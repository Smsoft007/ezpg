'use client';

// 임시로 socket.io-client 의존성 제거
// import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket 타입 정의
interface Socket {
  id?: string;
  on: (event: string, callback: (...args: any[]) => void) => Socket;
  off: (event: string, callback?: (...args: any[]) => void) => Socket;
  emit: (event: string, ...args: any[]) => Socket;
  connect: () => Socket;
  disconnect: () => Socket;
}

let socket: Socket | null = null;

export const initializeSocket = () => {
  if (!socket) {
    console.log('소켓 초기화 시도 - socket.io-client 패키지가 설치되어 있지 않습니다.');
    
    // 임시 더미 소켓 객체 생성
    socket = {
      id: 'dummy-socket-id',
      on: (event, callback) => {
        console.log(`이벤트 리스너 등록 (${event}) - 실제 소켓 연결 없음`);
        return socket as Socket;
      },
      off: (event, callback) => {
        console.log(`이벤트 리스너 제거 (${event}) - 실제 소켓 연결 없음`);
        return socket as Socket;
      },
      emit: (event, ...args) => {
        console.log(`이벤트 발생 (${event}) - 실제 소켓 연결 없음`, args);
        return socket as Socket;
      },
      connect: () => {
        console.log('소켓 연결 시도 - 실제 소켓 연결 없음');
        return socket as Socket;
      },
      disconnect: () => {
        console.log('소켓 연결 해제 - 실제 소켓 연결 없음');
        return socket as Socket;
      }
    };

    console.log('더미 소켓 생성 완료:', socket?.id);
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    initializeSocket();
  }
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    console.log('소켓 연결 종료 시도');
    socket = null;
  }
};

// 입금 알림 이벤트 타입 정의
export interface DepositNotification {
  merchantId: string;
  merchantName: string;
  amount: number;
  transactionId: string;
  timestamp: string;
  title: string;
  message: string;
}

// React Hook을 사용하여 소켓 이벤트 구독
export function useSocketEvent<T>(eventName: string, callback: (data: T) => void) {
  useEffect(() => {
    const currentSocket = getSocket();
    
    if (currentSocket) {
      currentSocket.on(eventName, callback);
    }
    
    return () => {
      if (currentSocket) {
        currentSocket.off(eventName);
      }
    };
  }, [eventName, callback]);
}

// 입금 알림 구독 훅
export function useDepositNotifications(callback: (data: DepositNotification) => void) {
  const [notifications, setNotifications] = useState<DepositNotification[]>([]);
  
  useEffect(() => {
    // 소켓 초기화
    initializeSocket();
    
    // 입금 알림 이벤트 리스너 등록
    const handleDepositNotification = (data: DepositNotification) => {
      setNotifications(prev => [...prev, data]);
      callback(data);
    };
    
    const currentSocket = getSocket();
    if (currentSocket) {
      currentSocket.on('deposit_notification', handleDepositNotification);
    }
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      if (currentSocket) {
        currentSocket.off('deposit_notification', handleDepositNotification);
      }
    };
  }, [callback]);
  
  return {
    notifications,
    clearNotifications: () => setNotifications([])
  };
}
