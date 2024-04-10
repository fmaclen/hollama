import { expect, test } from '@playwright/test';
import type { OllamaTagResponse } from '$lib/ollama';

const MOCK_API_TAGS_RESPONSE: OllamaTagResponse = {
	models: [
		{
			name: 'gemma:7b',
			model: 'gemma:7b',
			modified_at: '2024-04-08T21:41:35.217983842-04:00"',
			size: 5011853225,
			digest: 'a72c7f4d0a15522df81486d13ce432c79e191bda2558d024fbad4362c4f7cbf8',
			details: {
				parent_model: '',
				format: 'gguf',
				family: 'gemma',
				families: ["gemma"],
				parameter_size: '9B',
				quantization_level: 'Q4_0'
			}
		},
		{
			name: "mistral:latest",
			model: "mistral:latest",
			modified_at: "2023-11-24T16:32:44.035655802-05:00",
			size: 4108916866,
			digest: "d364aa8d131ef7abfc1275db682d281a307d9451fc00f96abe154d0059b0be49",
			details: {
				parent_model: "",
				format: "gguf",
				family: "llama",
				families: null,
				parameter_size: "7B",
				quantization_level: "Q4_0"
			}
		}
	]
};

test.beforeEach(async ({ page }) => {
  // Enable request interception
  await page.route('**/api/tags', async (route) => {
    // Fulfill the request with the mock response
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_TAGS_RESPONSE)
    });
  });
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
  expect(modelNames).toContain('mistral:latest');

  // Select a model by clicking on its name
  await page.click('div[role="option"]:has-text("mistral:latest")');

  // Check if the settings store is updated with the selected model
  const localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
  expect(localStorageValue).toContain('"ollamaModel":"mistral:latest"');
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
