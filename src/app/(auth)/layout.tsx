import { Target } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded-lg bg-brand-gold flex items-center justify-center">
            <Target className="w-5 h-5 text-dark-900" />
          </div>
          <span className="text-xl font-bold text-white">Cap Outro</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Cap Outro. All rights reserved.
      </footer>
    </div>
  );
}
