"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
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
        alert("가맹점 정보를 불러오는데 실패했습니다.");
        router.push("/dashboard/merchants");
      }
    };

    fetchMerchantData();
  }, [params.id, form, router]);

  // 폼 제출 핸들러
  const onSubmit = async (data: MerchantFormValues) => {
    setIsSubmitting(true);
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
        alert("가맹점 정보가 성공적으로 수정되었습니다.");
        router.push(`/dashboard/merchants/${params.id}`);
      }, 1000);
    } catch (error) {
      console.error("가맹점 정보 수정 중 오류 발생:", error);
      alert("가맹점 정보 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">가맹점 정보를 불러오는 중입니다...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/merchants/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">가맹점 정보 수정</h1>
      </div>

      <Form<MerchantFormValues> form={form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
              <CardDescription>가맹점의 기본 정보를 수정해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }: { field: any }) => (
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
                  render={({ field }: { field: any }) => (
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
                  render={({ field }: { field: any }) => (
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
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>상태 *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="상태를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">활성</SelectItem>
                          <SelectItem value="inactive">비활성</SelectItem>
                          <SelectItem value="pending">대기중</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>연락처 정보</CardTitle>
              <CardDescription>가맹점의 연락처 정보를 수정해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }: { field: any }) => (
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
                  render={({ field }: { field: any }) => (
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

          {/* 주소 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>주소 정보</CardTitle>
              <CardDescription>가맹점의 주소 정보를 수정해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>우편번호 *</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="12345" {...field} />
                        </FormControl>
                        <Button type="button" variant="outline">
                          검색
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="address1"
                  render={({ field }: { field: any }) => (
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
                  render={({ field }: { field: any }) => (
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

          {/* 계좌 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>계좌 정보</CardTitle>
              <CardDescription>가맹점의 정산 계좌 정보를 수정해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bank"
                  render={({ field }: { field: any }) => (
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
                  render={({ field }: { field: any }) => (
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
                  render={({ field }: { field: any }) => (
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

          {/* 수수료 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>수수료 정보</CardTitle>
              <CardDescription>가맹점의 수수료 정보를 수정해주세요.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="paymentFee"
                  render={({ field }: { field: any }) => (
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
                  render={({ field }: { field: any }) => (
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

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" asChild>
              <Link href={`/dashboard/merchants/${params.id}`}>취소</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
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
        </form>
      </Form>
    </div>
  );
}
