'use client';

import { useState, useEffect } from 'react';
import { Building2, Save } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';
import { useUser, useUpdateOrganization } from '@/hooks';

export function OrganizationSettings() {
  const { data, isLoading, refetch } = useUser();
  const { mutate: updateOrg, isLoading: isSaving, error } = useUpdateOrganization();
  
  const [orgName, setOrgName] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (data?.organization) {
      setOrgName(data.organization.name);
      setCompanyDescription(data.organization.settings.company_description ?? '');
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateOrg({
        name: orgName,
        settings: { company_description: companyDescription },
      });
      setIsDirty(false);
      refetch();
    } catch {
      // Error handled by hook
    }
  };

  const handleChange = (field: 'name' | 'description', value: string) => {
    if (field === 'name') setOrgName(value);
    else setCompanyDescription(value);
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-dark-600 rounded w-1/4" />
          <div className="h-10 bg-dark-600 rounded" />
          <div className="h-20 bg-dark-600 rounded" />
        </div>
      </Card>
    );
  }

  const planColors: Record<string, string> = {
    free: 'bg-gray-500/10 text-gray-400',
    starter: 'bg-blue-500/10 text-blue-400',
    pro: 'bg-purple-500/10 text-purple-400',
    enterprise: 'bg-brand-gold/10 text-brand-gold',
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">Organization</h3>
          <p className="text-sm text-gray-400">Manage your organization settings</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${planColors[data?.organization.plan ?? 'free']}`}>
          {data?.organization.plan?.toUpperCase()}
        </span>
      </div>

      <div className="space-y-4">
        <Input
          label="Organization Name"
          value={orgName}
          onChange={(e) => handleChange('name', e.target.value)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Company Description
          </label>
          <textarea
            className="w-full px-3 py-2 bg-dark-700 border border-dark-500 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent resize-none"
            rows={3}
            placeholder="Brief description of your company for investor outreach"
            value={companyDescription}
            onChange={(e) => handleChange('description', e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">
            This is used to personalize outreach emails
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-dark-600">
          <div className="text-sm text-gray-500">
            Slug: <code className="text-gray-300 bg-dark-600 px-1 rounded">{data?.organization.slug}</code>
          </div>
          
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
