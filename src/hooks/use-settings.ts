'use client';

import { useFetch, useMutation } from './use-fetch';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  org_id: string;
  created_at: string;
}

export interface OrgSettings {
  default_from_name?: string;
  default_reply_to?: string;
  calendar_link?: string;
  company_description?: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  settings: OrgSettings;
  created_at: string;
}

export interface UserData {
  user: UserProfile;
  organization: Organization;
}

export function useUser() {
  return useFetch<UserData>('/api/user');
}

export function useUpdateProfile() {
  return useMutation<UserProfile, { name?: string; email?: string }>(
    '/api/user',
    'PATCH'
  );
}

export function useUpdateOrganization() {
  return useMutation<Organization, { name?: string; settings?: Partial<OrgSettings> }>(
    '/api/user',
    'PUT'
  );
}
