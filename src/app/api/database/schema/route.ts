/**
 * 테이블 스키마 조회 API 라우트 핸들러
 */
import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/db';
import { TableSchemaResponse } from '@/docs/api/database';

/**
 * GET 요청 핸들러 - 테이블 스키마 조회
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const tableName = searchParams.get('tableName');
    const schemaName = searchParams.get('schemaName') || 'dbo';

    if (!tableName) {
      return NextResponse.json(
        { message: '테이블 이름이 필요합니다.' },
        { status: 400 }
      );
    }

    // 테이블 컬럼 정보 조회
    const columns = await executeQuery<{
      name: string;
      dataType: string;
      maxLength: number;
      isNullable: boolean;
      isPrimaryKey: boolean;
      isIdentity: boolean;
      defaultValue: string;
      description: string;
    }>(`
      SELECT 
        c.name,
        t.name AS dataType,
        c.max_length AS maxLength,
        c.is_nullable AS isNullable,
        CASE WHEN pk.column_id IS NOT NULL THEN 1 ELSE 0 END AS isPrimaryKey,
        c.is_identity AS isIdentity,
        OBJECT_DEFINITION(c.default_object_id) AS defaultValue,
        ep.value AS description
      FROM 
        sys.columns c
      INNER JOIN 
        sys.types t ON c.user_type_id = t.user_type_id
      INNER JOIN 
        sys.tables tb ON c.object_id = tb.object_id
      INNER JOIN 
        sys.schemas s ON tb.schema_id = s.schema_id
      LEFT JOIN 
        sys.index_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id
      LEFT JOIN 
        sys.indexes i ON ic.object_id = i.object_id AND ic.index_id = i.index_id AND i.is_primary_key = 1
      LEFT JOIN 
        sys.index_columns pk ON pk.object_id = c.object_id AND pk.column_id = c.column_id AND pk.index_id = i.index_id
      LEFT JOIN 
        sys.extended_properties ep ON ep.major_id = c.object_id AND ep.minor_id = c.column_id AND ep.name = 'MS_Description'
      WHERE 
        tb.name = @tableName
        AND s.name = @schemaName
      ORDER BY 
        c.column_id
    `, { tableName, schemaName });

    // 테이블 인덱스 정보 조회
    const indexes = await executeQuery<{
      name: string;
      isUnique: boolean;
      isClustered: boolean;
      columns: string;
    }>(`
      SELECT 
        i.name,
        i.is_unique AS isUnique,
        i.type_desc LIKE '%CLUSTERED%' AS isClustered,
        STRING_AGG(c.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS columns
      FROM 
        sys.indexes i
      INNER JOIN 
        sys.index_columns ic ON i.object_id = ic.object_id AND i.index_id = ic.index_id
      INNER JOIN 
        sys.columns c ON ic.object_id = c.object_id AND ic.column_id = c.column_id
      INNER JOIN 
        sys.tables t ON i.object_id = t.object_id
      INNER JOIN 
        sys.schemas s ON t.schema_id = s.schema_id
      WHERE 
        t.name = @tableName
        AND s.name = @schemaName
        AND i.is_primary_key = 0
        AND i.is_unique_constraint = 0
      GROUP BY 
        i.name, i.is_unique, i.type_desc
      ORDER BY 
        i.name
    `, { tableName, schemaName });

    // 테이블 외래 키 정보 조회
    const foreignKeys = await executeQuery<{
      name: string;
      columnName: string;
      referencedTableName: string;
      referencedColumnName: string;
      updateRule: string;
      deleteRule: string;
    }>(`
      SELECT 
        fk.name,
        COL_NAME(fk.parent_object_id, fkc.parent_column_id) AS columnName,
        OBJECT_NAME(fk.referenced_object_id) AS referencedTableName,
        COL_NAME(fk.referenced_object_id, fkc.referenced_column_id) AS referencedColumnName,
        CASE fk.update_referential_action
          WHEN 0 THEN 'NO ACTION'
          WHEN 1 THEN 'CASCADE'
          WHEN 2 THEN 'SET NULL'
          WHEN 3 THEN 'SET DEFAULT'
        END AS updateRule,
        CASE fk.delete_referential_action
          WHEN 0 THEN 'NO ACTION'
          WHEN 1 THEN 'CASCADE'
          WHEN 2 THEN 'SET NULL'
          WHEN 3 THEN 'SET DEFAULT'
        END AS deleteRule
      FROM 
        sys.foreign_keys fk
      INNER JOIN 
        sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
      INNER JOIN 
        sys.tables t ON fk.parent_object_id = t.object_id
      INNER JOIN 
        sys.schemas s ON t.schema_id = s.schema_id
      WHERE 
        t.name = @tableName
        AND s.name = @schemaName
      ORDER BY 
        fk.name
    `, { tableName, schemaName });

    // 인덱스 columns 문자열을 배열로 변환
    const formattedIndexes = indexes.map(index => ({
      name: index.name,
      isUnique: index.isUnique,
      isClustered: index.isClustered,
      columns: index.columns.split(', ')
    }));

    const response: TableSchemaResponse = {
      tableName,
      schemaName,
      columns,
      indexes: formattedIndexes,
      foreignKeys
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('테이블 스키마 조회 중 오류가 발생했습니다:', error);
    return NextResponse.json(
      { message: '테이블 스키마 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
