import { expect, test } from '@playwright/test';

import { mockOpenAITagsResponse } from './utils';

test.describe('OpenAI Integration', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/settings');
	});

	test('fetches data from OpenAI with a correct API Key', async ({ page }) => {
		await mockOpenAITagsResponse(page);
		await expect(page.getByText('Sync was successful')).toBeVisible();
	});

	test('fails to fetch data with an incorrect API key', async ({ page }) => {
		await page.route('**/v1/models', (route) => {
			route.fulfill({ status: 401, json: { error: { message: 'Invalid API key' } } });
		});

		await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
		await page.getByLabel('API Key').fill('sk-invalidapikey');
		await page.getByRole('button', { name: 'Connect' }).click();

		await expect(page.getByText('Failed to connect to OpenAI')).toBeVisible();
	});

	test('handles network connection error', async ({ page }) => {
		await page.route('**/v1/models', (route) => route.abort('failed'));

		await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
		await page.getByLabel('API Key').fill('sk-validapikey');
		await page.getByRole('button', { name: 'Connect' }).click();

		await expect(page.getByText('Failed to connect to OpenAI')).toBeVisible();
	});

	test('cannot send fetch requests without apiKey or baseUrl set', async ({ page }) => {
		const connectButton = page.getByRole('button', { name: 'Connect' });

		await expect(connectButton).toBeDisabled();

		await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
		await expect(connectButton).toBeDisabled();

		await page.getByLabel('Base URL').clear();
		await page.getByLabel('API Key').fill('sk-validapikey');
		await expect(connectButton).toBeDisabled();
	});

	test('models list is sorted correctly', async ({ page }) => {
		await mockOpenAITagsResponse(page);

		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();

		const modelOptions = page.locator('div[role="option"]');
		await expect(modelOptions.nth(0)).toHaveText('gpt-3.5-turbo');
		await expect(modelOptions.nth(1)).toHaveText('gpt-4');
	});

	test('OpenAI model is added to recently used list after use', async ({ page }) => {
		await mockOpenAITagsResponse(page);

		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();
		await page.getByRole('option', { name: 'gpt-3.5-turbo' }).click();

		// Simulate sending a message (you might need to adjust this based on your actual UI)
		await page.locator('.prompt-editor__textarea').fill('Hello, AI!');
		await page.getByRole('button', { name: 'Run' }).click();

		// Navigate back to model selection
		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();

		await expect(page.getByText('Recently used models', { exact: true })).toBeVisible();
		await expect(page.getByRole('option', { name: 'gpt-3.5-turbo' })).toBeVisible();
	});

	// TODO fix. Add mocked completion response
	test('OpenAI model is saved to localStorage for specific session', async ({ page }) => {
		await mockOpenAITagsResponse(page);

		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();
		await page.getByRole('option', { name: 'gpt-3.5-turbo' }).click();

		// Simulate sending a message
		await page.locator('.prompt-editor__textarea').fill('Hello, AI!');
		await page.getByRole('button', { name: 'Run' }).click();

		// Check localStorage
		const sessions = await page.evaluate(() => localStorage.getItem('hollama-sessions'));
		expect(sessions).toContain('"model":"gpt-3.5-turbo"');
	});

	test('only GPT models are available in FieldModelSelect', async ({ page }) => {
		await mockOpenAITagsResponse(page);

		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();

		await expect(page.getByRole('option', { name: 'gpt-3.5-turbo' })).toBeVisible();
		await expect(page.getByRole('option', { name: 'gpt-4' })).toBeVisible();
		await expect(page.getByRole('option', { name: 'text-davinci-003' })).not.toBeVisible();
	});
});
