'use client';

import type { ReactNode } from 'react';
import { Button } from './button';
import { Inbox, Plus, Search } from 'lucide-react';

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-6 sm:p-12 text-center">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon ?? <Inbox className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />}
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-black mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <Button
          variant="primary"
          onClick={action.onClick}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Specific empty states
export function NoCampaignsState({ onCreateCampaign }: { onCreateCampaign: () => void }) {
  return (
    <EmptyState
      title="No campaigns yet"
      description="Create your first campaign to start reaching out to investors."
      action={{
        label: 'Create campaign',
        onClick: onCreateCampaign,
      }}
    />
  );
}

export function NoInvestorsState({ onAddInvestor }: { onAddInvestor: () => void }) {
  return (
    <EmptyState
      title="No investors yet"
      description="Import your investor list or add investors manually to get started."
      action={{
        label: 'Add investor',
        onClick: onAddInvestor,
      }}
    />
  );
}

export function NoSearchResultsState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-gray-500" />}
      title="No results found"
      description={`No results match "${query}". Try adjusting your search or filters.`}
    />
  );
}
