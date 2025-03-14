/**
 * 가맹점 관련 데이터베이스 작업
 */
import { executeQuery, executeProcedure } from '@/db/index';

/**
 * 가맹점 인터페이스
 */
export interface Merchant {
  id: number;
  name: string;
  businessNumber: string;
  representativeName: string;
  status: 'active' | 'inactive' | 'pending';
  email: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  bank: string;
  accountNumber: string;
  accountHolder: string;
  paymentFee: number;
  withdrawalFee: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 가맹점 목록 결과 인터페이스
 */
export interface MerchantsListResult {
  merchants: Merchant[];
  pagination: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * 가맹점 잔액 인터페이스
 */
export interface MerchantBalance {
  id: number;
  name: string;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  lastUpdated: string;
}

/**
 * 가맹점 거래 내역 인터페이스
 */
export interface MerchantTransaction {
  id: number;
  merchantId: number;
  type: 'deposit' | 'withdrawal';
  amount: number;
  fee: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  completedAt?: string;
  description?: string;
}

/**
 * 가맹점 목록 조회
 * @param searchParams 검색 파라미터
 */
export async function getMerchants(searchParams?: {
  name?: string;
  businessNumber?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortColumn?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<MerchantsListResult> {
  try {
    // 파라미터 준비
    const params: Record<string, any> = {
      Page: searchParams?.page || 1,
      PageSize: searchParams?.pageSize || 10,
      SortColumn: searchParams?.sortColumn || 'id',
      SortOrder: searchParams?.sortOrder || 'asc'
    };
    
    if (searchParams?.name) {
      params.SearchTerm = searchParams.name;
    }
    
    if (searchParams?.businessNumber) {
      params.BusinessNumber = searchParams.businessNumber;
    }
    
    if (searchParams?.status && searchParams.status !== 'all') {
      params.Status = searchParams.status;
    }
    
    // 프로시저 실행
    const result = await executeProcedure<any>('sp_GetMerchantList', params);
    
    // 결과 처리
    if (!result || result.length === 0) {
      return {
        merchants: [],
        pagination: {
          totalCount: 0,
          page: params.Page,
          pageSize: params.PageSize,
          totalPages: 0
        }
      };
    }
    
    // 가맹점 목록과 페이지네이션 정보 분리
    const merchants = result.filter(item => item.Id !== undefined);
    const paginationInfo = result.find(item => item.TotalCount !== undefined);
    
    return {
      merchants: merchants.map(item => ({
        id: item.Id,
        name: item.Name,
        businessNumber: item.BusinessNumber,
        representativeName: item.RepresentativeName,
        status: item.Status,
        email: item.Email,
        phone: item.Phone,
        zipCode: item.ZipCode,
        address1: item.Address1,
        address2: item.Address2,
        bank: item.BankName,
        accountNumber: item.AccountNumber,
        accountHolder: item.AccountHolder,
        paymentFee: item.PaymentFeeRate,
        withdrawalFee: item.WithdrawalFee,
        createdAt: item.JoinDate,
        updatedAt: item.UpdatedAt
      })),
      pagination: {
        totalCount: paginationInfo?.TotalCount || 0,
        page: params.Page,
        pageSize: params.PageSize,
        totalPages: paginationInfo?.TotalPages || 0
      }
    };
  } catch (error) {
    console.error('가맹점 목록 조회 중 오류가 발생했습니다:', error);
    throw error;
  }
}

/**
 * 가맹점 상세 정보 조회
 * @param id 가맹점 ID
 */
export async function getMerchantById(id: number): Promise<Merchant> {
  try {
    const result = await executeProcedure<any>('sp_GetMerchantById', { MerchantId: id });
    
    if (!result || result.length === 0) {
      throw new Error(`가맹점 ID ${id}를 찾을 수 없습니다.`);
    }
    
    const merchant = result[0];
    
    return {
      id: merchant.Id,
      name: merchant.Name,
      businessNumber: merchant.BusinessNumber,
      representativeName: merchant.RepresentativeName,
      status: merchant.Status,
      email: merchant.Email,
      phone: merchant.Phone,
      zipCode: merchant.ZipCode,
      address1: merchant.Address1,
      address2: merchant.Address2,
      bank: merchant.BankName,
      accountNumber: merchant.AccountNumber,
      accountHolder: merchant.AccountHolder,
      paymentFee: merchant.PaymentFeeRate,
      withdrawalFee: merchant.WithdrawalFee,
      createdAt: merchant.JoinDate,
      updatedAt: merchant.UpdatedAt
    };
  } catch (error) {
    console.error(`가맹점 ID ${id} 조회 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 등록
 * @param merchantData 가맹점 데이터
 */
export async function createMerchant(merchantData: {
  name: string;
  businessNumber: string;
  representativeName: string;
  status: string;
  email: string;
  phone: string;
  zipCode: string;
  address1: string;
  address2?: string;
  bank: string;
  accountNumber: string;
  accountHolder: string;
  paymentFee: number;
  withdrawalFee: number;
}): Promise<{ id: number }> {
  try {
    const result = await executeProcedure<{ Id: number }>('sp_CreateMerchant', {
      MerchantName: merchantData.name,
      BusinessNumber: merchantData.businessNumber,
      RepresentativeName: merchantData.representativeName,
      Status: merchantData.status,
      Email: merchantData.email,
      Phone: merchantData.phone,
      ZipCode: merchantData.zipCode,
      Address1: merchantData.address1,
      Address2: merchantData.address2 || '',
      BankName: merchantData.bank,
      AccountNumber: merchantData.accountNumber,
      AccountHolder: merchantData.accountHolder,
      PaymentFeeRate: merchantData.paymentFee,
      WithdrawalFee: merchantData.withdrawalFee
    });
    
    if (!result || result.length === 0) {
      throw new Error('가맹점 등록 중 오류가 발생했습니다.');
    }
    
    return { id: result[0].Id };
  } catch (error) {
    console.error('가맹점 등록 중 오류가 발생했습니다:', error);
    throw error;
  }
}

/**
 * 가맹점 정보 수정
 * @param id 가맹점 ID
 * @param merchantData 가맹점 데이터
 */
export async function updateMerchant(
  id: number,
  merchantData: {
    name: string;
    businessNumber: string;
    representativeName: string;
    status: string;
    email: string;
    phone: string;
    zipCode: string;
    address1: string;
    address2?: string;
    bank: string;
    accountNumber: string;
    accountHolder: string;
    paymentFee: number;
    withdrawalFee: number;
  }
): Promise<{ success: boolean }> {
  try {
    await executeProcedure('sp_UpdateMerchant', {
      MerchantId: id,
      MerchantName: merchantData.name,
      BusinessNumber: merchantData.businessNumber,
      RepresentativeName: merchantData.representativeName,
      Status: merchantData.status,
      Email: merchantData.email,
      Phone: merchantData.phone,
      ZipCode: merchantData.zipCode,
      Address1: merchantData.address1,
      Address2: merchantData.address2 || '',
      BankName: merchantData.bank,
      AccountNumber: merchantData.accountNumber,
      AccountHolder: merchantData.accountHolder,
      PaymentFeeRate: merchantData.paymentFee,
      WithdrawalFee: merchantData.withdrawalFee
    });
    
    return { success: true };
  } catch (error) {
    console.error(`가맹점 ID ${id} 수정 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 상태 변경
 * @param id 가맹점 ID
 * @param status 변경할 상태
 */
export async function updateMerchantStatus(
  id: number,
  status: 'active' | 'inactive' | 'pending'
): Promise<{ success: boolean }> {
  try {
    await executeProcedure('sp_UpdateMerchantStatus', {
      MerchantId: id,
      Status: status
    });
    
    return { success: true };
  } catch (error) {
    console.error(`가맹점 ID ${id} 상태 변경 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 삭제
 * @param id 가맹점 ID
 */
export async function deleteMerchant(id: number): Promise<{ success: boolean }> {
  try {
    await executeProcedure('sp_DeleteMerchant', {
      MerchantId: id
    });
    
    return { success: true };
  } catch (error) {
    console.error(`가맹점 ID ${id} 삭제 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 잔액 조회
 * @param id 가맹점 ID
 */
export async function getMerchantBalance(id: number): Promise<MerchantBalance> {
  try {
    const result = await executeProcedure<any>('sp_GetMerchantBalance', {
      MerchantId: id
    });
    
    if (!result || result.length === 0) {
      throw new Error(`가맹점 ID ${id}의 잔액 정보를 찾을 수 없습니다.`);
    }
    
    const balance = result[0];
    
    return {
      id: balance.MerchantId,
      name: balance.MerchantName,
      balance: balance.Balance,
      availableBalance: balance.AvailableBalance,
      pendingBalance: balance.PendingBalance,
      lastUpdated: balance.LastUpdated
    };
  } catch (error) {
    console.error(`가맹점 ID ${id} 잔액 조회 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 거래 내역 조회
 * @param id 가맹점 ID
 * @param searchParams 검색 파라미터
 */
export async function getMerchantTransactions(
  id: number,
  searchParams?: {
    page?: number;
    pageSize?: number;
    type?: 'deposit' | 'withdrawal';
    status?: 'completed' | 'pending' | 'failed';
    startDate?: string;
    endDate?: string;
  }
): Promise<{
  transactions: MerchantTransaction[];
  pagination: {
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}> {
  try {
    // 파라미터 준비
    const params: Record<string, any> = {
      MerchantId: id,
      Page: searchParams?.page || 1,
      PageSize: searchParams?.pageSize || 10
    };
    
    if (searchParams?.type) {
      params.Type = searchParams.type;
    }
    
    if (searchParams?.status) {
      params.Status = searchParams.status;
    }
    
    if (searchParams?.startDate) {
      params.StartDate = searchParams.startDate;
    }
    
    if (searchParams?.endDate) {
      params.EndDate = searchParams.endDate;
    }
    
    // 프로시저 실행
    const result = await executeProcedure<any>('sp_GetMerchantTransactions', params);
    
    // 결과 처리
    if (!result || result.length === 0) {
      return {
        transactions: [],
        pagination: {
          totalCount: 0,
          page: params.Page,
          pageSize: params.PageSize,
          totalPages: 0
        }
      };
    }
    
    // 거래 내역과 페이지네이션 정보 분리
    const transactions = result.filter(item => item.Id !== undefined);
    const paginationInfo = result.find(item => item.TotalCount !== undefined);
    
    return {
      transactions: transactions.map(item => ({
        id: item.Id,
        merchantId: item.MerchantId,
        type: item.Type,
        amount: item.Amount,
        fee: item.Fee,
        status: item.Status,
        createdAt: item.CreatedAt,
        completedAt: item.CompletedAt,
        description: item.Description
      })),
      pagination: {
        totalCount: paginationInfo?.TotalCount || 0,
        page: params.Page,
        pageSize: params.PageSize,
        totalPages: paginationInfo?.TotalPages || 0
      }
    };
  } catch (error) {
    console.error(`가맹점 ID ${id} 거래 내역 조회 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 API 키 목록 조회
 * @param id 가맹점 ID
 */
export async function getMerchantApiKeys(id: number): Promise<{
  id: number;
  key: string;
  name: string;
  createdAt: string;
  lastUsed?: string;
}[]> {
  try {
    const result = await executeProcedure<any>('sp_GetMerchantApiKeys', {
      MerchantId: id
    });
    
    if (!result) {
      return [];
    }
    
    return result.map((item: any) => ({
      id: item.Id,
      key: item.ApiKey,
      name: item.KeyName,
      createdAt: item.CreatedAt,
      lastUsed: item.LastUsed
    }));
  } catch (error) {
    console.error(`가맹점 ID ${id} API 키 목록 조회 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 API 키 생성
 * @param id 가맹점 ID
 * @param keyName API 키 이름
 */
export async function createMerchantApiKey(
  id: number,
  keyName: string
): Promise<{
  id: number;
  key: string;
}> {
  try {
    const result = await executeProcedure<any>('sp_CreateMerchantApiKey', {
      MerchantId: id,
      KeyName: keyName
    });
    
    if (!result || result.length === 0) {
      throw new Error(`가맹점 ID ${id}의 API 키 생성 중 오류가 발생했습니다.`);
    }
    
    return {
      id: result[0].Id,
      key: result[0].ApiKey
    };
  } catch (error) {
    console.error(`가맹점 ID ${id} API 키 생성 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 API 키 삭제
 * @param id 가맹점 ID
 * @param keyId API 키 ID
 */
export async function deleteMerchantApiKey(
  id: number,
  keyId: number
): Promise<{ success: boolean }> {
  try {
    await executeProcedure('sp_DeleteMerchantApiKey', {
      MerchantId: id,
      ApiKeyId: keyId
    });
    
    return { success: true };
  } catch (error) {
    console.error(`가맹점 ID ${id} API 키 ID ${keyId} 삭제 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 수수료 조회
 * @param id 가맹점 ID
 */
export async function getMerchantFees(id: number): Promise<{
  paymentFee: number;
  withdrawalFee: number;
}> {
  try {
    const result = await executeProcedure<any>('sp_GetMerchantFees', {
      MerchantId: id
    });
    
    if (!result || result.length === 0) {
      throw new Error(`가맹점 ID ${id}의 수수료 정보를 찾을 수 없습니다.`);
    }
    
    return {
      paymentFee: result[0].PaymentFeeRate,
      withdrawalFee: result[0].WithdrawalFee
    };
  } catch (error) {
    console.error(`가맹점 ID ${id} 수수료 조회 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 가맹점 수수료 설정
 * @param id 가맹점 ID
 * @param fees 수수료 정보
 */
export async function updateMerchantFees(
  id: number,
  fees: {
    paymentFee: number;
    withdrawalFee: number;
  }
): Promise<{ success: boolean }> {
  try {
    await executeProcedure('sp_UpdateMerchantFees', {
      MerchantId: id,
      PaymentFeeRate: fees.paymentFee,
      WithdrawalFee: fees.withdrawalFee
    });
    
    return { success: true };
  } catch (error) {
    console.error(`가맹점 ID ${id} 수수료 설정 중 오류가 발생했습니다:`, error);
    throw error;
  }
}
