import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, X, Save, AlertCircle } from "lucide-react";
import { format } from "date-fns";

const CATEGORIES = [
    { value: 'personal', label: '🌟 شخصی', description: 'وظایف و اهداف شخصی' },
    { value: 'work', label: '💼 کاری', description: 'وظایف مرتبط با کار' },
    { value: 'health', label: '❤️ سلامت', description: 'فعالیت‌های مرتبط با سلامت' },
    { value: 'creative', label: '🎨 خلاقیت', description: 'پروژه‌های خلاقانه و هنری' },
    { value: 'learning', label: '📚 یادگیری', description: 'مطالعه و یادگیری مهارت‌ها' },
    { value: 'home', label: '🏠 خانه', description: 'کارهای خانگی و مسکن' }
];

const PRIORITIES = [
    { value: 'low', label: '🟢 کم', description: 'بدون عجله' },
    { value: 'medium', label: '🟡 متوسط', description: 'اولویت معمولی' },
    { value: 'high', label: '🔴 زیاد', description: 'مهم و فوری' },
    { value: 'urgent', label: '🚨 فوری', description: 'نیاز به انجام فوری' }
];

export default function TaskForm({ task, onSubmit, isOpen, onClose }) {
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData(task || {
                title: "",
                description: "",
                category: "personal",
                priority: "medium",
                status: "todo",
                due_date: "",
                estimated_time: 1
            });
            setErrors({});
        }
    }, [task, isOpen]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title?.trim()) {
            newErrors.title = 'عنوان وظیفه الزامی است';
        }
        
        if (formData.estimated_time && (formData.estimated_time < 0.5 || formData.estimated_time > 24)) {
            newErrors.estimated_time = 'زمان تخمینی باید بین 0.5 تا 24 ساعت باشد';
        }
        
        if (formData.due_date && new Date(formData.due_date) < new Date().setHours(0, 0, 0, 0)) {
            newErrors.due_date = 'تاریخ سررسید نمی‌تواند در گذشته باشد';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
            if (window.showToast) {
                window.showToast('error', 'خطا', 'ذخیره وظیفه با خطا مواجه شد');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDateDisplay = (dateString) => {
        if (!dateString) return 'انتخاب تاریخ';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fa-IR');
        } catch (error) {
            return 'انتخاب تاریخ';
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // پاک کردن خطای فیلد در صورت تغییر
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {task ? 'ویرایش وظیفه' : 'ایجاد وظیفه جدید'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5 text-gray-500" />
                            </Button>
                        </div>

                        {/* Form */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)]">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">
                                        عنوان وظیفه *
                                    </label>
                                    <Input
                                        className={`p-3 ${errors.title ? 'border-red-500' : ''}`}
                                        placeholder="چه کاری باید انجام شود؟"
                                        value={formData.title || ''}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                    />
                                    {errors.title && (
                                        <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.title}
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-gray-700 font-semibold mb-2">توضیحات</label>
                                    <Textarea
                                        className="p-3 h-24 resize-none"
                                        placeholder="جزئیات بیشتر درباره وظیفه..."
                                        value={formData.description || ""}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                    />
                                </div>

                                {/* Category & Priority */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">دسته‌بندی</label>
                                        <Select
                                            value={formData.category}
                                            onValueChange={(value) => handleInputChange('category', value)}
                                        >
                                            <SelectTrigger className="p-3">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map(cat => (
                                                    <SelectItem key={cat.value} value={cat.value}>
                                                        <div className="flex flex-col">
                                                            <span>{cat.label}</span>
                                                            <span className="text-xs text-gray-500">{cat.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">اولویت</label>
                                        <Select
                                            value={formData.priority}
                                            onValueChange={(value) => handleInputChange('priority', value)}
                                        >
                                            <SelectTrigger className="p-3">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {PRIORITIES.map(priority => (
                                                    <SelectItem key={priority.value} value={priority.value}>
                                                        <div className="flex flex-col">
                                                            <span>{priority.label}</span>
                                                            <span className="text-xs text-gray-500">{priority.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Due Date & Estimated Time */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">تاریخ سررسید</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={`w-full p-3 flex justify-start gap-3 text-right font-normal ${
                                                        errors.due_date ? 'border-red-500' : ''
                                                    }`}
                                                >
                                                    <CalendarIcon className="w-5 h-5 text-gray-500" />
                                                    {formatDateDisplay(formData.due_date)}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={formData.due_date ? new Date(formData.due_date) : undefined}
                                                    onSelect={(date) => handleInputChange('due_date', date ? date.toISOString().split('T')[0] : '')}
                                                    className="rounded-2xl"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        {errors.due_date && (
                                            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.due_date}
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 font-semibold mb-2">
                                            زمان تخمینی (ساعت)
                                        </label>
                                        <Input
                                            type="number"
                                            min="0.5"
                                            max="24"
                                            step="0.5"
                                            className={`p-3 ${errors.estimated_time ? 'border-red-500' : ''}`}
                                            placeholder="1"
                                            value={formData.estimated_time || ''}
                                            onChange={(e) => handleInputChange('estimated_time', parseFloat(e.target.value))}
                                        />
                                        {errors.estimated_time && (
                                            <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.estimated_time}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-4 p-6 border-t border-gray-200">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="flex-1 p-3 font-semibold"
                            >
                                انصراف
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 p-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {isSubmitting ? 'در حال ذخیره...' : (task ? 'بروزرسانی وظیفه' : 'ایجاد وظیفه')}
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}