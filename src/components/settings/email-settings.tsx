'use client';

import { useState, useEffect } from 'react';
import { Mail, Save, ExternalLink } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';
import { useUser, useUpdateOrganization } from '@/hooks';

export function EmailSettings() {
  const { data, isLoading, refetch } = useUser();
  const { mutate: updateOrg, isLoading: isSaving, error } = useUpdateOrganization();
  
  const [fromName, setFromName] = useState('');
  const [replyTo, setReplyTo] = useState('');
  const [calendarLink, setCalendarLink] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (data?.organization.settings) {
      setFromName(data.organization.settings.default_from_name ?? '');
      setReplyTo(data.organization.settings.default_reply_to ?? '');
      setCalendarLink(data.organization.settings.calendar_link ?? '');
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateOrg({
        settings: {
          default_from_name: fromName || undefined,
          default_reply_to: replyTo || undefined,
          calendar_link: calendarLink || undefined,
        },
      });
      setIsDirty(false);
      refetch();
    } catch {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-dark-600 rounded w-1/4" />
          <div className="h-10 bg-dark-600 rounded" />
          <div className="h-10 bg-dark-600 rounded" />
          <div className="h-10 bg-dark-600 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Mail className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Email Settings</h3>
          <p className="text-sm text-gray-400">Configure your outreach email defaults</p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label="Default From Name"
          placeholder="Alex from My Startup"
          value={fromName}
          onChange={(e) => {
            setFromName(e.target.value);
            setIsDirty(true);
          }}
          helperText="The name that appears in the From field"
        />

        <Input
          label="Reply-To Email"
          type="email"
          placeholder="alex@mystartup.com"
          value={replyTo}
          onChange={(e) => {
            setReplyTo(e.target.value);
            setIsDirty(true);
          }}
          helperText="Where investor replies will be sent"
        />

        <Input
          label="Calendar Link"
          type="url"
          placeholder="https://calendly.com/you/30min"
          value={calendarLink}
          onChange={(e) => {
            setCalendarLink(e.target.value);
            setIsDirty(true);
          }}
          helperText="Used in {{calendar_link}} template variable"
        />

        {calendarLink && (
          <a
            href={calendarLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-brand-gold hover:underline"
          >
            Test calendar link
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        <div className="flex justify-end pt-4 border-t border-dark-600">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!isDirty}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error.message}</p>
        )}
      </div>
    </Card>
  );
}
