import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  NotFoundError,
  parseBody,
  ValidationError,
} from '@/lib/api/utils';
import { extractTemplateVariables } from '@/lib/email';
import type { EmailTemplate } from '@/types';
import { z } from 'zod';

// Mock data reference
const mockTemplates: EmailTemplate[] = [];

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  subject: z.string().min(1).max(200).optional(),
  body: z.string().min(1).max(10000).optional(),
  type: z.enum(['initial', 'followup', 'intro_request', 'update']).optional(),
});

function validateUpdateTemplate(data: unknown) {
  const result = updateTemplateSchema.safeParse(data);
  if (!result.success) {
    const details: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join('.') || 'root';
      if (!details[path]) details[path] = [];
      details[path].push(issue.message);
    });
    throw new ValidationError('Validation failed', details);
  }
  return result.data;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/templates/[id] - Get single template
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const template = mockTemplates.find((t) => t.id === id);
    
    if (!template) {
      throw new NotFoundError('Template');
    }

    return successResponse(template);
  });
}

// PATCH /api/templates/[id] - Update template
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await parseBody(request, validateUpdateTemplate);
    
    const templateIndex = mockTemplates.findIndex((t) => t.id === id);
    
    if (templateIndex === -1) {
      throw new NotFoundError('Template');
    }

    const existingTemplate = mockTemplates[templateIndex];
    if (!existingTemplate) {
      throw new NotFoundError('Template');
    }

    // Re-extract variables if content changed
    let variables = existingTemplate.variables;
    if (body.subject || body.body) {
      const subject = body.subject ?? existingTemplate.subject;
      const bodyContent = body.body ?? existingTemplate.body;
      variables = extractTemplateVariables(subject + ' ' + bodyContent);
    }

    const updatedTemplate: EmailTemplate = {
      ...existingTemplate,
      ...body,
      variables,
    };

    mockTemplates[templateIndex] = updatedTemplate;

    return successResponse(updatedTemplate);
  });
}

// DELETE /api/templates/[id] - Delete template
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    
    const templateIndex = mockTemplates.findIndex((t) => t.id === id);
    
    if (templateIndex !== -1) {
      mockTemplates.splice(templateIndex, 1);
    }

    return successResponse({ deleted: true });
  });
}
