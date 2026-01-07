import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch, useMutation } from '@/hooks/use-fetch';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns loading state initially', () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: [] }),
    });

    const { result } = renderHook(() => useFetch('/api/test'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('returns data after successful fetch', async () => {
    const mockData = [{ id: '1', name: 'Test' }];
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    const { result } = renderHook(() => useFetch('/api/test'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('returns error on failed fetch', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: { message: 'Failed' } }),
    });

    const { result } = renderHook(() => useFetch('/api/test'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error?.message).toBe('Failed');
  });

  it('does not fetch when immediate is false', () => {
    const { result } = renderHook(() => useFetch('/api/test', { immediate: false }));

    expect(result.current.isLoading).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('useMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state correctly', () => {
    const { result } = renderHook(() => useMutation('/api/test', 'POST'));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('mutates successfully', async () => {
    const mockData = { id: '1', name: 'Created' };
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: mockData }),
    });

    const { result } = renderHook(() => useMutation('/api/test', 'POST'));

    let returnedData;
    await waitFor(async () => {
      returnedData = await result.current.mutate({ name: 'Test' });
    });

    expect(returnedData).toEqual(mockData);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles mutation error', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: false, error: { message: 'Error' } }),
    });

    const { result } = renderHook(() => useMutation('/api/test', 'POST'));

    await expect(result.current.mutate({})).rejects.toThrow('Error');

    await waitFor(() => {
      expect(result.current.error?.message).toBe('Error');
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('sends correct HTTP method', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: {} }),
    });

    const { result } = renderHook(() => useMutation('/api/test', 'PATCH'));

    await result.current.mutate({ id: '1' });

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  it('resets state correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ success: true, data: { id: '1' } }),
    });

    const { result } = renderHook(() => useMutation('/api/test', 'POST'));

    await waitFor(async () => {
      await result.current.mutate({});
    });

    await waitFor(() => {
      expect(result.current.data).not.toBe(null);
    });

    result.current.reset();
    
    await waitFor(() => {
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBe(null);
    });
  });
});
