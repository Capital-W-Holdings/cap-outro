'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Settings, Users, Kanban, GitBranch, Mail } from 'lucide-react';
import { 
  Button, 
  LoadingPage, 
  ErrorState, 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent,
} from '@/components/ui';
import { CampaignOverview, AddInvestorToCampaignModal } from '@/components/campaigns';
import { InvestorList } from '@/components/investors';
import { PipelineKanban } from '@/components/pipeline';
import { SequenceList } from '@/components/sequences';
import { useCampaign } from '@/hooks';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  
  const { data: campaign, isLoading, error, refetch } = useCampaign(campaignId);
  const [isAddInvestorModalOpen, setIsAddInvestorModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!campaign) return <ErrorState error="Campaign not found" />;

  const statusColors = {
    draft: 'bg-gray-500/10 text-gray-400',
    active: 'bg-green-500/10 text-green-400',
    paused: 'bg-yellow-500/10 text-yellow-400',
    completed: 'bg-blue-500/10 text-blue-400',
  };

  const handleAddInvestorSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-dark-600 bg-dark-800 px-6 py-4">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/campaigns">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Campaigns
            </Button>
          </Link>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{campaign.name}</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[campaign.status]}`}>
                {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              {campaign.raise_type && (
                <span>{campaign.raise_type.replace('_', ' ').toUpperCase()}</span>
              )}
              {campaign.raise_amount && (
                <span>Target: ${(campaign.raise_amount / 1000000).toFixed(1)}M</span>
              )}
              {campaign.sector.length > 0 && (
                <span>{campaign.sector.slice(0, 3).join(', ')}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAddInvestorModalOpen(true)}
            >
              Add Investors
            </Button>
            <Button variant="outline" leftIcon={<Settings className="w-4 h-4" />}>
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-3 border-b border-dark-600">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="investors">
              <Users className="w-4 h-4 mr-2" />
              Investors
            </TabsTrigger>
            <TabsTrigger value="pipeline">
              <Kanban className="w-4 h-4 mr-2" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="sequences">
              <GitBranch className="w-4 h-4 mr-2" />
              Sequences
            </TabsTrigger>
            <TabsTrigger value="outreach">
              <Mail className="w-4 h-4 mr-2" />
              Outreach
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="overview" className="p-6">
            <CampaignOverview key={refreshKey} campaign={campaign} />
          </TabsContent>

          <TabsContent value="investors" className="p-6">
            <InvestorList
              key={refreshKey}
              onAddInvestor={() => setIsAddInvestorModalOpen(true)}
            />
          </TabsContent>

          <TabsContent value="pipeline" className="h-full">
            <PipelineKanban key={refreshKey} campaignId={campaignId} />
          </TabsContent>

          <TabsContent value="sequences" className="p-6">
            <SequenceList
              key={refreshKey}
              campaignId={campaignId}
              onCreateSequence={() => {
                // TODO: Open create sequence modal
              }}
            />
          </TabsContent>

          <TabsContent value="outreach" className="p-6">
            <OutreachTab campaignId={campaignId} />
          </TabsContent>
        </div>
      </Tabs>

      {/* Add Investor Modal */}
      <AddInvestorToCampaignModal
        isOpen={isAddInvestorModalOpen}
        onClose={() => setIsAddInvestorModalOpen(false)}
        campaignId={campaignId}
        onSuccess={handleAddInvestorSuccess}
      />
    </div>
  );
}

// Outreach Tab Component
function OutreachTab({ campaignId }: { campaignId: string }) {
  const { data: outreach, isLoading, error, refetch } = useOutreachForCampaign(campaignId);

  if (isLoading) return <LoadingPage />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (!outreach || outreach.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="w-12 h-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No outreach yet</h3>
        <p className="text-gray-400 mb-4">Start a sequence to begin outreach to investors.</p>
        <Link href="/sequences">
          <Button variant="primary">Go to Sequences</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {outreach.map((item) => (
        <OutreachCard key={item.id} outreach={item} />
      ))}
    </div>
  );
}

// Simple outreach card
function OutreachCard({ outreach }: { outreach: { id: string; type: string; status: string; subject: string | null; sent_at: string | null; created_at: string } }) {
  const statusColors: Record<string, string> = {
    scheduled: 'bg-gray-500/10 text-gray-400',
    sent: 'bg-blue-500/10 text-blue-400',
    opened: 'bg-cyan-500/10 text-cyan-400',
    clicked: 'bg-purple-500/10 text-purple-400',
    replied: 'bg-green-500/10 text-green-400',
    bounced: 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="bg-dark-800 border border-dark-600 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-white">{outreach.subject ?? 'No subject'}</p>
          <p className="text-sm text-gray-400 mt-1">
            {outreach.sent_at 
              ? `Sent ${new Date(outreach.sent_at).toLocaleDateString()}`
              : `Scheduled`
            }
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[outreach.status] ?? statusColors.scheduled}`}>
          {outreach.status.charAt(0).toUpperCase() + outreach.status.slice(1)}
        </span>
      </div>
    </div>
  );
}

// Hook for outreach by campaign
function useOutreachForCampaign(campaignId: string) {
  return useFetch<Array<{ id: string; type: string; status: string; subject: string | null; sent_at: string | null; created_at: string }>>(`/api/outreach?campaign_id=${campaignId}`);
}

// Import useFetch at the top level
import { useFetch } from '@/hooks/use-fetch';
