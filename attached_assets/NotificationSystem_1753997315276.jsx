import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Bell, Clock, AlertTriangle, TrendingUp, Info, Brain, Users, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Notification } from '@/api/entities';

const NOTIFICATION_TYPES = {
    task_reminder: { icon: Clock, color: 'blue-500' },
    task_overdue: { icon: AlertTriangle, color: 'red-500' },
    performance_alert: { icon: TrendingUp, color: 'orange-500' },
    system_update: { icon: Info, color: 'gray-500' },
    training_suggestion: { icon: Brain, color: 'purple-500' },
    workload_adjustment: { icon: Users, color: 'green-500' },
    default: { icon: Bell, color: 'gray-500' }
};

if (typeof window !== 'undefined') {
    window.showToast = (type, title, message) => {
        const event = new CustomEvent('show-toast', { detail: { type, title, message } });
        window.dispatchEvent(event);
    };
}

export default function NotificationSystem({ isPanelOpen, setPanelOpen }) {
    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        
        const handleShowToast = (e) => {
            const id = Date.now();
            setToasts(prev => [...prev, { ...e.detail, id }]);
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 5000);
        };

        window.addEventListener('show-toast', handleShowToast);

        return () => {
            clearInterval(interval);
            window.removeEventListener('show-toast', handleShowToast);
        };
    }, []);

    const loadNotifications = async () => {
        try {
            const userNotifications = await Notification.filter({ is_dismissed: false }, '-created_date', 50);
            setNotifications(userNotifications);
            setUnreadCount(userNotifications.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await Notification.update(notificationId, { is_read: true });
            setNotifications(prev => 
                prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const dismissNotification = async (notificationId) => {
        try {
            await Notification.update(notificationId, { is_dismissed: true });
            const dismissed = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            if (dismissed && !dismissed.is_read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error dismissing notification:', error);
        }
    };

    const getToastStyle = (type) => ({
        success: { Icon: CheckCircle2, bg: 'bg-green-500' },
        error: { Icon: AlertCircle, bg: 'bg-red-500' },
        warning: { Icon: AlertTriangle, bg: 'bg-orange-500' },
        info: { Icon: Info, bg: 'bg-blue-500' }
    }[type] || { Icon: Info, bg: 'bg-gray-800' });

    return (
        <>
            {/* Notification Panel */}
            <AnimatePresence>
                {isPanelOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="fixed top-0 left-0 h-full w-96 z-50 bg-white shadow-2xl border-r border-gray-200"
                    >
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg">اعلان‌ها</h3>
                            <Button variant="ghost" size="icon" onClick={() => setPanelOpen(false)} className="rounded-full">
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="h-[calc(100%-4rem)] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>هیچ اعلانی وجود ندارد</p>
                                </div>
                            ) : (
                                <div className="p-2 space-y-2">
                                    {notifications.map((notification) => {
                                        const config = NOTIFICATION_TYPES[notification.notification_type] || NOTIFICATION_TYPES.default;
                                        const IconComponent = config.icon;
                                        return (
                                            <motion.div
                                                key={notification.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-3 rounded-lg border cursor-pointer hover:shadow-md ${!notification.is_read ? 'bg-indigo-50' : ''}`}
                                                onClick={() => !notification.is_read && markAsRead(notification.id)}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`p-1.5 rounded-full bg-gray-100`}>
                                                        <IconComponent className={`w-4 h-4 text-${config.color}`} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between">
                                                            <h4 className="font-medium text-sm text-gray-800">{notification.title}</h4>
                                                            {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                                                        <span className="text-xs text-gray-400 mt-2 block">{new Date(notification.created_date).toLocaleString('fa-IR')}</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); dismissNotification(notification.id);}} className="w-6 h-6 p-0 opacity-50 hover:opacity-100 rounded-full">
                                                        <X className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-[9999] space-y-2">
                <AnimatePresence>
                    {toasts.map((toast) => {
                        const { Icon, bg } = getToastStyle(toast.type);
                        return (
                            <motion.div
                                key={toast.id}
                                layout
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`p-4 rounded-lg shadow-lg text-white ${bg} flex items-center gap-3`}
                            >
                                <Icon className="w-6 h-6" />
                                <div>
                                    <h4 className="font-bold">{toast.title}</h4>
                                    <p className="text-sm">{toast.message}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Notification Bell Button - Global */}
            <div className="fixed top-4 left-4 z-[90]">
                <Button
                    variant="outline"
                    size="icon"
                    className="relative bg-white shadow-md"
                    onClick={() => setPanelOpen(true)}
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-2 -right-2 w-5 h-5 text-xs flex items-center justify-center bg-red-500 text-white">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </div>
        </>
    );
}