import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { formatCurrency, toPersianDigits } from "@/lib/persian-date";

interface DebtorRepresentative {
  id: number;
  name: string;
  code: string;
  remainingDebt: string;
  totalInvoices: string;
  totalPayments: string;
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
  const { data: debtorReps, isLoading, error } = useQuery<DebtorRepresentative[]>({
    queryKey: ["/api/dashboard/debtor-representatives"],
    queryFn: async () => {
      console.log('SHERLOCK v18.4: Fetching URL:', '/api/unified-financial/debtors');
      const response = await fetch('/api/unified-financial/debtors');
      if (!response.ok) throw new Error('Failed to fetch debtor representatives');
      const result = await response.json();
      return result.success ? result.data : result;
    },
    refetchInterval: 30000
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingDown className="w-5 h-5 ml-2 text-red-600" />
            نمایندگان بدهکار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!debtorReps || debtorReps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingDown className="w-5 h-5 ml-2 text-red-600" />
            نمایندگان بدهکار
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {toPersianDigits(debtorReps.length.toString())} نماینده
            </span>
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="max-h-80 overflow-y-auto space-y-0 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {debtorReps.map((representative) => (
              <DebtorRepresentativeRow 
                key={representative.id} 
                representative={representative} 
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