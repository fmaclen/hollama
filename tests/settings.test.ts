import { expect, test } from '@playwright/test';
import { mockTagsResponse } from './utils';

test.beforeEach(async ({ page }) => {
  await mockTagsResponse(page);
});

test('displays model list and updates settings store', async ({ page }) => {
  await page.goto('/');

  // Check if the model list contains the expected models
  const modelNames = await page.$$eval('select#model option', options =>
    options.map(option => option.textContent?.trim())
  );
  expect(modelNames).toContain('gemma:7b');
  expect(modelNames).toContain('openhermes2.5-mistral:latest');

  await page.getByLabel('Model').selectOption('openhermes2.5-mistral:latest');

  // Check if the settings store is updated with the selected model
  const localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
  expect(localStorageValue).toContain('"ollamaModel":"openhermes2.5-mistral:latest"');
});

test('handles server status updates correctly', async ({ page }) => {
  await page.goto('/');
  await expect (page.getByLabel('Server')).toHaveValue('http://localhost:11434');

  // The starting status is "connected"
  await expect(page.getByText('disconnected')).not.toBeVisible();
  await expect(page.getByText('connected', { exact: true })).toBeVisible();
  await expect(page.getByText('connected', { exact: true })).toHaveClass(/badge--positive/);

  // Mock the API to return an error response
  await page.route('**/api/tags', async (route) => {
    await route.abort();
  });

  // Trigger a new API request by typing in the input field
  await page.getByLabel('Server').clear();

  // Wait for the server status to be updated to "disconnected"
  await expect(page.getByText('connected', { exact: true })).not.toBeVisible();
  await expect(page.getByText('disconnected')).toBeVisible();
  await expect(page.getByText('disconnected')).toHaveClass(/badge--warning/);
});
