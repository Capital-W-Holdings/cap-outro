'use client';

import { useFetch, useMutation } from './use-fetch';
import type { EmailTemplate, TemplateType } from '@/types';

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
