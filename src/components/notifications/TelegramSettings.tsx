'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Send } from 'lucide-react';
import { getTelegramConfig, sendMessage, sendPaymentNotification, sendErrorNotification } from '@/lib/notifications/client';
import { NotificationType } from '@/lib/notifications/types';

/**
 * 텔레그램 설정 컴포넌트 Props 인터페이스
 */
interface TelegramSettingsProps {
  className?: string;
}

/**
 * 텔레그램 설정 및 테스트 컴포넌트
 * 
 * 텔레그램 봇 설정 정보를 확인하고 테스트 메시지를 보낼 수 있는 UI를 제공합니다.
 */
export function TelegramSettings({ className }: TelegramSettingsProps) {
  // 상태 관리
  const [isConfigured, setIsConfigured] = useState<boolean>(false);
  const [botToken, setBotToken] = useState<string>('');
  const [chatId, setChatId] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [testMessage, setTestMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<string>('settings');

  // 텔레그램 설정 정보 로드
  useEffect(() => {
    const loadTelegramConfig = async () => {
      const response = await getTelegramConfig();
      
      if (response.success && response.data) {
        setIsConfigured(response.data.isConfigured);
        setBotToken(response.data.botToken);
        setChatId(response.data.chatId);
      }
    };
    
    loadTelegramConfig();
  }, []);

  // 테스트 메시지 전송 함수
  const handleSendTestMessage = async () => {
    if (!testMessage.trim()) return;
    
    setIsSending(true);
    setResult(null);
    
    try {
      const response = await sendMessage(testMessage);
      
      setResult({
        success: response.success,
        message: response.success 
          ? '메시지가 성공적으로 전송되었습니다.' 
          : response.message || '메시지 전송에 실패했습니다.'
      });
    } catch (error) {
      setResult({
        success: false,
        message: '메시지 전송 중 오류가 발생했습니다.'
      });
    } finally {
      setIsSending(false);
    }
  };

  // 결제 알림 테스트 함수
  const handleSendPaymentTest = async () => {
    setIsSending(true);
    setResult(null);
    
    try {
      const response = await sendPaymentNotification({
        merchantName: '테스트 가맹점',
        amount: 50000,
        orderId: `ORD-${new Date().getTime().toString().slice(-8)}`,
        paymentMethod: '신용카드'
      });
      
      setResult({
        success: response.success,
        message: response.success 
          ? '결제 알림이 성공적으로 전송되었습니다.' 
          : response.message || '결제 알림 전송에 실패했습니다.'
      });
    } catch (error) {
      setResult({
        success: false,
        message: '결제 알림 전송 중 오류가 발생했습니다.'
      });
    } finally {
      setIsSending(false);
    }
  };

  // 오류 알림 테스트 함수
  const handleSendErrorTest = async () => {
    setIsSending(true);
    setResult(null);
    
    try {
      const response = await sendErrorNotification({
        errorType: '데이터베이스 오류',
        errorMessage: '결제 정보 저장 중 데이터베이스 연결이 끊겼습니다.',
        details: {
          transactionId: `TX-${new Date().getTime().toString().slice(-8)}`,
          timestamp: new Date().toISOString()
        }
      });
      
      setResult({
        success: response.success,
        message: response.success 
          ? '오류 알림이 성공적으로 전송되었습니다.' 
          : response.message || '오류 알림 전송에 실패했습니다.'
      });
    } catch (error) {
      setResult({
        success: false,
        message: '오류 알림 전송 중 오류가 발생했습니다.'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          텔레그램 알림 설정
          <Badge variant={isConfigured ? "success" : "destructive"}>
            {isConfigured ? '설정됨' : '미설정'}
          </Badge>
        </CardTitle>
        <CardDescription>
          중요한 이벤트가 발생할 때 텔레그램으로 알림을 받을 수 있습니다.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">설정</TabsTrigger>
            <TabsTrigger value="test">테스트</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">알림 활성화</h4>
                <p className="text-sm text-muted-foreground">
                  텔레그램 알림 기능을 켜거나 끕니다.
                </p>
              </div>
              <Switch
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="botToken">봇 토큰</Label>
              <Input
                id="botToken"
                value={botToken}
                readOnly
                type="password"
              />
              <p className="text-xs text-muted-foreground">
                봇 토큰은 보안을 위해 마스킹 처리되어 있습니다. 변경이 필요한 경우 .env 파일을 수정하세요.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chatId">채팅 ID</Label>
              <Input
                id="chatId"
                value={chatId}
                readOnly
              />
              <p className="text-xs text-muted-foreground">
                채팅 ID는 알림을 받을 텔레그램 채팅방의 고유 식별자입니다. 변경이 필요한 경우 .env 파일을 수정하세요.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="test" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="testMessage">테스트 메시지</Label>
              <div className="flex space-x-2">
                <Input
                  id="testMessage"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="테스트 메시지를 입력하세요"
                />
                <Button 
                  onClick={handleSendTestMessage} 
                  disabled={isSending || !testMessage.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  전송
                </Button>
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <h4 className="text-sm font-medium">알림 유형 테스트</h4>
              <p className="text-sm text-muted-foreground">
                다양한 유형의 알림을 테스트해볼 수 있습니다.
              </p>
              
              <div className="flex flex-wrap gap-2 mt-2">
                <Button 
                  variant="outline" 
                  onClick={handleSendPaymentTest}
                  disabled={isSending}
                >
                  결제 알림 테스트
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleSendErrorTest}
                  disabled={isSending}
                >
                  오류 알림 테스트
                </Button>
              </div>
            </div>
            
            {result && (
              <div className={`p-3 rounded-md mt-4 ${
                result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <div className="flex items-start">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  )}
                  <p className="text-sm">{result.message}</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <p className="text-xs text-muted-foreground">
          마지막 업데이트: {new Date().toLocaleString('ko-KR')}
        </p>
      </CardFooter>
    </Card>
  );
}
