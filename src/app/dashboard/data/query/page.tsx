'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Play, Download, Save, Database, Table } from 'lucide-react';
import { executeQuery } from '@/app/api/database/client';
import { DatabaseQueryResponse } from '@/docs/api/database';
import { toast } from '@/components/ui/use-toast';

export default function DataQueryPage() {
  const [query, setQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [queryResult, setQueryResult] = useState<DatabaseQueryResponse | null>(null);
  const [activeTab, setActiveTab] = useState<string>('query');
  const [savedQueries, setSavedQueries] = useState<{ name: string; query: string }[]>([]);
  const [queryName, setQueryName] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 쿼리 실행 함수
  const runQuery = async () => {
    if (!query.trim()) {
      toast({
        title: '쿼리가 비어있습니다',
        description: '실행할 SQL 쿼리를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await executeQuery({
        query,
        maxRows: 1000,
      });
      setQueryResult(result);
      setActiveTab('results');
      toast({
        title: '쿼리 실행 완료',
        description: `${result.rowCount}개의 행이 반환되었습니다. (${result.executionTime}ms)`,
      });
    } catch (error) {
      console.error('쿼리 실행 오류:', error);
      toast({
        title: '쿼리 실행 오류',
        description: error instanceof Error ? error.message : '쿼리 실행 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 쿼리 저장 함수
  const saveQuery = () => {
    if (!query.trim() || !queryName.trim()) {
      toast({
        title: '입력 오류',
        description: '쿼리 이름과 쿼리 내용을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    const newSavedQueries = [...savedQueries, { name: queryName, query }];
    setSavedQueries(newSavedQueries);
    localStorage.setItem('savedQueries', JSON.stringify(newSavedQueries));
    setQueryName('');
    toast({
      title: '쿼리 저장 완료',
      description: `"${queryName}" 쿼리가 저장되었습니다.`,
    });
  };

  // 저장된 쿼리 로드 함수
  const loadQuery = (selectedQuery: string) => {
    const found = savedQueries.find(q => q.name === selectedQuery);
    if (found) {
      setQuery(found.query);
      toast({
        title: '쿼리 로드 완료',
        description: `"${found.name}" 쿼리가 로드되었습니다.`,
      });
    }
  };

  // CSV 다운로드 함수
  const downloadCSV = () => {
    if (!queryResult || queryResult.rows.length === 0) {
      toast({
        title: '다운로드 오류',
        description: '다운로드할 결과가 없습니다.',
        variant: 'destructive',
      });
      return;
    }

    const columns = queryResult.columns;
    const rows = queryResult.rows;

    // CSV 헤더 생성
    let csv = columns.join(',') + '\n';

    // CSV 데이터 행 생성
    rows.forEach(row => {
      const rowData = columns.map(col => {
        const value = row[col];
        // 문자열인 경우 쌍따옴표로 감싸고 쌍따옴표는 이스케이프 처리
        if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        }
        // null 또는 undefined인 경우 빈 문자열 반환
        if (value === null || value === undefined) {
          return '';
        }
        return value;
      });
      csv += rowData.join(',') + '\n';
    });

    // CSV 파일 다운로드
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `query_result_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 컴포넌트 마운트 시 저장된 쿼리 로드
  useState(() => {
    const savedQueriesJson = localStorage.getItem('savedQueries');
    if (savedQueriesJson) {
      try {
        setSavedQueries(JSON.parse(savedQueriesJson));
      } catch (e) {
        console.error('저장된 쿼리 로드 오류:', e);
      }
    }
  });

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">데이터 조회</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 왼쪽 사이드바 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>저장된 쿼리</CardTitle>
              <CardDescription>자주 사용하는 쿼리를 저장하고 불러올 수 있습니다.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="queryName">쿼리 이름</Label>
                  <Input
                    id="queryName"
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                    placeholder="저장할 쿼리 이름"
                  />
                </div>
                
                <Button 
                  onClick={saveQuery} 
                  className="w-full"
                  disabled={!query.trim() || !queryName.trim()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  현재 쿼리 저장
                </Button>
                
                <div className="space-y-2">
                  <Label>저장된 쿼리 목록</Label>
                  {savedQueries.length > 0 ? (
                    <Select onValueChange={loadQuery}>
                      <SelectTrigger>
                        <SelectValue placeholder="저장된 쿼리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {savedQueries.map((savedQuery, index) => (
                          <SelectItem key={index} value={savedQuery.name}>
                            {savedQuery.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">저장된 쿼리가 없습니다.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>도움말</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <h3 className="font-medium">테이블 목록 조회</h3>
                  <pre className="bg-muted p-2 rounded-md mt-1 overflow-x-auto">
                    SELECT name FROM sys.tables
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-medium">테이블 구조 조회</h3>
                  <pre className="bg-muted p-2 rounded-md mt-1 overflow-x-auto">
                    {`SELECT 
  c.name, 
  t.name AS type
FROM 
  sys.columns c
JOIN 
  sys.types t ON c.user_type_id = t.user_type_id
WHERE 
  c.object_id = OBJECT_ID('테이블명')`}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-medium">쿼리 결과 제한</h3>
                  <p>최대 1,000개의 행이 표시됩니다.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* 오른쪽 메인 컨텐츠 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>SQL 쿼리 실행</CardTitle>
              <CardDescription>
                SQL 쿼리를 작성하고 실행하여 데이터베이스를 조회합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="query">쿼리 작성</TabsTrigger>
                  <TabsTrigger value="results" disabled={!queryResult}>
                    쿼리 결과 {queryResult ? `(${queryResult.rowCount}행)` : ''}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="query" className="space-y-4">
                  <Textarea
                    ref={textareaRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="SELECT * FROM 테이블명"
                    className="font-mono min-h-[300px] resize-y"
                  />
                  
                  <div className="flex justify-between">
                    <Button onClick={runQuery} disabled={isLoading || !query.trim()}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          쿼리 실행 중...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          쿼리 실행
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={downloadCSV}
                      disabled={!queryResult || queryResult.rows.length === 0}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      CSV 다운로드
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="results">
                  {queryResult && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-sm text-muted-foreground">
                            {queryResult.rowCount}개 행 반환됨 ({queryResult.executionTime}ms)
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadCSV}
                          disabled={queryResult.rows.length === 0}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          CSV 다운로드
                        </Button>
                      </div>
                      
                      {queryResult.rows.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-muted">
                                {queryResult.columns.map((column, index) => (
                                  <th key={index} className="border px-4 py-2 text-left">
                                    {column}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {queryResult.rows.map((row, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
                                  {queryResult.columns.map((column, colIndex) => (
                                    <td key={colIndex} className="border px-4 py-2">
                                      {row[column] === null || row[column] === undefined
                                        ? <span className="text-muted-foreground italic">NULL</span>
                                        : String(row[column])}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-medium">결과 없음</h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            쿼리 실행 결과가 없습니다.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
