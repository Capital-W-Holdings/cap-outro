'use client';

import { Building2, Mail, Linkedin, TrendingUp, MoreHorizontal, Check } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Investor } from '@/types';

interface InvestorCardProps {
  investor: Investor;
  onSelect?: (investor: Investor) => void;
  onToggleSelect?: (investor: Investor) => void;
  onMenuClick?: (investor: Investor) => void;
  selected?: boolean;
  selectable?: boolean;
}

export function InvestorCard({ investor, onSelect, onToggleSelect, onMenuClick, selected, selectable }: InvestorCardProps) {
  const checkSize = investor.check_size_min && investor.check_size_max
    ? `$${(investor.check_size_min / 1000).toFixed(0)}K - $${(investor.check_size_max / 1000000).toFixed(1)}M`
    : investor.check_size_min
    ? `$${(investor.check_size_min / 1000).toFixed(0)}K+`
    : null;

  const fitScoreColor =
    (investor.fit_score ?? 0) >= 80 ? 'text-green-600' :
    (investor.fit_score ?? 0) >= 60 ? 'text-yellow-600' :
    (investor.fit_score ?? 0) >= 40 ? 'text-orange-500' :
    'text-gray-400';

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSelect?.(investor);
  };

  return (
    <Card
      hover
      className={`
        cursor-pointer transition-all
        ${selected ? 'ring-2 ring-black border-black bg-gray-50' : ''}
      `}
      onClick={() => selectable ? onToggleSelect?.(investor) : onSelect?.(investor)}
    >
      <div className="flex items-start gap-3">
        {/* Selection Checkbox - Touch-friendly */}
        {selectable && (
          <button
            onClick={handleCheckboxClick}
            className={`
              w-6 h-6 sm:w-5 sm:h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-2 transition-colors
              ${selected
                ? 'bg-black border-black text-white'
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            aria-label={selected ? 'Deselect investor' : 'Select investor'}
          >
            {selected && <Check className="w-4 h-4 sm:w-3 sm:h-3" />}
          </button>
        )}

        {/* Avatar */}
        <div className="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-black flex items-center justify-center text-white font-semibold flex-shrink-0">
          {investor.name.charAt(0).toUpperCase()}
        </div>

        {/* Info - Flex-1 to take remaining space */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-black truncate">{investor.name}</h3>

              {investor.firm && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{investor.firm}</span>
                  {investor.title && <span className="text-gray-500 hidden sm:inline">· {investor.title}</span>}
                </div>
              )}
            </div>

            {/* Fit Score - Moved for better mobile layout */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {investor.fit_score !== null && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 hidden sm:block">Fit Score</p>
                  <p className={`text-base sm:text-lg font-bold ${fitScoreColor}`}>
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
                  className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors -mr-1"
                  aria-label="More options"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Contact Icons - Touch-friendly */}
          <div className="flex items-center gap-1 mt-2">
            {investor.email && (
              <a
                href={`mailto:${investor.email}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 -ml-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                title={investor.email}
                aria-label={`Email ${investor.name}`}
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
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                aria-label={`${investor.name}'s LinkedIn profile`}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Stats - Responsive wrapping */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3 sm:mt-4 pt-3 border-t border-gray-200">
        {checkSize && (
          <div className="flex items-center gap-1.5 text-sm">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <span className="text-gray-700">{checkSize}</span>
          </div>
        )}

        {investor.stages.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {investor.stages.slice(0, 2).map((stage) => (
              <span
                key={stage}
                className="px-1.5 py-0.5 bg-gray-100 rounded text-xs text-gray-600"
              >
                {stage.replace('_', ' ')}
              </span>
            ))}
          </div>
        )}

        {investor.sectors.length > 0 && (
          <div className="flex items-center gap-1 sm:ml-auto flex-wrap">
            {investor.sectors.slice(0, 2).map((sector) => (
              <span
                key={sector}
                className="px-1.5 py-0.5 bg-black/5 text-black rounded text-xs"
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
