import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded bg-black flex items-center justify-center">
            <span className="font-mono text-white text-xs font-bold">CO</span>
          </div>
          <span className="font-mono text-xl font-bold text-black tracking-tight">
            CAP OUTRO
          </span>
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
