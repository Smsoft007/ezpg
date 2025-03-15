"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TransactionFilter as TransactionFilterType } from "@/types/transaction";
import { cn } from "@/lib/utils";
import { CalendarIcon, Search, X } from "lucide-react";
import { useState } from "react";

interface TransactionFilterProps {
  filter: TransactionFilterType;
  onFilterChange: (filter: TransactionFilterType) => void;
  onResetFilter: () => void;
  showTypeFilter?: boolean;
}

export function TransactionFilter({
  filter,
  onFilterChange,
  onResetFilter,
  showTypeFilter = false,
}: TransactionFilterProps) {
  const [dateRange, setDateRange] = useState<{
    from: Date | null;
    to: Date | null;
  }>({
    from: filter.dateFrom ? new Date(filter.dateFrom) : null,
    to: filter.dateTo ? new Date(filter.dateTo) : null,
  });

  // 날짜 변경 핸들러
  const handleDateChange = (field: 'from' | 'to', date: Date | null) => {
    const newDateRange = { ...dateRange, [field]: date };
    setDateRange(newDateRange);

    // 필터에 날짜 적용
    if (field === 'from') {
      onFilterChange({
        ...filter,
        dateFrom: date ? date.toISOString().split('T')[0] : undefined,
      });
    } else {
      onFilterChange({
        ...filter,
        dateTo: date ? date.toISOString().split('T')[0] : undefined,
      });
    }
  };

  // 필터 변경 핸들러
  const handleFilterChange = (field: keyof TransactionFilterType, value: any) => {
    const newFilter = { ...filter, [field]: value };
    onFilterChange(newFilter);
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">상세 검색</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onResetFilter}
            className="h-8 text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            필터 초기화
          </Button>
        </div>
        <CardDescription>원하는 조건으로 거래를 검색하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">거래 기간</label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.from.toLocaleDateString('ko-KR')
                    ) : (
                      "시작일 선택"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) => handleDateChange('from', date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? (
                      dateRange.to.toLocaleDateString('ko-KR')
                    ) : (
                      "종료일 선택"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) => handleDateChange('to', date || null)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">거래 상태</label>
            <Select
              value={filter.status || ""}
              onValueChange={(value) => handleFilterChange('status', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="모든 상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 상태</SelectItem>
                <SelectItem value="completed">완료</SelectItem>
                <SelectItem value="pending">대기중</SelectItem>
                <SelectItem value="failed">실패</SelectItem>
                <SelectItem value="cancelled">취소됨</SelectItem>
                <SelectItem value="refunded">환불됨</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">결제 방법</label>
            <Select
              value={filter.paymentMethod || ""}
              onValueChange={(value) => handleFilterChange('paymentMethod', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="모든 결제 방법" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">모든 결제 방법</SelectItem>
                <SelectItem value="card">신용카드</SelectItem>
                <SelectItem value="bank">계좌이체</SelectItem>
                <SelectItem value="virtual">가상계좌</SelectItem>
                <SelectItem value="crypto">암호화폐</SelectItem>
                <SelectItem value="other">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {showTypeFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">거래 유형</label>
              <Select
                value={filter.type || ""}
                onValueChange={(value) => handleFilterChange('type', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="모든 거래 유형" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">모든 거래 유형</SelectItem>
                  <SelectItem value="deposit">입금</SelectItem>
                  <SelectItem value="withdrawal">출금</SelectItem>
                  <SelectItem value="refund">환불</SelectItem>
                  <SelectItem value="adjustment">조정</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-medium">금액 범위</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="최소 금액"
                value={filter.minAmount || ""}
                onChange={(e) => handleFilterChange('minAmount', e.target.value ? Number(e.target.value) : undefined)}
              />
              <Input
                type="number"
                placeholder="최대 금액"
                value={filter.maxAmount || ""}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)}
              />
            </div>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">검색어</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="거래 ID, 가맹점명, 고객명, 이메일로 검색"
                className="pl-9"
                value={filter.search || ""}
                onChange={(e) => handleFilterChange('search', e.target.value || undefined)}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
