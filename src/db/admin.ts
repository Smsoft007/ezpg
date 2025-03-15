/**
 * 관리자 전용 데이터베이스 관리 모듈
 * 데이터 수정, 삭제, 커밋 등의 고급 기능을 제공합니다.
 */
import { executeProcedure, executeQuery } from '@/db';

/**
 * 직접 SQL 쿼리를 실행합니다. (관리자 전용)
 * 주의: 이 함수는 데이터베이스에 직접적인 영향을 미칠 수 있으므로 신중하게 사용해야 합니다.
 */
export async function executeDirectQuery<T>(query: string, params: Record<string, any> = {}): Promise<T[]> {
  try {
    return await executeQuery<T>(query, params);
  } catch (error) {
    console.error('직접 쿼리 실행 중 오류가 발생했습니다:', error);
    throw error;
  }
}

/**
 * 테이블의 데이터를 일괄 수정합니다. (관리자 전용)
 */
export async function bulkUpdateData(
  tableName: string,
  data: Record<string, any>[],
  keyField: string
): Promise<{ success: boolean; updatedCount: number }> {
  try {
    const result = await executeProcedure<{ Success: boolean; UpdatedCount: number }>('sp_BulkUpdateData', {
      TableName: tableName,
      DataJson: JSON.stringify(data),
      KeyField: keyField
    });

    return {
      success: result[0]?.Success || false,
      updatedCount: result[0]?.UpdatedCount || 0
    };
  } catch (error) {
    console.error(`테이블 ${tableName} 데이터 일괄 수정 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 테이블의 데이터를 일괄 삭제합니다. (관리자 전용)
 */
export async function bulkDeleteData(
  tableName: string,
  keyValues: any[],
  keyField: string
): Promise<{ success: boolean; deletedCount: number }> {
  try {
    const result = await executeProcedure<{ Success: boolean; DeletedCount: number }>('sp_BulkDeleteData', {
      TableName: tableName,
      KeyValuesJson: JSON.stringify(keyValues),
      KeyField: keyField
    });

    return {
      success: result[0]?.Success || false,
      deletedCount: result[0]?.DeletedCount || 0
    };
  } catch (error) {
    console.error(`테이블 ${tableName} 데이터 일괄 삭제 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 테이블의 데이터를 일괄 삽입합니다. (관리자 전용)
 */
export async function bulkInsertData(
  tableName: string,
  data: Record<string, any>[]
): Promise<{ success: boolean; insertedCount: number }> {
  try {
    const result = await executeProcedure<{ Success: boolean; InsertedCount: number }>('sp_BulkInsertData', {
      TableName: tableName,
      DataJson: JSON.stringify(data)
    });

    return {
      success: result[0]?.Success || false,
      insertedCount: result[0]?.InsertedCount || 0
    };
  } catch (error) {
    console.error(`테이블 ${tableName} 데이터 일괄 삽입 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 데이터베이스 트랜잭션을 커밋합니다. (관리자 전용)
 */
export async function commitTransaction(transactionId: string): Promise<boolean> {
  try {
    const result = await executeProcedure<{ Success: boolean }>('sp_CommitTransaction', {
      TransactionId: transactionId
    });

    return result[0]?.Success || false;
  } catch (error) {
    console.error(`트랜잭션 ${transactionId} 커밋 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 데이터베이스 트랜잭션을 롤백합니다. (관리자 전용)
 */
export async function rollbackTransaction(transactionId: string): Promise<boolean> {
  try {
    const result = await executeProcedure<{ Success: boolean }>('sp_RollbackTransaction', {
      TransactionId: transactionId
    });

    return result[0]?.Success || false;
  } catch (error) {
    console.error(`트랜잭션 ${transactionId} 롤백 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 데이터베이스 백업을 생성합니다. (관리자 전용)
 */
export async function createDatabaseBackup(
  backupName: string,
  description?: string
): Promise<{ success: boolean; backupId: string; backupPath: string }> {
  try {
    const result = await executeProcedure<{ Success: boolean; BackupId: string; BackupPath: string }>('sp_CreateDatabaseBackup', {
      BackupName: backupName,
      Description: description || null
    });

    return {
      success: result[0]?.Success || false,
      backupId: result[0]?.BackupId || '',
      backupPath: result[0]?.BackupPath || ''
    };
  } catch (error) {
    console.error(`데이터베이스 백업 생성 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 데이터베이스 백업을 복원합니다. (관리자 전용)
 */
export async function restoreDatabaseBackup(backupId: string): Promise<boolean> {
  try {
    const result = await executeProcedure<{ Success: boolean }>('sp_RestoreDatabaseBackup', {
      BackupId: backupId
    });

    return result[0]?.Success || false;
  } catch (error) {
    console.error(`데이터베이스 백업 복원 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 데이터베이스 테이블 스키마를 조회합니다. (관리자 전용)
 */
export async function getTableSchema(tableName: string): Promise<{ columnName: string; dataType: string; isNullable: boolean; isPrimaryKey: boolean }[]> {
  try {
    const result = await executeProcedure<{ 
      ColumnName: string; 
      DataType: string; 
      IsNullable: boolean; 
      IsPrimaryKey: boolean 
    }>('sp_GetTableSchema', {
      TableName: tableName
    });
    
    return result.map(item => ({
      columnName: item.ColumnName,
      dataType: item.DataType,
      isNullable: item.IsNullable,
      isPrimaryKey: item.IsPrimaryKey
    }));
  } catch (error) {
    console.error(`테이블 ${tableName} 스키마 조회 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 저장 프로시저 목록을 조회합니다. (관리자 전용)
 */
export async function getStoredProcedures(): Promise<{ name: string; created: Date; modified: Date }[]> {
  try {
    return await executeQuery<{ 
      name: string; 
      created: Date; 
      modified: Date 
    }>(`
      SELECT 
        name,
        create_date as created,
        modify_date as modified
      FROM 
        sys.procedures
      ORDER BY 
        name
    `);
  } catch (error) {
    console.error('저장 프로시저 목록 조회 중 오류가 발생했습니다:', error);
    throw error;
  }
}

/**
 * 저장 프로시저 정의를 조회합니다. (관리자 전용)
 */
export async function getStoredProcedureDefinition(procedureName: string): Promise<string> {
  try {
    const result = await executeQuery<{ definition: string }>(`
      SELECT 
        OBJECT_DEFINITION(OBJECT_ID(N'${procedureName}')) as definition
    `);

    return result[0]?.definition || '';
  } catch (error) {
    console.error(`저장 프로시저 ${procedureName} 정의 조회 중 오류가 발생했습니다:`, error);
    throw error;
  }
}

/**
 * 데이터베이스 사용량 통계를 조회합니다. (관리자 전용)
 */
export async function getDatabaseUsageStats(): Promise<{ 
  databaseName: string;
  sizeInMB: number;
  spaceUsedInMB: number;
  spaceRemainingInMB: number;
  percentUsed: number;
}> {
  try {
    const result = await executeQuery<{ 
      DatabaseName: string;
      SizeInMB: number;
      SpaceUsedInMB: number;
      SpaceRemainingInMB: number;
      PercentUsed: number;
    }>(`
      SELECT 
        DB_NAME() AS DatabaseName,
        CAST(SUM(size * 8.0 / 1024) AS DECIMAL(18,2)) AS SizeInMB,
        CAST(SUM(FILEPROPERTY(name, 'SpaceUsed') * 8.0 / 1024) AS DECIMAL(18,2)) AS SpaceUsedInMB,
        CAST(SUM(size * 8.0 / 1024) - SUM(FILEPROPERTY(name, 'SpaceUsed') * 8.0 / 1024) AS DECIMAL(18,2)) AS SpaceRemainingInMB,
        CAST(SUM(FILEPROPERTY(name, 'SpaceUsed') * 8.0 / 1024) / SUM(size * 8.0 / 1024) * 100 AS DECIMAL(18,2)) AS PercentUsed
      FROM 
        sys.database_files
      WHERE 
        type_desc = 'ROWS'
    `);

    if (result.length === 0) {
      return {
        databaseName: '',
        sizeInMB: 0,
        spaceUsedInMB: 0,
        spaceRemainingInMB: 0,
        percentUsed: 0
      };
    }
    
    return {
      databaseName: result[0].DatabaseName,
      sizeInMB: result[0].SizeInMB,
      spaceUsedInMB: result[0].SpaceUsedInMB,
      spaceRemainingInMB: result[0].SpaceRemainingInMB,
      percentUsed: result[0].PercentUsed
    };
  } catch (error) {
    console.error('데이터베이스 사용량 통계 조회 중 오류가 발생했습니다:', error);
    throw error;
  }
}
