/**
 * uc2dcuc2a4ud15c uc124uc815 uc778ud130ud398uc774uc2a4
 * uc2dcuc2a4ud15c uad00ub9ac uc124uc815 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface SystemSetting {
  /** uc124uc815 ID */
  settingId: string;
  /** uc124uc815 uc774ub984 */
  name: string;
  /** uc124uc815 ucf54ub4dc */
  code: string;
  /** uc124uc815 uac12 */
  value: string;
  /** uc124uc815 uc720ud615 (string, number, boolean, json) */
  type: 'string' | 'number' | 'boolean' | 'json';
  /** uc124uc815 uadf8ub8f9 */
  group: string;
  /** uc124uc815 uc124uba85 */
  description?: string;
  /** uc124uc815 uacf5uac1c uc5ecubd80 */
  isPublic: boolean;
  /** uc124uc815 uc21cuc11c */
  order?: number;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
  /** uc218uc815uc790 ID */
  updatedBy?: string;
}

/**
 * uc54cub9bc uc778ud130ud398uc774uc2a4
 * uc2dcuc2a4ud15c uc54cub9bc uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface Notification {
  /** uc54cub9bc ID */
  notificationId: string;
  /** uc54cub9bc uc81cub8c9 */
  title: string;
  /** uc54cub9bc ub0b4uc6a9 */
  content: string;
  /** uc54cub9bc uc720ud615 (system, payment, account, security, etc) */
  type: string;
  /** uc54cub9bc uc911uc694ub3c4 (info, warning, error, critical) */
  severity: 'info' | 'warning' | 'error' | 'critical';
  /** uc54cub9bc ub300uc0c1 uc0acuc6a9uc790 ID */
  userId?: string;
  /** uc54cub9bc ub300uc0c1 uac00ub9f9uc810 ID */
  merchantId?: string;
  /** uc54cub9bc uc0c1ud0dc (unread, read, archived) */
  status: 'unread' | 'read' | 'archived';
  /** uc54cub9bc uc804uc1a1 uc720ud615 (in-app, email, sms, push) */
  channel: 'in-app' | 'email' | 'sms' | 'push';
  /** uc54cub9bc uc804uc1a1 uc2dcuac04 */
  sentAt: string;
  /** uc54cub9bc uc77duc74c uc2dcuac04 */
  readAt?: string;
  /** uc54cub9bc uc804uc1a1 uc2e4ud328 uc5ecubd80 */
  isFailed?: boolean;
  /** uc54cub9bc uc804uc1a1 uc2e4ud328 uc0acuc720 */
  failureReason?: string;
  /** uc54cub9bc uad00ub828 ub370uc774ud130 */
  data?: Record<string, any>;
  /** uc54cub9bc uad00ub828 uacbd ub85c */
  actionUrl?: string;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
}

/**
 * uc54cub9bc ud15cucb7c uc778ud130ud398uc774uc2a4
 * uc2dcuc2a4ud15c uc54cub9bc ud15cucb7c uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface NotificationTemplate {
  /** ud15cucb7c ID */
  templateId: string;
  /** ud15cucb7c uc774ub984 */
  name: string;
  /** ud15cucb7c ucf54ub4dc */
  code: string;
  /** ud15cucb7c uc81cub8c9 */
  title: string;
  /** ud15cucb7c ub0b4uc6a9 */
  content: string;
  /** ud15cucb7c uc720ud615 (email, sms, push, in-app) */
  type: 'email' | 'sms' | 'push' | 'in-app';
  /** ud15cucb7c uc5b8uc5b4 */
  language: string;
  /** ud15cucb7c uc124uba85 */
  description?: string;
  /** ud15cucb7c uc0acuc6a9 uc5ecubd80 */
  isActive: boolean;
  /** ud15cucb7c ubcc0uc218 uc815uc758 */
  variables?: string[];
  /** ud15cucb7c HTML uc0acuc6a9 uc5ecubd80 */
  useHtml?: boolean;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
  /** uc218uc815uc790 ID */
  updatedBy?: string;
}

/**
 * uc2dcuc2a4ud15c ub85cuadf8 uc778ud130ud398uc774uc2a4
 * uc2dcuc2a4ud15c ub85cuadf8 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface SystemLog {
  /** ub85cuadf8 ID */
  logId: string;
  /** ub85cuadf8 ub808ubca8 (debug, info, warn, error, fatal) */
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  /** ub85cuadf8 uba54uc2dcuc9c0 */
  message: string;
  /** ub85cuadf8 uc2dcuac04 */
  timestamp: string;
  /** ub85cuadf8 uc18cuc2a4 */
  source: string;
  /** ub85cuadf8 uad00ub828 uc0acuc6a9uc790 ID */
  userId?: string;
  /** ub85cuadf8 uad00ub828 uac00ub9f9uc810 ID */
  merchantId?: string;
  /** ub85cuadf8 uad00ub828 IP uc8fcuc18c */
  ipAddress?: string;
  /** ub85cuadf8 uad00ub828 uc138ubd80 uc815ubcf4 */
  details?: Record<string, any>;
  /** ub85cuadf8 uc2a4ud0dd ud2b8ub808uc774uc2a4 */
  stackTrace?: string;
  /** ub85cuadf8 uad00ub828 uc694uccad ID */
  requestId?: string;
}

