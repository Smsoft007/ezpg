import React from 'react';
import { Metadata } from 'next';
import VendorForm from '@/components/vendor/VendorForm';
import DashboardLayout from '@/components/layouts/DashboardLayout';

export const metadata: Metadata = {
  title: '거래처 등록 | EzPay',
  description: '새로운 거래처를 등록합니다.',
};

/**
 * 거래처 등록 페이지
 */
export default function VendorCreatePage() {
  return (
    <DashboardLayout>
      <VendorForm />
    </DashboardLayout>
  );
}
