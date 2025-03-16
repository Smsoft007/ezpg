import React from 'react';
import { Metadata } from 'next';
import VendorList from '@/components/vendor/VendorList';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import PageHeader from '@/components/ui/PageHeader';

export const metadata: Metadata = {
  title: '거래처 관리 | EzPay',
  description: '거래처 목록을 조회하고 관리합니다.',
};

/**
 * 거래처 목록 페이지
 */
export default function VendorsPage() {
  return (
    <DashboardLayout>
      <PageHeader
        title="거래처 관리"
        description="거래처 목록을 조회하고 관리합니다."
        actions={[
          {
            label: '거래처 등록',
            href: '/dashboard/vendors/new',
            variant: 'default',
          },
        ]}
      />
      <VendorList />
    </DashboardLayout>
  );
}
