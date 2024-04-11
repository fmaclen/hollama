import { expect, test } from '@playwright/test';
import { MOCK_API_TAGS_RESPONSE, mockTagsResponse } from './utils';

test.beforeEach(async ({ page }) => {
  await mockTagsResponse(page);
});

test('displays model list and updates settings store', async ({ page }) => {
  await page.goto('/');

  // Wait for the model list to be loaded
  await page.waitForSelector('label:has-text("Model")');

  // Click on the button that opens the model list
  await page.click('button[data-melt-select-trigger]');

  // Wait for the model list to be visible
  await page.waitForSelector('div[role="listbox"]');

  // Check if the model list contains the expected models
  const modelNames = await page.$$eval('div[role="option"]', options =>
    options.map(option => option.textContent?.trim())
  );
  expect(modelNames).toContain('gemma:7b');
  expect(modelNames).toContain('openhermes2.5-mistral:latest');

  // Select a model by clicking on its name
  await page.click('div[role="option"]:has-text("openhermes2.5-mistral:latest")');

  // Check if the settings store is updated with the selected model
  const localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
  expect(localStorageValue).toContain('"ollamaModel":"openhermes2.5-mistral:latest"');
});

test('handles server status updates correctly', async ({ page }) => {
  await page.goto('/');
  await page.waitForSelector('label:has-text("Server")');

  // Mock the API to return a successful response
  await page.route('**/api/tags', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_TAGS_RESPONSE)
    });
  });

  // Trigger a new API request by typing in the input field
  await page.fill('input[placeholder="http://localhost:11434"]', 'http://example.com');

  // Wait for the server status to be updated to "connected"
  await expect(page.getByText('connected', { exact: true })).toBeVisible();
  await expect(page.getByText('connected', { exact: true })).toHaveClass(/bg-emerald-600/);

  // Mock the API to return an error response
  await page.route('**/api/tags', async (route) => {
    await route.abort();
  });

  // Trigger a new API request by typing in the input field
  await page.fill('input[placeholder="http://localhost:11434"]', 'http://example.com/invalid');

  // Wait for the server status to be updated to "disconnected"
  await expect(page.getByText('disconnected')).toBeVisible();
  await expect(page.getByText('disconnected')).toHaveClass(/bg-amber-600/);
});
