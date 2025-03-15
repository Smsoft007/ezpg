"use client";

import { Button } from "@/components/ui/button";
import { TransactionPagination as TransactionPaginationType } from "@/docs/interface/transaction";

interface TransactionPaginationProps {
  pagination: TransactionPaginationType;
  onPageChange: (page: number) => void;
}

export function TransactionPagination({
  pagination,
  onPageChange,
}: TransactionPaginationProps) {
  const { currentPage, totalPages, pageSize, totalItems } = pagination;

  // 페이지 번호 배열 생성
  const getPageNumbers = () => {
    const result: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // 전체 페이지가 표시할 최대 페이지 수보다 작거나 같으면 모든 페이지 표시
      for (let i = 1; i <= totalPages; i++) {
        result.push(i);
      }
    } else {
      // 현재 페이지를 중심으로 표시
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = startPage + maxVisiblePages - 1;
      
      // 마지막 페이지가 전체 페이지 수를 초과하면 조정
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        result.push(i);
      }
    }
    
    return result;
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-muted-foreground">
        총 {totalItems}개 항목 중 {(currentPage - 1) * pageSize + 1}-
        {Math.min(currentPage * pageSize, totalItems)}개 표시 ({currentPage}/{totalPages} 페이지)
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </Button>
        <div className="flex items-center">
          {getPageNumbers().map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "outline"}
              size="sm"
              className="w-9 h-9 mx-0.5"
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          다음
        </Button>
      </div>
    </div>
  );
}
