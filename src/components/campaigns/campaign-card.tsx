'use client';

import Link from 'next/link';
import { MoreHorizontal, TrendingUp, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Campaign, CampaignStatus } from '@/types';

interface CampaignCardProps {
  campaign: Campaign;
  onMenuClick?: (campaign: Campaign) => void;
}

const statusColors: Record<CampaignStatus, { bg: string; text: string }> = {
  draft: { bg: 'bg-neutral-100', text: 'text-neutral-600' },
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  paused: { bg: 'bg-amber-100', text: 'text-amber-700' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export function CampaignCard({ campaign, onMenuClick }: CampaignCardProps) {
  const status = statusColors[campaign.status];
  const raiseAmount = campaign.raise_amount 
    ? `$${(campaign.raise_amount / 1000000).toFixed(1)}M` 
    : 'TBD';

  return (
    <Card hover className="relative group">
      <Link href={`/campaigns/${campaign.id}`} className="block">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors">
              {campaign.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
              {campaign.raise_type && (
                <span className="text-xs text-neutral-500">
                  {campaign.raise_type.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {onMenuClick && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMenuClick(campaign);
              }}
              className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neutral-900" />
            <div>
              <p className="text-sm text-neutral-500">Target</p>
              <p className="text-neutral-900 font-medium">{raiseAmount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-900" />
            <div>
              <p className="text-sm text-neutral-500">Investors</p>
              <p className="text-neutral-900 font-medium">--</p>
            </div>
          </div>
        </div>

        {/* Sectors */}
        {campaign.sector.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {campaign.sector.slice(0, 3).map((sector) => (
              <span
                key={sector}
                className="px-2 py-0.5 bg-neutral-100 rounded text-xs text-neutral-600"
              >
                {sector}
              </span>
            ))}
            {campaign.sector.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-neutral-500">
                +{campaign.sector.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-200 text-xs text-neutral-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
