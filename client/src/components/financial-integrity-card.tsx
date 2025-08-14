
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { formatCurrency, toPersianDigits } from '@/lib/persian-date';
import { Skeleton } from '@/components/ui/skeleton';

interface FinancialIntegrityCardProps {
  representativeId: number;
}

interface FinancialData {
  representativeId: number;
  representativeName: string;
  representativeCode: string;
  
  // ✅ آمار مالی صحیح طبق تعاریف استاندارد
  totalSales: number;           // فروش کل (استاندارد)
  totalPaid: number;           // پرداخت تخصیص یافته
  totalUnpaid: number;         // مجموع پرداخت نشده
  actualDebt: number;          // بدهی استاندارد
  
  paymentRatio: number;
  debtLevel: 'HEALTHY' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  invoiceCount: number;
  paymentCount: number;
  lastTransactionDate: string | null;
  calculationTimestamp: string;
  accuracyGuaranteed: boolean;
}

export function FinancialIntegrityCard({ representativeId }: FinancialIntegrityCardProps) {
  const { data: financialData, isLoading, error, refetch } = useQuery<FinancialData>({
    queryKey: [`/api/unified-financial/representative/${representativeId}`],
    queryFn: () => apiRequest(`/api/unified-financial/representative/${representativeId}`),
    select: (response: any) => {
      console.log('Financial data received:', response);
      return response.data || response;
    },
    retry: 2,
    retryDelay: 1000
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="w-5 h-5 ml-2" />
            آمار مالی (استاندارد)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  if (error || !financialData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <AlertTriangle className="w-5 h-5 ml-2 text-red-500" />
            خطا در دریافت آمار مالی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 ml-2" />
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getDebtLevelBadge = (level: string) => {
    switch (level) {
      case 'HEALTHY':
        return <Badge className="bg-green-100 text-green-800">سالم</Badge>;
      case 'MODERATE':
        return <Badge className="bg-yellow-100 text-yellow-800">متوسط</Badge>;
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800">بالا</Badge>;
      case 'CRITICAL':
        return <Badge className="bg-red-100 text-red-800">بحرانی</Badge>;
      default:
        return <Badge variant="outline">نامشخص</Badge>;
    }
  };

  const getDebtLevelColor = (level: string) => {
    switch (level) {
      case 'HEALTHY': return 'text-green-600';
      case 'MODERATE': return 'text-yellow-600';
      case 'HIGH': return 'text-orange-600';
      case 'CRITICAL': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 ml-2" />
            آمار مالی (استاندارد)
          </div>
          {financialData.accuracyGuaranteed && (
            <Badge className="bg-green-100 text-green-800 text-xs">
              <CheckCircle className="w-3 h-3 ml-1" />
              تضمین دقت ۱۰۰٪
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ✅ فروش کل (استاندارد) */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 font-medium">فروش کل (استاندارد):</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(financialData.totalSales)}
          </span>
        </div>

        {/* ✅ پرداخت تخصیص یافته */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 font-medium">پرداخت تخصیص یافته:</span>
          <span className="font-bold text-green-600 dark:text-green-400">
            {formatCurrency(financialData.totalPaid)}
          </span>
        </div>

        {/* ✅ بدهی استاندارد */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 dark:text-gray-400 font-medium">بدهی استاندارد:</span>
          <span className={`font-bold ${getDebtLevelColor(financialData.debtLevel)}`}>
            {formatCurrency(financialData.actualDebt)}
          </span>
        </div>

        <div className="border-t pt-3 space-y-3">
          {/* Payment Ratio */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">نسبت پرداخت:</span>
            <span className="font-medium">
              {toPersianDigits(financialData.paymentRatio.toString())}%
            </span>
          </div>

          {/* Debt Level */}
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">سطح ریسک:</span>
            {getDebtLevelBadge(financialData.debtLevel)}
          </div>

          {/* Transaction Summary */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-lg text-blue-600">
                {toPersianDigits(financialData.invoiceCount.toString())}
              </div>
              <div className="text-gray-500">فاکتور</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg text-green-600">
                {toPersianDigits(financialData.paymentCount.toString())}
              </div>
              <div className="text-gray-500">پرداخت</div>
            </div>
          </div>

          {/* Last Transaction */}
          {financialData.lastTransactionDate && (
            <div className="text-xs text-gray-500 text-center">
              آخرین تراکنش: {financialData.lastTransactionDate}
            </div>
          )}

          {/* Calculation Timestamp */}
          <div className="text-xs text-gray-400 text-center border-t pt-2">
            محاسبه شده در: {new Date(financialData.calculationTimestamp).toLocaleString('fa-IR')}
          </div>
        </div>

        {/* Refresh Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => refetch()}
        >
          <RefreshCw className="w-4 h-4 ml-2" />
          بروزرسانی آمار
        </Button>
      </CardContent>
    </Card>
  );
}
