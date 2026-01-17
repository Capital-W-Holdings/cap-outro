'use client';

import { useState } from 'react';
import { usePipeline } from '@/hooks';
import { PipelineColumn } from './pipeline-column';
import { LoadingPage, ErrorState, EmptyState } from '@/components/ui';
import { Kanban, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PipelineStage } from '@/types';

interface PipelineKanbanProps {
  campaignId?: string;
}

const stages: PipelineStage[] = [
  'not_contacted',
  'contacted',
  'responded',
  'meeting_scheduled',
  'meeting_held',
  'dd',
  'term_sheet',
  'committed',
  'passed',
];

const stageLabels: Record<PipelineStage, string> = {
  not_contacted: 'Not Contacted',
  contacted: 'Contacted',
  responded: 'Responded',
  meeting_scheduled: 'Meeting Scheduled',
  meeting_held: 'Meeting Held',
  dd: 'Due Diligence',
  term_sheet: 'Term Sheet',
  committed: 'Committed',
  passed: 'Passed',
};

export function PipelineKanban({ campaignId }: PipelineKanbanProps) {
  const { data, isLoading, error, refetch } = usePipeline(campaignId);
  const [selectedStageIndex, setSelectedStageIndex] = useState(0);
  const selectedStage = stages[selectedStageIndex] as PipelineStage;

  const goToPreviousStage = () => {
    setSelectedStageIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNextStage = () => {
    setSelectedStageIndex((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
  };

  // Loading state
  if (isLoading) {
    return <LoadingPage />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Empty state
  if (!data || data.entries.length === 0) {
    return (
      <EmptyState
        icon={<Kanban className="w-8 h-8 text-gray-500" />}
        title="Pipeline is empty"
        description="Add investors to your campaign to see them in the pipeline."
      />
    );
  }

  // Stats summary
  const { stats } = data;

  // Get count for selected stage on mobile
  const selectedStageCount = (data.by_stage[selectedStage] || []).length;

  return (
    <div className="flex flex-col h-full">
      {/* Stats Bar - Responsive */}
      <div className="flex items-center gap-3 sm:gap-6 p-3 sm:p-4 bg-gray-900 border-b border-gray-700 overflow-x-auto">
        <div className="flex-shrink-0">
          <p className="text-xs sm:text-sm text-gray-400">Total</p>
          <p className="text-lg sm:text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="h-8 sm:h-10 w-px bg-gray-700 flex-shrink-0" />
        <div className="flex-shrink-0">
          <p className="text-xs sm:text-sm text-gray-400">Soft</p>
          <p className="text-lg sm:text-2xl font-bold text-yellow-400">
            ${(stats.total_soft / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="h-8 sm:h-10 w-px bg-gray-700 flex-shrink-0" />
        <div className="flex-shrink-0">
          <p className="text-xs sm:text-sm text-gray-400">Committed</p>
          <p className="text-lg sm:text-2xl font-bold text-green-400">
            ${(stats.total_committed / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* Mobile Stage Selector */}
      <div className="md:hidden flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <button
          onClick={goToPreviousStage}
          disabled={selectedStageIndex === 0}
          className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Previous stage"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 mx-2">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStageIndex(stages.indexOf(e.target.value as PipelineStage))}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-center appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-black"
          >
            {stages.map((stage, index) => (
              <option key={stage} value={stage}>
                {stageLabels[stage]} ({(data.by_stage[stage] || []).length})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={goToNextStage}
          disabled={selectedStageIndex === stages.length - 1}
          className="p-2 rounded-lg hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          aria-label="Next stage"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile: Single Column View */}
      <div className="md:hidden flex-1 p-3 overflow-y-auto">
        <PipelineColumn
          stage={selectedStage}
          entries={data.by_stage[selectedStage] || []}
        />
      </div>

      {/* Desktop: Horizontal Scroll Kanban Board */}
      <div className="hidden md:block flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full min-h-0">
          {stages.map((stage) => (
            <PipelineColumn
              key={stage}
              stage={stage}
              entries={data.by_stage[stage] || []}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
