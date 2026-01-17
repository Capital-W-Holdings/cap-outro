'use client';

import type { PipelineEntry, PipelineStage } from '@/types';

interface PipelineColumnProps {
  stage: PipelineStage;
  entries: PipelineEntry[];
  onMoveEntry?: (entryId: string, newStage: PipelineStage) => void;
}

const stageConfig: Record<PipelineStage, { label: string; color: string }> = {
  not_contacted: { label: 'Not Contacted', color: 'bg-gray-500' },
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
    <div className="flex-shrink-0 w-full md:w-72 bg-gray-50 rounded-xl border border-gray-200 flex flex-col md:max-h-full">
      {/* Column Header - Hidden on mobile since we have the selector */}
      <div className="hidden md:block p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${config.color}`} />
          <h3 className="font-medium text-black">{config.label}</h3>
          <span className="ml-auto px-2 py-0.5 bg-gray-200 rounded-full text-xs text-gray-600">
            {entries.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 p-2 space-y-2 md:overflow-y-auto">
        {entries.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            <p>No investors in this stage</p>
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
    <div className="bg-white rounded-lg p-3 hover:bg-gray-50 transition-colors cursor-pointer border border-gray-200 hover:border-gray-300">
      {/* Investor info - in real app, would fetch from investor */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-semibold">
          I
        </div>
        <div>
          <p className="text-sm font-medium text-black">Investor {entry.investor_id.slice(-4)}</p>
          <p className="text-xs text-gray-500">ID: {entry.investor_id.slice(0, 8)}...</p>
        </div>
      </div>

      {/* Amounts */}
      {(entry.amount_soft || entry.amount_committed) && (
        <div className="flex items-center gap-3 text-sm">
          {entry.amount_soft && (
            <div>
              <p className="text-gray-500 text-xs">Soft</p>
              <p className="text-yellow-600 font-medium">{formatCurrency(entry.amount_soft)}</p>
            </div>
          )}
          {entry.amount_committed && (
            <div>
              <p className="text-gray-500 text-xs">Committed</p>
              <p className="text-green-600 font-medium">{formatCurrency(entry.amount_committed)}</p>
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <p className="text-xs text-gray-600 mt-2 line-clamp-2">{entry.notes}</p>
      )}

      {/* Last activity */}
      <p className="text-xs text-gray-500 mt-2">
        Updated {new Date(entry.last_activity_at).toLocaleDateString()}
      </p>
    </div>
  );
}
