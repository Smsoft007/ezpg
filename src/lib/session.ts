import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { type ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// 세션 타입 정의
export interface SessionData {
  user?: {
    id: string;
    email: string;
    name?: string;
    role: string;
    isAdmin: boolean;
  };
  isLoggedIn: boolean;
}

// 세션 옵션 설정
export const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long',
  cookieName: 'ezpg_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7일간 유효
  },
};

// 서버에서 세션 가져오기
export async function getServerSession(): Promise<SessionData> {
  // @ts-ignore - iron-session 타입 이슈 해결
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
  }
  
  return session;
}

// 관리자 권한 확인
export function isAdmin(session: SessionData | null): boolean {
  if (!session || !session.isLoggedIn || !session.user) {
    return false;
  }
  
  return session.user.isAdmin === true || session.user.role === 'admin';
}

// 로그인 확인
export function isAuthenticated(session: SessionData | null): boolean {
  return !!session && session.isLoggedIn === true && !!session.user;
}
