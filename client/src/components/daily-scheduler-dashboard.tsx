// 📅 DAILY AI SCHEDULER DASHBOARD - نمایش برنامه‌ریز هوشمند روزانه
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, TrendingUp, AlertTriangle, CheckCircle, Timer, User } from 'lucide-react';

interface ScheduleEntry {
  id: string;
  representativeId: number;
  representativeName: string;
  timeSlot: string;
  taskType: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  estimatedDuration: number;
  culturalContext: string;
  expectedOutcome: string;
  preparationNotes: string[];
  followUpRequired: boolean;
}

interface DailySchedule {
  date: string;
  scheduleId: string;
  generatedAt: string;
  totalEntries: number;
  estimatedWorkload: number;
  priorityBreakdown: {
    urgent: number;
    high: number;
    medium: number;
    low: number;
  };
  schedule: ScheduleEntry[];
  generalGuidance: {
    morningFocus: string;
    afternoonFocus: string;
    keyPriorities: string[];
    culturalTips: string[];
  };
  aiConfidence: number;
  basedOnPattern: string;
}

interface TeamWorkload {
  totalRepresentatives: number;
  activeRepresentatives: number;
  estimatedTotalHours: number;
  priorityDistribution: Record<string, number>;
  culturalConsiderations: string[];
  suggestionOptimizations: string[];
}

