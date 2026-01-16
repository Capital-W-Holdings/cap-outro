import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <span className="text-xl font-semibold text-neutral-900 font-mono tracking-tight">Cap Outro</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-neutral-400">
        © {new Date().getFullYear()} Cap Outro. All rights reserved.
      </footer>
    </div>
  );
}
