/**
 * API 테스트 상태 배지 컴포넌트
 */
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { TestStatus } from '@/lib/api-test/types';

interface StatusBadgeProps {
  status: TestStatus;
  type?: 'api' | 'db';
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const label = type ? `${type === 'api' ? 'API' : 'DB'}: ` : '';

  switch (status) {
    case 'success':
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <CheckCircle2 className="h-4 w-4 mr-1" /> {label}성공
        </Badge>
      );
    case 'fail':
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
          <AlertCircle className="h-4 w-4 mr-1" /> {label}실패
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-500 hover:bg-gray-600">
          <Clock className="h-4 w-4 mr-1" /> {label}미테스트
        </Badge>
      );
  }
}
