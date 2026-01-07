'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useTemplates } from '@/hooks';
import { TemplateCard } from './template-card';
import { SkeletonCard, ErrorState, EmptyState, Select, type SelectOption } from '@/components/ui';
import type { EmailTemplate, TemplateType } from '@/types';

interface TemplateListProps {
  onEdit?: (template: EmailTemplate) => void;
  onCreateTemplate?: () => void;
}

const typeOptions: SelectOption[] = [
  { value: '', label: 'All Types' },
  { value: 'initial', label: 'Initial Outreach' },
  { value: 'followup', label: 'Follow-up' },
  { value: 'intro_request', label: 'Intro Request' },
  { value: 'update', label: 'Update' },
];

export function TemplateList({ onEdit, onCreateTemplate }: TemplateListProps) {
  const [typeFilter, setTypeFilter] = useState<TemplateType | ''>('');
  const { data: templates, isLoading, error, refetch } = useTemplates(typeFilter || undefined);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <Select
          options={typeOptions}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TemplateType | '')}
          className="w-48"
        />
        
        <div className="flex-1" />
        
        <div className="text-sm text-gray-400">
          {templates?.length ?? 0} template{templates?.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* List */}
      {!templates || templates.length === 0 ? (
        <EmptyState
          icon={<Mail className="w-8 h-8 text-gray-500" />}
          title="No templates found"
          description={typeFilter ? 'Try changing your filters' : 'Create your first email template'}
          action={onCreateTemplate ? {
            label: 'Create Template',
            onClick: onCreateTemplate,
          } : undefined}
        />
      ) : (
        <div className="space-y-4">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={onEdit}
              onDelete={async (t) => {
                if (confirm('Delete this template?')) {
                  // TODO: Use delete mutation
                  console.log('Delete:', t.id);
                  refetch();
                }
              }}
              onDuplicate={(t) => {
                // TODO: Duplicate template
                console.log('Duplicate:', t.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
