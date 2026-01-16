'use client';

import { useMemo } from 'react';
import {
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  ArrowRight,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ActivityItem {
  id: string;
  type: 'email_sent' | 'email_opened' | 'email_replied' | 'meeting' | 'call' | 'stage_change' | 'note';
  title: string;
  description?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface InvestorActivityTimelineProps {
  investorId: string;
}

// Mock activity data - in production, this would come from an API
function useMockActivityData(investorId: string): ActivityItem[] {
  return useMemo(
    () => [
      {
        id: '1',
        type: 'email_sent' as const,
        title: 'Initial outreach email sent',
        description: 'Subject: Introduction - Series A Opportunity',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '2',
        type: 'email_opened' as const,
        title: 'Email opened',
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '3',
        type: 'stage_change' as const,
        title: 'Stage changed',
        description: 'Moved from "Not Contacted" to "Contacted"',
        timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '4',
        type: 'email_replied' as const,
        title: 'Received reply',
        description: 'Interested in learning more, scheduled call',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: '5',
        type: 'meeting' as const,
        title: 'Intro call scheduled',
        description: 'Tomorrow at 2:00 PM EST',
        timestamp: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    [investorId]
  );
}

export function InvestorActivityTimeline({ investorId }: InvestorActivityTimelineProps) {
  const activities = useMockActivityData(investorId);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'email_sent':
        return <Mail className="w-4 h-4" />;
      case 'email_opened':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'email_replied':
        return <MessageSquare className="w-4 h-4 text-brand-gold" />;
      case 'meeting':
        return <Calendar className="w-4 h-4 text-blue-400" />;
      case 'call':
        return <Phone className="w-4 h-4" />;
      case 'stage_change':
        return <ArrowRight className="w-4 h-4 text-purple-400" />;
      case 'note':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'email_sent':
        return 'bg-gray-600';
      case 'email_opened':
        return 'bg-green-500/20';
      case 'email_replied':
        return 'bg-brand-gold/20';
      case 'meeting':
        return 'bg-blue-500/20';
      case 'call':
        return 'bg-cyan-500/20';
      case 'stage_change':
        return 'bg-purple-500/20';
      default:
        return 'bg-dark-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No activity recorded yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Activity will appear here when you start engaging with this investor
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-white mb-4">Activity Timeline</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-dark-600" />

        {/* Activity items */}
        <div className="space-y-4">
          {activities.map((activity, idx) => (
            <div key={activity.id} className="relative flex gap-4 pl-8">
              {/* Icon */}
              <div
                className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}
              >
                {getActivityIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4 border-b border-dark-600 last:border-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-medium">{activity.title}</p>
                    {activity.description && (
                      <p className="text-sm text-gray-400 mt-0.5">{activity.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
