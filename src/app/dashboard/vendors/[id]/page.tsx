import React from 'react';
import { Metadata } from 'next';
import VendorDetail from '@/components/vendor/VendorDetail';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata: Metadata = {
  title: '거래처 상세 정보 | EzPay',
  description: '거래처 상세 정보를 조회합니다.',
};

interface VendorDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * 거래처 상세 정보 페이지
 */
export default function VendorDetailPage({ params }: VendorDetailPageProps) {
  return (
    <DashboardLayout>
      <VendorDetail vendorId={params.id} />
    </DashboardLayout>
  );
}
