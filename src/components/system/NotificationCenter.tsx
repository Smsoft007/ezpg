import React, { useState } from 'react';
import { Notification } from '@/docs/interface/system';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, CheckCircle, AlertCircle, AlertTriangle, Info, ExternalLink, Trash2, CheckCheck } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead?: (notificationId: string) => void;
  onMarkAllAsRead?: () => void;
  onDelete?: (notificationId: string) => void;
  onAction?: (notification: Notification) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onAction,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');

  // 알림 심각도에 따른 아이콘 반환
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  // 알림 상태에 따른 필터링
  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return notification.status === 'unread';
    if (activeTab === 'read') return notification.status === 'read';
    return true;
  });

  // 알림 날짜 형식화
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return '방금 전';
    } else if (diffMins < 60) {
      return `${diffMins}분 전`;
    } else if (diffHours < 24) {
      return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  // 읽지 않은 알림 개수
  const unreadCount = notifications.filter((n) => n.status === 'unread').length;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>알림 센터</CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          {onMarkAllAsRead && unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onMarkAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-1" /> 모두 읽음
            </Button>
          )}
        </div>
        <CardDescription>시스템 알림 및 중요 메시지를 확인하세요</CardDescription>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">전체</TabsTrigger>
            <TabsTrigger value="unread">읽지 않음</TabsTrigger>
            <TabsTrigger value="read">읽음</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <Bell className="h-10 w-10 mb-2 opacity-20" />
              <p>알림이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.notificationId}
                  className={`p-4 rounded-lg border ${notification.status === 'unread' ? 'bg-gray-50' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(notification.severity)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium">{notification.title}</h4>
                        <span className="text-xs text-gray-500">{formatDate(notification.sentAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex gap-2">
                          {notification.status === 'unread' && onMarkAsRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkAsRead(notification.notificationId)}
                              className="h-8 px-2 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> 읽음
                            </Button>
                          )}
                          {notification.actionUrl && onAction && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onAction(notification)}
                              className="h-8 px-2 text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" /> 이동
                            </Button>
                          )}
                        </div>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(notification.notificationId)}
                            className="h-8 px-2 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
