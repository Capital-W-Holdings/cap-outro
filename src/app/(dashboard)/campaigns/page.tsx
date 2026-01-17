'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout';
import { CampaignList, CreateCampaignModal } from '@/components/campaigns';
import { SetupProgress } from '@/components/onboarding';

export default function CampaignsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateCampaign = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCreateSuccess = useCallback(() => {
    // Trigger list refresh
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Campaigns"
        subtitle="Manage your capital raising campaigns"
        help="Campaigns organize your fundraising efforts. Each campaign (e.g., 'Series A 2024') contains sequences and tracks overall progress toward your fundraising goals."
        action={{
          label: 'New Campaign',
          onClick: handleCreateCampaign,
        }}
      />

      <div className="flex-1 p-4 sm:p-6 overflow-auto space-y-6">
        {/* Setup Progress Checklist */}
        <SetupProgress />

        {/* Campaign List */}
        <CampaignList
          key={refreshKey}
          onCreateCampaign={handleCreateCampaign}
        />
      </div>

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
