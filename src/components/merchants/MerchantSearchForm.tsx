import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw } from "lucide-react";
import { MerchantSearchParams } from "@/types/merchants";

export interface MerchantSearchFormProps {
  filters: MerchantSearchParams;
  onFilterChange: (newFilters: Partial<MerchantSearchParams>) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function MerchantSearchForm({ 
  filters, 
  onFilterChange, 
  onSearch, 
  onReset 
}: MerchantSearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="name" className="text-sm font-medium mb-1 block">
            가맹점명
          </label>
          <Input
            id="name"
            type="text"
            placeholder="가맹점명 입력"
            value={filters.name}
            onChange={(e) => onFilterChange({ name: e.target.value })}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="businessNumber" className="text-sm font-medium mb-1 block">
            사업자번호
          </label>
          <Input
            id="businessNumber"
            type="text"
            placeholder="사업자번호 입력 (예: 123-45-67890)"
            value={filters.businessNumber}
            onChange={(e) => onFilterChange({ businessNumber: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          초기화
        </Button>
        <Button type="submit">
          <Search className="h-4 w-4 mr-2" />
          검색
        </Button>
      </div>
    </form>
  );
}
