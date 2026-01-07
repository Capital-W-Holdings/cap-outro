'use client';

import { DollarSign, Users, Mail, Calendar } from 'lucide-react';
import { useCampaignStats } from '@/hooks';
import { StatCard, ProgressBar, FunnelChart, ActivityTimeline, type Activity } from '@/components/analytics';
import { LoadingPage, ErrorState, Card } from '@/components/ui';
import type { Campaign } from '@/types';

interface CampaignOverviewProps {
  campaign: Campaign;
}

// Mock activities for demo
const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'committed',
    title: 'Investment committed',
    investor: 'Sarah Chen (Sequoia)',
    description: '$500K committed',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    type: 'meeting_held',
    title: 'Meeting completed',
    investor: 'Mike Johnson (a16z)',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    type: 'email_replied',
    title: 'Email reply received',
    investor: 'Lisa Park (First Round)',
    description: 'Interested in scheduling a call',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: '4',
    type: 'email_opened',
    title: 'Email opened',
    investor: 'David Kim (Accel)',
    timestamp: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: '5',
    type: 'meeting_scheduled',
    title: 'Meeting scheduled',
    investor: 'Emily Wong (Greylock)',
    description: 'Tomorrow at 2:00 PM',
    timestamp: new Date(Date.now() - 43200000).toISOString(),
  },
];

export function CampaignOverview({ campaign }: CampaignOverviewProps) {
  const { data: stats, isLoading, error, refetch } = useCampaignStats(campaign.id);

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!stats) return <ErrorState error="Failed to load stats" />;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  const funnelStages = [
    { label: 'Total Investors', value: stats.total_investors, color: 'bg-gray-500' },
    { label: 'Contacted', value: stats.contacted, color: 'bg-blue-500' },
    { label: 'Responded', value: stats.responded, color: 'bg-cyan-500' },
    { label: 'Meetings', value: stats.meetings, color: 'bg-purple-500' },
    { label: 'Committed', value: stats.committed, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Fundraising Progress */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Fundraising Progress</h3>
            <p className="text-sm text-gray-400">
              {formatCurrency(stats.committed_amount)} committed of {formatCurrency(stats.target_amount)} target
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-brand-gold">{stats.percent_committed}%</p>
            <p className="text-sm text-gray-400">committed</p>
          </div>
        </div>
        <ProgressBar
          value={stats.committed_amount + stats.soft_amount}
          max={stats.target_amount}
          showPercentage={false}
          size="lg"
          segments={[
            { value: stats.committed_amount, color: 'bg-green-500', label: 'Committed' },
            { value: stats.soft_amount, color: 'bg-yellow-500', label: 'Soft Commits' },
          ]}
        />
        <div className="flex items-center gap-6 mt-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400">Committed: {formatCurrency(stats.committed_amount)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-400">Soft Commits: {formatCurrency(stats.soft_amount)}</span>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Investors"
          value={stats.total_investors}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          label="Response Rate"
          value={`${stats.response_rate.toFixed(0)}%`}
          icon={<Mail className="w-5 h-5" />}
          trend={{ value: 12, label: 'vs last week' }}
        />
        <StatCard
          label="Meeting Rate"
          value={`${stats.meeting_rate.toFixed(0)}%`}
          icon={<Calendar className="w-5 h-5" />}
          trend={{ value: 8, label: 'vs last week' }}
        />
        <StatCard
          label="Committed"
          value={formatCurrency(stats.committed_amount)}
          icon={<DollarSign className="w-5 h-5" />}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Investor Funnel</h3>
          <FunnelChart stages={funnelStages} />
        </Card>

        {/* Email Stats */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-4">Outreach Performance</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Emails Sent</span>
                <span className="text-sm font-medium text-white">{stats.outreach_sent}</span>
              </div>
              <ProgressBar value={stats.outreach_sent} max={stats.outreach_sent} showPercentage={false} size="sm" color="blue" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Open Rate</span>
                <span className="text-sm font-medium text-white">{stats.open_rate.toFixed(1)}%</span>
              </div>
              <ProgressBar value={stats.open_rate} max={100} showPercentage={false} size="sm" color="green" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">Click Rate</span>
                <span className="text-sm font-medium text-white">{stats.click_rate.toFixed(1)}%</span>
              </div>
              <ProgressBar value={stats.click_rate} max={100} showPercentage={false} size="sm" color="purple" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <ActivityTimeline activities={mockActivities} maxItems={5} />
      </Card>
    </div>
  );
}
