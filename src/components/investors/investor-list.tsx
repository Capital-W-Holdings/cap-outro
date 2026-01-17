'use client';

import { Users } from 'lucide-react';
import { useInvestors, type InvestorFilters } from '@/hooks';
import { InvestorCard } from './investor-card';
import { SkeletonCard, ErrorState, NoInvestorsState } from '@/components/ui';
import type { Investor } from '@/types';

interface InvestorListProps {
  filters?: InvestorFilters;
  onAddInvestor: () => void;
  onSelectInvestor?: (investor: Investor) => void;
  onToggleSelect?: (investor: Investor) => void;
  onViewInvestor?: (investor: Investor) => void;
  selectedIds?: string[];
  selectable?: boolean;
}

export function InvestorList({
  filters = {},
  onAddInvestor,
  onSelectInvestor,
  onToggleSelect,
  onViewInvestor,
  selectedIds = [],
  selectable = false,
}: InvestorListProps) {
  const { data: investors, meta, isLoading, error, refetch } = useInvestors(filters);
  const totalCount = meta?.total ?? investors?.length ?? 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  // Empty state
  if (!investors || investors.length === 0) {
    const hasFilters =
      filters.search ||
      (filters.stages?.length ?? 0) > 0 ||
      (filters.sectors?.length ?? 0) > 0 ||
      filters.check_size_min ||
      filters.check_size_max ||
      filters.fit_score_min;

    if (hasFilters) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No investors match your filters</p>
          <button
            onClick={onAddInvestor}
            className="text-black hover:underline text-sm font-medium"
          >
            Import investors to grow your database
          </button>
        </div>
      );
    }

    return <NoInvestorsState onAddInvestor={onAddInvestor} />;
  }

  // Data loaded
  return (
    <div>
      {/* Investor Count */}
      <div className="flex items-center gap-2 mb-4 text-gray-600">
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">
          {totalCount.toLocaleString()} investor{totalCount !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Investor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {investors.map((investor) => (
          <InvestorCard
            key={investor.id}
            investor={investor}
            onSelect={onViewInvestor}
            onToggleSelect={onToggleSelect}
            selected={selectedIds.includes(investor.id)}
            selectable={selectable}
          />
        ))}
      </div>
    </div>
  );
}
