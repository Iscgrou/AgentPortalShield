import React from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, CheckCircle2, Circle, ArrowUpCircle, MoreVertical, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const categoryConfig = {
    personal: { label: "شخصی", color: "bg-pink-100 text-pink-700" },
    work: { label: "کاری", color: "bg-blue-100 text-blue-700" },
    health: { label: "سلامت", color: "bg-green-100 text-green-700" },
    creative: { label: "خلاقیت", color: "bg-purple-100 text-purple-700" },
    learning: { label: "یادگیری", color: "bg-orange-100 text-orange-700" },
    home: { label: "خانه", color: "bg-yellow-100 text-yellow-700" }
};

const priorityConfig = {
    low: { label: "کم", color: "bg-gray-100 text-gray-600" },
    medium: { label: "متوسط", color: "bg-amber-100 text-amber-700" },
    high: { label: "زیاد", color: "bg-red-100 text-red-700" },
    urgent: { label: "فوری", color: "bg-red-200 text-red-800 animate-pulse"}
};

const statusIcons = {
    todo: <Circle className="w-5 h-5 text-gray-400" />,
    in_progress: <ArrowUpCircle className="w-5 h-5 text-blue-500" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />
};

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('fa-IR');
        } catch (error) {
            return dateString;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-5"
        >
            <div className="flex items-start justify-between mb-3">
                <h3 className={`text-lg font-bold transition-all duration-300 ${
                    task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-800'
                }`}>
                    {task.title}
                </h3>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full">
                            <MoreVertical className="w-5 h-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(task)}>
                            <Edit className="w-4 h-4 ml-2" />
                            ویرایش
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => onDelete(task.id)}>
                            <Trash2 className="w-4 h-4 ml-2" />
                            حذف
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          
            <div className="flex items-center gap-3 mb-4">
                <button
                    className="p-1 rounded-full hover:bg-gray-100"
                    onClick={(e) => {
                        e.stopPropagation();
                        const nextStatus = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'completed' : 'todo';
                        onStatusChange(task, nextStatus);
                    }}
                >
                    {statusIcons[task.status] || statusIcons.todo}
                </button>
                <div className="flex gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryConfig[task.category]?.color || 'bg-gray-100'}`}>
                        {categoryConfig[task.category]?.label || task.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${priorityConfig[task.priority]?.color || 'bg-gray-100'}`}>
                        {priorityConfig[task.priority]?.label || task.priority}
                    </span>
                </div>
            </div>

            {task.description && (
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                    {task.description}
                </p>
            )}
          
            <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3 mt-3">
                <div className="flex items-center gap-4">
                    {task.due_date && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(task.due_date)}</span>
                        </div>
                    )}
                    {task.estimated_time && (
                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{task.estimated_time} ساعت</span>
                        </div>
                    )}
                </div>
                {task.status === 'in_progress' && (
                    <div className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 font-medium text-xs">
                        در حال انجام
                    </div>
                )}
            </div>
        </motion.div>
    );
}