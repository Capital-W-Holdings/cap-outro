'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 mb-6">
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        {error.digest && (
          <p className="text-xs text-gray-500 mb-4">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold text-dark-900 rounded-lg font-medium hover:bg-brand-gold-dark transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 px-4 py-2 bg-dark-700 text-white rounded-lg font-medium hover:bg-dark-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
