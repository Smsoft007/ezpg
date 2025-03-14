import React, { useState } from 'react';
import { SystemSetting } from '@/docs/interface/system';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, Undo, Plus } from 'lucide-react';

interface SystemSettingsProps {
  settings: SystemSetting[];
  onSave?: (settings: SystemSetting[]) => void;
  onReset?: () => void;
  isLoading?: boolean;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  settings,
  onSave,
  onReset,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [editedSettings, setEditedSettings] = useState<SystemSetting[]>(settings);

  // 설정 그룹 추출
  const groups = [...new Set(settings.map((setting) => setting.group))];

  // 설정 변경 핸들러
  const handleSettingChange = (settingId: string, value: string) => {
    setEditedSettings((prev) =>
      prev.map((setting) =>
        setting.settingId === settingId ? { ...setting, value } : setting
      )
    );
  };

  // 변경 사항 저장
  const handleSave = () => {
    if (onSave) {
      onSave(editedSettings);
    }
  };

  // 변경 사항 초기화
  const handleReset = () => {
    setEditedSettings(settings);
    if (onReset) {
      onReset();
    }
  };

  // 필터링된 설정
  const filteredSettings = editedSettings.filter((setting) => {
    if (activeTab === 'all') return true;
    return setting.group === activeTab;
  });

  // 설정 값 렌더링 함수
  const renderSettingInput = (setting: SystemSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value === 'true'}
            onCheckedChange={(checked: boolean) => handleSettingChange(setting.settingId, checked ? 'true' : 'false')}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingChange(setting.settingId, e.target.value)}
          />
        );
      case 'json':
        return (
          <Textarea
            value={setting.value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleSettingChange(setting.settingId, e.target.value)}
            className="font-mono text-sm"
            rows={4}
          />
        );
      case 'string':
      default:
        return (
          <Input
            type="text"
            value={setting.value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSettingChange(setting.settingId, e.target.value)}
          />
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>시스템 설정</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} disabled={isLoading}>
              <Undo className="h-4 w-4 mr-2" /> 초기화
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" /> 저장
            </Button>
          </div>
        </div>
        <CardDescription>시스템 설정을 관리하고 구성합니다</CardDescription>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8">
            <TabsTrigger value="all">전체</TabsTrigger>
            {groups.map((group) => (
              <TabsTrigger key={group} value={group}>
                {group}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>로딩 중...</p>
          </div>
        ) : filteredSettings.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p>설정이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSettings.map((setting) => (
              <div key={setting.settingId} className="p-4 border rounded-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-medium">{setting.name}</h3>
                      {setting.isPublic ? (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          공개
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                          비공개
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{setting.description || '설명 없음'}</p>
                    <p className="text-xs text-gray-400">코드: {setting.code}</p>
                  </div>
                  <div className="w-full md:w-1/3">
                    <Label htmlFor={setting.settingId} className="sr-only">
                      {setting.name}
                    </Label>
                    {renderSettingInput(setting)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemSettings;
