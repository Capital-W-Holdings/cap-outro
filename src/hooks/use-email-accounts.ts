'use client';

import { useState, useCallback } from 'react';
import { useFetch, useMutation } from './use-fetch';
import type { EmailAccount, EmailProvider, ApiResponse } from '@/types';

export function useEmailAccounts() {
  return useFetch<EmailAccount[]>('/api/email-accounts');
}

export function useEmailAccount(id: string) {
  return useFetch<EmailAccount>(`/api/email-accounts/${id}`);
}

export function useCreateEmailAccount() {
  return useMutation<EmailAccount, {
    provider: EmailProvider;
    email: string;
    name?: string;
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: string;
  }>('/api/email-accounts', 'POST');
}

export function useUpdateEmailAccount(id: string) {
  return useMutation<EmailAccount, {
    name?: string;
    is_default?: boolean;
    status?: 'active' | 'disconnected' | 'error';
    daily_limit?: number;
  }>(`/api/email-accounts/${id}`, 'PATCH');
}

export function useDeleteEmailAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteAccount = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/email-accounts/${id}`, {
        method: 'DELETE',
      });
      const json = await response.json() as ApiResponse<{ deleted: boolean }>;

      if (!json.success) {
        throw new Error(json.error.message);
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to disconnect');
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  return { deleteAccount, isLoading, error };
}

export function useSetDefaultEmailAccount() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setDefault = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/email-accounts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_default: true }),
      });
      const json = await response.json() as ApiResponse<EmailAccount>;

      if (!json.success) {
        throw new Error(json.error.message);
      }

      setIsLoading(false);
      return json.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to set default');
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  return { setDefault, isLoading, error };
}
