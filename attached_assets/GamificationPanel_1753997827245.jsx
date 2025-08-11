import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Trophy, Star, Target, TrendingUp, Calendar, 
    Award, Zap, Users, Clock, Medal, Crown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AgentGamification } from '@/api/entities';
import { Achievement } from '@/api/entities';
import { User } from '@/api/entities';

const LEVEL_CONFIG = {
    1: { name: 'مبتدی', color: 'gray', xpRequired: 0 },
    2: { name: 'کارآموز', color: 'blue', xpRequired: 100 },
    3: { name: 'ماهر', color: 'green', xpRequired: 300 },
    4: { name: 'خبره', color: 'purple', xpRequired: 600 },
    5: { name: 'استاد', color: 'orange', xpRequired: 1000 }
};

const BADGE_COLORS = {
    common: 'bg-gray-100 text-gray-800',
    rare: 'bg-blue-100 text-blue-800',
    epic: 'bg-purple-100 text-purple-800',
    legendary: 'bg-yellow-100 text-yellow-800'
};

function GamificationPanel() {
    const [gamificationData, setGamificationData] = useState(null);
    const [achievements, setAchievements] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGamificationData();
    }, []);

    const loadGamificationData = async () => {
        try {
            setLoading(true);
            
            // بارگذاری کاربر فعلی
            const user = await User.me();
            setCurrentUser(user);

            // بارگذاری داده‌های گیمیفیکیشن
            const gamificationRecords = await AgentGamification.filter({ 
                agent_id: user.id 
            });
            
            let gamificationRecord;
            if (gamificationRecords.length === 0) {
                // ایجاد رکورد اولیه
                gamificationRecord = await AgentGamification.create({
                    agent_id: user.id,
                    current_level: 1,
                    total_xp: 0,
                    current_streak: 0,
                    best_streak: 0,
                    badges: [],
                    achievements: [],
                    weekly_goals: {
                        tasks_completed: 0,
                        quality_average: 0,
                        on_time_percentage: 0,
                        week_start: new Date().toISOString().split('T')[0],
                        target_tasks: 10,
                        target_quality: 4.0,
                        target_punctuality: 90
                    }
                });
            } else {
                gamificationRecord = gamificationRecords[0];
            }
            
            setGamificationData(gamificationRecord);

            // بارگذاری دستاوردهای موجود
            const allAchievements = await Achievement.filter({ is_active: true });
            setAchievements(allAchievements);

        } catch (error) {
            console.error('Error loading gamification data:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateLevelProgress = () => {
        if (!gamificationData) return { progress: 0, nextLevel: 2 };

        const currentLevel = gamificationData.current_level;
        const totalXp = gamificationData.total_xp;
        
        const currentLevelXp = LEVEL_CONFIG[currentLevel]?.xpRequired || 0;
        const nextLevel = Math.min(currentLevel + 1, 5);
        const nextLevelXp = LEVEL_CONFIG[nextLevel]?.xpRequired || 1000;
        
        const progress = Math.min(
            ((totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100,
            100
        );

        return { progress, nextLevel, nextLevelXp, currentLevelXp };
    };

    const getWeeklyGoalProgress = (goalType) => {
        if (!gamificationData?.weekly_goals) return 0;
        
        const goals = gamificationData.weekly_goals;
        switch (goalType) {
            case 'tasks':
                return Math.min((goals.tasks_completed / goals.target_tasks) * 100, 100);
            case 'quality':
                return Math.min((goals.quality_average / goals.target_quality) * 100, 100);
            case 'punctuality':
                return Math.min((goals.on_time_percentage / goals.target_punctuality) * 100, 100);
            default:
                return 0;
        }
    };

    const getRecentAchievements = () => {
        if (!gamificationData?.achievements) return [];
        
        return gamificationData.achievements
            .filter(ach => ach.completed)
            .sort((a, b) => new Date(b.unlocked_date) - new Date(a.unlocked_date))
            .slice(0, 3);
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!gamificationData) {
        return null;
    }

    const levelInfo = calculateLevelProgress();
    const currentLevelConfig = LEVEL_CONFIG[gamificationData.current_level] || LEVEL_CONFIG[1];

    return (
        <div className="space-y-6">
            {/* پنل اصلی آمار */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        پیشرفت شما
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* سطح فعلی */}
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <div className={`w-12 h-12 bg-${currentLevelConfig.color}-100 rounded-full flex items-center justify-center`}>
                                    <Crown className={`w-6 h-6 text-${currentLevelConfig.color}-600`} />
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-800">{currentLevelConfig.name}</h3>
                            <p className="text-sm text-gray-600">سطح {gamificationData.current_level}</p>
                        </div>

                        {/* امتیاز کل */}
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Star className="w-6 h-6 text-blue-600" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-800">{gamificationData.total_xp}</h3>
                            <p className="text-sm text-gray-600">امتیاز کل</p>
                        </div>

                        {/* رشته فعلی */}
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-800">{gamificationData.current_streak}</h3>
                            <p className="text-sm text-gray-600">روز متوالی</p>
                        </div>

                        {/* بهترین رشته */}
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-2">
                                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Medal className="w-6 h-6 text-orange-600" />
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-800">{gamificationData.best_streak}</h3>
                            <p className="text-sm text-gray-600">رکورد شخصی</p>
                        </div>
                    </div>

                    {/* پیشرفت سطح */}
                    <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">
                                پیشرفت به سطح {levelInfo.nextLevel}
                            </span>
                            <span className="text-sm text-gray-500">
                                {gamificationData.total_xp} / {levelInfo.nextLevelXp}
                            </span>
                        </div>
                        <Progress value={levelInfo.progress} className="h-3" />
                    </div>
                </CardContent>
            </Card>

            {/* اهداف هفتگی */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        اهداف هفتگی
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* وظایف تکمیل شده */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">وظایف تکمیل شده</span>
                                <span className="text-sm text-gray-500">
                                    {gamificationData.weekly_goals.tasks_completed} / {gamificationData.weekly_goals.target_tasks}
                                </span>
                            </div>
                            <Progress value={getWeeklyGoalProgress('tasks')} className="h-2" />
                        </div>

                        {/* میانگین کیفیت */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">میانگین کیفیت</span>
                                <span className="text-sm text-gray-500">
                                    {gamificationData.weekly_goals.quality_average} / {gamificationData.weekly_goals.target_quality}
                                </span>
                            </div>
                            <Progress value={getWeeklyGoalProgress('quality')} className="h-2" />
                        </div>

                        {/* به‌موقع بودن */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-700">به‌موقع بودن</span>
                                <span className="text-sm text-gray-500">
                                    {gamificationData.weekly_goals.on_time_percentage}% / {gamificationData.weekly_goals.target_punctuality}%
                                </span>
                            </div>
                            <Progress value={getWeeklyGoalProgress('punctuality')} className="h-2" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* نشان‌ها و دستاوردها */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-purple-600" />
                        نشان‌ها و دستاوردها
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {gamificationData.badges.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {gamificationData.badges.map((badge, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                    🏆 {badge}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm mb-4">هنوز نشانی کسب نکرده‌اید</p>
                    )}

                    {getRecentAchievements().length > 0 && (
                        <div>
                            <h4 className="font-medium text-gray-800 mb-3">آخرین دستاوردها:</h4>
                            <div className="space-y-2">
                                {getRecentAchievements().map((achievement, index) => {
                                    const achievementInfo = achievements.find(a => a.achievement_id === achievement.achievement_id);
                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg"
                                        >
                                            <div className="text-2xl">{achievementInfo?.icon || '🏆'}</div>
                                            <div>
                                                <h5 className="font-medium text-gray-800">
                                                    {achievementInfo?.title || 'دستاورد ناشناخته'}
                                                </h5>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(achievement.unlocked_date).toLocaleDateString('fa-IR')}
                                                </p>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default GamificationPanel;