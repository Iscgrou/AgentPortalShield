import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, MessageSquare, AlertTriangle, CheckCircle2, 
    Brain, User, Send, ThumbsDown, ThumbsUp, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CHALLENGE_TYPES = {
    task_inappropriate: {
        title: 'وظیفه نامناسب است',
        description: 'این وظیفه با وضعیت فعلی نماینده مطابقت ندارد',
        icon: AlertTriangle,
        color: 'red'
    },
    solution_ineffective: {
        title: 'راه‌حل‌ها موثر نیستند',
        description: 'راه‌حل‌های پیشنهادی عملی یا مفید نیستند',
        icon: ThumbsDown,
        color: 'orange'
    },
    timing_wrong: {
        title: 'زمان‌بندی اشتباه',
        description: 'این زمان مناسب برای این نوع تعامل نیست',
        icon: Clock,
        color: 'yellow'
    },
    cultural_insensitive: {
        title: 'عدم رعایت نکات فرهنگی',
        description: 'رویکرد با فرهنگ ایرانی سازگار نیست',
        icon: User,
        color: 'purple'
    }
};

function TaskChallengeModal({ task, isOpen, onClose, onChallengeSubmitted }) {
    const [selectedChallengeType, setSelectedChallengeType] = useState('');
    const [challengeReason, setChallengeReason] = useState('');
    const [alternativeSuggestion, setAlternativeSuggestion] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedChallengeType || !challengeReason.trim()) {
            if (window.showNotification) {
                window.showNotification('error', 'خطا', 'لطفاً نوع مشکل و دلیل را مشخص کنید');
            }
            return;
        }

        setIsSubmitting(true);

        try {
            const challengeData = {
                task_id: task.id,
                challenge_type: selectedChallengeType,
                reason: challengeReason.trim(),
                alternative_suggestion: alternativeSuggestion.trim(),
                timestamp: new Date().toISOString(),
                resolution: 'pending'
            };

            // شبیه‌سازی ارسال چالش
            await new Promise(resolve => setTimeout(resolve, 1500));

            onChallengeSubmitted(challengeData);
            resetForm();

        } catch (error) {
            console.error('Error submitting challenge:', error);
            if (window.showNotification) {
                window.showNotification('error', 'خطا', 'خطا در ارسال چالش');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setSelectedChallengeType('');
        setChallengeReason('');
        setAlternativeSuggestion('');
    };

    if (!isOpen || !task) {
        return null;
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* هدر */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <MessageSquare className="w-6 h-6 text-orange-600" />
                                    مخالفت با پیشنهاد AI
                                </h2>
                                <p className="text-gray-600 mt-1">
                                    اگر با تحلیل یا پیشنهاد هوش مصنوعی موافق نیستید، دلیل خود را بیان کنید
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6">
                        {/* خلاصه وظیفه */}
                        <Card className="mb-6 bg-gray-50">
                            <CardContent className="p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">وظیفه مورد بحث:</h3>
                                <p className="text-gray-700 text-sm mb-2">{task.prompt}</p>
                                <div className="flex gap-2">
                                    <Badge variant="outline">{task.task_type}</Badge>
                                    <Badge variant="outline">{task.priority}</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* انتخاب نوع مشکل */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-800 mb-3">نوع مشکل:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {Object.entries(CHALLENGE_TYPES).map(([key, config]) => {
                                    const IconComponent = config.icon;
                                    const isSelected = selectedChallengeType === key;
                                    
                                    return (
                                        <motion.div
                                            key={key}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                isSelected 
                                                    ? 'border-orange-500 bg-orange-50' 
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => setSelectedChallengeType(key)}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    isSelected ? 'bg-orange-100' : 'bg-gray-100'
                                                }`}>
                                                    <IconComponent className={`w-5 h-5 ${
                                                        isSelected ? 'text-orange-600' : 'text-gray-600'
                                                    }`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-800 mb-1">
                                                        {config.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        {config.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* توضیح دلیل */}
                        <div className="mb-6">
                            <label className="block font-semibold text-gray-800 mb-2">
                                توضیح دلیل مخالفت *
                            </label>
                            <Textarea
                                value={challengeReason}
                                onChange={(e) => setChallengeReason(e.target.value)}
                                placeholder="لطفاً به طور واضح توضیح دهید که چرا با پیشنهاد AI موافق نیستید..."
                                className="h-32 resize-none"
                                required
                            />
                        </div>

                        {/* پیشنهاد جایگزین */}
                        <div className="mb-6">
                            <label className="block font-semibold text-gray-800 mb-2">
                                پیشنهاد جایگزین (اختیاری)
                            </label>
                            <Textarea
                                value={alternativeSuggestion}
                                onChange={(e) => setAlternativeSuggestion(e.target.value)}
                                placeholder="اگر راه‌حل بهتری در نظر دارید، اینجا بنویسید..."
                                className="h-24 resize-none"
                            />
                        </div>

                        {/* اطلاعات مهم */}
                        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-800 mb-2">نکات مهم:</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• چالش شما برای بررسی مدیر ارسال خواهد شد</li>
                                        <li>• این اطلاعات برای بهبود سیستم هوش مصنوعی استفاده می‌شود</li>
                                        <li>• پاسخ شما در پایگاه دانش ذخیره خواهد شد</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* دکمه‌های عملیات */}
                        <div className="flex justify-end gap-3">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                انصراف
                            </Button>
                            <Button 
                                type="submit"
                                disabled={isSubmitting || !selectedChallengeType || !challengeReason.trim()}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        در حال ارسال...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        ارسال چالش
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

export default TaskChallengeModal;