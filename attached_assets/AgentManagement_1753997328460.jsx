import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, Plus, Edit2, Trash2, Save, X, Search, 
    Filter, Star, TrendingUp, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Agent } from '@/api/entities';
import { Task } from '@/api/entities';
import { TaskReport } from '@/api/entities';

export default function AgentManagement() {
    const [agents, setAgents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingAgent, setEditingAgent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [agentStats, setAgentStats] = useState({});

    const [agentForm, setAgentForm] = useState({
        name: '',
        work_days_per_week: 5,
        daily_work_hours: 8,
        estimated_focus_factor: 0.75,
        work_hours: {
            start: '09:00',
            end: '17:00',
            timezone: 'Asia/Tehran'
        },
        personality_profile: {
            communication_style: 'empathetic',
            communication_channels_expertise: {
                phone: 'medium',
                telegram: 'medium'
            },
            behavioral_traits: [],
            cultural_communication_notes: '',
            strengths: [],
            notes: ''
        },
        iranian_reseller_behavior_insights: '',
        is_active: true,
        max_concurrent_tasks: 5
    });

    const [tempBehavioralTrait, setTempBehavioralTrait] = useState('');
    const [tempStrength, setTempStrength] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [agentData, taskData, reportData] = await Promise.all([
                Agent.list(),
                Task.list(),
                TaskReport.list()
            ]);
            
            setAgents(agentData);
            setTasks(taskData);
            setReports(reportData);
            calculateAgentStats(agentData, taskData, reportData);
        } catch (error) {
            console.error('Error loading data:', error);
            if (window.showNotification) {
                window.showNotification('error', 'خطا در بارگذاری', 'خطا در دریافت اطلاعات کارمندان');
            }
        } finally {
            setLoading(false);
        }
    };

    const calculateAgentStats = (agentData, taskData, reportData) => {
        const stats = {};
        
        agentData.forEach(agent => {
            const agentTasks = taskData.filter(t => t.assigned_to_agent_id === agent.id);
            const completedTasks = agentTasks.filter(t => t.status === 'completed');
            const agentReports = reportData.filter(r => {
                const task = taskData.find(t => t.id === r.task_id);
                return task && task.assigned_to_agent_id === agent.id;
            });
            
            const avgRating = agentReports.length > 0 ? 
                (agentReports.reduce((sum, r) => sum + (r.task_effectiveness_rating || 0), 0) / agentReports.length) : 0;
            
            stats[agent.id] = {
                totalTasks: agentTasks.length,
                completedTasks: completedTasks.length,
                completionRate: agentTasks.length > 0 ? (completedTasks.length / agentTasks.length) * 100 : 0,
                avgRating: avgRating,
                totalReports: agentReports.length,
                pendingTasks: agentTasks.filter(t => t.status === 'pending').length,
                inProgressTasks: agentTasks.filter(t => t.status === 'in_progress').length
            };
        });
        
        setAgentStats(stats);
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!agentForm.name.trim()) {
            newErrors.name = 'نام کارمند الزامی است';
        }
        
        if (!agentForm.personality_profile.cultural_communication_notes.trim()) {
            newErrors.cultural_notes = 'یادداشت‌های فرهنگی الزامی است';
        }
        
        if (!agentForm.iranian_reseller_behavior_insights.trim()) {
            newErrors.behavior_insights = 'بینش‌های رفتاری الزامی است';
        }
        
        if (agentForm.work_days_per_week < 1 || agentForm.work_days_per_week > 7) {
            newErrors.work_days = 'تعداد روزهای کاری باید بین 1 تا 7 باشد';
        }
        
        if (agentForm.daily_work_hours < 1 || agentForm.daily_work_hours > 12) {
            newErrors.work_hours = 'ساعات کاری روزانه باید بین 1 تا 12 باشد';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        
        const confirmMessage = editingAgent 
            ? `آیا از به‌روزرسانی اطلاعات کارمند "${agentForm.name}" مطمئن هستید؟`
            : `آیا از اضافه کردن کارمند جدید "${agentForm.name}" مطمئن هستید؟`;
        
        if (!confirm(confirmMessage)) return;
        
        try {
            if (editingAgent) {
                await Agent.update(editingAgent.id, agentForm);
                if (window.showNotification) {
                    window.showNotification('success', 'به‌روزرسانی موفق', 'اطلاعات کارمند با موفقیت به‌روزرسانی شد');
                }
            } else {
                await Agent.create(agentForm);
                if (window.showNotification) {
                    window.showNotification('success', 'کارمند اضافه شد', 'کارمند جدید با موفقیت اضافه شد');
                }
            }
            
            resetForm();
            loadData();
        } catch (error) {
            console.error('Error saving agent:', error);
            if (window.showNotification) {
                window.showNotification('error', 'خطا در ذخیره', `خطا: ${error.message || 'لطفاً دوباره تلاش کنید'}`);
            }
        }
    };

    const handleEdit = (agent) => {
        setEditingAgent(agent);
        setAgentForm({
            name: agent.name || '',
            work_days_per_week: agent.work_days_per_week || 5,
            daily_work_hours: agent.daily_work_hours || 8,
            estimated_focus_factor: agent.estimated_focus_factor || 0.75,
            work_hours: agent.work_hours || {
                start: '09:00',
                end: '17:00',
                timezone: 'Asia/Tehran'
            },
            personality_profile: {
                communication_style: agent.personality_profile?.communication_style || 'empathetic',
                communication_channels_expertise: {
                    phone: agent.personality_profile?.communication_channels_expertise?.phone || 'medium',
                    telegram: agent.personality_profile?.communication_channels_expertise?.telegram || 'medium'
                },
                behavioral_traits: agent.personality_profile?.behavioral_traits || [],
                cultural_communication_notes: agent.personality_profile?.cultural_communication_notes || '',
                strengths: agent.personality_profile?.strengths || [],
                notes: agent.personality_profile?.notes || ''
            },
            iranian_reseller_behavior_insights: agent.iranian_reseller_behavior_insights || '',
            is_active: agent.is_active !== undefined ? agent.is_active : true,
            max_concurrent_tasks: agent.max_concurrent_tasks || 5
        });
        setShowAddForm(true);
        setErrors({});
    };

    const handleDelete = async (agentId) => {
        const agent = agents.find(a => a.id === agentId);
        if (confirm(`⚠️ هشدار: آیا از حذف کامل کارمند "${agent?.name}" مطمئن هستید؟\n\nاین عمل غیرقابل بازگشت است!`)) {
            try {
                await Agent.delete(agentId);
                loadData();
                if (window.showNotification) {
                    window.showNotification('success', 'حذف موفق', 'کارمند با موفقیت حذف شد');
                }
            } catch (error) {
                console.error('Error deleting agent:', error);
                if (window.showNotification) {
                    window.showNotification('error', 'خطا در حذف', `خطا: ${error.message || 'لطفاً دوباره تلاش کنید'}`);
                }
            }
        }
    };

    const resetForm = () => {
        setEditingAgent(null);
        setAgentForm({
            name: '',
            work_days_per_week: 5,
            daily_work_hours: 8,
            estimated_focus_factor: 0.75,
            work_hours: {
                start: '09:00',
                end: '17:00',
                timezone: 'Asia/Tehran'
            },
            personality_profile: {
                communication_style: 'empathetic',
                communication_channels_expertise: {
                    phone: 'medium',
                    telegram: 'medium'
                },
                behavioral_traits: [],
                cultural_communication_notes: '',
                strengths: [],
                notes: ''
            },
            iranian_reseller_behavior_insights: '',
            is_active: true,
            max_concurrent_tasks: 5
        });
        setTempBehavioralTrait('');
        setTempStrength('');
        setErrors({});
        setShowAddForm(false);
    };

    const addBehavioralTrait = () => {
        if (tempBehavioralTrait.trim()) {
            setAgentForm(prev => ({
                ...prev,
                personality_profile: {
                    ...prev.personality_profile,
                    behavioral_traits: [...prev.personality_profile.behavioral_traits, tempBehavioralTrait.trim()]
                }
            }));
            setTempBehavioralTrait('');
        }
    };

    const removeBehavioralTrait = (index) => {
        setAgentForm(prev => ({
            ...prev,
            personality_profile: {
                ...prev.personality_profile,
                behavioral_traits: prev.personality_profile.behavioral_traits.filter((_, i) => i !== index)
            }
        }));
    };

    const addStrength = () => {
        if (tempStrength.trim()) {
            setAgentForm(prev => ({
                ...prev,
                personality_profile: {
                    ...prev.personality_profile,
                    strengths: [...prev.personality_profile.strengths, tempStrength.trim()]
                }
            }));
            setTempStrength('');
        }
    };

    const removeStrength = (index) => {
        setAgentForm(prev => ({
            ...prev,
            personality_profile: {
                ...prev.personality_profile,
                strengths: prev.personality_profile.strengths.filter((_, i) => i !== index)
            }
        }));
    };

    const filteredAgents = agents.filter(agent => {
        const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || 
            (filterStatus === 'active' && agent.is_active) ||
            (filterStatus === 'inactive' && !agent.is_active);
        return matchesSearch && matchesFilter;
    });

    const getPerformanceColor = (rating) => {
        if (rating >= 4) return 'text-green-600 bg-green-100';
        if (rating >= 3) return 'text-yellow-600 bg-yellow-100';
        return 'text-red-600 bg-red-100';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">مدیریت کارمندان</h2>
                    <p className="text-gray-600 mt-1">مدیریت پروفایل، مهارت‌ها و عملکرد کارمندان</p>
                </div>
                <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 gap-2"
                >
                    <Plus className="w-4 h-4" />
                    کارمند جدید
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="جستجو در نام کارمندان..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="وضعیت" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">همه کارمندان</SelectItem>
                                <SelectItem value="active">فعال</SelectItem>
                                <SelectItem value="inactive">غیرفعال</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Agent List */}
            <div className="grid gap-4">
                <AnimatePresence>
                    {filteredAgents.map((agent) => {
                        const stats = agentStats[agent.id] || {};
                        return (
                            <motion.div
                                key={agent.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <Card className={`${agent.is_active ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${agent.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                                                    <Users className={`w-6 h-6 ${agent.is_active ? 'text-green-600' : 'text-gray-500'}`} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-lg">{agent.name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className={agent.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                                            {agent.is_active ? 'فعال' : 'غیرفعال'}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {agent.personality_profile?.communication_style || 'عمومی'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleEdit(agent)}
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleDelete(agent.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Performance Stats */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">{stats.totalTasks || 0}</div>
                                                <div className="text-sm text-gray-600">کل وظایف</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">{stats.completedTasks || 0}</div>
                                                <div className="text-sm text-gray-600">تکمیل شده</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">{Math.round(stats.completionRate || 0)}%</div>
                                                <div className="text-sm text-gray-600">نرخ تکمیل</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`text-2xl font-bold ${getPerformanceColor(stats.avgRating).split(' ')[0]}`}>
                                                    {stats.avgRating ? stats.avgRating.toFixed(1) : 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-600">میانگین امتیاز</div>
                                            </div>
                                        </div>

                                        {/* Work Schedule */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <div className="font-medium text-gray-700 mb-1">برنامه کاری:</div>
                                                <div className="text-gray-600">
                                                    {agent.work_days_per_week} روز در هفته، {agent.daily_work_hours} ساعت روزانه
                                                </div>
                                                <div className="text-gray-600">
                                                    {agent.work_hours?.start} تا {agent.work_hours?.end}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-700 mb-1">تخصص ارتباطی:</div>
                                                <div className="flex gap-2">
                                                    <Badge variant="outline">
                                                        📞 {agent.personality_profile?.communication_channels_expertise?.phone || 'medium'}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        📱 {agent.personality_profile?.communication_channels_expertise?.telegram || 'medium'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Strengths */}
                                        {agent.personality_profile?.strengths && agent.personality_profile.strengths.length > 0 && (
                                            <div className="mt-4">
                                                <div className="font-medium text-gray-700 mb-2">نقاط قوت:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {agent.personality_profile.strengths.map((strength, index) => (
                                                        <Badge key={index} className="bg-blue-100 text-blue-800">
                                                            <Star className="w-3 h-3 mr-1" />
                                                            {strength}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {filteredAgents.length === 0 && (
                <div className="text-center py-12">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">کارمندی یافت نشد</h3>
                    <p className="text-gray-600">کارمند جدید اضافه کنید یا فیلترها را تغییر دهید</p>
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {editingAgent ? 'ویرایش کارمند' : 'کارمند جدید'}
                                </h3>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Basic Info */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">اطلاعات پایه</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                نام کامل کارمند *
                                            </label>
                                            <Input
                                                value={agentForm.name}
                                                onChange={(e) => setAgentForm(prev => ({...prev, name: e.target.value}))}
                                                placeholder="نام و نام خانوادگی"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    روزهای کاری در هفته
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="7"
                                                    value={agentForm.work_days_per_week}
                                                    onChange={(e) => setAgentForm(prev => ({...prev, work_days_per_week: parseInt(e.target.value)}))}
                                                    className={errors.work_days ? 'border-red-500' : ''}
                                                />
                                                {errors.work_days && <p className="text-red-500 text-sm mt-1">{errors.work_days}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    ساعات کاری روزانه
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="12"
                                                    value={agentForm.daily_work_hours}
                                                    onChange={(e) => setAgentForm(prev => ({...prev, daily_work_hours: parseInt(e.target.value)}))}
                                                    className={errors.work_hours ? 'border-red-500' : ''}
                                                />
                                                {errors.work_hours && <p className="text-red-500 text-sm mt-1">{errors.work_hours}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    حداکثر وظایف همزمان
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    max="20"
                                                    value={agentForm.max_concurrent_tasks}
                                                    onChange={(e) => setAgentForm(prev => ({...prev, max_concurrent_tasks: parseInt(e.target.value)}))}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    شروع کار
                                                </label>
                                                <Input
                                                    type="time"
                                                    value={agentForm.work_hours.start}
                                                    onChange={(e) => setAgentForm(prev => ({
                                                        ...prev,
                                                        work_hours: {...prev.work_hours, start: e.target.value}
                                                    }))}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    پایان کار
                                                </label>
                                                <Input
                                                    type="time"
                                                    value={agentForm.work_hours.end}
                                                    onChange={(e) => setAgentForm(prev => ({
                                                        ...prev,
                                                        work_hours: {...prev.work_hours, end: e.target.value}
                                                    }))}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={agentForm.is_active}
                                                onCheckedChange={(checked) => setAgentForm(prev => ({...prev, is_active: checked}))}
                                            />
                                            <label className="text-sm font-medium text-gray-700">
                                                کارمند فعال است
                                            </label>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Personality Profile */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">پروفایل شخصیتی</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                سبک ارتباطی
                                            </label>
                                            <Select
                                                value={agentForm.personality_profile.communication_style}
                                                onValueChange={(value) => setAgentForm(prev => ({
                                                    ...prev,
                                                    personality_profile: {...prev.personality_profile, communication_style: value}
                                                }))}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="direct">مستقیم</SelectItem>
                                                    <SelectItem value="empathetic">همدلانه</SelectItem>
                                                    <SelectItem value="analytical">تحلیلگر</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    مهارت تلفنی
                                                </label>
                                                <Select
                                                    value={agentForm.personality_profile.communication_channels_expertise.phone}
                                                    onValueChange={(value) => setAgentForm(prev => ({
                                                        ...prev,
                                                        personality_profile: {
                                                            ...prev.personality_profile,
                                                            communication_channels_expertise: {
                                                                ...prev.personality_profile.communication_channels_expertise,
                                                                phone: value
                                                            }
                                                        }
                                                    }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="weak">ضعیف</SelectItem>
                                                        <SelectItem value="medium">متوسط</SelectItem>
                                                        <SelectItem value="strong">قوی</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    مهارت تلگرامی
                                                </label>
                                                <Select
                                                    value={agentForm.personality_profile.communication_channels_expertise.telegram}
                                                    onValueChange={(value) => setAgentForm(prev => ({
                                                        ...prev,
                                                        personality_profile: {
                                                            ...prev.personality_profile,
                                                            communication_channels_expertise: {
                                                                ...prev.personality_profile.communication_channels_expertise,
                                                                telegram: value
                                                            }
                                                        }
                                                    }))}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="weak">ضعیف</SelectItem>
                                                        <SelectItem value="medium">متوسط</SelectItem>
                                                        <SelectItem value="strong">قوی</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                ویژگی‌های رفتاری
                                            </label>
                                            <div className="flex gap-2 mb-2">
                                                <Input
                                                    value={tempBehavioralTrait}
                                                    onChange={(e) => setTempBehavioralTrait(e.target.value)}
                                                    placeholder="ویژگی رفتاری جدید"
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBehavioralTrait())}
                                                />
                                                <Button type="button" onClick={addBehavioralTrait} variant="outline">
                                                    افزودن
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {agentForm.personality_profile.behavioral_traits.map((trait, index) => (
                                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                                        {trait}
                                                        <X 
                                                            className="w-3 h-3 cursor-pointer" 
                                                            onClick={() => removeBehavioralTrait(index)}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                نقاط قوت
                                            </label>
                                            <div className="flex gap-2 mb-2">
                                                <Input
                                                    value={tempStrength}
                                                    onChange={(e) => setTempStrength(e.target.value)}
                                                    placeholder="نقطه قوت جدید"
                                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                                                />
                                                <Button type="button" onClick={addStrength} variant="outline">
                                                    افزودن
                                                </Button>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {agentForm.personality_profile.strengths.map((strength, index) => (
                                                    <Badge key={index} className="bg-green-100 text-green-800 flex items-center gap-1">
                                                        <Star className="w-3 h-3" />
                                                        {strength}
                                                        <X 
                                                            className="w-3 h-3 cursor-pointer" 
                                                            onClick={() => removeStrength(index)}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                یادداشت‌های فرهنگی ارتباطی *
                                            </label>
                                            <Textarea
                                                value={agentForm.personality_profile.cultural_communication_notes}
                                                onChange={(e) => setAgentForm(prev => ({
                                                    ...prev,
                                                    personality_profile: {
                                                        ...prev.personality_profile,
                                                        cultural_communication_notes: e.target.value
                                                    }
                                                }))}
                                                placeholder="نکات مهم درباره نحوه ارتباط این کارمند با نمایندگان ایرانی..."
                                                className={`h-24 ${errors.cultural_notes ? 'border-red-500' : ''}`}
                                            />
                                            {errors.cultural_notes && <p className="text-red-500 text-sm mt-1">{errors.cultural_notes}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                بینش‌های رفتاری نمایندگان ایرانی *
                                            </label>
                                            <Textarea
                                                value={agentForm.iranian_reseller_behavior_insights}
                                                onChange={(e) => setAgentForm(prev => ({...prev, iranian_reseller_behavior_insights: e.target.value}))}
                                                placeholder="بینش‌های عمومی این کارمند درباره رفتار و روحیات نمایندگان ایرانی..."
                                                className={`h-24 ${errors.behavior_insights ? 'border-red-500' : ''}`}
                                            />
                                            {errors.behavior_insights && <p className="text-red-500 text-sm mt-1">{errors.behavior_insights}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                یادداشت‌های اضافی
                                            </label>
                                            <Textarea
                                                value={agentForm.personality_profile.notes}
                                                onChange={(e) => setAgentForm(prev => ({
                                                    ...prev,
                                                    personality_profile: {
                                                        ...prev.personality_profile,
                                                        notes: e.target.value
                                                    }
                                                }))}
                                                placeholder="یادداشت‌های اضافی..."
                                                className="h-20"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    انصراف
                                </Button>
                                <Button type="button" onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingAgent ? 'بروزرسانی' : 'ایجاد'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}