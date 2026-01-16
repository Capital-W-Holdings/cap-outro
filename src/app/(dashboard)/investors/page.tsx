'use client';

import { useState, useCallback } from 'react';
import { Header } from '@/components/layout';
import { InvestorList, ImportInvestorsModal, SeedInvestorsModal } from '@/components/investors';
import { Button } from '@/components/ui';
import { Database } from 'lucide-react';

export default function InvestorsPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSeedModalOpen, setIsSeedModalOpen] = useState(false);
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

      {/* Quick Actions Bar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-neutral-50 border-b border-neutral-200">
        <span className="text-sm text-neutral-500">Quick actions:</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSeedModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Database className="w-4 h-4" />
          Seed Public Data
        </Button>
      </div>

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

      <SeedInvestorsModal
        isOpen={isSeedModalOpen}
        onClose={() => setIsSeedModalOpen(false)}
        onSuccess={handleImportSuccess}
      />
    </div>
  );
}
