"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save, Building2, User, Mail, Phone, MapPin, CreditCard, Percent, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// 가맹점 수정 폼 스키마
const merchantFormSchema = z.object({
  // 기본 정보
  name: z.string().min(2, { message: "가맹점명은 2자 이상이어야 합니다." }),
  businessNumber: z
    .string()
    .regex(/^\d{3}-\d{2}-\d{5}$/, { message: "사업자번호는 000-00-00000 형식이어야 합니다." }),
  representativeName: z.string().min(2, { message: "대표자명은 2자 이상이어야 합니다." }),
  status: z.enum(["active", "inactive", "pending"], {
    required_error: "상태를 선택해주세요.",
  }),

  // 연락처 정보
  email: z.string().email({ message: "유효한 이메일 주소를 입력해주세요." }),
  phone: z
    .string()
    .regex(/^\d{2,3}-\d{3,4}-\d{4}$/, { message: "전화번호는 00-000-0000 또는 000-0000-0000 형식이어야 합니다." }),

  // 주소 정보
  zipCode: z.string().regex(/^\d{5}$/, { message: "우편번호는 5자리 숫자여야 합니다." }),
  address1: z.string().min(2, { message: "기본주소를 입력해주세요." }),
  address2: z.string().optional(),

  // 계좌 정보
  bank: z.string().min(1, { message: "은행명을 입력해주세요." }),
  accountNumber: z.string().min(1, { message: "계좌번호를 입력해주세요." }),
  accountHolder: z.string().min(1, { message: "예금주를 입력해주세요." }),

  // 수수료 정보
  paymentFee: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, { message: "결제 수수료는 숫자 또는 소수점 둘째 자리까지 입력 가능합니다." }),
  withdrawalFee: z
    .string()
    .regex(/^\d+$/, { message: "출금 수수료는 숫자만 입력 가능합니다." }),
});

type MerchantFormValues = z.infer<typeof merchantFormSchema>;

// 샘플 가맹점 상세 데이터
const sampleMerchantDetail = {
  id: "M001",
  name: "스마트 페이먼트",
  businessNumber: "123-45-67890",
  representativeName: "김대표",
  status: "active",
  joinDate: "2024-01-15",
  balance: 1500000,
  contact: {
    email: "contact@smartpayment.com",
    phone: "02-1234-5678",
  },
  address: {
    zipCode: "12345",
    address1: "서울특별시 강남구",
    address2: "테헤란로 123",
  },
  account: {
    bank: "신한은행",
    accountNumber: "110-123-456789",
    accountHolder: "김대표",
  },
  fees: {
    payment: 3.5,
    withdrawal: 1000,
  },
};

