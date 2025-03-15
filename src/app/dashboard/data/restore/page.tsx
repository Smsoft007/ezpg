'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Database, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getBackupList, restoreDatabase, getDatabaseJobStatus } from '@/app/api/database/client';
import { DatabaseBackup, DatabaseJobStatus } from '@/docs/api/database';
import { toast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
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
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

export default function DatabaseRestorePage() {
  const [backups, setBackups] = useState<DatabaseBackup[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState<boolean>(false);
  const [selectedBackupId, setSelectedBackupId] = useState<string>('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [restoreOptions, setRestoreOptions] = useState({
    overwriteExisting: true,
  });
  const [restoreJobId, setRestoreJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<{
    status: DatabaseJobStatus;
    progress: number;
    message?: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  // 작업 상태 확인 인터벌 설정
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (restoreJobId && (jobStatus?.status === DatabaseJobStatus.PENDING || jobStatus?.status === DatabaseJobStatus.RUNNING)) {
      intervalId = setInterval(checkJobStatus, 2000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [restoreJobId, jobStatus?.status]);

  // 작업 상태 확인
  const checkJobStatus = async () => {
    if (!restoreJobId) return;
    
    try {
      const response = await getDatabaseJobStatus({ jobId: restoreJobId });
      setJobStatus({
        status: response.status,
        progress: response.progress,
        message: response.message,
      });
      
      if (response.status === DatabaseJobStatus.COMPLETED || response.status === DatabaseJobStatus.FAILED) {
        setIsRestoring(false);
        
        if (response.status === DatabaseJobStatus.COMPLETED) {
          toast({
            title: '복원 완료',
            description: '데이터베이스가 성공적으로 복원되었습니다.',
          });
        } else {
          toast({
            title: '복원 실패',
            description: response.message || '데이터베이스 복원 중 오류가 발생했습니다.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('작업 상태 확인 오류:', error);
    }
  };

  // 복원 확인 다이얼로그 열기
  const openConfirmDialog = () => {
    if (!selectedBackupId) {
      toast({
        title: '백업 선택 필요',
        description: '복원할 백업을 선택해주세요.',
        variant: 'destructive',
      });
      return;
    }
    
    setConfirmDialogOpen(true);
  };

  // 데이터베이스 복원 실행
  const handleRestoreDatabase = async () => {
    setIsRestoring(true);
    setConfirmDialogOpen(false);
    
    try {
      const response = await restoreDatabase({
        backupId: selectedBackupId,
        restoreOptions: {
          overwriteExisting: restoreOptions.overwriteExisting,
        },
      });
      
      setRestoreJobId('restore-job-123'); // 실제로는 API에서 반환된 작업 ID를 사용
      setJobStatus({
        status: DatabaseJobStatus.RUNNING,
        progress: 0,
        message: '복원 작업이 시작되었습니다.',
      });
      
      toast({
        title: '복원 시작',
        description: '데이터베이스 복원 작업이 시작되었습니다.',
      });
    } catch (error) {
      console.error('복원 시작 오류:', error);
      setIsRestoring(false);
      toast({
        title: '복원 시작 오류',
        description: error instanceof Error ? error.message : '복원 작업을 시작하는 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
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

  // 백업 필터링
  const filteredBackups = backups.filter(backup => 
    backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (backup.description && backup.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    backup.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 선택된 백업 정보
  const selectedBackup = backups.find(backup => backup.id === selectedBackupId);

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">데이터베이스 복원</h1>

      {/* 진행 중인 복원 작업 상태 */}
      {isRestoring && jobStatus && (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle>복원 작업 진행 중</CardTitle>
            <CardDescription>
              데이터베이스 복원 작업이 진행 중입니다. 이 과정은 몇 분 정도 소요될 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">진행 상태</span>
                  <span className="text-sm text-muted-foreground">{jobStatus.progress}%</span>
                </div>
                <Progress value={jobStatus.progress} className="h-2" />
              </div>
              
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{jobStatus.message || '복원 작업이 진행 중입니다...'}</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {jobStatus.status === DatabaseJobStatus.PENDING ? '작업 대기 중...' : '복원 작업 진행 중...'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 백업 목록 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>백업 목록</CardTitle>
                <CardDescription>
                  복원할 백업 파일을 선택하세요.
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
              <div className="mb-4">
                <Input
                  placeholder="백업 이름, 설명 또는 생성자로 검색"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {isLoadingBackups ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredBackups.length > 0 ? (
                <div className="overflow-x-auto">
                  <RadioGroup value={selectedBackupId} onValueChange={setSelectedBackupId}>
                    <Table>
                      <TableCaption>총 {filteredBackups.length}개의 백업이 있습니다.</TableCaption>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">선택</TableHead>
                          <TableHead>백업 이름</TableHead>
                          <TableHead>생성 일시</TableHead>
                          <TableHead>크기</TableHead>
                          <TableHead>생성자</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBackups.map((backup) => (
                          <TableRow key={backup.id} className={selectedBackupId === backup.id ? 'bg-muted/50' : ''}>
                            <TableCell>
                              <RadioGroupItem value={backup.id} id={backup.id} />
                            </TableCell>
                            <TableCell className="font-medium">
                              <Label htmlFor={backup.id} className="cursor-pointer">
                                {backup.name}
                                {backup.description && (
                                  <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                                    {backup.description}
                                  </p>
                                )}
                              </Label>
                            </TableCell>
                            <TableCell>
                              <Label htmlFor={backup.id} className="cursor-pointer">
                                {format(new Date(backup.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}
                              </Label>
                            </TableCell>
                            <TableCell>
                              <Label htmlFor={backup.id} className="cursor-pointer">
                                {formatFileSize(backup.size)}
                              </Label>
                            </TableCell>
                            <TableCell>
                              <Label htmlFor={backup.id} className="cursor-pointer">
                                {backup.createdBy}
                              </Label>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </RadioGroup>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">백업 없음</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {searchTerm
                      ? '검색 조건에 맞는 백업이 없습니다.'
                      : '아직 생성된 백업이 없습니다. 먼저 백업을 생성하세요.'}
                  </p>
                  {searchTerm && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setSearchTerm('')}
                    >
                      검색 초기화
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 복원 옵션 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>복원 옵션</CardTitle>
              <CardDescription>
                데이터베이스 복원 방법을 선택하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overwriteExisting"
                  checked={restoreOptions.overwriteExisting}
                  onCheckedChange={(checked) => 
                    setRestoreOptions({ ...restoreOptions, overwriteExisting: checked as boolean })
                  }
                />
                <Label htmlFor="overwriteExisting">기존 데이터 덮어쓰기</Label>
              </div>
              
              <Alert variant="warning" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>주의</AlertTitle>
                <AlertDescription>
                  복원 작업은 현재 데이터베이스의 데이터를 백업 시점의 데이터로 대체합니다.
                  이 작업은 되돌릴 수 없으며, 복원 후 현재 데이터는 손실될 수 있습니다.
                </AlertDescription>
              </Alert>
              
              {selectedBackup && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  <h3 className="text-sm font-medium mb-2">선택된 백업 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">백업 이름:</span>
                      <span>{selectedBackup.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">생성 일시:</span>
                      <span>{format(new Date(selectedBackup.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">크기:</span>
                      <span>{formatFileSize(selectedBackup.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">생성자:</span>
                      <span>{selectedBackup.createdBy}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={openConfirmDialog}
                disabled={!selectedBackupId || isRestoring}
              >
                {isRestoring ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    복원 중...
                  </>
                ) : (
                  '복원 시작'
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* 복원 확인 다이얼로그 */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>데이터베이스 복원 확인</DialogTitle>
            <DialogDescription>
              정말로 선택한 백업으로 데이터베이스를 복원하시겠습니까?
              이 작업은 되돌릴 수 없으며, 현재 데이터가 손실될 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBackup && (
            <div className="py-4">
              <h3 className="text-sm font-medium mb-2">복원할 백업 정보</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">백업 이름:</span>
                  <span>{selectedBackup.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">생성 일시:</span>
                  <span>{format(new Date(selectedBackup.createdAt), 'yyyy-MM-dd HH:mm:ss', { locale: ko })}</span>
                </div>
              </div>
            </div>
          )}
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>경고</AlertTitle>
            <AlertDescription>
              이 작업은 현재 데이터베이스의 모든 데이터를 백업 시점의 데이터로 대체합니다.
              복원 작업 중에는 시스템을 사용할 수 없으며, 복원 후 현재 데이터는 손실됩니다.
            </AlertDescription>
          </Alert>
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              취소
            </Button>
            <Button variant="destructive" onClick={handleRestoreDatabase}>
              복원 진행
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
