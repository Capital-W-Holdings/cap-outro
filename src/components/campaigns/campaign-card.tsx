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
  draft: { bg: 'bg-gray-500/10', text: 'text-gray-400' },
  active: { bg: 'bg-green-500/10', text: 'text-green-400' },
  paused: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  completed: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
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
            <h3 className="text-lg font-semibold text-white group-hover:text-brand-gold transition-colors">
              {campaign.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
              {campaign.raise_type && (
                <span className="text-xs text-gray-500">
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
              className="p-1 text-gray-500 hover:text-white hover:bg-dark-600 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-gold" />
            <div>
              <p className="text-sm text-gray-400">Target</p>
              <p className="text-white font-medium">{raiseAmount}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-gold" />
            <div>
              <p className="text-sm text-gray-400">Investors</p>
              <p className="text-white font-medium">--</p>
            </div>
          </div>
        </div>

        {/* Sectors */}
        {campaign.sector.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {campaign.sector.slice(0, 3).map((sector) => (
              <span
                key={sector}
                className="px-2 py-0.5 bg-dark-600 rounded text-xs text-gray-300"
              >
                {sector}
              </span>
            ))}
            {campaign.sector.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-gray-500">
                +{campaign.sector.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-dark-600 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
