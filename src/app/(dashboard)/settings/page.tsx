'use client';

import { Header } from '@/components/layout';
import {
  ProfileSettings,
  OrganizationSettings,
  EmailSettings,
  EmailAccountsSettings,
  IntegrationSettings
} from '@/components/settings';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings"
        subtitle="Configure your account and start sending campaigns"
        help="Configure your email account to start sending campaigns. Connect Gmail via OAuth to enable automated outreach with proper authentication."
      />

      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Priority: Email setup first */}
          <EmailAccountsSettings />

          {/* Email configuration */}
          <EmailSettings />

          {/* Profile & Organization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ProfileSettings />
            <OrganizationSettings />
          </div>

          {/* Future integrations */}
          <IntegrationSettings />
        </div>
      </div>
    </div>
  );
}
