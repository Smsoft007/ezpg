/**
 * 데이터베이스 관리 API 관련 인터페이스 정의
 */

/**
 * 데이터베이스 테이블 목록 요청
 */
export interface DatabaseTableListRequest {
  schemaName?: string;
}

/**
 * 데이터베이스 테이블 목록 응답
 */
export interface DatabaseTableListResponse {
  tables: DatabaseTable[];
  total: number;
}

/**
 * 데이터베이스 테이블 정보
 */
export interface DatabaseTable {
  name: string;
  schema: string;
  rowCount: number;
  sizeInKB: number;
  createdAt: string;
  modifiedAt: string;
}

/**
 * 테이블 스키마 요청
 */
export interface TableSchemaRequest {
  tableName: string;
  schemaName?: string;
}

/**
 * 테이블 스키마 응답
 */
export interface TableSchemaResponse {
  tableName: string;
  schemaName: string;
  columns: TableColumn[];
  indexes: TableIndex[];
  foreignKeys: TableForeignKey[];
}

/**
 * 테이블 컬럼 정보
 */
export interface TableColumn {
  name: string;
  dataType: string;
  maxLength: number;
  isNullable: boolean;
  isPrimaryKey: boolean;
  isIdentity: boolean;
  defaultValue?: string;
  description?: string;
}

/**
 * 테이블 인덱스 정보
 */
export interface TableIndex {
  name: string;
  isUnique: boolean;
  isClustered: boolean;
  columns: string[];
}

/**
 * 테이블 외래 키 정보
 */
export interface TableForeignKey {
  name: string;
  columnName: string;
  referencedTableName: string;
  referencedColumnName: string;
  updateRule: string;
  deleteRule: string;
}

/**
 * 데이터 쿼리 요청
 */
export interface DatabaseQueryRequest {
  query: string;
  parameters?: Record<string, any>;
  maxRows?: number;
}

/**
 * 데이터 쿼리 응답
 */
export interface DatabaseQueryResponse {
  columns: string[];
  rows: any[];
  rowCount: number;
  executionTime: number;
}

/**
 * 데이터 수정 요청
 */
export interface DatabaseUpdateRequest {
  tableName: string;
  data: Record<string, any>[];
  keyField: string;
}

/**
 * 데이터 수정 응답
 */
export interface DatabaseUpdateResponse {
  success: boolean;
  updatedCount: number;
  errors?: { row: number; message: string }[];
}

/**
 * 데이터 삭제 요청
 */
export interface DatabaseDeleteRequest {
  tableName: string;
  keyValues: any[];
  keyField: string;
}

/**
 * 데이터 삭제 응답
 */
export interface DatabaseDeleteResponse {
  success: boolean;
  deletedCount: number;
  errors?: { value: any; message: string }[];
}

/**
 * 데이터 삽입 요청
 */
export interface DatabaseInsertRequest {
  tableName: string;
  data: Record<string, any>[];
}

/**
 * 데이터 삽입 응답
 */
export interface DatabaseInsertResponse {
  success: boolean;
  insertedCount: number;
  insertedIds?: any[];
  errors?: { row: number; message: string }[];
}

/**
 * 데이터베이스 백업 요청
 */
export interface DatabaseBackupRequest {
  backupName: string;
  description?: string;
  includeSchema?: boolean;
  includeTables?: string[];
}

/**
 * 데이터베이스 백업 응답
 */
export interface DatabaseBackupResponse {
  success: boolean;
  backupId: string;
  backupName: string;
  backupPath: string;
  backupSize: number;
  createdAt: string;
}

/**
 * 데이터베이스 백업 목록 요청
 */
