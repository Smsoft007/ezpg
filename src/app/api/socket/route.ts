import { NextResponse } from 'next/server';
import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { Socket as NetSocket } from 'net';

export interface SocketServer extends NetServer {
  io?: SocketIOServer | undefined;
}

export interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export interface NextApiResponseWithSocket extends NextApiRequest {
  socket: SocketWithIO;
}

// 전역 변수로 소켓 서버 인스턴스 저장
let io: SocketIOServer;

export async function GET(req: Request) {
  if (io) {
    // 이미 소켓 서버가 초기화되어 있으면 200 응답
    return new NextResponse('Socket is already running', { status: 200 });
  }

  try {
    // Next.js의 응답 객체에서 소켓 서버 초기화
    const res = new NextResponse();
    
    // @ts-ignore - NextResponse의 socket 속성에 접근
    const socket = res.socket as SocketWithIO;
    
    if (!socket.server.io) {
      // 소켓 서버 초기화
      io = new SocketIOServer(socket.server, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
          origin: '*',
          methods: ['GET', 'POST'],
        },
      });
      
      // 소켓 서버를 HTTP 서버에 연결
      socket.server.io = io;
      
      // 소켓 연결 이벤트 처리
      io.on('connection', (socket: any) => {
        console.log('새로운 클라이언트 연결:', socket.id);
        
        socket.on('disconnect', () => {
          console.log('클라이언트 연결 해제:', socket.id);
        });
      });
    }
    
    return new NextResponse('Socket server initialized', { status: 200 });
  } catch (error) {
    console.error('소켓 서버 초기화 오류:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// 소켓 서버 인스턴스 가져오기
export function getSocketIO() {
  return io;
}
