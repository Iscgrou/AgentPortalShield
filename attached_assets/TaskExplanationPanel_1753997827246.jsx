import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronDown, Brain, Lightbulb, Target, 
    Users, MessageSquare, TrendingUp, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const EXPLANATION_TYPES = {
    task_reasoning: {
        icon: Brain,
        title: 'چرا این وظیفه تولید شد؟',
        color: 'blue'
    },
    solution_rationale: {
        icon: Lightbulb,
        title: 'منطق راه‌حل‌های پیشنهادی',
        color: 'yellow'
    },
    priority_justification: {
        icon: Target,
        title: 'توجیه اولویت‌بندی',
        color: 'red'
    },
    cultural_considerations: {
        icon: Users,
        title: 'ملاحظات فرهنگی',
        color: 'purple'
    }
};

function TaskExplanationPanel({ task, isOpen, onToggle }) {
    const [explanations, setExplanations] = useState({});
    const [loadingExplanations, setLoadingExplanations] = useState({});
    const [activeTab, setActiveTab] = useState('task_reasoning');

    useEffect(() => {
        if (isOpen && task && !explanations.task_reasoning) {
            loadExplanation('task_reasoning');
        }
    }, [isOpen, task]);

    const loadExplanation = async (explanationType) => {
        if (loadingExplanations[explanationType] || explanations[explanationType]) {
            return;
        }

        setLoadingExplanations(prev => ({ ...prev, [explanationType]: true }));

        try {
            setTimeout(() => {
                const newExplanation = {
                    success: true,
                    explanation: {
                        reasoning: 'این توضیح برای ' + EXPLANATION_TYPES[explanationType].title + ' است. در حال حاضر سیستم در حال توسعه است.',
                        factors: ['عامل اول', 'عامل دوم', 'عامل سوم']
                    }
                };
                
                setExplanations(prev => ({
                    ...prev,
                    [explanationType]: newExplanation
                }));
                setLoadingExplanations(prev => ({ ...prev, [explanationType]: false }));
            }, 1000);

        } catch (error) {
            console.error('Error loading explanation:', error);
            setExplanations(prev => ({
                ...prev,
                [explanationType]: {
                    success: false,
                    error: error.message
                }
            }));
            setLoadingExplanations(prev => ({ ...prev, [explanationType]: false }));
        }
    };

    const handleTabClick = (tabType) => {
        setActiveTab(tabType);
        if (!explanations[tabType]) {
            loadExplanation(tabType);
        }
    };

    if (!task) {
        return null;
    }

    const currentExplanation = explanations[activeTab];
    const isLoading = loadingExplanations[activeTab];

    return (
        <div className="border-t border-gray-200 bg-gradient-to-br from-indigo-50 to-purple-50">
            <div 
                className="p-4 cursor-pointer hover:bg-white hover:bg-opacity-50 transition-all duration-200"
                onClick={onToggle}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Brain className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800">توضیحات هوش مصنوعی</h3>
                            <p className="text-sm text-gray-600">درک بهتر منطق پشت این وظیفه</p>
                        </div>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {Object.entries(EXPLANATION_TYPES).map(([key, config]) => {
                                    const IconComponent = config.icon;
                                    const isActive = activeTab === key;
                                    const isLoaded = explanations[key];
                                    const isTabLoading = loadingExplanations[key];
                                    
                                    return (
                                        <Button
                                            key={key}
                                            variant={isActive ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleTabClick(key)}
                                            disabled={isTabLoading}
                                            className="flex items-center gap-2"
                                        >
                                            <IconComponent className="w-4 h-4" />
                                            <span className="hidden sm:inline">{config.title}</span>
                                            {isLoaded && !isTabLoading && (
                                                <CheckCircle2 className="w-3 h-3" />
                                            )}
                                            {isTabLoading && (
                                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                            )}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Card className="bg-white bg-opacity-70 backdrop-blur-sm">
                                <CardContent className="p-4">
                                    {isLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="text-center">
                                                <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
                                                <p className="text-gray-600">در حال بارگذاری توضیحات...</p>
                                            </div>
                                        </div>
                                    ) : currentExplanation ? (
                                        currentExplanation.success ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                                        <Brain className="w-4 h-4" />
                                                        توضیح
                                                    </h4>
                                                    <div className="bg-gray-50 p-3 rounded-lg">
                                                        <p className="text-gray-700 leading-relaxed">
                                                            {currentExplanation.explanation.reasoning}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                                                        <TrendingUp className="w-4 h-4" />
                                                        عوامل کلیدی
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {currentExplanation.explanation.factors.map((factor, index) => (
                                                            <motion.div
                                                                key={index}
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className="flex items-start gap-3 bg-indigo-50 p-3 rounded-lg"
                                                            >
                                                                <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                                                    {index + 1}
                                                                </span>
                                                                <span className="text-gray-700 leading-relaxed">{factor}</span>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-6">
                                                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                                <h4 className="font-medium text-gray-800 mb-2">خطا در دریافت توضیحات</h4>
                                                <p className="text-gray-600 mb-4">
                                                    {currentExplanation.error || 'خطای نامشخص'}
                                                </p>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => loadExplanation(activeTab)}
                                                >
                                                    تلاش مجدد
                                                </Button>
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center py-6">
                                            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">برای مشاهده توضیحات، روی تب مورد نظر کلیک کنید</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-yellow-800 mb-1">نکته مهم</h4>
                                        <p className="text-sm text-yellow-700">
                                            این توضیحات بر اساس تحلیل هوش مصنوعی ارائه شده‌اند. 
                                            در صورت عدم موافقت، می‌توانید از گزینه "مخالفت با AI" استفاده کنید.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default TaskExplanationPanel;