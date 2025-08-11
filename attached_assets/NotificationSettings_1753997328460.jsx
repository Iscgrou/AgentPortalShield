import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Bell, Mail, MessageSquare, Users, 
    Clock, Volume2, VolumeX, Settings,
    Smartphone, Monitor, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export default function NotificationSettings() {
    const [settings, setSettings] = useState({
        global: {
            enabled: true,
            sound_enabled: true,
            volume: 70,
            do_not_disturb: false,
            quiet_hours_start: '22:00',
            quiet_hours_end: '08:00'
        },
        channels: {
            in_app: {
                enabled: true,
                task_reminders: true,
                task_overdue: true,
                performance_alerts: true,
                system_updates: true
            },
            email: {
                enabled: false,
                task_reminders: false,
                task_overdue: true,
                performance_alerts: true,
                system_updates: false
            },
            telegram: {
                enabled: true,
                task_reminders: true,
                task_overdue: true,
                performance_alerts: false,
                system_updates: false
            }
        },
        priorities: {
            urgent: {
                enabled: true,
                sound: true,
                bypass_quiet_hours: true
            },
            high: {
                enabled: true,
                sound: true,
                bypass_quiet_hours: false
            },
            medium: {
                enabled: true,
                sound: false,
                bypass_quiet_hours: false
            },
            low: {
                enabled: false,
                sound: false,
                bypass_quiet_hours: false
            }
        }
    });

    const handleGlobalChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            global: {
                ...prev.global,
                [key]: value
            }
        }));
    };

    const handleChannelChange = (channel, key, value) => {
        setSettings(prev => ({
            ...prev,
            channels: {
                ...prev.channels,
                [channel]: {
                    ...prev.channels[channel],
                    [key]: value
                }
            }
        }));
    };

    const handlePriorityChange = (priority, key, value) => {
        setSettings(prev => ({
            ...prev,
            priorities: {
                ...prev.priorities,
                [priority]: {
                    ...prev.priorities[priority],
                    [key]: value
                }
            }
        }));
    };

    const notificationTypes = [
        { key: 'task_reminders', label: 'یادآوری وظایف', icon: Clock },
        { key: 'task_overdue', label: 'وظایف عقب‌افتاده', icon: AlertCircle },
        { key: 'performance_alerts', label: 'هشدارهای عملکرد', icon: Users },
        { key: 'system_updates', label: 'به‌روزرسانی سیستم', icon: Settings }
    ];

    const channels = [
        { key: 'in_app', label: 'درون برنامه', icon: Monitor, color: 'blue' },
        { key: 'email', label: 'ایمیل', icon: Mail, color: 'green' },
        { key: 'telegram', label: 'تلگرام', icon: MessageSquare, color: 'purple' }
    ];

    const priorities = [
        { key: 'urgent', label: 'فوری', color: 'red' },
        { key: 'high', label: 'بالا', color: 'orange' },
        { key: 'medium', label: 'متوسط', color: 'yellow' },
        { key: 'low', label: 'پایین', color: 'gray' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">تنظیمات اطلاع‌رسانی</h2>
                <Button variant="outline" size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    تست اطلاع‌رسانی
                </Button>
            </div>

            {/* Global Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        تنظیمات کلی
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="global-enabled">فعال‌سازی اطلاع‌رسانی</Label>
                                <Switch
                                    id="global-enabled"
                                    checked={settings.global.enabled}
                                    onCheckedChange={(checked) => handleGlobalChange('enabled', checked)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="sound-enabled">صدای اطلاع‌رسانی</Label>
                                <Switch
                                    id="sound-enabled"
                                    checked={settings.global.sound_enabled}
                                    onCheckedChange={(checked) => handleGlobalChange('sound_enabled', checked)}
                                    disabled={!settings.global.enabled}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="dnd">حالت آرام</Label>
                                <Switch
                                    id="dnd"
                                    checked={settings.global.do_not_disturb}
                                    onCheckedChange={(checked) => handleGlobalChange('do_not_disturb', checked)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>میزان صدا</Label>
                                <div className="mt-2">
                                    <Slider
                                        value={[settings.global.volume]}
                                        onValueChange={(value) => handleGlobalChange('volume', value[0])}
                                        max={100}
                                        min={0}
                                        step={5}
                                        disabled={!settings.global.sound_enabled}
                                    />
                                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                                        <VolumeX className="w-4 h-4" />
                                        <span>{settings.global.volume}%</span>
                                        <Volume2 className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>ساعت آرام از</Label>
                                    <input
                                        type="time"
                                        value={settings.global.quiet_hours_start}
                                        onChange={(e) => handleGlobalChange('quiet_hours_start', e.target.value)}
                                        className="w-full mt-1 p-2 border rounded-md"
                                    />
                                </div>
                                <div>
                                    <Label>ساعت آرام تا</Label>
                                    <input
                                        type="time"
                                        value={settings.global.quiet_hours_end}
                                        onChange={(e) => handleGlobalChange('quiet_hours_end', e.target.value)}
                                        className="w-full mt-1 p-2 border rounded-md"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Channels */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Smartphone className="w-5 h-5" />
                        کانال‌های اطلاع‌رسانی
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {channels.map((channel) => (
                            <div key={channel.key} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-${channel.color}-100`}>
                                            <channel.icon className={`w-5 h-5 text-${channel.color}-600`} />
                                        </div>
                                        <span className="font-medium">{channel.label}</span>
                                    </div>
                                    <Switch
                                        checked={settings.channels[channel.key].enabled}
                                        onCheckedChange={(checked) => handleChannelChange(channel.key, 'enabled', checked)}
                                    />
                                </div>

                                {settings.channels[channel.key].enabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {notificationTypes.map((type) => (
                                            <div key={type.key} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <type.icon className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm">{type.label}</span>
                                                </div>
                                                <Switch
                                                    checked={settings.channels[channel.key][type.key]}
                                                    onCheckedChange={(checked) => handleChannelChange(channel.key, type.key, checked)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Priority Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        تنظیمات اولویت
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {priorities.map((priority) => (
                            <div key={priority.key} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full bg-${priority.color}-500`}></div>
                                    <span className="font-medium">{priority.label}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`${priority.key}-enabled`} className="text-sm">فعال</Label>
                                        <Switch
                                            id={`${priority.key}-enabled`}
                                            checked={settings.priorities[priority.key].enabled}
                                            onCheckedChange={(checked) => handlePriorityChange(priority.key, 'enabled', checked)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`${priority.key}-sound`} className="text-sm">صدا</Label>
                                        <Switch
                                            id={`${priority.key}-sound`}
                                            checked={settings.priorities[priority.key].sound}
                                            onCheckedChange={(checked) => handlePriorityChange(priority.key, 'sound', checked)}
                                            disabled={!settings.priorities[priority.key].enabled}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Label htmlFor={`${priority.key}-bypass`} className="text-sm">نادیده گرفتن آرام</Label>
                                        <Switch
                                            id={`${priority.key}-bypass`}
                                            checked={settings.priorities[priority.key].bypass_quiet_hours}
                                            onCheckedChange={(checked) => handlePriorityChange(priority.key, 'bypass_quiet_hours', checked)}
                                            disabled={!settings.priorities[priority.key].enabled}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}