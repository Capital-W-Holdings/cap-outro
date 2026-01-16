'use client';

import { useState, useEffect } from 'react';
import { Send, Clock } from 'lucide-react';
import { Modal, ModalFooter, Button, Input, Select, type SelectOption } from '@/components/ui';
import { useTemplates, useCreateOutreach } from '@/hooks';
import { interpolateTemplate, type TemplateVariables } from '@/lib/email';
import type { Investor, Campaign } from '@/types';

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  investor: Investor;
  campaign: Campaign;
  onSuccess?: () => void;
}

export function ComposeEmailModal({
  isOpen,
  onClose,
  investor,
  campaign,
  onSuccess,
}: ComposeEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [sendNow, setSendNow] = useState(true);
  const [scheduledDate, setScheduledDate] = useState('');

  const { data: templates } = useTemplates();
  const { mutate: createOutreach, isLoading: isSending, error } = useCreateOutreach();

  // Build template variables
  const variables: TemplateVariables = {
    investor_name: investor.name,
    investor_first_name: investor.name.split(' ')[0],
    investor_firm: investor.firm ?? undefined,
    company_name: campaign.name.replace(' Raise', ''), // Simple extraction
    raise_type: campaign.raise_type ?? undefined,
    raise_amount: campaign.raise_amount 
      ? `$${(campaign.raise_amount / 1000000).toFixed(1)}M` 
      : undefined,
  };

  // Apply template when selected
  useEffect(() => {
    if (selectedTemplateId && templates) {
      const template = templates.find((t) => t.id === selectedTemplateId);
      if (template) {
        setSubject(interpolateTemplate(template.subject, variables));
        setContent(interpolateTemplate(template.body, variables));
      }
    }
  }, [selectedTemplateId, templates]);

  const templateOptions: SelectOption[] = [
    { value: '', label: 'Select a template...' },
    ...(templates?.map((t) => ({ value: t.id, label: t.name })) ?? []),
  ];

  const handleSend = async () => {
    try {
      await createOutreach({
        campaign_id: campaign.id,
        investor_id: investor.id,
        type: 'email',
        subject,
        content,
        send_now: sendNow,
        scheduled_at: !sendNow && scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
      });

      // Reset form
      setSubject('');
      setContent('');
      setSelectedTemplateId('');
      setSendNow(true);
      setScheduledDate('');

      onSuccess?.();
      onClose();
    } catch {
      // Error handled by hook
    }
  };

  const handleClose = () => {
    setSubject('');
    setContent('');
    setSelectedTemplateId('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Compose Email" size="lg">
      <div className="space-y-4">
        {/* To Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">To</label>
          <div className="px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white">
            <span className="font-medium">{investor.name}</span>
            {investor.email && (
              <span className="text-gray-400 ml-2">&lt;{investor.email}&gt;</span>
            )}
          </div>
        </div>

        {/* Template Selector */}
        <Select
          label="Use Template"
          options={templateOptions}
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
        />

        {/* Subject */}
        <Input
          label="Subject"
          placeholder="Email subject line"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Content</label>
          <textarea
            className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
            rows={10}
            placeholder="Write your email..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Use {"{{variable_name}}"} for personalization. Available: investor_name, investor_first_name, investor_firm, company_name, raise_type, raise_amount
          </p>
        </div>

        {/* Send Options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="send_time"
              checked={sendNow}
              onChange={() => setSendNow(true)}
              className="text-brand-gold focus:ring-brand-gold"
            />
            <span className="text-sm text-gray-300">Send now</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="send_time"
              checked={!sendNow}
              onChange={() => setSendNow(false)}
              className="text-brand-gold focus:ring-brand-gold"
            />
            <span className="text-sm text-gray-300">Schedule</span>
          </label>
          
          {!sendNow && (
            <Input
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-auto"
            />
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500">{error.message}</p>
        )}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose} disabled={isSending}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSend}
          isLoading={isSending}
          disabled={!subject.trim() || !content.trim()}
          leftIcon={sendNow ? <Send className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
        >
          {sendNow ? 'Send Email' : 'Schedule Email'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
