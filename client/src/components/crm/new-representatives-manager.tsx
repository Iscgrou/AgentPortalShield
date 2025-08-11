import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Search, Plus, Eye, Edit2, Phone, TrendingUp,
  BarChart3, Activity, AlertTriangle, CheckCircle, Star
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import RepresentativeModal from './representative-modal';
import CreateRepresentativeModal from './create-representative-modal';

// Types
interface Representative {
  id: number;
  code: string;
  name: string;
  ownerName: string;
  panelUsername: string;
  phone: string;
  publicId: string;
  salesPartnerId: string;
  isActive: boolean;
  totalDebt: string;
  totalSales: string;
  credit: string;
  createdAt: string;
  updatedAt: string;
}

interface RepresentativeStats {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  totalSales: number;
  totalDebt: number;
  avgPerformance: number;
  topPerformers: Array<{
    id: number;
    name: string;
    code: string;
    totalSales: number;
    isActive: boolean;
  }>;
  riskAlerts: number;
}

// Currency formatter
const formatCurrency = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('fa-IR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num) + ' تومان';
};

export default function NewRepresentativesManager() {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedRep, setSelectedRep] = useState<Representative | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch statistics with aggressive caching
  const { data: stats, isLoading: statsLoading } = useQuery<RepresentativeStats>({
    queryKey: ['/api/crm/representatives/statistics'],
    staleTime: 10 * 60 * 1000, // 10 minutes - aggressive caching for performance
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchInterval: false, // Disable auto-refresh to prevent constant re-renders
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
  });

  // Fetch representatives with optimized caching and pagination
  const { data: repsData, isLoading: repsLoading, error: repsError } = useQuery({
    queryKey: ['/api/crm/representatives', currentPage, searchTerm, statusFilter, sortBy],
    queryFn: () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '9',
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(sortBy && { sortBy })
      });
      return fetch(`/api/crm/representatives?${params}`, {
        credentials: 'include'
      }).then(res => {
        if (!res.ok) throw new Error('خطا در دریافت اطلاعات نمایندگان');
        return res.json();
      });
    },
    staleTime: 8 * 60 * 1000, // 8 minutes for representative data
    gcTime: 12 * 60 * 1000, // Keep in cache for 12 minutes
    refetchInterval: false, // Disable auto-refresh to prevent constant re-renders
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
    refetchOnMount: false, // Don't automatically refetch on mount if data exists
  });

  // Extract representatives and pagination from response
  const representatives = (repsData as any)?.data || [];
  const pagination = (repsData as any)?.pagination || { page: 1, totalPages: 1, totalCount: 0 };

  // Create representative mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/crm/representatives', {
      method: 'POST',
      data: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/representatives'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/representatives/statistics'] });
      toast({ title: 'نماینده جدید با موفقیت ایجاد شد' });
      setShowCreateModal(false);
    },
    onError: (error: any) => {
      toast({ 
        title: 'خطا در ایجاد نماینده', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Update representative mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => apiRequest(`/api/crm/representatives/${id}`, {
      method: 'PUT',
      data: data,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/representatives'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/representatives/statistics'] });
      toast({ title: 'اطلاعات نماینده بروزرسانی شد' });
      setShowModal(false);
      setSelectedRep(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'خطا در بروزرسانی', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  // Handle representative actions
  const handleViewRep = async (rep: Representative) => {
    try {
      setSelectedRep(rep);
      setIsEditing(false);
      setShowModal(true);
      
      // Optionally fetch additional details if needed
      // const detailData = await apiRequest(`/api/crm/representatives/${rep.id}`);
      // setSelectedRep({ ...rep, ...detailData });
    } catch (error) {
      toast({ 
        title: 'خطا در دریافت اطلاعات', 
        variant: 'destructive' 
      });
    }
  };

  const handleEditRep = (rep: Representative) => {
    setSelectedRep(rep);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleCallRep = (rep: Representative) => {
    if (rep.phone) {
      window.open(`tel:${rep.phone}`, '_self');
      toast({ title: `در حال تماس با ${rep.name}` });
    } else {
      toast({ 
        title: 'شماره تماس موجود نیست', 
        variant: 'destructive' 
      });
    }
  };

  const handleCreateRep = (data: any) => {
    createMutation.mutate(data);
  };

  const handleUpdateRep = (data: any) => {
    if (selectedRep) {
      updateMutation.mutate({ id: selectedRep.id, ...data });
    }
  };



  if (statsLoading || repsLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">مدیریت نمایندگان</h1>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 ml-2" />
          نماینده جدید
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-black/30 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">کل نمایندگان</p>
                <p className="text-2xl font-bold text-white">{stats?.totalCount || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">نمایندگان فعال</p>
                <p className="text-2xl font-bold text-green-400">{stats?.activeCount || 0}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">کل فروش</p>
                <p className="text-2xl font-bold text-blue-400">
                  {formatCurrency(stats?.totalSales || 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">هشدارهای ریسک</p>
                <p className="text-2xl font-bold text-red-400">{stats?.riskAlerts || 0}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 bg-black/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
            <BarChart3 className="w-4 h-4 ml-2" />
            نمای کلی
          </TabsTrigger>
          <TabsTrigger value="grid" className="data-[state=active]:bg-white/20">
            <Users className="w-4 h-4 ml-2" />
            فهرست نمایندگان
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="w-5 h-5 ml-2 text-yellow-400" />
                  برترین نمایندگان
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats?.topPerformers?.map((rep, index) => (
                    <div key={rep.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-black font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{rep.name}</p>
                          <p className="text-gray-400 text-sm">کد: {rep.code}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-green-400 font-semibold">
                          {formatCurrency(rep.totalSales)}
                        </p>
                        <Badge variant={rep.isActive ? "default" : "secondary"} className="text-xs">
                          {rep.isActive ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Analytics */}
            <Card className="bg-black/20 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="w-5 h-5 ml-2 text-blue-400" />
                  تحلیل عملکرد
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">نرخ فعالیت</span>
                      <span className="text-white">{stats?.avgPerformance || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${stats?.avgPerformance || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">سطح سلامت سیستم</span>
                      <span className="text-white">85%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-[85%] transition-all"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Grid Tab */}
        <TabsContent value="grid" className="space-y-4">
          {/* Search and Filters */}
          <Card className="bg-black/30 border-white/10">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="جستجو بر اساس نام، کد یا مالک..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white/10 border-white/20 text-white pr-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded-md text-sm"
                  >
                    <option value="name" className="bg-gray-800">نام</option>
                    <option value="totalSales" className="bg-gray-800">فروش</option>
                    <option value="totalDebt" className="bg-gray-800">بدهی</option>
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white px-3 py-2 rounded-md text-sm"
                  >
                    <option value="all" className="bg-gray-800">همه نمایندگان</option>
                    <option value="active" className="bg-gray-800">فعال</option>
                    <option value="inactive" className="bg-gray-800">غیرفعال</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {repsLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-white">در حال بارگذاری نمایندگان...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {repsError && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <p className="text-red-400 mb-4">خطا در دریافت اطلاعات نمایندگان</p>
                <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/crm/representatives'] })}>
                  تلاش مجدد
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!repsLoading && !repsError && representatives.length === 0 && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <p className="text-gray-400 mb-4">هیچ نماینده‌ای یافت نشد</p>
                <Button onClick={() => setShowCreateModal(true)}>
                  افزودن نماینده جدید
                </Button>
              </div>
            </div>
          )}

          {/* Representatives Grid */}
          {!repsLoading && !repsError && representatives.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {representatives.map((rep: Representative) => (
              <Card key={rep.id} className="bg-black/20 border-white/10 hover:bg-black/30 transition-all">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-semibold text-lg">{rep.name}</h3>
                        <p className="text-gray-400 text-sm">کد: {rep.code}</p>
                      </div>
                      <Badge variant={rep.isActive ? "default" : "secondary"}>
                        {rep.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">مالک:</span>
                        <span className="text-white text-sm">{rep.ownerName || 'نامشخص'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">فروش:</span>
                        <span className="text-green-400 text-sm">{formatCurrency(rep.totalSales)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300 text-sm">بدهی:</span>
                        <span className="text-red-400 text-sm">{formatCurrency(rep.totalDebt)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewRep(rep)}
                        className="flex-1"
                      >
                        <Eye className="w-3 h-3 ml-1" />
                        مشاهده
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditRep(rep)}
                        className="flex-1"
                      >
                        <Edit2 className="w-3 h-3 ml-1" />
                        ویرایش
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCallRep(rep)}
                        className="flex-1"
                        disabled={!rep.phone}
                      >
                        <Phone className="w-3 h-3 ml-1" />
                        تماس
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                قبلی
              </Button>
              <span className="flex items-center px-4 text-white">
                صفحه {pagination.page} از {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                disabled={currentPage === pagination.totalPages}
              >
                بعدی
              </Button>
            </div>
          )}
        </TabsContent>


      </Tabs>

      {/* Modals */}
      {showModal && selectedRep && (
        <RepresentativeModal
          representative={selectedRep}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedRep(null);
            setIsEditing(false);
          }}
          onSave={handleUpdateRep}
          isEditing={isEditing}
          isLoading={updateMutation.isPending}
        />
      )}

      {showCreateModal && (
        <CreateRepresentativeModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateRep}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
}