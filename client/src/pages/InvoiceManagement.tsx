// فاز ۲: Invoice Management Page
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InvoiceManualForm } from "@/components/InvoiceManualForm";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Search, Filter } from "lucide-react";

interface Invoice {
  id: number;
  invoiceNumber: string;
  representativeId: number;
  representativeName?: string;
  representativeCode?: string;
  amount: string;
  issueDate: string;
  dueDate?: string;
  status: string;
  batchId?: number;
  batch?: {
    batchName: string;
    batchCode: string;
  };
  usageData?: any;
  createdAt: string;
}

export function InvoiceManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // دریافت لیست فاکتورها با اطلاعات batch
  const { data: invoices = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/invoices/with-batch-info'],
    queryFn: () => apiRequest('/api/invoices/with-batch-info')
  });

  // Mutation برای حذف فاکتور
  const deleteInvoiceMutation = useMutation({
    mutationFn: (invoiceId: number) =>
      apiRequest(`/api/invoices/${invoiceId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast({
        title: "✅ موفقیت",
        description: "فاکتور با موفقیت حذف شد"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] });
      refetch();
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "❌ خطا",
        description: error.message || "خطا در حذف فاکتور"
      });
    }
  });

  // فیلتر کردن فاکتورها
  const filteredInvoices = invoices.filter((invoice: Invoice) => {
    const matchesSearch = 
      invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.representativeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.representativeCode?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // تابع کمکی برای نمایش وضعیت
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      unpaid: { label: "پرداخت نشده", variant: "destructive" as const },
      paid: { label: "پرداخت شده", variant: "default" as const },
      overdue: { label: "سررسید گذشته", variant: "secondary" as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { label: status, variant: "outline" as const };
    
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // تابع کمکی برای فرمت کردن مبلغ
  const formatAmount = (amount: string) => {
    return new Intl.NumberFormat('fa-IR').format(Number(amount)) + ' تومان';
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">مدیریت فاکتورها</h1>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              ایجاد فاکتور دستی
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>ایجاد فاکتور دستی</DialogTitle>
            </DialogHeader>
            <InvoiceManualForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
                refetch();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* فیلترها و جستجو */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فیلترها و جستجو
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="جستجو بر اساس شماره فاکتور، نام نماینده یا کد..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="فیلتر وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">همه وضعیت‌ها</SelectItem>
                <SelectItem value="unpaid">پرداخت نشده</SelectItem>
                <SelectItem value="paid">پرداخت شده</SelectItem>
                <SelectItem value="overdue">سررسید گذشته</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
              }}
            >
              پاک کردن فیلترها
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* جدول فاکتورها */}
      <Card>
        <CardHeader>
          <CardTitle>لیست فاکتورها ({filteredInvoices.length} فاکتور)</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">در حال بارگذاری...</div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {invoices.length === 0 ? "هیچ فاکتوری یافت نشد" : "نتیجه‌ای برای جستجوی شما یافت نشد"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">شماره فاکتور</TableHead>
                    <TableHead className="text-right">نماینده</TableHead>
                    <TableHead className="text-right">مبلغ</TableHead>
                    <TableHead className="text-right">تاریخ صدور</TableHead>
                    <TableHead className="text-right">سررسید</TableHead>
                    <TableHead className="text-right">وضعیت</TableHead>
                    <TableHead className="text-right">دسته</TableHead>
                    <TableHead className="text-right">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice: Invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono">
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{invoice.representativeName}</div>
                          <div className="text-sm text-gray-500">{invoice.representativeCode}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatAmount(invoice.amount)}</TableCell>
                      <TableCell>{invoice.issueDate}</TableCell>
                      <TableCell>{invoice.dueDate || "-"}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>
                        {invoice.batch ? (
                          <div className="text-sm">
                            <div className="font-medium">{invoice.batch.batchName}</div>
                            <div className="text-gray-500">{invoice.batch.batchCode}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">بدون دسته</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingInvoice(invoice)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                              <DialogHeader>
                                <DialogTitle>ویرایش فاکتور {invoice.invoiceNumber}</DialogTitle>
                              </DialogHeader>
                              {editingInvoice && (
                                <InvoiceManualForm
                                  editInvoice={editingInvoice}
                                  onSuccess={() => {
                                    setEditingInvoice(null);
                                    refetch();
                                  }}
                                />
                              )}
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف فاکتور</AlertDialogTitle>
                                <AlertDialogDescription>
                                  آیا مطمئن هستید که می‌خواهید فاکتور {invoice.invoiceNumber} 
                                  را حذف کنید؟ این عمل قابل بازگشت نیست.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>انصراف</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteInvoiceMutation.mutate(invoice.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  حذف فاکتور
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default InvoiceManagement;