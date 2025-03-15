/**
 * 데이터베이스 관리 API 클라이언트 함수
 */
import {
  DatabaseTableListRequest,
  DatabaseTableListResponse,
  TableSchemaRequest,
  TableSchemaResponse,
  DatabaseQueryRequest,
  DatabaseQueryResponse,
  DatabaseUpdateRequest,
  DatabaseUpdateResponse,
  DatabaseDeleteRequest,
  DatabaseDeleteResponse,
  DatabaseInsertRequest,
  DatabaseInsertResponse,
  DatabaseBackupRequest,
  DatabaseBackupResponse,
  DatabaseBackupListRequest,
  DatabaseBackupListResponse,
  DatabaseRestoreRequest,
  DatabaseRestoreResponse,
  DatabaseUsageStatsRequest,
  DatabaseUsageStatsResponse,
  StoredProcedureListRequest,
  StoredProcedureListResponse,
  StoredProcedureDefinitionRequest,
  StoredProcedureDefinitionResponse,
  DataExportRequest,
  DataExportResponse,
  DataImportResponse,
  DatabaseJobStatusRequest,
  DatabaseJobStatusResponse,
  DatabaseBackup,
  DatabaseJobStatus
} from '@/docs/api/database';

/**
 * API 요청 기본 함수
 */
