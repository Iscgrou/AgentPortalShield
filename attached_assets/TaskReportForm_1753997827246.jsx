import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, X, Star, Clock, MessageSquare, 
    TrendingUp, AlertTriangle, Lightbulb, Save,
    Eye, EyeOff, Brain, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TaskReport } from '@/api/entities';
import { gamificationEngine } from '@/api/functions';
import { dataQualityManager } from '@/api/functions';

export default function TaskReportForm({ task, onCancel, onSubmitSuccess }) {
    const [reportData, setReportData] = useState({
        outcome_summary: '',
        updated_reseller_insights: '',
        follow_up_required: false,
        task_effectiveness_rating: 4,
        deviation_reason: '',
        communication_channel_used: 'phone',
        interaction_duration_minutes: 15,
        reseller_mood: 'neutral',
        challenges_faced: [],
        solutions_applied: [],
        additional_notes: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [qualityFeedback, setQualityFeedback] = useState(null);
    const [predictedXP, setPredictedXP] = useState(0);

    // گزینه‌های از پیش تعریف شده
    const communicationChannels = [
        { value: 'phone', label: '📞 تماس تلفنی', icon: '📞' },
        { value: 'telegram', label: '💬 تلگرام', icon: '💬' },
        { value: 'in_person', label: '👤 حضوری', icon: '👤' },
        { value: 'email', label: '📧 ایمیل', icon: '📧' }
    ];

    const resellerMoods = [
        { value: 'very_positive', label: '😊 بسیار مثبت', color: 'text-green-600' },
        { value: 'positive', label: '🙂 مثبت', color: 'text-green-500' },
        { value: 'neutral', label: '😐 خنثی', color: 'text-gray-500' },
        { value: 'negative', label: '😕 منفی', color: 'text-orange-500' },
        { value: 'very_negative', label: '😠 بسیار منفی', color: 'text-red-500' }
    ];

    const commonChallenges = [
        'مقاومت در برابر تغییر',
        'کمبود زمان نماینده',
        'مشکلات فنی',
        'عدم درک کامل نیازها',
        'رقابت با سایر تأمین‌کنندگان',
        'مسائل مالی نماینده',
        'تغییر شرایط بازار'
    ];

    const commonSolutions = [
        'ارائه توضیحات اضافی',
        'تنظیم زمان مناسب‌تر',
        'حل مشکلات فنی',
        'ارائه مثال‌های عملی',
        'تأکید بر مزایای رقابتی',
        'ارائه راه‌حل مالی',
        'تطبیق با شرایط جدید'
    ];

    // محاسبه XP پیش‌بینی شده
    useEffect(() => {
        const baseXP = 10; // XP پایه برای تکمیل وظیفه
        const qualityBonus = [0, 0, 2, 5, 10, 20][reportData.task_effectiveness_rating] || 0;
        const onTimeBonus = new Date() <= new Date(task.due_date) ? 5 : 0;
        setPredictedXP(baseXP + qualityBonus + onTimeBonus);
    }, [reportData.task_effectiveness_rating, task.due_date]);

    // بررسی کیفیت گزارش در زمان واقعی
    useEffect(() => {
        const checkQuality = async () => {
            if (reportData.outcome_summary.length > 20) {
                try {
                    const { data } = await dataQualityManager({
                        action: 'assess_report_quality',
                        task_report_data: {
                            ...reportData,
                            task_id: task.id
                        }
                    });
                    
                    if (data.success) {
                        setQualityFeedback(data);
                    }
                } catch (error) {
                    console.error('Error checking quality:', error);
                }
            }
        };

        const timeoutId = setTimeout(checkQuality, 1000);
        return () => clearTimeout(timeoutId);
    }, [reportData.outcome_summary, reportData.updated_reseller_insights]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // ثبت گزارش وظیفه
            const taskReport = await TaskReport.create({
                task_id: task.id,
                completion_timestamp: new Date().toISOString(),
                ...reportData
            });

            // بروزرسانی وضعیت وظیفه
            await Task.update(task.id, {
                status: 'completed',
                completion_notes: reportData.outcome_summary
            });

            // بروزرسانی سیستم گیمیفیکیشن
            try {
                await gamificationEngine({
                    action: 'update_agent_progress',
                    agent_id: task.assigned_to_agent_id,
                    task_completion_data: {
                        task_id: task.id,
                        task_type: task.task_type,
                        quality_rating: reportData.task_effectiveness_rating,
                        completed_on_time: new Date() <= new Date(task.due_date),
                        interaction_data: {
                            channel: reportData.communication_channel_used,
                            duration: reportData.interaction_duration_minutes,
                            challenges_faced: reportData.challenges_faced,
                            mood_outcome: reportData.reseller_mood
                        }
                    }
                });
            } catch (gamError) {
                console.error('Gamification update error:', gamError);
            }

            if (window.showNotification) {
                window.showNotification('success', 'گزارش ثبت شد', 
                    `گزارش با موفقیت ثبت شد. شما ${predictedXP} XP کسب کردید!`);
            }

            onSubmitSuccess();
        } catch (error) {
            console.error('Error submitting report:', error);
            if (window.showNotification) {
                window.showNotification('error', 'خطا در ثبت گزارش', error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleChallenge = (challenge) => {
        const currentChallenges = [...reportData.challenges_faced];
        const index = currentChallenges.indexOf(challenge);
        
        if (index > -1) {
            currentChallenges.splice(index, 1);
        } else {
            currentChallenges.push(challenge);
        }
        
        setReportData(prev => ({
            ...prev,
            challenges_faced: currentChallenges
        }));
    };

    const toggleSolution = (solution) => {
        const currentSolutions = [...reportData.solutions_applied];
        const index = currentSolutions.indexOf(solution);
        
        if (index > -1) {
            currentSolutions.splice(index, 1);
        } else {
            currentSolutions.push(solution);
        }
        
        setReportData(prev => ({
            ...prev,
            solutions_applied: currentSolutions
        }));
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg p-6"
        >
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        گزارش تکمیل وظیفه
                    </h3>
                    <p className="text-gray-600 mt-1">ثبت نتیجه و جزئیات انجام وظیفه</p>
                </div>
                
                {/* نمایش XP پیش‌بینی شده */}
                <div className="flex items-center gap-3">
                    <div className="text-center bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Award className="w-4 h-4" />
                            XP پیش‌بینی شده
                        </div>
                        <div className="text-xl font-bold text-purple-600">{predictedXP}</div>
                    </div>
                </div>
            </div>

            {/* نمایش بازخورد کیفیت */}
            {qualityFeedback && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg mb-6 ${
                        qualityFeedback.quality_score >= 80 ? 'bg-green-50 border border-green-200' :
                        qualityFeedback.quality_score >= 60 ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-red-50 border border-red-200'
                    }`}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-5 h-5 text-indigo-600" />
                        <span className="font-medium text-gray-800">
                            ارزیابی کیفیت گزارش: {qualityFeedback.quality_grade}
                        </span>
                        <Badge variant="outline">{qualityFeedback.quality_score}/100</Badge>
                    </div>
                    {qualityFeedback.improvement_suggestions && qualityFeedback.improvement_suggestions.length > 0 && (
                        <div className="text-sm text-gray-600">
                            <strong>پیشنهادات بهبود:</strong>
                            <ul className="list-disc list-inside mt-1">
                                {qualityFeedback.improvement_suggestions.slice(0, 2).map((suggestion, idx) => (
                                    <li key={idx}>{suggestion}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* خلاصه نتیجه (اجباری) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        خلاصه نتیجه تعامل <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                        value={reportData.outcome_summary}
                        onChange={(e) => setReportData(prev => ({
                            ...prev,
                            outcome_summary: e.target.value
                        }))}
                        placeholder="به طور خلاصه نتیجه تماس و واکنش نماینده را شرح دهید..."
                        className="h-24"
                        required
                    />
                </div>

                {/* امتیاز اثربخشی */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        امتیاز اثربخشی وظیفه (1-5)
                    </label>
                    <div className="space-y-3">
                        <Slider
                            value={[reportData.task_effectiveness_rating]}
                            onValueChange={(value) => setReportData(prev => ({
                                ...prev,
                                task_effectiveness_rating: value[0]
                            }))}
                            max={5}
                            min={1}
                            step={1}
                            className="w-full"
                        />
                        <div className="flex justify-between items-center">
                            {[1,2,3,4,5].map(rating => (
                                <div 
                                    key={rating} 
                                    className={`flex flex-col items-center cursor-pointer p-2 rounded-lg ${
                                        reportData.task_effectiveness_rating === rating ? 'bg-indigo-100' : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => setReportData(prev => ({
                                        ...prev,
                                        task_effectiveness_rating: rating
                                    }))}
                                >
                                    <div className="flex">
                                        {Array.from({length: rating}).map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-600 mt-1">
                                        {rating === 1 ? 'ناموفق' :
                                         rating === 2 ? 'ضعیف' :
                                         rating === 3 ? 'متوسط' :
                                         rating === 4 ? 'خوب' : 'عالی'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* کانال ارتباطی و مدت زمان */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            کانال ارتباطی استفاده شده
                        </label>
                        <Select 
                            value={reportData.communication_channel_used} 
                            onValueChange={(value) => setReportData(prev => ({
                                ...prev,
                                communication_channel_used: value
                            }))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {communicationChannels.map(channel => (
                                    <SelectItem key={channel.value} value={channel.value}>
                                        {channel.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            مدت زمان تعامل (دقیقه)
                        </label>
                        <Slider
                            value={[reportData.interaction_duration_minutes]}
                            onValueChange={(value) => setReportData(prev => ({
                                ...prev,
                                interaction_duration_minutes: value[0]
                            }))}
                            max={120}
                            min={1}
                            step={5}
                            className="w-full mt-3"
                        />
                        <div className="text-center text-sm text-gray-600 mt-2">
                            {reportData.interaction_duration_minutes} دقیقه
                        </div>
                    </div>
                </div>

                {/* حالت روحی نماینده */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        حالت روحی نماینده در پایان تعامل
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {resellerMoods.map(mood => (
                            <Button
                                key={mood.value}
                                type="button"
                                variant={reportData.reseller_mood === mood.value ? "default" : "outline"}
                                className={`text-sm ${mood.color} ${
                                    reportData.reseller_mood === mood.value ? 'bg-indigo-600 text-white' : ''
                                }`}
                                onClick={() => setReportData(prev => ({
                                    ...prev,
                                    reseller_mood: mood.value
                                }))}
                            >
                                {mood.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* گزینه‌های پیشرفته */}
                <div className="border-t pt-6">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                    >
                        {showAdvancedOptions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        گزینه‌های پیشرفته
                    </Button>
                </div>

                {showAdvancedOptions && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-6"
                    >
                        {/* چالش‌های مواجه شده */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                چالش‌های مواجه شده
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {commonChallenges.map(challenge => (
                                    <div key={challenge} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`challenge-${challenge}`}
                                            checked={reportData.challenges_faced.includes(challenge)}
                                            onCheckedChange={() => toggleChallenge(challenge)}
                                        />
                                        <label 
                                            htmlFor={`challenge-${challenge}`}
                                            className="text-sm text-gray-700 cursor-pointer"
                                        >
                                            {challenge}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* راه‌حل‌های اعمال شده */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                راه‌حل‌های اعمال شده
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {commonSolutions.map(solution => (
                                    <div key={solution} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`solution-${solution}`}
                                            checked={reportData.solutions_applied.includes(solution)}
                                            onCheckedChange={() => toggleSolution(solution)}
                                        />
                                        <label 
                                            htmlFor={`solution-${solution}`}
                                            className="text-sm text-gray-700 cursor-pointer"
                                        >
                                            {solution}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* بینش‌های جدید */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                بینش‌های جدید درباره نماینده
                            </label>
                            <Textarea
                                value={reportData.updated_reseller_insights}
                                onChange={(e) => setReportData(prev => ({
                                    ...prev,
                                    updated_reseller_insights: e.target.value
                                }))}
                                placeholder="اطلاعات جدیدی که درباره نماینده کسب کردید..."
                                className="h-20"
                            />
                        </div>

                        {/* نیاز به پیگیری */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="follow-up-required"
                                checked={reportData.follow_up_required}
                                onCheckedChange={(checked) => setReportData(prev => ({
                                    ...prev,
                                    follow_up_required: checked
                                }))}
                            />
                            <label htmlFor="follow-up-required" className="text-sm text-gray-700">
                                این وظیفه نیاز به پیگیری مجدد دارد
                            </label>
                        </div>

                        {/* یادداشت‌های اضافی */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                یادداشت‌های اضافی
                            </label>
                            <Textarea
                                value={reportData.additional_notes}
                                onChange={(e) => setReportData(prev => ({
                                    ...prev,
                                    additional_notes: e.target.value
                                }))}
                                placeholder="نکات، توصیه‌ها یا اطلاعات اضافی..."
                                className="h-16"
                            />
                        </div>
                    </motion.div>
                )}

                {/* دکمه‌های اقدام */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        انصراف
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={isSubmitting || !reportData.outcome_summary.trim()}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        ثبت گزارش و تکمیل وظیفه
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}