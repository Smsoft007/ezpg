/**
 * API 테스트 상세 정보 컴포넌트
 */
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ApiTest, TestStatus } from '@/lib/api-test/types';
import { formatDate } from '@/lib/api-test/utils';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useState } from 'react';

interface ApiTestDetailProps {
  selectedApi: ApiTest;
  onUpdateStatus: (
    api: ApiTest,
    newStatus: TestStatus,
    type: 'api' | 'db'
  ) => Promise<void>;
  onSaveNotes: (notes: string) => Promise<void>;
}

export function ApiTestDetail({
  selectedApi,
  onUpdateStatus,
  onSaveNotes,
}: ApiTestDetailProps) {
  const [notes, setNotes] = useState<string>(selectedApi.notes || '');

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium mb-2">API 테스트 상태</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedApi.status === 'success' ? 'default' : 'outline'}
              className={
                selectedApi.status === 'success'
                  ? 'bg-green-500 hover:bg-green-600'
                  : ''
              }
              onClick={() => onUpdateStatus(selectedApi, 'success', 'api')}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" /> 성공
            </Button>
            <Button
              size="sm"
              variant={selectedApi.status === 'fail' ? 'default' : 'outline'}
              className={
                selectedApi.status === 'fail'
                  ? 'bg-red-500 hover:bg-red-600'
                  : ''
              }
              onClick={() => onUpdateStatus(selectedApi, 'fail', 'api')}
            >
              <AlertCircle className="h-4 w-4 mr-1" /> 실패
            </Button>
            <Button
              size="sm"
              variant={
                selectedApi.status === 'not-tested' ? 'default' : 'outline'
              }
              className={
                selectedApi.status === 'not-tested'
                  ? 'bg-gray-500 hover:bg-gray-600'
                  : ''
              }
              onClick={() => onUpdateStatus(selectedApi, 'not-tested', 'api')}
            >
              <Clock className="h-4 w-4 mr-1" /> 미테스트
            </Button>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2">DB 테스트 상태</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={selectedApi.dbStatus === 'success' ? 'default' : 'outline'}
              className={
                selectedApi.dbStatus === 'success'
                  ? 'bg-green-500 hover:bg-green-600'
                  : ''
              }
              onClick={() => onUpdateStatus(selectedApi, 'success', 'db')}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" /> 성공
            </Button>
            <Button
              size="sm"
              variant={selectedApi.dbStatus === 'fail' ? 'default' : 'outline'}
              className={
                selectedApi.dbStatus === 'fail'
                  ? 'bg-red-500 hover:bg-red-600'
                  : ''
              }
              onClick={() => onUpdateStatus(selectedApi, 'fail', 'db')}
            >
              <AlertCircle className="h-4 w-4 mr-1" /> 실패
            </Button>
            <Button
              size="sm"
              variant={
                selectedApi.dbStatus === 'not-tested' ? 'default' : 'outline'
              }
              className={
                selectedApi.dbStatus === 'not-tested'
                  ? 'bg-gray-500 hover:bg-gray-600'
                  : ''
              }
              onClick={() => onUpdateStatus(selectedApi, 'not-tested', 'db')}
            >
              <Clock className="h-4 w-4 mr-1" /> 미테스트
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">마지막 테스트 시간</h3>
        <p>{formatDate(selectedApi.lastTested)}</p>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">테스트 노트</h3>
        <Textarea
          placeholder="테스트 결과, 이슈, 해결 방법 등을 기록하세요."
          className="min-h-[150px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <Button className="mt-4" onClick={() => onSaveNotes(notes)}>
          노트 저장
        </Button>
      </div>
    </div>
  );
}
