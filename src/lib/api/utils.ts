import { NextResponse } from 'next/server';
import type { ApiError, ApiSuccess, ErrorCode } from '@/types';

// Custom error classes
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string[]>) {
    super('VALIDATION_ERROR', message, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super('FORBIDDEN', message);
    this.name = 'ForbiddenError';
  }
}

// Response helpers
export function successResponse<T>(data: T, meta?: { page?: number; limit?: number; total?: number }): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({
    success: true as const,
    data,
    ...(meta && { meta }),
  });
}

export function errorResponse(error: AppError | Error): NextResponse<ApiError> {
  if (error instanceof AppError) {
    const status = getStatusFromCode(error.code);
    return NextResponse.json(
      {
        success: false as const,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details && { details: error.details }),
        },
      },
      { status }
    );
  }

  // Unknown error - log and return generic message
  console.error('Unhandled error:', error);
  return NextResponse.json(
    {
      success: false as const,
      error: {
        code: 'INTERNAL_ERROR' as const,
        message: 'An unexpected error occurred',
      },
    },
    { status: 500 }
  );
}

function getStatusFromCode(code: ErrorCode): number {
  const statusMap: Record<ErrorCode, number> = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    RATE_LIMITED: 429,
    INTERNAL_ERROR: 500,
  };
  return statusMap[code];
}

// Wrapper for API route handlers with error handling
export function withErrorHandling<T>(
  handler: () => Promise<NextResponse<T>>
): Promise<NextResponse<T | ApiError>> {
  return handler().catch((error: unknown) => {
    if (error instanceof AppError) {
      return errorResponse(error);
    }
    if (error instanceof Error) {
      return errorResponse(error);
    }
    return errorResponse(new Error('Unknown error'));
  });
}

// Parse and validate request body
export async function parseBody<T>(
  request: Request,
  validator: (data: unknown) => T
): Promise<T> {
  try {
    const body: unknown = await request.json();
    return validator(body);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new ValidationError('Invalid JSON body');
  }
}
