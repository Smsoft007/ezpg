/**
 * 정산 관련 데이터베이스 프로시저 호출 모듈
 */
import { executeProcedure, executeQuery } from '@/db';
import { SettlementCycleType, SettlementFeeType, SettlementStatus } from '@/docs/api/settlement';

interface SettlementData {
  settlementId: string;
  merchantId: string;
  status: SettlementStatus;
  amount: number;
  fee: number;
  netAmount: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  description?: string;
  createdAt: Date;
  scheduledAt?: Date;
  processedAt?: Date;
  failReason?: string;
}

interface SettlementSummaryData {
  settlementId: string;
  merchantId: string;
  businessName: string;
  status: SettlementStatus;
  amount: number;
  fee: number;
  netAmount: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  createdAt: Date;
  scheduledAt?: Date;
  processedAt?: Date;
}

interface SettlementScheduleData {
  scheduleId: string;
  merchantId: string;
  cycleType: SettlementCycleType;
  dayOfWeek?: number;
  dayOfMonth?: number;
  minAmount?: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SettlementFeeConfigData {
  configId: string;
  merchantId: string;
  feeType: SettlementFeeType;
  feeValue: number;
  minFee?: number;
  maxFee?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 정산 목록을 조회합니다.
 */
export async function getSettlements(params: {
  merchantId?: string;
  startDate?: string;
  endDate?: string;
  status?: SettlementStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}): Promise<{ settlements: SettlementSummaryData[]; total: number }> {
  const result = await executeProcedure<SettlementSummaryData & { TotalCount: number }>('sp_GetSettlements', {
    MerchantId: params.merchantId || null,
    StartDate: params.startDate || null,
    EndDate: params.endDate || null,
    Status: params.status || null,
    PageNumber: params.page || 1,
    PageSize: params.limit || 10,
    SortBy: params.sortBy || 'createdAt',
    SortOrder: params.sortOrder || 'DESC'
  });

  const total = result.length > 0 ? result[0].TotalCount : 0;
  return {
    settlements: result.map(item => ({
      settlementId: item.settlementId,
      merchantId: item.merchantId,
      businessName: item.businessName,
      status: item.status as SettlementStatus,
      amount: item.amount,
      fee: item.fee,
      netAmount: item.netAmount,
      bankCode: item.bankCode,
      accountNumber: item.accountNumber,
      accountHolder: item.accountHolder,
      createdAt: item.createdAt,
      scheduledAt: item.scheduledAt,
      processedAt: item.processedAt
    })),
    total
  };
}

/**
 * 정산 상세 정보를 조회합니다.
 */
export async function getSettlementById(settlementId: string): Promise<SettlementData | null> {
  const result = await executeProcedure<SettlementData>('sp_GetSettlementById', {
    SettlementId: settlementId
  });

  if (result.length === 0) {
    return null;
  }

  return {
    ...result[0],
    status: result[0].status as SettlementStatus
  };
}

/**
 * 새로운 정산을 생성합니다.
 */
export async function createSettlement(data: {
  merchantId: string;
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  description?: string;
}): Promise<SettlementData> {
  const result = await executeProcedure<SettlementData>('sp_CreateSettlement', {
    MerchantId: data.merchantId,
    Amount: data.amount,
    BankCode: data.bankCode,
    AccountNumber: data.accountNumber,
    AccountHolder: data.accountHolder,
    Description: data.description || null
  });

  return {
    ...result[0],
    status: result[0].status as SettlementStatus
  };
}

/**
 * 정산 상태를 업데이트합니다.
 */
export async function updateSettlementStatus(
  settlementId: string,
  status: SettlementStatus,
  failReason?: string
): Promise<SettlementData> {
  const result = await executeProcedure<SettlementData>('sp_UpdateSettlementStatus', {
    SettlementId: settlementId,
    Status: status,
    FailReason: failReason || null
  });

  return {
    ...result[0],
    status: result[0].status as SettlementStatus
  };
}

/**
 * 정산 일정을 조회합니다.
 */
export async function getSettlementSchedule(merchantId: string): Promise<SettlementScheduleData | null> {
  const result = await executeProcedure<SettlementScheduleData>('sp_GetSettlementSchedule', {
    MerchantId: merchantId
  });

  if (result.length === 0) {
    return null;
  }

  return {
    ...result[0],
    cycleType: result[0].cycleType as SettlementCycleType
  };
}

/**
 * 정산 일정을 생성하거나 업데이트합니다.
 */
export async function createOrUpdateSettlementSchedule(data: {
  merchantId: string;
  cycleType: SettlementCycleType;
  dayOfWeek?: number;
  dayOfMonth?: number;
  minAmount?: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}): Promise<SettlementScheduleData> {
  const result = await executeProcedure<SettlementScheduleData>('sp_CreateOrUpdateSettlementSchedule', {
    MerchantId: data.merchantId,
    CycleType: data.cycleType,
    DayOfWeek: data.dayOfWeek || null,
    DayOfMonth: data.dayOfMonth || null,
    MinAmount: data.minAmount || null,
    BankCode: data.bankCode,
    AccountNumber: data.accountNumber,
    AccountHolder: data.accountHolder
  });

  return {
    ...result[0],
    cycleType: result[0].cycleType as SettlementCycleType
  };
}

/**
 * 정산 수수료 설정을 조회합니다.
 */
export async function getSettlementFeeConfig(merchantId: string): Promise<SettlementFeeConfigData | null> {
  const result = await executeProcedure<SettlementFeeConfigData>('sp_GetSettlementFeeConfig', {
    MerchantId: merchantId
  });

  if (result.length === 0) {
    return null;
  }

  return {
    ...result[0],
    feeType: result[0].feeType as SettlementFeeType
  };
}

/**
 * 정산 수수료 설정을 생성하거나 업데이트합니다.
 */
export async function createOrUpdateSettlementFeeConfig(data: {
  merchantId: string;
  feeType: SettlementFeeType;
  feeValue: number;
  minFee?: number;
  maxFee?: number;
}): Promise<SettlementFeeConfigData> {
  const result = await executeProcedure<SettlementFeeConfigData>('sp_CreateOrUpdateSettlementFeeConfig', {
    MerchantId: data.merchantId,
    FeeType: data.feeType,
    FeeValue: data.feeValue,
    MinFee: data.minFee || null,
    MaxFee: data.maxFee || null
  });

  return {
    ...result[0],
    feeType: result[0].feeType as SettlementFeeType
  };
}

/**
 * 정산 데이터를 직접 수정합니다. (관리자 전용)
 */
export async function directUpdateSettlement(
  settlementId: string,
  data: Partial<Omit<SettlementData, 'settlementId' | 'createdAt'>>
): Promise<SettlementData> {
  const updateFields: Record<string, any> = {};
  
  // 수정 가능한 필드만 추출
  if (data.status) updateFields.Status = data.status;
  if (data.amount !== undefined) updateFields.Amount = data.amount;
  if (data.fee !== undefined) updateFields.Fee = data.fee;
  if (data.netAmount !== undefined) updateFields.NetAmount = data.netAmount;
  if (data.bankCode) updateFields.BankCode = data.bankCode;
  if (data.accountNumber) updateFields.AccountNumber = data.accountNumber;
  if (data.accountHolder) updateFields.AccountHolder = data.accountHolder;
  if (data.description !== undefined) updateFields.Description = data.description;
  if (data.scheduledAt) updateFields.ScheduledAt = data.scheduledAt;
  if (data.processedAt) updateFields.ProcessedAt = data.processedAt;
  if (data.failReason !== undefined) updateFields.FailReason = data.failReason;

  const result = await executeProcedure<SettlementData>('sp_DirectUpdateSettlement', {
    SettlementId: settlementId,
    ...updateFields
  });

  return {
    ...result[0],
    status: result[0].status as SettlementStatus
  };
}

/**
 * 정산 데이터를 삭제합니다. (관리자 전용)
 */
export async function deleteSettlement(settlementId: string): Promise<boolean> {
  const result = await executeProcedure<{ Success: boolean }>('sp_DeleteSettlement', {
    SettlementId: settlementId
  });

  return result.length > 0 ? result[0].Success : false;
}
