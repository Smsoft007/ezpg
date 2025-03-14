/**
 * API 목록 컴포넌트
 */
import { Badge } from '@/components/ui/badge';
import { ApiTest } from '@/lib/api-test/types';
import { StatusBadge } from './StatusBadge';

interface ApiListProps {
  apis: ApiTest[];
  selectedApi: ApiTest | null;
  onSelectApi: (api: ApiTest) => void;
}

export function ApiList({ apis, selectedApi, onSelectApi }: ApiListProps) {
  return (
    <div className="space-y-2">
      {apis.map((api, index) => (
        <div
          key={index}
          className={`p-3 rounded-md cursor-pointer transition-colors ${
            selectedApi?.name === api.name && selectedApi?.method === api.method
              ? 'bg-primary/10'
              : 'hover:bg-muted'
          }`}
          onClick={() => onSelectApi(api)}
        >
          <div className="font-medium">{api.name}</div>
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <Badge variant="outline">{api.method}</Badge>
            <span>{api.endpoint}</span>
          </div>
          <div className="flex gap-2 mt-2">
            <div className="text-xs">
              <StatusBadge status={api.status} type="api" />
            </div>
            <div className="text-xs">
              <StatusBadge status={api.dbStatus} type="db" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
