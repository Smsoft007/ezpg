/**
 * uacb0uc81c uc778ud130ud398uc774uc2a4
 * uacb0uc81c uc2dcuc2a4ud15cuc5d0uc11c uc0acuc6a9ub418ub294 uacb0uc81c uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface Payment {
  /** uacb0uc81c ID */
  paymentId: string;
  /** uac00ub9f9uc810 ID */
  merchantId: string;
  /** uacb0uc81c uae08uc561 */
  amount: number;
  /** ud1b5ud654 (KRW, USD ub4f1) */
  currency: string;
  /** uacb0uc81c uc0c1ud0dc (pending, completed, failed, canceled, refunded) */
  status: 'pending' | 'completed' | 'failed' | 'canceled' | 'refunded';
  /** uacb0uc81c uc720ud615 (card, bank, virtual, mobile, etc) */
  paymentMethod: string;
  /** uacb0uc81c ucc98ub9ac uc2dcuac04 */
  processedAt?: string;
  /** uacb0uc81c uc644ub8cc uc2dcuac04 */
  completedAt?: string;
  /** uacb0uc81c uc694uccad uc2dcuac04 */
  requestedAt: string;
  /** uacb0uc81c uc124uba85 */
  description?: string;
  /** uace0uac1d uc774uba54uc77c */
  customerEmail?: string;
  /** uace0uac1d uc804ud654ubc88ud638 */
  customerPhone?: string;
  /** uace0uac1d uc774ub984 */
  customerName?: string;
  /** uace0uac1d ID */
  customerId?: string;
  /** uc8fc ubb38 ID */
  orderId?: string;
  /** uc8fc ubb38 uc815ubcf4 */
  orderInfo?: Record<string, any>;
  /** uacb0uc81c uc218uc218ub8cc */
  fee?: number;
  /** uc678ubd80 uacb0uc81c ucc38uc870ubc88ud638 */
  externalId?: string;
  /** uc0acuc6a9uc790 uc815uc758 uba54ud0c0ub370uc774ud130 */
  metadata?: Record<string, any>;
  /** uacb0uc81c IP uc8fcuc18c */
  ipAddress?: string;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
}

/**
 * uce74ub4dc uacb0uc81c uc778ud130ud398uc774uc2a4
 * uce74ub4dc uacb0uc81c uad00ub828 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface CardPayment extends Payment {
  /** uce74ub4dc ubc88ud638 (ub9c8uc2a4ud0b9 ucc98ub9ac) */
  cardNumber: string;
  /** uce74ub4dc uc720ud615 (visa, mastercard, amex, etc) */
  cardType: string;
  /** uce74ub4dc ubc1cud589uc0ac */
  cardIssuer: string;
  /** uce74ub4dc uc18cuc720uc790 uc774ub984 */
  cardHolderName?: string;
  /** uce74ub4dc ub9ccub8ccuc77c (MM/YY) */
  cardExpiry?: string;
  /** uce74ub4dc ud604uae08ud654 uc5ecubd80 */
  isCashReceipt?: boolean;
  /** ud604uae08uc601uc218uc99d ubc88ud638 */
  cashReceiptNumber?: string;
  /** ud604uae08uc601uc218uc99d uc720ud615 (personal, business) */
  cashReceiptType?: 'personal' | 'business';
  /** uc778uc99duc815ubcf4 (3DS, etc) */
  authenticationInfo?: Record<string, any>;
  /** uc778uc99d ubc29ubc95 */
  authMethod?: string;
  /** uc778uc99d ucf54ub4dc */
  authCode?: string;
  /** uc778uc99d uc2dcuac04 */
  authTime?: string;
  /** uc778uc99d uc2e4ud328 uc0acuc720 */
  authFailReason?: string;
  /** uc778uc99d uc2dcub3c4 ud69fuc218 */
  authAttempts?: number;
  /** uc778uc99d uc694uccad ID */
  authRequestId?: string;
}

/**
 * uacc4uc88c uc774uccb4 uacb0uc81c uc778ud130ud398uc774uc2a4
 * uacc4uc88c uc774uccb4 uacb0uc81c uad00ub828 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface BankTransferPayment extends Payment {
  /** uc740ud589 ucf54ub4dc */
  bankCode: string;
  /** uc740ud589 uc774ub984 */
  bankName: string;
  /** uacc4uc88cubc88ud638 */
  accountNumber: string;
  /** uacc4uc88c uc608uae08uc8fc */
  accountHolder: string;
  /** uc774uccb4 ucc38uc870ubc88ud638 */
  transferReference?: string;
  /** uc774uccb4 uc644ub8cc uc2dcuac04 */
  transferCompletedAt?: string;
  /** uc774uccb4 ud655uc778 uc2dcuac04 */
  transferVerifiedAt?: string;
  /** uc774uccb4 uc2e4ud328 uc0acuc720 */
  transferFailReason?: string;
}

/**
 * uac00uc0c1uacc4uc88c uacb0uc81c uc778ud130ud398uc774uc2a4
 * uac00uc0c1uacc4uc88c uacb0uc81c uad00ub828 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface VirtualAccountPayment extends Payment {
  /** uac00uc0c1uacc4uc88c ID */
  virtualAccountId: string;
  /** uac00uc0c1uacc4uc88cubc88ud638 */
  accountNumber: string;
  /** uc740ud589 ucf54ub4dc */
  bankCode: string;
  /** uc740ud589 uc774ub984 */
  bankName: string;
  /** uacc4uc88c uc608uae08uc8fc */
  accountHolder: string;
  /** uc785uae08uc790 uc774ub984 */
  depositorName?: string;
  /** uc785uae08 uc2dcuac04 */
  depositedAt?: string;
  /** uc785uae08 ud655uc778 uc2dcuac04 */
  verifiedAt?: string;
  /** uc785uae08 uc2e4ud328 uc0acuc720 */
  depositFailReason?: string;
  /** uc785uae08 uc54cub9bc uc804uc1a1 uc5ecubd80 */
  notificationSent?: boolean;
  /** uc785uae08 uc54cub9bc uc804uc1a1 uc2dcuac04 */
  notificationSentAt?: string;
  /** ub9ccub8ccuc77c */
  expiryDate?: string;
}

