import React from 'react';
import { Metadata } from 'next';
import VendorForm from '@/components/vendor/VendorForm';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata: Metadata = {
  title: '거래처 수정 | EzPay',
  description: '거래처 정보를 수정합니다.',
};

interface VendorEditPageProps {
  params: {
    id: string;
  };
}

/**
 * 거래처 수정 페이지
 */
export default function VendorEditPage({ params }: VendorEditPageProps) {
  return (
    <DashboardLayout>
      <VendorForm vendorId={params.id} isEdit={true} />
    </DashboardLayout>
  );
}