export function DailySchedulerDashboard() {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeView, setActiveView] = useState<'schedule' | 'workload' | 'stats'>('schedule');

  // Daily Schedule Query
  const { data: scheduleData, isLoading: scheduleLoading, refetch: refetchSchedule } = useQuery<{
    success: boolean;
    data: DailySchedule;
    message: string;
  }>({
    queryKey: ['/api/crm/scheduler/daily', selectedDate],
    queryFn: () => fetch(`/api/crm/scheduler/daily?date=${selectedDate}`).then(res => res.json()),
  });

  // Team Workload Query
  const { data: workloadData, isLoading: workloadLoading } = useQuery<{
    success: boolean;
    data: TeamWorkload;
    message: string;
  }>({
    queryKey: ['/api/crm/scheduler/workload']
  });

  // Scheduler Stats Query
  const { data: statsData, isLoading: statsLoading } = useQuery<{
    success: boolean;
    data: any;
  }>({
    queryKey: ['/api/crm/scheduler/stats']
  });

  const schedule = scheduleData?.data;
  const workload = workloadData?.data;
  const stats = statsData?.data;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500 text-white';
      case 'HIGH': return 'bg-orange-500 text-white';
      case 'MEDIUM': return 'bg-yellow-500 text-black';
      case 'LOW': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTaskTypeIcon = (taskType: string) => {
    switch (taskType) {
      case 'FINANCIAL_REVIEW': return '💰';
      case 'FOLLOW_UP': return '📞';
      case 'GENERAL_CONTACT': return '💬';
      default: return '📋';
    }
  };

  const formatTime = (timeSlot: string) => {
    return timeSlot.replace('-', ' تا ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">برنامه‌ریز هوشمند روزانه</h1>
            <p className="text-muted-foreground">تولید خودکار برنامه کاری بر اساس یادگیری ماشین</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button
            onClick={() => refetchSchedule()}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            بروزرسانی برنامه
          </Button>
        </div>
      </div>

      {/* View Navigation */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeView === 'schedule' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('schedule')}
          className="flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          برنامه روزانه
        </Button>
        <Button
          variant={activeView === 'workload' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('workload')}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          بار کاری تیم
        </Button>
        <Button
          variant={activeView === 'stats' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveView('stats')}
          className="flex items-center gap-2"
        >
          <TrendingUp className="h-4 w-4" />
          آمار برنامه‌ریز
        </Button>
      </div>

      {/* Schedule View */}
      {activeView === 'schedule' && (
        <div className="space-y-6">
          {scheduleLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : schedule ? (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل وظایف</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{schedule.totalEntries}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">بار کاری (ساعت)</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{schedule.estimatedWorkload}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">اعتماد هوش مصنوعی</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{schedule.aiConfidence}%</div>
                    <Progress value={schedule.aiConfidence} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">موارد فوری</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{schedule.priorityBreakdown.urgent}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Priority Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>توزیع اولویت</CardTitle>
                  <CardDescription>تقسیم‌بندی وظایف بر اساس اولویت</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{schedule.priorityBreakdown.urgent}</div>
                      <div className="text-sm text-muted-foreground">فوری</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{schedule.priorityBreakdown.high}</div>
                      <div className="text-sm text-muted-foreground">مهم</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{schedule.priorityBreakdown.medium}</div>
                      <div className="text-sm text-muted-foreground">متوسط</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{schedule.priorityBreakdown.low}</div>
                      <div className="text-sm text-muted-foreground">کم</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* General Guidance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>راهنمایی عمومی</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">تمرکز صبح:</h4>
                      <p className="text-sm text-muted-foreground">{schedule.generalGuidance.morningFocus}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">تمرکز بعدازظهر:</h4>
                      <p className="text-sm text-muted-foreground">{schedule.generalGuidance.afternoonFocus}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>اولویت‌های کلیدی</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {schedule.generalGuidance.keyPriorities.map((priority, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{priority}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Schedule Entries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    برنامه زمانی تفصیلی ({schedule.schedule.length} وظیفه)
                  </CardTitle>
                  <CardDescription>
                    {formatDate(schedule.date)} - بر اساس {schedule.basedOnPattern}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {schedule.schedule.map((entry, index) => (
                      <div key={entry.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{getTaskTypeIcon(entry.taskType)}</span>
                            <div>
                              <h4 className="font-semibold">{entry.representativeName}</h4>
                              <p className="text-sm text-muted-foreground">{formatTime(entry.timeSlot)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getPriorityColor(entry.priority)}>
                              {entry.priority}
                            </Badge>
                            <Badge variant="outline">{entry.estimatedDuration} دقیقه</Badge>
                            {entry.followUpRequired && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                نیاز به پیگیری
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <h5 className="font-medium mb-2">شرح وظیفه:</h5>
                            <p className="text-sm text-muted-foreground">{entry.description}</p>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">نتیجه مورد انتظار:</h5>
                            <p className="text-sm text-muted-foreground">{entry.expectedOutcome}</p>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h5 className="font-medium mb-2">زمینه فرهنگی:</h5>
                          <p className="text-sm text-muted-foreground">{entry.culturalContext}</p>
                        </div>

                        {entry.preparationNotes.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">نکات آماده‌سازی:</h5>
                            <ul className="text-sm space-y-1">
                              {entry.preparationNotes.map((note, noteIndex) => (
                                <li key={noteIndex} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                  {note}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">برنامه روزانه برای این تاریخ در دسترس نیست</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Workload View */}
      {activeView === 'workload' && (
        <div className="space-y-6">
          {workloadLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : workload ? (
            <>
              {/* Team Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل نمایندگان</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{workload.totalRepresentatives}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">نمایندگان فعال</CardTitle>
                    <User className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{workload.activeRepresentatives}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">کل ساعت کاری</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{workload.estimatedTotalHours}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">بهینه‌سازی‌ها</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{workload.suggestionOptimizations.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Optimization Suggestions */}
              {workload.suggestionOptimizations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>پیشنهادات بهینه‌سازی</CardTitle>
                    <CardDescription>راهنمایی‌هایی برای بهبود کارایی تیم</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {workload.suggestionOptimizations.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Cultural Considerations */}
              <Card>
                <CardHeader>
                  <CardTitle>ملاحظات فرهنگی</CardTitle>
                  <CardDescription>نکات مهم فرهنگی در مدیریت تیم</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workload.culturalConsiderations.map((consideration, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm">{consideration}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">اطلاعات بار کاری تیم در دسترس نیست</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats View */}
      {activeView === 'stats' && (
        <div className="space-y-6">
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>کل برنامه‌های تولید شده</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalSchedulesGenerated}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>میانگین وظایف روزانه</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.averageEntriesPerDay}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>وضعیت cache</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {stats.cacheStatus}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>آخرین تولید</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {stats.lastGenerationTime ? formatDate(stats.lastGenerationTime) : 'هنوز تولید نشده'}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">آمار برنامه‌ریز در دسترس نیست</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}