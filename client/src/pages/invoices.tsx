// SHERLOCK v23.0: Enhanced invoices page with API connection
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

export default function Invoices() {
  // Test invoice API connection
  const { data: invoices, isLoading, error } = useQuery({
    queryKey: ['/api/invoices'],
    queryFn: () => apiRequest('/api/invoices'),
    retry: false
  });

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>مدیریت فاکتورها</CardTitle>
          <CardDescription>
            {isLoading && "در حال بارگذاری فاکتورها..."}
            {error && `خطا در دسترسی: ${error instanceof Error ? error.message : 'نامشخص'}`}
            {invoices && `تعداد فاکتورها: ${invoices?.length || 0}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-red-600">
              ❌ مشکل در دسترسی به API فاکتورها
            </div>
          ) : invoices ? (
            <div className="text-green-600">
              ✅ API فاکتورها عملیاتی است
            </div>
          ) : (
            <div className="text-blue-600">
              🔄 در حال اتصال...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}