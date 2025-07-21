import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Settings as SettingsIcon, 
  Save, 
  TestTube, 
  Bot, 
  Send, 
  Key,
  MessageSquare,
  Calculator,
  Palette,
  Bell,
  Shield,
  FileText,
  Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { toPersianDigits } from "@/lib/persian-date";

const telegramSettingsSchema = z.object({
  botToken: z.string().min(1, "توکن ربات الزامی است"),
  chatId: z.string().min(1, "شناسه چت الزامی است"),
  template: z.string().min(1, "قالب پیام الزامی است"),
});

const portalSettingsSchema = z.object({
  portalTitle: z.string().min(1, "عنوان پورتال الزامی است"),
  portalDescription: z.string().optional(),
  showOwnerName: z.boolean(),
  showDetailedUsage: z.boolean(),
  customCss: z.string().optional(),
});

const invoiceTemplateSchema = z.object({
  invoiceHeader: z.string().min(1, "سربرگ فاکتور الزامی است"),
  invoiceFooter: z.string().optional(),
  showUsageDetails: z.boolean(),
  usageFormat: z.string().optional(),
});

const calculationSettingsSchema = z.object({
  baseRate: z.string().min(1, "نرخ پایه الزامی است"),
  dueDays: z.string().min(1, "روزهای سررسید الزامی است"),
});

const aiSettingsSchema = z.object({
  geminiApiKey: z.string().min(1, "کلید API الزامی است"),
  enableAutoAnalysis: z.boolean(),
  analysisFrequency: z.string(),
});

