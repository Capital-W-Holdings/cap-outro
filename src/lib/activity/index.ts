import { SupabaseClient } from '@supabase/supabase-js';

export type ActivityAction =
  | 'investor.created'
  | 'investor.updated'
  | 'investor.deleted'
  | 'investor.imported'
  | 'investor.enriched'
  | 'campaign.created'
  | 'campaign.updated'
  | 'campaign.deleted'
  | 'pipeline.added'
  | 'pipeline.stage_changed'
  | 'outreach.sent'
  | 'outreach.opened'
  | 'outreach.replied';

export type EntityType =
  | 'investor'
  | 'campaign'
  | 'pipeline'
  | 'outreach'
  | 'template'
  | 'sequence';

export interface ActivityLogEntry {
  org_id: string;
  user_id?: string;
  entity_type: EntityType;
  entity_id: string;
  action: ActivityAction;
  details: Record<string, unknown>;
}

/**
 * Log an activity to the activity_log table
 */
export async function logActivity(
  supabase: SupabaseClient,
  entry: ActivityLogEntry
): Promise<void> {
  try {
    const { error } = await supabase.from('activity_log').insert({
      org_id: entry.org_id,
      user_id: entry.user_id ?? null,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      action: entry.action,
      details: entry.details,
    });

    if (error) {
      console.error('Failed to log activity:', error);
    }
  } catch (err) {
    // Don't throw - activity logging should not break main operations
    console.error('Activity logging error:', err);
  }
}

/**
 * Log multiple activities in bulk
 */
export async function logActivities(
  supabase: SupabaseClient,
  entries: ActivityLogEntry[]
): Promise<void> {
  if (entries.length === 0) return;

  try {
    const { error } = await supabase.from('activity_log').insert(
      entries.map((entry) => ({
        org_id: entry.org_id,
        user_id: entry.user_id ?? null,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        action: entry.action,
        details: entry.details,
      }))
    );

    if (error) {
      console.error('Failed to log activities:', error);
    }
  } catch (err) {
    console.error('Activity logging error:', err);
  }
}

/**
 * Log investor creation activity
 */
export async function logInvestorCreated(
  supabase: SupabaseClient,
  orgId: string,
  investorId: string,
  investorName: string,
  source: 'manual' | 'import' | 'enrichment',
  additionalDetails?: Record<string, unknown>
): Promise<void> {
  await logActivity(supabase, {
    org_id: orgId,
    entity_type: 'investor',
    entity_id: investorId,
    action: source === 'import' ? 'investor.imported' : source === 'enrichment' ? 'investor.enriched' : 'investor.created',
    details: {
      name: investorName,
      source,
      ...additionalDetails,
    },
  });
}

/**
 * Log bulk investor import activity
 */
export async function logBulkInvestorImport(
  supabase: SupabaseClient,
  orgId: string,
  investors: Array<{ id: string; name: string }>,
  source: 'import' | 'enrichment'
): Promise<void> {
  // Log a summary entry for the bulk import
  await logActivity(supabase, {
    org_id: orgId,
    entity_type: 'investor',
    entity_id: orgId, // Use org_id as entity for bulk operations
    action: source === 'enrichment' ? 'investor.enriched' : 'investor.imported',
    details: {
      count: investors.length,
      source,
      investors: investors.slice(0, 10).map((inv) => ({ id: inv.id, name: inv.name })), // Store first 10 for reference
      has_more: investors.length > 10,
    },
  });
}
