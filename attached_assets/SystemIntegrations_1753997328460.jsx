import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    MessageSquare, Database, Globe, Zap, 
    Settings, CheckCircle2, AlertCircle, 
    Key, Eye, EyeOff, TestTube, 
    Webhook, Bot, Shield, Link
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SystemIntegrations() {
    const [integrations, setIntegrations] = useState({
        telegram: {
            enabled: true,
            bot_token: '••••••••••••••••••••••••••••••••••••••••••••••',
            webhook_url: 'https://api.telegram.org/bot{token}/setWebhook',
            status: 'connected',
            last_sync: '2024-01-15T10:30:00Z'
        },
        external_api: {
            enabled: false,
            api_key: '',
            endpoint: 'https://api.example.com/v1',
            status: 'disconnected',
            last_sync: null
        },
        database: {
            enabled: true,
            connection_string: 'postgresql://••••••••••••••••••••••••••••••••••••',
            status: 'connected',
            last_backup: '2024-01-15T02:00:00Z'
        }
    });

    const [showTokens, setShowTokens] = useState({});
    const [testResults, setTestResults] = useState({});
    const [loading, setLoading] = useState({});

    const handleToggleIntegration = (key) => {
        setIntegrations(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                enabled: !prev[key].enabled
            }
        }));
    };

    const handleUpdateConfig = (key, field, value) => {
        setIntegrations(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    const handleTestConnection = async (key) => {
        setLoading(prev => ({ ...prev, [key]: true }));
        
        try {
            // شبیه‌سازی تست اتصال
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const success = Math.random() > 0.3; // 70% chance of success
            setTestResults(prev => ({
                ...prev,
                [key]: {
                    success,
                    message: success ? 'اتصال موفق' : 'خطا در اتصال',
                    timestamp: new Date().toISOString()
                }
            }));
        } catch (error) {
            setTestResults(prev => ({
                ...prev,
                [key]: {
                    success: false,
                    message: 'خطا در تست اتصال',
                    timestamp: new Date().toISOString()
                }
            }));
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const integrationConfigs = [
        {
            key: 'telegram',
            title: 'یکپارچه‌سازی تلگرام',
            description: 'اتصال به API تلگرام برای ارسال پیام‌ها',
            icon: MessageSquare,
            color: 'blue',
            fields: [
                { key: 'bot_token', label: 'توکن ربات', type: 'password', required: true },
                { key: 'webhook_url', label: 'URL وب‌هوک', type: 'url', required: true }
            ]
        },
        {
            key: 'external_api',
            title: 'API خارجی',
            description: 'اتصال به سرویس‌های خارجی',
            icon: Globe,
            color: 'green',
            fields: [
                { key: 'api_key', label: 'کلید API', type: 'password', required: true },
                { key: 'endpoint', label: 'نقطه پایانی', type: 'url', required: true }
            ]
        },
        {
            key: 'database',
            title: 'دیتابیس',
            description: 'اتصال به دیتابیس اصلی',
            icon: Database,
            color: 'purple',
            fields: [
                { key: 'connection_string', label: 'رشته اتصال', type: 'password', required: true }
            ]
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">یکپارچه‌سازی‌ها</h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {Object.values(integrations).filter(i => i.enabled).length} فعال
                </Badge>
            </div>

            <div className="grid gap-6">
                {integrationConfigs.map((config) => {
                    const integration = integrations[config.key];
                    const isLoading = loading[config.key];
                    const testResult = testResults[config.key];

                    return (
                        <Card key={config.key} className="relative">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-${config.color}-100`}>
                                            <config.icon className={`w-5 h-5 text-${config.color}-600`} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{config.title}</CardTitle>
                                            <p className="text-sm text-gray-600">{config.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant={integration.status === 'connected' ? 'default' : 'secondary'}
                                            className={
                                                integration.status === 'connected'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }
                                        >
                                            {integration.status === 'connected' ? 'متصل' : 'قطع'}
                                        </Badge>
                                        <Switch
                                            checked={integration.enabled}
                                            onCheckedChange={() => handleToggleIntegration(config.key)}
                                        />
                                    </div>
                                </div>
                            </CardHeader>

                            {integration.enabled && (
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {config.fields.map((field) => (
                                            <div key={field.key}>
                                                <Label className="flex items-center gap-2">
                                                    {field.label}
                                                    {field.required && <span className="text-red-500">*</span>}
                                                </Label>
                                                <div className="relative">
                                                    <Input
                                                        type={field.type === 'password' && !showTokens[`${config.key}_${field.key}`] ? 'password' : 'text'}
                                                        value={integration[field.key] || ''}
                                                        onChange={(e) => handleUpdateConfig(config.key, field.key, e.target.value)}
                                                        placeholder={`${field.label} را وارد کنید`}
                                                        className="pr-10"
                                                    />
                                                    {field.type === 'password' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowTokens(prev => ({
                                                                ...prev,
                                                                [`${config.key}_${field.key}`]: !prev[`${config.key}_${field.key}`]
                                                            }))}
                                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showTokens[`${config.key}_${field.key}`] ? 
                                                                <EyeOff className="w-4 h-4" /> : 
                                                                <Eye className="w-4 h-4" />
                                                            }
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleTestConnection(config.key)}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                        در حال تست...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <TestTube className="w-4 h-4" />
                                                        تست اتصال
                                                    </div>
                                                )}
                                            </Button>

                                            {testResult && (
                                                <div className={`flex items-center gap-2 text-sm ${
                                                    testResult.success ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {testResult.success ? (
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    ) : (
                                                        <AlertCircle className="w-4 h-4" />
                                                    )}
                                                    {testResult.message}
                                                </div>
                                            )}
                                        </div>

                                        <div className="text-sm text-gray-500">
                                            {integration.last_sync ? (
                                                `آخرین همگام‌سازی: ${new Date(integration.last_sync).toLocaleString('fa-IR')}`
                                            ) : (
                                                'هرگز همگام‌سازی نشده'
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Integration Guide */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        راهنمای یکپارچه‌سازی
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="telegram" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="telegram">تلگرام</TabsTrigger>
                            <TabsTrigger value="api">API خارجی</TabsTrigger>
                            <TabsTrigger value="database">دیتابیس</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="telegram" className="mt-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold">تنظیم ربات تلگرام:</h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                    <li>با @BotFather در تلگرام چت کنید</li>
                                    <li>دستور /newbot را ارسال کنید</li>
                                    <li>نام و نام کاربری برای ربات انتخاب کنید</li>
                                    <li>توکن دریافتی را در فیلد بالا وارد کنید</li>
                                    <li>URL وب‌هوک را تنظیم کنید</li>
                                </ol>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="api" className="mt-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold">اتصال به API خارجی:</h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                    <li>کلید API را از سرویس مورد نظر دریافت کنید</li>
                                    <li>URL نقطه پایانی را وارد کنید</li>
                                    <li>با دکمه تست اتصال، صحت اتصال را بررسی کنید</li>
                                    <li>در صورت موفقیت، یکپارچه‌سازی را فعال کنید</li>
                                </ol>
                            </div>
                        </TabsContent>
                        
                        <TabsContent value="database" className="mt-4">
                            <div className="space-y-4">
                                <h4 className="font-semibold">تنظیم دیتابیس:</h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                                    <li>رشته اتصال دیتابیس را بررسی کنید</li>
                                    <li>اطمینان حاصل کنید که کاربر دسترسی مناسب دارد</li>
                                    <li>تست اتصال را انجام دهید</li>
                                    <li>پشتیبان‌گیری منظم را تنظیم کنید</li>
                                </ol>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}