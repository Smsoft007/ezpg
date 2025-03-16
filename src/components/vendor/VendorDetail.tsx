import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteVendor, getVendorById, updateVendorStatus } from '@/lib/api/vendor/client';
import { VendorDetail as VendorDetailType, VendorStatus } from '@/types/vendor';
import { useAsyncCall } from '@/hooks/useAsyncCall';
import { useLoading } from '@/context/LoadingContext';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  CreditCard
} from 'lucide-react';

interface VendorDetailProps {
  vendorId: string;
}

/**
 * 거래처 상세 정보 컴포넌트
 */
export default function VendorDetail({ vendorId }: VendorDetailProps) {
  const router = useRouter();
  const { isLoading, setLoading } = useLoading();
  
  // 상태 관리
  const [vendor, setVendor] = useState<VendorDetailType | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  // 거래처 정보 조회 API 호출
  const { execute: fetchVendor, isLoading: fetchLoading, error } = useAsyncCall(async () => {
    if (!vendorId) return;
    
    setLoading(true);
    try {
      const response = await getVendorById(vendorId);
      setVendor(response.vendor);
    } finally {
      setLoading(false);
    }
  });

  // 거래처 상태 변경 API 호출
  const { execute: changeStatus } = useAsyncCall(async (status: VendorStatus) => {
    if (!vendorId) return;
    
    setLoading(true);
    try {
      await updateVendorStatus({ id: vendorId, status });
      // 상태 변경 후 데이터 다시 조회
      fetchVendor();
    } finally {
      setLoading(false);
    }
  });

  // 거래처 삭제 API 호출
  const { execute: removeVendor } = useAsyncCall(async () => {
    if (!vendorId) return;
    
    setLoading(true);
    try {
      await deleteVendor(vendorId);
      // 삭제 후 목록 페이지로 이동
      router.push('/dashboard/vendors');
    } finally {
      setLoading(false);
    }
  });

  // 초기 데이터 로딩
  useEffect(() => {
    fetchVendor();
  }, [vendorId]);

  // 상태에 따른 배지 색상 및 텍스트 반환
  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">활성</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500">비활성</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">대기중</Badge>;
      default:
        return <Badge className="bg-gray-500">알 수 없음</Badge>;
    }
  };

  // 상태에 따른 아이콘 반환
  const getStatusIcon = (status: VendorStatus) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (isLoading && !vendor) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>거래처 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !vendor) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <p className="text-red-500">거래처 정보를 불러오는데 실패했습니다.</p>
        <Button onClick={() => fetchVendor()}>다시 시도</Button>
        <Button variant="outline" onClick={() => router.push('/dashboard/vendors')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div className="flex justify-between items-center">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/dashboard/vendors')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>거래처 목록으로 돌아가기</span>
        </Button>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/dashboard/vendors/${vendorId}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            수정
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>거래처 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 이 거래처를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction onClick={() => removeVendor()}>
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* 거래처 정보 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center">
              {vendor.vendorName}
              <span className="ml-2">{getStatusBadge(vendor.status)}</span>
            </CardTitle>
            <CardDescription>
              사업자번호: {vendor.businessNumber} | 대표자: {vendor.representativeName}
            </CardDescription>
          </div>
          
          {/* 상태 변경 버튼 */}
          <div className="flex space-x-2">
            {vendor.status !== 'active' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-green-500 border-green-500"
                onClick={() => changeStatus('active')}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                활성화
              </Button>
            )}
            {vendor.status !== 'inactive' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 border-red-500"
                onClick={() => changeStatus('inactive')}
              >
                <XCircle className="mr-2 h-4 w-4" />
                비활성화
              </Button>
            )}
            {vendor.status !== 'pending' && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-yellow-500 border-yellow-500"
                onClick={() => changeStatus('pending')}
              >
                <Clock className="mr-2 h-4 w-4" />
                대기중
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">기본 정보</TabsTrigger>
              <TabsTrigger value="business">사업자 정보</TabsTrigger>
              <TabsTrigger value="account">계좌 정보</TabsTrigger>
            </TabsList>
            
            {/* 기본 정보 탭 */}
            <TabsContent value="basic" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">거래처명</p>
                      <p className="text-lg">{vendor.vendorName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">사업자번호</p>
                      <p className="text-lg">{vendor.businessNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">대표자명</p>
                      <p className="text-lg">{vendor.representativeName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">연락처</p>
                      <p className="text-lg">{vendor.phoneNumber}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">이메일</p>
                      <p className="text-lg">{vendor.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">주소</p>
                      <p className="text-lg">{vendor.address}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">등록일</p>
                      <p className="text-lg">{new Date(vendor.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">담당자</p>
                      <p className="text-lg">{vendor.contactPerson || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* 사업자 정보 탭 */}
            <TabsContent value="business" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">회사명</p>
                      <p className="text-lg">{vendor.businessInfo?.companyName || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">대표자명</p>
                      <p className="text-lg">{vendor.businessInfo?.ceoName || '-'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">업태</p>
                      <p className="text-lg">{vendor.businessInfo?.businessType || '-'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Briefcase className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">업종</p>
                      <p className="text-lg">{vendor.businessInfo?.businessCategory || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">세금 비율</p>
                    <p className="text-lg">{vendor.taxRate}%</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">결제 조건</p>
                    <p className="text-lg">{vendor.paymentTerms}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* 계좌 정보 탭 */}
            <TabsContent value="account" className="mt-6">
              {vendor.bankInfo ? (
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Building className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">은행명</p>
                      <p className="text-lg">{vendor.bankInfo.bankName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">계좌번호</p>
                      <p className="text-lg">{vendor.bankInfo.accountNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">예금주</p>
                      <p className="text-lg">{vendor.bankInfo.accountHolder}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-32">
                  <p className="text-gray-500">등록된 계좌 정보가 없습니다.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-500">
            마지막 수정일: {new Date(vendor.updatedAt).toLocaleString()}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
