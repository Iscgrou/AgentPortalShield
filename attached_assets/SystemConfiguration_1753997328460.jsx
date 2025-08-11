import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Settings, Save, RefreshCw, AlertCircle, 
    Clock, Shield, Database, Zap, 
    Monitor, Globe, Server, Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export default function SystemConfiguration() {
    const [config, setConfig] = useState({
        system: {
            timezone: 'Asia/Tehran',
            language: 'fa',
            date_format: 'jalali',
            currency: 'IRR',
            working_hours_start: '08:00',
            working_hours_end: '18:00'
        },
        ai: {
            task_generation_enabled: true,
            auto_assignment_enabled: true,
            intelligent_scheduling: true,
            response_timeout: 30,
            max_suggestions: 5,
            confidence_threshold: 0.7
        },
        performance: {
            cache_enabled: true,
            cache_duration: 3600,
            max_concurrent_tasks: 100,
            database_optimization: true,
            compression_enabled: true
        },
        security: {
            session_timeout: 1800,
            max_login_attempts: 3,
            password_complexity: true,
            two_factor_auth: false,
            audit_logging: true
        }
    });

    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState(null);

    const handleConfigChange = (section, key, value) => {
        setConfig(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        setSaveStatus('saving');
        
        try {
            // در اینجا تنظیمات در دیتابیس ذخیره می‌شوند
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            setSaveStatus('success');
            setTimeout(() => setSaveStatus(null), 3000);
        } catch (error) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const configSections = [
        {
            id: 'system',
            title: 'تنظیمات سیستم',
            icon: Monitor,
            color: 'blue'
        },
        {
            id: 'ai',
            title: 'تنظیمات هوش مصنوعی',
            icon: Cpu,
            color: 'purple'
        },
        {
            id: 'performance',
            title: 'عملکرد سیستم',
            icon: Zap,
            color: 'green'
        },
        {
            id: 'security',
            title: 'امنیت',
            icon: Shield,
            color: 'red'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">تنظیمات سیستم</h2>
                <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            در حال ذخیره...
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Save className="w-4 h-4" />
                            ذخیره تنظیمات
                        </div>
                    )}
                </Button>
            </div>

            {saveStatus && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                        saveStatus === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-800' 
                            : saveStatus === 'error'
                            ? 'bg-red-50 border border-red-200 text-red-800'
                            : 'bg-blue-50 border border-blue-200 text-blue-800'
                    }`}
                >
                    {saveStatus === 'success' && 'تنظیمات با موفقیت ذخیره شد'}
                    {saveStatus === 'error' && 'خطا در ذخیره تنظیمات'}
                    {saveStatus === 'saving' && 'در حال ذخیره تنظیمات...'}
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-blue-600" />
                            تنظیمات سیستم
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>منطقه زمانی</Label>
                                <Select 
                                    value={config.system.timezone} 
                                    onValueChange={(value) => handleConfigChange('system', 'timezone', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Asia/Tehran">تهران</SelectItem>
                                        <SelectItem value="UTC">UTC</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>زبان سیستم</Label>
                                <Select 
                                    value={config.system.language} 
                                    onValueChange={(value) => handleConfigChange('system', 'language', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fa">فارسی</SelectItem>
                                        <SelectItem value="en">انگلیسی</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>فرمت تاریخ</Label>
                                <Select 
                                    value={config.system.date_format} 
                                    onValueChange={(value) => handleConfigChange('system', 'date_format', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="jalali">جلالی</SelectItem>
                                        <SelectItem value="gregorian">میلادی</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>واحد پول</Label>
                                <Select 
                                    value={config.system.currency} 
                                    onValueChange={(value) => handleConfigChange('system', 'currency', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IRR">تومان</SelectItem>
                                        <SelectItem value="USD">دلار</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>شروع ساعات کاری</Label>
                                <Input
                                    type="time"
                                    value={config.system.working_hours_start}
                                    onChange={(e) => handleConfigChange('system', 'working_hours_start', e.target.value)}
                                />
                            </div>
                            <div>
                                <Label>پایان ساعات کاری</Label>
                                <Input
                                    type="time"
                                    value={config.system.working_hours_end}
                                    onChange={(e) => handleConfigChange('system', 'working_hours_end', e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Cpu className="w-5 h-5 text-purple-600" />
                            تنظیمات هوش مصنوعی
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="task-generation">تولید خودکار وظایف</Label>
                            <Switch
                                id="task-generation"
                                checked={config.ai.task_generation_enabled}
                                onCheckedChange={(checked) => handleConfigChange('ai', 'task_generation_enabled', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="auto-assignment">تخصیص خودکار وظایف</Label>
                            <Switch
                                id="auto-assignment"
                                checked={config.ai.auto_assignment_enabled}
                                onCheckedChange={(checked) => handleConfigChange('ai', 'auto_assignment_enabled', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="intelligent-scheduling">زمان‌بندی هوشمند</Label>
                            <Switch
                                id="intelligent-scheduling"
                                checked={config.ai.intelligent_scheduling}
                                onCheckedChange={(checked) => handleConfigChange('ai', 'intelligent_scheduling', checked)}
                            />
                        </div>

                        <div>
                            <Label>تایم‌اوت پاسخ (ثانیه)</Label>
                            <div className="mt-2">
                                <Slider
                                    value={[config.ai.response_timeout]}
                                    onValueChange={(value) => handleConfigChange('ai', 'response_timeout', value[0])}
                                    max={120}
                                    min={10}
                                    step={5}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                    <span>10s</span>
                                    <span>{config.ai.response_timeout}s</span>
                                    <span>120s</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>حداکثر پیشنهادات</Label>
                            <Input
                                type="number"
                                value={config.ai.max_suggestions}
                                onChange={(e) => handleConfigChange('ai', 'max_suggestions', parseInt(e.target.value))}
                                min="1"
                                max="10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-green-600" />
                            عملکرد سیستم
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="cache-enabled">فعال‌سازی کش</Label>
                            <Switch
                                id="cache-enabled"
                                checked={config.performance.cache_enabled}
                                onCheckedChange={(checked) => handleConfigChange('performance', 'cache_enabled', checked)}
                            />
                        </div>

                        <div>
                            <Label>مدت نگهداری کش (ثانیه)</Label>
                            <Input
                                type="number"
                                value={config.performance.cache_duration}
                                onChange={(e) => handleConfigChange('performance', 'cache_duration', parseInt(e.target.value))}
                                min="60"
                                max="86400"
                            />
                        </div>

                        <div>
                            <Label>حداکثر وظایف همزمان</Label>
                            <Input
                                type="number"
                                value={config.performance.max_concurrent_tasks}
                                onChange={(e) => handleConfigChange('performance', 'max_concurrent_tasks', parseInt(e.target.value))}
                                min="10"
                                max="1000"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="db-optimization">بهینه‌سازی دیتابیس</Label>
                            <Switch
                                id="db-optimization"
                                checked={config.performance.database_optimization}
                                onCheckedChange={(checked) => handleConfigChange('performance', 'database_optimization', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="compression">فشرده‌سازی</Label>
                            <Switch
                                id="compression"
                                checked={config.performance.compression_enabled}
                                onCheckedChange={(checked) => handleConfigChange('performance', 'compression_enabled', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Settings */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-red-600" />
                            امنیت
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>تایم‌اوت نشست (ثانیه)</Label>
                            <Input
                                type="number"
                                value={config.security.session_timeout}
                                onChange={(e) => handleConfigChange('security', 'session_timeout', parseInt(e.target.value))}
                                min="300"
                                max="7200"
                            />
                        </div>

                        <div>
                            <Label>حداکثر تلاش‌های ورود</Label>
                            <Input
                                type="number"
                                value={config.security.max_login_attempts}
                                onChange={(e) => handleConfigChange('security', 'max_login_attempts', parseInt(e.target.value))}
                                min="1"
                                max="10"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="password-complexity">پیچیدگی رمز عبور</Label>
                            <Switch
                                id="password-complexity"
                                checked={config.security.password_complexity}
                                onCheckedChange={(checked) => handleConfigChange('security', 'password_complexity', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="two-factor">احراز هویت دو مرحله‌ای</Label>
                            <Switch
                                id="two-factor"
                                checked={config.security.two_factor_auth}
                                onCheckedChange={(checked) => handleConfigChange('security', 'two_factor_auth', checked)}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="audit-logging">لاگ حسابرسی</Label>
                            <Switch
                                id="audit-logging"
                                checked={config.security.audit_logging}
                                onCheckedChange={(checked) => handleConfigChange('security', 'audit_logging', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}