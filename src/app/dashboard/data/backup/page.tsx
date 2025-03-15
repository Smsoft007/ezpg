'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Database, Save, DownloadCloud, Clock, FileText, RefreshCw } from 'lucide-react';
import { createBackup, getBackupList } from '@/app/api/database/client';
import { DatabaseBackup } from '@/docs/api/database';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function DatabaseBackupPage() {
  const [backupName, setBackupName] = useState<string>(`백업_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`);
  const [description, setDescription] = useState<string>('');
  const [includeSchema, setIncludeSchema] = useState<boolean>(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState<boolean>(false);
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('create');
  const [selectedBackup, setSelectedBackup] = useState<DatabaseBackup | null>(null);
  const [backupDetailsOpen, setBackupDetailsOpen] = useState<boolean>(false);

  // 백업 목록 로드
  const loadBackups = async () => {
    setIsLoadingBackups(true);
    try {
      const response = await getBackupList();
      setBackups(response.backups);
    } catch (error) {
      console.error('백업 목록 로드 오류:', error);
      toast({
        title: '백업 목록 로드 오류',
        description: error instanceof Error ? error.message : '백업 목록을 로드하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingBackups(false);
    }
  };

  // 컴포넌트 마운트 시 백업 목록 로드
  useEffect(() => {
    loadBackups();
  }, []);

  // 백업 생성 함수
  const handleCreateBackup = async () => {
    if (!backupName.trim()) {
      toast({
        title: '백업 이름 필요',
        description: '백업 이름을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingBackup(true);
    try {
      const response = await createBackup({
        backupName,
        description: description.trim() || undefined,
        includeSchema,
      });

      toast({
        title: '백업 생성 성공',
        description: `백업 "${backupName}"이(가) 성공적으로 생성되었습니다.`,
      });

      // 백업 생성 후 폼 초기화
      setBackupName(`백업_${format(new Date(), 'yyyy-MM-dd_HH-mm')}`);
      setDescription('');
      
      // 백업 목록 탭으로 전환하고 목록 새로고침
      setActiveTab('list');
      loadBackups();
    } catch (error) {
      console.error('백업 생성 오류:', error);
      toast({
        title: '백업 생성 오류',
        description: error instanceof Error ? error.message : '백업을 생성하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // 파일 크기 포맷 함수
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 백업 상세 정보 표시
  const showBackupDetails = (backup: DatabaseBackup) => {
    setSelectedBackup(backup);
    setBackupDetailsOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">데이터베이스 백업</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="create">백업 생성</TabsTrigger>
          <TabsTrigger value="list">백업 목록</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>새 백업 생성</CardTitle>
              <CardDescription>
                데이터베이스의 현재 상태를 백업합니다. 백업은 나중에 복원할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backupName">백업 이름</Label>
                <Input
                  id="backupName"
                  value={backupName}
                  onChange={(e) => setBackupName(e.target.value)}
                  placeholder="백업 이름"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명 (선택사항)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="백업에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeSchema"
                  checked={includeSchema}
                  onCheckedChange={(checked) => setIncludeSchema(checked as boolean)}
                />
                <Label htmlFor="includeSchema">스키마 정보 포함</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('list')}>
                백업 목록 보기
              </Button>
              <Button onClick={handleCreateBackup} disabled={isCreatingBackup || !backupName.trim()}>
                {isCreatingBackup ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    백업 생성 중...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    백업 생성
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>백업 목록</CardTitle>
                <CardDescription>
                  생성된 데이터베이스 백업 목록입니다.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={loadBackups} disabled={isLoadingBackups}>
                {isLoadingBackups ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoadingBackups ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : backups.length > 0 ? (
                <Table>
                  <TableCaption>총 {backups.length}개의 백업이 있습니다.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>백업 이름</TableHead>
                      <TableHead>생성 일시</TableHead>
                      <TableHead>크기</TableHead>
                      <TableHead>생성자</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell className="font-medium">{backup.name}</TableCell>
                        <TableCell>
                          {format(new Date(backup.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
                        </TableCell>
                        <TableCell>{formatFileSize(backup.size)}</TableCell>
                        <TableCell>{backup.createdBy}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showBackupDetails(backup)}
                          >
                            상세 정보
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">백업 없음</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    아직 생성된 백업이 없습니다. '백업 생성' 탭에서 새 백업을 생성하세요.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab('create')}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    새 백업 생성
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 백업 상세 정보 다이얼로그 */}
      <Dialog open={backupDetailsOpen} onOpenChange={setBackupDetailsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>백업 상세 정보</DialogTitle>
            <DialogDescription>
              백업 파일의 상세 정보와 복원 옵션입니다.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBackup && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">백업 ID</h4>
                  <p className="text-sm">{selectedBackup.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">백업 이름</h4>
                  <p className="text-sm">{selectedBackup.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">생성 일시</h4>
                  <p className="text-sm">
                    {format(new Date(selectedBackup.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">크기</h4>
                  <p className="text-sm">{formatFileSize(selectedBackup.size)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">생성자</h4>
                  <p className="text-sm">{selectedBackup.createdBy}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">백업 경로</h4>
                  <p className="text-sm truncate">{selectedBackup.path}</p>
                </div>
              </div>
              
              {selectedBackup.description && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">설명</h4>
                  <p className="text-sm mt-1 p-2 bg-muted rounded-md">{selectedBackup.description}</p>
                </div>
              )}
              
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">백업 작업</h4>
                <div className="flex space-x-2">
                  <Button variant="default" className="flex-1">
                    <DownloadCloud className="mr-2 h-4 w-4" />
                    복원하기
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <FileText className="mr-2 h-4 w-4" />
                    다운로드
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
