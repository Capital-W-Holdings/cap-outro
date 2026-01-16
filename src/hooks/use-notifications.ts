'use client';

import { useState, useCallback, useEffect } from 'react';
import { useFetch } from './use-fetch';
import type { Notification, ApiResponse } from '@/types';

export function useNotifications(options?: { pollInterval?: number }) {
  const { data, isLoading, error, refetch } = useFetch<Notification[]>('/api/notifications');
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  // Poll for new notifications
  useEffect(() => {
    if (!options?.pollInterval) return;

    const interval = setInterval(() => {
      refetch();
    }, options.pollInterval);

    return () => clearInterval(interval);
  }, [options?.pollInterval, refetch]);

  // Filter out locally marked-as-read notifications
  const notifications = (data || []).map((n) => ({
    ...n,
    is_read: n.is_read || readIds.has(n.id),
  }));

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
  };
}

export function useMarkNotificationsRead() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const markAsRead = useCallback(async (notificationIds: string[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_ids: notificationIds }),
      });
      const json = (await response.json()) as ApiResponse<{ success: boolean }>;

      if (!json.success) {
        throw new Error('Failed to mark notifications as read');
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to mark as read');
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_all_read: true }),
      });
      const json = (await response.json()) as ApiResponse<{ success: boolean }>;

      if (!json.success) {
        throw new Error('Failed to mark all notifications as read');
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to mark all as read');
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  return { markAsRead, markAllAsRead, isLoading, error };
}
