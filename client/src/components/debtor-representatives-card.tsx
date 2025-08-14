import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { formatCurrency, toPersianDigits } from "@/lib/persian-date";
import { apiRequest } from "@/lib/queryClient";

interface DebtorRepresentative {
  id: number;
  representativeId?: number; // Added for potential use in key generation
  name: string;
  code: string;
  remainingDebt: string;
  totalInvoices: string;
  totalPayments: string;
}

interface GlobalSummary {
  totalSystemDebt: string;
  totalRepresentatives: number;
}

function DebtorRepresentativeRow({ representative }: { representative: DebtorRepresentative }) {
  const remainingDebt = parseFloat(representative.remainingDebt) || 0;

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center space-x-3 rtl:space-x-reverse flex-1">
        <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {representative.name}
            </p>
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
              {representative.code}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <span>مجموع فاکتور: {formatCurrency(parseFloat(representative.totalInvoices) || 0)}</span>
            <span>•</span>
            <span>پرداخت شده: {formatCurrency(parseFloat(representative.totalPayments) || 0)}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center">
        <div className="text-right">
          <p className="text-sm font-bold text-red-600 dark:text-red-400">
            {formatCurrency(remainingDebt)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">تومان</p>
        </div>
      </div>
    </div>
  );
}

export default function DebtorRepresentativesCard() {
  // Fetch debtor representatives data with fallback
  const { data: debtorData, isLoading: isLoadingDebtors, error: errorDebtors } = useQuery<DebtorRepresentative[]>({
    queryKey: ["debtor-representatives"],
    queryFn: async () => {
      console.log('SHERLOCK v1.0: Fetching URL:', '/api/unified-financial/debtors');

      try {
        const response = await fetch('/api/unified-financial/debtors?limit=30', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data)) {
          console.log(`SHERLOCK v1.0: Loaded ${result.data.length} debtor representatives`);
          return result.data;
        } else {
          console.log('Fallback to legacy endpoint');
          const legacyResponse = await fetch('/api/dashboard/debtor-representatives', {
            credentials: 'include'
          });

          if (legacyResponse.ok) {
            const legacyData = await legacyResponse.json();
            return Array.isArray(legacyData) ? legacyData : [];
          }

          return [];
        }
      } catch (error) {
        console.error('Error fetching debtor representatives:', error);
        return [];
      }
    },
    staleTime: 180000, // 3 minutes - shorter for real-time feel
    gcTime: 600000, // Keep in memory for 10 minutes
    refetchOnWindowFocus: false, // Prevent excessive refetching
    retry: 2,
    refetchInterval: 300000, // 5 minutes auto-refresh
    retryDelay: 1000
  });

  // Fetch global summary data
  const { data: globalSummary, isLoading: isLoadingSummary, error: errorSummary } = useQuery<GlobalSummary>({
    queryKey: ["global-financial-summary"],
    queryFn: async () => {
      console.log('SHERLOCK v23.0: Fetching URL:', '/api/unified-financial/summary');
      try {
        const response = await fetch('/api/unified-financial/summary', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const result = await response.json();

        if (result.success && result.data) {
          console.log(`SHERLOCK v23.0: Loaded global summary`);
          // Assuming result.data contains totalSystemDebt and totalRepresentatives
          return {
            totalSystemDebt: result.data.totalSystemDebt || "0",
            totalRepresentatives: result.data.totalRepresentatives || 0
          };
        } else {
          console.log('SHERLOCK v23.0: Failed to load global summary, falling back to legacy endpoint.');
          // Fallback to a legacy endpoint if available, or return default/empty
          return { totalSystemDebt: "0", totalRepresentatives: 0 };
        }
      } catch (error) {
        console.error('Error fetching global financial summary:', error);
        return { totalSystemDebt: "0", totalRepresentatives: 0 };
      }
    },
    staleTime: 180000, // 3 minutes
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    refetchInterval: 300000, // 5 minutes
    retryDelay: 1000
  });

  if (isLoadingDebtors) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <TrendingDown className="w-5 h-5 ml-2" />
            نمایندگان بدهکار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={`skeleton-${i}`} className="animate-pulse">
                <div className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (errorDebtors) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <TrendingDown className="w-5 h-5 ml-2 text-red-600" />
            نمایندگان بدهکار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-red-600 dark:text-red-400">
              خطا در بارگذاری داده‌های نمایندگان بدهکار. لطفاً دوباره تلاش کنید.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!debtorData || debtorData.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <TrendingDown className="w-5 h-5 ml-2 text-red-600" />
            نمایندگان بدهکار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              🎉 همه نمایندگان مطالبات خود را تسویه کرده‌اند
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 ml-2" />
            مطالبات معوق
          </CardTitle>
          {globalSummary && (
            <div className="text-left">
              <div className="text-sm text-gray-500 dark:text-gray-400">مجموع کل بدهی</div>
              <div className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatCurrency(parseFloat(globalSummary.totalSystemDebt) || 0)}
              </div>
              <div className="text-xs text-gray-400">
                ({toPersianDigits(globalSummary.totalRepresentatives.toString())} نماینده)
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-y-auto space-y-0 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {debtorData.slice(0, 10).map((debtor: any, index: number) => (
              <DebtorRepresentativeRow
                key={`debtor-${debtor.representativeId || debtor.id}-${debtor.remainingDebt || 0}`}
                representative={debtor}
              />
            ))}
          </div>
        </div>
        <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <p className="text-xs text-orange-700 dark:text-orange-300 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-1" />
            <span className="font-medium">توجه:</span>
            <span className="mr-1">نمایندگان بر اساس میزان بدهی مرتب شده‌اند - از بالا تا پایین</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}