import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Users, 
  Brain, 
  Gift, 
  BarChart3, 
  TestTube,
  Shield,
  Database,
  Zap,
  UserCog
} from 'lucide-react';

// Import sub-components
import { ManagerWorkspace } from './ManagerWorkspace.tsx';
import { SystemConfiguration } from './SystemConfiguration.tsx';
import { SupportStaffManagement } from './SupportStaffManagement.tsx';
import { AiKnowledgeManager } from './AiKnowledgeManager.tsx';
import { OffersManagement } from './OffersManagement.tsx';
import { AiTestResults } from './AiTestResults.tsx';
import QuickActionsPanel from './QuickActionsPanel';

interface SettingsHubProps {
  userRole?: string;
  permissions?: string[];
}

export function SettingsHub({ userRole = 'CRM_MANAGER', permissions = [] }: SettingsHubProps) {
  const [activeTab, setActiveTab] = useState('manager-workspace');

  const settingsSections = [
    {
      id: 'manager-workspace',
      label: 'میز کار مدیر',
      icon: UserCog,
      description: 'مدیریت وظایف، گزارش‌ها و عملیات مدیریتی',
      color: 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      component: ManagerWorkspace
    },
    {
      id: 'system-config',
      label: 'تنظیمات سیستم',
      icon: Settings,
      description: 'تنظیمات عمومی، API و پیکربندی‌های پایه',
      color: 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800',
      badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
      component: SystemConfiguration
    },
    {
      id: 'support-staff',
      label: 'کارمندان پشتیبانی',
      icon: Users,
      description: 'مدیریت تیم پشتیبانی و اختیارات دسترسی',
      color: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      component: SupportStaffManagement
    },
    {
      id: 'ai-knowledge',
      label: 'دیتابیس دانش هوش مصنوعی',
      icon: Brain,
      description: 'مدیریت دانش، آموزش‌ها و منابع هوش مصنوعی',
      color: 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800',
      badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      component: AiKnowledgeManager
    },
    {
      id: 'offers',
      label: 'آفرها و مشوق‌ها',
      icon: Gift,
      description: 'مدیریت آفرهای ویژه و مشوق‌های فروش',
      color: 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800',
      badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      component: OffersManagement
    },
    {
      id: 'ai-tests',
      label: 'نتایج تست‌های هوش مصنوعی',
      icon: TestTube,
      description: 'مشاهده نتایج آزمایش‌ها و عملکرد سیستم',
      color: 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
      component: AiTestResults
    }
  ];

  // Filter sections based on user permissions
  const visibleSections = settingsSections.filter(section => {
    // For now, show all sections to CRM_MANAGER
    if (userRole === 'CRM_MANAGER') return true;

    // Add permission-based filtering here if needed
    return true;
  });

  const currentSection = visibleSections.find(s => s.id === activeTab);
  const CurrentComponent = currentSection?.component;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                🔧 تنظیمات سیستم
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                مدیریت جامع تنظیمات و پیکربندی‌های DA VINCI v1.0
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      تب‌های فعال
                    </p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {visibleSections.length + 1}
                    </p>
                  </div>
                  <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      نقش کاربری
                    </p>
                    <p className="text-lg font-bold text-green-900 dark:text-green-100">
                      {userRole === 'CRM_MANAGER' ? 'مدیر CRM' : userRole}
                    </p>
                  </div>
                  <UserCog className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      هوش مصنوعی
                    </p>
                    <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                      xAI Grok
                    </p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200 dark:border-orange-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      وضعیت سیستم
                    </p>
                    <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                      عملیاتی
                    </p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab List */}
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-7 h-auto p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <TabsTrigger value="actions" className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900">
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm text-center leading-tight">
                  اقدامات سریع
                </span>
              </TabsTrigger>
              {visibleSections.map((section) => {
                const Icon = section.icon;
                return (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-900"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm text-center leading-tight">
                      {section.label}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          <TabsContent value="actions" className="space-y-4">
            <QuickActionsPanel />
          </TabsContent>

          {visibleSections.map((section) => {
            const Component = section.component;
            return (
              <TabsContent key={section.id} value={section.id}>
                <Card className={`${section.color} min-h-[600px]`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-white dark:bg-gray-800 shadow-sm`}>
                          <section.icon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <CardTitle className="text-xl text-gray-900 dark:text-white">
                            {section.label}
                          </CardTitle>
                          <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                            {section.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={section.badgeColor}>
                        فعال
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Component />
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
}