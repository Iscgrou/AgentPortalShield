// DA VINCI v2.0 - MANAGER WORKSPACE - AI-Powered Task Creation Hub
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  PauseCircle,
  Trash2,
  Edit,
  Filter,
  Brain,
  Zap,
  Target,
  MessageSquare,
  Users,
  Settings,
  Database,
  TrendingUp
} from 'lucide-react';

interface TaskCreationRequest {
  title: string;
  description: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignedTo: string;
  dueDate: string;
  taskType: 'MANUAL' | 'AI_GENERATED';
}

interface AITaskGenerationRequest {
  representative_focus?: string;
  complexity_level?: 'SIMPLE' | 'MEDIUM' | 'COMPLEX';
  task_count?: number;
  priority_distribution?: string;
  cultural_context?: boolean;
}

export function ManagerWorkspace() {
  const [activeTab, setActiveTab] = useState('task-creation');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showAITaskForm, setShowAITaskForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Manual Task Creation Form State
  const [newTask, setNewTask] = useState<TaskCreationRequest>({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedTo: '',
    dueDate: '',
    taskType: 'MANUAL'
  });

  // AI Task Generation Form State
  const [aiTaskRequest, setAiTaskRequest] = useState<AITaskGenerationRequest>({
    representative_focus: '',
    complexity_level: 'MEDIUM',
    task_count: 5,
    priority_distribution: 'balanced',
    cultural_context: true
  });

  // Fetch existing tasks
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

  // Manual Task Creation Mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: TaskCreationRequest) => 
      fetch('/api/workspace/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(taskData)
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workspace/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workspace/stats'] });
      toast({
        title: "وظیفه ایجاد شد",
        description: "وظیفه جدید با موفقیت برای کارمند تعریف شد",
      });
      setNewTask({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assignedTo: '',
        dueDate: '',
        taskType: 'MANUAL'
      });
      setShowNewTaskForm(false);
    },
    onError: () => {
      toast({
        title: "خطا در ایجاد وظیفه",
        description: "مشکلی در ایجاد وظیفه جدید پیش آمد",
        variant: "destructive",
      });
    }
  });

  // AI Task Generation Mutation  
  const generateAITasksMutation = useMutation({
    mutationFn: (requestData: AITaskGenerationRequest) => 
      fetch('/api/workspace/tasks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      }).then(res => res.json()),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/workspace/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workspace/stats'] });
      toast({
        title: "وظایف هوشمند تولید شد",
        description: `${data.metadata?.totalGenerated || 0} وظیفه جدید با هوش مصنوعی تولید شد`,
      });
      setShowAITaskForm(false);
    },
    onError: () => {
      toast({
        title: "خطا در تولید وظایف هوشمند",
        description: "مشکلی در تولید وظایف با هوش مصنوعی پیش آمد",
        variant: "destructive",
      });
    }
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => 
      fetch(`/api/workspace/tasks/${taskId}`, { method: 'DELETE' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/workspace/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/workspace/stats'] });
      toast({
        title: "وظیفه حذف شد",
        description: "وظیفه با موفقیت حذف شد",
      });
    }
  });

  const handleCreateManualTask = () => {
    if (!newTask.title.trim() || !newTask.assignedTo.trim()) {
      toast({
        title: "اطلاعات ناقص",
        description: "لطفاً عنوان وظیفه و مسئول انجام را وارد کنید",
        variant: "destructive",
      });
      return;
    }
    createTaskMutation.mutate(newTask);
  };

  const handleGenerateAITasks = () => {
    generateAITasksMutation.mutate(aiTaskRequest);
  };

  const priorityColors = {
    HIGH: 'bg-red-500/20 text-red-400 border-red-500/30',
    MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    LOW: 'bg-green-500/20 text-green-400 border-green-500/30'
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/40 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {stats?.totalTasks || 0}
            </div>
            <div className="text-sm text-gray-300">کل وظایف</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {stats?.pendingTasks || 0}
            </div>
            <div className="text-sm text-gray-300">در انتظار</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {stats?.completedTasks || 0}
            </div>
            <div className="text-sm text-gray-300">تکمیل شده</div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-gray-700">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {stats?.aiGeneratedTasks || 0}
            </div>
            <div className="text-sm text-gray-300">هوش مصنوعی</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/30 border border-gray-700">
          <TabsTrigger value="task-creation" className="data-[state=active]:bg-blue-600">
            <Target className="w-4 h-4 ml-2" />
            ایجاد وظیفه
          </TabsTrigger>
          <TabsTrigger value="ai-generation" className="data-[state=active]:bg-purple-600">
            <Brain className="w-4 h-4 ml-2" />
            تولید هوشمند
          </TabsTrigger>
          <TabsTrigger value="task-management" className="data-[state=active]:bg-green-600">
            <Users className="w-4 h-4 ml-2" />
            مدیریت وظایف
          </TabsTrigger>
        </TabsList>

        {/* Manual Task Creation Tab */}
        <TabsContent value="task-creation" className="mt-6">
          <Card className="bg-black/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Plus className="w-5 h-5" />
                ایجاد وظیفه دستی
              </CardTitle>
              <CardDescription>تعریف وظیفه جدید برای کارمندان</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">عنوان وظیفه</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="عنوان وظیفه را وارد کنید..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">مسئول انجام</label>
                  <Input
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    placeholder="نام کارمند..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">شرح وظیفه</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="جزئیات وظیفه را شرح دهید..."
                  className="bg-gray-800 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">اولویت</label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HIGH">بالا</SelectItem>
                      <SelectItem value="MEDIUM">متوسط</SelectItem>
                      <SelectItem value="LOW">پایین</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">مهلت انجام</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateManualTask}
                  disabled={createTaskMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  {createTaskMutation.isPending ? 'در حال ایجاد...' : 'ایجاد وظیفه'}
                </Button>
                <Button
                  onClick={() => setNewTask({
                    title: '',
                    description: '',
                    priority: 'MEDIUM',
                    assignedTo: '',
                    dueDate: '',
                    taskType: 'MANUAL'
                  })}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  پاک کردن
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Task Generation Tab */}
        <TabsContent value="ai-generation" className="mt-6">
          <Card className="bg-black/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-400" />
                تولید وظایف هوشمند
              </CardTitle>
              <CardDescription>استفاده از هوش مصنوعی برای تولید وظایف بهینه</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">فکوس بر نماینده</label>
                  <Input
                    value={aiTaskRequest.representative_focus || ''}
                    onChange={(e) => setAiTaskRequest({ ...aiTaskRequest, representative_focus: e.target.value })}
                    placeholder="نام نماینده خاص (اختیاری)..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">سطح پیچیدگی</label>
                  <Select 
                    value={aiTaskRequest.complexity_level} 
                    onValueChange={(value: any) => setAiTaskRequest({ ...aiTaskRequest, complexity_level: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SIMPLE">ساده</SelectItem>
                      <SelectItem value="MEDIUM">متوسط</SelectItem>
                      <SelectItem value="COMPLEX">پیچیده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">تعداد وظایف</label>
                  <Input
                    type="number"
                    min="1"
                    max="20"
                    value={aiTaskRequest.task_count || 5}
                    onChange={(e) => setAiTaskRequest({ ...aiTaskRequest, task_count: parseInt(e.target.value) })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">توزیع اولویت</label>
                  <Select 
                    value={aiTaskRequest.priority_distribution} 
                    onValueChange={(value: any) => setAiTaskRequest({ ...aiTaskRequest, priority_distribution: value })}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">متعادل</SelectItem>
                      <SelectItem value="high-priority">اولویت بالا</SelectItem>
                      <SelectItem value="mixed">ترکیبی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cultural-context"
                  checked={aiTaskRequest.cultural_context}
                  onChange={(e) => setAiTaskRequest({ ...aiTaskRequest, cultural_context: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="cultural-context" className="text-sm text-gray-300">
                  اعمال فرهنگ ایرانی و تقویم شمسی
                </label>
              </div>

              <div className="bg-purple-950/30 border border-purple-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">پیش‌نمایش AI</span>
                </div>
                <p className="text-xs text-gray-400">
                  هوش مصنوعی بر اساس تنظیمات شما، وظایف بهینه‌ای تولید خواهد کرد که شامل:
                  تحلیل عملکرد نمایندگان، بررسی فروش، فالوآپ مشتریان، و بروزرسانی اطلاعات می‌باشد.
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleGenerateAITasks}
                  disabled={generateAITasksMutation.isPending}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Brain className="w-4 h-4 ml-2" />
                  {generateAITasksMutation.isPending ? 'در حال تولید...' : 'تولید وظایف هوشمند'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Task Management Tab */}
        <TabsContent value="task-management" className="mt-6">
          <Card className="bg-black/40 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5" />
                مدیریت وظایف موجود
              </CardTitle>
              <CardDescription>نمایش و مدیریت وظایف تعریف شده</CardDescription>
            </CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-800/50 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : !Array.isArray(tasks) || tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-lg font-semibold text-white mb-2">هنوز وظیفه‌ای تعریف نشده</h3>
                  <p className="text-gray-400">از تب‌های بالا برای ایجاد وظایف جدید استفاده کنید</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white">{task.title}</h4>
                          {task.isAiGenerated && (
                            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                              <Zap className="w-3 h-3 ml-1" />
                              AI
                            </Badge>
                          )}
                          <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                            {task.priority === 'HIGH' ? 'بالا' : task.priority === 'MEDIUM' ? 'متوسط' : 'پایین'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">مسئول: {task.assignedTo}</p>
                        <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          disabled={deleteTaskMutation.isPending}
                          className="text-red-400 border-red-600 hover:bg-red-950"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}