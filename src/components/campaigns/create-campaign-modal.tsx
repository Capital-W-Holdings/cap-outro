'use client';

import { useState } from 'react';
import { Modal, ModalFooter, Button, Input, Select } from '@/components/ui';
import { useCreateCampaign } from '@/hooks';
import type { RaiseType } from '@/types';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const raiseTypeOptions = [
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'bridge', label: 'Bridge' },
  { value: 'note', label: 'Convertible Note' },
];

export function CreateCampaignModal({ isOpen, onClose, onSuccess }: CreateCampaignModalProps) {
  const [name, setName] = useState('');
  const [raiseAmount, setRaiseAmount] = useState('');
  const [raiseType, setRaiseType] = useState<RaiseType | ''>('');
  const [sectors, setSectors] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate, isLoading, error } = useCreateCampaign();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Basic validation
    if (!name.trim()) {
      setErrors({ name: 'Campaign name is required' });
      return;
    }

    try {
      await mutate({
        name: name.trim(),
        raise_amount: raiseAmount ? parseFloat(raiseAmount) * 1000000 : undefined,
        raise_type: raiseType || undefined,
        sector: sectors ? sectors.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
      });

      // Reset form
      setName('');
      setRaiseAmount('');
      setRaiseType('');
      setSectors('');

      onSuccess?.();
      onClose();
    } catch {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    setName('');
    setRaiseAmount('');
    setRaiseType('');
    setSectors('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Campaign" size="md">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Campaign Name"
            placeholder="e.g., Series A Raise"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            disabled={isLoading}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Target Amount (M)"
              type="number"
              placeholder="e.g., 5"
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(e.target.value)}
              helperText="In millions"
              disabled={isLoading}
            />

            <Select
              label="Raise Type"
              options={raiseTypeOptions}
              value={raiseType}
              onChange={(e) => setRaiseType(e.target.value as RaiseType)}
              placeholder="Select type"
              disabled={isLoading}
            />
          </div>

          <Input
            label="Sectors"
            placeholder="e.g., fintech, ai, saas"
            value={sectors}
            onChange={(e) => setSectors(e.target.value)}
            helperText="Comma-separated"
            disabled={isLoading}
          />

          {error && (
            <p className="text-sm text-red-500">{error.message}</p>
          )}
        </div>

        <ModalFooter>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            Create Campaign
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
