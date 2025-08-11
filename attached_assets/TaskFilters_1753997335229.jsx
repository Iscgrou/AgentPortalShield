import React from "react";
import { motion } from "framer-motion";
import { Filter, RotateCcw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FILTER_OPTIONS = {
    status: [
        { value: 'all', label: 'همه وضعیت‌ها', icon: '📋' },
        { value: 'todo', label: 'انجام نشده', icon: '📝' },
        { value: 'in_progress', label: 'در حال انجام', icon: '⚡️' },
        { value: 'completed', label: 'تکمیل شده', icon: '✅' }
    ],
    category: [
        { value: 'all', label: 'همه دسته‌بندی‌ها', icon: '📂' },
        { value: 'personal', label: 'شخصی', icon: '🌟' },
        { value: 'work', label: 'کاری', icon: '💼' },
        { value: 'health', label: 'سلامت', icon: '❤️' },
        { value: 'creative', label: 'خلاقیت', icon: '🎨' },
        { value: 'learning', label: 'یادگیری', icon: '📚' },
        { value: 'home', label: 'خانه', icon: '🏠' }
    ],
    priority: [
        { value: 'all', label: 'همه اولویت‌ها', icon: '⚖️' },
        { value: 'low', label: 'کم', icon: '🟢' },
        { value: 'medium', label: 'متوسط', icon: '🟡' },
        { value: 'high', label: 'زیاد', icon: '🔴' },
        { value: 'urgent', label: 'فوری', icon: '🚨' }
    ]
};

export default function TaskFilters({ filters, onFilterChange }) {
    const handleFilterChange = (type, value) => {
        onFilterChange({ ...filters, [type]: value });
    };

    const resetFilters = () => {
        onFilterChange({
            status: 'all',
            category: 'all',
            priority: 'all'
        });
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-indigo-600" />
                            <span className="text-lg font-semibold text-gray-800">فیلترها</span>
                        </div>
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={resetFilters}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                            >
                                <RotateCcw className="w-4 h-4" />
                                بازنشانی
                            </Button>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(FILTER_OPTIONS).map(([filterType, options]) => (
                            <div key={filterType}>
                                <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                                    {filterType === 'status' && 'وضعیت'}
                                    {filterType === 'category' && 'دسته‌بندی'}
                                    {filterType === 'priority' && 'اولویت'}
                                </label>
                                <Select
                                    value={filters[filterType]}
                                    onValueChange={(value) => handleFilterChange(filterType, value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {options.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <div className="flex items-center gap-2">
                                                    <span>{option.icon}</span>
                                                    <span>{option.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </div>
                    
                    {hasActiveFilters && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>فیلترهای فعال:</span>
                                {Object.entries(filters).map(([type, value]) => 
                                    value !== 'all' && (
                                        <span key={type} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                            {FILTER_OPTIONS[type].find(opt => opt.value === value)?.icon}
                                            {FILTER_OPTIONS[type].find(opt => opt.value === value)?.label}
                                        </span>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}