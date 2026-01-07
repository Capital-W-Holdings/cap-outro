'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import { SequenceList } from '@/components/sequences';
import { useCreateSequence } from '@/hooks';

export default function SequencesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSequenceName, setNewSequenceName] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const { mutate: createSequence, isLoading: isCreating, error: createError } = useCreateSequence();

  const handleCreateSequence = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleSubmitCreate = async () => {
    if (!newSequenceName.trim()) return;

    try {
      await createSequence({
        campaign_id: '1', // TODO: Select campaign
        name: newSequenceName.trim(),
      });
      setNewSequenceName('');
      setIsCreateModalOpen(false);
      setRefreshKey((k) => k + 1);
    } catch {
      // Error handled by hook
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

      <div className="flex-1 p-6 overflow-auto">
        <SequenceList key={refreshKey} onCreateSequence={handleCreateSequence} />
      </div>

      {/* Create Sequence Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Sequence"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Sequence Name"
            placeholder="e.g., Initial Outreach"
            value={newSequenceName}
            onChange={(e) => setNewSequenceName(e.target.value)}
            disabled={isCreating}
          />

          {createError && (
            <p className="text-sm text-red-500">{createError.message}</p>
          )}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmitCreate} 
            isLoading={isCreating}
            disabled={!newSequenceName.trim()}
          >
            Create
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
