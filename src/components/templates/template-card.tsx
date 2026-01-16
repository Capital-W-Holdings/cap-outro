'use client';

import { Mail, Edit, Trash2, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { EmailTemplate, TemplateType } from '@/types';

interface TemplateCardProps {
  template: EmailTemplate;
  onEdit?: (template: EmailTemplate) => void;
  onDelete?: (template: EmailTemplate) => void;
  onDuplicate?: (template: EmailTemplate) => void;
}

const typeConfig: Record<TemplateType, { label: string; color: string }> = {
  initial: { label: 'Initial Outreach', color: 'bg-blue-500/10 text-blue-400' },
  followup: { label: 'Follow-up', color: 'bg-purple-500/10 text-purple-400' },
  intro_request: { label: 'Intro Request', color: 'bg-cyan-500/10 text-cyan-400' },
  update: { label: 'Update', color: 'bg-green-500/10 text-green-400' },
};

export function TemplateCard({ template, onEdit, onDelete, onDuplicate }: TemplateCardProps) {
  const config = typeConfig[template.type];

  return (
    <Card hover className="group">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center text-brand-gold flex-shrink-0">
          <Mail className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-white truncate">{template.name}</h3>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
          
          <p className="text-sm text-gray-400 truncate mb-2">{template.subject}</p>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>{template.variables.length} variables</span>
            <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={() => onEdit(template)}
              className="p-2 text-gray-500 hover:text-white hover:bg-dark-600 rounded transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(template)}
              className="p-2 text-gray-500 hover:text-white hover:bg-dark-600 rounded transition-colors"
              title="Duplicate"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(template)}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-dark-600 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
