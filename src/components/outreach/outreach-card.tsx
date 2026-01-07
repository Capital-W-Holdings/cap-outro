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
  scheduled: { label: 'Scheduled', color: 'bg-gray-500/10 text-gray-400' },
  sent: { label: 'Sent', color: 'bg-blue-500/10 text-blue-400' },
  opened: { label: 'Opened', color: 'bg-cyan-500/10 text-cyan-400', icon: Eye },
  clicked: { label: 'Clicked', color: 'bg-purple-500/10 text-purple-400', icon: MousePointer },
  replied: { label: 'Replied', color: 'bg-green-500/10 text-green-400', icon: Reply },
  bounced: { label: 'Bounced', color: 'bg-red-500/10 text-red-400' },
};

export function OutreachCard({ outreach, onView }: OutreachCardProps) {
  const TypeIcon = typeIcons[outreach.type];
  const status = statusConfig[outreach.status];
  const StatusIcon = status.icon;

  return (
    <Card hover className="group cursor-pointer" onClick={() => onView?.(outreach)}>
      <div className="flex items-start gap-4">
        {/* Type Icon */}
        <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center text-brand-gold flex-shrink-0">
          <TypeIcon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white truncate">
                {outreach.subject ?? 'No subject'}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
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
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
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
              <span className="flex items-center gap-1 text-green-400">
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
          className="p-2 text-gray-500 hover:text-white hover:bg-dark-600 rounded opacity-0 group-hover:opacity-100 transition-all"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>
    </Card>
  );
}
