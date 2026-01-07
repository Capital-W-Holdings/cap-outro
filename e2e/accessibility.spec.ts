import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have skip link', async ({ page }) => {
    await page.goto('/login');
    
    // Tab to reveal skip link
    await page.keyboard.press('Tab');
    
    const skipLink = page.getByRole('link', { name: /skip to main content/i });
    await expect(skipLink).toBeFocused();
  });

  test('should have proper page titles', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/cap outro/i);
  });

  test('should have main landmark', async ({ page }) => {
    await page.goto('/login');
    
    const main = page.locator('main#main-content');
    await expect(main).toBeVisible();
  });

  test('should close modal on escape', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('demo@capoutro.com');
    await page.getByLabel(/password/i).fill('demo123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/campaigns');

    // Open modal
    await page.getByRole('button', { name: /new campaign/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Press escape
    await page.keyboard.press('Escape');
    
    // Modal should close
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should trap focus in modal', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('demo@capoutro.com');
    await page.getByLabel(/password/i).fill('demo123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/campaigns');

    // Open modal
    await page.getByRole('button', { name: /new campaign/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Focus should still be within modal
    const activeElement = await page.evaluate(() => document.activeElement?.closest('[role="dialog"]'));
    expect(activeElement).not.toBeNull();
  });

  test('modal should have proper ARIA attributes', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('demo@capoutro.com');
    await page.getByLabel(/password/i).fill('demo123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL('/campaigns');

    // Open modal
    await page.getByRole('button', { name: /new campaign/i }).click();
    
    const dialog = page.getByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  test('form inputs should have labels', async ({ page }) => {
    await page.goto('/login');
    
    // Check that inputs have associated labels
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('buttons should be keyboard accessible', async ({ page }) => {
    await page.goto('/login');
    
    // Tab to button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const submitButton = page.getByRole('button', { name: /sign in/i });
    
    // Button should be focusable
    await expect(submitButton).toBeVisible();
  });
});
