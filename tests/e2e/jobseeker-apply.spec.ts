import { test, expect } from "@playwright/test";

// Run with dev server running at http://localhost:5000 and a logged-in jobseeker session (or script login here)

test("jobseeker applies to a job", async ({ page }) => {
  await page.goto("http://localhost:5000");
  // TODO: perform login steps if not already authenticated in storage/state
  await page.getByRole("link", { name: /jobs/i }).click();
  await page.getByRole("button", { name: /apply/i }).first().click();
  await page.getByLabel(/cover letter/i).fill("I am a great fit.");
  await page.getByRole("button", { name: /submit application/i }).click();
  await expect(page.getByText(/application submitted/i)).toBeVisible({ timeout: 10000 });
});
