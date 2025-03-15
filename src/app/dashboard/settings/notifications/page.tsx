'use client';

import React from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { TelegramSettings } from '@/components/notifications/TelegramSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Mail, MessageSquare, Smartphone } from 'lucide-react';

/**
 * 알림 설정 페이지
 * 
 * 다양한 알림 채널(텔레그램, 이메일, SMS 등)에 대한 설정을 관리하는 페이지입니다.
 */
export default function NotificationsSettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="알림 설정"
        description="시스템 알림 설정을 관리합니다."
        className="mb-6"
      />
      
      <Tabs defaultValue="channels" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="channels">알림 채널</TabsTrigger>
          <TabsTrigger value="events">이벤트 설정</TabsTrigger>
          <TabsTrigger value="templates">알림 템플릿</TabsTrigger>
        </TabsList>
        
        <TabsContent value="channels" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 텔레그램 설정 카드 */}
            <TelegramSettings />
            
            {/* 이메일 설정 카드 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="h-5 w-5 mr-2" />
                  이메일 알림 설정
                </CardTitle>
                <CardDescription>
                  중요한 이벤트가 발생할 때 이메일로 알림을 받을 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">알림 활성화</h4>
                    <p className="text-sm text-muted-foreground">
                      이메일 알림 기능을 켜거나 끕니다.
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailSender">발신자 이메일</Label>
                  <Input
                    id="emailSender"
                    placeholder="noreply@ez-pg.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="emailRecipients">수신자 이메일</Label>
                  <Input
                    id="emailRecipients"
                    placeholder="admin@example.com, manager@example.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    여러 이메일은 쉼표로 구분하여 입력하세요.
                  </p>
                </div>
                
                <Button className="w-full" variant="outline">
                  테스트 이메일 보내기
                </Button>
              </CardContent>
            </Card>
            
            {/* SMS 설정 카드 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Smartphone className="h-5 w-5 mr-2" />
                  SMS 알림 설정
                </CardTitle>
                <CardDescription>
                  중요한 이벤트가 발생할 때 SMS로 알림을 받을 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">알림 활성화</h4>
                    <p className="text-sm text-muted-foreground">
                      SMS 알림 기능을 켜거나 끕니다.
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="smsProvider">SMS 제공업체</Label>
                  <Input
                    id="smsProvider"
                    placeholder="SENS, Twilio 등"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phoneNumbers">수신자 전화번호</Label>
                  <Input
                    id="phoneNumbers"
                    placeholder="010-1234-5678, 010-9876-5432"
                  />
                  <p className="text-xs text-muted-foreground">
                    여러 전화번호는 쉼표로 구분하여 입력하세요.
                  </p>
                </div>
                
                <Button className="w-full" variant="outline">
                  테스트 SMS 보내기
                </Button>
              </CardContent>
            </Card>
            
            {/* 웹훅 설정 카드 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  웹훅 알림 설정
                </CardTitle>
                <CardDescription>
                  이벤트 발생 시 외부 시스템으로 웹훅을 통해 알림을 전송합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">알림 활성화</h4>
                    <p className="text-sm text-muted-foreground">
                      웹훅 알림 기능을 켜거나 끕니다.
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">웹훅 URL</Label>
                  <Input
                    id="webhookUrl"
                    placeholder="https://example.com/webhook"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">웹훅 시크릿</Label>
                  <Input
                    id="webhookSecret"
                    type="password"
                    placeholder="시크릿 키를 입력하세요"
                  />
                  <p className="text-xs text-muted-foreground">
                    웹훅 요청의 유효성을 검증하기 위한 시크릿 키입니다.
                  </p>
                </div>
                
                <Button className="w-full" variant="outline">
                  테스트 웹훅 전송
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>알림 이벤트 설정</CardTitle>
              <CardDescription>
                각 이벤트 유형별로 알림을 받을 채널을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 결제 이벤트 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">결제 이벤트</h3>
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <Label htmlFor="payment-success">결제 성공</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="payment-success-telegram" />
                        <Label htmlFor="payment-success-telegram" className="text-xs">텔레그램</Label>
                        
                        <Switch id="payment-success-email" />
                        <Label htmlFor="payment-success-email" className="text-xs">이메일</Label>
                        
                        <Switch id="payment-success-sms" />
                        <Label htmlFor="payment-success-sms" className="text-xs">SMS</Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <Label htmlFor="payment-failed">결제 실패</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="payment-failed-telegram" defaultChecked />
                        <Label htmlFor="payment-failed-telegram" className="text-xs">텔레그램</Label>
                        
                        <Switch id="payment-failed-email" defaultChecked />
                        <Label htmlFor="payment-failed-email" className="text-xs">이메일</Label>
                        
                        <Switch id="payment-failed-sms" />
                        <Label htmlFor="payment-failed-sms" className="text-xs">SMS</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 정산 이벤트 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">정산 이벤트</h3>
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <Label htmlFor="settlement-requested">정산 요청</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="settlement-requested-telegram" />
                        <Label htmlFor="settlement-requested-telegram" className="text-xs">텔레그램</Label>
                        
                        <Switch id="settlement-requested-email" defaultChecked />
                        <Label htmlFor="settlement-requested-email" className="text-xs">이메일</Label>
                        
                        <Switch id="settlement-requested-sms" />
                        <Label htmlFor="settlement-requested-sms" className="text-xs">SMS</Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <Label htmlFor="settlement-completed">정산 완료</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="settlement-completed-telegram" defaultChecked />
                        <Label htmlFor="settlement-completed-telegram" className="text-xs">텔레그램</Label>
                        
                        <Switch id="settlement-completed-email" defaultChecked />
                        <Label htmlFor="settlement-completed-email" className="text-xs">이메일</Label>
                        
                        <Switch id="settlement-completed-sms" defaultChecked />
                        <Label htmlFor="settlement-completed-sms" className="text-xs">SMS</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 시스템 이벤트 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">시스템 이벤트</h3>
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <Label htmlFor="system-error">시스템 오류</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="system-error-telegram" defaultChecked />
                        <Label htmlFor="system-error-telegram" className="text-xs">텔레그램</Label>
                        
                        <Switch id="system-error-email" defaultChecked />
                        <Label htmlFor="system-error-email" className="text-xs">이메일</Label>
                        
                        <Switch id="system-error-sms" />
                        <Label htmlFor="system-error-sms" className="text-xs">SMS</Label>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="h-4 w-4" />
                        <Label htmlFor="security-alert">보안 경고</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="security-alert-telegram" defaultChecked />
                        <Label htmlFor="security-alert-telegram" className="text-xs">텔레그램</Label>
                        
                        <Switch id="security-alert-email" defaultChecked />
                        <Label htmlFor="security-alert-email" className="text-xs">이메일</Label>
                        
                        <Switch id="security-alert-sms" defaultChecked />
                        <Label htmlFor="security-alert-sms" className="text-xs">SMS</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>알림 템플릿 설정</CardTitle>
              <CardDescription>
                각 알림 유형별로 메시지 템플릿을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  알림 템플릿 기능은 준비 중입니다. 곧 업데이트될 예정입니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
