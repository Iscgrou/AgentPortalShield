import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Bot, 
  Brain, 
  Users, 
  Search, 
  Zap, 
  Eye, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  User,
  Activity,
  Target,
  Lightbulb,
  BarChart3,
  RefreshCw,
  Settings
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, toPersianDigits } from "@/lib/persian-date";
import { Skeleton } from "@/components/ui/skeleton";

interface Representative {
  id: number;
  code: string;
  name: string;
  ownerName: string;
  totalDebt: string;
  totalSales: string;
  isActive: boolean;
}

interface AIProfile {
  representativeId: number;
  profile: {
    communicationStyle: string;
    culturalAdaptation: string;
    trustLevel: string;
    businessAptitude?: string;
    riskProfile?: string;
  };
  generatedAt: string;
  aiVersion: string;
}

interface CulturalInsight {
  type: string;
  title: string;
  description: string;
  confidence: number;
  priority?: string;
  actionable?: boolean;
}

interface AIInsights {
  representativeId: number;
  insights: CulturalInsight[];
  totalInsights: number;
  averageConfidence: number;
  generatedAt: string;
}

interface AIStatus {
  status: string;
  engine: string;
  culturalIntelligence?: string;
  version: string;
  available: boolean;
  model: string;
  responseTime: number;
  lastResponse: string;
  capabilities: string[];
}

