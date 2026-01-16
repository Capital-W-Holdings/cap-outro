'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useTemplates, useDeleteTemplateById, useDuplicateTemplate } from '@/hooks';
import { TemplateCard } from './template-card';
import { SkeletonCard, ErrorState, EmptyState, Select, type SelectOption } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
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
  const { deleteTemplate, isLoading: isDeleting } = useDeleteTemplateById();
  const { duplicateTemplate, isLoading: isDuplicating } = useDuplicateTemplate();
  const { addToast } = useToast();

  const handleDelete = async (template: EmailTemplate) => {
    if (!confirm(`Delete "${template.name}"? This cannot be undone.`)) return;

    try {
      await deleteTemplate(template.id);
      addToast(`Template "${template.name}" deleted`, 'success');
      refetch();
    } catch {
      addToast('Failed to delete template', 'error');
    }
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      const newTemplate = await duplicateTemplate(template);
      addToast(`Template duplicated as "${newTemplate.name}"`, 'success');
      refetch();
    } catch {
      addToast('Failed to duplicate template', 'error');
    }
  };

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

        <div className="text-sm text-gray-500">
          {templates?.length ?? 0} template{templates?.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Loading overlay for delete/duplicate */}
      {(isDeleting || isDuplicating) && (
        <div className="fixed inset-0 bg-black/20 z-40 flex items-center justify-center">
          <div className="bg-white rounded-lg px-6 py-4 shadow-lg">
            <p className="text-gray-700">
              {isDeleting ? 'Deleting template...' : 'Duplicating template...'}
            </p>
          </div>
        </div>
      )}

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
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
