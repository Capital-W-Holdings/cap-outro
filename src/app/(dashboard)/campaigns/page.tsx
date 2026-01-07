'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout';
import { CampaignList, CreateCampaignModal } from '@/components/campaigns';

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
        action={{
          label: 'New Campaign',
          onClick: handleCreateCampaign,
        }}
      />

      <div className="flex-1 p-6 overflow-auto">
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
