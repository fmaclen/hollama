import { expect, test } from '@playwright/test';
import { MOCK_API_TAGS_RESPONSE, mockTagsResponse } from './utils';
import type { ErrorResponse, ProgressResponse, StatusResponse } from 'ollama/browser';

test.beforeEach(async ({ page }) => {
	await mockTagsResponse(page);
});

test('displays model list and updates settings store', async ({ page }) => {
	const modelSelect = page.getByLabel('Available models');

	await page.goto('/');

	// Check if the model list contains the expected models
	await expect(modelSelect).toContainText(MOCK_API_TAGS_RESPONSE.models[0].name);
	await expect(modelSelect).toContainText(MOCK_API_TAGS_RESPONSE.models[1].name);
	await expect(modelSelect).toContainText(MOCK_API_TAGS_RESPONSE.models[2].name);

	await modelSelect.selectOption(MOCK_API_TAGS_RESPONSE.models[1].name);

	// Check if the settings store is updated with the selected model
	const localStorageValue = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	if (!localStorageValue) throw new Error('No local storage value');
	const parsedLocalStorageValue = JSON.parse(localStorageValue);
	expect(parsedLocalStorageValue.ollamaModel).toBe(MOCK_API_TAGS_RESPONSE.models[1].name);
	// Check that the models are sorted alphabetically (excluding 3rd party repositories)
	expect(parsedLocalStorageValue.ollamaModels[0].name).toBe(MOCK_API_TAGS_RESPONSE.models[1].name);
	expect(parsedLocalStorageValue.ollamaModels[1].name).toBe(MOCK_API_TAGS_RESPONSE.models[2].name);
	expect(parsedLocalStorageValue.ollamaModels[2].name).toBe(MOCK_API_TAGS_RESPONSE.models[0].name);
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

test('deletes all settings and resets to default values', async ({ page }) => {
	await page.goto('/');
	const modelSelect = page.getByLabel('Available models');
	await expect(modelSelect).toHaveValue('');

	await page.getByLabel('Server').fill('http://localhost:3000');
	await page.getByLabel('Available models').selectOption(MOCK_API_TAGS_RESPONSE.models[1].name);
	await page.reload();
	await expect(page.getByLabel('Server')).toHaveValue('http://localhost:3000');
	await expect(modelSelect).toHaveValue(MOCK_API_TAGS_RESPONSE.models[1].name);

	// Check if the settings store is updated with the selected model
	let localStorageValue = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(localStorageValue).toContain('"ollamaServer":"http://localhost:3000"');
	expect(localStorageValue).toContain(`"ollamaModel":"${MOCK_API_TAGS_RESPONSE.models[1].name}"`);

	// Click the delete button
	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete server settings?'));
	await page.getByText('Delete all settings').click();

	// Wait for page reload
	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-settings') !== null;
	});

	// Check if the settings has been reset to defaults
	localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageValue).toContain('"ollamaServer":"http://localhost:11434"');
	expect(localStorageValue).toContain('"ollamaModel":""');
});

test('a model can be pulled from the ollama library', async ({ page }) => {
	const downloadButton = page.getByRole('button', { name: 'Download model' });
	const modelTagInput = page.getByLabel('Pull model');

	await page.goto('/settings');
	await expect(downloadButton).toBeDisabled();
	await expect(downloadButton).not.toHaveClass(/button--is-loading/);

	await modelTagInput.fill('llama3.1');
	await expect(downloadButton).toBeEnabled();
	await expect(downloadButton).not.toHaveClass(/button--is-loading/);

	await page.route('**/api/pull', (route) => {
		setTimeout(() => route.fulfill({ json: { status: 'pulling model' } }), 1000);
	});
	await downloadButton.click();
	await expect(downloadButton).toBeDisabled();
	await expect(downloadButton).toHaveClass(/button--is-loading/);
	await expect(modelTagInput).toBeDisabled();
	await expect(page.getByText('Pulling model', { exact: false })).toBeVisible();
	await expect(downloadButton).not.toBeDisabled();

	const progressResponse: ProgressResponse = {
		status: 'pulling 5fd4e1793450',
		completed: 25,
		total: 50,
		digest: 'sha256:5fd4e179345020dd97359b0b4fd6ae20c3f918d6b8ed8cda7d855f92561c7ea7'
	};
	await page.route('**/api/pull', (route) => route.fulfill({ json: progressResponse }));
	await downloadButton.click();
	await expect(page.getByText('pulling 5fd4e1793450', { exact: false })).toBeVisible();
	await expect(page.getByText('50%', { exact: false })).toBeVisible();

	const errorResponse: ErrorResponse = { error: 'pull model manifest: file does not exist' };
	await page.route('**/api/pull', (route) => route.fulfill({ json: errorResponse }));
	await downloadButton.click();
	await expect(page.getByText('Error', { exact: false })).toBeVisible();
	await expect(
		page.getByText('pull model manifest: file does not exist', { exact: false })
	).toBeVisible();

	const successResponse: StatusResponse = { status: 'success' };
	await page.route('**/api/pull', (route) => route.fulfill({ json: successResponse }));
	await downloadButton.click();
	await expect(page.getByText('Success', { exact: false })).toBeVisible();
	await expect(page.getByText('llama3.1 was downloaded', { exact: false })).toBeVisible();
	await expect(modelTagInput).toHaveValue('');
	await expect(downloadButton).toBeDisabled();
	await expect(modelTagInput).not.toBeDisabled();
});
