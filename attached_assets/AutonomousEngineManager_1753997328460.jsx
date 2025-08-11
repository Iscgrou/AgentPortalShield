import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Bot, Play, Square, Zap, Activity, Clock, Users, 
    AlertTriangle, CheckCircle, RefreshCw, Settings
} from 'lucide-react';

import { autonomousTaskEngine } from '@/api/functions';
import { schedulerDaemon } from '@/api/functions';

export default function AutonomousEngineManager() {
    const [engineStatus, setEngineStatus] = useState(null);
    const [daemonStatus, setDaemonStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [operations, setOperations] = useState({
        starting: false,
        stopping: false,
        forcing: false,
        analyzing: false
    });

    useEffect(() => {
        loadStatus();
        const interval = setInterval(loadStatus, 30000); // هر 30 ثانیه
        return () => clearInterval(interval);
    }, []);

    const loadStatus = async () => {
        try {
            const [engineRes, daemonRes] = await Promise.all([
                autonomousTaskEngine({ action: 'get_engine_status' }),
                schedulerDaemon({ action: 'get_daemon_status' })
            ]);

            if (engineRes.data) setEngineStatus(engineRes.data);
            if (daemonRes.data) setDaemonStatus(daemonRes.data);
        } catch (error) {
            console.error('Error loading status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartDaemon = async () => {
        setOperations(prev => ({ ...prev, starting: true }));
        try {
            const response = await schedulerDaemon({ action: 'start_daemon' });
            if (response.data?.success) {
                setDaemonStatus(response.data.status);
                if (window.showToast) {
                    window.showToast('success', 'موفقیت', 'موتور خودکار شروع شد');
                }
            }
        } catch (error) {
            console.error('Error starting daemon:', error);
            if (window.showToast) {
                window.showToast('error', 'خطا', 'خطا در شروع موتور');
            }
        } finally {
            setOperations(prev => ({ ...prev, starting: false }));
        }
    };

    const handleStopDaemon = async () => {
        setOperations(prev => ({ ...prev, stopping: true }));
        try {
            const response = await schedulerDaemon({ action: 'stop_daemon' });
            if (response.data?.success) {
                setDaemonStatus(response.data.status);
                if (window.showToast) {
                    window.showToast('success', 'موفقیت', 'موتور خودکار متوقف شد');
                }
            }
        } catch (error) {
            console.error('Error stopping daemon:', error);
            if (window.showToast) {
                window.showToast('error', 'خطا', 'خطا در توقف موتور');
            }
        } finally {
            setOperations(prev => ({ ...prev, stopping: false }));
        }
    };

    const handleForceExecution = async () => {
        setOperations(prev => ({ ...prev, forcing: true }));
        try {
            const response = await schedulerDaemon({ action: 'force_execution' });
            if (response.data?.success) {
                if (window.showToast) {
                    window.showToast('success', 'موفقیت', 'اجرای دستی کامل شد');
                }
                loadStatus(); // بروزرسانی وضعیت
            }
        } catch (error) {
            console.error('Error forcing execution:', error);
            if (window.showToast) {
                window.showToast('error', 'خطا', 'خطا در اجرای دستی');
            }
        } finally {
            setOperations(prev => ({ ...prev, forcing: false }));
        }
    };

    const handleAnalyzeGaps = async () => {
        setOperations(prev => ({ ...prev, analyzing: true }));
        try {
            const response = await autonomousTaskEngine({ action: 'analyze_workload_gaps' });
            if (response.data) {
                // نمایش نتایج تحلیل
                if (window.showToast) {
                    window.showToast('info', 'تحلیل کامل', 
                        `${response.data.gaps_identified} گپ عملکردی شناسایی شد`);
                }
            }
        } catch (error) {
            console.error('Error analyzing gaps:', error);
            if (window.showToast) {
                window.showToast('error', 'خطا', 'خطا در تحلیل گپ‌ها');
            }
        } finally {
            setOperations(prev => ({ ...prev, analyzing: false }));
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">بارگذاری وضعیت موتور...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Engine Status Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="w-5 h-5" />
                        وضعیت موتور خودکار
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">وضعیت Daemon:</span>
                                <Badge variant={daemonStatus?.is_running ? 'default' : 'secondary'}>
                                    {daemonStatus?.is_running ? 'در حال اجرا' : 'متوقف'}
                                </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">آخرین اجرا:</span>
                                <span className="text-sm text-gray-600">
                                    {daemonStatus?.last_execution ? 
                                        new Date(daemonStatus.last_execution).toLocaleString('fa-IR') : 
                                        'هنوز اجرا نشده'
                                    }
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">تعداد اجرا:</span>
                                <span className="text-sm text-gray-600">
                                    {daemonStatus?.execution_count || 0} بار
                                </span>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">اجرای بعدی:</span>
                                <span className="text-sm text-gray-600">
                                    {daemonStatus?.next_execution ? 
                                        new Date(daemonStatus.next_execution).toLocaleString('fa-IR') : 
                                        'نامشخص'
                                    }
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">فاصله اجرا:</span>
                                <span className="text-sm text-gray-600">
                                    {daemonStatus?.config?.EXECUTION_INTERVAL_MINUTES || 60} دقیقه
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Engine Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        کنترل موتور
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={handleStartDaemon}
                            disabled={daemonStatus?.is_running || operations.starting}
                            className="flex items-center gap-2"
                        >
                            {operations.starting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                            شروع موتور
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleStopDaemon}
                            disabled={!daemonStatus?.is_running || operations.stopping}
                            className="flex items-center gap-2"
                        >
                            {operations.stopping ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Square className="w-4 h-4" />
                            )}
                            توقف موتور
                        </Button>

                        <Button
                            variant="secondary"
                            onClick={handleForceExecution}
                            disabled={operations.forcing}
                            className="flex items-center gap-2"
                        >
                            {operations.forcing ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Zap className="w-4 h-4" />
                            )}
                            اجرای فوری
                        </Button>

                        <Button
                            variant="outline"
                            onClick={handleAnalyzeGaps}
                            disabled={operations.analyzing}
                            className="flex items-center gap-2"
                        >
                            {operations.analyzing ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Activity className="w-4 h-4" />
                            )}
                            تحلیل گپ‌ها
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={loadStatus}
                            className="flex items-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" />
                            بروزرسانی
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Engine Analytics */}
            {engineStatus && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5" />
                            آمار عملکرد
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {engineStatus.reseller_counts?.new || 0}
                                </div>
                                <div className="text-sm text-gray-600">نمایندگان جدید</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {engineStatus.reseller_counts?.active || 0}
                                </div>
                                <div className="text-sm text-gray-600">نمایندگان فعال</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {engineStatus.reseller_counts?.lapsed || 0}
                                </div>
                                <div className="text-sm text-gray-600">نمایندگان lapsed</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-600">
                                    {engineStatus.total_pending_tasks || 0}
                                </div>
                                <div className="text-sm text-gray-600">وظایف معلق</div>
                            </div>
                        </div>

                        {/* Agent Utilization */}
                        {engineStatus.agent_utilization && (
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-800">بهره‌وری نیروها</h4>
                                {engineStatus.agent_utilization.map((agent, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-4 h-4 text-gray-500" />
                                            <span className="font-medium">{agent.agent_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-gray-600">
                                                {agent.current_tasks}/{agent.capacity}
                                            </span>
                                            <Badge variant={
                                                agent.utilization_percentage > 80 ? 'destructive' :
                                                agent.utilization_percentage > 60 ? 'default' : 'secondary'
                                            }>
                                                {Math.round(agent.utilization_percentage)}%
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recommendations */}
                        {engineStatus.recommendations && engineStatus.recommendations.length > 0 && (
                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    توصیه‌های سیستم
                                </h4>
                                <ul className="space-y-1">
                                    {engineStatus.recommendations.map((rec, index) => (
                                        <li key={index} className="text-sm text-blue-700">
                                            • {rec}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}