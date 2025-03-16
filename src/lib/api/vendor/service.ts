import { db } from '@/db';
import { 
  CreateVendorRequest, 
  GetVendorDetailResponse, 
  GetVendorListRequest, 
  GetVendorListResponse, 
  UpdateVendorRequest, 
  UpdateVendorStatusRequest, 
  Vendor, 
  VendorActionResponse, 
  VendorDetail 
} from '@/types/vendor';

/**
 * 거래처 목록을 조회하는 서비스 함수
 * @param params 조회 파라미터
 * @returns 거래처 목록 및 페이지네이션 정보
 */
export async function getVendorListService(params: GetVendorListRequest = {}): Promise<GetVendorListResponse> {
  try {
    const { 
      searchText, 
      status, 
      page = 1, 
      limit = 10, 
      sortColumn = 'vendorName', 
      sortDirection = 'asc' 
    } = params;

    // 데이터베이스에서 거래처 목록 조회
    const result = await db.execute('sp_GetVendorList', {
      SearchText: searchText || null,
      Status: status || null,
      PageNumber: page,
      PageSize: limit,
      SortColumn: sortColumn,
      SortDirection: sortDirection.toUpperCase()
    });

    // 결과가 없는 경우 빈 배열 반환
    if (!result || !result.recordset || result.recordset.length === 0) {
      return {
        vendors: [],
        pagination: {
          total: 0,
          page,
          limit,
          pages: 0
        }
      };
    }

    // 결과 데이터 변환
    const vendors: Vendor[] = result.recordset.map((row: any) => ({
      id: row.Id,
      vendorName: row.VendorName,
      businessNumber: row.BusinessNumber,
      representativeName: row.RepresentativeName,
      phoneNumber: row.PhoneNumber,
      email: row.Email,
      address: row.Address,
      businessType: row.BusinessType,
      status: row.Status,
      createdAt: row.CreatedAt?.toISOString() || '',
      updatedAt: row.UpdatedAt?.toISOString() || '',
      taxRate: row.TaxRate,
      paymentTerms: row.PaymentTerms,
      contactPerson: row.ContactPerson
    }));

    // 총 개수는 첫 번째 행에서 가져옴
    const totalCount = result.recordset[0]?.TotalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      vendors,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: totalPages
      }
    };
  } catch (error) {
    console.error('거래처 목록 조회 중 오류 발생:', error);
    throw new Error('거래처 목록을 불러오는데 실패했습니다.');
  }
}

/**
 * 특정 거래처의 상세 정보를 조회하는 서비스 함수
 * @param id 거래처 ID
 * @returns 거래처 상세 정보
 */
export async function getVendorByIdService(id: string): Promise<GetVendorDetailResponse> {
  try {
    // 데이터베이스에서 거래처 상세 정보 조회
    const result = await db.execute('sp_GetVendorById', {
      Id: id
    });

    // 결과가 없는 경우 에러 발생
    if (!result || !result.recordset || result.recordset.length === 0) {
      throw new Error('거래처를 찾을 수 없습니다.');
    }

    const row = result.recordset[0];
    
    // 거래처 상세 정보 구성
    const vendorDetail: VendorDetail = {
      id: row.Id,
      vendorName: row.VendorName,
      businessNumber: row.BusinessNumber,
      representativeName: row.RepresentativeName,
      phoneNumber: row.PhoneNumber,
      email: row.Email,
      address: row.Address,
      businessType: row.BusinessType,
      status: row.Status,
      createdAt: row.CreatedAt?.toISOString() || '',
      updatedAt: row.UpdatedAt?.toISOString() || '',
      taxRate: row.TaxRate,
      paymentTerms: row.PaymentTerms,
      contactPerson: row.ContactPerson
    };

    // 은행 정보가 있는 경우 추가
    if (row.BankName) {
      vendorDetail.bankInfo = {
        bankName: row.BankName,
        accountNumber: row.AccountNumber,
        accountHolder: row.AccountHolder
      };
    }

    // 비즈니스 정보가 있는 경우 추가
    if (row.CompanyName) {
      vendorDetail.businessInfo = {
        companyName: row.CompanyName,
        ceoName: row.CeoName,
        businessType: row.DetailBusinessType,
        businessCategory: row.BusinessCategory
      };
    }

    return {
      vendor: vendorDetail
    };
  } catch (error) {
    console.error('거래처 상세 정보 조회 중 오류 발생:', error);
    throw new Error('거래처 정보를 불러오는데 실패했습니다.');
  }
}

/**
 * 새로운 거래처를 생성하는 서비스 함수
 * @param data 거래처 생성 데이터
 * @returns 생성된 거래처 ID 및 성공 여부
 */
