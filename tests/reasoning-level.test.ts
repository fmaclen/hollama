import { expect, test, type Page, type Route } from '@playwright/test';

import {
	chooseFromCombobox,
	chooseModel,
	MOCK_SESSION_1_RESPONSE_1,
	mockOllamaModelsResponse
} from './utils';

const THINKING_LEVELS: Record<string, unknown> = {
	'openhermes2.5-mistral:latest': { values: ['low', 'medium', 'high'], default: 'medium' },
	'TheBloke/CodeLlama-70B-Python-AWQ': { values: [false, true], default: true }
};

async function mockShowResponse(page: Page) {
	await page.route('**/api/show', async (route: Route) => {
		const { model } = route.request().postDataJSON();
		const thinking = THINKING_LEVELS[model];
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(thinking ? { thinking } : {})
		});
	});
}

async function captureChatRequests(page: Page) {
	const requests: Record<string, unknown>[] = [];
	await page.route('**/api/chat', async (route: Route) => {
		requests.push(route.request().postDataJSON());
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(MOCK_SESSION_1_RESPONSE_1)
		});
	});
	return requests;
}

async function send(page: Page, prompt: string) {
	await page.locator('.prompt-editor__textarea').fill(prompt);
	await page.getByText('Run').click();
	await expect(page.getByText(MOCK_SESSION_1_RESPONSE_1.message.content).last()).toBeVisible();
}

test.describe('Reasoning level', () => {
	test.beforeEach(async ({ page }) => {
		await mockOllamaModelsResponse(page);
		await mockShowResponse(page);
	});

	test('offers the levels the model reports and sends only a changed one', async ({ page }) => {
		const requests = await captureChatRequests(page);
		const reasoning = page.getByLabel('Reasoning', { exact: true });

		await page.goto('/sessions/new');
		await chooseModel(page, 'openhermes2.5-mistral:latest');
		await expect(reasoning).toHaveValue('Medium');

		await reasoning.click();
		await expect(page.getByRole('option')).toHaveText(['Low', 'Medium', 'High']);
		await page.keyboard.press('Escape');

		await send(page, 'First');
		expect(requests[0]).not.toHaveProperty('think');

		await chooseFromCombobox(page, 'Reasoning', 'High');
		await send(page, 'Second');
		expect(requests[1].think).toBe('high');
	});

	test('hides for models that do not reason', async ({ page }) => {
		await page.goto('/sessions/new');
		await chooseModel(page, 'gemma:7b');
		await expect(page.getByLabel('Available models')).toHaveValue('gemma:7b');
		await expect(page.getByLabel('Reasoning', { exact: true })).not.toBeVisible();
	});

	test('remembers the level per model in new sessions', async ({ page }) => {
		const requests = await captureChatRequests(page);
		const reasoning = page.getByLabel('Reasoning', { exact: true });

		await page.goto('/sessions/new');
		await chooseModel(page, 'openhermes2.5-mistral:latest');
		await chooseFromCombobox(page, 'Reasoning', 'High');
		await chooseModel(page, 'TheBloke/CodeLlama-70B-Python-AWQ');
		await expect(reasoning).toHaveValue('On');

		await page.goto('/sessions/new');
		await chooseModel(page, 'openhermes2.5-mistral:latest');
		await expect(reasoning).toHaveValue('High');
		await send(page, 'Hello');
		expect(requests[0].think).toBe('high');
	});
});
