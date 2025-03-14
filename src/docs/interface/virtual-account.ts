/**
 * uac00uc0c1uacc4uc88c uc778ud130ud398uc774uc2a4
 * uacb0uc81c uc2dcuc2a4ud15cuc5d0uc11c uc0acuc6a9ub418ub294 uac00uc0c1uacc4uc88c uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface VirtualAccount {
  /** uac00uc0c1uacc4uc88c ID */
  accountId: string;
  /** uac00uc0c1uacc4uc88cubc88ud638 */
  accountNumber: string;
  /** uc740ud589 ucf54ub4dc */
  bankCode: string;
  /** uc740ud589 uc774ub984 */
  bankName: string;
  /** uc8fc uc5c5ubb34uc77c uc774ub984 */
  accountHolder: string;
  /** uac00ub9f9uc810 ID */
  merchantId: string;
  /** uac00uc0c1uacc4uc88c uc0c1ud0dc (active, inactive, suspended, pending, closed) */
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'closed';
  /** uac00uc0c1uacc4uc88c uc720ud615 (permanent, temporary) */
  type: 'permanent' | 'temporary';
  /** uc0acuc6a9 uc6a9ub3c4 */
  purpose?: string;
  /** ub9ccub8ccuc77c (uc784uc2dcuacc4uc88cuc778 uacbduc6b0) */
  expiryDate?: string;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
  /** ucd5cuadfc uc785uae08 uc2dcuac04 */
  lastDepositAt?: string;
}

/**
 * uc740ud589 uc815ubcf4 uc778ud130ud398uc774uc2a4
 * uc2dcuc2a4ud15cuc5d0uc11c uc9c0uc6d0ud558ub294 uc740ud589 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface Bank {
  /** uc740ud589 ucf54ub4dc */
  bankCode: string;
  /** uc740ud589 uc774ub984 */
  bankName: string;
  /** uc601ubb38 uc740ud589 uc774ub984 */
  bankNameEng?: string;
  /** uc740ud589 ub85cuace0 URL */
  logoUrl?: string;
  /** uac00uc0c1uacc4uc88c uc9c0uc6d0 uc5ecubd80 */
  supportsVirtualAccount: boolean;
  /** uc2e4uc2dcuac04 uc774uccb4 uc9c0uc6d0 uc5ecubd80 */
  supportsRealTimeTransfer: boolean;
  /** uc9c0uc6d0 uc0c1ud0dc (active, inactive, maintenance) */
  status: 'active' | 'inactive' | 'maintenance';
  /** uc5c5ubb34 uc2dcuac04 uc2dcuc791 (24uc2dcuac04 ud615uc2dd, e.g. "09:00") */
  businessHoursStart?: string;
  /** uc5c5ubb34 uc2dcuac04 uc885ub8cc (24uc2dcuac04 ud615uc2dd, e.g. "18:00") */
  businessHoursEnd?: string;
  /** uc8fc uc5c5ubb34uc77c (1-7, 1uc740 uc77cuc694uc77c) */
  businessDays?: number[];
}

/**
 * uac00uc0c1uacc4uc88c uc694uccad uc778ud130ud398uc774uc2a4
 * uc0c8ub85c uc694uccadub41c uac00uc0c1uacc4uc88c uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface VirtualAccountRequest {
  /** uc694uccad ID */
  requestId: string;
  /** uac00ub9f9uc810 ID */
  merchantId: string;
  /** uc740ud589 ucf54ub4dc */
  bankCode: string;
  /** uacc4uc88c uc608uae08uc8fc uc774ub984 */
  holderName: string;
  /** uac00uc0c1uacc4uc88c uc720ud615 (permanent, temporary) */
  type: 'permanent' | 'temporary';
  /** uc0acuc6a9 uc6a9ub3c4 */
  purpose?: string;
  /** ub9ccub8ccuc77c (uc784uc2dcuacc4uc88cuc778 uacbduc6b0) */
  expiryDate?: string;
  /** uc694uccad uc0c1ud0dc (pending, completed, failed) */
  status: 'pending' | 'completed' | 'failed';
  /** uc2e4ud328 uc0acuc720 */
  failureReason?: string;
  /** uc694uccad uc2dcuac04 */
  requestedAt: string;
  /** ucc98ub9ac uc644ub8cc uc2dcuac04 */
  completedAt?: string;
  /** uc694uccaduc790 ID */
  requestedBy: string;
  /** uc678ubd80 uc2dcuc2a4ud15c ucc38uc870 ID */
  externalId?: string;
  /** ucf5cubc31 URL */
  callbackUrl?: string;
}

/**
 * uac00uc0c1uacc4uc88c uc785uae08 uc54cub9bc uc778ud130ud398uc774uc2a4
 * uac00uc0c1uacc4uc88c uc785uae08 ubc1cuc0dd uc2dcuc758 uc54cub9bc uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface VirtualAccountNotification {
  /** uc54cub9bc ID */
  notificationId: string;
  /** uac00uc0c1uacc4uc88c ID */
  accountId: string;
  /** uac00uc0c1uacc4uc88cubc88ud638 */
  accountNumber: string;
  /** uc740ud589 ucf54ub4dc */
  bankCode: string;
  /** uac00ub9f9uc810 ID */
  merchantId: string;
  /** uc785uae08uc790 uc774ub984 */
  depositorName: string;
  /** uc785uae08 uae08uc561 */
  amount: number;
  /** uc785uae08 ucc98ub9ac uc0c1ud0dc (pending, completed, failed) */
  status: 'pending' | 'completed' | 'failed';
  /** uc785uae08 ucc98ub9ac uc2dcuac04 */
  processedAt: string;
  /** uac70ub798 ID */
  transactionId?: string;
  /** uc54cub9bc uc804uc1a1 uc0c1ud0dc (sent, failed, pending) */
  deliveryStatus: 'sent' | 'failed' | 'pending';
  /** uc54cub9bc uc804uc1a1 uc2dcuac04 */
  sentAt?: string;
  /** uc54cub9bc uc7acuc804uc1a1 uc2dcuac04 */
  retriedAt?: string;
  /** uc7acuc804uc1a1 uc2dcub3c4 ud69fuc218 */
  retryCount: number;
  /** uc54cub9bc uc804uc1a1 uc2e4ud328 uc0acuc720 */
  failureReason?: string;
}
