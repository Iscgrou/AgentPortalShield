import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ResellerForm({ onSubmit, onCancel, reseller = null }) {
  const [formData, setFormData] = useState(reseller || {
    shop_name: "",
    contact_person: "",
    status: "new",
    psychological_profile: {
      receptivenessToSuggestions: 5,
      preferredCommunicationChannel: "phone",
      businessAcumen: "medium",
      riskAversion: "medium",
      notes: ""
    },
    sales_history: []
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      if (window.showNotification) {
        window.showNotification('error', 'خطا در ذخیره', 'لطفاً دوباره تلاش کنید.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      psychological_profile: {
        ...prev.psychological_profile,
        [field]: value
      }
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {reseller ? 'ویرایش نماینده' : 'افزودن نماینده جدید'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام فروشگاه *
              </label>
              <Input
                value={formData.shop_name}
                onChange={(e) => setFormData({...formData, shop_name: e.target.value})}
                placeholder="مثال: موبایل سنتر"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نام شخص مسئول *
              </label>
              <Input
                value={formData.contact_person}
                onChange={(e) => setFormData({...formData, contact_person: e.target.value})}
                placeholder="مثال: علی احمدی"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وضعیت
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({...formData, status: value})}
              disabled={submitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">جدید</SelectItem>
                <SelectItem value="active">فعال</SelectItem>
                <SelectItem value="inactive">غیرفعال</SelectItem>
                <SelectItem value="lapsed">کاهش یافته</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">پروفایل روانشناختی</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  پذیرش پیشنهادات (1-10)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.psychological_profile.receptivenessToSuggestions}
                  onChange={(e) => handleProfileChange('receptivenessToSuggestions', parseInt(e.target.value))}
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کانال ارتباطی ترجیحی
                </label>
                <Select
                  value={formData.psychological_profile.preferredCommunicationChannel}
                  onValueChange={(value) => handleProfileChange('preferredCommunicationChannel', value)}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">تلفن</SelectItem>
                    <SelectItem value="telegram">تلگرام</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  درایت کسب‌وکار
                </label>
                <Select
                  value={formData.psychological_profile.businessAcumen}
                  onValueChange={(value) => handleProfileChange('businessAcumen', value)}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">پایین</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="high">بالا</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ریسک‌پذیری
                </label>
                <Select
                  value={formData.psychological_profile.riskAversion}
                  onValueChange={(value) => handleProfileChange('riskAversion', value)}
                  disabled={submitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">پایین</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="high">بالا</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                یادداشت‌ها
              </label>
              <textarea
                value={formData.psychological_profile.notes}
                onChange={(e) => handleProfileChange('notes', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="3"
                placeholder="یادداشت‌های اضافی درباره نماینده..."
                disabled={submitting}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {reseller ? 'ویرایش' : 'افزودن'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}