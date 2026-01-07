import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('demo@capoutro.com');
    await page.getByLabel(/password/i).fill('demo123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/campaigns');
  });

  test('should navigate to all main sections', async ({ page }) => {
    // Campaigns
    await expect(page.getByRole('heading', { name: /campaigns/i })).toBeVisible();

    // Investors
    await page.getByRole('link', { name: /investors/i }).click();
    await expect(page).toHaveURL('/investors');
    await expect(page.getByRole('heading', { name: /investors/i })).toBeVisible();

    // Pipeline
    await page.getByRole('link', { name: /pipeline/i }).click();
    await expect(page).toHaveURL('/pipeline');
    await expect(page.getByRole('heading', { name: /pipeline/i })).toBeVisible();

    // Sequences
    await page.getByRole('link', { name: /sequences/i }).click();
    await expect(page).toHaveURL('/sequences');
    await expect(page.getByRole('heading', { name: /sequences/i })).toBeVisible();

    // Templates
    await page.getByRole('link', { name: /templates/i }).click();
    await expect(page).toHaveURL('/templates');
    await expect(page.getByRole('heading', { name: /templates/i })).toBeVisible();

    // Outreach
    await page.getByRole('link', { name: /outreach/i }).click();
    await expect(page).toHaveURL('/outreach');
    await expect(page.getByRole('heading', { name: /outreach/i })).toBeVisible();

    // Settings
    await page.getByRole('link', { name: /settings/i }).click();
    await expect(page).toHaveURL('/settings');
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible();

    // Help
    await page.getByRole('link', { name: /help/i }).click();
    await expect(page).toHaveURL('/help');
    await expect(page.getByRole('heading', { name: /help/i })).toBeVisible();
  });

  test('should show 404 for unknown routes', async ({ page }) => {
    await page.goto('/unknown-page-xyz');
    
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText(/page not found/i)).toBeVisible();
  });
});
