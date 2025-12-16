import { test, expect } from '@playwright/test';

test('homepage loads and navigation works', async ({ page }) => {
  await page.goto('http://localhost:5000');
  await expect(page).toHaveTitle(/gensanworks/i);
  // Example: Click a button or toggle
  // await page.click('button[data-testid="my-toggle"]');
  // await expect(page.locator('selector-for-result')).toBeVisible();
});
