
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronsRight, Target, Lightbulb, MessageSquare, Clock, AlertTriangle, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskReportForm from './TaskReportForm';
import TaskChallengeModal from './TaskChallengeModal';
import TaskExplanationPanel from './TaskExplanationPanel';
import { smartOfferEngine } from '@/api/functions';

const taskTypeDetails = {
    follow_up: {
        icon: ChevronsRight,
        label: "پیگیری",
        color: "blue",
        bgGradient: "from-blue-50 to-indigo-50",
        borderColor: "border-blue-200",
        shadowColor: "shadow-blue-100"
    },
    proactive_outreach: {
        icon: Target,
        label: "تماس پیش‌دستانه",
        color: "purple",
        bgGradient: "from-purple-50 to-indigo-50",
        borderColor: "border-purple-200",
        shadowColor: "shadow-purple-100"
    },
    churn_prevention: {
        icon: AlertTriangle,
        label: "جلوگیری از ریزش",
        color: "orange",
        bgGradient: "from-orange-50 to-red-50",
        borderColor: "border-orange-200",
        shadowColor: "shadow-orange-100"
    },
    information_gathering: {
        icon: MessageSquare,
        label: "جمع‌آوری اطلاعات",
        color: "green",
        bgGradient: "from-green-50 to-emerald-50",
        borderColor: "border-green-200",
        shadowColor: "shadow-green-100"
    }
};

const priorityStyles = {
    urgent: {
        badge: "bg-red-500 text-white animate-pulse",
        border: "border-red-400",
        shadow: "shadow-red-200",
        glow: "shadow-lg shadow-red-200"
    },
    high: {
        badge: "bg-red-100 text-red-800",
        border: "border-red-300",
        shadow: "shadow-red-100",
        glow: "shadow-md shadow-red-100"
    },
    medium: {
        badge: "bg-yellow-100 text-yellow-800",
        border: "border-yellow-300",
        shadow: "shadow-yellow-100",
        glow: "shadow-sm shadow-yellow-100"
    },
    low: {
        badge: "bg-gray-100 text-gray-600",
        border: "border-gray-200",
        shadow: "shadow-gray-100",
        glow: ""
    }
};

const statusStyles = {
    pending: {
        badge: "bg-blue-100 text-blue-800",
        icon: Clock,
        animation: ""
    },
    overdue: {
        badge: "bg-red-100 text-red-800 animate-pulse",
        icon: AlertTriangle,
        animation: "animate-bounce"
    },
    in_progress: {
        badge: "bg-indigo-100 text-indigo-800",
        icon: Zap,
        animation: "animate-pulse"
    }
};

