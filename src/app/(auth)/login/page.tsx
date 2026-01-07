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

    // TODO: Implement actual Supabase auth
    // For MVP demo, just redirect to dashboard
    try {
      // Simulate auth delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In production:
      // const supabase = createClient();
      // const { error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;

      router.push('/campaigns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-gray-400 mt-2">Sign in to your account</p>
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
          className="w-full"
        >
          Sign in
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-400">Don&apos;t have an account? </span>
        <Link href="/signup" className="text-brand-gold hover:underline">
          Sign up
        </Link>
      </div>

      {/* Demo notice */}
      <div className="mt-8 p-3 bg-dark-700 rounded-lg text-center">
        <p className="text-xs text-gray-400">
          <span className="text-brand-gold">Demo Mode:</span> Enter any email/password to continue
        </p>
      </div>
    </Card>
  );
}
