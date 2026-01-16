'use client';

import { useState } from 'react';
import {
  Building2,
  Mail,
  Linkedin,
  TrendingUp,
  Edit2,
  ExternalLink,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import { Modal, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import type { Investor } from '@/types';

interface InvestorDetailModalProps {
  investor: Investor | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (investor: Investor) => void;
  onSendEmail?: (investor: Investor) => void;
}

export function InvestorDetailModal({ investor, isOpen, onClose, onEdit, onSendEmail }: InvestorDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { addToast } = useToast();

  if (!investor) return null;

  const copyToClipboard = (text: string, field: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    addToast(`${label} copied to clipboard`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const checkSize =
    investor.check_size_min && investor.check_size_max
      ? `$${(investor.check_size_min / 1000).toFixed(0)}K - $${(investor.check_size_max / 1000000).toFixed(1)}M`
      : investor.check_size_min
        ? `$${(investor.check_size_min / 1000).toFixed(0)}K+`
        : null;

  const fitScoreColor =
    (investor.fit_score ?? 0) >= 80
      ? 'text-green-600 bg-green-100'
      : (investor.fit_score ?? 0) >= 60
        ? 'text-yellow-600 bg-yellow-100'
        : (investor.fit_score ?? 0) >= 40
          ? 'text-orange-600 bg-orange-100'
          : 'text-gray-600 bg-gray-100';

  const subtitle = investor.firm
    ? `${investor.title ? investor.title + ' at ' : ''}${investor.firm}`
    : investor.title || undefined;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title={investor.name} description={subtitle}>
      {/* Profile Header */}
      <div className="flex items-start gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center text-white text-xl font-semibold">
          {investor.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          {(investor.firm || investor.title) && (
            <div className="flex items-center gap-2 text-gray-600 mb-2">
              <Building2 className="w-4 h-4" />
              <span>
                {investor.title && `${investor.title}`}
                {investor.title && investor.firm && ' at '}
                {investor.firm && <span className="font-medium">{investor.firm}</span>}
              </span>
            </div>
          )}

          {/* Fit Score Badge */}
          {investor.fit_score !== null && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${fitScoreColor}`}>
              <span className="text-lg font-bold">{investor.fit_score}</span>
              <span className="text-sm">
                {investor.fit_score >= 80
                  ? 'Excellent fit'
                  : investor.fit_score >= 60
                    ? 'Good fit'
                    : investor.fit_score >= 40
                      ? 'Moderate fit'
                      : 'Low fit'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Contact Information
        </h3>
        <div className="space-y-2">
          {investor.email ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a href={`mailto:${investor.email}`} className="text-black font-medium hover:underline">
                    {investor.email}
                  </a>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(investor.email!, 'email', 'Email')}
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded transition-colors"
                title="Copy email"
              >
                {copiedField === 'email' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-400">
              <Mail className="w-5 h-5" />
              <span>No email available</span>
            </div>
          )}

          {investor.linkedin_url ? (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Linkedin className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-500">LinkedIn</p>
                  <a
                    href={investor.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black font-medium hover:underline flex items-center gap-1"
                  >
                    View Profile
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(investor.linkedin_url!, 'linkedin', 'LinkedIn URL')}
                className="p-2 text-gray-500 hover:text-black hover:bg-gray-200 rounded transition-colors"
                title="Copy LinkedIn URL"
              >
                {copiedField === 'linkedin' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg text-gray-400">
              <Linkedin className="w-5 h-5" />
              <span>No LinkedIn available</span>
            </div>
          )}
        </div>
      </div>

      {/* Investment Details */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Investment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-500">Check Size</p>
            </div>
            <p className="font-semibold text-black">{checkSize ?? 'Not specified'}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Investment Stages</p>
            {investor.stages.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {investor.stages.map((stage) => (
                  <span key={stage} className="px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-black">
                    {stage.replace('_', ' ')}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Not specified</p>
            )}
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Focus Sectors</p>
            {investor.sectors.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {investor.sectors.map((sector) => (
                  <span key={sector} className="px-2 py-0.5 bg-black text-white rounded text-xs">
                    {sector}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Not specified</p>
            )}
          </div>
        </div>
      </div>

      {/* Warm Intros */}
      {investor.warm_paths.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Warm Intro Paths
          </h3>
          <div className="space-y-2">
            {investor.warm_paths.map((path, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-black">{path.connection_name}</p>
                  {path.connection_email && (
                    <p className="text-sm text-gray-600">{path.connection_email}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    path.relationship_strength === 'strong'
                      ? 'bg-green-100 text-green-700'
                      : path.relationship_strength === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {path.relationship_strength}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source Info */}
      <div className="text-sm text-gray-500 flex items-center justify-between">
        <span>Source: <span className="capitalize">{investor.source}</span></span>
        <span>Added {new Date(investor.created_at).toLocaleDateString()}</span>
      </div>

      {/* Footer */}
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <div className="flex gap-2">
          {onEdit && (
            <Button
              variant="outline"
              onClick={() => onEdit(investor)}
              leftIcon={<Edit2 className="w-4 h-4" />}
            >
              Edit
            </Button>
          )}
          {onSendEmail && investor.email && (
            <Button
              variant="primary"
              onClick={() => onSendEmail(investor)}
              leftIcon={<Send className="w-4 h-4" />}
            >
              Send Email
            </Button>
          )}
        </div>
      </ModalFooter>
    </Modal>
  );
}
