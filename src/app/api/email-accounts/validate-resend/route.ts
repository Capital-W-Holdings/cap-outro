import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse } from '@/types';

interface ResendDomain {
  id: string;
  name: string;
  status: string;
  created_at: string;
  region: string;
}

interface ResendDomainsResponse {
  data?: ResendDomain[];
  message?: string;
  statusCode?: number;
}

interface ValidationResult {
  valid: boolean;
  domains?: { name: string; status: string }[];
  message?: string;
}

/**
 * Validates a Resend API key by making a test request to the Resend API.
 * Returns the list of verified domains if valid.
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ValidationResult>>> {
  try {
    const body = await request.json();
    const { apiKey } = body;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'API key is required',
          },
        },
        { status: 400 }
      );
    }

    // Validate the API key by fetching domains from Resend
    // This is a lightweight way to verify the key is valid
    const response = await fetch('https://api.resend.com/domains', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const data = (await response.json()) as ResendDomainsResponse;

    if (!response.ok) {
      // Check for specific error messages from Resend
      if (response.status === 401) {
        return NextResponse.json({
          success: true,
          data: {
            valid: false,
            message: 'Invalid API key. Please check your Resend dashboard for the correct key.',
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          valid: false,
          message: data.message || `API validation failed: HTTP ${response.status}`,
        },
      });
    }

    // API key is valid - return domains for user reference
    const domains = (data.data || []).map((d: ResendDomain) => ({
      name: d.name,
      status: d.status,
    }));

    const verifiedDomains = domains.filter((d) => d.status === 'verified');

    return NextResponse.json({
      success: true,
      data: {
        valid: true,
        domains,
        message:
          verifiedDomains.length > 0
            ? `API key valid! ${verifiedDomains.length} verified domain${verifiedDomains.length > 1 ? 's' : ''} found.`
            : 'API key valid! No verified domains yet - add a domain in your Resend dashboard.',
      },
    });
  } catch (error) {
    console.error('Error validating Resend API key:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to validate API key',
        },
      },
      { status: 500 }
    );
  }
}
