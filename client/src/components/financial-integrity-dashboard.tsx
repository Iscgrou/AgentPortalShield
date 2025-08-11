/**
 * SHERLOCK v17.8 - Financial Integrity Dashboard Component
 * کامپوننت نمایش وضعیت یکپارچگی مالی سیستم
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { useToast } from '../hooks/use-toast';
import { Loader2, RefreshCw, ShieldCheck, AlertTriangle, TrendingUp } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

interface FinancialIntegrityStats {
  summary: {
    excessPaymentRepsCount: number;
    reconciliationNeededCount: number;
    lowIntegrityRepsCount: number;
    totalProblematicCount: number;
  };
}

interface SystemReconciliationResult {
  summary: {
    totalReconciled: number;
    totalFixed: number;
    averageIntegrityScoreImprovement: number;
    executionTimeFormatted: string;
  };
}

export function FinancialIntegrityDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReconciling, setIsReconciling] = useState(false);

  // گرفتن آمار نمایندگان مشکل‌دار
  const { data: integrityStats, isLoading, refetch } = useQuery({
    queryKey: ['/api/financial-integrity/problematic-representatives'],
    refetchInterval: 30000, // هر 30 ثانیه refresh
  });

  // تطبیق مالی سراسری
  const systemReconcileMutation = useMutation({
    mutationFn: () => apiRequest('/api/financial-integrity/system-reconciliation', {
      method: 'POST'
    }),
    onSuccess: (result: { data: SystemReconciliationResult; message: string }) => {
      toast({
        title: "موفقیت",
        description: result.message
      });
      
      // بروزرسانی cache ها
      queryClient.invalidateQueries({ queryKey: ['/api/financial-integrity/problematic-representatives'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['/api/representatives'] });
    },
    onError: (error: any) => {
      toast({
        title: "خطا",
        description: error?.message || "خطا در تطبیق مالی سراسری",
        variant: "destructive"
      });
    }
  });

  const handleSystemReconciliation = async () => {
    setIsReconciling(true);
    try {
      await systemReconcileMutation.mutateAsync();
    } finally {
      setIsReconciling(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin ml-2" />
          <span>در حال بارگیری آمار یکپارچگی مالی...</span>
        </CardContent>
      </Card>
    );
  }

  const stats = integrityStats?.data?.summary as FinancialIntegrityStats['summary'];

  // محاسبه امتیاز کلی سلامت سیستم
  const totalReps = 249; // تعداد کل نمایندگان
  const healthScore = stats ? Math.max(0, 100 - Math.round((stats.totalProblematicCount / totalReps) * 100)) : 0;

  return (
    <div className="space-y-6">
      {/* آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  امتیاز سلامت سیستم
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {healthScore}%
                </p>
              </div>
              <ShieldCheck className="w-8 h-8 text-green-500" />
            </div>
            <Progress value={healthScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  کل نمایندگان مشکل‌دار
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats?.totalProblematicCount || 0}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  پرداخت اضافی
                </p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats?.excessPaymentRepsCount || 0}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  نیاز به تطبیق
                </p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats?.reconciliationNeededCount || 0}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* اقدامات مدیریتی */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            مدیریت یکپارچگی مالی
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* هشدار در صورت وجود مشکل */}
          {stats && stats.totalProblematicCount > 0 && (
            <Alert>
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>
                {stats.totalProblematicCount} نماینده نیاز به تطبیق مالی دارند. 
                برای بهبود دقت آمار مالی، تطبیق سراسری انجام دهید.
              </AlertDescription>
            </Alert>
          )}

          {/* دکمه تطبیق سراسری */}
          <div className="flex gap-4">
            <Button 
              onClick={handleSystemReconciliation}
              disabled={isReconciling || systemReconcileMutation.isPending}
              size="lg"
            >
              {(isReconciling || systemReconcileMutation.isPending) ? (
                <Loader2 className="w-4 h-4 animate-spin ml-2" />
              ) : (
                <RefreshCw className="w-4 h-4 ml-2" />
              )}
              تطبیق مالی سراسری
            </Button>

            <Button 
              variant="outline" 
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
              بروزرسانی آمار
            </Button>
          </div>

          {/* نتیجه آخرین تطبیق */}
          {systemReconcileMutation.data?.data && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                آخرین تطبیق انجام شده:
              </h4>
              <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                <p>تعداد تطبیق‌شده: {systemReconcileMutation.data.data.summary.totalReconciled} نماینده</p>
                <p>تعداد برطرف‌شده: {systemReconcileMutation.data.data.summary.totalFixed} نماینده</p>
                <p>زمان اجرا: {systemReconcileMutation.data.data.summary.executionTimeFormatted}</p>
              </div>
            </div>
          )}

          {/* راهنما */}
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <p><strong>راهنما:</strong></p>
            <ul className="mt-1 space-y-1 list-disc list-inside">
              <li>امتیاز سلامت 90+: وضعیت عالی، نیازی به اقدام نیست</li>
              <li>امتیاز سلامت 70-89: وضعیت قابل قبول، بررسی ماهانه توصیه می‌شود</li>
              <li>امتیاز سلامت زیر 70: وضعیت نیازمند توجه، تطبیق فوری لازم</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}