/**
 * ubaa8ubc14uc77c uacb0uc81c uc778ud130ud398uc774uc2a4
 * ubaa8ubc14uc77c uacb0uc81c uad00ub828 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface MobilePayment extends Payment {
  /** ubaa8ubc14uc77c uacb0uc81c uc720ud615 (phone, kakao, payco, etc) */
  mobilePaymentType: string;
  /** ubaa8ubc14uc77c ubc88ud638 */
  phoneNumber?: string;
  /** uacb0uc81c uc778uc99d ucf54ub4dc */
  authCode?: string;
  /** uacb0uc81c uc778uc99d uc2dcuac04 */
  authTime?: string;
  /** uacb0uc81c uc778uc99d uc2e4ud328 uc0acuc720 */
  authFailReason?: string;
  /** uacb0uc81c uc778uc99d uc2dcub3c4 ud69fuc218 */
  authAttempts?: number;
  /** uc678ubd80 uacb0uc81c uc815ubcf4 */
  externalPaymentInfo?: Record<string, any>;
}

/**
 * ud658ubd88 uc778ud130ud398uc774uc2a4
 * uacb0uc81c ud658ubd88 uad00ub828 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface Refund {
  /** ud658ubd88 ID */
  refundId: string;
  /** uacb0uc81c ID */
  paymentId: string;
  /** uac00ub9f9uc810 ID */
  merchantId: string;
  /** ud658ubd88 uae08uc561 */
  amount: number;
  /** ud658ubd88 uc0c1ud0dc (pending, completed, failed) */
  status: 'pending' | 'completed' | 'failed';
  /** ud658ubd88 uc0acuc720 */
  reason: string;
  /** ud658ubd88 uc720ud615 (full, partial) */
  type: 'full' | 'partial';
  /** ud658ubd88 uc694uccad uc2dcuac04 */
  requestedAt: string;
  /** ud658ubd88 ucc98ub9ac uc2dcuac04 */
  processedAt?: string;
  /** ud658ubd88 uc644ub8cc uc2dcuac04 */
  completedAt?: string;
  /** ud658ubd88 uc694uccaduc790 ID */
  requestedBy: string;
  /** ud658ubd88 uc2b9uc778uc790 ID */
  approvedBy?: string;
  /** ud658ubd88 uc2e4ud328 uc0acuc720 */
  failureReason?: string;
  /** ud658ubd88 uc218uc218ub8cc */
  refundFee?: number;
  /** uc678ubd80 ud658ubd88 ID */
  externalRefundId?: string;
  /** uc0acuc6a9uc790 uc815uc758 uba54ud0c0ub370uc774ud130 */
  metadata?: Record<string, any>;
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
}

/**
 * uacb0uc81c uc124uc815 uc778ud130ud398uc774uc2a4
 * uac00ub9f9uc810uc758 uacb0uc81c uad00ub828 uc124uc815 uc815ubcf4ub97c uc815uc758ud569ub2c8ub2e4.
 */
export interface PaymentSettings {
  /** uc124uc815 ID */
  settingId: string;
  /** uac00ub9f9uc810 ID */
  merchantId: string;
  /** uc0acuc6a9 uac00ub2a5ud55c uacb0uc81c uc218ub2e8 */
  enabledPaymentMethods: string[];
  /** uc790ub3d9 uacb0uc81c uc2b9uc778 uc5ecubd80 */
  autoApproval: boolean;
  /** uc790ub3d9 ud658ubd88 uc5ecubd80 */
  autoRefund: boolean;
  /** uc790ub3d9 ud658ubd88 uc81cud55c uc2dcuac04 (uc2dcuac04) */
  autoRefundTimeLimit?: number;
  /** ucd5cuc18c uacb0uc81c uae08uc561 */
  minimumPaymentAmount?: number;
  /** ucd5cuace0 uacb0uc81c uae08uc561 */
  maximumPaymentAmount?: number;
  /** 3DS uc778uc99d uc0acuc6a9 uc5ecubd80 */
  use3DSecure: boolean;
  /** uc804uc790uc138uae08uacc4uc0b0uc11c uc0acuc6a9 uc5ecubd80 */
  useEReceipt: boolean;
  /** uacb0uc81c uc2b9uc778 uc54cub9bc uc124uc815 */
  notificationSettings: {
    /** uc774uba54uc77c uc54cub9bc uc0acuc6a9 uc5ecubd80 */
    useEmailNotification: boolean;
    /** SMS uc54cub9bc uc0acuc6a9 uc5ecubd80 */
    useSmsNotification: boolean;
    /** uc6f9ud6c8 uc54cub9bc uc0acuc6a9 uc5ecubd80 */
    useWebhookNotification: boolean;
    /** uc54cub9bc ubc1buac00ub294 uc774uba54uc77c */
    notificationEmails?: string[];
    /** uc54cub9bc ubc1buac00ub294 uc804ud654ubc88ud638 */
    notificationPhones?: string[];
  };
  /** uc0dduc131 uc2dcuac04 */
  createdAt: string;
  /** uc218uc815 uc2dcuac04 */
  updatedAt: string;
}
