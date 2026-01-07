import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProfileSettings } from '@/components/settings/profile-settings';
import { OrganizationSettings } from '@/components/settings/organization-settings';
import { EmailSettings } from '@/components/settings/email-settings';
import { IntegrationSettings } from '@/components/settings/integration-settings';

// Mock the hooks
vi.mock('@/hooks', () => ({
  useUser: vi.fn(() => ({
    data: {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'owner',
        org_id: 'org-1',
        created_at: new Date().toISOString(),
      },
      organization: {
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        plan: 'pro',
        settings: {
          default_from_name: 'Test User',
          default_reply_to: 'reply@test.com',
          calendar_link: 'https://calendly.com/test',
          company_description: 'A test company',
        },
        created_at: new Date().toISOString(),
      },
    },
    isLoading: false,
    refetch: vi.fn(),
  })),
  useUpdateProfile: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  })),
  useUpdateOrganization: vi.fn(() => ({
    mutate: vi.fn(),
    isLoading: false,
    error: null,
  })),
}));

describe('ProfileSettings', () => {
  it('renders user information', () => {
    render(<ProfileSettings />);
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('shows user role', () => {
    render(<ProfileSettings />);
    
    expect(screen.getByText('owner')).toBeInTheDocument();
  });

  it('has save button disabled initially', () => {
    render(<ProfileSettings />);
    
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });
});

describe('OrganizationSettings', () => {
  it('renders organization information', () => {
    render(<OrganizationSettings />);
    
    expect(screen.getByText('Organization')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Org')).toBeInTheDocument();
  });

  it('shows plan badge', () => {
    render(<OrganizationSettings />);
    
    expect(screen.getByText('PRO')).toBeInTheDocument();
  });

  it('shows organization slug', () => {
    render(<OrganizationSettings />);
    
    expect(screen.getByText('test-org')).toBeInTheDocument();
  });
});

describe('EmailSettings', () => {
  it('renders email settings', () => {
    render(<EmailSettings />);
    
    expect(screen.getByText('Email Settings')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('reply@test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://calendly.com/test')).toBeInTheDocument();
  });

  it('shows test calendar link', () => {
    render(<EmailSettings />);
    
    expect(screen.getByText('Test calendar link')).toBeInTheDocument();
  });
});

describe('IntegrationSettings', () => {
  it('renders integrations list', () => {
    render(<IntegrationSettings />);
    
    expect(screen.getByText('Integrations')).toBeInTheDocument();
    expect(screen.getByText('Resend')).toBeInTheDocument();
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
    expect(screen.getByText('Google Calendar')).toBeInTheDocument();
    expect(screen.getByText('Salesforce')).toBeInTheDocument();
  });

  it('shows connect buttons for disconnected services', () => {
    render(<IntegrationSettings />);
    
    const connectButtons = screen.getAllByRole('button', { name: /connect/i });
    expect(connectButtons.length).toBe(4);
  });

  it('shows not connected status', () => {
    render(<IntegrationSettings />);
    
    const notConnectedBadges = screen.getAllByText('Not connected');
    expect(notConnectedBadges.length).toBe(4);
  });
});
