'use client';

import { Header } from '@/components/layout';
import { 
  ProfileSettings, 
  OrganizationSettings, 
  EmailSettings, 
  IntegrationSettings 
} from '@/components/settings';

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full">
      <Header
        title="Settings"
        subtitle="Manage your account and organization"
      />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          <ProfileSettings />
          <OrganizationSettings />
          <EmailSettings />
          <IntegrationSettings />
        </div>
      </div>
    </div>
  );
}
