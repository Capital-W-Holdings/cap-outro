'use client';

import { useState } from 'react';
import { Users, Play, Pause, X, RefreshCw } from 'lucide-react';
import { useSequenceEnrollments } from '@/hooks';
import { Card, Button, EmptyState, Spinner } from '@/components/ui';
import type { EnrollmentStatus } from '@/types';

interface SequenceEnrollmentsProps {
  sequenceId: string;
}

const statusColors: Record<EnrollmentStatus, string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<EnrollmentStatus, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function SequenceEnrollments({ sequenceId }: SequenceEnrollmentsProps) {
  const { data: enrollments, isLoading, error, refetch } = useSequenceEnrollments(sequenceId);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateStatus = async (enrollmentId: string, newStatus: EnrollmentStatus) => {
    setUpdatingId(enrollmentId);
    try {
      const response = await fetch(`/api/sequences/${sequenceId}/enrollments`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollment_ids: [enrollmentId],
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update enrollment');
      }

      refetch();
    } catch (err) {
      console.error('Error updating enrollment:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-8">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">Failed to load enrollments</p>
          <Button variant="outline" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card>
        <EmptyState
          title="No enrolled investors"
          description="Go to Investors page, select investors, and add them to this sequence."
          icon={<Users className="w-12 h-12 text-gray-400" />}
        />
      </Card>
    );
  }

  const activeCount = enrollments.filter(e => e.status === 'active').length;
  const completedCount = enrollments.filter(e => e.status === 'completed').length;

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-gray-500">Total Enrolled</p>
              <p className="text-2xl font-bold text-gray-900">{enrollments.length}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
        </div>
      </Card>

      {/* Enrollments List */}
      <Card>
        <div className="divide-y divide-gray-200">
          {enrollments.map((enrollment) => (
            <div
              key={enrollment.id}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              {/* Investor Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium text-sm">
                  {enrollment.investor?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {enrollment.investor?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {enrollment.investor?.firm || enrollment.investor?.email || 'No details'}
                  </p>
                </div>
              </div>

              {/* Status & Progress */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Step {enrollment.current_step_order + 1}
                  </p>
                  {enrollment.next_send_at && enrollment.status === 'active' && (
                    <p className="text-xs text-gray-400">
                      Next: {new Date(enrollment.next_send_at).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[enrollment.status]}`}>
                  {statusLabels[enrollment.status]}
                </span>

                {/* Actions */}
                {enrollment.status === 'active' && (
                  <button
                    onClick={() => handleUpdateStatus(enrollment.id, 'paused')}
                    disabled={updatingId === enrollment.id}
                    className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors disabled:opacity-50"
                    title="Pause"
                  >
                    <Pause className="w-4 h-4" />
                  </button>
                )}
                {enrollment.status === 'paused' && (
                  <button
                    onClick={() => handleUpdateStatus(enrollment.id, 'active')}
                    disabled={updatingId === enrollment.id}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                    title="Resume"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                )}
                {(enrollment.status === 'active' || enrollment.status === 'paused') && (
                  <button
                    onClick={() => handleUpdateStatus(enrollment.id, 'cancelled')}
                    disabled={updatingId === enrollment.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Cancel"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
