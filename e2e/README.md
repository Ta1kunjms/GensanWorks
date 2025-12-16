# End-to-End (E2E) Test Setup for GensanWorks

This guide will help you set up Playwright for automated E2E testing, covering user actions like clicks, toggles, navigation, and error reporting.

## 1. Install Playwright

Run this command in your project root:

```
npm install --save-dev playwright
```

## 2. Initialize Playwright

After installing, run:

```
npx playwright install
```

## 3. Add a Sample Test

Create a file at `e2e/sample.spec.ts` with a basic test (see below).

## 4. Run E2E Tests

```
npx playwright test
```

## 5. Sample Test Code

```
import { test, expect } from '@playwright/test';

test('homepage loads and navigation works', async ({ page }) => {
  await page.goto('http://localhost:5000');
  await expect(page).toHaveTitle(/gensanworks/i);
  // Example: Click a button or toggle
  // await page.click('button[data-testid="my-toggle"]');
  // await expect(page.locator('selector-for-result')).toBeVisible();
});
```

## 6. Add More Tests

- Simulate user actions: clicks, toggles, form submissions, navigation.
- Use Playwright’s expect API to assert correct behavior and error handling.

## 7. CI Integration

Add `npx playwright test` to your CI pipeline for automated checks.

---

For more, see: https://playwright.dev/docs/intro
