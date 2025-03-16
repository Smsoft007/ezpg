/**
 * 가맹점 관련 데이터베이스 서비스
 * 가맹점 정보 조회, 등록, 수정, 삭제 등의 기능을 제공합니다.
 */
import { executeProcedure, executeQuery } from '@/db';

/**
 * 가맹점 상세 정보 인터페이스
 * @interface VendorDetail
 */
interface VendorDetail {
  // 가맹점 기본 정보
  id: string;
  name: string;
  businessNumber: string;
  representativeName: string;
  address: string;
  phoneNumber: string;
  email: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  
  // 추가 정보
  contacts?: VendorContact[];
  apiKeys?: VendorApiKey[];
  bankAccounts?: VendorBankAccount[];
}

/**
 * 가맹점 담당자 정보 인터페이스
 * @interface VendorContact
 */
interface VendorContact {
  id: string;
  vendorId: string;
  name: string;
  position: string;
  department: string;
  phoneNumber: string;
  email: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 가맹점 API 키 정보 인터페이스
 * @interface VendorApiKey
 */
interface VendorApiKey {
  id: string;
  vendorId: string;
  apiKey: string;
  secretKey: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 가맹점 계좌 정보 인터페이스
 * @interface VendorBankAccount
 */
interface VendorBankAccount {
  id: string;
  vendorId: string;
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 가맹점 ID로 가맹점 상세 정보를 조회합니다.
 * @param vendorId 가맹점 ID
 * @returns 가맹점 상세 정보
 */
export async function getVendorById(vendorId: string): Promise<VendorDetail | null> {
  try {
    // 저장 프로시저 실행
    const results = await executeProcedure('sp_GetVendorById', { vendorId });
    
    // 결과가 없는 경우
    if (!results || results.length === 0 || !results[0] || results[0].length === 0) {
      return null;
    }
    
    // 가맹점 기본 정보
    const vendor = results[0][0];
    
    // 가맹점 담당자 정보
    const contacts = results[1] || [];
    
    // 가맹점 API 키 정보
    const apiKeys = results[2] || [];
    
    // 가맹점 계좌 정보
    const bankAccounts = results[3] || [];
    
    // 결과 조합
    return {
      ...vendor,
      contacts,
      apiKeys,
      bankAccounts
    };
  } catch (error) {
    console.error('가맹점 상세 정보 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 가맹점 목록을 조회합니다.
 * @param page 페이지 번호 (1부터 시작)
 * @param pageSize 페이지 크기
 * @param searchTerm 검색어 (가맹점명, 사업자번호 등)
 * @returns 가맹점 목록 및 총 개수
 */
export async function getVendors(page: number = 1, pageSize: number = 10, searchTerm?: string): Promise<{ vendors: any[], total: number }> {
  try {
    const params = {
      page,
      pageSize,
      searchTerm: searchTerm || ''
    };
    
    // 저장 프로시저 실행
    const results = await executeProcedure('sp_GetVendors', params);
    
    // 결과가 없는 경우
    if (!results || results.length === 0) {
      return { vendors: [], total: 0 };
    }
    
    // 가맹점 목록
    const vendors = results[0] || [];
    
    // 총 개수
    const total = results[1] && results[1][0] ? results[1][0].TotalCount : 0;
    
    return { vendors, total };
  } catch (error) {
    console.error('가맹점 목록 조회 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 가맹점을 등록합니다.
 * @param vendorData 가맹점 등록 데이터
 * @returns 등록된 가맹점 ID
 */
export async function createVendor(vendorData: Omit<VendorDetail, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    // 저장 프로시저 실행
    const result = await executeProcedure('sp_CreateVendor', vendorData);
    
    // 등록된 가맹점 ID
    const vendorId = result[0][0].VendorId;
    
    return vendorId;
  } catch (error) {
    console.error('가맹점 등록 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 가맹점 정보를 수정합니다.
 * @param vendorId 가맹점 ID
 * @param vendorData 가맹점 수정 데이터
 * @returns 수정 성공 여부
 */
export async function updateVendor(vendorId: string, vendorData: Partial<VendorDetail>): Promise<boolean> {
  try {
    // 저장 프로시저 실행
    await executeProcedure('sp_UpdateVendor', {
      vendorId,
      ...vendorData
    });
    
    return true;
  } catch (error) {
    console.error('가맹점 수정 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 가맹점을 삭제합니다.
 * @param vendorId 가맹점 ID
 * @returns 삭제 성공 여부
 */
export async function deleteVendor(vendorId: string): Promise<boolean> {
  try {
    // 저장 프로시저 실행
    await executeProcedure('sp_DeleteVendor', { vendorId });
    
    return true;
  } catch (error) {
    console.error('가맹점 삭제 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 가맹점 API 키를 생성합니다.
 * @param vendorId 가맹점 ID
 * @param expiresInDays 만료일 (일 단위, 기본값: 365일)
 * @returns 생성된 API 키 정보
 */
export async function createVendorApiKey(vendorId: string, expiresInDays: number = 365): Promise<VendorApiKey> {
  try {
    // 저장 프로시저 실행
    const result = await executeProcedure('sp_CreateVendorApiKey', {
      vendorId,
      expiresInDays
    });
    
    // 생성된 API 키 정보
    return result[0][0];
  } catch (error) {
    console.error('가맹점 API 키 생성 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 가맹점 API 키를 비활성화합니다.
 * @param apiKeyId API 키 ID
 * @returns 비활성화 성공 여부
 */
export async function deactivateVendorApiKey(apiKeyId: string): Promise<boolean> {
  try {
    // 저장 프로시저 실행
    await executeProcedure('sp_DeactivateVendorApiKey', { apiKeyId });
    
    return true;
  } catch (error) {
    console.error('가맹점 API 키 비활성화 중 오류 발생:', error);
    throw error;
  }
}
