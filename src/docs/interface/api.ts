/**
 * API ud0a4 uc778ud130ud398uc774uc2a4
 * uac00ub9f9uc810uc774 APIub97c ud638ucd9cud558uae30 uc704ud574 uc0acuc6a9ud558ub294 uc778uc99d ud0a4 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface ApiKey {
  /** API ud0a4 ID */
  keyId: string;
  /** uac00ub9f9uc810 ID */
  merchantId: string;
  /** API ud0a4 uc774ub984 */
  name: string;
  /** API ud0a4 uac12 (uc554ud638ud654ub428) */
  key: string;
  /** API ube44ubc00ud0a4 uc694uc57duac12 (uc77cubd80ub9cc ud45cuc2dc) */
  keyPreview: string;
  /** API ud0a4 uc0c1ud0dc (active, inactive, revoked) */
  status: 'active' | 'inactive' | 'revoked';
  /** ud65cuc131ud654 uc5ecubd80 */
  enabled: boolean;
  /** ud5c8uc6a9ub41c IP uc8fcuc18c ubaa9ub85d */
  allowedIps?: string[];
  /** ud5c8uc6a9ub41c uc6d0ubcf8 ub3c4uba54uc778 */
  allowedOrigins?: string[];
  /** ud5c8uc6a9ub41c API uad8cud55c */
  permissions: string[];
  /** uc694uccad uc81cud55c (ubd84ub2f9) */
  rateLimit?: number;
  /** uc694uccad uc81cud55c uae30uac04 (ubd84) */
  rateLimitPeriod?: number;
  /** ub9ccub8ccuc77c */
  expiresAt?: string;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
  /** ub9c8uc9c0ub9c9 uc0acuc6a9 uc2dcuac04 */
  lastUsedAt?: string;
}

/**
 * API uc694uccad uc778ud130ud398uc774uc2a4
 * uc678ubd80uc5d0uc11c uc218uc2e0ub41c API uc694uccaduc5d0 ub300ud55c uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface ApiRequest {
  /** uc694uccad ID */
  requestId: string;
  /** uac00ub9f9uc810 ID */
  merchantId: string;
  /** API ud0a4 ID */
  apiKeyId: string;
  /** uc694uccad uc2dcuac04 */
  timestamp: string;
  /** uc694uccad uacbdub85c */
  path: string;
  /** HTTP uba54uc18cub4dc */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /** uc694uccad ud5e4ub354 */
  headers: Record<string, string>;
  /** uc694uccad ubcf8ubb38 */
  body?: any;
  /** uc694uccad IP uc8fcuc18c */
  ipAddress: string;
  /** uc694uccad uc0acuc6a9uc790 uc5d0uc774uc804ud2b8 */
  userAgent?: string;
  /** uc751ub2f5 uc0c1ud0dc ucf54ub4dc */
  responseStatus?: number;
  /** uc751ub2f5 uc2dcuac04 */
  responseTime?: number;
  /** uc694uccad ucc98ub9ac uc2dcuac04 (ms) */
  processingTime?: number;
  /** uc694uccad uc131uacf5 uc5ecubd80 */
  success?: boolean;
  /** uc624ub958 uba54uc2dcuc9c0 */
  errorMessage?: string;
  /** uc624ub958 ucf54ub4dc */
  errorCode?: string;
}

/**
 * API uc751ub2f5 uc778ud130ud398uc774uc2a4
 * API uc694uccaduc5d0 ub300ud55c uc751ub2f5 ud615uc2dduc744 uc815uc758ud569ub2c8ub2e4.
 */
