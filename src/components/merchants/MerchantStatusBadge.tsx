import React from 'react';
import { Badge } from "@/components/ui/badge";

interface MerchantStatusBadgeProps {
  status: string;
}

export function MerchantStatusBadge({ status }: MerchantStatusBadgeProps) {
  switch (status) {
    case "active":
      return <Badge className="bg-emerald-500 hover:bg-emerald-600">활성</Badge>;
    case "inactive":
      return <Badge variant="secondary" className="bg-slate-400 hover:bg-slate-500">비활성</Badge>;
    case "pending":
      return <Badge variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-50">대기중</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}
