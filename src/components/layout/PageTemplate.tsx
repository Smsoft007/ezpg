import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface PageTemplateProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  isLoading?: boolean;
  className?: string;
  contentClassName?: string;
  fullWidth?: boolean;
  withErrorBoundary?: boolean;
}

/**
 * 페이지 템플릿 컴포넌트
 * 일관된 레이아웃과 에러 처리, 로딩 상태를 제공합니다.
 */
export function PageTemplate({
  title,
  subtitle,
  children,
  actions,
  isLoading = false,
  className,
  contentClassName,
  fullWidth = false,
  withErrorBoundary = true,
}: PageTemplateProps) {
  const content = (
    <div className={cn(
      "space-y-6",
      className
    )}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="ml-auto flex-shrink-0">{actions}</div>}
      </div>

      {isLoading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <div className={cn(
          "bg-card text-card-foreground rounded-lg shadow",
          !fullWidth && "p-6",
          contentClassName
        )}>
          {children}
        </div>
      )}
    </div>
  );

  if (withErrorBoundary) {
    return <ErrorBoundary>{content}</ErrorBoundary>;
  }

  return content;
}
