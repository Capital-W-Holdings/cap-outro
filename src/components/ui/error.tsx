'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Button } from './button';
import Link from 'next/link';

export interface ErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  showHome?: boolean;
}

export function ErrorState({ error, onRetry, showHome = false }: ErrorStateProps) {
  const message = typeof error === 'string' ? error : error.message;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-black mb-2">Something went wrong</h3>
      <p className="text-gray-500 mb-6 max-w-md">{message}</p>
      <div className="flex gap-3">
        {onRetry && (
          <Button variant="primary" onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Try again
          </Button>
        )}
        {showHome && (
          <Link href="/">
            <Button variant="outline" leftIcon={<Home className="w-4 h-4" />}>
              Go home
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

// Inline error for form fields
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 text-red-500 text-sm mt-1">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Toast-style error notification
export interface ErrorToastProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorToast({ message, onDismiss }: ErrorToastProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-in slide-in-from-bottom-2">
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-2 hover:bg-red-700 rounded p-1 transition-colors"
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

// 404 Not Found page
export function NotFoundState({ resource = 'Page' }: { resource?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
      <div className="text-6xl font-bold text-gray-300 mb-4">404</div>
      <h2 className="text-xl font-semibold text-black mb-2">{resource} not found</h2>
      <p className="text-gray-500 mb-6">The {resource.toLowerCase()} you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/">
        <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
          Go home
        </Button>
      </Link>
    </div>
  );
}
