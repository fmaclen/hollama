import { expect, test, type Page } from '@playwright/test';

import {
	chooseFromCombobox,
	chooseModel,
	MOCK_API_TAGS_RESPONSE,
	MOCK_OPENAI_MODELS,
	MOCK_SESSION_1_RESPONSE_1,
	MOCK_SESSION_1_RESPONSE_2,
	MOCK_SESSION_1_RESPONSE_3,
	MOCK_SESSION_2_RESPONSE_1,
	mockOllamaModelsResponse,
	mockOpenAIModelsResponse
} from './utils';

async function openControls(page: Page, modelName: string) {
	await page.goto('/sessions/new');
	await chooseModel(page, modelName);
	await page.getByLabel('Controls').click();
	await expect(page.getByText('System prompt')).toBeVisible();
}

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
	await page.getByRole('tab', { name: 'Sessions' }).click();

	await page.getByText("What's the NATO phonetic alphabet?").click();
	await expect(page.getByText('Zulu')).toBeVisible();
	await expect(page.getByText('System prompt')).not.toBeVisible();

	// Check it scrolls to the bottom when the page loads
	const sessionHistory = page.locator('.session__history');
	const scrollTop = () => sessionHistory.evaluate((el) => el.scrollTop);
	// The app scrolls on the next animation frame, so wait for it to land
	await expect
		.poll(() => sessionHistory.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop))
		.toBeLessThanOrEqual(1);
	const initialScrollTop = await scrollTop();
	expect(initialScrollTop).toBeGreaterThan(0);

	// Switch to Controls
	await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
	await page.getByLabel('Controls').click();
	await expect(page.getByText('Zulu')).not.toBeVisible();
	await expect(page.getByText('System prompt')).toBeVisible();

	await page.getByLabel('Messages').click();
	await expect(page.getByText('Zulu')).toBeVisible();
	await expect(page.getByText('System prompt')).not.toBeVisible();
	// Check it scrolls to the bottom after switching back to Messages
	await expect.poll(scrollTop).toBe(initialScrollTop);
});

