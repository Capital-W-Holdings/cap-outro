import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should navigate to signup from login', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByRole('link', { name: /sign up/i }).click();
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: /create.*account/i })).toBeVisible();
  });

  test('should login with demo credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.getByLabel(/email/i).fill('demo@capoutro.com');
    await page.getByLabel(/password/i).fill('demo123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to campaigns
    await expect(page).toHaveURL('/campaigns');
  });

  test('should show error on invalid login', async ({ page }) => {
    await page.goto('/login');
    
    // Submit without filling fields
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show validation error
    await expect(page.getByText(/email/i)).toBeVisible();
  });
});
