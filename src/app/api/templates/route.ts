import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  parseBody,
} from '@/lib/api/utils';
import { validateCreateTemplate } from '@/lib/api/validators';
import { extractTemplateVariables } from '@/lib/email';
import { createServiceClient } from '@/lib/supabase/server';
import type { EmailTemplate, TemplateType } from '@/types';

// Default org for MVP - in production this comes from auth
const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/templates - List templates
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as TemplateType | null;
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = parseInt(searchParams.get('limit') ?? '50', 10);

    const supabase = createServiceClient();

    let query = supabase
      .from('email_templates')
      .select('*', { count: 'exact' })
      .eq('org_id', DEFAULT_ORG_ID)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error fetching templates:', error);
      throw new Error('Failed to fetch templates');
    }

    // Map to EmailTemplate type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const templates: EmailTemplate[] = (data ?? []).map((row: any) => ({
      id: row.id,
      org_id: row.org_id,
      name: row.name,
      subject: row.subject,
      body: row.body,
      variables: row.variables ?? [],
      type: row.type,
      created_at: row.created_at,
    }));

    return successResponse(templates, {
      page,
      limit,
      total: count ?? 0,
    });
  });
}

// POST /api/templates - Create template
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseBody(request, validateCreateTemplate);
    const supabase = createServiceClient();

    // Extract variables from the template
    const variables = extractTemplateVariables(body.subject + ' ' + body.body);

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        org_id: DEFAULT_ORG_ID,
        name: body.name,
        subject: body.subject,
        body: body.body,
        variables,
        type: body.type ?? 'initial',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating template:', error);
      throw new Error('Failed to create template');
    }

    const newTemplate: EmailTemplate = {
      id: data.id,
      org_id: data.org_id,
      name: data.name,
      subject: data.subject,
      body: data.body,
      variables: data.variables ?? [],
      type: data.type,
      created_at: data.created_at,
    };

    return successResponse(newTemplate);
  });
}
