import { test, expect } from '@playwright/test';

test('Group commands', async ({ page }) => {
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


test('Add a command above the selected command', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByTestId('sortable-item-2').click({
    button: 'right'
  });
  await page.getByRole('menuitem', { name: '上にコマンドを追加' }).click();
  await page.getByRole('menuitem', { name: '待機' }).click();

  await expect(page).toHaveScreenshot();
});


test('Add a command below the selected command', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByTestId('sortable-item-2').click({
    button: 'right'
  });

  await page.getByRole('menuitem', { name: '下にコマンドを追加' }).click();
  await page.getByRole('menuitem', { name: '待機' }).click();

  await expect(page).toHaveScreenshot();
});