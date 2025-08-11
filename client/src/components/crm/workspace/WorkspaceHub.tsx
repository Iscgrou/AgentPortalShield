// DA VINCI v2.0 - EMPLOYEE WORKSPACE - Task Viewing & Completion Only
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  FileText, 
  Users,
  Target,
  Zap,
  RefreshCw,
  Eye,
  CheckCheck,
  BarChart3,
  MessageSquare,
  TrendingUp,
  Bell,
  Bot
} from 'lucide-react';
import RemindersPanel from './RemindersPanel';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface WorkspaceTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  dueDate: string;
  createdAt: string;
  isAiGenerated: boolean;
  culturalContext?: string;
}

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  aiGeneratedTasks: number;
}

export function WorkspaceHub() {
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch workspace tasks (assigned by manager)
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/workspace/tasks'],
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.tasks)) return data.tasks;
      return [];
    }
  });

  // Fetch task statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/workspace/stats'],
    select: (data: any) => {
      if (data && typeof data === 'object') return data;
      return { totalTasks: 0, completedTasks: 0, pendingTasks: 0, aiGeneratedTasks: 0 };
    }
  });

  // Mark task as completed
  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      fetch(`/api/workspace/tasks/${taskId}/complete`, { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workspace/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workspace/stats'] });
      toast({
        title: "وظیفه تکمیل شد",
        description: "وظیفه با موفقیت به عنوان انجام شده علامت‌گذاری شد",
      });
    }
  });

  const priorityColors = {
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    LOW: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  const statusColors = {
    PENDING: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
    CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30'
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
            میز کار کارمند DA VINCI v2.0
          </h1>
          <p className="text-gray-300 mt-2">مشاهده و تکمیل وظایف محول شده توسط مدیر</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            بروزرسانی
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">کل وظایف</CardTitle>
            <Target className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.totalTasks || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">تکمیل شده</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.completedTasks || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">در انتظار</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.pendingTasks || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">هوش مصنوعی</CardTitle>
            <Zap className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.aiGeneratedTasks || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">نمای کلی</TabsTrigger>
          <TabsTrigger value="tasks">وظایف من</TabsTrigger>
          <TabsTrigger value="reminders">یادآورها</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Tasks */}
            <Card className="lg:col-span-2 bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  آخرین وظایف
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasksLoading ? (
                  <div className="space-y-3 animate-pulse">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-gray-800/50 rounded"></div>
                    ))}
                  </div>
                ) : !Array.isArray(tasks) || tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                    <p className="text-gray-400">هنوز وظیفه‌ای تعریف نشده</p>
                    <p className="text-sm mt-2 text-gray-500">مدیر شما وظایف را از طریق تنظیمات تعریف می‌کند</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Array.isArray(tasks) && tasks.slice(0, 5).map((task: WorkspaceTask) => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-white">{task.title}</h4>
                            {task.isAiGenerated && <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-400">AI</Badge>}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">{task.assignedTo}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                            {task.priority === 'HIGH' ? 'بالا' : task.priority === 'MEDIUM' ? 'متوسط' : 'پایین'}
                          </Badge>
                          {task.status !== 'COMPLETED' && (
                            <Button
                              size="sm"
                              onClick={() => completeTaskMutation.mutate(task.id)}
                              disabled={completeTaskMutation.isPending}
                              className="text-xs"
                            >
                              <CheckCheck className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Status */}
            <Card className="bg-black/40 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  وضعیت AI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">موتور AI</span>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">xAI Grok-4</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">فرهنگ سازمانی</span>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">فارسی</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">آخرین به‌روزرسانی</span>
                    <span className="text-sm text-gray-400">مدیریت شده توسط مدیر</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasksLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-black/40 border-gray-700">
                  <CardHeader>
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="animate-pulse space-y-2">
                      <div className="h-3 bg-gray-700 rounded"></div>
                      <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : !Array.isArray(tasks) || tasks.length === 0 ? (
              <div className="col-span-full">
                <Card className="bg-black/40 border-gray-700">
                  <CardContent className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-lg font-semibold text-white mb-2">هنوز وظیفه‌ای محول نشده</h3>
                    <p className="text-gray-400">مدیر شما وظایف را از طریق بخش تنظیمات تعریف خواهد کرد</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              Array.isArray(tasks) && tasks.map((task: WorkspaceTask) => (
                <Card key={task.id} className="bg-black/40 border-gray-700 hover:bg-black/60 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <span>{task.title}</span>
                        {task.isAiGenerated && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            <Zap className="w-3 h-3 ml-1" />
                            AI
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                          {task.priority === 'HIGH' ? 'بالا' : task.priority === 'MEDIUM' ? 'متوسط' : 'پایین'}
                        </Badge>
                        <Badge className={`text-xs ${statusColors[task.status]}`}>
                          {task.status === 'PENDING' ? 'در انتظار' : task.status === 'IN_PROGRESS' ? 'در حال انجام' : task.status === 'COMPLETED' ? 'تکمیل شده' : 'لغو شده'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {task.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>مسئول: {task.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>مهلت: {new Date(task.dueDate).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </div>
                    {task.status !== 'COMPLETED' && (
                      <div className="pt-2">
                        <Button
                          onClick={() => completeTaskMutation.mutate(task.id)}
                          disabled={completeTaskMutation.isPending}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          <CheckCheck className="w-4 h-4 ml-2" />
                          {completeTaskMutation.isPending ? 'در حال تکمیل...' : 'علامت‌گذاری به عنوان انجام شده'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card className="bg-black/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">گزارش عملکرد من</CardTitle>
              <CardDescription>نمایش آمار و تحلیل عملکرد وظایف انجام شده</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                <h3 className="text-lg font-semibold text-white mb-2">گزارشات عملکردی</h3>
                <p className="text-gray-400">این بخش برای نمایش گزارشات تحلیلی عملکرد کارمندان طراحی شده است</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="mt-6">
          <RemindersPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}