/**
 * SHERLOCK v4.0 FINANCIAL INTEGRITY CARD
 * تبدیل به سیستم واحد یکپارچگی مالی
 * 
 * استفاده از Financial Integrity Engine برای محاسبات استاندارد
 */

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingUp, Shield, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/persian-date";

interface FinancialIntegrityCardProps {
  representativeId: number;
}

interface FinancialSnapshot {
  representativeId: number;
  representativeName: string;
  
  // فاکتورها
  totalInvoices: number;
  totalInvoiceAmount: number;
  unpaidInvoiceAmount: number;
  paidInvoiceAmount: number;
  
  // پرداخت‌ها
  totalPayments: number;
  totalPaymentAmount: number;
  allocatedPaymentAmount: number;
  unallocatedPaymentAmount: number;
  
  // محاسبات نهایی (استاندارد)
  standardDebt: number;
  standardCredit: number;
  standardTotalSales: number;
  
  // وضعیت سلامت مالی
  hasExcessPayments: boolean;
  needsReconciliation: boolean;
  integrityScore: number;
}

export function FinancialIntegrityCard({ representativeId }: FinancialIntegrityCardProps) {
  const { data: snapshot, isLoading, error } = useQuery({
    queryKey: [`/api/financial-integrity/representative/${representativeId}/snapshot`],
    enabled: !!representativeId,
    refetchInterval: 30000, // تازه‌سازی هر 30 ثانیه
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <DollarSign className="w-5 h-5 ml-2 animate-spin" />
            بارگیری آمار مالی...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 ml-2" />
            خطا در بارگیری آمار مالی
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-500">
            امکان دریافت اطلاعات مالی وجود ندارد. لطفاً صفحه را تازه‌سازی کنید.
          </p>
        </CardContent>
      </Card>
    );
  }

  const financialData = snapshot as FinancialSnapshot;
  
  const getIntegrityBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-500">عالی ({score}/100)</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-500">قابل قبول ({score}/100)</Badge>;
    if (score >= 50) return <Badge className="bg-orange-500">نیاز به بررسی ({score}/100)</Badge>;
    return <Badge className="bg-red-500">مشکل‌دار ({score}/100)</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-5 h-5 ml-2" />
            آمار مالی - SHERLOCK v4.0
          </div>
          {getIntegrityBadge(financialData.integrityScore)}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Financial Metrics - Standardized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-200 dark:border-green-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">فروش کل (استاندارد)</div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(financialData.standardTotalSales)}
            </div>
            <div className="text-xs text-gray-500 mt-1">از Financial Integrity Engine</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
            <div className="text-sm text-gray-600 dark:text-gray-400">پرداخت‌های تخصیص‌یافته</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(financialData.allocatedPaymentAmount)}
            </div>
            <div className="text-xs text-gray-500 mt-1">پرداخت‌های تأیید شده</div>
          </div>
        </div>

        {/* Standard Debt Calculation */}
        <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg border-2 border-red-200 dark:border-red-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">بدهی استاندارد</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(financialData.standardDebt)}
          </div>
          <div className="text-xs text-gray-500 mt-1">محاسبه شده توسط موتور یکپارچگی مالی</div>
        </div>

        <Separator />
        
        {/* Enhanced Breakdown Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">اعتبار باقیمانده:</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {formatCurrency(financialData.standardCredit)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">فاکتورهای پرداخت نشده:</span>
            <span className="font-semibold text-orange-600 dark:text-orange-400">
              {formatCurrency(financialData.unpaidInvoiceAmount)}
            </span>
          </div>

          {financialData.needsReconciliation && (
            <div className="flex justify-between items-center p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
              <span className="text-yellow-700 dark:text-yellow-300 text-xs">⚠️ نیاز به تطبیق مالی</span>
              <Badge variant="outline" className="text-yellow-600">
                <TrendingUp className="w-3 h-3 ml-1" />
                تطبیق
              </Badge>
            </div>
          )}

          {financialData.hasExcessPayments && (
            <div className="flex justify-between items-center p-2 bg-blue-50 dark:bg-blue-950 rounded">
              <span className="text-blue-700 dark:text-blue-300 text-xs">💰 پرداخت اضافی شناسایی شد</span>
              <Badge variant="outline" className="text-blue-600">اضافه پرداخت</Badge>
            </div>
          )}
        </div>

        {/* SHERLOCK v4.0 Signature */}
        <div className="pt-2 border-t text-center">
          <span className="text-xs text-gray-400">
            محاسبات استاندارد شده - SHERLOCK v4.0 Financial Integrity Engine
          </span>
        </div>
      </CardContent>
    </Card>
  );
}