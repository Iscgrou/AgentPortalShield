import { useQuery } from "@tanstack/react-query";
import { 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  FileText, 
  Activity,
  Upload,
  Bot
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import InvoiceUpload from "@/components/invoice-upload";
import AiChat from "@/components/ai-chat";
import DebtorRepresentativesCard from "@/components/debtor-representatives-card";
import { formatCurrency, toPersianDigits } from "@/lib/persian-date";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  totalRevenue: number;
  totalDebt: number;
  totalCredit: number;
  totalOutstanding: number;
  totalRepresentatives: number;
  activeRepresentatives: number;
  inactiveRepresentatives: number;
  riskRepresentatives: number;
  totalInvoices: number;
  paidInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  unsentTelegramInvoices: number;
  totalSalesPartners: number;
  activeSalesPartners: number;
  systemIntegrityScore: number;
  lastReconciliationDate: string;
  problematicRepresentativesCount: number;
  responseTime: number;
  cacheStatus: string;
  lastUpdated: string;
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  colorClass = "text-primary",
  onClick 
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: any;
  colorClass?: string;
  onClick?: () => void;
}) {
  return (
    <Card 
      className={`stat-card ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-200">
              {title}
            </p>
            <p className="text-2xl font-bold text-white mt-2">
              {toPersianDigits(value)}
            </p>
            {subtitle && (
              <p className="text-sm text-blue-300 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Icon className={`w-6 h-6 ${colorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ activity }: { activity: any }) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice_created':
        return '📄';
      case 'payment_received':
        return '💰';
      case 'telegram_sent':
        return '📱';
      case 'representative_created':
        return '👤';
      default:
        return '📋';
    }
  };

  return (
    <div className="activity-item">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900 dark:text-white">{activity.description}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(activity.createdAt).toLocaleString('fa-IR')}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/unified-statistics/global"],
    select: (data: any) => data.data // Extract data from unified response structure
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">خطا در بارگذاری اطلاعات داشبورد</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="کل درآمدها"
          value={formatCurrency(dashboardData.totalRevenue)}
          subtitle="مبلغ پرداخت شده - تومان"
          icon={TrendingUp}
          colorClass="text-green-600"
          onClick={() => window.location.href = '/invoices'}
        />
        
        <StatCard
          title="مطالبات معوق"
          value={formatCurrency(dashboardData.totalDebt)}
          subtitle="مانده بدهی - تومان"
          icon={AlertTriangle}
          colorClass="text-red-600"
          onClick={() => window.location.href = '/invoices'}
        />
        
        <StatCard
          title="نمایندگان فعال"
          value={toPersianDigits(dashboardData.activeRepresentatives.toString())}
          subtitle="آخرین آپلود فایل ریزجزئیات"
          icon={Users}
          colorClass="text-blue-600"
          onClick={() => window.location.href = '/representatives'}
        />
        
        <StatCard
          title="فاکتورهای ارسال نشده"
          value={toPersianDigits((dashboardData.unsentTelegramInvoices || 0).toString())}
          subtitle="نیازمند ارسال به تلگرام"
          icon={FileText}
          colorClass="text-orange-600"
          onClick={() => window.location.href = '/invoices'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Invoice Generation Section */}
        <div className="lg:col-span-2">
          <InvoiceUpload />
        </div>

        {/* SHERLOCK v18.0: System Health Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 ml-2" />
                وضعیت سلامت سیستم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">امتیاز یکپارچگی:</span>
                  <Badge variant={dashboardData.systemIntegrityScore >= 90 ? "default" : "destructive"}>
                    {toPersianDigits(dashboardData.systemIntegrityScore.toString())}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">نمایندگان مشکل‌دار:</span>
                  <span className="text-sm font-medium">
                    {toPersianDigits(dashboardData.problematicRepresentativesCount.toString())}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">زمان پاسخ آمار:</span>
                  <span className="text-sm font-medium text-green-600">
                    {toPersianDigits(dashboardData.responseTime.toString())}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">وضعیت Cache:</span>
                  <Badge variant="outline">
                    {dashboardData.cacheStatus === 'FRESH' ? 'بروز' : 'Cache'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SHERLOCK v10.0 NEW COMPONENT: Debtor Representatives Table */}
      <DebtorRepresentativesCard />
    </div>
  );
}
