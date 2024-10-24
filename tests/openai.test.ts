import { expect, test } from '@playwright/test';

import { MOCK_API_TAGS_RESPONSE, mockTagsResponse } from './utils';

const MOCK_OPENAI_MODELS = [
	{ id: 'gpt-3.5-turbo', object: 'model', created: 1677610602, owned_by: 'openai' },
	{ id: 'gpt-4', object: 'model', created: 1687882411, owned_by: 'openai' },
	{ id: 'text-davinci-003', object: 'model', created: 1669599635, owned_by: 'openai-internal' }
];

test.describe('OpenAI Integration', () => {
	test.beforeEach(async ({ page }) => {
		await mockTagsResponse(page);
		await page.goto('/settings');
	});

	test('fetches data from OpenAI with a correct API Key', async ({ page }) => {
		await page.route('**/v1/models', (route) => {
			route.fulfill({ json: { data: MOCK_OPENAI_MODELS } });
		});

		await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
		await page.getByLabel('API Key').fill('sk-validapikey');
		await page.getByRole('button', { name: 'Connect' }).click();

		await expect(page.getByText('OpenAI sync successful')).toBeVisible();
	});

	test('fails to fetch data with an incorrect API key', async ({ page }) => {
		await page.route('**/v1/models', (route) => {
			route.fulfill({ status: 401, json: { error: { message: 'Invalid API key' } } });
		});

		await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
		await page.getByLabel('API Key').fill('sk-invalidapikey');
		await page.getByRole('button', { name: 'Connect' }).click();

		await expect(page.getByText('OpenAI sync failed')).toBeVisible();
	});

	test('handles network connection error', async ({ page }) => {
		await page.route('**/v1/models', (route) => route.abort('failed'));

		await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
		await page.getByLabel('API Key').fill('sk-validapikey');
		await page.getByRole('button', { name: 'Connect' }).click();

		await expect(page.getByText('OpenAI sync failed')).toBeVisible();
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
		await page.route('**/v1/models', (route) => {
			route.fulfill({ json: { data: MOCK_OPENAI_MODELS } });
		});

		await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
		await page.getByLabel('API Key').fill('sk-validapikey');
		await page.getByRole('button', { name: 'Connect' }).click();

		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();

		const modelOptions = page.locator('li[role="option"]');
		await expect(modelOptions.nth(0)).toHaveText('gpt-3.5-turbo');
		await expect(modelOptions.nth(1)).toHaveText('gpt-4');
	});

	test('OpenAI model is added to recently used list after use', async ({ page }) => {
		await page.route('**/v1/models', (route) => {
			route.fulfill({ json: { data: MOCK_OPENAI_MODELS } });
		});

		await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
		await page.getByLabel('API Key').fill('sk-validapikey');
		await page.getByRole('button', { name: 'Connect' }).click();

		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();
		await page.getByRole('option', { name: 'gpt-3.5-turbo' }).click();

		// Simulate sending a message (you might need to adjust this based on your actual UI)
		await page.getByLabel('Prompt').fill('Hello, AI!');
		await page.getByRole('button', { name: 'Run' }).click();

		// Navigate back to model selection
		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();

		await expect(page.getByText('Last used models')).toBeVisible();
		await expect(page.getByRole('option', { name: 'gpt-3.5-turbo' })).toBeVisible();
	});

	test('OpenAI model is saved to localStorage for specific session', async ({ page }) => {
		await page.route('**/v1/models', (route) => {
			route.fulfill({ json: { data: MOCK_OPENAI_MODELS } });
		});

		await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
		await page.getByLabel('API Key').fill('sk-validapikey');
		await page.getByRole('button', { name: 'Connect' }).click();

		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();
		await page.getByRole('option', { name: 'gpt-3.5-turbo' }).click();

		// Simulate sending a message
		await page.getByLabel('Prompt').fill('Hello, AI!');
		await page.getByRole('button', { name: 'Run' }).click();

		// Check localStorage
		const sessions = await page.evaluate(() => localStorage.getItem('hollama-sessions'));
		expect(sessions).toContain('"model":"gpt-3.5-turbo"');
	});

	test('only GPT models are available in FieldModelSelect', async ({ page }) => {
		await page.route('**/v1/models', (route) => {
			route.fulfill({ json: { data: MOCK_OPENAI_MODELS } });
		});

		await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
		await page.getByLabel('API Key').fill('sk-validapikey');
		await page.getByRole('button', { name: 'Connect' }).click();

		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();

		await expect(page.getByRole('option', { name: 'gpt-3.5-turbo' })).toBeVisible();
		await expect(page.getByRole('option', { name: 'gpt-4' })).toBeVisible();
		await expect(page.getByRole('option', { name: 'text-davinci-003' })).not.toBeVisible();
	});

	test('Ollama models have an ollama badge', async ({ page }) => {
		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();

		for (const model of MOCK_API_TAGS_RESPONSE.models) {
			await expect(page.getByRole('option', { name: model.name })).toContainText('ollama');
		}
	});

	test('OpenAI models have an openai badge', async ({ page }) => {
		await page.route('**/v1/models', (route) => {
			route.fulfill({ json: { data: MOCK_OPENAI_MODELS } });
		});

		await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
		await page.getByLabel('API Key').fill('sk-validapikey');
		await page.getByRole('button', { name: 'Connect' }).click();

		await page.goto('/sessions/new');
		await page.getByLabel('Available models').click();

		await expect(page.getByRole('option', { name: 'gpt-3.5-turbo' })).toContainText('openai');
		await expect(page.getByRole('option', { name: 'gpt-4' })).toContainText('openai');
	});
});
