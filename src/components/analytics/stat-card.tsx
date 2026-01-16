'use client';

import { type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    label?: string;
  };
  suffix?: string;
  className?: string;
}

export function StatCard({ label, value, icon, trend, suffix, className = '' }: StatCardProps) {
  const trendColor =
    !trend ? '' :
    trend.value > 0 ? 'text-green-600' :
    trend.value < 0 ? 'text-red-600' :
    'text-neutral-500';

  const TrendIcon =
    !trend ? null :
    trend.value > 0 ? TrendingUp :
    trend.value < 0 ? TrendingDown :
    Minus;

  return (
    <div className={`bg-white border border-neutral-200 rounded-xl p-4 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-600 mb-1">{label}</p>
          <p className="text-2xl font-bold text-neutral-900">
            {value}
            {suffix && <span className="text-lg text-neutral-500 ml-1">{suffix}</span>}
          </p>
        </div>
        {icon && (
          <div className="p-2 bg-neutral-100 rounded-lg text-neutral-700">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className={`flex items-center gap-1 mt-2 text-sm ${trendColor}`}>
          {TrendIcon && <TrendIcon className="w-4 h-4" />}
          <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
          {trend.label && <span className="text-neutral-500 ml-1">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
