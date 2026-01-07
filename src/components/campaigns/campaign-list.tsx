'use client';

import { useCampaigns } from '@/hooks';
import { CampaignCard } from './campaign-card';
import { SkeletonCard, ErrorState, NoCampaignsState } from '@/components/ui';
import type { Campaign } from '@/types';

interface CampaignListProps {
  onCreateCampaign: () => void;
  onCampaignMenu?: (campaign: Campaign) => void;
}

export function CampaignList({ onCreateCampaign, onCampaignMenu }: CampaignListProps) {
  const { data: campaigns, isLoading, error, refetch } = useCampaigns();

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Empty state
  if (!campaigns || campaigns.length === 0) {
    return <NoCampaignsState onCreateCampaign={onCreateCampaign} />;
  }

  // Data loaded
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {campaigns.map((campaign) => (
        <CampaignCard 
          key={campaign.id} 
          campaign={campaign} 
          onMenuClick={onCampaignMenu}
        />
      ))}
    </div>
  );
}
