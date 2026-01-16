'use client';

import { useState, useCallback } from 'react';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import { Select } from '@/components/ui/select';
import { useUpdateInvestor, STAGE_OPTIONS, SECTOR_OPTIONS } from '@/hooks/use-investors';
import type { Investor } from '@/types';

interface InvestorEditModalProps {
  investor: Investor;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function InvestorEditModal({
  investor,
  isOpen,
  onClose,
  onSuccess,
}: InvestorEditModalProps) {
  const { mutate: updateInvestor, isLoading, error } = useUpdateInvestor(investor.id);

  const [formData, setFormData] = useState({
    name: investor.name,
    email: investor.email ?? '',
    firm: investor.firm ?? '',
    title: investor.title ?? '',
    linkedin_url: investor.linkedin_url ?? '',
    check_size_min: investor.check_size_min?.toString() ?? '',
    check_size_max: investor.check_size_max?.toString() ?? '',
    stages: investor.stages,
    sectors: investor.sectors,
    fit_score: investor.fit_score?.toString() ?? '',
  });

  const handleChange = useCallback(
    (field: string, value: string | string[]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const toggleArrayItem = useCallback(
    (field: 'stages' | 'sectors', value: string) => {
      setFormData((prev) => {
        const current = prev[field];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [field]: updated };
      });
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateInvestor({
        name: formData.name,
        email: formData.email || undefined,
        firm: formData.firm || undefined,
        title: formData.title || undefined,
        linkedin_url: formData.linkedin_url || undefined,
        check_size_min: formData.check_size_min
          ? parseInt(formData.check_size_min, 10)
          : undefined,
        check_size_max: formData.check_size_max
          ? parseInt(formData.check_size_max, 10)
          : undefined,
        stages: formData.stages,
        sectors: formData.sectors,
      });
      onSuccess();
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Investor" size="lg">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Firm"
              value={formData.firm}
              onChange={(e) => handleChange('firm', e.target.value)}
            />
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          <Input
            label="LinkedIn URL"
            type="url"
            value={formData.linkedin_url}
            onChange={(e) => handleChange('linkedin_url', e.target.value)}
            placeholder="https://linkedin.com/in/..."
          />

          {/* Check Size */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Check Size ($)"
              type="number"
              value={formData.check_size_min}
              onChange={(e) => handleChange('check_size_min', e.target.value)}
              placeholder="e.g., 100000"
            />
            <Input
              label="Max Check Size ($)"
              type="number"
              value={formData.check_size_max}
              onChange={(e) => handleChange('check_size_max', e.target.value)}
              placeholder="e.g., 1000000"
            />
          </div>

          {/* Fit Score */}
          <Input
            label="Fit Score (0-100)"
            type="number"
            min="0"
            max="100"
            value={formData.fit_score}
            onChange={(e) => handleChange('fit_score', e.target.value)}
            placeholder="e.g., 85"
          />

          {/* Stages */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Investment Stages
            </label>
            <div className="flex flex-wrap gap-2">
              {STAGE_OPTIONS.map((stage) => (
                <button
                  key={stage.value}
                  type="button"
                  onClick={() => toggleArrayItem('stages', stage.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    formData.stages.includes(stage.value)
                      ? 'bg-brand-gold text-dark-900'
                      : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Focus Sectors
            </label>
            <div className="flex flex-wrap gap-2">
              {SECTOR_OPTIONS.map((sector) => (
                <button
                  key={sector.value}
                  type="button"
                  onClick={() => toggleArrayItem('sectors', sector.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    formData.sectors.includes(sector.value)
                      ? 'bg-brand-gold text-dark-900'
                      : 'bg-dark-600 text-gray-300 hover:bg-dark-500'
                  }`}
                >
                  {sector.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-500 mt-4">{error.message}</p>}

        <ModalFooter>
          <Button variant="ghost" onClick={onClose} type="button" disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
