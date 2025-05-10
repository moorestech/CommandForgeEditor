import { test, expect } from '@playwright/test';

test('basic app functionality', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('text=スキット編集ツール')).toBeVisible();

  await expect(page.locator('button:has-text("追加")')).toBeVisible();
  await expect(page.locator('button:has-text("保存")')).toBeVisible();
});