export async function createVendorService(data: CreateVendorRequest): Promise<VendorActionResponse> {
  try {
    // 필수 필드 검증
    if (!data.vendorName || !data.businessNumber || !data.representativeName) {
      throw new Error('거래처명, 사업자번호, 대표자명은 필수 입력 항목입니다.');
    }

    // 데이터베이스에 거래처 생성
    const result = await db.execute('sp_CreateVendor', {
      VendorName: data.vendorName,
      BusinessNumber: data.businessNumber,
      RepresentativeName: data.representativeName,
      PhoneNumber: data.phoneNumber,
      Email: data.email,
      Address: data.address,
      BusinessType: data.businessType,
      Status: data.status || 'active',
      TaxRate: data.taxRate || 10.00,
      PaymentTerms: data.paymentTerms || '30일',
      ContactPerson: data.contactPerson,
      
      // 은행 정보
      BankName: data.bankName,
      AccountNumber: data.accountNumber,
      AccountHolder: data.accountHolder,
      
      // 비즈니스 정보
      CompanyName: data.companyName,
      CeoName: data.ceoName,
      DetailBusinessType: data.detailBusinessType,
      BusinessCategory: data.businessCategory
    });

    // 생성된 거래처 ID 반환
    const vendorId = result.recordset[0].Id;
    
    return {
      id: vendorId,
      success: true,
      message: '거래처가 성공적으로 생성되었습니다.'
    };
  } catch (error) {
    console.error('거래처 생성 중 오류 발생:', error);
    throw new Error('거래처 생성에 실패했습니다.');
  }
}

/**
 * 거래처 정보를 수정하는 서비스 함수
 * @param data 거래처 수정 데이터
 * @returns 수정된 거래처 ID 및 성공 여부
 */
export async function updateVendorService(data: UpdateVendorRequest): Promise<VendorActionResponse> {
  try {
    // 필수 필드 검증
    if (!data.id || !data.vendorName || !data.businessNumber || !data.representativeName) {
      throw new Error('거래처ID, 거래처명, 사업자번호, 대표자명은 필수 입력 항목입니다.');
    }

    // 데이터베이스에서 거래처 정보 수정
    await db.execute('sp_UpdateVendor', {
      Id: data.id,
      VendorName: data.vendorName,
      BusinessNumber: data.businessNumber,
      RepresentativeName: data.representativeName,
      PhoneNumber: data.phoneNumber,
      Email: data.email,
      Address: data.address,
      BusinessType: data.businessType,
      TaxRate: data.taxRate || 10.00,
      PaymentTerms: data.paymentTerms || '30일',
      ContactPerson: data.contactPerson,
      
      // 은행 정보
      BankName: data.bankName,
      AccountNumber: data.accountNumber,
      AccountHolder: data.accountHolder,
      
      // 비즈니스 정보
      CompanyName: data.companyName,
      CeoName: data.ceoName,
      DetailBusinessType: data.detailBusinessType,
      BusinessCategory: data.businessCategory
    });
    
    return {
      id: data.id,
      success: true,
      message: '거래처 정보가 성공적으로 수정되었습니다.'
    };
  } catch (error) {
    console.error('거래처 정보 수정 중 오류 발생:', error);
    throw new Error('거래처 정보 수정에 실패했습니다.');
  }
}

/**
 * 거래처 상태를 변경하는 서비스 함수
 * @param data 거래처 상태 변경 데이터
 * @returns 변경된 거래처 ID 및 성공 여부
 */
export async function updateVendorStatusService(data: UpdateVendorStatusRequest): Promise<VendorActionResponse> {
  try {
    // 필수 필드 검증
    if (!data.id || !data.status) {
      throw new Error('거래처ID와 상태는 필수 입력 항목입니다.');
    }

    // 데이터베이스에서 거래처 상태 변경
    await db.execute('sp_UpdateVendorStatus', {
      Id: data.id,
      Status: data.status
    });
    
    return {
      id: data.id,
      success: true,
      message: '거래처 상태가 성공적으로 변경되었습니다.'
    };
  } catch (error) {
    console.error('거래처 상태 변경 중 오류 발생:', error);
    throw new Error('거래처 상태 변경에 실패했습니다.');
  }
}

/**
 * 거래처를 삭제하는 서비스 함수
 * @param id 거래처 ID
 * @returns 삭제된 거래처 ID 및 성공 여부
 */
export async function deleteVendorService(id: string): Promise<VendorActionResponse> {
  try {
    // ID 검증
    if (!id) {
      throw new Error('거래처ID는 필수 입력 항목입니다.');
    }

    // 데이터베이스에서 거래처 삭제
    await db.execute('sp_DeleteVendor', {
      Id: id
    });
    
    return {
      id,
      success: true,
      message: '거래처가 성공적으로 삭제되었습니다.'
    };
  } catch (error) {
    console.error('거래처 삭제 중 오류 발생:', error);
    throw new Error('거래처 삭제에 실패했습니다.');
  }
}
