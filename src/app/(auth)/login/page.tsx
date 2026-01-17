'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Demo mode - just redirect to dashboard
      await new Promise((resolve) => setTimeout(resolve, 500));
      router.push('/investors');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg" className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-gray-500 mt-2">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full !bg-gradient-to-r !from-blue-600 !to-violet-600 hover:!shadow-lg hover:!shadow-blue-500/25"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Don&apos;t have an account? </span>
        <Link href="/signup" className="text-blue-600 font-medium hover:text-violet-600 transition-colors">
          Sign up
        </Link>
      </div>

      {/* Demo notice */}
      <div className="mt-8 p-3 bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-100 rounded-lg text-center">
        <p className="text-xs text-gray-600">
          <span className="font-semibold text-blue-600">Demo Mode:</span> Enter any email/password to continue
        </p>
      </div>
    </Card>
  );
}
