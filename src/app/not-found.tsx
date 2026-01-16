import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8 text-neutral-600" />
        </div>

        <h1 className="text-6xl font-bold text-neutral-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">Page Not Found</h2>
        <p className="text-neutral-600 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-neutral-200">
          <p className="text-sm text-neutral-500">
            Need help?{' '}
            <Link href="/help" className="text-neutral-900 font-medium hover:underline">
              Visit our help center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
