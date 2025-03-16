/**
 * 데이터베이스 관련 타입 정의
 */
import { ConnectionPool, IResult, ISqlType } from 'mssql';

/**
 * 데이터베이스 설정 인터페이스
 */
export interface DbConfig {
  server: string;
  port: number;
  database: string;
  user: string;
  password: string;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
    enableArithAbort: boolean;
    connectionTimeout: number;
    requestTimeout: number;
  };
  pool: {
    max: number;
    min: number;
    idleTimeoutMillis: number;
  };
}

/**
 * 데이터베이스 환경 변수 인터페이스
 */
export interface DbEnv {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  encrypt: boolean;
  trustServerCertificate: boolean;
  connectionTimeout: number;
  requestTimeout: number;
  poolMax: number;
  poolMin: number;
  poolIdleTimeout: number;
}

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
 * 트랜잭션 쿼리 인터페이스
 */
export interface TransactionQuery {
  query: string;
  params?: Record<string, any>;
}

/**
 * 출력 파라미터가 있는 프로시저 결과 인터페이스
 */
export interface ProcedureResultWithOutput<T = any> {
  recordset: T[];
  output: Record<string, any>;
}

/**
 * 데이터베이스 연결 서비스 인터페이스
 */
export interface DbConnectionService {
  getConnection(): Promise<ConnectionPool>;
  closeConnection(): Promise<void>;
}

/**
 * 데이터베이스 쿼리 서비스 인터페이스
 */
export interface DbQueryService {
  executeQuery<T = any>(query: string, params?: Record<string, any>): Promise<T[]>;
  executeQuerySingle<T = any>(query: string, params?: Record<string, any>): Promise<T | undefined>;
  executeTransaction<T = any>(queries: TransactionQuery[]): Promise<T[][]>;
  executeNonQuery(query: string, params?: Record<string, any>): Promise<number>;
}

/**
 * 데이터베이스 프로시저 서비스 인터페이스
 */
export interface DbProcedureService {
  executeProcedure<T = any>(procedureName: string, params?: Record<string, any>): Promise<T[]>;
  executeProcedureWithFullResult<T = any>(procedureName: string, params?: Record<string, any>): Promise<ProcedureResult<T>>;
  executeProcedureWithOutput<T = any>(
    procedureName: string, 
    inputParams?: Record<string, any>, 
    outputParams?: Record<string, ISqlType>
  ): Promise<ProcedureResultWithOutput<T>>;
}
