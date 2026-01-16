import Link from 'next/link';
import { FileQuestion, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
          <FileQuestion className="w-8 h-8 text-black" />
        </div>

        <h1 className="text-6xl font-bold text-gray-300 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-black mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/investors"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <Link href="/help" className="text-black hover:underline">
              Visit our help center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
