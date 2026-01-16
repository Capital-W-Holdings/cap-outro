'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useOutreach } from '@/hooks';
import { OutreachCard } from './outreach-card';
import { SkeletonCard, ErrorState, EmptyState, Select, type SelectOption } from '@/components/ui';
import type { OutreachStatus } from '@/types';

interface OutreachListProps {
  campaignId?: string;
  investorId?: string;
}

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'sent', label: 'Sent' },
  { value: 'opened', label: 'Opened' },
  { value: 'clicked', label: 'Clicked' },
  { value: 'replied', label: 'Replied' },
  { value: 'bounced', label: 'Bounced' },
];

export function OutreachList({ campaignId, investorId }: OutreachListProps) {
  const [statusFilter, setStatusFilter] = useState<OutreachStatus | ''>('');
  
  const { data: outreach, isLoading, error, refetch } = useOutreach({
    campaign_id: campaignId,
    investor_id: investorId,
    status: statusFilter || undefined,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Select
          options={statusOptions}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OutreachStatus | '')}
          className="w-48"
        />
        
        <div className="flex-1" />
        
        <div className="text-sm text-gray-400">
          {outreach?.length ?? 0} outreach{outreach?.length !== 1 ? '' : ''}
        </div>
      </div>

      {/* List */}
      {!outreach || outreach.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-8 h-8 text-gray-500" />}
          title="No outreach found"
          description={statusFilter ? 'Try changing your filters' : 'Create a sequence to start outreach'}
        />
      ) : (
        <div className="space-y-4">
          {outreach.map((item) => (
            <OutreachCard key={item.id} outreach={item} />
          ))}
        </div>
      )}
    </div>
  );
}
