import React from 'react';
import { Merchant } from '@/docs/interface/merchant';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, Mail, Phone, MapPin, Calendar, CreditCard, Percent, 
  CheckCircle2, AlertCircle, Clock, User, Briefcase, Building, Globe
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface MerchantProfileProps {
  merchant?: Merchant;
  onEdit?: () => void;
}

export const MerchantProfile: React.FC<MerchantProfileProps> = ({ merchant, onEdit }) => {
  if (!merchant) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-5 w-5" />
            가맹점 정보 없음
          </CardTitle>
          <CardDescription>가맹점 정보를 불러올 수 없습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Building2 className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">가맹점 정보가 제공되지 않았거나 로딩 중입니다.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active':
        return (
          <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            활성
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            비활성
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            대기
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto border shadow-sm">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              {merchant.merchantName}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center gap-2">
              <span className="font-mono">{merchant.businessNumber}</span>
              {merchant.verifiedYn === 'Y' && (
                <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  인증완료
                </Badge>
              )}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(merchant.status)}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="w-full rounded-none border-b bg-transparent h-12 p-0 justify-start">
            <TabsTrigger 
              value="basic" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none h-12 px-6"
            >
              기본 정보
            </TabsTrigger>
            <TabsTrigger 
              value="business" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none h-12 px-6"
            >
              사업자 정보
            </TabsTrigger>
            <TabsTrigger 
              value="settlement" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:rounded-none h-12 px-6"
            >
              정산 정보
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <User className="h-5 w-5 text-primary/70" />
                  연락처 정보
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 group">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">이메일</p>
                      <p className="font-medium group-hover:text-primary transition-colors">{merchant.email || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">전화번호</p>
                      <p className="font-medium group-hover:text-primary transition-colors">{merchant.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">주소</p>
                      <p className="font-medium group-hover:text-primary transition-colors">{merchant.address || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">등록일</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {new Date(merchant.createdAt).toLocaleDateString('ko-KR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary/70" />
                  기술 정보
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 group">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">가상계좌 수</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        <span className="text-lg">{merchant.virtualAccountCount || 0}</span>
                        <span className="text-xs text-muted-foreground ml-1">개</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <Percent className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">기본 수수료율</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {merchant.feeRate ? (
                          <>
                            <span className="text-lg">{merchant.feeRate}</span>
                            <span className="text-xs text-muted-foreground ml-1">%</span>
                          </>
                        ) : '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">정산 주기</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {merchant.settlementCycle === 'daily' && '일일 정산'}
                        {merchant.settlementCycle === 'weekly' && '주간 정산'}
                        {merchant.settlementCycle === 'monthly' && '월간 정산'}
                        {!merchant.settlementCycle && '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">웹훅 URL</p>
                      <p className={cn(
                        "font-mono text-sm break-all group-hover:text-primary transition-colors",
                        !merchant.webhookUrl && "text-muted-foreground italic"
                      )}>
                        {merchant.webhookUrl || '설정되지 않음'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="business" className="p-6">
            {merchant.businessInfo ? (
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary/70" />
                  사업자 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3 group">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">사업자명</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {merchant.businessInfo.companyName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">대표자명</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {merchant.businessInfo.ceoName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">업태</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {merchant.businessInfo.businessType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">업종</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {merchant.businessInfo.businessCategory}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Briefcase className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p>사업자 정보가 등록되지 않았습니다.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="settlement" className="p-6">
            {merchant.bankInfo ? (
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary/70" />
                  정산계좌 정보
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3 group">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">은행명</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {merchant.bankInfo.bankName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">계좌번호</p>
                      <p className="font-medium group-hover:text-primary transition-colors font-mono">
                        {merchant.bankInfo.accountNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">예금주</p>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {merchant.bankInfo.accountHolder}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Building className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <p>정산계좌 정보가 등록되지 않았습니다.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {onEdit && (
        <CardFooter className="border-t p-4 bg-muted/10">
          <Button 
            onClick={onEdit} 
            className="w-full bg-primary hover:bg-primary/90"
          >
            가맹점 정보 수정
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default MerchantProfile;
