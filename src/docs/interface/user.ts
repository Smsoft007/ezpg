/**
 * 사용자 정보 인터페이스
 * 시스템 사용자(관리자 및 가맹점 사용자)의 정보를 정의합니다.
 */
export interface User {
  /** 사용자 고유 ID */
  userId: string;
  /** 사용자 이름 */
  userName: string;
  /** 관리자 여부 (Y/N) */
  adminYn: string;
  /** 가맹점 ID (가맹점 사용자인 경우) */
  merchantId?: string;
  /** 가맹점 이름 (가맹점 사용자인 경우) */
  merchantName?: string;
  /** 이메일 주소 */
  email?: string;
  /** 전화번호 */
  phone?: string;
  /** 마지막 로그인 시간 */
  lastLoginAt?: string;
  /** 계정 상태 (active, inactive, suspended) */
  status?: 'active' | 'inactive' | 'suspended';
  /** 계정 생성 시간 */
  createdAt?: string;
  /** 계정 수정 시간 */
  updatedAt?: string;
}

/**
 * 사용자 인증 정보 인터페이스
 * 로그인 및 인증에 필요한 정보를 정의합니다.
 */
export interface UserAuth {
  /** 사용자 ID */
  userId: string;
  /** 비밀번호 (해시된 형태로 저장) */
  password?: string;
  /** JWT 토큰 */
  token?: string;
  /** 토큰 만료 시간 */
  tokenExpiry?: string;
  /** 리프레시 토큰 */
  refreshToken?: string;
  /** 2단계 인증 사용 여부 */
  twoFactorEnabled?: boolean;
  /** 2단계 인증 비밀키 */
  twoFactorSecret?: string;
  /** 마지막 비밀번호 변경 시간 */
  passwordChangedAt?: string;
  /** 비밀번호 재설정 토큰 */
  resetPasswordToken?: string;
  /** 비밀번호 재설정 토큰 만료 시간 */
  resetPasswordExpiry?: string;
}

/**
 * 사용자 권한 인터페이스
 * 사용자의 권한 정보를 정의합니다.
 */
export interface UserPermission {
  /** 사용자 ID */
  userId: string;
  /** 권한 목록 */
  permissions: string[];
  /** 역할 (admin, merchant, staff 등) */
  role: 'admin' | 'merchant' | 'staff';
  /** 권한 그룹 ID */
  permissionGroupId?: string;
}
