/**
 * 재사용 가능한 데이터 테이블 컴포넌트
 */
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: keyof T | string;
    header: string;
    cell?: (item: T) => React.ReactNode;
    searchable?: boolean;
  }[];
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchPlaceholder = '검색...',
  onRowClick,
  rowClassName,
  emptyMessage = '데이터가 없습니다.',
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');

  // 검색 가능한 컬럼 필터링
  const searchableColumns = columns.filter((column) => column.searchable);

  // 검색 필터링
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    
    return searchableColumns.some((column) => {
      const key = column.key as keyof T;
      const value = item[key];
      
      if (value === null || value === undefined) return false;
      
      return String(value).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  return (
    <div className="space-y-4">
      {searchableColumns.length > 0 && (
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''} ${
                    rowClassName ? rowClassName(item) : ''
                  }`}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.cell
                        ? column.cell(item)
                        : item[column.key as keyof T]?.toString() || ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
