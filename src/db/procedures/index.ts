/**
 * 저장 프로시저 실행 모듈
 * 저장 프로시저 호출을 위한 표준화된 인터페이스를 제공합니다.
 */
import { getConnection } from '../connection';
import { IResult } from 'mssql';

/**
 * 저장 프로시저 실행 결과 인터페이스
 */
export interface ProcedureResult<T = any> {
  recordset: T[];
  recordsets: T[][];
  rowsAffected: number[];
  output: Record<string, any>;
  returnValue: number;
}

/**
 * 저장 프로시저를 실행합니다.
 * @param procedureName 프로시저 이름
 * @param params 프로시저 파라미터
 * @returns 프로시저 실행 결과
 */
export async function executeProcedure<T = any>(
  procedureName: string,
  params: Record<string, any> = {}
): Promise<T[]> {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.execute(procedureName);
    return result.recordset as T[];
  } catch (error) {
    console.error(`저장 프로시저 [${procedureName}] 실행 중 오류:`, error);
    throw error;
  }
}

/**
 * 저장 프로시저를 실행하고 전체 결과를 반환합니다.
 * @param procedureName 프로시저 이름
 * @param params 프로시저 파라미터
 * @returns 프로시저 실행 전체 결과
 */
export async function executeProcedureWithFullResult<T = any>(
  procedureName: string,
  params: Record<string, any> = {}
): Promise<ProcedureResult<T>> {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.execute<T>(procedureName);
    
    return {
      recordset: result.recordset || [],
      recordsets: result.recordsets || [],
      rowsAffected: result.rowsAffected || [],
      output: result.output || {},
      returnValue: result.returnValue
    };
  } catch (error) {
    console.error(`저장 프로시저 [${procedureName}] 실행 중 오류:`, error);
    throw error;
  }
}

/**
 * 출력 파라미터가 있는 저장 프로시저를 실행합니다.
 * @param procedureName 프로시저 이름
 * @param inputParams 입력 파라미터
 * @param outputParams 출력 파라미터 정의 {paramName: sqlType}
 * @returns 프로시저 실행 결과와 출력 파라미터 값
 */
export async function executeProcedureWithOutput<T = any>(
  procedureName: string,
  inputParams: Record<string, any> = {},
  outputParams: Record<string, any> = {}
): Promise<{recordset: T[], output: Record<string, any>}> {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // 입력 파라미터 추가
    Object.entries(inputParams).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    // 출력 파라미터 추가
    Object.entries(outputParams).forEach(([key, type]) => {
      request.output(key, type);
    });
    
    const result = await request.execute(procedureName);
    
    return {
      recordset: result.recordset as T[],
      output: result.output
    };
  } catch (error) {
    console.error(`저장 프로시저 [${procedureName}] 실행 중 오류:`, error);
    throw error;
  }
}

export default {
  executeProcedure,
  executeProcedureWithFullResult,
  executeProcedureWithOutput
};
