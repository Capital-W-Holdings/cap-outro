'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ApiResponse } from '@/types';

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseFetchOptions {
  immediate?: boolean;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = { immediate: true }
) {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: options.immediate ?? true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch(url);
      const json = await response.json() as ApiResponse<T>;

      if (!json.success) {
        throw new Error(json.error.message);
      }

      setState({ data: json.data, isLoading: false, error: null });
      return json.data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setState({ data: null, isLoading: false, error });
      throw error;
    }
  }, [url]);

  useEffect(() => {
    if (options.immediate) {
      fetchData().catch(() => {
        // Error is already set in state
      });
    }
  }, [fetchData, options.immediate]);

  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return { ...state, refetch };
}

// Mutation hook for POST/PATCH/DELETE
interface UseMutationState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useMutation<TData, TInput = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  const [state, setState] = useState<UseMutationState<TData>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const mutate = useCallback(
    async (input?: TInput) => {
      setState({ data: null, isLoading: true, error: null });

      try {
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: input ? JSON.stringify(input) : undefined,
        });

        const json = await response.json() as ApiResponse<TData>;

        if (!json.success) {
          throw new Error(json.error.message);
        }

        setState({ data: json.data, isLoading: false, error: null });
        return json.data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setState({ data: null, isLoading: false, error });
        throw error;
      }
    },
    [url, method]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, mutate, reset };
}
