'use client';

import { useState, useCallback } from 'react';
import { Filter, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HelpTooltip } from '@/components/ui/help-tooltip';
import {
  type InvestorFilters,
  type ContactMethod,
  STAGE_OPTIONS,
  SECTOR_OPTIONS,
  CHECK_SIZE_OPTIONS,
  CONTACT_METHOD_OPTIONS,
} from '@/hooks/use-investors';

interface InvestorFiltersProps {
  filters: InvestorFilters;
  onChange: (filters: InvestorFilters) => void;
}

export function InvestorFiltersBar({ filters, onChange }: InvestorFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeFilterCount = [
    filters.stages?.length ?? 0,
    filters.sectors?.length ?? 0,
    filters.check_size_min ? 1 : 0,
    filters.check_size_max ? 1 : 0,
    filters.fit_score_min ? 1 : 0,
    filters.contact_method ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const clearFilters = useCallback(() => {
    onChange({
      search: filters.search,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    });
  }, [onChange, filters.search, filters.sort_by, filters.sort_order]);

  const toggleStage = useCallback(
    (stage: string) => {
      const current = filters.stages ?? [];
      const updated = current.includes(stage)
        ? current.filter((s) => s !== stage)
        : [...current, stage];
      onChange({ ...filters, stages: updated });
    },
    [filters, onChange]
  );

  const toggleSector = useCallback(
    (sector: string) => {
      const current = filters.sectors ?? [];
      const updated = current.includes(sector)
        ? current.filter((s) => s !== sector)
        : [...current, sector];
      onChange({ ...filters, sectors: updated });
    },
    [filters, onChange]
  );

  const setCheckSize = useCallback(
    (min: number | undefined, max: number | undefined) => {
      onChange({ ...filters, check_size_min: min, check_size_max: max });
    },
    [filters, onChange]
  );

  const setFitScoreMin = useCallback(
    (min: number | undefined) => {
      onChange({ ...filters, fit_score_min: min });
    },
    [filters, onChange]
  );

  const setContactMethod = useCallback(
    (method: ContactMethod | undefined) => {
      onChange({ ...filters, contact_method: method });
    },
    [filters, onChange]
  );

  const setSortBy = useCallback(
    (sort_by: InvestorFilters['sort_by'], sort_order: InvestorFilters['sort_order']) => {
      onChange({ ...filters, sort_by, sort_order });
    },
    [filters, onChange]
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Filter Toggle Bar */}
      <div className="flex items-center justify-between p-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
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
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>

        <div className="flex items-center gap-3">
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Sort by:</span>
            <select
              value={`${filters.sort_by ?? 'created_at'}-${filters.sort_order ?? 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [
                  InvestorFilters['sort_by'],
                  InvestorFilters['sort_order']
                ];
                setSortBy(sortBy, sortOrder);
              }}
              className="bg-white border border-gray-300 rounded px-2 py-1 text-sm text-black focus:outline-none focus:ring-1 focus:ring-black"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="fit_score-desc">Highest Fit Score</option>
              <option value="check_size_max-desc">Largest Check Size</option>
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-black transition-colors"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Investment Stage */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <label className="text-xs font-medium text-gray-600">
                Investment Stage
              </label>
              <HelpTooltip content="Filter by the stage of investment the investor typically focuses on (Seed, Series A, etc.)" />
            </div>
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
            <div className="flex items-center gap-1 mb-2">
              <label className="text-xs font-medium text-gray-600">
                Sectors
              </label>
              <HelpTooltip content="Filter by industry sectors the investor is interested in (SaaS, Healthcare, Fintech, etc.)" />
            </div>
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

          {/* Check Size Range and Filters */}
          <div className="flex flex-wrap items-end gap-3 sm:gap-4">
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Min Check Size
              </label>
              <select
                value={filters.check_size_min ?? ''}
                onChange={(e) =>
                  setCheckSize(
                    e.target.value ? parseInt(e.target.value, 10) : undefined,
                    filters.check_size_max
                  )
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

            <span className="hidden sm:block text-gray-500 pb-1.5">to</span>

            <div className="w-full sm:w-auto">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Max Check Size
              </label>
              <select
                value={filters.check_size_max ?? ''}
                onChange={(e) =>
                  setCheckSize(
                    filters.check_size_min,
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
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

            {/* Fit Score */}
            <div className="w-[calc(50%-0.375rem)] sm:w-auto">
              <div className="flex items-center gap-1 mb-2">
                <label className="text-xs font-medium text-gray-600">
                  Min Fit Score
                </label>
                <HelpTooltip content="Fit score (0-100) indicates how well the investor matches your company based on stage, sector, and check size alignment." />
              </div>
              <select
                value={filters.fit_score_min ?? ''}
                onChange={(e) =>
                  setFitScoreMin(e.target.value ? parseInt(e.target.value, 10) : undefined)
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

            {/* Contact Method */}
            <div className="w-[calc(50%-0.375rem)] sm:w-auto sm:ml-auto">
              <div className="flex items-center gap-1 mb-2">
                <label className="text-xs font-medium text-gray-600">
                  Contact Method
                </label>
                <HelpTooltip content="Filter by available contact methods: Email for investors with email addresses, LinkedIn for those with profiles." />
              </div>
              <select
                value={filters.contact_method ?? ''}
                onChange={(e) =>
                  setContactMethod(e.target.value ? (e.target.value as ContactMethod) : undefined)
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
          </div>
        </div>
      )}
    </div>
  );
}

// Active filter chips display
export function ActiveFilterChips({
  filters,
  onChange,
}: InvestorFiltersProps) {
  const removeStage = (stage: string) => {
    onChange({
      ...filters,
      stages: filters.stages?.filter((s) => s !== stage),
    });
  };

  const removeSector = (sector: string) => {
    onChange({
      ...filters,
      sectors: filters.sectors?.filter((s) => s !== sector),
    });
  };

  const hasActiveFilters =
    (filters.stages?.length ?? 0) > 0 ||
    (filters.sectors?.length ?? 0) > 0 ||
    filters.check_size_min ||
    filters.check_size_max ||
    filters.fit_score_min ||
    filters.contact_method;

  if (!hasActiveFilters) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3">
      <span className="text-xs text-gray-500">Active filters:</span>

      {filters.stages?.map((stage) => {
        const label = STAGE_OPTIONS.find((s) => s.value === stage)?.label ?? stage;
        return (
          <span
            key={stage}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-black"
          >
            {label}
            <button
              onClick={() => removeStage(stage)}
              className="text-gray-500 hover:text-black"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        );
      })}

      {filters.sectors?.map((sector) => {
        const label = SECTOR_OPTIONS.find((s) => s.value === sector)?.label ?? sector;
        return (
          <span
            key={sector}
            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-200 rounded text-xs text-black"
          >
            {label}
            <button
              onClick={() => removeSector(sector)}
              className="text-gray-500 hover:text-black"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        );
      })}

      {filters.check_size_min && (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-black">
          Min: ${(filters.check_size_min / 1000000).toFixed(1)}M
          <button
            onClick={() => onChange({ ...filters, check_size_min: undefined })}
            className="text-gray-500 hover:text-black"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {filters.check_size_max && (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs text-black">
          Max: ${(filters.check_size_max / 1000000).toFixed(1)}M
          <button
            onClick={() => onChange({ ...filters, check_size_max: undefined })}
            className="text-gray-500 hover:text-black"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {filters.fit_score_min && (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 rounded text-xs text-green-700">
          Fit: {filters.fit_score_min}+
          <button
            onClick={() => onChange({ ...filters, fit_score_min: undefined })}
            className="text-green-500 hover:text-green-700"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {filters.contact_method && (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 rounded text-xs text-blue-700">
          {CONTACT_METHOD_OPTIONS.find((o) => o.value === filters.contact_method)?.label ?? filters.contact_method}
          <button
            onClick={() => onChange({ ...filters, contact_method: undefined })}
            className="text-blue-500 hover:text-blue-700"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}
    </div>
  );
}
