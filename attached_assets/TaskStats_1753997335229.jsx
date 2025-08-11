import React from "react";
import { motion } from "framer-motion";
import { Target, CheckCircle2, Clock, Activity } from "lucide-react";

export default function TaskStats({ tasks }) {
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const StatCard = ({ icon, value, label, color }) => {
      const IconComponent = icon;
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
                <IconComponent className="w-6 h-6 text-white" />
            </div>
            <div>
                <div className="text-2xl font-bold text-gray-800">{value}</div>
                <div className="text-sm text-gray-600">{label}</div>
            </div>
        </div>
      );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
        <StatCard icon={Target} value={stats.total} label="کل وظایف" color="bg-blue-500" />
        <StatCard icon={CheckCircle2} value={stats.completed} label="تکمیل شده" color="bg-green-500" />
        <StatCard icon={Clock} value={stats.todo} label="انجام نشده" color="bg-orange-500" />
        <StatCard icon={Activity} value={`${completionRate}%`} label="نرخ موفقیت" color="bg-indigo-500" />
    </motion.div>
  );
}