import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Target, Plus, Edit2, Trash2, Save, X, Search, 
    Filter, Star, TrendingUp, Clock, CheckCircle2, AlertCircle, Copy, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Offer } from '@/api/entities';

export default function OfferManagement() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');

    const [offerForm, setOfferForm] = useState({
        offer_name: '',
        offer_type: 'discount',
        description: '',
        parameters: '{\n  "discount_percentage": 20,\n  "duration_days": 30,\n  "minimum_purchase": 1000000\n}',
        is_active: true,
        start_date: '',
        end_date: ''
    });

    const [errors, setErrors] = useState({});

    const offerTypes = {
        discount: { label: 'تخفیف', icon: '🏷️', color: 'bg-green-100 text-green-800' },
        consulting: { label: 'مشاوره', icon: '💬', color: 'bg-blue-100 text-blue-800' },
        bonus: { label: 'پاداش', icon: '🎁', color: 'bg-purple-100 text-purple-800' },
        other: { label: 'سایر', icon: '⭐', color: 'bg-gray-100 text-gray-800' }
    };

    useEffect(() => {
        loadOffers();
    }, []);

    const loadOffers = async () => {
        setLoading(true);
        try {
            const offerData = await Offer.list();
            setOffers(offerData);
        } catch (error) {
            console.error('Error loading offers:', error);
            if (window.showNotification) {
                window.showNotification('error', 'خطا در بارگذاری', 'خطا در دریافت آفرها');
            }
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!offerForm.offer_name.trim()) {
            newErrors.offer_name = 'نام آفر الزامی است';
        }
        
        if (!offerForm.description.trim()) {
            newErrors.description = 'توضیحات آفر الزامی است';
        }
        
        try {
            JSON.parse(offerForm.parameters);
        } catch (e) {
            newErrors.parameters = 'فرمت JSON نامعتبر است';
        }
        
        if (offerForm.start_date && offerForm.end_date) {
            if (new Date(offerForm.start_date) >= new Date(offerForm.end_date)) {
                newErrors.date_range = 'تاریخ شروع باید قبل از تاریخ پایان باشد';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        
        const confirmMessage = editingOffer 
            ? `آیا از به‌روزرسانی آفر "${offerForm.offer_name}" مطمئن هستید؟`
            : `آیا از اضافه کردن آفر جدید "${offerForm.offer_name}" مطمئن هستید؟`;
        
        if (!confirm(confirmMessage)) return;
        
        try {
            const offerData = {
                ...offerForm,
                parameters: JSON.parse(offerForm.parameters)
            };
            
            if (editingOffer) {
                await Offer.update(editingOffer.id, offerData);
                if (window.showNotification) {
                    window.showNotification('success', 'آفر به‌روزرسانی شد', 'آفر با موفقیت به‌روزرسانی شد');
                }
            } else {
                await Offer.create(offerData);
                if (window.showNotification) {
                    window.showNotification('success', 'آفر اضافه شد', 'آفر جدید با موفقیت اضافه شد');
                }
            }
            
            resetForm();
            loadOffers();
        } catch (error) {
            console.error('Error saving offer:', error);
            if (window.showNotification) {
                window.showNotification('error', 'خطا در ذخیره', `خطا: ${error.message || 'لطفاً دوباره تلاش کنید'}`);
            }
        }
    };

    const handleEdit = (offer) => {
        setEditingOffer(offer);
        setOfferForm({
            offer_name: offer.offer_name || '',
            offer_type: offer.offer_type || 'discount',
            description: offer.description || '',
            parameters: typeof offer.parameters === 'object' 
                ? JSON.stringify(offer.parameters, null, 2) 
                : offer.parameters || '{}',
            is_active: offer.is_active !== undefined ? offer.is_active : true,
            start_date: offer.start_date || '',
            end_date: offer.end_date || ''
        });
        setShowAddForm(true);
        setErrors({});
    };

    const handleCopy = (offer) => {
        if (confirm(`آیا از کپی کردن آفر "${offer.offer_name}" مطمئن هستید؟`)) {
            setEditingOffer(null);
            setOfferForm({
                offer_name: `کپی از ${offer.offer_name}`,
                offer_type: offer.offer_type || 'discount',
                description: offer.description || '',
                parameters: typeof offer.parameters === 'object' 
                    ? JSON.stringify(offer.parameters, null, 2) 
                    : offer.parameters || '{}',
                is_active: false,
                start_date: '',
                end_date: ''
            });
            setShowAddForm(true);
            setErrors({});
        }
    };

    const handleDelete = async (offerId) => {
        const offer = offers.find(o => o.id === offerId);
        if (confirm(`⚠️ هشدار: آیا از حذف کامل آفر "${offer?.offer_name}" مطمئن هستید؟\n\nاین عمل غیرقابل بازگشت است!`)) {
            try {
                await Offer.delete(offerId);
                loadOffers();
                if (window.showNotification) {
                    window.showNotification('success', 'آفر حذف شد', 'آفر با موفقیت حذف شد');
                }
            } catch (error) {
                console.error('Error deleting offer:', error);
                if (window.showNotification) {
                    window.showNotification('error', 'خطا در حذف', `خطا: ${error.message || 'لطفاً دوباره تلاش کنید'}`);
                }
            }
        }
    };

    const resetForm = () => {
        setEditingOffer(null);
        setOfferForm({
            offer_name: '',
            offer_type: 'discount',
            description: '',
            parameters: '{\n  "discount_percentage": 20,\n  "duration_days": 30,\n  "minimum_purchase": 1000000\n}',
            is_active: true,
            start_date: '',
            end_date: ''
        });
        setErrors({});
        setShowAddForm(false);
    };

    const filteredOffers = offers.filter(offer => {
        const matchesSearch = offer.offer_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || 
            (filterStatus === 'active' && offer.is_active) ||
            (filterStatus === 'inactive' && !offer.is_active);
        const matchesType = filterType === 'all' || offer.offer_type === filterType;
        return matchesSearch && matchesStatus && matchesType;
    });

    const isExpired = (offer) => {
        if (!offer.end_date) return false;
        return new Date(offer.end_date) < new Date();
    };

    const isStarted = (offer) => {
        if (!offer.start_date) return true;
        return new Date(offer.start_date) <= new Date();
    };

    const getOfferStatus = (offer) => {
        if (!offer.is_active) return { label: 'غیرفعال', color: 'bg-gray-100 text-gray-800' };
        if (isExpired(offer)) return { label: 'منقضی شده', color: 'bg-red-100 text-red-800' };
        if (!isStarted(offer)) return { label: 'شروع نشده', color: 'bg-yellow-100 text-yellow-800' };
        return { label: 'فعال', color: 'bg-green-100 text-green-800' };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">مدیریت آفرها</h2>
                    <p className="text-gray-600 mt-1">تعریف و مدیریت آفرهای تشویقی برای نمایندگان</p>
                </div>
                <Button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                >
                    <Plus className="w-4 h-4" />
                    آفر جدید
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="جستجو در نام آفرها..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-10"
                            />
                        </div>
                        <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="وضعیت" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">همه آفرها</SelectItem>
                                <SelectItem value="active">فعال</SelectItem>
                                <SelectItem value="inactive">غیرفعال</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="نوع آفر" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">همه انواع</SelectItem>
                                {Object.entries(offerTypes).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        {config.icon} {config.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Offers List */}
            <div className="grid gap-4">
                <AnimatePresence>
                    {filteredOffers.map((offer) => {
                        const typeConfig = offerTypes[offer.offer_type] || offerTypes.other;
                        const status = getOfferStatus(offer);
                        
                        return (
                            <motion.div
                                key={offer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <Card className={`${offer.is_active ? 'border-green-200' : 'border-gray-200'}`}>
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${typeConfig.color}`}>
                                                    {typeConfig.icon}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800 text-lg">{offer.offer_name}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge className={status.color}>
                                                            {status.label}
                                                        </Badge>
                                                        <Badge className={typeConfig.color}>
                                                            {typeConfig.label}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleCopy(offer)}
                                                    title="کپی آفر"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleEdit(offer)}
                                                    title="ویرایش"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm"
                                                    onClick={() => handleDelete(offer.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-gray-600 leading-relaxed">{offer.description}</p>
                                        </div>

                                        {/* Parameters */}
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="font-medium text-gray-700 mb-2">پارامترهای آفر:</div>
                                            <pre className="text-sm text-gray-600 font-mono bg-white p-2 rounded border overflow-x-auto">
                                                {JSON.stringify(offer.parameters, null, 2)}
                                            </pre>
                                        </div>

                                        {/* Date Range */}
                                        {(offer.start_date || offer.end_date) && (
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <div>
                                                    {offer.start_date && (
                                                        <span>شروع: {new Date(offer.start_date).toLocaleDateString('fa-IR')}</span>
                                                    )}
                                                    {offer.start_date && offer.end_date && <span className="mx-2">-</span>}
                                                    {offer.end_date && (
                                                        <span>پایان: {new Date(offer.end_date).toLocaleDateString('fa-IR')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Usage Stats (mock data) */}
                                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">{Math.floor(Math.random() * 50)}</div>
                                                <div className="text-sm text-gray-600">استفاده شده</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">{Math.floor(Math.random() * 80) + 20}%</div>
                                                <div className="text-sm text-gray-600">نرخ موفقیت</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-purple-600">{Math.floor(Math.random() * 30) + 10}</div>
                                                <div className="text-sm text-gray-600">فروش تولید شده</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {filteredOffers.length === 0 && (
                <div className="text-center py-12">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 mb-2">آفری یافت نشد</h3>
                    <p className="text-gray-600">آفر جدید اضافه کنید یا فیلترها را تغییر دهید</p>
                </div>
            )}

            {/* Add/Edit Form Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-800">
                                    {editingOffer ? 'ویرایش آفر' : 'آفر جدید'}
                                </h3>
                                <button
                                    onClick={resetForm}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        نام آفر *
                                    </label>
                                    <Input
                                        value={offerForm.offer_name}
                                        onChange={(e) => setOfferForm(prev => ({...prev, offer_name: e.target.value}))}
                                        placeholder="نام آفر (مثل: تخفیف ویژه پاییز)"
                                        className={errors.offer_name ? 'border-red-500' : ''}
                                    />
                                    {errors.offer_name && <p className="text-red-500 text-sm mt-1">{errors.offer_name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        نوع آفر
                                    </label>
                                    <Select
                                        value={offerForm.offer_type}
                                        onValueChange={(value) => setOfferForm(prev => ({...prev, offer_type: value}))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(offerTypes).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>
                                                    {config.icon} {config.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        توضیحات آفر *
                                    </label>
                                    <Textarea
                                        value={offerForm.description}
                                        onChange={(e) => setOfferForm(prev => ({...prev, description: e.target.value}))}
                                        placeholder="توضیح کامل آفر، شرایط و نحوه استفاده..."
                                        className={`h-24 ${errors.description ? 'border-red-500' : ''}`}
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        پارامترهای آفر (JSON) *
                                    </label>
                                    <Textarea
                                        value={offerForm.parameters}
                                        onChange={(e) => setOfferForm(prev => ({...prev, parameters: e.target.value}))}
                                        placeholder='{"discount_percentage": 20, "duration_days": 30}'
                                        className={`h-32 font-mono ${errors.parameters ? 'border-red-500' : ''}`}
                                    />
                                    {errors.parameters && <p className="text-red-500 text-sm mt-1">{errors.parameters}</p>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            تاریخ شروع
                                        </label>
                                        <Input
                                            type="date"
                                            value={offerForm.start_date}
                                            onChange={(e) => setOfferForm(prev => ({...prev, start_date: e.target.value}))}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            تاریخ پایان
                                        </label>
                                        <Input
                                            type="date"
                                            value={offerForm.end_date}
                                            onChange={(e) => setOfferForm(prev => ({...prev, end_date: e.target.value}))}
                                        />
                                    </div>
                                </div>

                                {errors.date_range && <p className="text-red-500 text-sm">{errors.date_range}</p>}

                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={offerForm.is_active}
                                        onCheckedChange={(checked) => setOfferForm(prev => ({...prev, is_active: checked}))}
                                    />
                                    <label className="text-sm font-medium text-gray-700">
                                        آفر فعال است
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    انصراف
                                </Button>
                                <Button type="button" onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                                    <Save className="w-4 h-4 mr-2" />
                                    {editingOffer ? 'بروزرسانی' : 'ایجاد'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}