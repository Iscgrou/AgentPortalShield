import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, CreditCard, DollarSign, TrendingUp, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Payment {
  id: number;
  representativeId: number;
  invoiceId?: number;
  amount: string;
  paymentDate: string;
  description: string;
  isAllocated: boolean;
  createdAt: string;
}

interface AllocationSummary {
  totalPayments: number;
  allocatedPayments: number;
  unallocatedPayments: number;
  totalPaidAmount: string;
  totalUnallocatedAmount: string;
}

interface Representative {
  id: number;
  code: string;
  name: string;
  totalDebt: string;
  totalSales: string;
}

export default function PaymentManagement() {
  const [selectedRepresentative, setSelectedRepresentative] = useState<string>("");
  const [autoAllocateTarget, setAutoAllocateTarget] = useState<string>("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch representatives
  const { data: representatives = [] } = useQuery<Representative[]>({
    queryKey: ["/api/representatives"],
  });

  // Fetch unallocated payments
  const { data: unallocatedPayments = [], isLoading: paymentsLoading, refetch: refetchPayments } = useQuery<Payment[]>({
    queryKey: ["/api/payments/unallocated"],
    enabled: true,
  });

  // Fetch allocation summary for selected representative
  const { data: allocationSummary, isLoading: summaryLoading, refetch: refetchSummary } = useQuery<AllocationSummary>({
    queryKey: ["/api/payments/allocation-summary", selectedRepresentative],
    enabled: !!selectedRepresentative,
  });

  // Auto-allocate mutation
  const autoAllocateMutation = useMutation({
    mutationFn: async (representativeId: string) => {
      const response = await fetch(`/api/payments/auto-allocate/${representativeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "خطا در تخصیص خودکار");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ تخصیص خودکار موفق",
        description: `${data.allocated} پرداخت با مبلغ ${data.totalAmount} تومان تخصیص یافت`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      refetchPayments();
      refetchSummary();
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطا در تخصیص خودکار",
        description: error.message || "خطای غیرمنتظره",
        variant: "destructive",
      });
    },
  });

  // Reconcile mutation
  const reconcileMutation = useMutation({
    mutationFn: async (representativeId: string) => {
      const response = await fetch(`/api/reconcile/${representativeId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "خطا در تطبیق مالی");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "✅ تطبیق مالی انجام شد",
        description: `بدهی از ${data.previousDebt} به ${data.newDebt} تغییر یافت`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/representatives"] });
      refetchSummary();
    },
    onError: (error: any) => {
      toast({
        title: "❌ خطا در تطبیق مالی",
        description: error.message || "خطای غیرمنتظره",
        variant: "destructive",
      });
    },
  });

  const handleAutoAllocate = () => {
    if (!autoAllocateTarget) {
      toast({
        title: "انتخاب نماینده",
        description: "لطفاً نماینده مورد نظر را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }
    autoAllocateMutation.mutate(autoAllocateTarget);
  };

  const handleReconcile = () => {
    if (!selectedRepresentative) {
      toast({
        title: "انتخاب نماینده",
        description: "لطفاً نماینده مورد نظر را انتخاب کنید",
        variant: "destructive",
      });
      return;
    }
    reconcileMutation.mutate(selectedRepresentative);
  };

  const formatNumber = (num: string | number) => {
    return new Intl.NumberFormat('fa-IR').format(Number(num));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مدیریت پرداخت‌ها</h1>
          <p className="text-muted-foreground">سیستم همسان‌سازی و تخصیص پرداخت‌ها - فاز ۳</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => {
              refetchPayments();
              refetchSummary();
            }}
            disabled={paymentsLoading || summaryLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            بازخوانی
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">پرداخت‌های تخصیص نیافته</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {unallocatedPayments.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مبلغ تخصیص نیافته</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatNumber(
                unallocatedPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)
              )} تومان
            </div>
          </CardContent>
        </Card>

        {allocationSummary && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">پرداخت‌های تخصیص یافته</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {allocationSummary.allocatedPayments}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مبلغ تخصیص یافته</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(allocationSummary.totalPaidAmount)} تومان
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Auto Allocation Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            تخصیص خودکار پرداخت‌ها
          </CardTitle>
          <CardDescription>
            الگوریتم FIFO برای تخصیص خودکار پرداخت‌ها به فاکتورهای پرداخت نشده
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="autoAllocateSelect">انتخاب نماینده برای تخصیص خودکار</Label>
              <Select value={autoAllocateTarget} onValueChange={setAutoAllocateTarget}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نماینده..." />
                </SelectTrigger>
                <SelectContent>
                  {representatives.map((rep) => (
                    <SelectItem key={rep.id} value={rep.id.toString()}>
                      {rep.code} - {rep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleAutoAllocate}
                disabled={autoAllocateMutation.isPending || !autoAllocateTarget}
                className="w-full"
              >
                {autoAllocateMutation.isPending ? "در حال تخصیص..." : "تخصیص خودکار"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Representative Selection */}
        <Card>
          <CardHeader>
            <CardTitle>خلاصه وضعیت پرداخت‌ها</CardTitle>
            <CardDescription>
              مشاهده وضعیت تخصیص پرداخت‌ها برای نماینده انتخابی
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="repSelect">انتخاب نماینده</Label>
              <Select value={selectedRepresentative} onValueChange={setSelectedRepresentative}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نماینده..." />
                </SelectTrigger>
                <SelectContent>
                  {representatives.map((rep) => (
                    <SelectItem key={rep.id} value={rep.id.toString()}>
                      {rep.code} - {rep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {allocationSummary && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold">خلاصه وضعیت:</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">کل پرداخت‌ها:</span>
                    <p className="font-semibold">{allocationSummary.totalPayments}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">تخصیص یافته:</span>
                    <p className="font-semibold text-green-600">{allocationSummary.allocatedPayments}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">تخصیص نیافته:</span>
                    <p className="font-semibold text-red-600">{allocationSummary.unallocatedPayments}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">مبلغ کل:</span>
                    <p className="font-semibold">{formatNumber(allocationSummary.totalPaidAmount)} تومان</p>
                  </div>
                </div>
              </div>
            )}
            
            <Button 
              onClick={handleReconcile}
              disabled={reconcileMutation.isPending || !selectedRepresentative}
              variant="outline"
              className="w-full"
            >
              {reconcileMutation.isPending ? "در حال تطبیق..." : "تطبیق مالی"}
            </Button>
          </CardContent>
        </Card>

        {/* Unallocated Payments List */}
        <Card>
          <CardHeader>
            <CardTitle>پرداخت‌های تخصیص نیافته</CardTitle>
            <CardDescription>
              لیست پرداخت‌هایی که هنوز به فاکتوری تخصیص نیافته‌اند
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="mr-2">در حال بارگذاری...</span>
              </div>
            ) : unallocatedPayments.length === 0 ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  تمام پرداخت‌ها تخصیص یافته‌اند! 🎉
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {unallocatedPayments.slice(0, 10).map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-semibold">پرداخت #{payment.id}</p>
                      <p className="text-sm text-muted-foreground">
                        نماینده: {representatives.find(r => r.id === payment.representativeId)?.code || payment.representativeId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        تاریخ: {payment.paymentDate}
                      </p>
                    </div>
                    <div className="text-left">
                      <Badge variant="secondary" className="mb-1">
                        {formatNumber(payment.amount)} تومان
                      </Badge>
                      <p className="text-xs text-red-600">تخصیص نیافته</p>
                    </div>
                  </div>
                ))}
                {unallocatedPayments.length > 10 && (
                  <p className="text-sm text-muted-foreground text-center">
                    و {unallocatedPayments.length - 10} پرداخت دیگر...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}