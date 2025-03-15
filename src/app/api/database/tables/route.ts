/**
 * 데이터베이스 테이블 목록 API 라우트 핸들러
 */
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/db';
import { DatabaseTableListResponse } from '@/docs/api/database';

/**
 * GET 요청 핸들러 - 데이터베이스 테이블 목록 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schemaName = searchParams.get('schemaName') || 'dbo';

    // 테이블 목록 조회 쿼리
    const tables = await executeQuery<{
      name: string;
      schema: string;
      rowCount: number;
      sizeInKB: number;
      createdAt: string;
      modifiedAt: string;
    }>(`
      SELECT 
        t.name,
        s.name AS schema,
        p.rows AS rowCount,
        CAST(SUM(a.total_pages) * 8 / 1024.0 AS DECIMAL(18,2)) AS sizeInKB,
        CONVERT(VARCHAR, t.create_date, 120) AS createdAt,
        CONVERT(VARCHAR, t.modify_date, 120) AS modifiedAt
      FROM 
        sys.tables t
      INNER JOIN 
        sys.schemas s ON t.schema_id = s.schema_id
      INNER JOIN 
        sys.indexes i ON t.object_id = i.object_id
      INNER JOIN 
        sys.partitions p ON i.object_id = p.object_id AND i.index_id = p.index_id
      INNER JOIN 
        sys.allocation_units a ON p.partition_id = a.container_id
      WHERE 
        s.name = @schemaName
      GROUP BY 
        t.name, s.name, p.rows, t.create_date, t.modify_date
      ORDER BY 
        t.name
    `, { schemaName });

    const response: DatabaseTableListResponse = {
      tables,
      total: tables.length
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('테이블 목록 조회 중 오류가 발생했습니다:', error);
    return NextResponse.json(
      { message: '테이블 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
