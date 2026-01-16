'use client';

import { Mail, Linkedin, Phone, Calendar, MoreHorizontal, Eye, MousePointer, Reply } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Outreach, OutreachType, OutreachStatus } from '@/types';

interface OutreachCardProps {
  outreach: Outreach;
  onView?: (outreach: Outreach) => void;
}

const typeIcons: Record<OutreachType, typeof Mail> = {
  email: Mail,
  linkedin: Linkedin,
  call: Phone,
  meeting: Calendar,
  intro_request: Mail,
};

const statusConfig: Record<OutreachStatus, { label: string; color: string; icon?: typeof Eye }> = {
  scheduled: { label: 'Scheduled', color: 'bg-neutral-100 text-neutral-600' },
  sent: { label: 'Sent', color: 'bg-blue-100 text-blue-700' },
  opened: { label: 'Opened', color: 'bg-cyan-100 text-cyan-700', icon: Eye },
  clicked: { label: 'Clicked', color: 'bg-purple-100 text-purple-700', icon: MousePointer },
  replied: { label: 'Replied', color: 'bg-green-100 text-green-700', icon: Reply },
  bounced: { label: 'Bounced', color: 'bg-red-100 text-red-700' },
};

export function OutreachCard({ outreach, onView }: OutreachCardProps) {
  const TypeIcon = typeIcons[outreach.type];
  const status = statusConfig[outreach.status];
  const StatusIcon = status.icon;

  return (
    <Card hover className="group cursor-pointer" onClick={() => onView?.(outreach)}>
      <div className="flex items-start gap-4">
        {/* Type Icon */}
        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 flex-shrink-0">
          <TypeIcon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-neutral-900 truncate">
                {outreach.subject ?? 'No subject'}
              </p>
              <p className="text-sm text-neutral-500 mt-0.5">
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
            <p className="text-sm text-neutral-600 mt-2 line-clamp-2">
              {outreach.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center gap-4 mt-3 text-xs text-neutral-500">
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
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </Card>
  );
}