type TelegramSettingsData = z.infer<typeof telegramSettingsSchema>;
type CalculationSettingsData = z.infer<typeof calculationSettingsSchema>;
type AiSettingsData = z.infer<typeof aiSettingsSchema>;
type PortalSettingsData = z.infer<typeof portalSettingsSchema>;
type InvoiceTemplateData = z.infer<typeof invoiceTemplateSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("telegram");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current settings
  const { data: telegramBotToken } = useQuery({
    queryKey: ["/api/settings/telegram_bot_token"]
  });
  
  const { data: telegramChatId } = useQuery({
    queryKey: ["/api/settings/telegram_chat_id"]
  });
  
  const { data: telegramTemplate } = useQuery({
    queryKey: ["/api/settings/telegram_template"]
  });
  
  const { data: baseRate } = useQuery({
    queryKey: ["/api/settings/invoice_base_rate"]
  });
  
  const { data: dueDays } = useQuery({
    queryKey: ["/api/settings/invoice_due_days"]
  });

  // Forms
  const telegramForm = useForm<TelegramSettingsData>({
    resolver: zodResolver(telegramSettingsSchema),
    defaultValues: {
      botToken: "",
      chatId: "",
      template: `📋 فاکتور شماره {invoice_number}

🏪 نماینده: {representative_name}
👤 صاحب فروشگاه: {shop_owner}
📱 شناسه پنل: {panel_id}
💰 مبلغ فاکتور: {amount} تومان
📅 تاریخ صدور: {issue_date}
🔍 وضعیت: {status}

ℹ️ برای مشاهده جزئیات کامل فاکتور، وارد لینک زیر بشوید

{portal_link}

تولید شده توسط سیستم مدیریت مالی 🤖`
    }
  });

  const calculationForm = useForm<CalculationSettingsData>({
    resolver: zodResolver(calculationSettingsSchema),
    defaultValues: {
      baseRate: "1000",
      dueDays: "30"
    }
  });

  const aiForm = useForm<AiSettingsData>({
    resolver: zodResolver(aiSettingsSchema),
    defaultValues: {
      geminiApiKey: "",
      enableAutoAnalysis: false,
      analysisFrequency: "daily"
    }
  });

  // Update forms when data is loaded
  useEffect(() => {
    if ((telegramBotToken as any)?.value) telegramForm.setValue('botToken', (telegramBotToken as any).value);
    if ((telegramChatId as any)?.value) telegramForm.setValue('chatId', (telegramChatId as any).value);
    if ((telegramTemplate as any)?.value) telegramForm.setValue('template', (telegramTemplate as any).value);
    if ((baseRate as any)?.value) calculationForm.setValue('baseRate', (baseRate as any).value);
    if ((dueDays as any)?.value) calculationForm.setValue('dueDays', (dueDays as any).value);
  }, [telegramBotToken, telegramChatId, telegramTemplate, baseRate, dueDays]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string, value: string }) => {
      const response = await apiRequest('PUT', `/api/settings/${key}`, { value });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "تنظیمات ذخیره شد",
        description: "تغییرات با موفقیت اعمال شد",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطا در ذخیره تنظیمات",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const testTelegramMutation = useMutation({
    mutationFn: async () => {
      // This would test the Telegram connection
      const response = await apiRequest('POST', '/api/test-telegram');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "اتصال تلگرام موفق",
        description: "پیام تست با موفقیت ارسال شد",
      });
    },
    onError: () => {
      toast({
        title: "خطا در اتصال تلگرام",
        description: "لطفاً تنظیمات را بررسی کنید",
        variant: "destructive",
      });
    }
  });

  const onTelegramSubmit = async (data: TelegramSettingsData) => {
    await updateSettingMutation.mutateAsync({ key: 'telegram_bot_token', value: data.botToken });
    await updateSettingMutation.mutateAsync({ key: 'telegram_chat_id', value: data.chatId });
    await updateSettingMutation.mutateAsync({ key: 'telegram_template', value: data.template });
  };

  const onCalculationSubmit = async (data: CalculationSettingsData) => {
    await updateSettingMutation.mutateAsync({ key: 'invoice_base_rate', value: data.baseRate });
    await updateSettingMutation.mutateAsync({ key: 'invoice_due_days', value: data.dueDays });
  };

  const onAiSubmit = async (data: AiSettingsData) => {
    await updateSettingMutation.mutateAsync({ key: 'gemini_api_key', value: data.geminiApiKey });
    await updateSettingMutation.mutateAsync({ key: 'ai_auto_analysis', value: data.enableAutoAnalysis.toString() });
    await updateSettingMutation.mutateAsync({ key: 'ai_analysis_frequency', value: data.analysisFrequency });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">تنظیمات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            تنظیمات سیستم، یکپارچگی‌ها و پیکربندی
          </p>
        </div>
        
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          نسخه ۱.۰.۰
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="telegram" className="flex items-center">
            <Send className="w-4 h-4 mr-2" />
            تلگرام
          </TabsTrigger>
          <TabsTrigger value="calculation" className="flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            محاسبات
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center">
            <Bot className="w-4 h-4 mr-2" />
            هوش مصنوعی
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            امنیت
          </TabsTrigger>
        </TabsList>

        {/* Telegram Settings */}
        <TabsContent value="telegram">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Send className="w-5 h-5 ml-2" />
                  تنظیمات ربات تلگرام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...telegramForm}>
                  <form onSubmit={telegramForm.handleSubmit(onTelegramSubmit)} className="space-y-4">
                    <FormField
                      control={telegramForm.control}
                      name="botToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>توکن ربات تلگرام</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" 
                              type="password"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            توکن ربات تلگرام خود را از @BotFather دریافت کنید
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={telegramForm.control}
                      name="chatId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شناسه چت</FormLabel>
                          <FormControl>
                            <Input placeholder="-1001234567890" {...field} />
                          </FormControl>
                          <FormDescription>
                            شناسه چت یا گروه برای ارسال فاکتورها
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex items-center space-x-4 space-x-reverse pt-4">
                      <Button 
                        type="submit" 
                        disabled={updateSettingMutation.isPending}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {updateSettingMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => testTelegramMutation.mutate()}
                        disabled={testTelegramMutation.isPending}
                      >
                        <TestTube className="w-4 h-4 mr-2" />
                        {testTelegramMutation.isPending ? "در حال تست..." : "تست اتصال"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="w-5 h-5 ml-2" />
                  قالب پیام تلگرام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...telegramForm}>
                  <FormField
                    control={telegramForm.control}
                    name="template"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>قالب پیام</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="قالب پیام خود را وارد کنید..."
                            rows={12}
                            className="font-mono text-sm"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription className="space-y-1">
                          <div>متغیرهای قابل استفاده:</div>
                          <div className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded">
                            {`{invoice_number}, {representative_name}, {shop_owner}, {panel_id}, {amount}, {issue_date}, {status}, {portal_link}`}
                          </div>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Calculation Settings */}
        <TabsContent value="calculation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 ml-2" />
                تنظیمات محاسبات مالی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...calculationForm}>
                <form onSubmit={calculationForm.handleSubmit(onCalculationSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={calculationForm.control}
                      name="baseRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نرخ پایه (تومان برای هر واحد)</FormLabel>
                          <FormControl>
                            <Input placeholder="1000" {...field} />
                          </FormControl>
                          <FormDescription>
                            نرخ پایه برای محاسبه فاکتورها بر اساس میزان مصرف
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={calculationForm.control}
                      name="dueDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>روزهای سررسید</FormLabel>
                          <FormControl>
                            <Input placeholder="30" {...field} />
                          </FormControl>
                          <FormDescription>
                            تعداد روزهای اعتبار فاکتور تا سررسید
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                      منطق محاسبه قیمت‌گذاری طبقه‌بندی شده
                    </h4>
                    <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                      <div>• تا ۱۰۰ واحد: نرخ پایه</div>
                      <div>• ۱۰۱ تا ۵۰۰ واحد: ۱۰% تخفیف</div>
                      <div>• بالای ۵۰۰ واحد: ۲۰% تخفیف</div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updateSettingMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettingMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="w-5 h-5 ml-2" />
                تنظیمات هوش مصنوعی (Gemini AI)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...aiForm}>
                <form onSubmit={aiForm.handleSubmit(onAiSubmit)} className="space-y-6">
                  <FormField
                    control={aiForm.control}
                    name="geminiApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>کلید API گمینی</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="AIza..."
                            type="password"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          کلید API خود را از Google AI Studio دریافت کنید
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>تحلیل خودکار</Label>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          فعال‌سازی تحلیل خودکار وضعیت مالی
                        </p>
                      </div>
                      <FormField
                        control={aiForm.control}
                        name="enableAutoAnalysis"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={aiForm.control}
                      name="analysisFrequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>دوره تحلیل</FormLabel>
                          <select 
                            value={field.value}
                            onChange={field.onChange}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg"
                          >
                            <option value="daily">روزانه</option>
                            <option value="weekly">هفتگی</option>
                            <option value="monthly">ماهانه</option>
                          </select>
                          <FormDescription>
                            فاصله زمانی برای تحلیل خودکار
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-200 mb-2">
                      قابلیت‌های هوش مصنوعی
                    </h4>
                    <div className="space-y-1 text-sm text-green-800 dark:text-green-300">
                      <div>✓ تحلیل وضعیت مالی شرکت</div>
                      <div>✓ ارزیابی ریسک نمایندگان</div>
                      <div>✓ پیشنهادات بهبود عملکرد</div>
                      <div>✓ هشدارهای هوشمند</div>
                      <div>✓ تولید گزارشات تحلیلی</div>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={updateSettingMutation.isPending}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettingMutation.isPending ? "در حال ذخیره..." : "ذخیره تنظیمات"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>



        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 ml-2" />
                تنظیمات امنیتی
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>اعتبارسنجی دو مرحله‌ای</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        فعال‌سازی احراز هویت دو مرحله‌ای برای امنیت بیشتر
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">بک‌آپ خودکار</Label>
                  <select className="w-full mt-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                    <option value="daily">روزانه</option>
                    <option value="weekly">هفتگی</option>
                    <option value="monthly">ماهانه</option>
                    <option value="disabled">غیرفعال</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>لاگ فعالیت‌ها</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ذخیره تمام فعالیت‌های انجام شده در سیستم
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-900 dark:text-yellow-200 mb-2">
                    تنظیمات پیشرفته امنیتی
                  </h4>
                  <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-300">
                    <div>• رمزگذاری داده‌های حساس با AES-256</div>
                    <div>• محدودیت تلاش ورود ناموفق</div>
                    <div>• نظارت بر دسترسی‌های مشکوک</div>
                    <div>• بک‌آپ رمزگذاری شده</div>
                  </div>
                </div>

                <Button className="w-full">
                  <Key className="w-4 h-4 mr-2" />
                  تغییر رمز عبور اصلی
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
