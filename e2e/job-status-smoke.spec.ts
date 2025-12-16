import { test, expect } from '@playwright/test';

const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:5001';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL || 'admin@local.test';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD || 'adminpass';

test.describe('Employer/Admin job status flow', () => {
  test('employer submission shows pending then admin approves to active', async ({ page, request, context }) => {
    const timestamp = Date.now();
    const employerEmail = `smoke-employer-${timestamp}@example.com`;
    const employerPassword = `SmokeTest${timestamp}!Aa1`;
    const employerName = `Smoke Employer ${timestamp}`;
    const jobTitle = `Playwright QA ${timestamp}`;

    const signupResponse = await request.post(`${BASE_URL}/api/auth/signup/employer`, {
      headers: { 'Content-Type': 'application/json' },
      data: {
        name: employerName,
        email: employerEmail,
        password: employerPassword,
        company: employerName,
      },
    });

    expect(signupResponse.ok()).toBeTruthy();

    const clearAuthState = async () => {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      }).catch(() => undefined);
      await context.clearCookies();
    };

    await page.goto(`${BASE_URL}/employer/login`);
    await page.getByPlaceholder('employer@example.com').fill(employerEmail);
    await page.getByPlaceholder('••••••••').fill(employerPassword);
    await page.getByRole('button', { name: 'Login as Employer' }).click();
    await page.waitForURL('**/employer/dashboard', { timeout: 15000 });

    await page.goto(`${BASE_URL}/employer/jobs`);
    await page.getByRole('button', { name: 'Create Job' }).click();
    await page.getByPlaceholder('e.g., Senior Developer').fill(jobTitle);
    await page.getByPlaceholder('Job description...').fill('Automated smoke test job description.');
    await page.getByPlaceholder('e.g., Manila').fill('General Santos City');
    const salaryInputs = page.getByPlaceholder('0');
    await salaryInputs.first().fill('30000');
    await salaryInputs.nth(1).fill('40000');
    await page.getByRole('button', { name: 'Submit for Review' }).click();

    const employerRow = page.getByRole('row', { name: new RegExp(jobTitle) });
    await expect(employerRow).toBeVisible({ timeout: 20000 });
    await expect(employerRow.locator('span', { hasText: /pending/i })).toBeVisible({ timeout: 20000 });

    await clearAuthState();

    await page.goto(`${BASE_URL}/admin/login`);
    await page.getByPlaceholder('admin@gensanworks.com').fill(ADMIN_EMAIL);
    await page.getByPlaceholder('••••••••').fill(ADMIN_PASSWORD);
    await page.getByRole('button', { name: 'Sign In' }).click();
    await page.waitForURL('**/admin/dashboard', { timeout: 15000 });

    await page.goto(`${BASE_URL}/admin/jobs`);
    const jobCard = page.locator('div.group', {
      has: page.getByRole('heading', { name: new RegExp(jobTitle) })
    });
    await expect(jobCard).toBeVisible();
    const approveButton = jobCard.getByRole('button', { name: 'Approve' });
    await approveButton.click();
    await expect(jobCard.locator('span', { hasText: 'active' })).toBeVisible({ timeout: 20000 });

    await clearAuthState();
    await page.goto(`${BASE_URL}/employer/login`);
    await page.getByPlaceholder('employer@example.com').fill(employerEmail);
    await page.getByPlaceholder('••••••••').fill(employerPassword);
    await page.getByRole('button', { name: 'Login as Employer' }).click();
    await page.waitForURL('**/employer/dashboard', { timeout: 15000 });
    await page.goto(`${BASE_URL}/employer/jobs`);

    const refreshedRow = page.getByRole('row', { name: new RegExp(jobTitle) });
    await expect(refreshedRow.locator('span', { hasText: 'active' })).toBeVisible({ timeout: 20000 });
  });
});
