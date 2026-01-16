'use client';

import { useState, useCallback } from 'react';
import { useFetch, useMutation } from './use-fetch';
import type { EmailTemplate, TemplateType } from '@/types';
import type { ApiResponse } from '@/types';

export function useTemplates(type?: TemplateType) {
  const url = type ? `/api/templates?type=${type}` : '/api/templates';
  return useFetch<EmailTemplate[]>(url);
}

export function useTemplate(id: string) {
  return useFetch<EmailTemplate>(`/api/templates/${id}`);
}

export function useCreateTemplate() {
  return useMutation<EmailTemplate, {
    name: string;
    subject: string;
    body: string;
    type?: TemplateType;
  }>('/api/templates', 'POST');
}

export function useUpdateTemplate(id: string) {
  return useMutation<EmailTemplate, {
    name?: string;
    subject?: string;
    body?: string;
    type?: TemplateType;
  }>(`/api/templates/${id}`, 'PATCH');
}

export function useDeleteTemplate(id: string) {
  return useMutation<{ deleted: boolean }>(`/api/templates/${id}`, 'DELETE');
}

// Flexible delete that can be called with any template ID
export function useDeleteTemplateById() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteTemplate = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });
      const json = await response.json() as ApiResponse<{ deleted: boolean }>;

      if (!json.success) {
        throw new Error(json.error.message);
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete');
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  return { deleteTemplate, isLoading, error };
}

// Duplicate template
export function useDuplicateTemplate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const duplicateTemplate = useCallback(async (template: EmailTemplate) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          subject: template.subject,
          body: template.body,
          type: template.type,
        }),
      });
      const json = await response.json() as ApiResponse<EmailTemplate>;

      if (!json.success) {
        throw new Error(json.error.message);
      }

      setIsLoading(false);
      return json.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to duplicate');
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  return { duplicateTemplate, isLoading, error };
}