test('can set ollama model and runtime options', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('tab', { name: 'Sessions' }).click();

	await page.getByTestId('new-session').click();

	const modelName = MOCK_API_TAGS_RESPONSE.models[1].name;
	await chooseFromCombobox(page, 'Available models', modelName);

	let requestPayload: unknown;

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
	await expect
		.poll(() => requestPayload)
		.toEqual({
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

	await page.getByLabel('Num keep').fill('5');
	await page.getByLabel('Seed').fill('42');
	await page.getByLabel('Num predict').fill('100');
	await page.getByLabel('Top K').fill('50');
	await page.getByLabel('Top P').fill('0.95');
	await page.getByLabel('Min P').fill('0.05');
	await page.getByLabel('Repeat last N').fill('32');
	await page.getByLabel('Temperature').fill('0.7');
	await page.getByLabel('Repeat penalty').fill('1.2');
	await page.getByLabel('Presence penalty').fill('0.5');
	await page.getByLabel('Frequency penalty').fill('0.5');
	await page.getByLabel('Stop sequence').fill('AI assistant:');

	await page.getByLabel('Context size').fill('4096');
	await page.getByLabel('Num batch').fill('512');
	await page.getByLabel('Num GPU').fill('1');
	await page.getByLabel('Main GPU').fill('0');
	await page.getByLabel('Number of threads').fill('8');
	await chooseFromCombobox(page, 'Use MMAP', 'On');

	await promptTextarea.fill('Whatever...');
	await page.getByRole('button', { name: 'Run' }).click();

	// Assert submitting the prompt from Controls switches to the Messages tab
	await expect(page.locator('article', { hasText: 'Whatever...' })).toBeVisible();
	await expect(page.getByText('System prompt')).not.toBeVisible();

	// Assert the options were submitted correctly
	const customizedOptions = {
		num_keep: 5,
		seed: 42,
		num_predict: 100,
		top_k: 50,
		top_p: 0.95,
		min_p: 0.05,
		repeat_last_n: 32,
		temperature: 0.7,
		repeat_penalty: 1.2,
		presence_penalty: 0.5,
		frequency_penalty: 0.5,
		stop: ['AI assistant:'],
		num_ctx: 4096,
		num_batch: 512,
		num_gpu: 1,
		main_gpu: 0,
		num_thread: 8,
		use_mmap: true
	};

	await expect
		.poll(() => requestPayload)
		.toEqual({
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
	await expect
		.poll(() => requestPayload)
		.toEqual({
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
	await expect
		.poll(() => requestPayload)
		.toEqual({
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
	await expect(page.getByLabel('Num keep')).toHaveValue('5');
	await expect(page.getByLabel('Seed')).toHaveValue('42');
	await expect(page.getByLabel('Num predict')).toHaveValue('100');
	await expect(page.getByLabel('Top K')).toHaveValue('50');
	await expect(page.getByLabel('Top P')).toHaveValue('0.95');
	await expect(page.getByLabel('Min P')).toHaveValue('0.05');
	await expect(page.getByLabel('Repeat last N')).toHaveValue('32');
	await expect(page.getByLabel('Temperature')).toHaveValue('0.7');
	await expect(page.getByLabel('Repeat penalty')).toHaveValue('1.2');
	await expect(page.getByLabel('Presence penalty')).toHaveValue('0.5');
	await expect(page.getByLabel('Frequency penalty')).toHaveValue('0.5');
	await expect(page.getByLabel('Stop sequence')).toHaveValue('AI assistant:');
	await expect(page.getByLabel('Context size')).toHaveValue('4096');
	await expect(page.getByLabel('Num batch')).toHaveValue('512');
	await expect(page.getByLabel('Num GPU')).toHaveValue('1');
	await expect(page.getByLabel('Main GPU')).toHaveValue('0');
	await expect(page.getByLabel('Number of threads')).toHaveValue('8');
	await expect(page.getByLabel('Use MMAP')).toHaveValue('On');

	// Check the options were saved to localStorage
	const savedSessions = await page.evaluate(() => window.localStorage.getItem('hollama-sessions'));
	const parsedSessions = JSON.parse(savedSessions || '[]');
	const savedOptions = parsedSessions[0].options;

	// The order isn't guaranteed, so we need to check each option individually
	for (const [key, value] of Object.entries(customizedOptions)) {
		expect(savedOptions).toHaveProperty(key, value);
	}
});

test('placeholders show the model parameters, then Ollama defaults', async ({ page }) => {
	let showRequests = 0;
	await page.route('**/api/show', async (route) => {
		showRequests++;
		await route.fulfill({
			json: {
				parameters:
					'temperature                    0.6\ntop_p                          0.95\nstop                           "<|im_end|>"\nstop                           "<|im_start|>"'
			}
		});
	});

	await openControls(page, 'gemma:7b');

	// Set by the model
	await expect(page.getByLabel('Temperature')).toHaveAttribute('placeholder', '0.6');
	await expect(page.getByLabel('Top P')).toHaveAttribute('placeholder', '0.95');
	await expect(page.getByLabel('Stop sequence')).toHaveAttribute('placeholder', '<|im_end|>');

	// Not set by the model
	await expect(page.getByLabel('Top K')).toHaveAttribute('placeholder', '40');
	await expect(page.getByLabel('Num predict')).toHaveAttribute('placeholder', '-1');
	await expect(page.getByLabel('Repeat penalty')).toHaveAttribute('placeholder', '1.0');
	await expect(page.getByLabel('Context size')).toHaveAttribute('placeholder', 'Auto');

	// Managed by Ollama
	await expect(page.getByLabel('Num keep')).toHaveAttribute('placeholder', 'Auto');
	await expect(page.getByLabel('Num batch')).toHaveAttribute('placeholder', 'Auto');

	expect(showRequests).toBe(1);
});

test('hides the Ollama options for OpenAI models', async ({ page }) => {
	await mockOpenAIModelsResponse(page, MOCK_OPENAI_MODELS);
	await openControls(page, 'gpt-4');

	await expect(page.getByLabel('Knowledge', { exact: true })).toBeVisible();
	await expect(page.getByText('Model options')).not.toBeVisible();
	await expect(page.getByText('Advanced options')).not.toBeVisible();
	await expect(page.getByLabel('Temperature')).not.toBeVisible();
});

test('sends use_mmap only when it is not Auto', async ({ page }) => {
	const requests: { options: Record<string, unknown> }[] = [];
	await page.route('**/api/chat', async (route) => {
		requests.push(route.request().postDataJSON());
		await route.fulfill({ json: MOCK_SESSION_1_RESPONSE_1 });
	});
	const send = async (count: number) => {
		await page.locator('.prompt-editor__textarea').fill('Hello');
		await page.getByRole('button', { name: 'Run' }).click();
		await expect.poll(() => requests.length).toBe(count);
		await page.getByLabel('Controls').click();
	};

	await openControls(page, 'gemma:7b');
	await expect(page.getByLabel('Use MMAP')).toHaveValue('Auto');
	await send(1);
	expect(requests[0].options).toEqual({});

	await chooseFromCombobox(page, 'Use MMAP', 'Off');
	await send(2);
	expect(requests[1].options).toEqual({ use_mmap: false });

	await chooseFromCombobox(page, 'Use MMAP', 'Auto');
	await send(3);
	expect(requests[2].options).toEqual({});
});
