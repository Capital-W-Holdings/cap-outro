'use client';

import { useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/layout';
import { InvestorList, ImportInvestorsModal, InvestorDetailModal, InvestorEditModal } from '@/components/investors';
import { InvestorFiltersBar, ActiveFilterChips } from '@/components/investors/investor-filters';
import type { InvestorFilters } from '@/hooks/use-investors';
import type { Investor } from '@/types';

export default function InvestorsPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<InvestorFilters>({});
  const [refreshKey, setRefreshKey] = useState(0);

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
    setIsImportModalOpen(true);
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

  return (
    <div className="flex flex-col h-full">
      <Header
        title="Investors"
        subtitle="Manage your investor database"
        showSearch
        onSearch={handleSearch}
        action={{
          label: 'Import CSV',
          onClick: () => setIsImportModalOpen(true),
        }}
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
        />
      </div>

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
    </div>
  );
}
