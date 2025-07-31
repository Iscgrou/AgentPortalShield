// 📋 CRM TASKS MANAGEMENT - Intelligent Task System
import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Brain,
  Plus,
  Filter,
  Calendar,
  User,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCrmAuth } from '@/hooks/use-crm-auth';
import { apiRequest } from '@/lib/queryClient';

interface CrmTask {
  id: string;
  taskId: string;
  representativeId: number;
  representativeName: string;
  aiGeneratedByModel: string;
  taskType: 'FOLLOW_UP' | 'DEBT_COLLECTION' | 'RELATIONSHIP_BUILDING' | 'PERFORMANCE_CHECK';
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'ESCALATED';
  title: string;
  description: string;
  expectedOutcome: string;
  dueDate: string;
  aiConfidenceScore: number;
  xpReward: number;
  difficultyLevel: number;
  createdAt: string;
}

interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  completedToday: number;
  overdueTasks: number;
  avgCompletionTime: number;
  successRate: number;
}

export default function CrmTasks() {
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { hasPermission } = useCrmAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tasks, isLoading } = useQuery<CrmTask[]>({
    queryKey: ['/api/crm/tasks'],
    refetchInterval: 30000
  });

  const { data: taskStats } = useQuery<TaskStats>({
    queryKey: ['/api/crm/tasks/stats']
  });

  const generateTaskMutation = useMutation({
    mutationFn: async (representativeId: number) => {
      const response = await apiRequest('POST', `/api/crm/tasks/generate`, { representativeId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/tasks'] });
      toast({
        title: "وظیفه جدید تولید شد",
        description: "وظیفه هوشمند با موفقیت ایجاد شد",
      });
    }
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ taskId, outcome, notes }: { taskId: string; outcome: string; notes: string }) => {
      const response = await apiRequest('POST', `/api/crm/tasks/${taskId}/complete`, { outcome, notes });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/tasks'] });
      toast({
        title: "وظیفه تکمیل شد",
        description: "نتیجه وظیفه ثبت گردید",
      });
    }
  });

  const filteredTasks = tasks?.filter(task => {
    return (
      (taskTypeFilter === 'all' || task.taskType === taskTypeFilter) &&
      (statusFilter === 'all' || task.status === statusFilter) &&
      (priorityFilter === 'all' || task.priority === priorityFilter)
    );
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge variant="destructive">فوری</Badge>;
      case 'HIGH':
        return <Badge variant="default" className="bg-orange-600">بالا</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary">متوسط</Badge>;
      case 'LOW':
        return <Badge variant="outline">پایین</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ASSIGNED':
        return <Badge variant="secondary">تخصیص یافته</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="default" className="bg-blue-600">در حال انجام</Badge>;
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-600">تکمیل شده</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">ناموفق</Badge>;
      case 'ESCALATED':
        return <Badge variant="default" className="bg-purple-600">ارجاع شده</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTaskTypeLabel = (type: string) => {
    switch (type) {
      case 'FOLLOW_UP':
        return 'پیگیری';
      case 'DEBT_COLLECTION':
        return 'وصول مطالبات';
      case 'RELATIONSHIP_BUILDING':
        return 'توسعه ارتباط';
      case 'PERFORMANCE_CHECK':
        return 'بررسی عملکرد';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">در حال بارگذاری وظایف...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/crm/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 ml-1" />
              بازگشت به داشبورد
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6" />
              مدیریت وظایف هوشمند
            </h1>
            <p className="text-muted-foreground">
              {filteredTasks?.length || 0} وظیفه از مجموع {tasks?.length || 0}
            </p>
          </div>
        </div>

        {hasPermission('crm_tasks', 'CREATE') && (
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Brain className="h-4 w-4" />
                تولید وظیفه هوشمند
              </Button>
            </DialogTrigger>
            <DialogContent dir="rtl">
              <DialogHeader>
                <DialogTitle>تولید وظیفه هوشمند</DialogTitle>
                <DialogDescription>
                  AI موتور هوش مصنوعی فارسی وظیفه مناسب تولید خواهد کرد
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>نماینده مورد نظر</Label>
                  <Select onValueChange={(value) => {
                    if (value) {
                      generateTaskMutation.mutate(parseInt(value));
                      setShowCreateDialog(false);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب نماینده" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">نماینده نمونه</SelectItem>
                      <SelectItem value="2">نماینده ۲</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      {taskStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">کل وظایف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.totalTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">در انتظار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{taskStats.pendingTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">تکمیل امروز</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{taskStats.completedToday}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">عقب مانده</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{taskStats.overdueTasks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">میانگین زمان</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.avgCompletionTime}h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">نرخ موفقیت</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{taskStats.successRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            فیلترهای هوشمند
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={taskTypeFilter} onValueChange={setTaskTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع وظیفه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه انواع</SelectItem>
                <SelectItem value="FOLLOW_UP">پیگیری</SelectItem>
                <SelectItem value="DEBT_COLLECTION">وصول مطالبات</SelectItem>
                <SelectItem value="RELATIONSHIP_BUILDING">توسعه ارتباط</SelectItem>
                <SelectItem value="PERFORMANCE_CHECK">بررسی عملکرد</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                <SelectItem value="ASSIGNED">تخصیص یافته</SelectItem>
                <SelectItem value="IN_PROGRESS">در حال انجام</SelectItem>
                <SelectItem value="COMPLETED">تکمیل شده</SelectItem>
                <SelectItem value="FAILED">ناموفق</SelectItem>
                <SelectItem value="ESCALATED">ارجاع شده</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="اولویت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه اولویت‌ها</SelectItem>
                <SelectItem value="URGENT">فوری</SelectItem>
                <SelectItem value="HIGH">بالا</SelectItem>
                <SelectItem value="MEDIUM">متوسط</SelectItem>
                <SelectItem value="LOW">پایین</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks?.map(task => (
          <Card key={task.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-purple-600" />
                  <div>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {task.representativeName} • {getTaskTypeLabel(task.taskType)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{task.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>سررسید: {new Date(task.dueDate).toLocaleDateString('fa-IR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>اعتماد AI: {task.aiConfidenceScore}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>سختی: {task.difficultyLevel}/5</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  <span>امتیاز: {task.xpReward} XP</span>
                </div>
              </div>

              {task.expectedOutcome && (
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-sm"><strong>نتیجه مورد انتظار:</strong> {task.expectedOutcome}</p>
                </div>
              )}

              {task.status === 'ASSIGNED' && hasPermission('crm_tasks', 'UPDATE') && (
                <div className="flex gap-2">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => completeTaskMutation.mutate({ 
                      taskId: task.taskId, 
                      outcome: 'SUCCESS', 
                      notes: 'تکمیل شده' 
                    })}
                  >
                    تکمیل موفق
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => completeTaskMutation.mutate({ 
                      taskId: task.taskId, 
                      outcome: 'NEEDS_FOLLOW_UP', 
                      notes: 'نیاز به پیگیری' 
                    })}
                  >
                    نیاز به پیگیری
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTasks?.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">هیچ وظیفه‌ای با این معیارها یافت نشد</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}