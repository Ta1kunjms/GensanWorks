import { test, expect } from "@playwright/test";

// Run with dev server at http://localhost:5000 and an authenticated employer session (or script login here)

test("employer posts a job", async ({ page }) => {
  await page.goto("http://localhost:5000");
  // TODO: perform login if necessary
  await page.getByRole("link", { name: /post a job/i }).click();
  await page.getByLabel(/position/i).fill("Backend Engineer");
  await page.getByLabel(/description/i).fill("Build APIs");
  await page.getByLabel(/location/i).fill("General Santos City");
  await page.getByLabel(/salary min/i).fill("1000");
  await page.getByLabel(/salary max/i).fill("2000");
  await page.getByRole("button", { name: /submit|post/i }).click();
  await expect(page.getByText(/submitted|saved/i)).toBeVisible({ timeout: 10000 });
});
