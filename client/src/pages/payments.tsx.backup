import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, CheckCircle, CreditCard, DollarSign, TrendingUp, RefreshCw, Plus, Eye, FileText, Calendar, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, toPersianDigits } from "@/lib/persian-date";
import { Skeleton } from "@/components/ui/skeleton";

interface Payment {
  id: number;
  representativeId: number;
  invoiceId?: number;
  amount: string;
  paymentDate: string;
  description: string;
  isAllocated: boolean;
  createdAt: string;
  representativeName?: string;
  representativeCode?: string;
  invoiceNumber?: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  amount: string;
  issueDate: string;
  dueDate: string;
  status: string;
}

interface Representative {
  id: number;
  code: string;
  name: string;
  totalDebt: string;
  totalSales: string;
}

interface AllocationSummary {
  totalPayments: number;
  allocatedPayments: number;
  unallocatedPayments: number;
  totalPaidAmount: string;
  totalUnallocatedAmount: string;
}

export default function UnifiedPayments() {
  const [activeTab, setActiveTab] = useState("payments");
  const [selectedRepresentative, setSelectedRepresentative] = useState<string>("");
  const [newPayment, setNewPayment] = useState({
    representativeId: "",
    amount: "",
    paymentDate: "",
    description: ""
  });
  const [autoAllocateTarget, setAutoAllocateTarget] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch representatives
  const { data: representatives = [] } = useQuery<Representative[]>({
    queryKey: ["/api/representatives"],
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    }
  });

  // Fetch all payments with representative details
  const { data: allPayments = [], isLoading: paymentsLoading, refetch: refetchPayments } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    }
  });

  // Fetch unallocated payments for management
  const { data: unallocatedPayments = [], refetch: refetchUnallocated } = useQuery<Payment[]>({
    queryKey: ["/api/payments/unallocated"],
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      return [];
    }
  });

  // Fetch unpaid invoices for selected representative
  const { data: unpaidInvoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices/unpaid", selectedRepresentative],
    enabled: !!selectedRepresentative,
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    }
  });

  // Fetch allocation summary for selected representative
  const { data: allocationSummary, refetch: refetchSummary } = useQuery<AllocationSummary>({
    queryKey: ["/api/payments/allocation-summary", selectedRepresentative],
    enabled: !!selectedRepresentative,
    select: (data: any) => {
      return data || {
        totalPayments: 0,
        allocatedPayments: 0,
        unallocatedPayments: 0,
        totalPaidAmount: "0",
        totalUnallocatedAmount: "0"
      };
    }
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest('/api/payments', {
        method: 'POST',
        data: paymentData
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "پرداخت ثبت شد",
        description: "پرداخت جدید با موفقیت ثبت و تخصیص یافت",
      });
      setNewPayment({
        representativeId: "",
        amount: "",
        paymentDate: "",
        description: ""
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/representatives"] });
      refetchPayments();
      refetchUnallocated();
      refetchSummary();
    },
    onError: (error: any) => {
      toast({
        title: "خطا در ثبت پرداخت",
        description: error.message || "عملیات ناموفق بود",
        variant: "destructive"
      });
    }
  });

  // Auto-allocate mutation
  const autoAllocateMutation = useMutation({
    mutationFn: async (representativeId: string) => {
      const response = await fetch(`/api/payments/auto-allocate/${representativeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        title: "تخصیص خودکار انجام شد",
        description: `${data.allocatedCount} پرداخت به فاکتورها تخصیص یافت`,
      });
      refetchPayments();
      refetchUnallocated();
      refetchSummary();
    },
    onError: (error: any) => {
      toast({
        title: "خطا در تخصیص خودکار",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleCreatePayment = () => {
    if (!newPayment.representativeId || !newPayment.amount) {
      toast({
        title: "اطلاعات ناقص",
        description: "لطفاً نماینده و مبلغ را وارد کنید",
        variant: "destructive"
      });
      return;
    }

    createPaymentMutation.mutate({
      representativeId: parseInt(newPayment.representativeId),
      amount: newPayment.amount,
      paymentDate: newPayment.paymentDate || new Date().toISOString().split('T')[0],
      description: newPayment.description
    });
  };

  const handleAutoAllocate = () => {
    if (!autoAllocateTarget) {
      toast({
        title: "نماینده انتخاب نشده",
        description: "لطفاً نماینده مورد نظر را انتخاب کنید",
        variant: "destructive"
      });
      return;
    }
    autoAllocateMutation.mutate(autoAllocateTarget);
  };

  const filteredPayments = allPayments.filter(payment => {
    const matchesSearch = 
      payment.representativeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.representativeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getPaymentStatusBadge = (isAllocated: boolean) => {
    return isAllocated ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle className="w-3 h-3 ml-1" />
        تخصیص یافته
      </Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <AlertCircle className="w-3 h-3 ml-1" />
        در انتظار تخصیص
      </Badge>
    );
  };

  if (paymentsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            مدیریت پرداخت‌ها
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ثبت، مدیریت و تخصیص پرداخت‌های نمایندگان
          </p>
        </div>
        <Button 
          onClick={() => setActiveTab("new-payment")}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          پرداخت جدید
        </Button>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="payments">فهرست پرداخت‌ها</TabsTrigger>
          <TabsTrigger value="new-payment">پرداخت جدید</TabsTrigger>
          <TabsTrigger value="management">مدیریت تخصیص</TabsTrigger>
          <TabsTrigger value="reports">گزارشات</TabsTrigger>
        </TabsList>

        {/* Payments List Tab */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle>فهرست کلیه پرداخت‌ها</CardTitle>
                <div className="relative w-full lg:w-80">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="جستجو پرداخت..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>تاریخ</TableHead>
                      <TableHead>نماینده</TableHead>
                      <TableHead>مبلغ</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>فاکتور</TableHead>
                      <TableHead>توضیحات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-sm">
                          {payment.paymentDate}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.representativeName}</div>
                            <div className="text-sm text-gray-500 font-mono">{payment.representativeCode}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono font-semibold">
                          {formatCurrency(parseFloat(payment.amount))}
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(payment.isAllocated)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {payment.invoiceNumber || '-'}
                        </TableCell>
                        <TableCell className="max-w-40 truncate">
                          {payment.description || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* New Payment Tab */}
        <TabsContent value="new-payment" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ثبت پرداخت جدید</CardTitle>
                <CardDescription>
                  پرداخت جدید ثبت شده به طور خودکار به قدیمی‌ترین فاکتورهای نماینده تخصیص می‌یابد
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="representative">نماینده</Label>
                  <Select 
                    value={newPayment.representativeId} 
                    onValueChange={(value) => {
                      setNewPayment(prev => ({ ...prev, representativeId: value }));
                      setSelectedRepresentative(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب نماینده" />
                    </SelectTrigger>
                    <SelectContent>
                      {representatives.map((rep) => (
                        <SelectItem key={rep.id} value={rep.id.toString()}>
                          {rep.name} ({rep.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="amount">مبلغ (ریال)</Label>
                  <Input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="مبلغ پرداخت"
                  />
                </div>

                <div>
                  <Label htmlFor="paymentDate">تاریخ پرداخت</Label>
                  <Input
                    type="date"
                    value={newPayment.paymentDate}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, paymentDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="description">توضیحات</Label>
                  <Input
                    value={newPayment.description}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="توضیحات اختیاری"
                  />
                </div>

                <Button 
                  onClick={handleCreatePayment} 
                  disabled={createPaymentMutation.isPending}
                  className="w-full"
                >
                  {createPaymentMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4 ml-2" />
                  )}
                  ثبت پرداخت
                </Button>
              </CardContent>
            </Card>

            {/* Unpaid Invoices for Selected Representative */}
            {selectedRepresentative && (
              <Card>
                <CardHeader>
                  <CardTitle>فاکتورهای پرداخت نشده</CardTitle>
                  <CardDescription>
                    فاکتورهای نماینده انتخاب شده که هنوز پرداخت نشده‌اند
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {unpaidInvoices.length > 0 ? (
                      unpaidInvoices.map((invoice) => (
                        <div key={invoice.id} className="p-3 border rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-mono text-sm">{invoice.invoiceNumber}</div>
                              <div className="text-xs text-gray-500">
                                صادره: {invoice.issueDate}
                              </div>
                            </div>
                            <div className="text-left">
                              <div className="font-semibold">
                                {formatCurrency(parseFloat(invoice.amount))}
                              </div>
                              <Badge variant="destructive" className="text-xs">
                                {invoice.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        فاکتور پرداخت نشده‌ای وجود ندارد
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Management Tab */}
        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تخصیص خودکار پرداخت‌ها</CardTitle>
                <CardDescription>
                  پرداخت‌های بدون تخصیص را به طور خودکار به فاکتورهای نماینده تخصیص دهید
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>انتخاب نماینده برای تخصیص</Label>
                  <Select value={autoAllocateTarget} onValueChange={setAutoAllocateTarget}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب نماینده" />
                    </SelectTrigger>
                    <SelectContent>
                      {representatives.map((rep) => (
                        <SelectItem key={rep.id} value={rep.id.toString()}>
                          {rep.name} ({rep.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleAutoAllocate}
                  disabled={autoAllocateMutation.isPending}
                  className="w-full"
                >
                  {autoAllocateMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 ml-2" />
                  )}
                  تخصیص خودکار
                </Button>

                {allocationSummary && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium mb-2">خلاصه تخصیص</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>کل پرداخت‌ها:</span>
                        <span>{toPersianDigits(allocationSummary.totalPayments.toString())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>تخصیص یافته:</span>
                        <span>{toPersianDigits(allocationSummary.allocatedPayments.toString())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>بدون تخصیص:</span>
                        <span>{toPersianDigits(allocationSummary.unallocatedPayments.toString())}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>مجموع مبلغ:</span>
                        <span>{formatCurrency(parseFloat(allocationSummary.totalPaidAmount))}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>پرداخت‌های بدون تخصیص</CardTitle>
                <CardDescription>
                  فهرست پرداخت‌هایی که هنوز به فاکتور خاصی تخصیص نیافته‌اند
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {unallocatedPayments.length > 0 ? (
                    unallocatedPayments.map((payment) => (
                      <div key={payment.id} className="p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-950">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{payment.representativeName}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {payment.paymentDate}
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="font-semibold">
                              {formatCurrency(parseFloat(payment.amount))}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              بدون تخصیص
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      همه پرداخت‌ها تخصیص یافته‌اند
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      کل پرداخت‌ها
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {toPersianDigits(allPayments.length.toString())}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      تخصیص یافته
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {toPersianDigits(allPayments.filter(p => p.isAllocated).length.toString())}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      در انتظار تخصیص
                    </p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {toPersianDigits(unallocatedPayments.length.toString())}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>مجموع مالی پرداخت‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {formatCurrency(
                    allPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0)
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400">
                  مجموع کل پرداخت‌های دریافتی
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}