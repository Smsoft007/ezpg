import { useState, useCallback } from 'react';
import { useLoading } from '@/context/LoadingContext';
import { toast } from '@/components/ui/use-toast';

/**
 * 비동기 함수 호출을 위한 훅
 * 로딩 상태 관리와 에러 핸들링을 자동화합니다.
 * 
 * @param asyncFn - 실행할 비동기 함수
 * @param options - 설정 옵션 (로딩 표시 여부, 에러 표시 여부)
 */
export function useAsyncCall<T, P extends any[]>(
  asyncFn: (...args: P) => Promise<T>,
  options?: {
    showLoading?: boolean;
    showError?: boolean;
    errorMessage?: string;
    successMessage?: string;
  }
) {
  const { setLoading } = useLoading();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const execute = useCallback(async (...args: P) => {
    try {
      setIsLoading(true);
      if (options?.showLoading !== false) setLoading(true);
      setError(null);
      
      const result = await asyncFn(...args);
      setData(result);
      
      if (options?.successMessage) {
        toast({
          title: "성공",
          description: options.successMessage,
          variant: "default",
        });
      }
      
      return result;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      
      if (options?.showError !== false) {
        toast({
          title: "오류 발생",
          description: options?.errorMessage || errorObj.message,
          variant: "destructive",
        });
      }
      
      throw errorObj;
    } finally {
      setIsLoading(false);
      if (options?.showLoading !== false) setLoading(false);
    }
  }, [asyncFn, setLoading, options]);
  
  return { execute, data, error, isLoading };
}
