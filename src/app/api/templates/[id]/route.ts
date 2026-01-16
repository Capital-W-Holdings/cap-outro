import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
  parseBody,
} from '@/lib/api/utils';
import { validateUpdateTemplate } from '@/lib/api/validators';
import { extractTemplateVariables } from '@/lib/email';
import { createServiceClient } from '@/lib/supabase/server';
import type { EmailTemplate } from '@/types';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/templates/[id] - Get single template
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Template');
    }

    const template: EmailTemplate = {
      id: data.id,
      org_id: data.org_id,
      name: data.name,
      subject: data.subject,
      body: data.body,
      variables: data.variables ?? [],
      type: data.type,
      created_at: data.created_at,
    };

    return successResponse(template);
  });
}

// PATCH /api/templates/[id] - Update template
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await parseBody(request, validateUpdateTemplate);
    const supabase = createServiceClient();

    // First get existing template to handle variable extraction
    const { data: existing, error: fetchError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      throw new NotFoundError('Template');
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.body !== undefined) updateData.body = body.body;
    if (body.type !== undefined) updateData.type = body.type;

    // Re-extract variables if content changed
    if (body.subject !== undefined || body.body !== undefined) {
      const subject = body.subject ?? existing.subject;
      const bodyContent = body.body ?? existing.body;
      updateData.variables = extractTemplateVariables(subject + ' ' + bodyContent);
    }

    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      console.error('Supabase error updating template:', error);
      throw new Error('Failed to update template');
    }

    const updatedTemplate: EmailTemplate = {
      id: data.id,
      org_id: data.org_id,
      name: data.name,
      subject: data.subject,
      body: data.body,
      variables: data.variables ?? [],
      type: data.type,
      created_at: data.created_at,
    };

    return successResponse(updatedTemplate);
  });
}

// DELETE /api/templates/[id] - Delete template
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    // Check if template exists
    const { data: existing } = await supabase
      .from('email_templates')
      .select('id')
      .eq('id', id)
      .single();

    if (!existing) {
      throw new NotFoundError('Template');
    }

    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error deleting template:', error);
      throw new Error('Failed to delete template');
    }

    return successResponse({ deleted: true });
  });
}
