'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout';
import { Modal, ModalFooter, Button, Input, Select, type SelectOption } from '@/components/ui';
import { SequenceList } from '@/components/sequences';
import { useCreateSequence, useCampaigns } from '@/hooks';
import { useToast } from '@/components/ui/toast';

export default function SequencesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSequenceName, setNewSequenceName] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { mutate: createSequence, isLoading: isCreating, error: createError } = useCreateSequence();
  const { addToast } = useToast();

  // Build campaign options for select
  const campaignOptions: SelectOption[] = [
    { value: '', label: 'Select a campaign...' },
    ...(campaigns?.map((c) => ({ value: c.id, label: c.name })) ?? []),
  ];

  const handleCreateSequence = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setNewSequenceName('');
    setSelectedCampaignId('');
  };

  const handleSubmitCreate = async () => {
    if (!newSequenceName.trim() || !selectedCampaignId) return;

    try {
      await createSequence({
        campaign_id: selectedCampaignId,
        name: newSequenceName.trim(),
      });
      addToast(`Sequence "${newSequenceName}" created successfully`, 'success');
      handleCloseModal();
      setRefreshKey((k) => k + 1);
    } catch {
      addToast('Failed to create sequence', 'error');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Sequences"
        subtitle="Automate your investor outreach"
        action={{
          label: 'New Sequence',
          onClick: handleCreateSequence,
        }}
      />

      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        <SequenceList key={refreshKey} onCreateSequence={handleCreateSequence} />
      </div>

      {/* Create Sequence Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={handleCloseModal}
        title="Create Sequence"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Campaign"
            options={campaignOptions}
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            disabled={isCreating || campaignsLoading}
          />

          <Input
            label="Sequence Name"
            placeholder="e.g., Initial Outreach"
            value={newSequenceName}
            onChange={(e) => setNewSequenceName(e.target.value)}
            disabled={isCreating}
          />

          {!campaigns?.length && !campaignsLoading && (
            <p className="text-sm text-amber-600">
              You need to create a campaign first before creating sequences.
            </p>
          )}

          {createError && (
            <p className="text-sm text-red-500">{createError.message}</p>
          )}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={handleCloseModal} disabled={isCreating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmitCreate}
            isLoading={isCreating}
            disabled={!newSequenceName.trim() || !selectedCampaignId}
          >
            Create
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