export interface DatabaseBackupListRequest {
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

/**
 * 데이터베이스 백업 목록 응답
 */
export interface DatabaseBackupListResponse {
  backups: DatabaseBackup[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 데이터베이스 백업 정보 인터페이스
 */
export interface DatabaseBackup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  createdBy: string;
  size: number;
  path: string;
  includeSchema?: boolean;
}

/**
 * 데이터베이스 복원 요청
 */
export interface DatabaseRestoreRequest {
  backupId: string;
  restoreOptions?: {
    overwriteExisting?: boolean;
    includeTables?: string[];
  };
}

/**
 * 데이터베이스 복원 응답
 */
export interface DatabaseRestoreResponse {
  success: boolean;
  message: string;
  startedAt: string;
  completedAt?: string;
  restoredTables?: string[];
  errors?: string[];
}

/**
 * 데이터베이스 사용량 통계 요청
 */
export interface DatabaseUsageStatsRequest {
  includeTableStats?: boolean;
}

/**
 * 데이터베이스 사용량 통계 응답
 */
export interface DatabaseUsageStatsResponse {
  databaseName: string;
  sizeInMB: number;
  spaceUsedInMB: number;
  spaceRemainingInMB: number;
  percentUsed: number;
  tableStats?: DatabaseTableStats[];
}

/**
 * 데이터베이스 테이블 통계
 */
export interface DatabaseTableStats {
  tableName: string;
  schemaName: string;
  rowCount: number;
  reservedSizeKB: number;
  dataSizeKB: number;
  indexSizeKB: number;
  unusedSizeKB: number;
}

/**
 * 저장 프로시저 목록 요청
 */
export interface StoredProcedureListRequest {
  schemaName?: string;
  namePattern?: string;
}

/**
 * 저장 프로시저 목록 응답
 */
export interface StoredProcedureListResponse {
  procedures: StoredProcedure[];
  total: number;
}

/**
 * 저장 프로시저 정보
 */
export interface StoredProcedure {
  name: string;
  schema: string;
  created: string;
  modified: string;
  parameters?: StoredProcedureParameter[];
}

/**
 * 저장 프로시저 매개변수 정보
 */
export interface StoredProcedureParameter {
  name: string;
  dataType: string;
  maxLength: number;
  isOutput: boolean;
  defaultValue?: string;
}

/**
 * 저장 프로시저 정의 요청
 */
export interface StoredProcedureDefinitionRequest {
  procedureName: string;
  schemaName?: string;
}

/**
 * 저장 프로시저 정의 응답
 */
export interface StoredProcedureDefinitionResponse {
  name: string;
  schema: string;
  definition: string;
  parameters: StoredProcedureParameter[];
}

/**
 * 데이터 내보내기 요청
 */
export interface DataExportRequest {
  tables: string[];
  format: DataExportFormat;
  includeSchema?: boolean;
  filter?: Record<string, any>;
}

/**
 * 데이터 내보내기 응답
 */
export interface DataExportResponse {
  success: boolean;
  exportId: string;
  fileName: string;
  fileSize: number;
  downloadUrl: string;
  expiresAt: string;
}

/**
 * 데이터 가져오기 요청
 */
export interface DataImportRequest {
  file: File;
  format: DataExportFormat;
  targetTable?: string;
  options?: {
    truncateBeforeImport?: boolean;
    ignoreErrors?: boolean;
    updateExisting?: boolean;
    keyField?: string;
  };
}

/**
 * 데이터 가져오기 응답
 */
export interface DataImportResponse {
  success: boolean;
  importId: string;
  processedRows: number;
  insertedRows: number;
  updatedRows: number;
  errorRows: number;
  errors?: { row: number; message: string }[];
}

/**
 * 데이터 내보내기 형식
 */
export enum DataExportFormat {
  CSV = 'CSV',
  JSON = 'JSON',
  XML = 'XML',
  SQL = 'SQL',
  EXCEL = 'EXCEL'
}

/**
 * 데이터베이스 작업 상태 열거형
 */
export enum DatabaseJobStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

/**
 * 데이터베이스 작업 상태 요청 인터페이스
 */
export interface DatabaseJobStatusRequest {
  jobId: string;
}

/**
 * 데이터베이스 작업 상태 응답 인터페이스
 */
export interface DatabaseJobStatusResponse {
  jobId: string;
  status: DatabaseJobStatus;
  progress: number;
  message?: string;
  startTime: string;
  endTime?: string;
  type: 'backup' | 'restore';
}
