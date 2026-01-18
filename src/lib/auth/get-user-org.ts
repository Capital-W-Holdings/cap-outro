import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase/server';

// Demo org for fallback
const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

export interface AuthContext {
  userId: string;
  orgId: string;
  isDemo: boolean;
}

/**
 * Get the authenticated user's org_id from the request.
 * Falls back to demo org if not authenticated (for backwards compatibility).
 */
export async function getAuthContext(): Promise<AuthContext> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      // Not authenticated - use demo org
      return {
        userId: 'demo_user',
        orgId: DEMO_ORG_ID,
        isDemo: true,
      };
    }

    // Get user's org_id from the users table
    const serviceClient = createServiceClient();
    const { data: userRecord, error: userError } = await serviceClient
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single();

    if (userError || !userRecord) {
      console.error('User record not found:', userError);
      // Fall back to demo org
      return {
        userId: user.id,
        orgId: DEMO_ORG_ID,
        isDemo: true,
      };
    }

    return {
      userId: user.id,
      orgId: userRecord.org_id,
      isDemo: false,
    };
  } catch (error) {
    console.error('Error getting auth context:', error);
    return {
      userId: 'demo_user',
      orgId: DEMO_ORG_ID,
      isDemo: true,
    };
  }
}

/**
 * Require authentication - throws if not authenticated.
 */
export async function requireAuth(): Promise<AuthContext> {
  const context = await getAuthContext();

  if (context.isDemo) {
    throw new Error('Authentication required');
  }

  return context;
}
