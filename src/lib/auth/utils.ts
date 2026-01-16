import { createServerSupabaseClient } from '@/lib/supabase/server';
import { UnauthorizedError } from '@/lib/api/utils';

export interface AuthUser {
  id: string;
  email: string;
  orgId: string;
  role: string;
  name: string;
}

// Demo user for demo mode
const DEMO_USER: AuthUser = {
  id: 'demo-user-id',
  email: 'demo@capoutro.com',
  orgId: 'demo-org-id',
  role: 'admin',
  name: 'Demo User',
};

/**
 * Get the current authenticated user from the session
 * Throws UnauthorizedError if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  // Demo mode - return demo user
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || true;
  if (isDemoMode) {
    return DEMO_USER;
  }

  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError('Not authenticated');
  }

  // Get user profile with org info
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('org_id, role, name')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) {
    throw new UnauthorizedError('User profile not found');
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
