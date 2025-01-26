import { expect, test } from '@playwright/test';

import {
	chooseFromCombobox,
	chooseModel,
	MOCK_API_TAGS_RESPONSE,
	MOCK_SESSION_1_RESPONSE_1,
	MOCK_SESSION_1_RESPONSE_2,
	MOCK_SESSION_1_RESPONSE_3,
	MOCK_SESSION_2_RESPONSE_1,
	mockOllamaModelsResponse
} from './utils';

test.beforeEach(async ({ page }) => {
	await mockOllamaModelsResponse(page);
});

test('can navigate between session messages and controls', async ({ page }) => {
	await page.goto('/');

	// Seed session
	const MOCK_SESSION = [
		{
			id: '16pk4l',
			model: 'gemma2:27b',
			updatedAt: '2024-09-24T14:24:30.725Z',
			messages: [
				{ role: 'user', content: "What's the NATO phonetic alphabet?" },
				{
					role: 'assistant',
					content:
						'Alpha\n\nBravo\n\nCharlie\n\nDelta\n\nEcho\n\nFoxtrot\n\nGolf\n\nHotel\n\nIndia\n\nJuliet\n\nKilo\n\nLima\n\nMike\n\nNovember\n\nOscar\n\nPapa\n\nQuebec\n\nRomeo\n\nSierra\n\nTango\n\nUniform\n\nVictor\n\nWhiskey\n\nX-ray\n\nYankee\n\nZulu'
				}
			]
		}
	];
	await page.evaluate(
		(data) => window.localStorage.setItem('hollama-sessions', JSON.stringify(data)),
		MOCK_SESSION
	);

	await page.reload();
	await page.getByText('Sessions', { exact: true }).click();
	await page.getByText("What's the NATO phonetic alphabet?").click();
	await expect(page.getByText('Zulu')).toBeVisible();
	await expect(page.getByText('System prompt')).not.toBeVisible();

	// Check it scrolls to the bottom when the page loads
	const sessionHistory = page.locator('.session__history');
	const initialScrollTop = await sessionHistory.evaluate((el) => el.scrollTop);
	await sessionHistory.evaluate((el) => el.scrollTop);

	// Switch to Controls
	await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
	await page.getByLabel('Controls').click();
	await expect(page.getByText('Zulu')).not.toBeVisible();
	await expect(page.getByText('System prompt')).toBeVisible();

	await page.getByLabel('Messages').click();
	await expect(page.getByText('Zulu')).toBeVisible();
	await expect(page.getByText('System prompt')).not.toBeVisible();
	// Check it scrolls to the bottom after switching back to Messages
	const currentScrollTop = await sessionHistory.evaluate((el) => el.scrollTop);
	expect(currentScrollTop).toBe(initialScrollTop);
});

