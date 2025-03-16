import React from 'react';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * 가맹점 상태 배지 컴포넌트 Props
 */
interface MerchantStatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  className?: string;
}

/**
 * 가맹점 상태를 시각적으로 표시하는 배지 컴포넌트
 * @param status 가맹점 상태 ('active', 'inactive', 'pending', 'suspended')
 * @param className 추가 스타일 클래스
 */
export function MerchantStatusBadge({ status, className }: MerchantStatusBadgeProps) {
  switch (status) {
    case "active":
      return (
        <Badge className={cn("bg-green-100 text-green-800 hover:bg-green-200 border-green-200", className)}>
          활성
        </Badge>
      );
    case "inactive":
      return (
        <Badge variant="outline" className={cn("bg-slate-100 text-slate-800 hover:bg-slate-200 border-slate-200", className)}>
          비활성
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className={cn("bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200", className)}>
          대기중
        </Badge>
      );
    case "suspended":
      return (
        <Badge variant="outline" className={cn("bg-red-100 text-red-800 hover:bg-red-200 border-red-200", className)}>
          정지
        </Badge>
      );
    default:
      return <Badge className={className}>{status}</Badge>;
  }
}
