import type { SequenceEnrollment } from '@/types';

// In-memory storage for demo mode enrollments
export const demoEnrollments: Map<string, SequenceEnrollment[]> = new Map();