test('can set ollama model and runtime options', async ({ page }) => {
	await page.goto('/');
	await page.getByText('Sessions', { exact: true }).click();
	await page.getByTestId('new-session').click();

	const modelName = MOCK_API_TAGS_RESPONSE.models[1].name;
	await chooseFromCombobox(page, 'Available models', modelName);

	let requestPayload;

	await page.route('**/api/chat', async (route) => {
		const request = route.request();
		requestPayload = JSON.parse(request.postData() || '{}');
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(MOCK_SESSION_1_RESPONSE_1)
		});
	});

	const promptTextarea = page.locator('.prompt-editor__textarea');
	await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
	await page.getByText('Run').click();
	expect(requestPayload).toEqual({
		model: 'gemma:7b',
		options: {},
		messages: [
			{
				role: 'user',
				content: 'Who would win in a fight between Emma Watson and Jessica Alba?'
			}
		]
	});
	await expect(
		page.locator('article', {
			hasText: 'Who would win in a fight between Emma Watson and Jessica Alba?'
		})
	).toBeVisible();

	await page.route('**/api/chat', async (route) => {
		const request = route.request();
		requestPayload = JSON.parse(request.postData() || '{}');
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(MOCK_SESSION_1_RESPONSE_2)
		});
	});

	await page.getByLabel('Controls').click();
	await expect(
		page.locator('article', {
			hasText: 'Who would win in a fight between Emma Watson and Jessica Alba?'
		})
	).not.toBeVisible();
	await expect(page.locator('article', { hasText: 'Whatever...' })).not.toBeVisible();
	await expect(page.getByText('System prompt')).toBeVisible();

	// Model options
	await page.getByLabel('Num keep').fill('5');
	await page.getByLabel('Seed').fill('42');
	await page.getByLabel('Num predict').fill('100');
	await page.getByLabel('Top K').fill('50');
	await page.getByLabel('Top P').fill('0.95');
	await page.getByLabel('Min P').fill('0.05');
	await page.getByLabel('TFS Z').fill('0.5');
	await page.getByLabel('Typical P').fill('0.7');
	await page.getByLabel('Repeat last N').fill('32');
	await page.getByLabel('Temperature').fill('0.7');
	await page.getByLabel('Repeat penalty').fill('1.2');
	await page.getByLabel('Presence penalty').fill('0.5');
	await page.getByLabel('Frequency penalty').fill('0.5');
	await page.getByLabel('Mirostat', { exact: true }).fill('1');
	await page.getByLabel('Mirostat Tau').fill('3.9');
	await page.getByLabel('Mirostat ETA').fill('0.15');
	await page.getByLabel('Stop sequence').fill('AI assistant:');
	await page.getByLabel('Penalize newline').check();

	// Runtime options
	await page.getByLabel('Context size').fill('4096');
	await page.getByLabel('Num batch').fill('512');
	await page.getByLabel('Num GPU').fill('1');
	await page.getByLabel('Main GPU').fill('0');
	await page.getByLabel('Number of threads').fill('8');
	await page.getByLabel('NUMA').check();
	await page.getByLabel('Low VRAM').check();
	await page.getByLabel('F16 KV').check();
	await page.getByLabel('Vocab only').check();
	await page.getByLabel('Use MMAP').check();
	await page.getByLabel('Use MLOCK').check();

	await promptTextarea.fill('Whatever...');
	await page.getByRole('button', { name: 'Run' }).click();

	// Assert submitting the prompt from Controls switches to the Messages tab
	await expect(page.locator('article', { hasText: 'Whatever...' })).toBeVisible();
	await expect(page.getByText('System prompt')).not.toBeVisible();

	// Assert the options were submitted correctly
	const customizedOptions = {
		// Model options
		num_keep: 5,
		seed: 42,
		num_predict: 100,
		top_k: 50,
		top_p: 0.95,
		min_p: 0.05,
		tfs_z: 0.5,
		typical_p: 0.7,
		repeat_last_n: 32,
		temperature: 0.7,
		repeat_penalty: 1.2,
		presence_penalty: 0.5,
		frequency_penalty: 0.5,
		mirostat: 1,
		mirostat_tau: 3.9,
		mirostat_eta: 0.15,
		stop: ['AI assistant:'],
		penalize_newline: true,
		// Runtime options
		num_ctx: 4096,
		num_batch: 512,
		num_gpu: 1,
		main_gpu: 0,
		num_thread: 8,
		numa: true,
		low_vram: true,
		f16_kv: true,
		vocab_only: true,
		use_mmap: true,
		use_mlock: true
	};

	expect(requestPayload).toEqual({
		model: 'gemma:7b',
		options: customizedOptions,
		messages: [
			{
				role: 'user',
				content: 'Who would win in a fight between Emma Watson and Jessica Alba?'
			},
			{
				role: 'assistant',
				reasoning: '',
				content: MOCK_SESSION_1_RESPONSE_1.message.content
			},
			{
				role: 'user',
				content: 'Whatever...'
			}
		]
	});

	// Check the options persist when navigating between sessions
	await page.getByTestId('new-session').click();
	await expect(
		page.locator('article', {
			hasText: 'Who would win in a fight between Emma Watson and Jessica Alba?'
		})
	).not.toBeVisible();

	await page.route('**/api/chat', async (route) => {
		const request = route.request();
		requestPayload = JSON.parse(request.postData() || '{}');
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(MOCK_SESSION_2_RESPONSE_1)
		});
	});

	await promptTextarea.fill('What does the fox say?');
	await chooseFromCombobox(page, 'Available models', 'openhermes2.5-mistral:latest');
	await page.getByRole('button', { name: 'Run' }).click();
	expect(requestPayload).toEqual({
		model: 'openhermes2.5-mistral:latest',
		options: {},
		messages: [
			{
				role: 'user',
				content: 'What does the fox say?'
			}
		]
	});
	await expect(page.locator('article', { hasText: 'What does the fox say?' })).toBeVisible();

	await page
		.locator('.section-list-item__a', {
			hasText: 'Who would win in a fight'
		})
		.click();
	await expect(page.locator('article', { hasText: 'What does the fox say?' })).not.toBeVisible();

	await page.route('**/api/chat', async (route) => {
		const request = route.request();
		requestPayload = JSON.parse(request.postData() || '{}');

		// Continue with the original mock response
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(MOCK_SESSION_1_RESPONSE_2)
		});
	});

	await promptTextarea.fill(
		'Write a Python function to calculate the odds of the winner in a fight between Emma Watson and Jessica Alba'
	);

	await page.route('**/api/chat', async (route) => {
		const request = route.request();
		requestPayload = JSON.parse(request.postData() || '{}');

		// Continue with the original mock response
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(MOCK_SESSION_1_RESPONSE_3)
		});
	});

	await page.getByRole('button', { name: 'Run' }).click();
	// Model is retained from last session
	expect(requestPayload).toEqual({
		model: 'gemma:7b',
		options: customizedOptions,
		messages: [
			{
				role: 'user',
				content: 'Who would win in a fight between Emma Watson and Jessica Alba?'
			},
			{
				role: 'assistant',
				reasoning: '',
				content: MOCK_SESSION_1_RESPONSE_1.message.content
			},
			{
				role: 'user',
				content: 'Whatever...'
			},
			{
				role: 'assistant',
				reasoning: '',
				content: MOCK_SESSION_1_RESPONSE_2.message.content
			},
			{
				role: 'user',
				content:
					'Write a Python function to calculate the odds of the winner in a fight between Emma Watson and Jessica Alba'
			}
		]
	});

	await page.getByLabel('Controls').click();
	// Model options
	await expect(page.getByLabel('Num keep')).toHaveValue('5');
	await expect(page.getByLabel('Seed')).toHaveValue('42');
	await expect(page.getByLabel('Num predict')).toHaveValue('100');
	await expect(page.getByLabel('Top K')).toHaveValue('50');
	await expect(page.getByLabel('Top P')).toHaveValue('0.95');
	await expect(page.getByLabel('Min P')).toHaveValue('0.05');
	await expect(page.getByLabel('TFS Z')).toHaveValue('0.5');
	await expect(page.getByLabel('Typical P')).toHaveValue('0.7');
	await expect(page.getByLabel('Repeat last N')).toHaveValue('32');
	await expect(page.getByLabel('Temperature')).toHaveValue('0.7');
	await expect(page.getByLabel('Repeat penalty')).toHaveValue('1.2');
	await expect(page.getByLabel('Presence penalty')).toHaveValue('0.5');
	await expect(page.getByLabel('Frequency penalty')).toHaveValue('0.5');
	await expect(page.getByLabel('Mirostat', { exact: true })).toHaveValue('1');
	await expect(page.getByLabel('Mirostat Tau')).toHaveValue('3.9');
	await expect(page.getByLabel('Mirostat ETA')).toHaveValue('0.15');
	await expect(page.getByLabel('Stop sequence')).toHaveValue('AI assistant:');
	await expect(page.getByLabel('Penalize newline')).toBeChecked();
	// Runtime options
	await expect(page.getByLabel('Context size')).toHaveValue('4096');
	await expect(page.getByLabel('Num batch')).toHaveValue('512');
	await expect(page.getByLabel('Num GPU')).toHaveValue('1');
	await expect(page.getByLabel('Main GPU')).toHaveValue('0');
	await expect(page.getByLabel('Number of threads')).toHaveValue('8');
	await expect(page.getByLabel('NUMA')).toBeChecked();
	await expect(page.getByLabel('Low VRAM')).toBeChecked();
	await expect(page.getByLabel('F16 KV')).toBeChecked();
	await expect(page.getByLabel('Vocab only')).toBeChecked();
	await expect(page.getByLabel('Use MMAP')).toBeChecked();
	await expect(page.getByLabel('Use MLOCK')).toBeChecked();

	// Check the options were saved to localStorage
	const savedSessions = await page.evaluate(() => window.localStorage.getItem('hollama-sessions'));
	const parsedSessions = JSON.parse(savedSessions || '[]');
	const savedOptions = parsedSessions[0].options;

	// The order isn't guaranteed, so we need to check each option individually
	for (const [key, value] of Object.entries(customizedOptions)) {
		expect(savedOptions).toHaveProperty(key, value);
	}
});
