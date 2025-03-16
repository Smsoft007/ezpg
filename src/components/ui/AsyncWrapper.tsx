import React from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AsyncWrapperProps {
  /**
   * 데이터 로딩 상태
   */
  isLoading: boolean;
  
  /**
   * 에러 메시지 (없으면 에러 없음)
   */
  error?: string | null;
  
  /**
   * 데이터가 비어있는지 여부
   */
  isEmpty?: boolean;
  
  /**
   * 데이터가 비어있을 때 표시할 메시지
   */
  emptyMessage?: string;
  
  /**
   * 재시도 함수
   */
  retryAction?: () => void;
  
  /**
   * 로딩 텍스트
   */
  loadingText?: string;
  
  /**
   * 로딩 스피너 크기
   */
  spinnerSize?: "sm" | "md" | "lg";
  
  /**
   * 추가 클래스명
   */
  className?: string;
  
  /**
   * 자식 컴포넌트
   */
  children: React.ReactNode;
}

/**
 * 비동기 데이터 로딩, 에러 처리, 빈 상태 처리를 위한 래퍼 컴포넌트
 * 
 * 사용 예시:
 * ```tsx
 * <AsyncWrapper
 *   isLoading={isLoading}
 *   error={error}
 *   isEmpty={data.length === 0}
 *   emptyMessage="표시할 데이터가 없습니다."
 *   retryAction={handleRefresh}
 * >
 *   <DataTable data={data} columns={columns} />
 * </AsyncWrapper>
 * ```
 */
export function AsyncWrapper({
  isLoading,
  error,
  isEmpty = false,
  emptyMessage = "데이터가 없습니다.",
  retryAction,
  loadingText = "데이터를 불러오는 중입니다...",
  spinnerSize = "md",
  className = "",
  children,
}: AsyncWrapperProps) {
  // 기본 로딩 컴포넌트
  const loadingComponent = (
    <div className="flex justify-center items-center min-h-[200px]">
      <LoadingSpinner size={spinnerSize} text={loadingText} />
    </div>
  );
  
  // 기본 에러 컴포넌트
  const errorComponent = (
    <Alert variant="destructive" className="my-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>오류 발생</AlertTitle>
      <AlertDescription>
        <div className="flex flex-col gap-2">
          <p>{error || "데이터를 불러오는 중 오류가 발생했습니다."}</p>
          {retryAction && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-fit"
              onClick={retryAction}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              다시 시도
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
  
  // 기본 빈 데이터 컴포넌트
  const emptyComponent = (
    <div className="flex justify-center items-center min-h-[200px] text-gray-500">
      {emptyMessage}
    </div>
  );
  
  // 로딩 중인 경우
  if (isLoading) {
    return (
      <div className={className}>
        {loadingComponent}
      </div>
    );
  }
  
  // 에러가 발생한 경우
  if (error) {
    return (
      <div className={className}>
        {errorComponent}
      </div>
    );
  }
  
  // 데이터가 없는 경우
  if (isEmpty) {
    return (
      <div className={className}>
        {emptyComponent}
      </div>
    );
  }
  
  // 데이터가 있는 경우
  return <div className={className}>{children}</div>;
}
