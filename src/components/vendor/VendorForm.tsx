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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { 
  createVendor, 
  getVendorById, 
  updateVendor 
} from '@/lib/api/vendor/client';
import { 
  CreateVendorRequest, 
  UpdateVendorRequest, 
  VendorDetail, 
  VendorStatus 
} from '@/types/vendor';
import { useAsyncCall } from '@/hooks/useAsyncCall';
import { useLoading } from '@/context/LoadingContext';
import { useForm, ValidationRule } from '@/hooks/useForm';
import { ArrowLeft, Save } from 'lucide-react';

interface VendorFormProps {
  vendorId?: string; // 수정 시에만 제공됨
  isEdit?: boolean;
}

/**
 * 거래처 등록/수정 폼 컴포넌트
 */
export default function VendorForm({ vendorId, isEdit = false }: VendorFormProps) {
  const router = useRouter();
  const { setLoading: setIsLoading } = useLoading();
  
  // 상태 관리
  const [activeTab, setActiveTab] = useState('basic');
  const [currentVendorId, setCurrentVendorId] = useState<string | undefined>(vendorId);

  // 폼 상태 관리
  const { values, setFieldValue, handleChange, validateForm, errors, resetForm } = useForm<CreateVendorRequest>(
    // 초기값
    {
      vendorName: '',
      businessNumber: '',
      representativeName: '',
      phoneNumber: '',
      email: '',
      address: '',
      businessType: '',
      status: 'active' as VendorStatus,
      taxRate: 10,
      paymentTerms: '30일',
      contactPerson: '',
      
      // 은행 정보
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      
      // 비즈니스 정보
      companyName: '',
      ceoName: '',
      detailBusinessType: '',
      businessCategory: ''
    },
    // 유효성 검사 규칙
    {
      vendorName: [{ 
        validate: (value: any, formData: CreateVendorRequest) => !!value, 
        message: '거래처명은 필수 입력 항목입니다.' 
      }] as ValidationRule<CreateVendorRequest>[],
      businessNumber: [{ 
        validate: (value: any, formData: CreateVendorRequest) => !!value, 
        message: '사업자번호는 필수 입력 항목입니다.' 
      }] as ValidationRule<CreateVendorRequest>[],
      representativeName: [{ 
        validate: (value: any, formData: CreateVendorRequest) => !!value, 
        message: '대표자명은 필수 입력 항목입니다.' 
      }] as ValidationRule<CreateVendorRequest>[],
      phoneNumber: [{ 
        validate: (value: any, formData: CreateVendorRequest) => !!value, 
        message: '연락처는 필수 입력 항목입니다.' 
      }] as ValidationRule<CreateVendorRequest>[],
      email: [{ 
        validate: (value: any, formData: CreateVendorRequest) => !!value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), 
        message: '유효한 이메일 주소를 입력해주세요.' 
      }] as ValidationRule<CreateVendorRequest>[]
    }
  );

  // 거래처 상세 정보 조회 API 호출 (수정 시)
  const { execute: fetchVendor, isLoading: fetchLoading, error: fetchError } = useAsyncCall(async () => {
    if (!vendorId || !isEdit) return;
    
    setIsLoading(true);
    try {
      const response = await getVendorById(vendorId);
      const vendorData = response.vendor;
      
      // 폼 데이터 설정
      setCurrentVendorId(vendorData.id);
      setFieldValue('vendorName', vendorData.vendorName);
      setFieldValue('businessNumber', vendorData.businessNumber);
      setFieldValue('representativeName', vendorData.representativeName);
      setFieldValue('phoneNumber', vendorData.phoneNumber);
      setFieldValue('email', vendorData.email);
      setFieldValue('address', vendorData.address || '');
      setFieldValue('businessType', vendorData.businessType || '');
      setFieldValue('status', vendorData.status);
      setFieldValue('taxRate', vendorData.taxRate);
      setFieldValue('paymentTerms', vendorData.paymentTerms || '30일');
      setFieldValue('contactPerson', vendorData.contactPerson || '');
      
      // 은행 정보
      setFieldValue('bankName', vendorData.bankInfo?.bankName || '');
      setFieldValue('accountNumber', vendorData.bankInfo?.accountNumber || '');
      setFieldValue('accountHolder', vendorData.bankInfo?.accountHolder || '');
      
      // 비즈니스 정보
      setFieldValue('companyName', vendorData.businessInfo?.companyName || '');
      setFieldValue('ceoName', vendorData.businessInfo?.ceoName || '');
      setFieldValue('detailBusinessType', vendorData.businessInfo?.businessType || '');
      setFieldValue('businessCategory', vendorData.businessInfo?.businessCategory || '');
    } finally {
      setIsLoading(false);
    }
  });

  // 거래처 등록 API 호출
  const { execute: submitCreate, isLoading: createLoading, error: createError } = useAsyncCall(async () => {
    // 유효성 검사
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await createVendor(values);
      
      // 등록 성공 시 상세 페이지로 이동
      router.push(`/dashboard/vendors/${response.id}`);
    } finally {
      setIsLoading(false);
    }
  });

  // 거래처 수정 API 호출
  const { execute: submitUpdate, isLoading: updateLoading, error: updateError } = useAsyncCall(async () => {
    if (!currentVendorId) return;
    
    // 유효성 검사
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const response = await updateVendor({
        ...values,
        id: currentVendorId
      } as UpdateVendorRequest);
      
      // 수정 성공 시 상세 페이지로 이동
      router.push(`/dashboard/vendors/${currentVendorId}`);
    } finally {
      setIsLoading(false);
    }
  });

  // 초기 데이터 로딩 (수정 시)
  useEffect(() => {
    if (isEdit && vendorId) {
      fetchVendor();
    }
  }, [isEdit, vendorId]);

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit) {
      submitUpdate();
    } else {
      submitCreate();
    }
  };

  // 다음 탭으로 이동
  const handleNextTab = () => {
    if (activeTab === 'basic') {
      setActiveTab('business');
    } else if (activeTab === 'business') {
      setActiveTab('account');
    }
  };

  // 이전 탭으로 이동
  const handlePrevTab = () => {
    if (activeTab === 'account') {
      setActiveTab('business');
    } else if (activeTab === 'business') {
      setActiveTab('basic');
    }
  };

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
      </div>

      {/* 거래처 등록/수정 폼 */}
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? '거래처 정보 수정' : '새 거래처 등록'}</CardTitle>
          <CardDescription>
            {isEdit 
              ? '거래처 정보를 수정합니다. 모든 필수 항목을 입력해주세요.' 
              : '새로운 거래처를 등록합니다. 모든 필수 항목을 입력해주세요.'}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">기본 정보</TabsTrigger>
                <TabsTrigger value="business">사업자 정보</TabsTrigger>
                <TabsTrigger value="account">계좌 정보</TabsTrigger>
              </TabsList>
              
              {/* 기본 정보 탭 */}
              <TabsContent value="basic" className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="vendorName">
                      거래처명 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="vendorName"
                      name="vendorName"
                      value={values.vendorName}
                      onChange={handleChange}
                      placeholder="거래처명을 입력하세요"
                      className={errors.vendorName ? 'border-red-500' : ''}
                    />
                    {errors.vendorName && (
                      <p className="text-red-500 text-sm">{errors.vendorName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessNumber">
                      사업자번호 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="businessNumber"
                      name="businessNumber"
                      value={values.businessNumber}
                      onChange={handleChange}
                      placeholder="000-00-00000"
                      className={errors.businessNumber ? 'border-red-500' : ''}
                    />
                    {errors.businessNumber && (
                      <p className="text-red-500 text-sm">{errors.businessNumber}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="representativeName">
                      대표자명 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="representativeName"
                      name="representativeName"
                      value={values.representativeName}
                      onChange={handleChange}
                      placeholder="대표자명을 입력하세요"
                      className={errors.representativeName ? 'border-red-500' : ''}
                    />
                    {errors.representativeName && (
                      <p className="text-red-500 text-sm">{errors.representativeName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">
                      연락처 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      value={values.phoneNumber}
                      onChange={handleChange}
                      placeholder="000-0000-0000"
                      className={errors.phoneNumber ? 'border-red-500' : ''}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      이메일 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="example@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactPerson">담당자</Label>
                    <Input
                      id="contactPerson"
                      name="contactPerson"
                      value={values.contactPerson}
                      onChange={handleChange}
                      placeholder="담당자명을 입력하세요"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">주소</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={values.address}
                      onChange={handleChange}
                      placeholder="주소를 입력하세요"
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">상태</Label>
                    <Select
                      name="status"
                      value={values.status}
                      onValueChange={(value) => 
                        handleChange({ 
                          target: { name: 'status', value } 
                        } as React.ChangeEvent<HTMLSelectElement>)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">활성</SelectItem>
                        <SelectItem value="inactive">비활성</SelectItem>
                        <SelectItem value="pending">대기중</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessType">업종</Label>
                    <Input
                      id="businessType"
                      name="businessType"
                      value={values.businessType}
                      onChange={handleChange}
                      placeholder="업종을 입력하세요"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end mt-6">
                  <Button type="button" onClick={handleNextTab}>
                    다음: 사업자 정보
                  </Button>
                </div>
              </TabsContent>
              
              {/* 사업자 정보 탭 */}
              <TabsContent value="business" className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">회사명</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={values.companyName}
                      onChange={handleChange}
                      placeholder="회사명을 입력하세요"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ceoName">대표자명</Label>
                    <Input
                      id="ceoName"
                      name="ceoName"
                      value={values.ceoName}
                      onChange={handleChange}
                      placeholder="대표자명을 입력하세요"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="detailBusinessType">업태</Label>
                    <Input
                      id="detailBusinessType"
                      name="detailBusinessType"
                      value={values.detailBusinessType}
                      onChange={handleChange}
                      placeholder="업태를 입력하세요"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="businessCategory">업종</Label>
                    <Input
                      id="businessCategory"
                      name="businessCategory"
                      value={values.businessCategory}
                      onChange={handleChange}
                      placeholder="업종을 입력하세요"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">세금 비율 (%)</Label>
                    <Input
                      id="taxRate"
                      name="taxRate"
                      type="number"
                      value={values.taxRate}
                      onChange={handleChange}
                      placeholder="10"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="paymentTerms">결제 조건</Label>
                    <Input
                      id="paymentTerms"
                      name="paymentTerms"
                      value={values.paymentTerms}
                      onChange={handleChange}
                      placeholder="30일"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={handlePrevTab}>
                    이전: 기본 정보
                  </Button>
                  <Button type="button" onClick={handleNextTab}>
                    다음: 계좌 정보
                  </Button>
                </div>
              </TabsContent>
              
              {/* 계좌 정보 탭 */}
              <TabsContent value="account" className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">은행명</Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={values.bankName}
                      onChange={handleChange}
                      placeholder="은행명을 입력하세요"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">계좌번호</Label>
                    <Input
                      id="accountNumber"
                      name="accountNumber"
                      value={values.accountNumber}
                      onChange={handleChange}
                      placeholder="계좌번호를 입력하세요"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accountHolder">예금주</Label>
                    <Input
                      id="accountHolder"
                      name="accountHolder"
                      value={values.accountHolder}
                      onChange={handleChange}
                      placeholder="예금주를 입력하세요"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button type="button" variant="outline" onClick={handlePrevTab}>
                    이전: 사업자 정보
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.push('/dashboard/vendors')}
            >
              취소
            </Button>
            <Button type="submit" disabled={createLoading || updateLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isEdit ? '수정 완료' : '등록 완료'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
