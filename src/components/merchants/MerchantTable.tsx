import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, FileEdit, Building2 } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Merchant } from "@/types/merchants";
import { MerchantStatusBadge } from './MerchantStatusBadge';
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface MerchantTableProps {
  merchants: Merchant[];
  isLoading?: boolean;
}

export function MerchantTable({ merchants, isLoading = false }: MerchantTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>가맹점명</TableHead>
              <TableHead>사업자번호</TableHead>
              <TableHead>대표자명</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="h-24">
                <div className="flex justify-center items-center">
                  <LoadingSpinner size="sm" text="데이터를 불러오는 중..." />
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  if (merchants.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>가맹점명</TableHead>
              <TableHead>사업자번호</TableHead>
              <TableHead>대표자명</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>등록일</TableHead>
              <TableHead>관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6} className="h-24">
                <div className="flex flex-col items-center justify-center gap-2 py-4">
                  <div className="rounded-full bg-muted p-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    검색 결과가 없습니다
                  </p>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>가맹점명</TableHead>
            <TableHead>사업자번호</TableHead>
            <TableHead>대표자명</TableHead>
            <TableHead>상태</TableHead>
            <TableHead>등록일</TableHead>
            <TableHead>관리</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {merchants.map((merchant) => (
            <TableRow key={merchant.id}>
              <TableCell className="font-medium">{merchant.name}</TableCell>
              <TableCell>{merchant.businessNumber}</TableCell>
              <TableCell>{merchant.representativeName}</TableCell>
              <TableCell>
                <MerchantStatusBadge status={merchant.status} />
              </TableCell>
              <TableCell>{formatDate(merchant.createdAt)}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/dashboard/merchants/${merchant.id}`}>
                    <Button variant="ghost" size="icon" title="상세보기">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/dashboard/merchants/${merchant.id}/edit`}>
                    <Button variant="ghost" size="icon" title="수정">
                      <FileEdit className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
