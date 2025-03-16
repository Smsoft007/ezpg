import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export interface TableColumn<T> {
  id: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  pageSize?: number;
  currentPage?: number;
  totalItems?: number;
  isLoading?: boolean;
  emptyMessage?: string;
  onPageChange?: (page: number) => void;
  onSortChange?: (sortColumn: string, sortDirection: 'asc' | 'desc') => void;
  className?: string;
  tableClassName?: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

interface PaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
}

/**
 * 페이지네이션 컴포넌트
 * Shadcn UI의 Pagination 컴포넌트를 래핑하여 페이지 이동 기능을 추가합니다.
 */
const PaginationComponent: React.FC<PaginationComponentProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  // 페이지 변경 핸들러
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  // 페이지 번호 배열 생성 (최대 5개 페이지 표시)
  const getPageNumbers = () => {
    const pageNumbers: number[] = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // 전체 페이지가 5개 이하면 모든 페이지 표시
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // 현재 페이지를 중심으로 표시
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      
      // 끝 페이지가 최대값에 도달하면 시작 페이지 조정
      if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    
    return pageNumbers;
  };

  return (
    <Pagination>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage - 1);
              }} 
            />
          </PaginationItem>
        )}
        
        {getPageNumbers().map((page) => (
          <PaginationItem key={page}>
            <PaginationLink 
              href="#" 
              isActive={page === currentPage}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        
        {currentPage < totalPages && (
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(currentPage + 1);
              }} 
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
};

/**
 * 재사용 가능한 데이터 테이블 컴포넌트
 * 정렬, 페이지네이션 및 로딩 상태를 지원합니다.
 */
export function DataTable<T>({
  data,
  columns,
  pageSize = 10,
  currentPage = 1,
  totalItems = 0,
  isLoading = false,
  emptyMessage = '데이터가 없습니다.',
  onPageChange,
  onSortChange,
  className = '',
  tableClassName = '',
  sortColumn,
  sortDirection = 'asc',
}: DataTableProps<T>) {
  // 정렬 상태 관리
  const [internalSortColumn, setInternalSortColumn] = useState<string | undefined>(sortColumn);
  const [internalSortDirection, setInternalSortDirection] = useState<'asc' | 'desc'>(sortDirection);

  // 컬럼 헤더 클릭 시 정렬 처리
  const handleHeaderClick = (columnId: string) => {
    if (!columns.find(col => col.id === columnId)?.sortable) return;

    const newDirection = 
      internalSortColumn === columnId && internalSortDirection === 'asc' 
        ? 'desc' 
        : 'asc';

    setInternalSortColumn(columnId);
    setInternalSortDirection(newDirection);

    if (onSortChange) {
      onSortChange(columnId, newDirection);
    }
  };

  // 정렬 방향 아이콘 표시
  const renderSortIcon = (columnId: string) => {
    if (internalSortColumn !== columnId) return null;
    
    return internalSortDirection === 'asc' 
      ? <span className="ml-1">↑</span> 
      : <span className="ml-1">↓</span>;
  };

  // 페이지 수 계산
  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <LoadingSpinner size="md" />
        </div>
      ) : (
        <>
          <div className="border rounded-md">
            <Table className={tableClassName}>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead 
                      key={column.id}
                      className={`${column.className || ''} ${column.sortable ? 'cursor-pointer hover:bg-accent hover:text-accent-foreground' : ''}`}
                      onClick={column.sortable ? () => handleHeaderClick(column.id) : undefined}
                    >
                      <div className="flex items-center">
                        {column.header}
                        {column.sortable && renderSortIcon(column.id)}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {columns.map((column) => (
                        <TableCell key={`${rowIndex}-${column.id}`} className={column.className || ''}>
                          {column.cell(item, rowIndex)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-end mt-4">
              <PaginationComponent 
                currentPage={currentPage}
                totalPages={totalPages} 
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
