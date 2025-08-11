import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from "@/components/ui/use-toast";
import { 
    SlidersHorizontal, Trash2, RotateCcw, BrainCircuit, HardDrive, Send, 
    Database, AlertTriangle, RefreshCw, Settings, Eye, EyeOff 
} from 'lucide-react';

import { systemSettingsManager } from '@/api/functions';
import { taskManager } from '@/api/functions';
import { taskGenerator } from '@/api/functions';
import { Agent } from '@/api/entities';
import { Reseller } from '@/api/entities';
import { Task } from '@/api/entities';
import { WeeklySalesRecord } from '@/api/entities';
import { InteractionLog } from '@/api/entities';
import AutonomousEngineManager from './AutonomousEngineManager';

const SETTING_CATEGORIES = {
    ai: { title: 'تنظیمات هوش مصنوعی', color: 'bg-purple-500' },
    system: { title: 'تنظیمات سیستم', color: 'bg-blue-500' },
    notification: { title: 'اعلان‌ها', color: 'bg-green-500' },
    backup: { title: 'پشتیبان‌گیری', color: 'bg-orange-500' },
    security: { title: 'امنیت', color: 'bg-red-500' },
    performance: { title: 'عملکرد', color: 'bg-indigo-500' }
};

export default function AdvancedSettings() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [systemStatus, setSystemStatus] = useState(null);
    const [backupStatus, setBackupStatus] = useState({ status: 'idle', message: '' });
    const [activeCategory, setActiveCategory] = useState('system');
    const [showDangerZone, setShowDangerZone] = useState(false);
    const [pendingChanges, setPendingChanges] = useState({});
    const [saving, setSaving] = useState(false);
    const { toast } = useToast();

    // State for Task Generator
    const [agents, setAgents] = useState([]);
    const [resellers, setResellers] = useState([]);
    const [selectedAgent, setSelectedAgent] = useState('');
    const [selectedReseller, setSelectedReseller] = useState('');
    const [taskContext, setTaskContext] = useState('');
    const [taskType, setTaskType] = useState('follow_up');
    const [isGeneratingTask, setIsGeneratingTask] = useState(false);
    
    // State for Maintenance Actions - اضافه کردن متغیرهای گمشده
    const [isMaintenanceLoading, setIsMaintenanceLoading] = useState(false);
    const [operationInProgress, setOperationInProgress] = useState(null);

    // State for Autonomous Engine
    const [showAutonomousEngine, setShowAutonomousEngine] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            console.log('Starting to load initial data...');
            
            const [settingsRes, statusRes, backupRes] = await Promise.all([
                systemSettingsManager({ action: 'get_all_settings' }).catch(e => ({ data: { success: false } })),
                systemSettingsManager({ action: 'get_system_status' }).catch(e => ({ data: { success: false } })),
                systemSettingsManager({ action: 'get_backup_status' }).catch(e => ({ data: { success: false } }))
            ]);

            let activeAgents = [];
            let allResellers = [];
            
            try {
                activeAgents = await Agent.filter({ is_active: true });
                console.log('Active agents loaded:', activeAgents.length);
                setAgents(activeAgents);
            } catch (error) {
                console.error('Error loading agents:', error);
                setAgents([]);
            }

            try {
                allResellers = await Reseller.list();
                console.log('Resellers loaded:', allResellers.length);
                setResellers(allResellers);
            } catch (error) {
                console.error('Error loading resellers:', error);
                setResellers([]);
            }

            if (settingsRes.data?.success) {
                setSettings(settingsRes.data.settings);
            } else {
                setSettings({
                    'ai_model_temperature': { value: 0.8, type: 'ai', description: 'خلاقیت AI برای پاسخ‌های فنی v2ray' },
                    'max_concurrent_tasks': { value: 15, type: 'system', description: 'حداکثر وظایف همزمان (بهینه برای فیلترشکن)' },
                    'notification_frequency': { value: 'realtime', type: 'notification', description: 'اطلاع‌رسانی فوری قطعی سرویس' },
                    'auto_backup_enabled': { value: true, type: 'backup', description: 'پشتیبان‌گیری خودکار کانفیگ‌ها' },
                    'backup_retention_days': { value: 45, type: 'backup', description: 'نگهداری پشتیبان (مهم برای کانفیگ‌ها)' },
                    'vpn_service_monitoring': { value: true, type: 'system', description: 'نظارت بر وضعیت سرویس‌های v2ray' },
                    'security_audit_enabled': { value: true, type: 'security', description: 'ممیزی امنیتی (ضروری برای VPN)' },
                    'performance_monitoring': { value: true, type: 'performance', description: 'نظارت عملکرد سرورها' },
                    'debug_mode': { value: false, type: 'system', description: 'حالت اشکال‌زدایی' },
                    'cache_ttl_minutes': { value: 30, type: 'performance', description: 'کش سریع برای کانفیگ‌ها' }
                });
            }

            if (statusRes.data?.success) setSystemStatus(statusRes.data.status);
            if (backupRes.data?.success) setBackupStatus(backupRes.data);

        } catch (error) {
            console.error("Failed to load initial data", error);
            toast({ title: "خطا", description: "بارگذاری اطلاعات اولیه با مشکل مواجه شد.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: { ...prev[key], value: value }
        }));
        setPendingChanges(prev => ({ ...prev, [key]: value }));
    };

    const handleBulkSave = async () => {
        if (Object.keys(pendingChanges).length === 0) {
            toast({ title: "اطلاع", description: "هیچ تغییری برای ذخیره وجود ندارد" });
            return;
        }

        try {
            setSaving(true);
            const response = await systemSettingsManager({
                action: 'update_multiple_settings',
                settings: pendingChanges
            });

            if (response.data?.success) {
                setPendingChanges({});
                toast({ title: "موفقیت", description: response.data.message });
            } else {
                throw new Error(response.data?.error || 'خطا در ذخیره تنظیمات');
            }
        } catch (error) {
            console.error('Error bulk saving:', error);
            toast({ title: "خطا", description: error.message, variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    const handleMaintenanceAction = async (actionFn, successMessage, opType = 'general') => {
        setIsMaintenanceLoading(true);
        setOperationInProgress(opType);
        try {
            const { data } = await actionFn();
            if (data?.success) {
                toast({ title: "موفق", description: data.message || successMessage });
                if (opType === 'backup' || opType === 'cleanup') await loadInitialData();
            } else {
                throw new Error(data?.error || "عملیات ناموفق بود");
            }
        } catch (error) {
            console.error(`Error performing maintenance action (${opType}):`, error);
            toast({ title: "خطا", description: error.message, variant: "destructive" });
        } finally {
            setIsMaintenanceLoading(false);
            setOperationInProgress(null);
        }
    };

    const handleResetToDefaults = async () => {
        if (!confirm('آیا از بازگردانی تمام تنظیمات به حالت پیش‌فرض اطمینان دارید؟ این عمل غیرقابل بازگشت است!')) return;
        await handleMaintenanceAction(
            () => systemSettingsManager({ action: 'reset_to_defaults' }),
            "تمام تنظیمات به حالت پیش‌فرض بازگردانی شدند.", 'reset'
        );
        await loadInitialData();
    };

    const handleBackup = async () => {
        await handleMaintenanceAction(
            () => systemSettingsManager({ action: 'trigger_backup' }),
            "پشتیبان‌گیری با موفقیت آغاز شد.", 'backup'
        );
    };

    const handleCleanup = async () => {
        if (!confirm('آیا از شروع پاکسازی سیستم اطمینان دارید؟ این عمل ممکن است برخی داده‌های موقت را حذف کند.')) return;
        await handleMaintenanceAction(
            () => systemSettingsManager({ action: 'run_cleanup' }),
            "پاکسازی سیستم با موفقیت انجام شد.", 'cleanup'
        );
    };

    const handleGenerateTask = async () => {
        if (!selectedAgent || !selectedReseller) {
            toast({ title: "خطا", description: "لطفاً کارمند و نماینده را انتخاب کنید.", variant: "destructive" });
            return;
        }

        setIsGeneratingTask(true);
        try {
            const { data } = await taskGenerator({
                action: 'generate_task',
                reseller_id: selectedReseller,
                agent_id: selectedAgent,
                task_type: taskType,
                context: taskContext || 'بررسی وضعیت سرویس فیلترشکن و رضایت نماینده',
            });

            if (data?.task) {
                toast({ title: "موفق", description: `وظیفه جدید برای نماینده با موفقیت ایجاد شد.` });
                setTaskContext('');
                setSelectedAgent('');
                setSelectedReseller('');
            } else {
                throw new Error(data?.error || "ایجاد وظیفه ناموفق بود");
            }
        } catch (error) {
            console.error('Error generating task:', error);
            toast({ title: "خطا در تولید وظیفه", description: error.message, variant: "destructive" });
        } finally {
            setIsGeneratingTask(false);
        }
    };

    const handleCompleteDataReset = async () => {
        const confirmMessage = `⚠️ هشدار جدی: این عمل تمام داده‌ها را حذف خواهد کرد شامل:

• تمام وظایف (Tasks)
• تمام گزارش‌های فروش (Sales Records)
• تمام لاگ‌های تعامل (Interaction Logs)
• تمام نمایندگان (Resellers)

آیا کاملاً مطمئن هستید؟ این عمل غیرقابل بازگشت است!`;

        if (!confirm(confirmMessage)) return;

        const secondConfirm = prompt('برای تأیید نهایی، کلمه "RESET" را تایپ کنید:');
        if (secondConfirm !== 'RESET') {
            toast({ title: "لغو شد", description: "عملیات حذف کامل لغو شد." });
            return;
        }

        await handleMaintenanceAction(async () => {
            const tasks = await Task.list();
            const salesRecords = await WeeklySalesRecord.list();
            const interactionLogs = await InteractionLog.list();
            const resellers = await Reseller.list();

            let totalDeleted = 0;

            for (const task of tasks) {
                await Task.delete(task.id);
                totalDeleted++;
            }

            for (const record of salesRecords) {
                await WeeklySalesRecord.delete(record.id);
                totalDeleted++;
            }

            for (const log of interactionLogs) {
                await InteractionLog.delete(log.id);
                totalDeleted++;
            }

            for (const reseller of resellers) {
                await Reseller.delete(reseller.id);
                totalDeleted++;
            }

            return { data: { success: true, message: `${totalDeleted} رکورد با موفقیت حذف شدند. سیستم کاملاً پاک شد.` } };
        }, "حذف کامل داده‌ها انجام شد.", 'complete_reset');
    };

    const renderSettingInput = (key, setting) => {
        const { value } = setting;

        switch (key) {
            case 'ai_model_temperature':
                return (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">مقدار: {value}</span>
                        </div>
                        <Slider
                            value={[value]}
                            onValueChange={(newValue) => handleSettingChange(key, newValue[0])}
                            min={0}
                            max={2}
                            step={0.1}
                            className="w-full"
                        />
                    </div>
                );

            case 'max_concurrent_tasks':
            case 'backup_retention_days':
            case 'cache_ttl_minutes':
                return (
                    <Input
                        type="number"
                        value={value}
                        onChange={(e) => handleSettingChange(key, parseInt(e.target.value) || 0)}
                        className="w-full"
                        min={1}
                    />
                );

            case 'notification_frequency':
                return (
                    <Select
                        value={value}
                        onValueChange={(newValue) => handleSettingChange(key, newValue)}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="realtime">بلادرنگ (مناسب فیلترشکن)</SelectItem>
                            <SelectItem value="hourly">ساعتی</SelectItem>
                            <SelectItem value="daily">روزانه</SelectItem>
                        </SelectContent>
                    </Select>
                );

            case 'auto_backup_enabled':
            case 'vpn_service_monitoring':
            case 'security_audit_enabled':
            case 'performance_monitoring':
            case 'debug_mode':
                return (
                    <Switch
                        checked={value}
                        onCheckedChange={(checked) => handleSettingChange(key, checked)}
                    />
                );

            default:
                return (
                    <Input
                        type="text"
                        value={value}
                        onChange={(e) => handleSettingChange(key, e.target.value)}
                        className="w-full"
                    />
                );
        }
    };

    const renderSettingsByCategory = (category) => {
        const categorySettings = Object.entries(settings).filter(
            ([, setting]) => setting.type === category
        );

        if (categorySettings.length === 0) {
            return <div className="text-center py-8 text-gray-500">هیچ تنظیمی در این دسته موجود نیست</div>;
        }

        return (
            <div className="space-y-4">
                {categorySettings.map(([key, setting]) => (
                    <Card key={key} className="p-4">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h4 className="font-medium text-gray-800">{setting.description || key}</h4>
                                <p className="text-sm text-gray-500">{key}</p>
                            </div>
                            <div className="w-48">
                                {renderSettingInput(key, setting)}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* ابزارهای مدیریتی سیستم */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="text-indigo-600" />
                        ابزارهای مدیریتی سیستم فیلترشکن
                    </CardTitle>
                    <CardDescription>عملیات‌های حساس و کلی روی سیستم مدیریت نمایندگان v2ray</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Button variant="outline" className="justify-start gap-2" onClick={() => handleMaintenanceAction(() => taskManager({ action: 'clear_pending_tasks' }), "تمام وظایف در انتظار حذف شدند.")} disabled={isMaintenanceLoading}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                        <span>حذف وظایف در انتظار</span>
                    </Button>
                    <Button variant="outline" className="justify-start gap-2" onClick={() => handleMaintenanceAction(() => taskManager({ action: 'reset_overdue_tasks' }), "تمام وظایف عقب‌افتاده بازنشانی شدند.")} disabled={isMaintenanceLoading}>
                        <RotateCcw className="w-4 h-4 text-blue-500" />
                        <span>بازنشانی وظایف عقب‌افتاده</span>
                    </Button>
                    <Button variant="outline" className="justify-start gap-2" onClick={handleBackup} disabled={backupStatus.status === 'in_progress' || isMaintenanceLoading}>
                        <HardDrive className="w-4 h-4 text-green-500" />
                        <span>{backupStatus.status === 'in_progress' ? 'در حال پشتیبان‌گیری...' : 'پشتیبان‌گیری کانفیگ‌ها'}</span>
                    </Button>
                </CardContent>
            </Card>

            {/* Autonomous Engine Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BrainCircuit className="w-5 h-5" />
                        موتور خودکار تولید وظیفه
                    </CardTitle>
                    <CardDescription>
                        سیستم هوشمند تولید خودکار وظایف برای رفع گپ‌های عملکردی
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium">موتور خودکار</h4>
                                <p className="text-sm text-gray-600">
                                    تولید خودکار وظایف برای نمایندگان بدون مداخله دستی
                                </p>
                            </div>
                            <Button
                                variant={showAutonomousEngine ? "secondary" : "default"}
                                onClick={() => setShowAutonomousEngine(!showAutonomousEngine)}
                            >
                                {showAutonomousEngine ? 'بستن' : 'مدیریت'}
                            </Button>
                        </div>

                        <AnimatePresence>
                            {showAutonomousEngine && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AutonomousEngineManager />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </CardContent>
            </Card>

            {/* Task Generation Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5 text-indigo-600" />
                        تولید وظیفه دستی
                    </CardTitle>
                    <CardDescription>
                        تولید وظیفه برای یک نماینده خاص
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">انتخاب کارمند</label>
                            <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                                <SelectTrigger>
                                    <SelectValue placeholder="یک کارمند را انتخاب کنید..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {agents.length > 0 ? (
                                        agents.map(a => (
                                            <SelectItem key={a.id} value={a.id}>
                                                {a.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-agents" disabled>هیچ کارمند فعالی یافت نشد</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">انتخاب نماینده</label>
                            <Select value={selectedReseller} onValueChange={setSelectedReseller}>
                                <SelectTrigger>
                                    <SelectValue placeholder="یک نماینده را انتخاب کنید..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {resellers.length > 0 ? (
                                        resellers.map(r => (
                                            <SelectItem key={r.id} value={r.id}>
                                                {r.shop_name} - {r.contact_person}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="no-resellers" disabled>هیچ نماینده‌ای یافت نشد</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">نوع وظیفه</label>
                            <Select value={taskType} onValueChange={setTaskType}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="follow_up">پیگیری وضعیت سرویس</SelectItem>
                                    <SelectItem value="proactive_outreach">بررسی رضایت نماینده</SelectItem>
                                    <SelectItem value="churn_prevention">جلوگیری از لغو سرویس</SelectItem>
                                    <SelectItem value="information_gathering">جمع‌آوری اطلاعات فنی</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">زمینه وظیفه</label>
                            <Input
                                placeholder="مثال: بررسی مشکل اتصال سرور آلمان، پیگیری فاکتور شماره ۱۲۳، راهنمایی تنظیمات v2ray"
                                value={taskContext}
                                onChange={(e) => setTaskContext(e.target.value)}
                            />
                        </div>
                    </div>
                    <Button onClick={handleGenerateTask} disabled={isGeneratingTask || !selectedAgent || !selectedReseller} className="w-full">
                        {isGeneratingTask ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        <span>{isGeneratingTask ? 'در حال ایجاد...' : 'تولید وظیفه'}</span>
                    </Button>
                </CardContent>
            </Card>

            {/* مدیریت کامل داده‌ها */}
            <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-800">
                        <Database className="text-orange-600" />
                        مدیریت کامل داده‌های سیستم
                    </CardTitle>
                    <CardDescription className="text-orange-700">
                        ابزارهای قدرتمند برای مدیریت، ویرایش و حذف کامل داده‌های سیستم
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="justify-start gap-2 border-red-300 text-red-700 hover:bg-red-50"
                            onClick={handleCompleteDataReset}
                            disabled={isMaintenanceLoading}
                        >
                            <Trash2 className="w-4 h-4" />
                            <span>حذف کامل تمام داده‌ها</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-start gap-2"
                            onClick={() => window.open('/Tasks', '_blank')}
                        >
                            <Settings className="w-4 h-4" />
                            <span>مدیریت وظایف (صفحه جدید)</span>
                        </Button>
                    </div>
                    <div className="p-4 bg-white rounded-lg border border-orange-200">
                        <h4 className="font-semibold text-orange-800 mb-2">راهنمای مدیریت داده:</h4>
                        <ul className="text-sm text-orange-700 space-y-1">
                            <li>• برای حذف وظایف خاص، از صفحه "وظایف" استفاده کنید</li>
                            <li>• برای ویرایش نمایندگان، از صفحه "نمایندگان" استفاده کنید</li>
                            <li>• "حذف کامل" تمام اطلاعات را پاک می‌کند (غیرقابل بازگشت)</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* تنظیمات عمومی سیستم */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-700" />
                        تنظیمات عمومی سیستم فیلترشکن
                    </CardTitle>
                    <CardDescription>
                        پیکربندی‌های اختصاصی برای مدیریت نمایندگان v2ray و فیلترشکن
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">
                            {SETTING_CATEGORIES[activeCategory].title}
                        </h2>
                        <Button
                            onClick={handleBulkSave}
                            disabled={saving || Object.keys(pendingChanges).length === 0}
                            className="flex items-center gap-2"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                            ذخیره تغییرات
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-1">
                            <nav className="space-y-2">
                                {Object.entries(SETTING_CATEGORIES).map(([key, category]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveCategory(key)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right transition-all ${
                                            activeCategory === key
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${category.color}`}></div>
                                        <div className="flex-1">
                                            <div className="font-medium">{category.title}</div>
                                        </div>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        <div className="lg:col-span-3">
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {SETTING_CATEGORIES[activeCategory].title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeCategory}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {renderSettingsByCategory(activeCategory)}
                                        </motion.div>
                                    </AnimatePresence>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* منطقه خطر */}
            <Card className="border-red-200 bg-red-50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-500" />
                            <div>
                                <h3 className="font-bold text-red-800">منطقه خطر</h3>
                                <p className="text-sm text-red-600">عملیات‌های حساس و خطرناک سیستم</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowDangerZone(!showDangerZone)}
                            className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                            {showDangerZone ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                            {showDangerZone ? 'پنهان کردن' : 'نمایش'}
                        </Button>
                    </div>

                    <AnimatePresence>
                        {showDangerZone && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 space-y-4"
                            >
                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                                    <div>
                                        <h4 className="font-medium text-red-800">بازگردانی تنظیمات پیش‌فرض</h4>
                                        <p className="text-sm text-red-600">تمام تنظیمات به حالت اولیه فیلترشکن برمی‌گردند</p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={handleResetToDefaults}
                                        disabled={isMaintenanceLoading}
                                        className="flex items-center gap-2"
                                    >
                                        {isMaintenanceLoading && operationInProgress === 'reset' ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <RotateCcw className="w-4 h-4" />
                                        )}
                                        بازگردانی
                                    </Button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                                    <div>
                                        <h4 className="font-medium text-red-800">پاکسازی کامل سیستم</h4>
                                        <p className="text-sm text-red-600">حذف فایل‌های موقت، لاگ‌ها و بهینه‌سازی دیتابیس</p>
                                    </div>
                                    <Button
                                        variant="destructive"
                                        onClick={handleCleanup}
                                        disabled={isMaintenanceLoading}
                                        className="flex items-center gap-2"
                                    >
                                        {isMaintenanceLoading && operationInProgress === 'cleanup' ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                        شروع پاکسازی
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    );
}