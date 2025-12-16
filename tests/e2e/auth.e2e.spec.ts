import { test, expect } from "@playwright/test";

// Assumes dev server running at http://localhost:5000 before executing
// Run with: npx playwright test tests/e2e/auth.e2e.spec.ts

test("jobseeker signup flow (happy path)", async ({ page }) => {
  await page.goto("http://localhost:5000");
  // Adjust selectors to actual UI labels/inputs
  await page.getByRole("button", { name: /sign up/i }).click();
  await page.getByLabel(/first name/i).fill("E2E");
  await page.getByLabel(/last name/i).fill("User");
  const email = `e2e-${Date.now()}@example.com`;
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill("Str0ng!Pass123");
  await page.getByRole("button", { name: /create account|sign up/i }).click();
  await expect(page.getByText(/welcome|dashboard/i)).toBeVisible({ timeout: 10000 });
});
