import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Plus, Search, Filter, Edit2, Trash2, Check, X, Loader, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LearnedInsight } from '@/api/entities';
import { knowledgeBaseManager } from '@/api/functions';

const INSIGHT_TYPES = {
    frequent_question: 'سوال متداول',
    best_answer: 'بهترین پاسخ',
    successful_strategy: 'استراتژی موفق',
    failed_strategy: 'استراتژی ناموفق',
    reseller_behavioral_pattern: 'الگوی رفتاری نماینده',
    agent_best_practice: 'بهترین عمل کارمند',
    system_proposed: 'پیشنهاد سیستم'
};

const CATEGORIES = {
    technical: 'فنی', sales: 'فروش', customer_service: 'خدمات مشتریان',
    cultural_nuance: 'نکات فرهنگی', product_specific: 'مختص محصول',
    negotiation_tactic: 'تاکتیک مذاکره', general: 'عمومی'
};

const InsightForm = ({ insight, onSave, onCancel }) => {
    const [formData, setFormData] = useState(
        insight || {
            type: 'frequent_question',
            category: 'general',
            title: '',
            content: '',
            tags: [],
            effectiveness_rating: 3,
            crm_manager_notes: '',
            status: 'approved',
            proposed_by_type: 'crm_manager'
        }
    );
    const [tagInput, setTagInput] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagInput = (e) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input name="title" value={formData.title} onChange={handleChange} placeholder="عنوان بینش" required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select name="type" value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                        <SelectTrigger><SelectValue placeholder="نوع بینش" /></SelectTrigger>
                        <SelectContent>{Object.entries(INSIGHT_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select name="category" value={formData.category} onValueChange={(v) => handleSelectChange('category', v)}>
                        <SelectTrigger><SelectValue placeholder="دسته بندی" /></SelectTrigger>
                        <SelectContent>{Object.entries(CATEGORIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <Textarea name="content" value={formData.content} onChange={handleChange} placeholder="شرح کامل بینش..." required />
                <div>
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagInput} placeholder="برای افزودن تگ Enter بزنید" />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {formData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <button type="button" onClick={() => removeTag(tag)} className="text-red-500 hover:text-red-700">
                                    <X className="w-3 h-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>
                <Textarea name="crm_manager_notes" value={formData.crm_manager_notes} onChange={handleChange} placeholder="یادداشت‌های مدیر..." />
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>انصراف</Button>
                    <Button type="submit">ذخیره</Button>
                </div>
            </form>
        </motion.div>
    );
};

export default function KnowledgeBaseManager() {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingInsight, setEditingInsight] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        loadInsights();
    }, []);

    const loadInsights = async () => {
        setLoading(true);
        try {
            const data = await LearnedInsight.list('-created_date');
            setInsights(data);
        } catch (error) {
            console.error("Error loading insights:", error);
            if (window.showNotification) window.showNotification('error', 'خطا در بارگذاری بینش‌ها');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveInsight = async (insightData) => {
        try {
            if (editingInsight) {
                await LearnedInsight.update(editingInsight.id, insightData);
                if (window.showNotification) window.showNotification('success', 'بینش بروزرسانی شد');
            } else {
                await LearnedInsight.create(insightData);
                if (window.showNotification) window.showNotification('success', 'بینش جدید اضافه شد');
            }
            resetForm();
            loadInsights();
        } catch (error) {
            console.error("Error saving insight:", error);
            if (window.showNotification) window.showNotification('error', 'خطا در ذخیره بینش');
        }
    };

    const handleDeleteInsight = async (id) => {
        if (window.confirm('آیا از حذف این بینش مطمئن هستید؟')) {
            try {
                await LearnedInsight.delete(id);
                if (window.showNotification) window.showNotification('success', 'بینش حذف شد');
                loadInsights();
            } catch (error) {
                console.error("Error deleting insight:", error);
                if (window.showNotification) window.showNotification('error', 'خطا در حذف بینش');
            }
        }
    };

    const handleAnalyzePatterns = async () => {
        setAnalyzing(true);
        try {
            const { data } = await knowledgeBaseManager({ action: "analyze_task_patterns" });
            if (data.error) throw new Error(data.error);
            if (window.showNotification) window.showNotification('info', 'تحلیل الگوها', data.message);
            loadInsights();
        } catch (error) {
            console.error('Error analyzing patterns:', error);
            if (window.showNotification) window.showNotification('error', 'خطا در تحلیل الگوها', error.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingInsight(null);
    };

    const startEdit = (insight) => {
        setEditingInsight(insight);
        setShowForm(true);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader className="animate-spin" /></div>;

    return (
        <Card className="shadow-xl border-t-4 border-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold flex items-center gap-3">
                        <Brain className="w-8 h-8 text-indigo-500" />
                        مدیریت پایگاه دانش عملیاتی
                    </CardTitle>
                    <p className="text-gray-500 mt-1">مدیریت بینش‌ها و تجربیات تیم برای بهبود عملکرد سیستم</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleAnalyzePatterns} disabled={analyzing} variant="outline">
                        {analyzing ? <Loader className="w-4 h-4 animate-spin ml-2" /> : <TrendingUp className="w-4 h-4 ml-2" />}
                        تحلیل الگوها
                    </Button>
                    <Button onClick={() => { setEditingInsight(null); setShowForm(!showForm); }}>
                        <Plus className="w-4 h-4 ml-2" />
                        {showForm ? 'بستن فرم' : 'افزودن بینش'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <AnimatePresence>
                    {showForm && <InsightForm insight={editingInsight} onSave={handleSaveInsight} onCancel={resetForm} />}
                </AnimatePresence>
                <div className="mt-6 space-y-4">
                    {insights.map(insight => (
                        <Card key={insight.id} className="bg-gray-50 hover:bg-white transition-colors">
                            <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold">{insight.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <Badge variant="outline">{INSIGHT_TYPES[insight.type]}</Badge>
                                            <Badge variant="outline">{CATEGORIES[insight.category]}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="icon" variant="ghost" onClick={() => startEdit(insight)}><Edit2 className="w-4 h-4" /></Button>
                                        <Button size="icon" variant="ghost" onClick={() => handleDeleteInsight(insight.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                    </div>
                                </div>
                                <p className="mt-2 text-gray-700">{insight.content}</p>
                                {insight.tags && insight.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {insight.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}