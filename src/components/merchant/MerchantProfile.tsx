import React from 'react';
import { Merchant } from '@/docs/interface/merchant';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Mail, Phone, MapPin, Calendar, CreditCard, Percent } from 'lucide-react';

interface MerchantProfileProps {
  merchant: Merchant;
  onEdit?: () => void;
}

export const MerchantProfile: React.FC<MerchantProfileProps> = ({ merchant, onEdit }) => {
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {merchant.merchantName}
            </CardTitle>
            <CardDescription className="mt-1">{merchant.businessNumber}</CardDescription>
          </div>
          <div>
            {merchant.status === 'active' ? (
              <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-200">활성</Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">비활성</Badge>
            )}
            {merchant.verifiedYn === 'Y' && (
              <Badge variant="outline" className="ml-2 text-blue-600 bg-blue-50 border-blue-200">인증완료</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">기본 정보</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">이메일:</span>
                <span className="text-sm">{merchant.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">전화번호:</span>
                <span className="text-sm">{merchant.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">주소:</span>
                <span className="text-sm">{merchant.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">등록일:</span>
                <span className="text-sm">{new Date(merchant.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">기술 정보</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">가상계좌 수:</span>
                <span className="text-sm">{merchant.virtualAccountCount || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-500">기본 수수료율:</span>
                <span className="text-sm">{merchant.feeRate ? `${merchant.feeRate}%` : '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">정산 주기:</span>
                <span className="text-sm">
                  {merchant.settlementCycle === 'daily' && '일일 정산'}
                  {merchant.settlementCycle === 'weekly' && '주간 정산'}
                  {merchant.settlementCycle === 'monthly' && '월간 정산'}
                  {!merchant.settlementCycle && '-'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">웹훅 URL:</span>
                <span className="text-sm">{merchant.webhookUrl || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {merchant.businessInfo && (
          <div className="mt-6">
            <h3 className="text-lg font-medium">사업자 정보</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">사업자명</span>
                <span className="text-sm">{merchant.businessInfo.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">대표자명</span>
                <span className="text-sm">{merchant.businessInfo.ceoName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">업태</span>
                <span className="text-sm">{merchant.businessInfo.businessType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">업종</span>
                <span className="text-sm">{merchant.businessInfo.businessCategory}</span>
              </div>
            </div>
          </div>
        )}

        {merchant.bankInfo && (
          <div className="mt-6">
            <h3 className="text-lg font-medium">정산계좌 정보</h3>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">은행명</span>
                <span className="text-sm">{merchant.bankInfo.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">계좌번호</span>
                <span className="text-sm">{merchant.bankInfo.accountNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">예금주</span>
                <span className="text-sm">{merchant.bankInfo.accountHolder}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {onEdit && (
        <CardFooter>
          <Button onClick={onEdit} className="w-full">가맹점 정보 수정</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default MerchantProfile;
