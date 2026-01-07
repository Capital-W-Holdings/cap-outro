'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout';
import { InvestorList, ImportInvestorsModal } from '@/components/investors';

export default function InvestorsPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddInvestor = useCallback(() => {
    // For now, open import modal
    setIsImportModalOpen(true);
  }, []);

  const handleImportSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
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

      <div className="flex-1 p-6 overflow-auto">
        <InvestorList
          key={refreshKey}
          search={searchQuery}
          onAddInvestor={handleAddInvestor}
        />
      </div>

      <ImportInvestorsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}
