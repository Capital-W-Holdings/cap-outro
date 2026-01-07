import { NextRequest } from 'next/server';
import { 
  successResponse, 
  withErrorHandling,
  parseBody,
  ValidationError,
} from '@/lib/api/utils';
import { z } from 'zod';

// Mock user data
let mockUser = {
  id: 'user-1',
  email: 'founder@startup.com',
  name: 'Alex Founder',
  role: 'owner',
  org_id: 'org-1',
  created_at: new Date().toISOString(),
};

let mockOrg = {
  id: 'org-1',
  name: 'My Startup',
  slug: 'my-startup',
  plan: 'pro',
  settings: {
    default_from_name: 'Alex from My Startup',
    default_reply_to: 'alex@mystartup.com',
    calendar_link: 'https://calendly.com/alex-startup/30min',
    company_description: 'AI-powered analytics platform',
  },
  created_at: new Date().toISOString(),
};

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
});

const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  settings: z.object({
    default_from_name: z.string().max(100).optional(),
    default_reply_to: z.string().email().optional(),
    calendar_link: z.string().url().optional(),
    company_description: z.string().max(500).optional(),
  }).optional(),
});

function validateUpdateUser(data: unknown) {
  const result = updateUserSchema.safeParse(data);
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

function validateUpdateOrg(data: unknown) {
  const result = updateOrgSchema.safeParse(data);
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

// GET /api/user - Get current user and org
export async function GET() {
  return withErrorHandling(async () => {
    return successResponse({
      user: mockUser,
      organization: mockOrg,
    });
  });
}

// PATCH /api/user - Update user profile
export async function PATCH(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseBody(request, validateUpdateUser);
    
    mockUser = {
      ...mockUser,
      ...body,
    };

    return successResponse(mockUser);
  });
}

// PUT /api/user - Update organization
export async function PUT(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await parseBody(request, validateUpdateOrg);
    
    mockOrg = {
      ...mockOrg,
      name: body.name ?? mockOrg.name,
      settings: {
        ...mockOrg.settings,
        ...body.settings,
      },
    };

    return successResponse(mockOrg);
  });
}
