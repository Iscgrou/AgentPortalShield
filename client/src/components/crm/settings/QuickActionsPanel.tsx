
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  Database, 
  Activity, 
  BarChart3, 
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  status: 'ready' | 'running' | 'completed';
  badge?: string;
}

export default function QuickActionsPanel() {
  const [actions, setActions] = useState<QuickAction[]>([
    {
      id: 'sync-representatives',
      title: 'همگام‌سازی نمایندگان',
      description: 'بروزرسانی اطلاعات مالی تمام نمایندگان',
      icon: <RefreshCw className="h-5 w-5" />,
      action: () => handleSync('representatives'),
      status: 'ready',
      badge: 'فوری'
    },
    {
      id: 'validate-invoices',
      title: 'اعتبارسنجی فاکتورها',
      description: 'بررسی یکپارچگی اطلاعات فاکتورها',
      icon: <CheckCircle className="h-5 w-5" />,
      action: () => handleValidation(),
      status: 'ready'
    },
    {
      id: 'generate-reports',
      title: 'تولید گزارشات',
      description: 'ایجاد گزارشات آماری و مالی',
      icon: <BarChart3 className="h-5 w-5" />,
      action: () => handleReports(),
      status: 'ready'
    },
    {
      id: 'cleanup-logs',
      title: 'پاکسازی لاگ‌ها',
      description: 'حذف لاگ‌های قدیمی و بهینه‌سازی',
      icon: <Database className="h-5 w-5" />,
      action: () => handleCleanup(),
      status: 'ready'
    }
  ]);

  const handleSync = async (type: string) => {
    setActionStatus('sync-representatives', 'running');
    try {
      const response = await fetch('/api/financial-integrity/force-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      if (response.ok) {
        setActionStatus('sync-representatives', 'completed');
        setTimeout(() => setActionStatus('sync-representatives', 'ready'), 3000);
      }
    } catch (error) {
      setActionStatus('sync-representatives', 'ready');
    }
  };

  const handleValidation = async () => {
    setActionStatus('validate-invoices', 'running');
    try {
      const response = await fetch('/api/financial-integrity/validate-all', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setActionStatus('validate-invoices', 'completed');
        setTimeout(() => setActionStatus('validate-invoices', 'ready'), 3000);
      }
    } catch (error) {
      setActionStatus('validate-invoices', 'ready');
    }
  };

  const handleReports = async () => {
    setActionStatus('generate-reports', 'running');
    try {
      const response = await fetch('/api/unified-statistics/generate-reports', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setActionStatus('generate-reports', 'completed');
        setTimeout(() => setActionStatus('generate-reports', 'ready'), 3000);
      }
    } catch (error) {
      setActionStatus('generate-reports', 'ready');
    }
  };

  const handleCleanup = async () => {
    setActionStatus('cleanup-logs', 'running');
    try {
      const response = await fetch('/api/crm/maintenance/cleanup', {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        setActionStatus('cleanup-logs', 'completed');
        setTimeout(() => setActionStatus('cleanup-logs', 'ready'), 3000);
      }
    } catch (error) {
      setActionStatus('cleanup-logs', 'ready');
    }
  };

  const setActionStatus = (actionId: string, status: 'ready' | 'running' | 'completed') => {
    setActions(prev => prev.map(action => 
      action.id === actionId ? { ...action, status } : action
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'running': return 'در حال اجرا...';
      case 'completed': return 'تکمیل شد';
      default: return 'آماده';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          اقدامات سریع مدیریتی
        </CardTitle>
        <CardDescription>
          عملیات مدیریتی و نگهداری سیستم
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => (
            <div 
              key={action.id}
              className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {action.icon}
                  <h3 className="font-medium">{action.title}</h3>
                  {action.badge && (
                    <Badge variant="destructive" className="text-xs">
                      {action.badge}
                    </Badge>
                  )}
                </div>
                <div className={`w-2 h-2 rounded-full ${getStatusColor(action.status)}`} />
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {action.description}
              </p>
              
              <div className="flex items-center justify-between">
                <Button
                  onClick={action.action}
                  disabled={action.status === 'running'}
                  size="sm"
                  variant={action.status === 'completed' ? 'outline' : 'default'}
                >
                  {action.status === 'running' && (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {getStatusText(action.status)}
                </Button>
                
                {action.status === 'completed' && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
