'use client';

import { Building2, Mail, Linkedin, TrendingUp, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Investor } from '@/types';

interface InvestorCardProps {
  investor: Investor;
  onSelect?: (investor: Investor) => void;
  onMenuClick?: (investor: Investor) => void;
  selected?: boolean;
}

export function InvestorCard({ investor, onSelect, onMenuClick, selected }: InvestorCardProps) {
  const checkSize = investor.check_size_min && investor.check_size_max
    ? `$${(investor.check_size_min / 1000).toFixed(0)}K - $${(investor.check_size_max / 1000000).toFixed(1)}M`
    : investor.check_size_min
    ? `$${(investor.check_size_min / 1000).toFixed(0)}K+`
    : null;

  const fitScoreColor =
    (investor.fit_score ?? 0) >= 80 ? 'text-green-600' :
    (investor.fit_score ?? 0) >= 60 ? 'text-amber-600' :
    (investor.fit_score ?? 0) >= 40 ? 'text-orange-600' :
    'text-neutral-400';

  return (
    <Card
      hover
      className={`
        cursor-pointer transition-all
        ${selected ? 'ring-2 ring-neutral-900 border-neutral-900' : ''}
      `}
      onClick={() => onSelect?.(investor)}
    >
      <div className="flex items-start justify-between">
        {/* Left: Info */}
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white font-semibold">
            {investor.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h3 className="font-semibold text-neutral-900">{investor.name}</h3>

            {investor.firm && (
              <div className="flex items-center gap-1.5 text-sm text-neutral-500 mt-0.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{investor.firm}</span>
                {investor.title && <span className="text-neutral-400">· {investor.title}</span>}
              </div>
            )}

            {/* Contact Icons */}
            <div className="flex items-center gap-2 mt-2">
              {investor.email && (
                <a
                  href={`mailto:${investor.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
                  title={investor.email}
                >
                  <Mail className="w-4 h-4" />
                </a>
              )}
              {investor.linkedin_url && (
                <a
                  href={investor.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right: Score + Menu */}
        <div className="flex items-start gap-2">
          {investor.fit_score !== null && (
            <div className="text-right">
              <p className="text-xs text-neutral-500">Fit Score</p>
              <p className={`text-lg font-bold ${fitScoreColor}`}>
                {investor.fit_score}
              </p>
            </div>
          )}

          {onMenuClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMenuClick(investor);
              }}
              className="p-1 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-neutral-200">
        {checkSize && (
          <div className="flex items-center gap-1.5 text-sm">
            <TrendingUp className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-600">{checkSize}</span>
          </div>
        )}

        {investor.stages.length > 0 && (
          <div className="flex items-center gap-1">
            {investor.stages.slice(0, 2).map((stage) => (
              <span
                key={stage}
                className="px-1.5 py-0.5 bg-neutral-100 rounded text-xs text-neutral-600"
              >
                {stage.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}

        {investor.sectors.length > 0 && (
          <div className="flex items-center gap-1 ml-auto">
            {investor.sectors.slice(0, 2).map((sector) => (
              <span
                key={sector}
                className="px-1.5 py-0.5 bg-neutral-900 text-white rounded text-xs"
              >
                {sector}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
