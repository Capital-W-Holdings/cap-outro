'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, Check, SlidersHorizontal, ChevronDown, X, Users } from 'lucide-react';
import { Modal, ModalFooter, Button, Input } from '@/components/ui';
import {
  useInvestors,
  useAddToPipeline,
  type InvestorFilters,
  type ContactMethod,
  STAGE_OPTIONS,
  SECTOR_OPTIONS,
  CHECK_SIZE_OPTIONS,
  CONTACT_METHOD_OPTIONS,
} from '@/hooks';
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<InvestorFilters>({});

  // Combine search with filters
  const combinedFilters = useMemo(
    () => ({
      ...filters,
      search: search || undefined,
    }),
    [filters, search]
  );

  const { data: investors, meta, isLoading } = useInvestors(combinedFilters);
  const { mutate: addToPipeline, isLoading: isAdding } = useAddToPipeline();

  const totalCount = meta?.total ?? investors?.length ?? 0;

  // Count active filters
  const activeFilterCount = [
    filters.stages?.length ?? 0,
    filters.sectors?.length ?? 0,
    filters.check_size_min ? 1 : 0,
    filters.check_size_max ? 1 : 0,
    filters.fit_score_min ? 1 : 0,
    filters.contact_method ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

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
      setFilters({});
      onSuccess?.();
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    setSearch('');
    setFilters({});
    setShowFilters(false);
    onClose();
  };

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const toggleStage = useCallback((stage: string) => {
    setFilters((prev) => {
      const current = prev.stages ?? [];
      const updated = current.includes(stage)
        ? current.filter((s) => s !== stage)
        : [...current, stage];
      return { ...prev, stages: updated };
    });
  }, []);

  const toggleSector = useCallback((sector: string) => {
    setFilters((prev) => {
      const current = prev.sectors ?? [];
      const updated = current.includes(sector)
        ? current.filter((s) => s !== sector)
        : [...current, sector];
      return { ...prev, sectors: updated };
    });
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Investors to Campaign" size="xl">
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

      {/* Filter Toggle & Count */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="text-sm font-medium">Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-1.5 py-0.5 bg-black text-white text-xs font-semibold rounded">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
          />
        </button>

        <div className="flex items-center gap-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm">
            {totalCount.toLocaleString()} investor{totalCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
          {/* Investment Stage */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Investment Stage
            </label>
            <div className="flex flex-wrap gap-2">
              {STAGE_OPTIONS.map((stage) => (
                <button
                  key={stage.value}
                  onClick={() => toggleStage(stage.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filters.stages?.includes(stage.value)
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {stage.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Sectors
            </label>
            <div className="flex flex-wrap gap-2">
              {SECTOR_OPTIONS.map((sector) => (
                <button
                  key={sector.value}
                  onClick={() => toggleSector(sector.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    filters.sectors?.includes(sector.value)
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sector.label}
                </button>
              ))}
            </div>
          </div>

          {/* Check Size, Fit Score, Contact Method */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Min Check Size
              </label>
              <select
                value={filters.check_size_min ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    check_size_min: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))
                }
                className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-black w-full sm:w-28 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">Any</option>
                {CHECK_SIZE_OPTIONS.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Max Check Size
              </label>
              <select
                value={filters.check_size_max ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    check_size_max: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))
                }
                className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-black w-full sm:w-28 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">Any</option>
                {CHECK_SIZE_OPTIONS.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-[calc(50%-0.375rem)] sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Min Fit Score
              </label>
              <select
                value={filters.fit_score_min ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    fit_score_min: e.target.value ? parseInt(e.target.value, 10) : undefined,
                  }))
                }
                className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-black w-full sm:w-24 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">Any</option>
                <option value="40">40+</option>
                <option value="60">60+</option>
                <option value="70">70+</option>
                <option value="80">80+</option>
                <option value="90">90+</option>
              </select>
            </div>

            <div className="w-[calc(50%-0.375rem)] sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Contact Method
              </label>
              <select
                value={filters.contact_method ?? ''}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    contact_method: e.target.value ? (e.target.value as ContactMethod) : undefined,
                  }))
                }
                className="bg-white border border-gray-300 rounded px-3 py-1.5 text-sm text-black w-full sm:w-32 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="">Any</option>
                {CONTACT_METHOD_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors pb-1.5"
              >
                <X className="w-3 h-3" />
                Clear all
              </button>
            )}
          </div>
        </div>
      )}

      {/* Investor List */}
      <div className="max-h-80 overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : !investors || investors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {search || activeFilterCount > 0 ? 'No investors match your criteria' : 'No investors in database'}
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
                    ? 'bg-gray-100 border-black'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {/* Checkbox */}
                <div
                  className={`
                  w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
                  ${isSelected ? 'bg-black border-black' : 'border-gray-400'}
                `}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                  {investor.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black truncate">{investor.name}</p>
                  {investor.firm && (
                    <p className="text-xs text-gray-600 truncate">{investor.firm}</p>
                  )}
                </div>

                {/* Stages */}
                {investor.stages.length > 0 && (
                  <div className="hidden sm:flex flex-wrap gap-1 max-w-32">
                    {investor.stages.slice(0, 2).map((stage) => (
                      <span
                        key={stage}
                        className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] text-gray-600"
                      >
                        {stage.replace('_', ' ')}
                      </span>
                    ))}
                    {investor.stages.length > 2 && (
                      <span className="text-[10px] text-gray-400">+{investor.stages.length - 2}</span>
                    )}
                  </div>
                )}

                {/* Fit Score */}
                {investor.fit_score !== null && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">Fit</p>
                    <p
                      className={`text-sm font-medium ${
                        investor.fit_score >= 80
                          ? 'text-green-600'
                          : investor.fit_score >= 60
                            ? 'text-yellow-600'
                            : 'text-gray-500'
                      }`}
                    >
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
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-700">
            <span className="font-medium text-black">{selectedIds.length}</span> investor
            {selectedIds.length !== 1 ? 's' : ''} selected
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
