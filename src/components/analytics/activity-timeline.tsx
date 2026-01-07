'use client';

import { Mail, Calendar, CheckCircle, XCircle, MessageSquare, Users } from 'lucide-react';

export interface Activity {
  id: string;
  type: 'email_sent' | 'email_opened' | 'email_replied' | 'meeting_scheduled' | 'meeting_held' | 'committed' | 'passed' | 'note';
  title: string;
  description?: string;
  investor?: string;
  timestamp: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
  maxItems?: number;
}

const activityIcons: Record<Activity['type'], typeof Mail> = {
  email_sent: Mail,
  email_opened: Mail,
  email_replied: MessageSquare,
  meeting_scheduled: Calendar,
  meeting_held: Users,
  committed: CheckCircle,
  passed: XCircle,
  note: MessageSquare,
};

const activityColors: Record<Activity['type'], string> = {
  email_sent: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  email_opened: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  email_replied: 'bg-green-500/10 text-green-400 border-green-500/20',
  meeting_scheduled: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  meeting_held: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
  committed: 'bg-brand-gold/10 text-brand-gold border-brand-gold/20',
  passed: 'bg-red-500/10 text-red-400 border-red-500/20',
  note: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

export function ActivityTimeline({ activities, maxItems = 10 }: ActivityTimelineProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (displayActivities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayActivities.map((activity, index) => {
        const Icon = activityIcons[activity.type];
        const colorClass = activityColors[activity.type];
        const isLast = index === displayActivities.length - 1;

        return (
          <div key={activity.id} className="flex gap-3">
            {/* Icon */}
            <div className="relative">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              {!isLast && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-px h-full bg-dark-600" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{activity.title}</p>
                  {activity.investor && (
                    <p className="text-sm text-gray-400">{activity.investor}</p>
                  )}
                  {activity.description && (
                    <p className="text-sm text-gray-500 mt-1">{activity.description}</p>
                  )}
                </div>
                <time className="text-xs text-gray-500 whitespace-nowrap">
                  {formatRelativeTime(activity.timestamp)}
                </time>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
