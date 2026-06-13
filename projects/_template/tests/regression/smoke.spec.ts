// Spec: specs/smoke.spec.md
import { test, expect } from '@playwright/test';

test('@smoke @unreviewed monorepo smoke — Playwright levanta y navega', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page.getByRole('heading', { name: 'Example Domain' })).toBeVisible();
});
