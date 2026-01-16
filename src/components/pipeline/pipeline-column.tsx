'use client';

import type { PipelineEntry, PipelineStage } from '@/types';

interface PipelineColumnProps {
  stage: PipelineStage;
  entries: PipelineEntry[];
  onMoveEntry?: (entryId: string, newStage: PipelineStage) => void;
}

const stageConfig: Record<PipelineStage, { label: string; color: string }> = {
  not_contacted: { label: 'Not Contacted', color: 'bg-neutral-400' },
  contacted: { label: 'Contacted', color: 'bg-blue-500' },
  responded: { label: 'Responded', color: 'bg-cyan-500' },
  meeting_scheduled: { label: 'Meeting Scheduled', color: 'bg-purple-500' },
  meeting_held: { label: 'Meeting Held', color: 'bg-indigo-500' },
  dd: { label: 'Due Diligence', color: 'bg-yellow-500' },
  term_sheet: { label: 'Term Sheet', color: 'bg-orange-500' },
  committed: { label: 'Committed', color: 'bg-green-500' },
  passed: { label: 'Passed', color: 'bg-red-500' },
};

export function PipelineColumn({ stage, entries, onMoveEntry: _onMoveEntry }: PipelineColumnProps) {
  const config = stageConfig[stage];

  return (
    <div className="flex-shrink-0 w-72 bg-neutral-50 rounded-xl border border-neutral-200 flex flex-col max-h-full">
      {/* Column Header */}
      <div className="p-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.color}`} />
          <h3 className="font-medium text-neutral-900">{config.label}</h3>
          <span className="ml-auto px-2 py-0.5 bg-neutral-200 rounded-full text-xs text-neutral-600">
            {entries.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {entries.length === 0 ? (
          <div className="p-4 text-center text-neutral-500 text-sm">
            No investors
          </div>
        ) : (
          entries.map((entry) => (
            <PipelineCard key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
}

function PipelineCard({ entry }: { entry: PipelineEntry }) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-white rounded-lg p-3 hover:shadow-md transition-all cursor-pointer border border-neutral-200 hover:border-neutral-300">
      {/* Investor info - in real app, would fetch from investor */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white text-sm font-semibold">
          I
        </div>
        <div>
          <p className="text-sm font-medium text-neutral-900">Investor {entry.investor_id.slice(-4)}</p>
          <p className="text-xs text-neutral-500">ID: {entry.investor_id.slice(0, 8)}...</p>
        </div>
      </div>

      {/* Amounts */}
      {(entry.amount_soft || entry.amount_committed) && (
        <div className="flex items-center gap-3 text-sm">
          {entry.amount_soft && (
            <div>
              <p className="text-neutral-500 text-xs">Soft</p>
              <p className="text-amber-600 font-medium">{formatCurrency(entry.amount_soft)}</p>
            </div>
          )}
          {entry.amount_committed && (
            <div>
              <p className="text-neutral-500 text-xs">Committed</p>
              <p className="text-green-600 font-medium">{formatCurrency(entry.amount_committed)}</p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <p className="text-xs text-neutral-600 mt-2 line-clamp-2">{entry.notes}</p>
      )}

      {/* Last activity */}
      <p className="text-xs text-neutral-500 mt-2">
        Updated {new Date(entry.last_activity_at).toLocaleDateString()}
      </p>
    </div>
  );
}
