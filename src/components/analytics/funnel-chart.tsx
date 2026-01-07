'use client';

interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

interface FunnelChartProps {
  stages: FunnelStage[];
  showConversion?: boolean;
}

export function FunnelChart({ stages, showConversion = true }: FunnelChartProps) {
  const maxValue = Math.max(...stages.map((s) => s.value), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => {
        const width = (stage.value / maxValue) * 100;
        const prevValue = index > 0 ? stages[index - 1]?.value : null;
        const conversion = prevValue && prevValue > 0 
          ? ((stage.value / prevValue) * 100).toFixed(0) 
          : null;

        return (
          <div key={stage.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">{stage.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">{stage.value}</span>
                {showConversion && conversion && (
                  <span className="text-xs text-gray-500">({conversion}%)</span>
                )}
              </div>
            </div>
            <div className="h-8 bg-dark-600 rounded overflow-hidden">
              <div
                className={`h-full ${stage.color} transition-all duration-500 flex items-center justify-end pr-2`}
                style={{ width: `${Math.max(width, 5)}%` }}
              >
                {width > 20 && (
                  <span className="text-xs font-medium text-white/80">{stage.value}</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
