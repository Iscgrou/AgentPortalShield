/**
 * SHERLOCK v18.0 - UNIFIED STAT CARD COMPONENT
 * کامپوننت استاندارد برای نمایش آمار در تمام صفحات
 */

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";
import { formatCurrency, toPersianDigits } from "@/lib/persian-date";

interface UnifiedStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'gray';
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  badge?: {
    text: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  onClick?: () => void;
  isLoading?: boolean;
  format?: 'currency' | 'number' | 'percentage' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

const colorSchemes = {
  blue: {
    bg: 'from-blue-500/10 to-blue-600/5',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    title: 'text-blue-800 dark:text-blue-200',
    value: 'text-blue-900 dark:text-blue-100'
  },
  green: {
    bg: 'from-green-500/10 to-green-600/5', 
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    title: 'text-green-800 dark:text-green-200',
    value: 'text-green-900 dark:text-green-100'
  },
  red: {
    bg: 'from-red-500/10 to-red-600/5',
    border: 'border-red-200 dark:border-red-800', 
    icon: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900/30',
    title: 'text-red-800 dark:text-red-200',
    value: 'text-red-900 dark:text-red-100'
  },
  orange: {
    bg: 'from-orange-500/10 to-orange-600/5',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400', 
    iconBg: 'bg-orange-100 dark:bg-orange-900/30',
    title: 'text-orange-800 dark:text-orange-200',
    value: 'text-orange-900 dark:text-orange-100'
  },
  purple: {
    bg: 'from-purple-500/10 to-purple-600/5',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900/30', 
    title: 'text-purple-800 dark:text-purple-200',
    value: 'text-purple-900 dark:text-purple-100'
  },
  gray: {
    bg: 'from-gray-500/10 to-gray-600/5',
    border: 'border-gray-200 dark:border-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    iconBg: 'bg-gray-100 dark:bg-gray-900/30',
    title: 'text-gray-800 dark:text-gray-200', 
    value: 'text-gray-900 dark:text-gray-100'
  }
};

const sizeClasses = {
  sm: {
    padding: 'p-3',
    iconSize: 'w-4 h-4',
    iconContainer: 'w-8 h-8',
    valueText: 'text-lg',
    titleText: 'text-xs',
    subtitleText: 'text-xs'
  },
  md: {
    padding: 'p-4',
    iconSize: 'w-5 h-5', 
    iconContainer: 'w-10 h-10',
    valueText: 'text-2xl',
    titleText: 'text-sm',
    subtitleText: 'text-sm'
  },
  lg: {
    padding: 'p-6',
    iconSize: 'w-6 h-6',
    iconContainer: 'w-12 h-12', 
    valueText: 'text-3xl',
    titleText: 'text-base',
    subtitleText: 'text-sm'
  }
};

export function UnifiedStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  trend,
  badge,
  onClick,
  isLoading = false,
  format = 'default',
  size = 'md'
}: UnifiedStatCardProps) {
  const colors = colorSchemes[colorScheme];
  const sizes = sizeClasses[size];

  const formatValue = (val: string | number): string => {
    if (isLoading) return "...";
    
    switch (format) {
      case 'currency':
        return formatCurrency(typeof val === 'string' ? parseFloat(val) : val);
      case 'number':
        return toPersianDigits((typeof val === 'string' ? val : val.toString()));
      case 'percentage':
        return `${toPersianDigits((typeof val === 'string' ? val : val.toString()))}%`;
      default:
        return toPersianDigits((typeof val === 'string' ? val : val.toString()));
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return '↗️';
      case 'down': return '↘️'; 
      case 'neutral': return '→';
    }
  };

  return (
    <Card 
      className={`
        bg-gradient-to-br ${colors.bg} ${colors.border} 
        hover:shadow-md transition-all duration-200
        ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}
        ${isLoading ? 'animate-pulse' : ''}
      `}
      onClick={onClick}
    >
      <CardContent className={sizes.padding}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Header với Badge */}
            <div className="flex items-center justify-between mb-2">
              <p className={`font-medium ${colors.title} ${sizes.titleText}`}>
                {title}
              </p>
              {badge && (
                <Badge variant={badge.variant} className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </div>

            {/* Value */}
            <p className={`font-bold ${colors.value} ${sizes.valueText} leading-tight`}>
              {formatValue(value)}
            </p>

            {/* Subtitle و Trend */}
            <div className="mt-1 space-y-1">
              {subtitle && (
                <p className={`text-gray-600 dark:text-gray-400 ${sizes.subtitleText}`}>
                  {subtitle}
                </p>
              )}
              
              {trend && (
                <div className="flex items-center gap-1">
                  <span className="text-xs">
                    {getTrendIcon(trend.direction)}
                  </span>
                  <span className={`text-xs ${
                    trend.direction === 'up' ? 'text-green-600 dark:text-green-400' :
                    trend.direction === 'down' ? 'text-red-600 dark:text-red-400' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {toPersianDigits(trend.value.toString())} {trend.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Icon */}
          <div className={`${colors.iconBg} ${sizes.iconContainer} rounded-full flex items-center justify-center flex-shrink-0`}>
            <Icon className={`${colors.icon} ${sizes.iconSize}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading Skeleton برای UnifiedStatCard
 */
export function UnifiedStatCardSkeleton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = sizeClasses[size];
  
  return (
    <Card className="animate-pulse">
      <CardContent className={sizes.padding}>
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className={`${sizes.iconContainer} bg-gray-200 dark:bg-gray-700 rounded-full`}></div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Grid Layout برای نمایش مجموعه کارت‌های آماری
 */
interface UnifiedStatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4 | 5;
  gap?: 'sm' | 'md' | 'lg';
}

export function UnifiedStatGrid({ children, columns = 4, gap = 'md' }: UnifiedStatGridProps) {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4', 
    lg: 'gap-6'
  };

  const columnClasses = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', 
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
  };

  return (
    <div className={`grid ${columnClasses[columns]} ${gapClasses[gap]}`}>
      {children}
    </div>
  );
}