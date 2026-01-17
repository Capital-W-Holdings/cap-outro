'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, Upload, ChevronDown } from 'lucide-react';
import { Header } from '@/components/layout';
import { InvestorList, ImportInvestorsModal, AddInvestorModal, InvestorDetailModal, InvestorEditModal, BulkActionBar } from '@/components/investors';
import { InvestorFiltersBar, ActiveFilterChips } from '@/components/investors/investor-filters';
import { Modal, ModalFooter, Button, Select, Dropdown } from '@/components/ui';
import { useSequences } from '@/hooks';
import type { InvestorFilters } from '@/hooks/use-investors';
import type { Investor } from '@/types';

export default function InvestorsPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<InvestorFilters>({});
  const [refreshKey, setRefreshKey] = useState(0);

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Sequence enrollment modal state
  const [isSequenceModalOpen, setIsSequenceModalOpen] = useState(false);
  const [selectedSequenceId, setSelectedSequenceId] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const { data: sequences } = useSequences();

  // Modal states
  const [selectedInvestor, setSelectedInvestor] = useState<Investor | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Merge search with other filters
  const combinedFilters = useMemo(
    () => ({
      ...filters,
      search: searchQuery || undefined,
    }),
    [filters, searchQuery]
  );

  const handleAddInvestor = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleAddSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleImportSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleViewInvestor = useCallback((investor: Investor) => {
    setSelectedInvestor(investor);
    setIsDetailModalOpen(true);
  }, []);

  const handleEditInvestor = useCallback((investor: Investor) => {
    setSelectedInvestor(investor);
    setIsDetailModalOpen(false);
    setIsEditModalOpen(true);
  }, []);

  const handleEditSuccess = useCallback(() => {
    setIsEditModalOpen(false);
    setRefreshKey((k) => k + 1);
    // Reopen detail modal with updated data
    if (selectedInvestor) {
      setIsDetailModalOpen(true);
    }
  }, [selectedInvestor]);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setSelectedInvestor(null);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
  }, []);

  const handleFiltersChange = useCallback((newFilters: InvestorFilters) => {
    setFilters(newFilters);
  }, []);

  // Selection handlers
  const handleToggleSelect = useCallback((investor: Investor) => {
    setSelectedIds(prev => {
      if (prev.includes(investor.id)) {
        return prev.filter(id => id !== investor.id);
      }
      return [...prev, investor.id];
    });
    if (!isSelectionMode) {
      setIsSelectionMode(true);
    }
  }, [isSelectionMode]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
    setIsSelectionMode(false);
  }, []);

  const handleAddToSequence = useCallback(() => {
    setEnrollError(null);
    setIsSequenceModalOpen(true);
  }, []);

  const handleEnrollInSequence = async () => {
    if (!selectedSequenceId || selectedIds.length === 0) return;

    setIsEnrolling(true);
    setEnrollError(null);
    try {
      const response = await fetch(`/api/sequences/${selectedSequenceId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investor_ids: selectedIds }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to enroll investors');
      }

      console.log('Enrolled:', result);

      // Clear selection and close modal
      setIsSequenceModalOpen(false);
      setSelectedSequenceId('');
      setSelectedIds([]);
      setIsSelectionMode(false);
      setEnrollError(null);
    } catch (err) {
      console.error('Error enrolling investors:', err);
      setEnrollError(err instanceof Error ? err.message : 'Failed to enroll investors');
    } finally {
      setIsEnrolling(false);
    }
  };

  // Sequence options for dropdown
  const sequenceOptions = useMemo(() => {
    const options = [{ value: '', label: 'Select a sequence...' }];
    if (sequences) {
      sequences.forEach(seq => {
        options.push({
          value: seq.id,
          label: `${seq.name} (${seq.status})`,
        });
      });
    }
    return options;
  }, [sequences]);

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Investors"
        subtitle="Manage your investor database"
        help="Your investor database. Add investors manually, import from CSV, filter by criteria, and select multiple investors to enroll them in outreach sequences."
        showSearch
        onSearch={handleSearch}
        customAction={
          <Dropdown
            trigger={
              <Button variant="primary" rightIcon={<ChevronDown className="w-4 h-4" />}>
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            }
            items={[
              {
                label: 'Add Investor',
                icon: <Plus className="w-4 h-4" />,
                onClick: () => setIsAddModalOpen(true),
              },
              {
                label: 'Import CSV',
                icon: <Upload className="w-4 h-4" />,
                onClick: () => setIsImportModalOpen(true),
              },
            ]}
          />
        }
      />

      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        {/* Filter Bar */}
        <div className="mb-4">
          <InvestorFiltersBar filters={combinedFilters} onChange={handleFiltersChange} />
          <ActiveFilterChips filters={combinedFilters} onChange={handleFiltersChange} />
        </div>

        {/* Investor List */}
        <InvestorList
          key={refreshKey}
          filters={combinedFilters}
          onAddInvestor={handleAddInvestor}
          onViewInvestor={handleViewInvestor}
          onToggleSelect={handleToggleSelect}
          selectedIds={selectedIds}
          selectable={true}
        />
      </div>

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={handleClearSelection}
        onAddToSequence={handleAddToSequence}
      />

      {/* Add Investor Modal */}
      <AddInvestorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Import Modal */}
      <ImportInvestorsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />

      {/* Investor Detail Modal */}
      <InvestorDetailModal
        investor={selectedInvestor}
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        onEdit={handleEditInvestor}
      />

      {/* Investor Edit Modal */}
      {selectedInvestor && (
        <InvestorEditModal
          investor={selectedInvestor}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Add to Sequence Modal */}
      <Modal
        isOpen={isSequenceModalOpen}
        onClose={() => setIsSequenceModalOpen(false)}
        title="Add to Sequence"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Enroll {selectedIds.length} investor{selectedIds.length !== 1 ? 's' : ''} in an outreach sequence.
          </p>

          <Select
            label="Select Sequence"
            options={sequenceOptions}
            value={selectedSequenceId}
            onChange={(e) => setSelectedSequenceId(e.target.value)}
          />

          {selectedSequenceId && (
            <p className="text-sm text-gray-500">
              Investors will be enrolled and will start receiving outreach based on the sequence steps.
            </p>
          )}

          {enrollError && (
            <p className="text-sm text-red-500">{enrollError}</p>
          )}
        </div>

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsSequenceModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleEnrollInSequence}
            isLoading={isEnrolling}
            disabled={!selectedSequenceId}
          >
            Enroll Investors
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
