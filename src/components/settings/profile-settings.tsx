'use client';

import { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';
import { Card, Button, Input } from '@/components/ui';
import { useUser, useUpdateProfile } from '@/hooks';

export function ProfileSettings() {
  const { data, isLoading, refetch } = useUser();
  const { mutate: updateProfile, isLoading: isSaving, error } = useUpdateProfile();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (data?.user) {
      setName(data.user.name);
      setEmail(data.user.email);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateProfile({ name, email });
      setIsDirty(false);
      refetch();
    } catch {
      // Error handled by hook
    }
  };

  const handleChange = (field: 'name' | 'email', value: string) => {
    if (field === 'name') setName(value);
    else setEmail(value);
    setIsDirty(true);
  };

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-dark-600 rounded w-1/4" />
          <div className="h-10 bg-dark-600 rounded" />
          <div className="h-10 bg-dark-600 rounded" />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-brand-gold/10 flex items-center justify-center">
          <User className="w-5 h-5 text-brand-gold" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Profile</h3>
          <p className="text-sm text-gray-400">Manage your personal information</p>
        </div>
      </div>

      <div className="space-y-4">
        <Input
          label="Full Name"
          value={name}
          onChange={(e) => handleChange('name', e.target.value)}
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => handleChange('email', e.target.value)}
        />

        <div className="flex items-center justify-between pt-4 border-t border-dark-600">
          <div className="text-sm text-gray-500">
            Role: <span className="text-gray-300 capitalize">{data?.user.role}</span>
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
