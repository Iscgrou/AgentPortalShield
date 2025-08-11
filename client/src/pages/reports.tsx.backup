import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  FileText,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, toPersianDigits, getPersianMonthName } from "@/lib/persian-date";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  totalRevenue: string;
  totalDebt: string;
  activeRepresentatives: number;
  pendingInvoices: number;
  overdueInvoices: number;
  recentActivities: any[];
}

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState("current-month");
  const [reportType, setReportType] = useState("financial");

  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard"]
  });

  const { data: representatives } = useQuery({
    queryKey: ["/api/representatives"]
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"]
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/payments"]
  });

  // Mock monthly data for charts
  const monthlyRevenue = [
    { month: "فروردین", amount: 8500000, growth: 12.5 },
    { month: "اردیبهشت", amount: 9200000, growth: 8.2 },
    { month: "خرداد", amount: 10100000, growth: 9.8 },
    { month: "تیر", amount: 11300000, growth: 11.9 },
    { month: "مرداد", amount: 12500000, growth: 10.6 },
    { month: "شهریور", amount: 11800000, growth: -5.6 }
  ];

  const RepresentativePerformance = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>عملکرد برتر نمایندگان</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(representatives as any)?.slice(0, 10).map((rep: any, index: number) => (
              <div key={rep.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {toPersianDigits((index + 1).toString())}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{rep.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">کد: {rep.code}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(rep.totalSales)} تومان
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">فروش کل</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نمایندگان با بدهی بالا</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(representatives as any)?.filter((rep: any) => parseFloat(rep.totalDebt) > 100000)
              .slice(0, 5).map((rep: any) => (
              <div key={rep.id} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{rep.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">کد: {rep.code}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="font-medium text-red-600 dark:text-red-400">
                    {formatCurrency(rep.totalDebt)} تومان
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">بدهی</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const FinancialReport = () => (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>روند درآمد ماهانه</span>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              دانلود نمودار
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyRevenue.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.month}
                  </span>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className="text-sm font-medium">
                      {formatCurrency(item.amount.toString())} ت
                    </span>
                    <Badge 
                      variant={item.growth >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {item.growth >= 0 ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />}
                      {toPersianDigits(Math.abs(item.growth).toFixed(1))}%
                    </Badge>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(item.amount / Math.max(...monthlyRevenue.map(m => m.amount))) * 100}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">درآمد این ماه</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {dashboardData ? formatCurrency(dashboardData.totalRevenue) : "۰"}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400 ml-1" />
              <span className="text-green-600 dark:text-green-400">+۸.۵%</span>
              <span className="text-gray-500 dark:text-gray-400 mr-2">نسبت به ماه گذشته</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">نرخ وصولی</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {toPersianDigits('87%')}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 dark:text-blue-400">بالاتر از میانگین</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">میانگین پرداخت</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {toPersianDigits('12')} روز
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="w-4 h-4 text-green-600 dark:text-green-400 ml-1" />
              <span className="text-green-600 dark:text-green-400">-۲ روز</span>
              <span className="text-gray-500 dark:text-gray-400 mr-2">بهبود یافته</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">مطالبات معوق</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {dashboardData ? formatCurrency(dashboardData.totalDebt) : "۰"}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 dark:text-red-400">
                {dashboardData ? toPersianDigits(dashboardData.overdueInvoices.toString()) : "۰"} نماینده
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const InvoiceAnalysis = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>تحلیل فاکتورها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {invoices ? toPersianDigits((invoices as any).length.toString()) : "۰"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">کل فاکتورها</p>
            </div>
            
            <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-12 h-12 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">✓</span>
              </div>
              <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                {invoices ? toPersianDigits((invoices as any).filter((inv: any) => inv.status === 'paid').length.toString()) : "۰"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">پرداخت شده</p>
            </div>
            
            <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <div className="w-12 h-12 bg-orange-600 dark:bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold">⏱</span>
              </div>
              <h3 className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {invoices ? toPersianDigits((invoices as any).filter((inv: any) => inv.status === 'unpaid').length.toString()) : "۰"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">در انتظار پرداخت</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>روند صدور فاکتور</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              آمار ۶ ماه اخیر
            </div>
            {[
              { month: "شهریور", count: 42, amount: "11800000" },
              { month: "مرداد", count: 38, amount: "12500000" },
              { month: "تیر", count: 45, amount: "11300000" },
              { month: "خرداد", count: 41, amount: "10100000" },
              { month: "اردیبهشت", count: 39, amount: "9200000" },
              { month: "فروردین", count: 36, amount: "8500000" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">{item.month}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {toPersianDigits(item.count.toString())} فاکتور
                  </p>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.amount)} تومان
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">گزارشات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            تحلیل عملکرد مالی و گزارشات تفصیلی
          </p>
        </div>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="انتخاب دوره" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">ماه جاری</SelectItem>
              <SelectItem value="last-month">ماه گذشته</SelectItem>
              <SelectItem value="last-3-months">۳ ماه اخیر</SelectItem>
              <SelectItem value="last-6-months">۶ ماه اخیر</SelectItem>
              <SelectItem value="current-year">سال جاری</SelectItem>
            </SelectContent>
          </Select>
          
          <Button>
            <Download className="w-4 h-4 mr-2" />
            دانلود گزارش PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">کل درآمد</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {dashboardData ? formatCurrency(dashboardData.totalRevenue) : "۰"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">تومان</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">نمایندگان فعال</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                  {dashboardData ? toPersianDigits(dashboardData.activeRepresentatives.toString()) : "۰"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">فروشگاه</p>
              </div>
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">فاکتورهای صادره</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {invoices ? toPersianDigits((invoices as any).length.toString()) : "۰"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">فاکتور</p>
              </div>
              <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">مطالبات معوق</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-2">
                  {dashboardData ? formatCurrency(dashboardData.totalDebt) : "۰"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">تومان</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="financial" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financial">گزارش مالی</TabsTrigger>
          <TabsTrigger value="performance">عملکرد نمایندگان</TabsTrigger>
          <TabsTrigger value="invoices">تحلیل فاکتورها</TabsTrigger>
        </TabsList>

        <TabsContent value="financial">
          <FinancialReport />
        </TabsContent>

        <TabsContent value="performance">
          <RepresentativePerformance />
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}
