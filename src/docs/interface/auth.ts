/**
 * uc778uc99d uc778ud130ud398uc774uc2a4
 * uc0acuc6a9uc790 uc778uc99d uad00ub828 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface Authentication {
  /** uc778uc99d ID */
  authId: string;
  /** uc0acuc6a9uc790 ID */
  userId: string;
  /** uc778uc99d uc720ud615 (password, oauth, token, etc) */
  authType: 'password' | 'oauth' | 'token' | 'otp' | 'certificate';
  /** uc778uc99d uc0c1ud0dc (active, inactive, locked, expired) */
  status: 'active' | 'inactive' | 'locked' | 'expired';
  /** uc778uc99d uc2dcuac04 */
  authenticatedAt?: string;
  /** uc778uc99d ub9ccub8ccuc2dcuac04 */
  expiresAt?: string;
  /** uc778uc99d uc2e4ud328 ud69fuc218 */
  failedAttempts: number;
  /** uc778uc99d uc2e4ud328 ucd5cuadfc uc2dcuac04 */
  lastFailedAt?: string;
  /** uc778uc99d uc7acuc124uc815 uc694uccad uc2dcuac04 */
  resetRequestedAt?: string;
  /** uc778uc99d uc7acuc124uc815 ud1a0ud070 */
  resetToken?: string;
  /** uc778uc99d uc7acuc124uc815 ud1a0ud070 ub9ccub8ccuc2dcuac04 */
  resetTokenExpiresAt?: string;
  /** uc778uc99d IP uc8fcuc18c */
  ipAddress?: string;
  /** uc778uc99d uc0acuc6a9uc790 uc5d0uc774uc804ud2b8 */
  userAgent?: string;
  /** uc778uc99d uc815ubcf4 (OAuth uc81cuc8fcuc790, ud1a0ud070 uc815ubcf4 ub4f1) */
  authInfo?: Record<string, any>;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
}

/**
 * uc138uc158 uc778ud130ud398uc774uc2a4
 * uc0acuc6a9uc790 uc138uc158 uad00ub828 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface Session {
  /** uc138uc158 ID */
  sessionId: string;
  /** uc0acuc6a9uc790 ID */
  userId: string;
  /** uc138uc158 ud1a0ud070 */
  token: string;
  /** uc138uc158 uc0c1ud0dc (active, expired, revoked) */
  status: 'active' | 'expired' | 'revoked';
  /** uc138uc158 uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc138uc158 ub9ccub8ccuc2dcuac04 */
  expiresAt: string;
  /** ub9c8uc9c0ub9c9 ud65cub3d9 uc2dcuac04 */
  lastActivityAt: string;
  /** uc138uc158 IP uc8fcuc18c */
  ipAddress: string;
  /** uc0acuc6a9uc790 uc5d0uc774uc804ud2b8 */
  userAgent?: string;
  /** uc138uc158 uba54ud0c0ub370uc774ud130 */
  metadata?: Record<string, any>;
}

/**
 * uad8cud55c uc778ud130ud398uc774uc2a4
 * uc0acuc6a9uc790 uad8cud55c uad00ub828 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface Permission {
  /** uad8cud55c ID */
  permissionId: string;
  /** uad8cud55c uc774ub984 */
  name: string;
  /** uad8cud55c ucf54ub4dc */
  code: string;
  /** uad8cud55c uc124uba85 */
  description: string;
  /** uad8cud55c uadf8ub8f9 */
  group?: string;
  /** uc0c1uc704 uad8cud55c ID */
  parentId?: string;
  /** uad8cud55c uc21cuc11c */
  order?: number;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
}

/**
 * uc5ed ud560 uc778ud130ud398uc774uc2a4
 * uc0acuc6a9uc790 uc5ed ud560 uad00ub828 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface Role {
  /** uc5ed ud560 ID */
  roleId: string;
  /** uc5ed ud560 uc774ub984 */
  name: string;
  /** uc5ed ud560 ucf54ub4dc */
  code: string;
  /** uc5ed ud560 uc124uba85 */
  description: string;
  /** uc5ed ud560 uadf8ub8f9 */
  group?: string;
  /** uc5ed ud560 uc21cuc11c */
  order?: number;
  /** uc5ed ud560 uad8cud55c ubaa9ub85d */
  permissions?: Permission[];
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
}

/**
 * uc0acuc6a9uc790 uc5ed ud560 ub9e4ud551 uc778ud130ud398uc774uc2a4
 * uc0acuc6a9uc790uc640 uc5ed ud560 uac04uc758 uad00uacc4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface UserRole {
  /** ub9e4ud551 ID */
  userRoleId: string;
  /** uc0acuc6a9uc790 ID */
  userId: string;
  /** uc5ed ud560 ID */
  roleId: string;
  /** ub9e4ud551 uc0c1ud0dc (active, inactive) */
  status: 'active' | 'inactive';
  /** ub9e4ud551 uc2dcuc791 uc2dcuac04 */
  startAt?: string;
  /** ub9e4ud551 uc885ub8cc uc2dcuac04 */
  endAt?: string;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
}

/**
 * 2ub2e8uacc4 uc778uc99d uc778ud130ud398uc774uc2a4
 * uc0acuc6a9uc790 2ub2e8uacc4 uc778uc99d uad00ub828 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface TwoFactorAuth {
  /** 2FA ID */
  twoFactorId: string;
  /** uc0acuc6a9uc790 ID */
  userId: string;
  /** 2FA uc720ud615 (app, sms, email) */
  type: 'app' | 'sms' | 'email';
  /** 2FA ud65cuc131ud654 uc5ecubd80 */
  enabled: boolean;
  /** 2FA ube44ubc00 ud0a4 */
  secret: string;
  /** 2FA ubc31uc5c5 ucf54ub4dc */
  backupCodes?: string[];
  /** 2FA ucd5cuadfc uc0acuc6a9 uc2dcuac04 */
  lastUsedAt?: string;
  /** 2FA uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** 2FA uc218uc815 uc2dcuac04 */
  updatedAt: string;
}

/**
 * uc778uc99d ub85cuadf8 uc778ud130ud398uc774uc2a4
 * uc0acuc6a9uc790 uc778uc99d uad00ub828 ub85cuadf8 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface AuthLog {
  /** ub85cuadf8 ID */
  logId: string;
  /** uc0acuc6a9uc790 ID */
  userId: string;
  /** uc778uc99d uc720ud615 */
  authType: string;
  /** uc778uc99d uc131uacf5 uc5ecubd80 */
  success: boolean;
  /** uc778uc99d uc2dcuac04 */
  timestamp: string;
  /** uc778uc99d IP uc8fcuc18c */
  ipAddress: string;
  /** uc0acuc6a9uc790 uc5d0uc774uc804ud2b8 */
  userAgent?: string;
  /** uc778uc99d uc2e4ud328 uc0acuc720 */
  failureReason?: string;
  /** uc778uc99d uc138ubd80 uc815ubcf4 */
  details?: Record<string, any>;
}
