import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-violet-50 flex flex-col">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-violet-200/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/30 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative p-6">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white text-sm font-bold">CO</span>
          </div>
          <span className="text-xl font-semibold text-gray-900 tracking-tight">
            Cap Outro
          </span>
        </Link>
      </header>

      {/* Content */}
      <main className="relative flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative p-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Cap Outro. All rights reserved.
      </footer>
    </div>
  );
}
