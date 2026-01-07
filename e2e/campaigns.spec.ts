import { test, expect } from '@playwright/test';

test.describe('Campaigns', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('demo@capoutro.com');
    await page.getByLabel(/password/i).fill('demo123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/campaigns');
  });

  test('should display campaign list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /campaigns/i })).toBeVisible();
    
    // Should show at least one campaign (mock data)
    await expect(page.getByText(/series a/i)).toBeVisible();
  });

  test('should open create campaign modal', async ({ page }) => {
    await page.getByRole('button', { name: /new campaign/i }).click();
    
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('heading', { name: /create campaign/i })).toBeVisible();
    await expect(page.getByLabel(/campaign name/i)).toBeVisible();
  });

  test('should create a new campaign', async ({ page }) => {
    await page.getByRole('button', { name: /new campaign/i }).click();
    
    // Fill form
    await page.getByLabel(/campaign name/i).fill('Test Campaign');
    
    // Submit
    await page.getByRole('button', { name: /create/i }).click();
    
    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should navigate to campaign detail', async ({ page }) => {
    // Click on first campaign
    await page.getByText(/series a/i).click();
    
    // Should be on campaign detail page
    await expect(page.url()).toContain('/campaigns/');
    
    // Should show tabs
    await expect(page.getByRole('tab', { name: /overview/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /investors/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /pipeline/i })).toBeVisible();
  });

  test('should show campaign overview stats', async ({ page }) => {
    await page.getByText(/series a/i).click();
    
    // Should show stats
    await expect(page.getByText(/total investors/i)).toBeVisible();
    await expect(page.getByText(/response rate/i)).toBeVisible();
    await expect(page.getByText(/fundraising progress/i)).toBeVisible();
  });
});