export default function TaskCard({ task, reseller, agent, onTaskUpdate }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isReporting, setIsReporting] = useState(false);
    const [isChallenging, setIsChallenging] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [offerRecommendation, setOfferRecommendation] = useState(null);
    const [loadingOffer, setLoadingOffer] = useState(false);

    const taskDetails = taskTypeDetails[task.task_type] || taskTypeDetails.follow_up;
    const priorityStyle = priorityStyles[task.priority] || priorityStyles.medium;
    const statusStyle = statusStyles[task.status] || statusStyles.pending;

    // محاسبه روزهای باقی‌مانده
    const daysUntilDue = useMemo(() => {
        if (!task.due_date) return null;
        const dueDate = new Date(task.due_date);
        const today = new Date();
        // Set hours, minutes, seconds, milliseconds to 0 for accurate day difference
        dueDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }, [task.due_date]);

    // تعیین استایل بر اساس ضرورت
    const getUrgencyStyle = () => {
        if (task.status === 'overdue' || (daysUntilDue !== null && daysUntilDue < 0)) {
            return {
                containerClass: `${taskDetails.bgGradient} bg-gradient-to-br border-2 ${priorityStyle.border} ${priorityStyle.glow}`,
                pulseAnimation: "animate-pulse"
            };
        }

        if (daysUntilDue !== null && daysUntilDue <= 1) {
            return {
                containerClass: `${taskDetails.bgGradient} bg-gradient-to-br border-2 border-orange-300 shadow-md shadow-orange-200`,
                pulseAnimation: daysUntilDue === 0 ? "animate-pulse" : ""
            };
        }

        return {
            containerClass: `${taskDetails.bgGradient} bg-gradient-to-br border ${taskDetails.borderColor} ${taskDetails.shadowColor}`,
            pulseAnimation: ""
        };
    };

    const urgencyStyle = getUrgencyStyle();

    // بارگذاری پیشنهاد آفر هنگام باز شدن کارت
    useEffect(() => {
        if (isExpanded && !offerRecommendation && reseller?.id) {
            loadOfferRecommendation();
        }
    }, [isExpanded, offerRecommendation, reseller?.id]);

    const loadOfferRecommendation = async () => {
        setLoadingOffer(true);
        try {
            const response = await smartOfferEngine({
                action: 'select_optimal_offer',
                reseller_id: reseller.id,
                task_context: task.context_summary
            });

            if (response.data && !response.error) {
                setOfferRecommendation(response.data);
            } else {
                console.error('Failed to load offer recommendation:', response.error);
                if (window.showToast) {
                    window.showToast('error', 'خطا', 'دریافت پیشنهاد هوشمند با خطا مواجه شد');
                }
            }
        } catch (error) {
            console.error('Error loading offer recommendation:', error);
            if (window.showToast) {
                window.showToast('error', 'خطا', 'دریافت پیشنهاد هوشمند با خطا مواجه شد');
            }
        } finally {
            setLoadingOffer(false);
        }
    };

    const handleChallengeSubmitted = (challengeData) => {
        console.log('Challenge submitted:', challengeData);
        // ثبت چالش در سیستم و اعلام به مدیر CRM
        if (window.showNotification) {
            if (challengeData.resolution === 'accepted') {
                window.showNotification('success', 'مشکل حل شد', 'توضیحات AI پذیرفته شد');
            } else {
                window.showNotification('info', 'چالش ثبت شد', 'چالش شما برای بررسی مدیر ارسال شد');
            }
        }
        setIsChallenging(false); // Close the modal after submission
    };

    if (!reseller) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center"
            >
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 text-sm font-medium">خطا: اطلاعات نماینده یافت نشد</p>
                <p className="text-red-500 text-xs mt-1">ID نماینده: {task.reseller_id}</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] ${urgencyStyle.containerClass} ${urgencyStyle.pulseAnimation}`}
        >
            <div
                className="p-5 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        {/* نوع وظیفه و اولویت */}
                        <div className="flex items-center gap-2 mb-3">
                            <div className={`flex items-center gap-2 font-semibold text-${taskDetails.color}-600`}>
                                <taskDetails.icon className="w-5 h-5" />
                                <span>{taskDetails.label}</span>
                            </div>

                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityStyle.badge}`}>
                                {task.priority === 'urgent' ? 'فوری' :
                                    task.priority === 'high' ? 'بالا' :
                                        task.priority === 'medium' ? 'متوسط' : 'پایین'}
                            </span>

                            {/* نمایش وضعیت */}
                            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${statusStyle.badge}`}>
                                <statusStyle.icon className={`w-3 h-3 ${statusStyle.animation}`} />
                                <span>
                                    {task.status === 'pending' ? 'در انتظار' :
                                        task.status === 'overdue' ? 'عقب‌افتاده' :
                                            task.status === 'in_progress' ? 'در حال انجام' : task.status}
                                </span>
                            </div>
                        </div>

                        {/* اطلاعات نماینده */}
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{reseller.shop_name}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                            مسئول: {reseller.contact_person || 'نامشخص'}
                            {agent && <span className="text-gray-400 mx-2">•</span>}
                            {agent && <span className="text-indigo-600">کارمند: {agent.name}</span>}
                        </p>

                        {/* متن وظیفه */}
                        <p className="text-gray-700 leading-relaxed text-sm">{task.prompt}</p>

                        {/* اطلاعات اضافی در حالت فشرده */}
                        {!isExpanded && (
                            <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                {task.estimated_effort_hours && (
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {task.estimated_effort_hours}ساعت
                                    </span>
                                )}
                                {daysUntilDue !== null && (
                                    <span className={`flex items-center gap-1 ${
                                        daysUntilDue < 0 ? 'text-red-600 font-medium' :
                                            daysUntilDue === 0 ? 'text-orange-600 font-medium' :
                                                daysUntilDue === 1 ? 'text-yellow-600 font-medium' :
                                                    'text-gray-500'
                                    }`}>
                                        <Target className="w-3 h-3" />
                                        {daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} روز عقب‌افتاده` :
                                            daysUntilDue === 0 ? 'امروز سررسید' :
                                                `${daysUntilDue} روز باقی‌مانده`}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    {/* آیکون باز/بسته شدن */}
                    <div className="flex flex-col items-end gap-2 ml-4">
                        <span className="text-xs text-gray-500 bg-white bg-opacity-50 px-2 py-1 rounded-full">
                            سررسید: {new Date(task.due_date).toLocaleDateString('fa-IR')}
                        </span>

                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-70 transition-colors"
                        >
                            <ChevronDown className="w-5 h-5 text-gray-600" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* محتوای کشویی */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="border-t border-white border-opacity-30 overflow-hidden"
                    >
                        {!isReporting ? (
                            <div className="bg-white bg-opacity-30 rounded-b-xl">
                                <div className="p-5">
                                    {/* زمینه وظیفه */}
                                    <div className="mb-4">
                                        <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                                            زمینه وظیفه
                                        </h4>
                                        <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                                            <p className="text-gray-700 leading-relaxed text-sm">{task.context_summary}</p>
                                        </div>
                                    </div>

                                    {/* راهکارهای پیشنهادی AI */}
                                    {task.suggested_solutions && task.suggested_solutions.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <Target className="w-4 h-4 text-indigo-500" />
                                                راهکارهای پیشنهادی AI
                                            </h4>
                                            <div className="space-y-2">
                                                {task.suggested_solutions.map((solution, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-start gap-3 bg-white bg-opacity-50 p-3 rounded-lg hover:bg-opacity-70 transition-colors"
                                                    >
                                                        <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                                            {index + 1}
                                                        </span>
                                                        <span className="text-gray-700 leading-relaxed text-sm">{solution}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* پیشنهاد آفر هوشمند */}
                                    {loadingOffer && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                <span className="text-blue-800 font-medium text-sm">در حال تحلیل بهترین آفر...</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {offerRecommendation && offerRecommendation.selected_offer && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200"
                                        >
                                            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                                🎁 پیشنهاد آفر هوشمند
                                                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                                    اعتماد: {Math.round(offerRecommendation.confidence_score)}%
                                                </span>
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="bg-white p-3 rounded-lg">
                                                    <h5 className="font-medium text-gray-800">{offerRecommendation.selected_offer.offer_name}</h5>
                                                    <p className="text-sm text-gray-600 mt-1">{offerRecommendation.selected_offer.description}</p>
                                                </div>

                                                {offerRecommendation.personalized_presentation && (
                                                    <div className="bg-white p-3 rounded-lg">
                                                        <h6 className="font-medium text-gray-700 mb-2">نحوه ارائه:</h6>
                                                        <p className="text-sm text-gray-600">{offerRecommendation.personalized_presentation.opening_message}</p>
                                                        <p className="text-sm text-gray-600 mt-2">{offerRecommendation.personalized_presentation.offer_explanation}</p>

                                                        {offerRecommendation.personalized_presentation.benefits_list && (
                                                            <ul className="text-sm text-gray-600 mt-2 space-y-1">
                                                                {offerRecommendation.personalized_presentation.benefits_list.map((benefit, idx) => (
                                                                    <li key={idx} className="flex items-start gap-2">
                                                                        <span className="text-green-500 mt-0.5">✓</span>
                                                                        {benefit}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="text-xs text-gray-500">
                                                    <strong>دلیل انتخاب:</strong> {offerRecommendation.reasoning.primary_reason}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* اطلاعات تکمیلی نماینده */}
                                    {reseller.psychological_profile && (
                                        <div className="mb-6 p-4 bg-blue-50 bg-opacity-50 rounded-lg">
                                            <h4 className="font-semibold text-blue-800 mb-2">نکات مهم درباره نماینده:</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <span className="text-blue-700 font-medium">کانال ترجیحی: </span>
                                                    <span className="text-blue-600">
                                                        {reseller.psychological_profile.preferredCommunicationChannel === 'telegram' ? 'تلگرام' : 'تلفن'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700 font-medium">پذیرش پیشنهادات: </span>
                                                    <span className="text-blue-600">
                                                        {reseller.psychological_profile.receptivenessToSuggestions}/10
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700 font-medium">درایت کسب‌وکار: </span>
                                                    <span className="text-blue-600">
                                                        {reseller.psychological_profile.businessAcumen === 'high' ? 'بالا' :
                                                            reseller.psychological_profile.businessAcumen === 'medium' ? 'متوسط' : 'پایین'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-blue-700 font-medium">ریسک‌پذیری: </span>
                                                    <span className="text-blue-600">
                                                        {reseller.psychological_profile.riskAversion === 'high' ? 'بالا' :
                                                            reseller.psychological_profile.riskAversion === 'medium' ? 'متوسط' : 'پایین'}
                                                    </span>
                                                </div>
                                            </div>
                                            {reseller.psychological_profile.notes && (
                                                <div className="mt-3 pt-3 border-t border-blue-200">
                                                    <span className="text-blue-700 font-medium">یادداشت‌ها: </span>
                                                    <span className="text-blue-600">{reseller.psychological_profile.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* آخرین فروش (اگر موجود باشد) */}
                                    {reseller.sales_history && reseller.sales_history.length > 0 && (
                                        <div className="mb-6 p-4 bg-green-50 bg-opacity-50 rounded-lg">
                                            <h4 className="font-semibold text-green-800 mb-2">آخرین عملکرد فروش:</h4>
                                            <div className="text-sm space-y-1">
                                                {reseller.sales_history.slice(-3).map((sale, index) => (
                                                    <div key={index} className="flex justify-between">
                                                        <span className="text-green-700">هفته {sale.week} سال {sale.year}:</span>
                                                        <span className="text-green-600 font-medium">
                                                            {sale.salesAmount.toLocaleString('fa-IR')} تومان
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* دکمه‌های اقدام جدید */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsChallenging(true);
                                                }}
                                                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                🤔 مخالفت با AI
                                            </motion.button>
                                            
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsReporting(true);
                                                }}
                                                className="flex-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                ✅ انجام شد
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>

                                {/* پنل توضیحات AI */}
                                <TaskExplanationPanel
                                    task={task}
                                    isOpen={showExplanation}
                                    onToggle={() => setShowExplanation(!showExplanation)}
                                />
                            </div>
                        ) : (
                            <TaskReportForm
                                task={task}
                                onCancel={() => setIsReporting(false)}
                                onSubmitSuccess={() => {
                                    setIsExpanded(false);
                                    setIsReporting(false);
                                    onTaskUpdate();
                                }}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* مودال چالش وظیفه */}
            <TaskChallengeModal
                task={task}
                isOpen={isChallenging}
                onClose={() => setIsChallenging(false)}
                onChallengeSubmitted={handleChallengeSubmitted}
            />
        </motion.div>
    );
}
