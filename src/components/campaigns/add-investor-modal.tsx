'use client';

import { useState } from 'react';
import { Search, Check } from 'lucide-react';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import { useInvestors, useAddToPipeline } from '@/hooks';
import type { Investor } from '@/types';

interface AddInvestorToCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  onSuccess?: () => void;
}

export function AddInvestorToCampaignModal({
  isOpen,
  onClose,
  campaignId,
  onSuccess,
}: AddInvestorToCampaignModalProps) {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const { data: investors, isLoading } = useInvestors(search);
  const { mutate: addToPipeline, isLoading: isAdding } = useAddToPipeline();

  const handleToggleSelect = (investor: Investor) => {
    setSelectedIds((prev) =>
      prev.includes(investor.id)
        ? prev.filter((id) => id !== investor.id)
        : [...prev, investor.id]
    );
  };

  const handleAdd = async () => {
    try {
      // Add each selected investor to the pipeline
      for (const investorId of selectedIds) {
        await addToPipeline({
          campaign_id: campaignId,
          investor_id: investorId,
          stage: 'not_contacted',
        });
      }
      
      setSelectedIds([]);
      setSearch('');
      onSuccess?.();
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    setSearch('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Investors to Campaign" size="lg">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <Input
          type="text"
          placeholder="Search investors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Investor List */}
      <div className="max-h-96 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-gray-400">Loading...</div>
        ) : !investors || investors.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {search ? 'No investors found' : 'No investors in database'}
          </div>
        ) : (
          investors.map((investor) => {
            const isSelected = selectedIds.includes(investor.id);
            
            return (
              <button
                key={investor.id}
                onClick={() => handleToggleSelect(investor)}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left
                  ${isSelected 
                    ? 'bg-brand-gold/10 border-brand-gold' 
                    : 'bg-dark-700 border-dark-600 hover:border-dark-500'
                  }
                `}
              >
                {/* Checkbox */}
                <div className={`
                  w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
                  ${isSelected 
                    ? 'bg-brand-gold border-brand-gold' 
                    : 'border-gray-500'
                  }
                `}>
                  {isSelected && <Check className="w-3 h-3 text-dark-900" />}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center text-brand-gold text-sm font-semibold flex-shrink-0">
                  {investor.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{investor.name}</p>
                  {investor.firm && (
                    <p className="text-xs text-gray-400 truncate">{investor.firm}</p>
                  )}
                </div>

                {/* Fit Score */}
                {investor.fit_score !== null && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">Fit</p>
                    <p className={`text-sm font-medium ${
                      investor.fit_score >= 80 ? 'text-green-400' :
                      investor.fit_score >= 60 ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {investor.fit_score}
                    </p>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Selected Count */}
      {selectedIds.length > 0 && (
        <div className="mt-4 p-3 bg-dark-700 rounded-lg">
          <p className="text-sm text-gray-300">
            <span className="font-medium text-brand-gold">{selectedIds.length}</span> investor{selectedIds.length !== 1 ? 's' : ''} selected
          </p>
        </div>
      )}

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose} disabled={isAdding}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={selectedIds.length === 0}
          isLoading={isAdding}
        >
          Add to Campaign
        </Button>
      </ModalFooter>
    </Modal>
  );
}
