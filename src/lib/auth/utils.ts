import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server';
import { UnauthorizedError } from '@/lib/api/utils';

export interface AuthUser {
  id: string;
  email: string;
  orgId: string;
  role: string;
  name: string;
}

// Demo org ID for platform investors
const PLATFORM_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Demo user for demo mode
const DEMO_USER: AuthUser = {
  id: 'demo-user-id',
  email: 'demo@capoutro.com',
  orgId: PLATFORM_ORG_ID,
  role: 'admin',
  name: 'Demo User',
};

/**
 * Get the current authenticated user from the session
 * Throws UnauthorizedError if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  // Demo mode - return demo user
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
  if (isDemoMode) {
    return DEMO_USER;
  }

  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError('Not authenticated');
  }

  // Try to get profile - first try with service client, fall back to regular client
  let profile: { org_id: string; role: string; name: string } | null = null;
  let profileError: Error | null = null;

  try {
    // Use service client to bypass RLS for profile lookup
    const serviceClient = createServiceClient();
    const result = await serviceClient
      .from('users')
      .select('org_id, role, name')
      .eq('id', user.id)
      .single();

    profile = result.data;
    profileError = result.error;
  } catch (e) {
    // Service client failed (likely missing env var), try with regular client
    console.warn('Service client failed, trying regular client:', e);
    const result = await supabase
      .from('users')
      .select('org_id, role, name')
      .eq('id', user.id)
      .single();

    profile = result.data;
    profileError = result.error;
  }

  if (profileError || !profile) {
    console.error('Profile lookup error:', profileError);
    // Return a default user with platform org - allows viewing platform investors
    return {
      id: user.id,
      email: user.email ?? '',
      orgId: PLATFORM_ORG_ID,
      role: 'user',
      name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'User',
    };
  }

  return {
    id: user.id,
    email: user.email ?? '',
    orgId: profile.org_id,
    role: profile.role,
    name: profile.name,
  };
}

/**
 * Get the current user if authenticated, or null if not
 */
export async function getAuth(): Promise<AuthUser | null> {
  try {
    return await requireAuth();
  } catch {
    return null;
  }
}

/**
 * Check if user has required role
 */
export function hasRole(user: AuthUser, roles: string[]): boolean {
  return roles.includes(user.role);
}

/**
 * Require specific roles - throws ForbiddenError if not authorized
 */
export async function requireRole(roles: string[]): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!hasRole(user, roles)) {
    throw new UnauthorizedError('Insufficient permissions');
  }
  
  return user;
}
