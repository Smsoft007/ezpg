import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { FormProvider, useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from '../ui/form';
import { Alert, AlertDescription } from '../ui/alert';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

// 로그인 폼 스키마 정의
const loginSchema = z.object({
  email: z.string().email({
    message: '유효한 이메일 주소를 입력해주세요.',
  }),
  password: z.string().min(8, {
    message: '비밀번호는 최소 8자 이상이어야 합니다.',
  }),
  rememberMe: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLogin?: (values: LoginFormValues) => Promise<{ success: boolean; message?: string }>;
  onForgotPassword?: () => void;
  onRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onLogin,
  onForgotPassword,
  onRegister,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 폼 초기화
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // 폼 제출 핸들러
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      if (onLogin) {
        const result = await onLogin(values);
        if (!result.success) {
          setError(result.message || '로그인에 실패했습니다.');
        } else {
          // 로그인 성공 시 대시보드로 이동
          router.push('/dashboard');
        }
      } else {
        // 기본 동작 (개발용)
        console.log('로그인 정보:', values);
        // 개발 환경에서는 항상 성공으로 처리
        router.push('/dashboard');
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('로그인 오류:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">로그인</CardTitle>
        <CardDescription>
          계정 정보를 입력하여 로그인하세요
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="name@example.com"
                      type="email"
                      autoComplete="email"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        disabled={isLoading}
                        {...field}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                        </span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      로그인 상태 유지
                    </FormLabel>
                  </FormItem>
                )}
              />

              {onForgotPassword && (
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-normal"
                  onClick={onForgotPassword}
                  disabled={isLoading}
                >
                  비밀번호 찾기
                </Button>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </FormProvider>
      </CardContent>
      {onRegister && (
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            계정이 없으신가요?{' '}
            <Button variant="link" className="p-0" onClick={onRegister} disabled={isLoading}>
              회원가입
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default LoginForm;
