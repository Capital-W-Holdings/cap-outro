import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-brand-gold/10 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8 text-brand-gold" />
        </div>
        
        <h1 className="text-6xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/campaigns"
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-gold text-dark-900 rounded-lg font-medium hover:bg-brand-gold-dark transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-dark-700">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link href="/help" className="text-brand-gold hover:underline">
              Visit our help center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
