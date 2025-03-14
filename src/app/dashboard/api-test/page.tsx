'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { AlertCircle } from 'lucide-react';
import { ApiTest, ApiTestStatus, TestStatus } from '@/lib/api-test/types';
import { fetchTestStatus, updateApiTestStatus } from '@/lib/api-test/client';
import { ApiList } from '@/components/api-test/ApiList';
import { ApiTestDetail } from '@/components/api-test/ApiTestDetail';
import { formatDate } from '@/lib/api-test/utils';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export default function ApiTestPage() {
  const [testStatus, setTestStatus] = useState<ApiTestStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('merchants');
  const [selectedApi, setSelectedApi] = useState<ApiTest | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // 테스트 상태 가져오기
  useEffect(() => {
    getTestStatus();
  }, []);

  const getTestStatus = async () => {
    try {
      setLoading(true);
      const data = await fetchTestStatus();
      setTestStatus(data);
      setLoading(false);
    } catch (error) {
      console.error('테스트 상태 가져오기 오류:', error);
      toast({
        title: '오류 발생',
        description: '테스트 상태를 가져오는데 실패했습니다.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  // 테스트 상태 새로고침
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await getTestStatus();
      toast({
        title: '새로고침 완료',
        description: '테스트 상태가 성공적으로 업데이트되었습니다.',
      });
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '테스트 상태를 새로고침하는데 실패했습니다.',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  };

  // 테스트 상태 업데이트
  const handleUpdateStatus = async (
    api: ApiTest,
    newStatus: TestStatus,
    type: 'api' | 'db'
  ) => {
    try {
      const updatedData = await updateApiTestStatus(
        selectedCategory,
        api.name,
        api.method,
        api.endpoint,
        type === 'api' ? newStatus : api.status,
        type === 'db' ? newStatus : api.dbStatus,
        api.notes
      );
      
      setTestStatus(updatedData);
      toast({
        title: '업데이트 성공',
        description: '테스트 상태가 성공적으로 업데이트되었습니다.',
      });
      
      // 선택된 API 업데이트
      if (selectedApi) {
        const updatedApi = updatedData.apis[selectedCategory].find(
          a => a.name === selectedApi.name && a.method === selectedApi.method
        );
        if (updatedApi) {
          setSelectedApi(updatedApi);
        }
      }
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '테스트 상태 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 노트 저장
  const handleSaveNotes = async (notes: string) => {
    if (!selectedApi) return;

    try {
      const updatedData = await updateApiTestStatus(
        selectedCategory,
        selectedApi.name,
        selectedApi.method,
        selectedApi.endpoint,
        selectedApi.status,
        selectedApi.dbStatus,
        notes
      );
      
      setTestStatus(updatedData);
      toast({
        title: '노트 저장 성공',
        description: '테스트 노트가 성공적으로 저장되었습니다.',
      });
      
      // 선택된 API 업데이트
      const updatedApi = updatedData.apis[selectedCategory].find(
        a => a.name === selectedApi.name && a.method === selectedApi.method
      );
      if (updatedApi) {
        setSelectedApi(updatedApi);
      }
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '노트 저장에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <PageHeader 
        title="API 테스트 상태 관리"
        description={`마지막 업데이트: ${testStatus ? formatDate(testStatus.lastUpdated) : '없음'}`}
        breadcrumbs={[
          { label: '대시보드', href: '/dashboard' },
          { label: 'API 테스트' }
        ]}
        actions={
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>API 카테고리</CardTitle>
              <CardDescription>테스트할 API 카테고리를 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value);
                  setSelectedApi(null);
                }}
              >
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="merchants">가맹점</TabsTrigger>
                  <TabsTrigger value="transactions">거래</TabsTrigger>
                  <TabsTrigger value="deposits">입금</TabsTrigger>
                </TabsList>

                {testStatus &&
                  Object.keys(testStatus.apis).map((category) => (
                    <TabsContent key={category} value={category}>
                      <ApiList
                        apis={testStatus.apis[category]}
                        selectedApi={selectedApi}
                        onSelectApi={setSelectedApi}
                      />
                    </TabsContent>
                  ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedApi ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedApi.name}</CardTitle>
                <CardDescription>
                  {selectedApi.method} {selectedApi.endpoint}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApiTestDetail
                  selectedApi={selectedApi}
                  onUpdateStatus={handleUpdateStatus}
                  onSaveNotes={handleSaveNotes}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>API 테스트 상태 관리</CardTitle>
                <CardDescription>왼쪽에서 API를 선택하여 테스트 상태를 관리하세요.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4" />
                  <p>API를 선택하면 테스트 상태를 확인하고 업데이트할 수 있습니다.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
