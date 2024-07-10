import { expect, test } from '@playwright/test';
import { MOCK_API_TAGS_RESPONSE, mockTagsResponse } from './utils';

test.beforeEach(async ({ page }) => {
	await mockTagsResponse(page);
});

test('displays model list and updates settings store', async ({ page }) => {
	const modelSelect = page.getByLabel('Model');
	
	await page.goto('/');

	// Check if the model list contains the expected models
	await expect(modelSelect).toContainText(MOCK_API_TAGS_RESPONSE.models[0].name);
	await expect(modelSelect).toContainText(MOCK_API_TAGS_RESPONSE.models[1].name);

	await modelSelect.selectOption(MOCK_API_TAGS_RESPONSE.models[1].name);

	// Check if the settings store is updated with the selected model
	const localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageValue).toContain(`"ollamaModel":"${MOCK_API_TAGS_RESPONSE.models[1].name}"`);
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

test('settings can be deleted', async ({ page }) => {
	const modelSelect = page.getByLabel('Model');

	await page.goto('/');
	await expect(modelSelect).toHaveValue('');

	// Stage the settings store with a model
	await page.evaluate((modelName: string) => window.localStorage.setItem(
		'hollama-settings',
		JSON.stringify({
			ollamaServer: 'http://localhost:3000',
			ollamaModel: modelName
		})), MOCK_API_TAGS_RESPONSE.models[1].name);

	await page.reload();
	await expect(page.getByLabel('Server')).toHaveValue('http://localhost:3000');
	await expect(modelSelect).toHaveValue(MOCK_API_TAGS_RESPONSE.models[1].name);

	// Check if the settings store is updated with the selected model
	let localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageValue).toContain('"ollamaServer":"http://localhost:3000"');
	expect(localStorageValue).toContain(`"ollamaModel":"${MOCK_API_TAGS_RESPONSE.models[1].name}"`);

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
