'use client';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'gold' | 'green' | 'blue' | 'purple';
  segments?: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
}

export function ProgressBar({
  value,
  max,
  label,
  showPercentage = true,
  size = 'md',
  color = 'gold',
  segments,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorClasses = {
    gold: 'bg-brand-gold',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm text-gray-400">{label}</span>}
          {showPercentage && (
            <span className="text-sm font-medium text-white">{percentage.toFixed(1)}%</span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-dark-600 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        {segments ? (
          <div className="flex h-full">
            {segments.map((segment, index) => {
              const segmentPercentage = max > 0 ? (segment.value / max) * 100 : 0;
              return (
                <div
                  key={index}
                  className={`h-full ${segment.color}`}
                  style={{ width: `${segmentPercentage}%` }}
                  title={segment.label}
                />
              );
            })}
          </div>
        ) : (
          <div
            className={`h-full ${colorClasses[color]} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    </div>
  );
}
