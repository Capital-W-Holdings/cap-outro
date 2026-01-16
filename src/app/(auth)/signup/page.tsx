'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
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
      // Basic validation
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Simulate auth delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In production:
      // const supabase = createClient();
      // const { error } = await supabase.auth.signUp({ 
      //   email, 
      //   password,
      //   options: { data: { name } }
      // });
      // if (error) throw error;

      router.push('/campaigns');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 font-mono">Create your account</h1>
        <p className="text-neutral-500 mt-2">Start closing your round faster</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
          required
        />

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
          helperText="At least 8 characters"
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
          Create account
        </Button>
      </form>

      <div className="mt-6 text-center text-sm">
        <span className="text-neutral-500">Already have an account? </span>
        <Link href="/login" className="text-neutral-900 font-medium hover:underline">
          Sign in
        </Link>
      </div>

      {/* Demo notice */}
      <div className="mt-8 p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-center">
        <p className="text-xs text-neutral-500">
          <span className="text-neutral-700 font-medium">Demo Mode:</span> Enter any details to continue
        </p>
      </div>
    </Card>
  );
}
