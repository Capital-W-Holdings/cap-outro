'use client';

import { usePipeline } from '@/hooks';
import { PipelineColumn } from './pipeline-column';
import { LoadingPage, ErrorState, EmptyState } from '@/components/ui';
import { Kanban } from 'lucide-react';
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

export function PipelineKanban({ campaignId }: PipelineKanbanProps) {
  const { data, isLoading, error, refetch } = usePipeline(campaignId);

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

  return (
    <div className="flex flex-col h-full">
      {/* Stats Bar */}
      <div className="flex items-center gap-6 p-4 bg-dark-800 border-b border-dark-600">
        <div>
          <p className="text-sm text-gray-400">Total Investors</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="h-10 w-px bg-dark-600" />
        <div>
          <p className="text-sm text-gray-400">Soft Commits</p>
          <p className="text-2xl font-bold text-yellow-400">
            ${(stats.total_soft / 1000000).toFixed(1)}M
          </p>
        </div>
        <div className="h-10 w-px bg-dark-600" />
        <div>
          <p className="text-sm text-gray-400">Committed</p>
          <p className="text-2xl font-bold text-green-400">
            ${(stats.total_committed / 1000000).toFixed(1)}M
          </p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex gap-4 h-full">
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
