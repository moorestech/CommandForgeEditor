import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByTestId('sortable-item-1').click();
  await page.getByTestId('sortable-item-3').click({
    modifiers: ['Shift']
  });
  await page.getByTestId('sortable-item-1').click({
    button: 'right'
  });
  await page.getByRole('menuitem', { name: 'グループ化' }).click();

  await expect(page).toHaveScreenshot();
});