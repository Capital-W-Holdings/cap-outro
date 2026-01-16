'use client';

import Link from 'next/link';
import { Play, Pause, MoreHorizontal, Mail } from 'lucide-react';
import { useSequences } from '@/hooks';
import { Card, SkeletonCard, ErrorState, EmptyState } from '@/components/ui';
import type { Sequence, SequenceStatus } from '@/types';

interface SequenceListProps {
  campaignId?: string;
  onCreateSequence: () => void;
}

const statusConfig: Record<SequenceStatus, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'text-neutral-600 bg-neutral-100' },
  active: { label: 'Active', color: 'text-green-700 bg-green-100' },
  paused: { label: 'Paused', color: 'text-amber-700 bg-amber-100' },
};

export function SequenceList({ campaignId, onCreateSequence }: SequenceListProps) {
  const { data: sequences, isLoading, error, refetch } = useSequences(campaignId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  if (!sequences || sequences.length === 0) {
    return (
      <EmptyState
        icon={<Mail className="w-8 h-8 text-neutral-400" />}
        title="No sequences yet"
        description="Create your first sequence to automate investor outreach."
        action={{
          label: 'Create Sequence',
          onClick: onCreateSequence,
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {sequences.map((sequence) => (
        <SequenceCard key={sequence.id} sequence={sequence} />
      ))}
    </div>
  );
}

function SequenceCard({ sequence }: { sequence: Sequence }) {
  const status = statusConfig[sequence.status];

  return (
    <Link href={`/sequences/${sequence.id}`}>
      <Card hover className="group">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Status Icon */}
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${status.color}`}>
              {sequence.status === 'active' ? (
                <Play className="w-5 h-5" />
              ) : sequence.status === 'paused' ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Mail className="w-5 h-5" />
              )}
            </div>

            <div>
              <h3 className="font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors">
                {sequence.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${status.color}`}>
                  {status.label}
                </span>
                <span className="text-xs text-neutral-500">
                  Created {new Date(sequence.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right mr-4">
              <p className="text-sm text-neutral-500">Steps</p>
              <p className="text-lg font-semibold text-neutral-900">--</p>
            </div>

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded opacity-0 group-hover:opacity-100 transition-all"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Card>
    </Link>
  );
}
