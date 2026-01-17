'use client';

import { useFetch, useMutation } from './use-fetch';
import type { SequenceEnrollment, EnrollmentStatus } from '@/types';

export function useSequenceEnrollments(sequenceId: string, status?: EnrollmentStatus) {
  const url = status
    ? `/api/sequences/${sequenceId}/enrollments?status=${status}`
    : `/api/sequences/${sequenceId}/enrollments`;
  return useFetch<SequenceEnrollment[]>(url);
}

export function useEnrollInvestors(sequenceId: string) {
  return useMutation<
    { enrolled: number; total_requested: number; message: string },
    { investor_ids: string[]; campaign_id?: string }
  >(`/api/sequences/${sequenceId}/enroll`, 'POST');
}

export function useUnenrollInvestors(sequenceId: string) {
  return useMutation<
    { removed: number; message: string },
    { investor_ids: string[] }
  >(`/api/sequences/${sequenceId}/enroll`, 'DELETE');
}

export function useUpdateEnrollments(sequenceId: string) {
  return useMutation<
    { updated: number; message: string },
    { enrollment_ids: string[]; status: EnrollmentStatus }
  >(`/api/sequences/${sequenceId}/enrollments`, 'PATCH');
}