export default function AIAssistant() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedRepresentative, setSelectedRepresentative] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch representatives
  const { data: representatives = [] } = useQuery<Representative[]>({
    queryKey: ["/api/representatives"],
    select: (data: any) => {
      if (Array.isArray(data)) return data;
      if (data && Array.isArray(data.data)) return data.data;
      return [];
    }
  });

  // Fetch AI engine status
  const { data: aiStatus } = useQuery<AIStatus>({
    queryKey: ["/api/ai/status"],
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Fetch AI profile for selected representative
  const { data: aiProfile, refetch: refetchProfile } = useQuery<AIProfile>({
    queryKey: ["/api/ai/profile", selectedRepresentative],
    enabled: !!selectedRepresentative,
    retry: false
  });

  // Fetch cultural insights for selected representative
  const { data: culturalInsights, refetch: refetchInsights } = useQuery<AIInsights>({
    queryKey: ["/api/ai/insights", selectedRepresentative],
    enabled: !!selectedRepresentative,
    retry: false
  });

  // Generate AI profile mutation
  const generateProfileMutation = useMutation({
    mutationFn: async (representativeId: string) => {
      const response = await apiRequest(`/api/ai/profile/${representativeId}`, {
        method: 'POST'
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "پروفایل تولید شد",
        description: "پروفایل روانشناختی با موفقیت تولید شد",
      });
      refetchProfile();
      setIsGeneratingProfile(false);
    },
    onError: (error: any) => {
      toast({
        title: "خطا در تولید پروفایل",
        description: error.message || "عملیات ناموفق بود",
        variant: "destructive"
      });
      setIsGeneratingProfile(false);
    }
  });

  const handleGenerateProfile = () => {
    if (!selectedRepresentative) {
      toast({
        title: "نماینده انتخاب نشده",
        description: "لطفاً نماینده مورد نظر را انتخاب کنید",
        variant: "destructive"
      });
      return;
    }
    setIsGeneratingProfile(true);
    generateProfileMutation.mutate(selectedRepresentative);
  };

  const handleGenerateInsights = () => {
    if (!selectedRepresentative) {
      toast({
        title: "نماینده انتخاب نشده",
        description: "لطفاً نماینده مورد نظر را انتخاب کنید",
        variant: "destructive"
      });
      return;
    }
    setIsGeneratingInsights(true);
    refetchInsights().finally(() => setIsGeneratingInsights(false));
  };

  const getProfileBadgeColor = (value: string) => {
    switch (value) {
      case 'high':
      case 'professional':
      case 'traditional':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case 'medium':
      case 'casual':
      case 'modern':
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case 'low':
      case 'informal':
      case 'progressive':
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'cultural': return Brain;
      case 'communication': return MessageSquare;
      case 'business': return Target;
      case 'behavioral': return User;
      default: return Lightbulb;
    }
  };

  const filteredRepresentatives = representatives.filter(rep =>
    rep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            دستیار هوشمند
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            تحلیل روانشناختی و فرهنگی نمایندگان با هوش مصنوعی
          </p>
        </div>
        <div className="flex items-center gap-2">
          {aiStatus?.status === 'operational' ? (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              <CheckCircle className="w-3 h-3 ml-1" />
              فعال
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              <AlertTriangle className="w-3 h-3 ml-1" />
              غیرفعال
            </Badge>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">داشبورد هوشمند</TabsTrigger>
          <TabsTrigger value="profiles">پروفایل‌های روانشناختی</TabsTrigger>
          <TabsTrigger value="insights">بینش‌های فرهنگی</TabsTrigger>
          <TabsTrigger value="analytics">تحلیل عملکرد</TabsTrigger>
        </TabsList>

        {/* AI Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* AI Engine Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                وضعیت موتور هوش مصنوعی
              </CardTitle>
            </CardHeader>
            <CardContent>
              {aiStatus ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <Brain className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <div className="font-semibold">{aiStatus.engine}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">نسخه {aiStatus.version}</div>
                  </div>
                  
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <Zap className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <div className="font-semibold">{toPersianDigits((aiStatus.capabilities?.length || 0).toString())}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">قابلیت</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <div className="font-semibold">{aiStatus.culturalIntelligence || 'فارسی'}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">زبان</div>
                  </div>
                  
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <Activity className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                    <div className="font-semibold">{toPersianDigits(Math.round(aiStatus.responseTime / 1000).toString())}s</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">زمان پاسخ</div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Capabilities */}
          {aiStatus && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>قابلیت‌های هوش مصنوعی</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(aiStatus.capabilities || []).map((capability, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm">{capability}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>زمینه‌های فرهنگی</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm">هوش فرهنگی فارسی</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm">تحلیل روانشناختی نمایندگان</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm">بینش‌های کسب‌وکار</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Profiles Tab */}
        <TabsContent value="profiles" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Representative Selection */}
            <Card>
              <CardHeader>
                <CardTitle>انتخاب نماینده برای تحلیل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="جستجو نماینده..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                <Select value={selectedRepresentative} onValueChange={setSelectedRepresentative}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب نماینده" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredRepresentatives.filter(rep => rep.id && rep.code).map((rep) => (
                      <SelectItem key={rep.id} value={rep.id.toString()}>
                        {rep.name} ({rep.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleGenerateProfile}
                  disabled={!selectedRepresentative || isGeneratingProfile}
                  className="w-full"
                >
                  {isGeneratingProfile ? (
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Brain className="w-4 h-4 ml-2" />
                  )}
                  تولید پروفایل روانشناختی
                </Button>
              </CardContent>
            </Card>

            {/* AI Profile Results */}
            {selectedRepresentative && (
              <Card>
                <CardHeader>
                  <CardTitle>پروفایل روانشناختی</CardTitle>
                </CardHeader>
                <CardContent>
                  {aiProfile ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">سبک ارتباط:</span>
                        <Badge className={getProfileBadgeColor(aiProfile.profile.communicationStyle)}>
                          {aiProfile.profile.communicationStyle}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">انطباق فرهنگی:</span>
                        <Badge className={getProfileBadgeColor(aiProfile.profile.culturalAdaptation)}>
                          {aiProfile.profile.culturalAdaptation}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">سطح اعتماد:</span>
                        <Badge className={getProfileBadgeColor(aiProfile.profile.trustLevel)}>
                          {aiProfile.profile.trustLevel}
                        </Badge>
                      </div>

                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                        تولید شده در: {new Date(aiProfile.generatedAt).toLocaleDateString('fa-IR')}
                        <br />
                        نسخه AI: {aiProfile.aiVersion}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      برای مشاهده پروفایل، ابتدا یک نماینده انتخاب کرده و پروفایل را تولید کنید
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تولید بینش‌های فرهنگی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedRepresentative} onValueChange={setSelectedRepresentative}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب نماینده" />
                  </SelectTrigger>
                  <SelectContent>
                    {representatives.filter(rep => rep.id && rep.code).map((rep) => (
                      <SelectItem key={rep.id} value={rep.id.toString()}>
                        {rep.name} ({rep.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button 
                  onClick={handleGenerateInsights}
                  disabled={!selectedRepresentative || isGeneratingInsights}
                  className="w-full"
                >
                  {isGeneratingInsights ? (
                    <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
                  ) : (
                    <Lightbulb className="w-4 h-4 ml-2" />
                  )}
                  تولید بینش‌های فرهنگی
                </Button>

                {culturalInsights && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span>تعداد بینش‌ها:</span>
                        <span className="font-semibold">{toPersianDigits(culturalInsights.totalInsights.toString())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>میانگین اعتماد:</span>
                        <span className="font-semibold">{toPersianDigits((culturalInsights.averageConfidence * 100).toFixed(1))}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cultural Insights Results */}
            {culturalInsights && (
              <Card>
                <CardHeader>
                  <CardTitle>بینش‌های فرهنگی</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {culturalInsights.insights.map((insight, index) => {
                      const IconComponent = getInsightIcon(insight.type);
                      return (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <h4 className="font-medium text-sm">{insight.title}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {toPersianDigits((insight.confidence * 100).toFixed(0))}%
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {insight.description}
                              </p>
                              <div className="mt-2">
                                <Progress 
                                  value={insight.confidence * 100} 
                                  className="h-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      پروفایل‌های تولید شده
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {toPersianDigits("0")}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      بینش‌های فرهنگی
                    </p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {toPersianDigits("0")}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      میانگین دقت
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {culturalInsights ? toPersianDigits((culturalInsights.averageConfidence * 100).toFixed(1)) + "%" : "-"}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>تحلیل عملکرد سیستم</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <Bot className="h-4 w-4" />
                <AlertDescription>
                  سیستم هوش مصنوعی آماده تحلیل روانشناختی و فرهنگی نمایندگان است. 
                  برای شروع، یک نماینده انتخاب کرده و پروفایل یا بینش‌های مربوطه را تولید کنید.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}