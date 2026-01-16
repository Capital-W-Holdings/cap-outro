'use client';

import { useState, useEffect } from 'react';
import { Send, Users, Mail, CheckCircle, AlertCircle, Play, Pause, Clock } from 'lucide-react';
import { Button, Card, Select, type SelectOption, Modal, ModalFooter } from '@/components/ui';
import { useToast } from '@/components/ui/toast';
import { useInvestors, useTemplates, useEmailAccounts, useCreateOutreach } from '@/hooks';
import { interpolateTemplate } from '@/lib/email';
import type { Campaign, Investor, EmailTemplate, EmailAccount } from '@/types';

interface CampaignRunnerProps {
  campaign: Campaign;
  onSuccess?: () => void;
}

interface SendProgress {
  total: number;
  sent: number;
  failed: number;
  current: string | null;
}

export function CampaignRunner({ campaign, onSuccess }: CampaignRunnerProps) {
  const [selectedInvestorIds, setSelectedInvestorIds] = useState<string[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState<SendProgress | null>(null);

  const { data: investors } = useInvestors();
  const { data: templates } = useTemplates();
  const { data: emailAccounts } = useEmailAccounts();
  const { mutate: createOutreach } = useCreateOutreach();
  const { addToast } = useToast();

  // Filter investors with emails
  const investorsWithEmail = investors?.filter(inv => inv.email) || [];

  // Auto-select default email account
  useEffect(() => {
    if (emailAccounts && emailAccounts.length > 0 && !selectedAccountId) {
      const defaultAccount = emailAccounts.find(a => a.is_default) ?? emailAccounts[0];
      if (defaultAccount) {
        setSelectedAccountId(defaultAccount.id);
      }
    }
  }, [emailAccounts, selectedAccountId]);

  const templateOptions: SelectOption[] = [
    { value: '', label: 'Select a template...' },
    ...(templates?.map(t => ({ value: t.id, label: t.name })) || []),
  ];

  const accountOptions: SelectOption[] = [
    { value: '', label: 'Select sending account...' },
    ...(emailAccounts?.map(a => ({
      value: a.id,
      label: `${a.email} (${a.emails_sent_today}/${a.daily_limit} today)`,
    })) || []),
  ];

  const selectedTemplate = templates?.find(t => t.id === selectedTemplateId);
  const selectedAccount = emailAccounts?.find(a => a.id === selectedAccountId);

  const toggleInvestorSelection = (id: string) => {
    setSelectedInvestorIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedInvestorIds(investorsWithEmail.map(i => i.id));
  };

  const deselectAll = () => {
    setSelectedInvestorIds([]);
  };

  const getPreviewContent = (investor: Investor) => {
    if (!selectedTemplate) return { subject: '', body: '' };

    const variables = {
      investor_name: investor.name,
      investor_first_name: investor.name.split(' ')[0],
      investor_firm: investor.firm || '',
      company_name: campaign.name.replace(' Raise', ''),
      raise_type: campaign.raise_type || '',
      raise_amount: campaign.raise_amount
        ? `$${(campaign.raise_amount / 1000000).toFixed(1)}M`
        : '',
    };

    return {
      subject: interpolateTemplate(selectedTemplate.subject, variables),
      body: interpolateTemplate(selectedTemplate.body, variables),
    };
  };

  const handleStartCampaign = async () => {
    if (selectedInvestorIds.length === 0) {
      addToast('Select at least one investor', 'error');
      return;
    }
    if (!selectedTemplateId) {
      addToast('Select an email template', 'error');
      return;
    }
    if (!selectedAccountId) {
      addToast('Select a sending account', 'error');
      return;
    }

    // Check daily limit
    const account = emailAccounts?.find(a => a.id === selectedAccountId);
    if (account && account.emails_sent_today + selectedInvestorIds.length > account.daily_limit) {
      addToast(`This would exceed your daily limit. You can send ${account.daily_limit - account.emails_sent_today} more emails today.`, 'warning');
      return;
    }

    setIsSending(true);
    setProgress({ total: selectedInvestorIds.length, sent: 0, failed: 0, current: null });

    let sent = 0;
    let failed = 0;

    for (const investorId of selectedInvestorIds) {
      const investor = investors?.find(i => i.id === investorId);
      if (!investor || !investor.email) continue;

      setProgress(prev => prev ? { ...prev, current: investor.name } : null);

      try {
        const { subject, body } = getPreviewContent(investor);

        await createOutreach({
          campaign_id: campaign.id,
          investor_id: investorId,
          type: 'email',
          subject,
          content: body,
          send_now: true,
          email_account_id: selectedAccountId,
        });

        sent++;
        setProgress(prev => prev ? { ...prev, sent } : null);

        // Small delay between sends to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        failed++;
        setProgress(prev => prev ? { ...prev, failed } : null);
        console.error(`Failed to send to ${investor.email}:`, error);
      }
    }

    setIsSending(false);
    setProgress(null);

    if (failed === 0) {
      addToast(`Successfully sent ${sent} emails!`, 'success');
    } else {
      addToast(`Sent ${sent} emails, ${failed} failed`, 'warning');
    }

    setSelectedInvestorIds([]);
    onSuccess?.();
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Send className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Send Campaign</h3>
            <p className="text-sm text-gray-400">Select investors and send personalized emails</p>
          </div>
        </div>
      </div>

      {/* No Email Accounts Warning */}
      {emailAccounts && emailAccounts.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-yellow-400 font-medium">No email accounts connected</p>
              <p className="text-sm text-yellow-400/70">
                Go to Settings to connect an email account before sending campaigns.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          label="Email Template"
          options={templateOptions}
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
        />
        <Select
          label="Sending Account"
          options={accountOptions}
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
        />
      </div>

      {/* Investor Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">
            Select Investors ({selectedInvestorIds.length} of {investorsWithEmail.length} selected)
          </label>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto border border-dark-600 rounded-lg">
          {investorsWithEmail.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <p>No investors with email addresses</p>
            </div>
          ) : (
            investorsWithEmail.map((investor) => (
              <label
                key={investor.id}
                className={`flex items-center gap-3 p-3 hover:bg-dark-700 cursor-pointer border-b border-dark-600 last:border-0 ${
                  selectedInvestorIds.includes(investor.id) ? 'bg-dark-700' : ''
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedInvestorIds.includes(investor.id)}
                  onChange={() => toggleInvestorSelection(investor.id)}
                  className="rounded border-dark-500 text-brand-gold focus:ring-brand-gold"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{investor.name}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {investor.firm && `${investor.firm} • `}
                    {investor.email}
                  </p>
                </div>
                {investor.fit_score && (
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    investor.fit_score >= 80 ? 'bg-green-500/10 text-green-400' :
                    investor.fit_score >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {investor.fit_score}%
                  </span>
                )}
              </label>
            ))
          )}
        </div>
      </div>

      {/* Preview & Send */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsPreviewOpen(true)}
          disabled={!selectedTemplateId || selectedInvestorIds.length === 0}
        >
          Preview Email
        </Button>

        <Button
          variant="primary"
          leftIcon={isSending ? <Clock className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          onClick={handleStartCampaign}
          disabled={isSending || selectedInvestorIds.length === 0 || !selectedTemplateId || !selectedAccountId}
        >
          {isSending
            ? `Sending ${progress?.sent || 0}/${progress?.total || 0}...`
            : `Send to ${selectedInvestorIds.length} Investor${selectedInvestorIds.length !== 1 ? 's' : ''}`
          }
        </Button>
      </div>

      {/* Progress Bar */}
      {progress && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Sending to: {progress.current || '...'}</span>
            <span>{progress.sent + progress.failed} / {progress.total}</span>
          </div>
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${((progress.sent + progress.failed) / progress.total) * 100}%` }}
            />
          </div>
          {progress.failed > 0 && (
            <p className="text-sm text-red-400 mt-1">{progress.failed} failed</p>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Email Preview"
        size="lg"
      >
        {selectedInvestorIds.length > 0 && selectedTemplate && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Preview for: {investors?.find(i => i.id === selectedInvestorIds[0])?.name}
            </p>

            <div className="p-4 bg-dark-700 rounded-lg">
              <label className="text-xs text-gray-500 uppercase">Subject</label>
              <p className="text-white font-medium mt-1">
                {getPreviewContent(investors?.find(i => i.id === selectedInvestorIds[0])!).subject}
              </p>
            </div>

            <div className="p-4 bg-dark-700 rounded-lg">
              <label className="text-xs text-gray-500 uppercase">Body</label>
              <div
                className="text-gray-300 mt-2 prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: getPreviewContent(investors?.find(i => i.id === selectedInvestorIds[0])!).body.replace(/\n/g, '<br>'),
                }}
              />
            </div>
          </div>
        )}

        <ModalFooter>
          <Button variant="ghost" onClick={() => setIsPreviewOpen(false)}>
            Close
          </Button>
        </ModalFooter>
      </Modal>
    </Card>
  );
}
