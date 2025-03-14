/**
 * 가상계좌 결제 인터페이스
 * 가상계좌 결제 관련 정보를 정의합니다.
 */
export interface VirtualAccountPayment {
  /** 가상계좌 ID */
  virtualAccountId: string;
  /** 가상계좌번호 */
  accountNumber: string;
  /** 은행 코드 */
  bankCode: string;
  /** 은행 이름 */
  bankName: string;
  /** 계좌 예금주 */
  accountHolder: string;
  /** 입금자 이름 */
  depositorName?: string;
  /** 입금 시간 */
  depositedAt?: string;
  /** 입금 확인 시간 */
  verifiedAt?: string;
  /** 입금 실패 사유 */
  depositFailReason?: string;
  /** 입금 알림 전송 여부 */
  notificationSent?: boolean;
  /** 입금 알림 전송 시간 */
  notificationSentAt?: string;
  /** 만료일 */
  expiryDate?: string;
}
