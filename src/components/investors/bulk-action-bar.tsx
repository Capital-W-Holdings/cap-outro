'use client';

import { X, Mail, UserPlus, Trash2, Tag, GitBranch, MoreHorizontal } from 'lucide-react';
import { Button, Dropdown } from '@/components/ui';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onAddToCampaign?: () => void;
  onAddToSequence?: () => void;
  onSendEmail?: () => void;
  onAddTag?: () => void;
  onDelete?: () => void;
}

export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onAddToCampaign,
  onAddToSequence,
  onSendEmail,
  onAddTag,
  onDelete,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  // Build dropdown items for mobile
  const mobileDropdownItems = [
    onAddToCampaign && {
      label: 'Add to Campaign',
      icon: <UserPlus className="w-4 h-4" />,
      onClick: onAddToCampaign,
    },
    onAddToSequence && {
      label: 'Add to Sequence',
      icon: <GitBranch className="w-4 h-4" />,
      onClick: onAddToSequence,
    },
    onSendEmail && {
      label: 'Send Email',
      icon: <Mail className="w-4 h-4" />,
      onClick: onSendEmail,
    },
    onAddTag && {
      label: 'Add Tag',
      icon: <Tag className="w-4 h-4" />,
      onClick: onAddTag,
    },
    onDelete && {
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      danger: true,
    },
  ].filter(Boolean) as Array<{ label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }>;

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] sm:w-auto">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-xl px-3 sm:px-4 py-3 flex items-center gap-3 sm:gap-4">
        {/* Selection Count */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white flex items-center justify-center text-gray-900 font-bold text-sm">
            {selectedCount}
          </span>
          <span className="text-sm text-gray-300 hidden sm:inline">
            {selectedCount === 1 ? 'investor' : 'investors'} selected
          </span>
          <span className="text-sm text-gray-300 sm:hidden">
            selected
          </span>
        </div>

        {/* Divider - Desktop only */}
        <div className="hidden sm:block h-6 w-px bg-gray-700" />

        {/* Desktop Actions - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-2">
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

          {onAddToSequence && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onAddToSequence}
              leftIcon={<GitBranch className="w-4 h-4" />}
            >
              Add to Sequence
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
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Add Tag
            </Button>
          )}

          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-red-400 border-red-400/30 hover:bg-red-400/10"
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete
            </Button>
          )}
        </div>

        {/* Mobile Actions Dropdown */}
        <div className="sm:hidden flex-1 flex justify-end">
          <Dropdown
            trigger={
              <Button
                variant="secondary"
                size="sm"
                rightIcon={<MoreHorizontal className="w-4 h-4" />}
              >
                Actions
              </Button>
            }
            items={mobileDropdownItems}
            align="right"
          />
        </div>

        {/* Clear Selection */}
        <button
          onClick={onClearSelection}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          title="Clear selection"
          aria-label="Clear selection"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