async function fetchApi<T>(endpoint: string, method: string, data?: any): Promise<T> {
  try {
    const response = await fetch(`/api/database/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API 요청 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API 요청 중 오류 발생:', error);
    throw error;
  }
}

/**
 * 데이터베이스 연결 테스트
 * @returns 연결 성공 여부와 메시지
 */
export async function testDatabaseConnection(): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  timestamp: string;
}> {
  try {
    return await fetchApi<{
      success: boolean;
      message?: string;
      error?: string;
      timestamp: string;
    }>('test-connection', 'GET');
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '데이터베이스 연결을 확인할 수 없습니다.',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * 데이터베이스 테이블 목록 조회
 */
export async function getTableList(request: DatabaseTableListRequest = {}): Promise<DatabaseTableListResponse> {
  return fetchApi<DatabaseTableListResponse>('tables', 'GET', request);
}

/**
 * 테이블 스키마 조회
 */
export async function getTableSchema(request: TableSchemaRequest): Promise<TableSchemaResponse> {
  return fetchApi<TableSchemaResponse>(`schema?tableName=${encodeURIComponent(request.tableName)}${request.schemaName ? `&schemaName=${encodeURIComponent(request.schemaName)}` : ''}`, 'GET');
}

/**
 * 데이터베이스 쿼리 실행
 */
export async function executeQuery(request: DatabaseQueryRequest): Promise<DatabaseQueryResponse> {
  return fetchApi<DatabaseQueryResponse>('query', 'POST', request);
}

/**
 * 데이터 일괄 수정
 */
export async function updateData(request: DatabaseUpdateRequest): Promise<DatabaseUpdateResponse> {
  return fetchApi<DatabaseUpdateResponse>('update', 'POST', request);
}

/**
 * 데이터 일괄 삭제
 */
export async function deleteData(request: DatabaseDeleteRequest): Promise<DatabaseDeleteResponse> {
  return fetchApi<DatabaseDeleteResponse>('delete', 'POST', request);
}

/**
 * 데이터 일괄 삽입
 */
export async function insertData(request: DatabaseInsertRequest): Promise<DatabaseInsertResponse> {
  return fetchApi<DatabaseInsertResponse>('insert', 'POST', request);
}

/**
 * 데이터베이스 백업 목록 조회
 */
export async function getBackupList(request: DatabaseBackupListRequest = {}): Promise<DatabaseBackupListResponse> {
  const queryParams = new URLSearchParams();
  if (request.startDate) queryParams.append('startDate', request.startDate);
  if (request.endDate) queryParams.append('endDate', request.endDate);
  if (request.limit) queryParams.append('limit', request.limit.toString());
  if (request.page) queryParams.append('page', request.page.toString());
  
  const queryString = queryParams.toString();
  return fetchApi<DatabaseBackupListResponse>(`backups${queryString ? `?${queryString}` : ''}`, 'GET');
}

/**
 * 데이터베이스 백업 목록을 가져옵니다.
 */
export async function getBackups(): Promise<{ backups: DatabaseBackup[] }> {
  return fetchApi<{ backups: DatabaseBackup[] }>('backup', 'GET');
}

/**
 * 새 데이터베이스 백업을 생성합니다.
 */
export async function createBackup(request: DatabaseBackupRequest): Promise<DatabaseBackupResponse> {
  return fetchApi<DatabaseBackupResponse>('backup', 'POST', request);
}

/**
 * 데이터베이스 백업을 삭제합니다.
 */
export async function deleteBackup(backupId: string): Promise<{ success: boolean }> {
  return fetchApi<{ success: boolean }>(`backup?id=${backupId}`, 'DELETE');
}

/**
 * 데이터베이스를 백업에서 복원합니다.
 */
export async function restoreDatabase(request: DatabaseRestoreRequest): Promise<DatabaseRestoreResponse> {
  return fetchApi<DatabaseRestoreResponse>('restore', 'POST', request);
}

/**
 * 데이터베이스 사용량 통계 조회
 */
export async function getDatabaseUsageStats(request: DatabaseUsageStatsRequest = {}): Promise<DatabaseUsageStatsResponse> {
  const includeTableStats = request.includeTableStats ? '?includeTableStats=true' : '';
  return fetchApi<DatabaseUsageStatsResponse>(`stats${includeTableStats}`, 'GET');
}

/**
 * 저장 프로시저 목록 조회
 */
export async function getStoredProcedureList(request: StoredProcedureListRequest = {}): Promise<StoredProcedureListResponse> {
  const queryParams = new URLSearchParams();
  if (request.schemaName) queryParams.append('schemaName', request.schemaName);
  if (request.namePattern) queryParams.append('namePattern', request.namePattern);
  
  const queryString = queryParams.toString();
  return fetchApi<StoredProcedureListResponse>(`procedures${queryString ? `?${queryString}` : ''}`, 'GET');
}

/**
 * 저장 프로시저 정의 조회
 */
export async function getStoredProcedureDefinition(request: StoredProcedureDefinitionRequest): Promise<StoredProcedureDefinitionResponse> {
  const queryParams = new URLSearchParams();
  queryParams.append('procedureName', request.procedureName);
  if (request.schemaName) queryParams.append('schemaName', request.schemaName);
  
  const queryString = queryParams.toString();
  return fetchApi<StoredProcedureDefinitionResponse>(`procedure-definition?${queryString}`, 'GET');
}

/**
 * 데이터 내보내기
 */
export async function exportData(request: DataExportRequest): Promise<DataExportResponse> {
  return fetchApi<DataExportResponse>('export', 'POST', request);
}

/**
 * 데이터 가져오기
 */
export async function importData(formData: FormData): Promise<DataImportResponse> {
  const response = await fetch('/api/database/import', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || '데이터 가져오기 중 오류가 발생했습니다.');
  }

  return response.json();
}

/**
 * 데이터베이스 작업 상태 조회
 */
export async function getDatabaseJobStatus(request: DatabaseJobStatusRequest): Promise<DatabaseJobStatusResponse> {
  return fetchApi<DatabaseJobStatusResponse>(`job-status?jobId=${encodeURIComponent(request.jobId)}`, 'GET');
}

/**
 * 데이터베이스 작업 상세 정보를 조회합니다.
 */
export async function getJobDetails(request: DatabaseJobStatusRequest): Promise<{
  jobId: string;
  status: DatabaseJobStatus;
  progress: number;
  message?: string;
  startTime: string;
  endTime?: string;
  type: 'backup' | 'restore';
}> {
  return fetchApi<{
    jobId: string;
    status: DatabaseJobStatus;
    progress: number;
    message?: string;
    startTime: string;
    endTime?: string;
    type: 'backup' | 'restore';
  }>(`job?jobId=${request.jobId}`, 'GET');
}