export default function MerchantEditPage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 폼 설정
  const form = useForm<MerchantFormValues>({
    resolver: zodResolver(merchantFormSchema),
    defaultValues: {
      status: "pending",
      paymentFee: "3.5",
      withdrawalFee: "1000",
    },
    mode: "onChange",
  });

  // 데이터 로드
  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        // 실제 API 호출은 아래와 같이 구현
        // const response = await fetch(`/api/merchants/${params.id}`);
        // if (!response.ok) {
        //   throw new Error("가맹점 정보를 불러오는데 실패했습니다.");
        // }
        // const data = await response.json();

        // 샘플 데이터 사용
        const data = sampleMerchantDetail;

        // 폼 데이터 설정
        form.reset({
          name: data.name,
          businessNumber: data.businessNumber,
          representativeName: data.representativeName,
          status: data.status as "active" | "inactive" | "pending",
          email: data.contact.email,
          phone: data.contact.phone,
          zipCode: data.address.zipCode,
          address1: data.address.address1,
          address2: data.address.address2 || "",
          bank: data.account.bank,
          accountNumber: data.account.accountNumber,
          accountHolder: data.account.accountHolder,
          paymentFee: data.fees.payment.toString(),
          withdrawalFee: data.fees.withdrawal.toString(),
        });

        setIsLoading(false);
      } catch (error) {
        console.error("가맹점 정보 로딩 중 오류 발생:", error);
        setStatusMessage("가맹점 정보를 불러오는데 실패했습니다.");
        setFormStatus('error');
        setTimeout(() => {
          router.push("/dashboard/merchants");
        }, 3000);
      }
    };

    fetchMerchantData();
  }, [params.id, form, router]);

  // 폼 제출 핸들러
  const onSubmit = async (data: MerchantFormValues) => {
    setIsSubmitting(true);
    setFormStatus('idle');
    setStatusMessage(null);
    
    try {
      console.log("가맹점 수정 데이터:", data);

      // 실제 API 호출은 아래와 같이 구현
      // const response = await fetch(`/api/merchants/${params.id}`, {
      //   method: "PUT",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(data),
      // });
      //
      // if (!response.ok) {
      //   throw new Error("가맹점 정보 수정에 실패했습니다.");
      // }
      //
      // const result = await response.json();

      // 성공 시 상세 페이지로 이동
      setTimeout(() => {
        setFormStatus('success');
        setStatusMessage("가맹점 정보가 성공적으로 수정되었습니다.");
        
        setTimeout(() => {
          router.push(`/dashboard/merchants/${params.id}`);
        }, 2000);
      }, 1000);
    } catch (error) {
      console.error("가맹점 정보 수정 중 오류 발생:", error);
      setFormStatus('error');
      setStatusMessage("가맹점 정보 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 상태 UI
  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-8 w-64" />
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-5 w-96" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-5 w-96" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end space-x-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    );
  }

  // 상태 배지 렌더링
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">활성</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800 border-red-300">비활성</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">대기중</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto opacity-100 transition-all duration-500 ease-in-out transform translate-y-0">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" asChild className="h-10 w-10 rounded-full shadow-sm">
            <Link href={`/dashboard/merchants/${params.id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              가맹점 정보 수정
              {renderStatusBadge(form.getValues().status)}
            </h1>
            <p className="text-muted-foreground">ID: {params.id}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/merchants/${params.id}`}>취소</Link>
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                처리 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                저장하기
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 상태 메시지 */}
      {statusMessage && (
        <div className="mb-6 transition-all duration-300 ease-in-out opacity-100 transform translate-y-0">
          <Alert variant={formStatus === 'error' ? "destructive" : "default"} className={formStatus === 'success' ? "bg-green-50 text-green-800 border-green-200" : ""}>
            {formStatus === 'error' ? (
              <AlertTriangle className="h-4 w-4 mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        </div>
      )}

      <Form<MerchantFormValues> form={form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">기본 정보</span>
                <span className="sm:hidden">기본</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">연락처 정보</span>
                <span className="sm:hidden">연락처</span>
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">주소 정보</span>
                <span className="sm:hidden">주소</span>
              </TabsTrigger>
              <TabsTrigger value="account" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">계좌/수수료</span>
                <span className="sm:hidden">계좌</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-0">
              <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    기본 정보
                  </CardTitle>
                  <CardDescription>
                    가맹점의 기본 정보를 수정해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>가맹점명 *</FormLabel>
                          <FormControl>
                            <Input placeholder="가맹점명을 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>사업자번호 *</FormLabel>
                          <FormControl>
                            <Input placeholder="000-00-00000" {...field} />
                          </FormControl>
                          <FormDescription>하이픈(-)을 포함하여 입력해주세요.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="representativeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>대표자명 *</FormLabel>
                          <FormControl>
                            <Input placeholder="대표자명을 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>상태 *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="상태를 선택하세요" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active" className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">활성</Badge>
                              </SelectItem>
                              <SelectItem value="inactive" className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">비활성</Badge>
                              </SelectItem>
                              <SelectItem value="pending" className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">대기중</Badge>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-end">
                <Button type="button" onClick={() => setActiveTab("contact")}>
                  다음: 연락처 정보
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6 mt-0">
              <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    연락처 정보
                  </CardTitle>
                  <CardDescription>
                    가맹점의 연락처 정보를 수정해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>이메일 *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="example@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>전화번호 *</FormLabel>
                          <FormControl>
                            <Input placeholder="02-1234-5678" {...field} />
                          </FormControl>
                          <FormDescription>하이픈(-)을 포함하여 입력해주세요.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                  이전: 기본 정보
                </Button>
                <Button type="button" onClick={() => setActiveTab("address")}>
                  다음: 주소 정보
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-6 mt-0">
              <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    주소 정보
                  </CardTitle>
                  <CardDescription>
                    가맹점의 주소 정보를 수정해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>우편번호 *</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input placeholder="12345" {...field} />
                            </FormControl>
                            <Button 
                              type="button" 
                              variant="outline"
                              title="우편번호 검색"
                            >
                              검색
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <FormField
                      control={form.control}
                      name="address1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>기본주소 *</FormLabel>
                          <FormControl>
                            <Input placeholder="기본주소를 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>상세주소</FormLabel>
                          <FormControl>
                            <Input placeholder="상세주소를 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("contact")}>
                  이전: 연락처 정보
                </Button>
                <Button type="button" onClick={() => setActiveTab("account")}>
                  다음: 계좌/수수료 정보
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-6 mt-0">
              <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    계좌 정보
                  </CardTitle>
                  <CardDescription>
                    가맹점의 정산 계좌 정보를 수정해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="bank"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>은행명 *</FormLabel>
                          <FormControl>
                            <Input placeholder="은행명을 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>계좌번호 *</FormLabel>
                          <FormControl>
                            <Input placeholder="계좌번호를 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="accountHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>예금주 *</FormLabel>
                          <FormControl>
                            <Input placeholder="예금주를 입력하세요" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-t-4 border-t-primary shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    수수료 정보
                  </CardTitle>
                  <CardDescription>
                    가맹점의 수수료 정보를 수정해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="paymentFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>결제 수수료 (%) *</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="3.5" {...field} />
                          </FormControl>
                          <FormDescription>소수점 둘째 자리까지 입력 가능합니다.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="withdrawalFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>출금 수수료 (원) *</FormLabel>
                          <FormControl>
                            <Input type="text" placeholder="1000" {...field} />
                          </FormControl>
                          <FormDescription>숫자만 입력 가능합니다.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("address")}>
                  이전: 주소 정보
                </Button>
                <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                      처리 중...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      저장하기
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
