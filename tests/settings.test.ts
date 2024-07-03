import { expect, test } from '@playwright/test';
import { mockTagsResponse } from './mocks';

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
	await expect(page.getByLabel('Server')).toHaveValue('http://localhost:11434');

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

test('settings and sessions can be deleted', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByLabel('Model')).toHaveValue('');

	// Stage the settings store with a model
	await page.evaluate(() => window.localStorage.setItem(
		'hollama-settings',
		JSON.stringify({
			ollamaServer: 'http://localhost:3000',
			ollamaModel: 'openhermes2.5-mistral:latest'
		})));

	await page.reload();
	await expect(page.getByLabel('Server')).toHaveValue('http://localhost:3000');
	await expect(page.getByLabel('Model')).toHaveValue('openhermes2.5-mistral:latest');

	// Check if the settings store is updated with the selected model
	let localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageValue).toContain('"ollamaServer":"http://localhost:3000"');
	expect(localStorageValue).toContain('"ollamaModel":"openhermes2.5-mistral:latest"');

	// Click the delete button
	page.on('dialog', dialog => dialog.accept("Are you sure you want to delete server settings?"));
	await page.getByText('Delete server settings').click();

	// Wait for page reload
	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-settings') !== null;
	});

	// Check if the settings has been reset to defaults
	localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageValue).toContain('"ollamaServer":"http://localhost:11434"');
	expect(localStorageValue).toContain('"ollamaModel":""');
});
