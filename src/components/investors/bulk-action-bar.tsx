'use client';

import { X, Mail, UserPlus, Trash2, Tag } from 'lucide-react';
import { Button } from '@/components/ui';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAddToCampaign?: () => void;
  onSendEmail?: () => void;
  onAddTag?: () => void;
  onDelete?: () => void;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onAddToCampaign,
  onSendEmail,
  onAddTag,
  onDelete,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white border border-neutral-200 rounded-xl shadow-xl px-4 py-3 flex items-center gap-4">
        {/* Selection Count */}
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-white font-bold text-sm">
            {selectedCount}
          </span>
          <span className="text-sm text-neutral-600">
            {selectedCount === 1 ? 'investor' : 'investors'} selected
          </span>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-neutral-200" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onAddToCampaign && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onAddToCampaign}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              Add to Campaign
            </Button>
          )}

          {onSendEmail && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onSendEmail}
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Send Email
            </Button>
          )}

          {onAddTag && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAddTag}
              leftIcon={<Tag className="w-4 h-4" />}
            >
              Add Tag
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-600 border-red-300 hover:bg-red-50"
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          )}
        </div>

        {/* Clear Selection */}
        <button
          onClick={onClearSelection}
          className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
          title="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
