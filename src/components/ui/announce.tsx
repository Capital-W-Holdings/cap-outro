'use client';

import { useState, useCallback } from 'react';

interface AnnounceProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

/**
 * Announces messages to screen readers
 * Use 'polite' for non-urgent updates, 'assertive' for important changes
 */
export function Announce({ message, politeness = 'polite' }: AnnounceProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnounce() {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message: string) => {
    // Clear first to ensure re-announcement of same message
    setAnnouncement('');
    setTimeout(() => setAnnouncement(message), 100);
  }, []);

  const clear = useCallback(() => {
    setAnnouncement('');
  }, []);

  return { announcement, announce, clear };
}