/**
 * uac10uc0ac ub85cuadf8 uc778ud130ud398uc774uc2a4
 * uc2dcuc2a4ud15c uac10uc0ac ub85cuadf8 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface AuditLog {
  /** uac10uc0ac ub85cuadf8 ID */
  auditId: string;
  /** uc0acuc6a9uc790 ID */
  userId: string;
  /** uc0acuc6a9uc790 uc774ub984 */
  userName: string;
  /** uac00ub9f9uc810 ID */
  merchantId?: string;
  /** uc791uc5c5 uc720ud615 (create, read, update, delete, login, logout, etc) */
  action: string;
  /** uc791uc5c5 ub300uc0c1 (user, merchant, transaction, etc) */
  target: string;
  /** uc791uc5c5 ub300uc0c1 ID */
  targetId?: string;
  /** uc791uc5c5 uc804 ub370uc774ud130 */
  beforeData?: Record<string, any>;
  /** uc791uc5c5 ud6c4 ub370uc774ud130 */
  afterData?: Record<string, any>;
  /** uc791uc5c5 uc2dcuac04 */
  timestamp: string;
  /** uc791uc5c5 IP uc8fcuc18c */
  ipAddress: string;
  /** uc0acuc6a9uc790 uc5d0uc774uc804ud2b8 */
  userAgent?: string;
  /** uc791uc5c5 uc131uacf5 uc5ecubd80 */
  success: boolean;
  /** uc791uc5c5 uc2e4ud328 uc0acuc720 */
  failureReason?: string;
  /** uc791uc5c5 uc138ubd80 uc815ubcf4 */
  details?: Record<string, any>;
  /** uc791uc5c5 uad00ub828 uc694uccad ID */
  requestId?: string;
}

/**
 * ubc31uc5c5 uc778ud130ud398uc774uc2a4
 * uc2dcuc2a4ud15c ubc31uc5c5 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface Backup {
  /** ubc31uc5c5 ID */
  backupId: string;
  /** ubc31uc5c5 uc774ub984 */
  name: string;
  /** ubc31uc5c5 uc720ud615 (full, incremental, differential) */
  type: 'full' | 'incremental' | 'differential';
  /** ubc31uc5c5 uc0c1ud0dc (pending, completed, failed) */
  status: 'pending' | 'completed' | 'failed';
  /** ubc31uc5c5 ud30cuc77c uacbd ub85c */
  filePath: string;
  /** ubc31uc5c5 ud30cuc77c ud06cuae30 (bytes) */
  fileSize: number;
  /** ubc31uc5c5 ud30cuc77c ud574uc2dc */
  fileHash?: string;
  /** ubc31uc5c5 uc2dcuc791 uc2dcuac04 */
  startedAt: string;
  /** ubc31uc5c5 uc644ub8cc uc2dcuac04 */
  completedAt?: string;
  /** ubc31uc5c5 uc2e4ud328 uc0acuc720 */
  failureReason?: string;
  /** ubc31uc5c5 uc694uccaduc790 ID */
  requestedBy?: string;
  /** ubc31uc5c5 uc124uba85 */
  description?: string;
  /** ubc31uc5c5 uba54ud0c0ub370uc774ud130 */
  metadata?: Record<string, any>;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
}

/**
 * uc2a4ucf00uc904 uc791uc5c5 uc778ud130ud398uc774uc2a4
 * uc2dcuc2a4ud15c uc2a4ucf00uc904 uc791uc5c5 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface ScheduledTask {
  /** uc791uc5c5 ID */
  taskId: string;
  /** uc791uc5c5 uc774ub984 */
  name: string;
  /** uc791uc5c5 uc720ud615 */
  type: string;
  /** uc791uc5c5 uc0c1ud0dc (scheduled, running, completed, failed, canceled) */
  status: 'scheduled' | 'running' | 'completed' | 'failed' | 'canceled';
  /** uc791uc5c5 uc2a4ucf00uc904 (cron ud45cud604uc2dd) */
  schedule: string;
  /** uc791uc5c5 ub370uc774ud130 */
  data?: Record<string, any>;
  /** uc791uc5c5 ub9c8uc9c0ub9c9 uc2e4ud589 uc2dcuac04 */
  lastRunAt?: string;
  /** uc791uc5c5 ub2e4uc74c uc2e4ud589 uc608uc815 uc2dcuac04 */
  nextRunAt?: string;
  /** uc791uc5c5 uc2e4ud589 ud69fuc218 */
  runCount: number;
  /** uc791uc5c5 uc2e4ud328 ud69fuc218 */
  failCount: number;
  /** uc791uc5c5 ub9c8uc9c0ub9c9 uc2e4ud328 uc0acuc720 */
  lastFailureReason?: string;
  /** uc791uc5c5 ud65cuc131ud654 uc5ecubd80 */
  isActive: boolean;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
  /** uc218uc815uc790 ID */
  updatedBy?: string;
}
