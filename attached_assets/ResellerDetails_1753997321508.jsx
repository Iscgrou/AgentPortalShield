import React from "react";
import { motion } from "framer-motion";
import { X, Phone, MessageCircle, Calendar, Target, CheckCircle } from "lucide-react";

export default function ResellerDetails({ reseller, tasks, onClose }) {
  if (!reseller) return null;

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            جزئیات نماینده: {reseller.shop_name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* اطلاعات پایه */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">اطلاعات پایه</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">نام فروشگاه:</span>
                  <span className="font-medium">{reseller.shop_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">شخص مسئول:</span>
                  <span className="font-medium">{reseller.contact_person || 'نامشخص'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">وضعیت:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reseller.status === 'active' ? 'bg-green-100 text-green-800' :
                    reseller.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    reseller.status === 'lapsed' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {reseller.status === 'active' ? 'فعال' : 
                     reseller.status === 'inactive' ? 'غیرفعال' :
                     reseller.status === 'lapsed' ? 'کاهش یافته' : 'جدید'}
                  </span>
                </div>
              </div>
            </div>

            {/* پروفایل روانشناختی */}
            {reseller.psychological_profile && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">پروفایل روانشناختی</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">پذیرش پیشنهادات:</span>
                    <span className="font-medium">{reseller.psychological_profile.receptivenessToSuggestions}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">کانال ارتباطی:</span>
                    <span className="flex items-center gap-1">
                      {reseller.psychological_profile.preferredCommunicationChannel === 'telegram' ? 
                        <MessageCircle className="w-4 h-4 text-blue-500" /> : 
                        <Phone className="w-4 h-4 text-green-500" />}
                      <span className="text-sm">
                        {reseller.psychological_profile.preferredCommunicationChannel === 'telegram' ? 'تلگرام' : 'تلفن'}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">درایت کسب‌وکار:</span>
                    <span className="font-medium">{reseller.psychological_profile.businessAcumen === 'high' ? 'بالا' : 
                                                     reseller.psychological_profile.businessAcumen === 'medium' ? 'متوسط' : 'پایین'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ریسک‌پذیری:</span>
                    <span className="font-medium">{reseller.psychological_profile.riskAversion === 'high' ? 'بالا' : 
                                                     reseller.psychological_profile.riskAversion === 'medium' ? 'متوسط' : 'پایین'}</span>
                  </div>
                  {reseller.psychological_profile.notes && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <span className="text-gray-600">یادداشت‌ها:</span>
                      <p className="text-sm mt-1">{reseller.psychological_profile.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* آمار وظایف */}
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3">آمار وظایف</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                  <div className="text-sm text-gray-600">تکمیل شده</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{pendingTasks}</div>
                  <div className="text-sm text-gray-600">در انتظار</div>
                </div>
              </div>
            </div>

            {/* تاریخچه فروش */}
            {reseller.sales_history && reseller.sales_history.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">تاریخچه فروش</h3>
                <div className="space-y-2">
                  {reseller.sales_history.slice(0, 5).map((sale, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        هفته {sale.week} - {sale.year}
                      </span>
                      <span className="font-medium text-purple-700">
                        {sale.salesAmount.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* لیست وظایف */}
        {tasks.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">وظایف مرتبط</h3>
            <div className="space-y-3">
              {tasks.slice(0, 10).map((task, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {task.status === 'completed' ? 
                      <CheckCircle className="w-5 h-5 text-green-500" /> :
                      <Target className="w-5 h-5 text-orange-500" />
                    }
                    <div>
                      <div className="font-medium text-gray-800">{task.prompt?.substring(0, 60)}...</div>
                      <div className="text-sm text-gray-600">
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString('fa-IR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {task.status === 'completed' ? 'تکمیل شده' :
                     task.status === 'pending' ? 'در انتظار' : 'در حال انجام'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}