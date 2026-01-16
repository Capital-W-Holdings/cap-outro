import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  parseBody,
  AppError,
} from '@/lib/api/utils';
import { validateCreateTemplate } from '@/lib/api/validators';
import { extractTemplateVariables } from '@/lib/email';
import { createServiceClient } from '@/lib/supabase/server';
import type { TemplateType } from '@/types';

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET /api/templates - List templates
export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = createServiceClient();
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as TemplateType | null;

    let query = supabase
      .from('email_templates')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    return successResponse(data ?? [], {
      page: 1,
      limit: 50,
      total: count ?? 0,
    });
  });
}

// POST /api/templates - Create template
export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const supabase = createServiceClient();
    const body = await parseBody(request, validateCreateTemplate);

    // Extract variables from the template
    const variables = extractTemplateVariables(body.subject + ' ' + body.body);

    const { data, error } = await supabase
      .from('email_templates')
      .insert({
        org_id: DEMO_ORG_ID,
        name: body.name,
        subject: body.subject,
        body: body.body,
        variables,
        type: body.type ?? 'initial',
      })
      .select()
      .single();

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    return successResponse(data);
  });
}
