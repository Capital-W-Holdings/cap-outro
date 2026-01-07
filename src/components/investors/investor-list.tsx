'use client';

import { useInvestors } from '@/hooks';
import { InvestorCard } from './investor-card';
import { SkeletonCard, ErrorState, NoInvestorsState } from '@/components/ui';
import type { Investor } from '@/types';

interface InvestorListProps {
  search?: string;
  onAddInvestor: () => void;
  onSelectInvestor?: (investor: Investor) => void;
  selectedIds?: string[];
  selectable?: boolean;
}

export function InvestorList({ 
  search, 
  onAddInvestor, 
  onSelectInvestor,
  selectedIds = [],
  selectable = false,
}: InvestorListProps) {
  const { data: investors, isLoading, error, refetch } = useInvestors(search);

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
    return <NoInvestorsState onAddInvestor={onAddInvestor} />;
  }

  // Data loaded
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {investors.map((investor) => (
        <InvestorCard
          key={investor.id}
          investor={investor}
          onSelect={selectable ? onSelectInvestor : undefined}
          selected={selectedIds.includes(investor.id)}
        />
      ))}
    </div>
  );
}
