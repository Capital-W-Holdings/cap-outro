'use client';

import { Mail, Linkedin, Phone, Calendar, MoreHorizontal, Eye, MousePointer, Reply, Copy, Trash2, Send, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Dropdown } from '@/components/ui/dropdown';
import type { Outreach, OutreachType, OutreachStatus } from '@/types';

interface OutreachCardProps {
  outreach: Outreach;
  onView?: (outreach: Outreach) => void;
  onResend?: (outreach: Outreach) => void;
  onCancel?: (outreach: Outreach) => void;
  onDelete?: (outreach: Outreach) => void;
}

const typeIcons: Record<OutreachType, typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  call: Phone,
  meeting: Calendar,
  intro_request: Mail,
};

const statusConfig: Record<OutreachStatus, { label: string; color: string; icon?: typeof Eye }> = {
  scheduled: { label: 'Scheduled', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  opened: { label: 'Opened', color: 'bg-cyan-100 text-cyan-700', icon: Eye },
  clicked: { label: 'Clicked', color: 'bg-purple-100 text-purple-700', icon: MousePointer },
  replied: { label: 'Replied', color: 'bg-green-100 text-green-700', icon: Reply },
  bounced: { label: 'Bounced', color: 'bg-red-100 text-red-700' },
};

export function OutreachCard({ outreach, onView, onResend, onCancel, onDelete }: OutreachCardProps) {
  const TypeIcon = typeIcons[outreach.type];
  const status = statusConfig[outreach.status];
  const StatusIcon = status.icon;

  // Build menu items based on status and available handlers
  const menuItems = [];

  if (onView) {
    menuItems.push({
      label: 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => onView(outreach),
    });
  }

  // Copy content to clipboard
  menuItems.push({
    label: 'Copy Content',
    icon: <Copy className="w-4 h-4" />,
    onClick: () => {
      const text = outreach.content?.replace(/<[^>]*>/g, '') || '';
      navigator.clipboard.writeText(text);
    },
  });

  // Resend option for sent/bounced emails
  if (onResend && (outreach.status === 'sent' || outreach.status === 'bounced')) {
    menuItems.push({
      label: 'Resend',
      icon: <Send className="w-4 h-4" />,
      onClick: () => onResend(outreach),
    });
  }

  // Cancel option for scheduled emails
  if (onCancel && outreach.status === 'scheduled') {
    menuItems.push({
      label: 'Cancel Scheduled',
      icon: <Clock className="w-4 h-4" />,
      onClick: () => onCancel(outreach),
    });
  }

  // Delete option
  if (onDelete) {
    menuItems.push({
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => onDelete(outreach),
      danger: true,
    });
  }

  return (
    <Card hover className="group cursor-pointer" onClick={() => onView?.(outreach)}>
      <div className="flex items-start gap-4">
        {/* Type Icon */}
        <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white flex-shrink-0">
          <TypeIcon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-black truncate">
                {outreach.subject ?? 'No subject'}
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                Investor ID: {outreach.investor_id.slice(0, 8)}...
              </p>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
              {StatusIcon && <StatusIcon className="w-3 h-3" />}
              {status.label}
            </div>
          </div>

          {/* Preview */}
          {outreach.content && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {outreach.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
            {outreach.sent_at ? (
              <span>Sent {new Date(outreach.sent_at).toLocaleDateString()}</span>
            ) : outreach.scheduled_at ? (
              <span>Scheduled for {new Date(outreach.scheduled_at).toLocaleDateString()}</span>
            ) : (
              <span>Created {new Date(outreach.created_at).toLocaleDateString()}</span>
            )}

            {outreach.opened_at && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Opened {new Date(outreach.opened_at).toLocaleDateString()}
              </span>
            )}

            {outreach.replied_at && (
              <span className="flex items-center gap-1 text-green-600">
                <Reply className="w-3 h-3" />
                Replied
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0">
          <Dropdown
            trigger={
              <button
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 active:bg-gray-200 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Outreach options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            }
            items={menuItems}
            align="right"
          />
        </div>
      </div>
    </Card>
  );
}
