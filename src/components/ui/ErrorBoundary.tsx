'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * 에러 경계 컴포넌트
 * 하위 컴포넌트에서 발생하는 예외를 포착하고 대체 UI를 표시합니다.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 여기에 에러 로깅 서비스 호출 코드를 추가할 수 있습니다.
    console.error('ErrorBoundary 예외 발생:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // 사용자 정의 fallback UI가 제공된 경우 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // 기본 에러 UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-6 bg-background border rounded-lg shadow-sm">
          <div className="flex flex-col items-center text-center max-w-md">
            <div className="p-3 mb-4 bg-red-100 text-red-600 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">오류가 발생했습니다</h2>
            <p className="text-muted-foreground mb-6">
              {this.state.error?.message || '알 수 없는 오류가 발생했습니다.'}
            </p>
            <Button onClick={this.handleReset}>다시 시도</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