export interface ApiResponse<T = any> {
  /** uc131uacf5 uc5ecubd80 */
  success: boolean;
  /** uc0c1ud0dc ucf54ub4dc */
  statusCode: number;
  /** uc751ub2f5 uba54uc2dcuc9c0 */
  message: string;
  /** uc751ub2f5 ub370uc774ud130 */
  data?: T;
  /** uc624ub958 ucf54ub4dc */
  errorCode?: string;
  /** uc624ub958 uc0c1uc138 uc815ubcf4 */
  errors?: Record<string, string[]>;
  /** uc694uccad ID (ucd94uc801uc6a9) */
  requestId?: string;
  /** ud398uc774uc9c0ub124uc774uc158 uc815ubcf4 */
  pagination?: {
    /** ud604uc7ac ud398uc774uc9c0 */
    page: number;
    /** ud398uc774uc9c0 ud06cuae30 */
    pageSize: number;
    /** ucd1d ud398uc774uc9c0 uc218 */
    totalPages: number;
    /** ucd1d ud56dubaa9 uc218 */
    totalItems: number;
    /** ub2e4uc74c ud398uc774uc9c0 uc5ecubd80 */
    hasNext: boolean;
    /** uc774uc804 ud398uc774uc9c0 uc5ecubd80 */
    hasPrev: boolean;
  };
  /** uc751ub2f5 uc0dduc131 uc2dcuac04 */
  timestamp: string;
}

/**
 * uc6f9ud6c8 uc124uc815 uc778ud130ud398uc774uc2a4
 * uac00ub9f9uc810uc758 uc6f9ud6c8 uc124uc815 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface WebhookConfig {
  /** uc6f9ud6c8 uc124uc815 ID */
  webhookId: string;
  /** uac00ub9f9uc810 ID */
  merchantId: string;
  /** uc6f9ud6c8 URL */
  url: string;
  /** uc6f9ud6c8 uc774ub984 */
  name: string;
  /** uc6f9ud6c8 uc124uba85 */
  description?: string;
  /** ud65cuc131ud654 uc5ecubd80 */
  enabled: boolean;
  /** uc6f9ud6c8 uc2dcud06cub9bf ud0a4 */
  secretKey: string;
  /** uc6f9ud6c8 uc774ubca4ud2b8 uc720ud615 */
  events: string[];
  /** uc7acuc804uc1a1 uc2dcub3c4 ud69fuc218 */
  maxRetries: number;
  /** uc7acuc804uc1a1 uac04uaca9 (ucd08) */
  retryInterval: number;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
  /** ub9c8uc9c0ub9c9 ud638ucd9c uc2dcuac04 */
  lastCalledAt?: string;
  /** ub9c8uc9c0ub9c9 uc131uacf5 uc2dcuac04 */
  lastSuccessAt?: string;
  /** ub9c8uc9c0ub9c9 uc2e4ud328 uc2dcuac04 */
  lastFailureAt?: string;
}

/**
 * uc6f9ud6c8 uc774ubca4ud2b8 uc778ud130ud398uc774uc2a4
 * uac00ub9f9uc810uc5d0uac8c uc804uc1a1ub418ub294 uc6f9ud6c8 uc774ubca4ud2b8 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface WebhookEvent {
  /** uc774ubca4ud2b8 ID */
  eventId: string;
  /** uac00ub9f9uc810 ID */
  merchantId: string;
  /** uc6f9ud6c8 uc124uc815 ID */
  webhookId: string;
  /** uc774ubca4ud2b8 uc720ud615 */
  eventType: string;
  /** uc774ubca4ud2b8 ub370uc774ud130 */
  data: any;
  /** uc774ubca4ud2b8 ubc1cuc0dd uc2dcuac04 */
  timestamp: string;
  /** uc804uc1a1 uc0c1ud0dc */
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  /** uc804uc1a1 uc2dcuac04 */
  sentAt?: string;
  /** uc751ub2f5 uc0c1ud0dc ucf54ub4dc */
  responseStatus?: number;
  /** uc751ub2f5 ubcf8ubb38 */
  responseBody?: string;
  /** uc2dcub3c4 ud69fuc218 */
  attempts: number;
  /** ub2e4uc74c uc2dcub3c4 uc608uc815 uc2dcuac04 */
  nextRetryAt?: string;
  /** uc2e4ud328 uc0acuc720 */
  failureReason?: string;
}
