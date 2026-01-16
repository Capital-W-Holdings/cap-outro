import { NextRequest } from 'next/server';
import {
  successResponse,
  withErrorHandling,
  NotFoundError,
  AppError,
} from '@/lib/api/utils';
import { createServiceClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/investors/[id] - Get a single investor
export async function GET(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('investors')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundError('Investor');
    }

    return successResponse(data);
  });
}

// PATCH /api/investors/[id] - Update an investor
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('investors')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    if (!data) {
      throw new NotFoundError('Investor');
    }

    return successResponse(data);
  });
}

// DELETE /api/investors/[id] - Delete an investor
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('investors')
      .delete()
      .eq('id', id);

    if (error) {
      throw new AppError('INTERNAL_ERROR', error.message);
    }

    return successResponse({ deleted: true });
  });
}
