'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import {
  ArrowLeft,
  Building2,
  Mail,
  Linkedin,
  TrendingUp,
  Edit2,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useInvestor, useDeleteInvestor } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SkeletonCard, ErrorState } from '@/components/ui';
import { InvestorEditModal } from '@/components/investors/investor-edit-modal';
import { InvestorActivityTimeline } from '@/components/investors/investor-activity-timeline';
import { InvestorNotes } from '@/components/investors/investor-notes';

export default function InvestorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: investor, isLoading, error, refetch } = useInvestor(id);
  const { mutate: deleteInvestor, isLoading: isDeleting } = useDeleteInvestor(id);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'notes'>('overview');

  const handleBack = useCallback(() => {
    router.push('/investors');
  }, [router]);

  const handleDelete = useCallback(async () => {
    if (!confirm('Are you sure you want to delete this investor?')) return;

    try {
      await deleteInvestor();
      router.push('/investors');
    } catch (err) {
      console.error('Failed to delete investor:', err);
    }
  }, [deleteInvestor, router]);

  const handleEditSuccess = useCallback(() => {
    setIsEditModalOpen(false);
    refetch();
  }, [refetch]);

  if (isLoading) {
    return (
      <div className="p-6">
        <SkeletonCard />
      </div>
    );
  }

  if (error || !investor) {
    return (
      <div className="p-6">
        <ErrorState error={error ?? new Error('Investor not found')} onRetry={refetch} />
      </div>
    );
  }

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

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-black">{investor.name}</h1>
            {investor.firm && (
              <p className="text-sm text-gray-500">{investor.firm}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => setIsEditModalOpen(true)}
            leftIcon={<Edit2 className="w-4 h-4" />}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            isLoading={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-5xl mx-auto">
          {/* Top Section - Profile Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Profile Card */}
            <Card className="lg:col-span-2">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-black text-2xl font-semibold">
                  {investor.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-black">{investor.name}</h2>

                  {(investor.firm || investor.title) && (
                    <div className="flex items-center gap-2 text-gray-500 mt-1">
                      <Building2 className="w-4 h-4" />
                      <span>
                        {investor.title && `${investor.title}`}
                        {investor.title && investor.firm && ' at '}
                        {investor.firm}
                      </span>
                    </div>
                  )}

                  {/* Contact Links */}
                  <div className="flex items-center gap-3 mt-4">
                    {investor.email && (
                      <a
                        href={`mailto:${investor.email}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:text-black hover:bg-gray-200 transition-colors"
                      >
                        <Mail className="w-4 h-4" />
                        {investor.email}
                      </a>
                    )}
                    {investor.linkedin_url && (
                      <a
                        href={investor.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-gray-700 hover:text-black hover:bg-gray-200 transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                        LinkedIn
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Fit Score Card */}
            <Card>
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Fit Score</p>
                {investor.fit_score !== null ? (
                  <div
                    className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-3xl font-bold ${fitScoreColor}`}
                  >
                    {investor.fit_score}
                  </div>
                ) : (
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 text-gray-500 text-sm">
                    Not scored
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {investor.fit_score !== null
                    ? investor.fit_score >= 80
                      ? 'Excellent fit'
                      : investor.fit_score >= 60
                        ? 'Good fit'
                        : investor.fit_score >= 40
                          ? 'Moderate fit'
                          : 'Low fit'
                    : 'Score not calculated'}
                </p>
              </div>
            </Card>
          </div>

          {/* Investment Details */}
          <Card className="mb-6">
            <h3 className="text-lg font-semibold text-black mb-4">Investment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Check Size */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Check Size</p>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-black" />
                  <span className="text-black font-medium">
                    {checkSize ?? 'Not specified'}
                  </span>
                </div>
              </div>

              {/* Stages */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Investment Stages</p>
                {investor.stages.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {investor.stages.map((stage) => (
                      <span
                        key={stage}
                        className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                      >
                        {stage.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Not specified</span>
                )}
              </div>

              {/* Sectors */}
              <div>
                <p className="text-sm text-gray-500 mb-1">Focus Sectors</p>
                {investor.sectors.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {investor.sectors.map((sector) => (
                      <span
                        key={sector}
                        className="px-2 py-1 bg-gray-200 text-black rounded text-xs"
                      >
                        {sector}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-sm">Not specified</span>
                )}
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'overview'
                    ? 'text-black border-black'
                    : 'text-gray-500 border-transparent hover:text-black'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'activity'
                    ? 'text-black border-black'
                    : 'text-gray-500 border-transparent hover:text-black'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'notes'
                    ? 'text-black border-black'
                    : 'text-gray-500 border-transparent hover:text-black'
                }`}
              >
                Notes
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Warm Paths */}
              <Card>
                <h3 className="text-lg font-semibold text-black mb-4">Warm Intros</h3>
                {investor.warm_paths.length > 0 ? (
                  <ul className="space-y-3">
                    {investor.warm_paths.map((path, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="text-black font-medium">{path.connection_name}</p>
                          {path.connection_email && (
                            <p className="text-sm text-gray-500">{path.connection_email}</p>
                          )}
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            path.relationship_strength === 'strong'
                              ? 'bg-green-100 text-green-700'
                              : path.relationship_strength === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {path.relationship_strength}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">No warm intro paths identified</p>
                )}
              </Card>

              {/* Source Info */}
              <Card>
                <h3 className="text-lg font-semibold text-black mb-4">Source Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Source</dt>
                    <dd className="text-black capitalize">{investor.source}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Added</dt>
                    <dd className="text-black">
                      {new Date(investor.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
          )}

          {activeTab === 'activity' && <InvestorActivityTimeline investorId={id} />}

          {activeTab === 'notes' && <InvestorNotes investorId={id} />}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <InvestorEditModal
          investor={investor}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
