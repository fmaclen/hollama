import { expect, test } from '@playwright/test';

import {
	MOCK_OPENAI_COMPLETION_RESPONSE_1,
	MOCK_OPENAI_MODELS,
	MOCK_SESSION_1_RESPONSE_1,
	mockOpenAICompletionResponse,
	mockOpenAIModelsResponse,
	mockTagsResponse
} from './utils';

test.describe('OpenAI Integration', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/settings');
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
		await mockTagsResponse(page);
		await mockOpenAIModelsResponse(page, MOCK_OPENAI_MODELS);

		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await page.getByLabel('Available models').click();

		const modelOptions = page.locator('div[role="option"]');
		await expect(modelOptions.nth(1)).toHaveText('gpt-3.5-turbo');
		await expect(modelOptions.nth(2)).toHaveText('gpt-4');
	});

	test('OpenAI model is added to recently used list after use', async ({ page }) => {
		await mockOpenAIModelsResponse(page, MOCK_OPENAI_MODELS);

		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await page.getByLabel('Available models').click();
		await page.getByRole('option', { name: 'gpt-3.5-turbo' }).click();

		// Check that the model was not in the recently used list
		await expect(page.getByText('Recently used models', { exact: true })).not.toBeVisible();

		// Simulate sending a message (you might need to adjust this based on your actual UI)
		await page.locator('.prompt-editor__textarea').fill('Hello, AI!');
		await page.getByRole('button', { name: 'Run' }).click();

		await page.getByLabel('Available models').click();
		await expect(page.getByText('Recently used models', { exact: true })).toBeVisible();
		await expect(page.getByRole('option', { name: 'gpt-3.5-turbo' })).toBeVisible();
	});

	// TODO fix. Add mocked completion response
	test('OpenAI model is saved to localStorage for specific session', async ({ page }) => {
		await mockOpenAIModelsResponse(page, MOCK_OPENAI_MODELS);

		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await page.getByLabel('Available models').click();
		await page.getByRole('option', { name: 'gpt-3.5-turbo' }).click();

		await mockOpenAICompletionResponse(page, MOCK_OPENAI_COMPLETION_RESPONSE_1);

		// Simulate sending a message
		await page.locator('.prompt-editor__textarea').fill('Hello, AI!');
		await page.getByRole('button', { name: 'Run' }).click();
		await expect(page.getByText(MOCK_SESSION_1_RESPONSE_1.message.content)).toBeVisible();

		// Check localStorage
		const sessions = await page.evaluate(() => localStorage.getItem('hollama-sessions'));
		expect(sessions).toContain('"model":"gpt-3.5-turbo"');
	});

	test('only GPT models are available in FieldModelSelect', async ({ page }) => {
		await mockOpenAIModelsResponse(page, MOCK_OPENAI_MODELS);
		expect(MOCK_OPENAI_MODELS).toHaveLength(3);
		expect(MOCK_OPENAI_MODELS[2].id).toContain('text-davinci-003');

		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await page.getByLabel('Available models').click();

		await expect(page.getByRole('option', { name: 'gpt-3.5-turbo' })).toBeVisible();
		await expect(page.getByRole('option', { name: 'gpt-4' })).toBeVisible();
		await expect(page.getByRole('option', { name: 'text-davinci-003' })).not.toBeVisible();
	});
});
