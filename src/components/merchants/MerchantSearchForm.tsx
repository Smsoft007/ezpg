import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCcw } from "lucide-react";

interface MerchantSearchFormProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
}

export function MerchantSearchForm({ 
  searchTerm, 
  onSearchChange, 
  onSearch, 
  onReset 
}: MerchantSearchFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm items-center space-x-2">
      <Input
        type="text"
        placeholder="가맹점명 또는 사업자번호 검색"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1"
      />
      <Button type="submit" size="icon">
        <Search className="h-4 w-4" />
      </Button>
      <Button type="button" variant="outline" size="icon" onClick={onReset}>
        <RefreshCcw className="h-4 w-4" />
      </Button>
    </form>
  );
}
