'use client';

import { type ReactNode } from 'react';
import { ErrorBoundary, OfflineIndicator } from '@/components/error';
import { SkipLink } from '@/components/ui';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <SkipLink />
      <OfflineIndicator />
      {children}
    </ErrorBoundary>
  );
}
