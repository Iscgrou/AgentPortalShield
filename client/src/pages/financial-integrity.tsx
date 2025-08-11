/**
 * SHERLOCK v17.8 - Financial Integrity Management Page
 * صفحه مدیریت یکپارچگی مالی سیستم
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { FinancialIntegrityDashboard } from '../components/financial-integrity-dashboard';

export default function FinancialIntegrityPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-green-600" />
            مدیریت یکپارچگی مالی
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            پایش و تطبیق محاسبات مالی سیستم MarFaNet CRM
          </p>
        </div>
      </div>

      {/* Integrity Dashboard */}
      <FinancialIntegrityDashboard />

      {/* Information Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              مشکلات رایج مالی
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">پرداخت اضافی</h4>
                <p className="text-red-700 dark:text-red-300">
                  نمایندگانی که پرداخت‌هایشان بیش از مجموع فاکتورهاشان است
                </p>
              </div>
              
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">عدم تطبیق</h4>
                <p className="text-yellow-700 dark:text-yellow-300">
                  ناسازگاری بین آمار ذخیره شده و محاسبات واقعی
                </p>
              </div>
              
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-1">امتیاز پایین</h4>
                <p className="text-orange-700 dark:text-orange-300">
                  نمایندگانی با مشکلات متعدد در محاسبات مالی
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              استانداردهای محاسباتی
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">مانده بدهی</h4>
                <p className="text-blue-700 dark:text-blue-300">
                  فاکتورهای unpaid/overdue منهای پرداخت‌های تخصیص‌یافته
                </p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">اعتبار</h4>
                <p className="text-green-700 dark:text-green-300">
                  پرداخت‌های بدون تخصیص (unallocated payments)
                </p>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-1">کل فروش</h4>
                <p className="text-purple-700 dark:text-purple-300">
                  مجموع تمام فاکتورها (paid + unpaid + overdue)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}