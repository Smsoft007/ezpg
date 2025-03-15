"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectionStatus } from "@/components/database/ConnectionStatus";
import { getTableList, getBackupList } from "@/app/api/database/client";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Database, HardDrive, TableProperties, RefreshCw } from "lucide-react";

export default function DatabasePage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [tables, setTables] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [backupsError, setBackupsError] = useState<string | null>(null);

  // 테이블 목록 로드
  const loadTables = async () => {
    setIsLoadingTables(true);
    setTablesError(null);
    
    try {
      const response = await getTableList();
      setTables(response.tables || []);
    } catch (error) {
      console.error("테이블 목록 로드 오류:", error);
      setTablesError(error instanceof Error ? error.message : "테이블 목록을 불러올 수 없습니다.");
    } finally {
      setIsLoadingTables(false);
    }
  };

  // 백업 목록 로드
  const loadBackups = async () => {
    setIsLoadingBackups(true);
    setBackupsError(null);
    
    try {
      const response = await getBackupList();
      setBackups(response.backups || []);
    } catch (error) {
      console.error("백업 목록 로드 오류:", error);
      setBackupsError(error instanceof Error ? error.message : "백업 목록을 불러올 수 없습니다.");
    } finally {
      setIsLoadingBackups(false);
    }
  };

  // 탭 변경 시 데이터 로드
  useEffect(() => {
    if (activeTab === "tables") {
      loadTables();
    } else if (activeTab === "backups") {
      loadBackups();
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">데이터베이스 관리</h1>
          <p className="text-muted-foreground">
            데이터베이스 연결 상태를 확인하고 테이블 및 백업을 관리합니다.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>개요</span>
          </TabsTrigger>
          <TabsTrigger value="tables" className="flex items-center gap-2">
            <TableProperties className="h-4 w-4" />
            <span>테이블</span>
          </TabsTrigger>
          <TabsTrigger value="backups" className="flex items-center gap-2">
            <HardDrive className="h-4 w-4" />
            <span>백업</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ConnectionStatus className="md:col-span-2 lg:col-span-1" />
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>데이터베이스 정보</CardTitle>
                <CardDescription>
                  데이터베이스 서버 및 연결 정보
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">서버</span>
                    <span className="text-muted-foreground">{process.env.NEXT_PUBLIC_DB_HOST || process.env.DB_HOST || '설정되지 않음'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">포트</span>
                    <span className="text-muted-foreground">{process.env.NEXT_PUBLIC_DB_PORT || process.env.DB_PORT || '설정되지 않음'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">데이터베이스</span>
                    <span className="text-muted-foreground">{process.env.NEXT_PUBLIC_DB_NAME || process.env.DB_NAME || '설정되지 않음'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="font-medium">사용자</span>
                    <span className="text-muted-foreground">{process.env.NEXT_PUBLIC_DB_USER || process.env.DB_USER || '설정되지 않음'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">백업 디렉토리</span>
                    <span className="text-muted-foreground">{process.env.BACKUP_DIR || '설정되지 않음'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tables" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>테이블 목록</CardTitle>
                <CardDescription>
                  데이터베이스에 존재하는 테이블 목록입니다
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadTables}
                disabled={isLoadingTables}
              >
                {isLoadingTables ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingTables ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : tablesError ? (
                <div className="py-4 text-center text-destructive">
                  <p>{tablesError}</p>
                </div>
              ) : tables.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">
                  <p>테이블이 없거나 불러올 수 없습니다</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>전체 테이블 수: {tables.length}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>테이블명</TableHead>
                      <TableHead>행 수</TableHead>
                      <TableHead>크기</TableHead>
                      <TableHead className="text-right">상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tables.map((table) => (
                      <TableRow key={table.name}>
                        <TableCell className="font-medium">{table.name}</TableCell>
                        <TableCell>{table.rowCount?.toLocaleString() || '-'}</TableCell>
                        <TableCell>{table.size ? `${(table.size / 1024).toFixed(2)} KB` : '-'}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                            정상
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>백업 목록</CardTitle>
                <CardDescription>
                  데이터베이스 백업 파일 목록입니다
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadBackups}
                  disabled={isLoadingBackups}
                >
                  {isLoadingBackups ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
                <Button size="sm">
                  새 백업 생성
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBackups ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : backupsError ? (
                <div className="py-4 text-center text-destructive">
                  <p>{backupsError}</p>
                </div>
              ) : backups.length === 0 ? (
                <div className="py-4 text-center text-muted-foreground">
                  <p>백업이 없거나 불러올 수 없습니다</p>
                </div>
              ) : (
                <Table>
                  <TableCaption>전체 백업 수: {backups.length}</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>파일명</TableHead>
                      <TableHead>생성일시</TableHead>
                      <TableHead>크기</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">{backup.filename}</TableCell>
                        <TableCell>{new Date(backup.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{backup.size ? `${(backup.size / (1024 * 1024)).toFixed(2)} MB` : '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              복원
                            </Button>
                            <Button variant="outline" size="sm" className="text-destructive">
                              삭제
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
