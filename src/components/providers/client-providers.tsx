'use client';

import { type ReactNode } from 'react';
import { ErrorBoundary, OfflineIndicator } from '@/components/error';
import { SkipLink, ToastProvider } from '@/components/ui';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SkipLink />
        <OfflineIndicator />
        {children}
      </ToastProvider>
    </ErrorBoundary>
  );
}
