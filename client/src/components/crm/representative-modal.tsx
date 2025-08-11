import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, Phone, Mail, MapPin, DollarSign, Calendar,
  TrendingUp, Activity, FileText, Save, X
} from 'lucide-react';

interface Representative {
  id: number;
  code: string;
  name: string;
  ownerName: string;
  panelUsername: string;
  phone: string;
  publicId: string;
  salesPartnerId: string;
  isActive: boolean;
  totalDebt: string;
  totalSales: string;
  credit: string;
  createdAt: string;
  updatedAt: string;
  recentInvoices?: any[];
  recentPayments?: any[];
  summary?: {
    totalInvoices: number;
    totalPayments: number;
    lastActivity: string;
  };
}

interface RepresentativeModalProps {
  representative: Representative;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isEditing: boolean;
  isLoading: boolean;
}

const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fa-IR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + ' تومان';
};

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

export default function RepresentativeModal({
  representative,
  isOpen,
  onClose,
  onSave,
  isEditing,
  isLoading
}: RepresentativeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    ownerName: '',
    phone: '',
    panelUsername: '',
    isActive: true
  });

  useEffect(() => {
    if (representative) {
      setFormData({
        name: representative.name || '',
        code: representative.code || '',
        ownerName: representative.ownerName || '',
        phone: representative.phone || '',
        panelUsername: representative.panelUsername || '',
        isActive: representative.isActive
      });
    }
  }, [representative]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!representative) return null;

  const debtAmount = parseFloat(representative.totalDebt || '0');
  const salesAmount = parseFloat(representative.totalSales || '0');
  const creditAmount = parseFloat(representative.credit || '0');
  const debtRatio = salesAmount > 0 ? (debtAmount / salesAmount) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900 to-black border-white/20" dir="rtl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <User className="w-8 h-8 text-blue-400" />
                {representative.name}
              </DialogTitle>
              <p className="text-gray-300 mt-2">
                کد نماینده: {representative.code} | مالک: {representative.ownerName}
              </p>
            </div>
            <Badge variant={representative.isActive ? "default" : "secondary"} className="text-lg px-3 py-1">
              {representative.isActive ? 'فعال' : 'غیرفعال'}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue={isEditing ? "edit" : "overview"} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-black/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
              <Activity className="w-4 h-4 ml-2" />
              نمای کلی
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-white/20">
              <DollarSign className="w-4 h-4 ml-2" />
              مالی
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white/20">
              <FileText className="w-4 h-4 ml-2" />
              فعالیت‌ها
            </TabsTrigger>
            {isEditing && (
              <TabsTrigger value="edit" className="data-[state=active]:bg-white/20">
                <Save className="w-4 h-4 ml-2" />
                ویرایش
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Information */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Phone className="w-5 h-5 ml-2 text-green-400" />
                    اطلاعات تماس
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-white">{representative.phone || 'ثبت نشده'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-white">نام کاربری: {representative.panelUsername || 'ندارد'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-white">شناسه عمومی: {representative.publicId}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="w-5 h-5 ml-2 text-blue-400" />
                    آمار سریع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">کل فروش:</span>
                    <span className="text-green-400 font-semibold">{formatCurrency(salesAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">بدهی:</span>
                    <span className="text-red-400 font-semibold">{formatCurrency(debtAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">کل پرداخت‌ها:</span>
                    <span className="text-blue-400 font-semibold">{formatCurrency(creditAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">نسبت بدهی:</span>
                    <span className={`font-semibold ${debtRatio > 50 ? 'text-red-400' : 'text-yellow-400'}`}>
                      {debtRatio.toFixed(1)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Info */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Calendar className="w-5 h-5 ml-2 text-purple-400" />
                  اطلاعات تکمیلی
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-300 text-sm">تاریخ ایجاد:</p>
                  <p className="text-white">{formatDate(representative.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">آخرین بروزرسانی:</p>
                  <p className="text-white">{formatDate(representative.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">شناسه شریک فروش:</p>
                  <p className="text-white">{representative.salesPartnerId || 'ندارد'}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">وضعیت:</p>
                  <Badge variant={representative.isActive ? "default" : "secondary"}>
                    {representative.isActive ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">کل فروش</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(salesAmount)}</p>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">بدهی</p>
                  <p className="text-2xl font-bold text-red-400">{formatCurrency(debtAmount)}</p>
                </CardContent>
              </Card>
              <Card className="bg-black/20 border-white/10">
                <CardContent className="p-4 text-center">
                  <Activity className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-gray-300 text-sm">کل پرداخت‌ها</p>
                  <p className="text-2xl font-bold text-blue-400">{formatCurrency(creditAmount)}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">تحلیل مالی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">نسبت بدهی به فروش</span>
                      <span className="text-white">{debtRatio.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          debtRatio > 70 ? 'bg-red-600' : 
                          debtRatio > 40 ? 'bg-yellow-600' : 'bg-green-600'
                        }`}
                        style={{ width: `${Math.min(debtRatio, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-gray-300 text-sm mb-2">وضعیت مالی:</p>
                      <Badge variant={debtRatio > 50 ? "destructive" : "default"}>
                        {debtRatio > 70 ? 'پرریسک' : debtRatio > 40 ? 'متوسط' : 'سالم'}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-300 text-sm mb-2">توصیه:</p>
                      <p className="text-white text-sm">
                        {debtRatio > 70 ? 'نیاز به پیگیری فوری' : 
                         debtRatio > 40 ? 'نظارت بیشتر' : 'ادامه همکاری'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Recent Invoices */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">آخرین فاکتورها</CardTitle>
                </CardHeader>
                <CardContent>
                  {representative.recentInvoices && representative.recentInvoices.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {representative.recentInvoices.map((invoice: any, index: number) => (
                        <div key={index} className="p-2 bg-white/5 rounded">
                          <div className="flex justify-between">
                            <span className="text-white text-sm">فاکتور #{invoice.invoiceNumber}</span>
                            <span className="text-green-400 text-sm">{formatCurrency(invoice.amount)}</span>
                          </div>
                          <p className="text-gray-400 text-xs">{formatDate(invoice.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">فاکتوری ثبت نشده</p>
                  )}
                </CardContent>
              </Card>

              {/* Recent Payments */}
              <Card className="bg-black/20 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">آخرین پرداخت‌ها</CardTitle>
                </CardHeader>
                <CardContent>
                  {representative.recentPayments && representative.recentPayments.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {representative.recentPayments.map((payment: any, index: number) => (
                        <div key={index} className="p-2 bg-white/5 rounded">
                          <div className="flex justify-between">
                            <span className="text-white text-sm">پرداخت</span>
                            <span className="text-blue-400 text-sm">{formatCurrency(payment.amount)}</span>
                          </div>
                          <p className="text-gray-400 text-xs">{payment.description}</p>
                          <p className="text-gray-400 text-xs">{formatDate(payment.createdAt)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-4">پرداختی ثبت نشده</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Activity Summary */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">خلاصه فعالیت</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">
                      {representative.summary?.totalInvoices || 0}
                    </p>
                    <p className="text-gray-300 text-sm">کل فاکتورها</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {representative.summary?.totalPayments || 0}
                    </p>
                    <p className="text-gray-300 text-sm">کل پرداخت‌ها</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-yellow-400">امروز</p>
                    <p className="text-gray-300 text-sm">آخرین فعالیت</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isEditing && (
            <TabsContent value="edit" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Card className="bg-black/20 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">ویرایش اطلاعات نماینده</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-white">نام نماینده *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="code" className="text-white">کد نماینده *</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => handleInputChange('code', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="ownerName" className="text-white">نام مالک</Label>
                        <Input
                          id="ownerName"
                          value={formData.ownerName}
                          onChange={(e) => handleInputChange('ownerName', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-white">شماره تماس</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                          placeholder="09xxxxxxxxx"
                        />
                      </div>
                      <div>
                        <Label htmlFor="panelUsername" className="text-white">نام کاربری پنل</Label>
                        <Input
                          id="panelUsername"
                          value={formData.panelUsername}
                          onChange={(e) => handleInputChange('panelUsername', e.target.value)}
                          className="bg-white/10 border-white/20 text-white"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => handleInputChange('isActive', e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded"
                        />
                        <Label htmlFor="isActive" className="text-white">فعال</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={onClose}>
                    <X className="w-4 h-4 ml-2" />
                    انصراف
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isLoading}
                  >
                    <Save className="w-4 h-4 ml-2" />
                    {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}