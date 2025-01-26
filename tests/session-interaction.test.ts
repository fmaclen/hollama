import { expect, test, type Dialog, type Locator } from '@playwright/test';

import {
	chooseModel,
	MOCK_API_TAGS_RESPONSE,
	MOCK_SESSION_1_RESPONSE_1,
	MOCK_SESSION_1_RESPONSE_2,
	MOCK_SESSION_1_RESPONSE_3,
	mockCompletionResponse,
	mockOllamaModelsResponse,
	textEditorLocator
} from './utils';

test.describe('Session interaction', () => {
	let promptTextarea: Locator;

	test.beforeEach(async ({ page }) => {
		await mockOllamaModelsResponse(page);
		promptTextarea = page.locator('.prompt-editor__textarea');
	});

	test('sends message and receives response', async ({ page }) => {
		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();

		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await expect(page.getByText('Run')).toBeEnabled();

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.keyboard.press('Shift+Enter');
		await expect(page.getByTestId('session-metadata')).toHaveText('New session');
		await expect(page.getByText('Run')).toBeEnabled();

		// Unselect the model
		await page.getByTitle('Clear').click();
		await expect(page.getByText('Run')).toBeDisabled();

		// Can't run the prompt without a model
		await page.keyboard.press('Enter');
		await expect(
			page.locator('article', {
				hasText:
					'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
			})
		).not.toBeVisible();

		// Re-select the model
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.focus();
		await page.keyboard.press('Enter');
		await expect(
			page.locator('article', {
				hasText:
					'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
			})
		).toBeVisible();
		await expect(page.getByText('Write a prompt to start a new session')).not.toBeVisible();
		await expect(page.getByTestId('session-metadata')).toHaveText(
			new RegExp(MOCK_API_TAGS_RESPONSE.models[0].name)
		);
	});

	test('handles multiple messages in a session', async ({ page }) => {
		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();

		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_2);
		await promptTextarea.fill("I understand, it's okay");
		await page.getByText('Run').click();

		await expect(page.locator('article', { hasText: "I understand, it's okay" })).toBeVisible();
		await expect(
			page.locator('article', {
				hasText:
					'No problem! If you have any other questions or would like to discuss something else, feel free to ask'
			})
		).toBeVisible();
		await expect(page.locator('article nav', { hasText: 'Assistant' })).toHaveCount(2);
		await expect(page.locator('article nav', { hasText: 'You' })).toHaveCount(2);
	});

	test('can copy the raw text of a message or code snippets to clipboard', async ({ page }) => {
		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();
		await expect(
			page.getByText(
				'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
			)
		).toBeVisible();
		await expect(page.locator('.session__history').getByTitle('Copy')).toHaveCount(2);
		expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual('');

		await page.locator('.session__history').getByTitle('Copy').first().click();
		expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual(
			'Who would win in a fight between Emma Watson and Jessica Alba?'
		);

		await page.locator('.session__history').getByTitle('Copy').last().click();
		expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual(
			'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
		);
		await expect(page.locator('pre')).not.toBeVisible();
		await expect(page.locator('code')).not.toBeVisible();

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_3);
		await promptTextarea.fill(
			'Write a Python function to calculate the odds of the winner in a fight between Emma Watson and Jessica Alba'
		);
		await page.getByText('Run').click();
		await expect(page.locator('pre')).toBeVisible();
		await expect(page.locator('code')).toBeVisible();
		await expect(page.locator('.session__history').getByTitle('Copy')).toHaveCount(5);

		await page.locator('pre').hover();
		await page.locator('.session__history').getByTitle('Copy').last().click();
		expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual(
			"def calculate_odds(emma_age, emma_height, emma_weight, emma_experience, jessica_age, jessica_height, jessica_weight, jessica_experience):\n    emma_stats = {'age': emma_age,\n                 'height': emma_height,\n                 'weight': emma_weight,\n                 'experience': emma_experience}\n    jessica_stats = {'age': jessica_age,\n                     'height': jessica_height,\n                     'weight': jessica_weight,\n                     'experience': jessica_experience}\n\n    # Calculate the differences between their stats\n    age_difference = abs(emma_stats['age'] - jessica_stats['age'])\n    height_difference = abs(emma_stats['height'] - jessica_stats['height'])\n    weight_difference = abs(emma_stats['weight'] - jessica_stats['weight'])\n\n    # Return the differences as a tuple\n    return (age_difference, height_difference, weight_difference)\n"
		);
	});

	test('can copy text on an insecure connection', async ({ page }) => {
		// Mock insecure context before navigating
		await page.addInitScript(() => {
			Object.defineProperty(window, 'isSecureContext', { value: false });
		});

		await page.goto('/');
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();
		await expect(page.locator('.session__history').getByTitle('Copy')).toHaveCount(2);

		const toastWarning = page.getByText('Content copied, but your connection is not private');
		await expect(toastWarning).not.toBeVisible();

		await page.locator('.session__history').getByTitle('Copy').first().click();
		await expect(toastWarning).toBeVisible();
	});

	test('can copy the whole session content to clipboard', async ({ page }) => {
		await page.goto('/');
		await page.evaluate(() => navigator.clipboard.writeText(''));
		await page.getByText('Sessions', { exact: true }).click();
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await expect(page.locator('.header').getByTitle('Copy')).toHaveCount(0);

		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();
		await expect(
			page.getByText(
				'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
			)
		).toBeVisible();
		await expect(page.locator('.header').getByTitle('Copy')).toHaveCount(1);
		expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual('');

		await page.locator('.header').getByTitle('Copy').first().click();
		expect(JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))).toHaveLength(2);

		expect(JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))[0]).toEqual({
			content: 'Who would win in a fight between Emma Watson and Jessica Alba?',
			role: 'user'
		});
		expect(JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))[1]).toEqual({
			content:
				'I am unable to provide subjective or speculative information, including fight outcomes between individuals.',
			reasoning: '',
			role: 'assistant'
		});
	});

	test('can start a new session, choose a model and stop a completion in progress', async ({
		page
	}) => {
		const runButton = page.getByText('Run');
		const stopButton = page.getByTitle('Stop completion');
		const userMessage = page.locator('article', { hasText: 'You' });
		const aiMessage = page.locator('article', { hasText: 'Assistant' });
		const sessionMetadata = page.getByTestId('session-metadata');

		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByText('New session', { exact: true }).click();
		await expect(userMessage).not.toBeVisible();
		await expect(aiMessage).not.toBeVisible();
		await expect(sessionMetadata).toHaveText('New session');

		// Mock a response that takes a while to generate
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await page.route('**/chat', () => {});
		await promptTextarea.fill('Hello world!');
		await runButton.click();
		await expect(userMessage).toBeVisible();
		await expect(userMessage).toContainText('Hello world!');
		await expect(aiMessage).toBeVisible();
		await expect(aiMessage).toContainText('...');
		await expect(promptTextarea).toHaveValue('');
		await expect(runButton).toBeDisabled();
		await expect(stopButton).toBeVisible();
		await expect(page.getByText('Write a prompt to start a new session')).not.toBeVisible();
		await expect(sessionMetadata).toHaveText(new RegExp(MOCK_API_TAGS_RESPONSE.models[0].name));

		// Before the completion is stopped, make sure the Run button is disabled
		// even if there is a prompt in the textarea and a model selected
		await promptTextarea.fill('Hello again!');
		await expect(page.locator('.field-combobox-input')).toHaveValue(
			MOCK_API_TAGS_RESPONSE.models[0].name
		);
		await expect(runButton).toBeDisabled();

		await promptTextarea.fill('');
		await stopButton.click();
		await expect(page.getByText('Write a prompt to start a new session')).toBeVisible();
		await expect(userMessage).not.toBeVisible();
		await expect(aiMessage).not.toBeVisible();
		await expect(stopButton).not.toBeVisible();
		await expect(promptTextarea).toHaveValue('Hello world!');
	});

	test('can toggle the prompt editor fullscreen', async ({ page }) => {
		const promptEditor = page.locator('.prompt-editor');
		const promptEditorToggle = page.locator('.prompt-editor__toggle');

		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await expect(textEditorLocator(page, 'Prompt')).not.toBeVisible();
		await expect(promptEditor).not.toHaveClass(/ prompt-editor--fullscreen/);
		await expect(promptTextarea).not.toHaveValue('Nevermind...');
		await expect(promptTextarea).toBeVisible();

		// Switch to fullscreen and enable text-editor
		await promptEditorToggle.click();
		await expect(promptTextarea).not.toBeVisible();
		await expect(promptEditor).toHaveClass(/ prompt-editor--fullscreen/);
		await expect(textEditorLocator(page, 'Prompt')).toBeVisible();
		await expect(textEditorLocator(page, 'Prompt')).toHaveText(
			'Who would win in a fight between Emma Watson and Jessica Alba?'
		);
		await textEditorLocator(page, 'Prompt').fill('Nevermind...');

		// Switch back to normal
		await promptEditorToggle.click();
		await expect(textEditorLocator(page, 'Prompt')).not.toBeVisible();
		await expect(promptEditor).not.toHaveClass(/ prompt-editor--fullscreen/);
		await expect(promptTextarea).toBeVisible();
		await expect(promptTextarea).toHaveValue('Nevermind...');

		// Switch to fullscreen again
		await promptEditorToggle.click();
		await expect(promptEditor).toHaveClass(/ prompt-editor--fullscreen/);
		await expect(promptTextarea).not.toBeVisible();

		// Submit the form and check the prompt is reset
		await page.getByText('Run').click();
		await expect(promptTextarea).toBeVisible();
		await expect(promptEditor).not.toHaveClass(/ prompt-editor--fullscreen/);
	});

	test('can edit the first message and the next get removed', async ({ page }) => {
		const messagesCount = page.locator('.article');
		await page.goto('/');
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);

		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();
		await expect(
			page.getByText(
				'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
			)
		).toBeVisible();
		expect(await messagesCount.count()).toBe(2);

		await promptTextarea.fill(
			'Who would win in a fight between Scarlett Johansson and Jessica Alba?'
		);
		await page.getByText('Run').click();

		expect(
			await page
				.getByText(
					'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
				)
				.count()
		).toBe(2);

		expect(await messagesCount.count()).toBe(4);

		await page.locator('.article', { hasText: 'You' }).first().hover();
		await page.locator('.article', { hasText: 'You' }).first().getByTitle('Edit').click();
		await textEditorLocator(page, 'Prompt').fill('Hello world!');
		await page.getByText('Run').click();

		expect(
			await page
				.getByText(
					'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
				)
				.count()
		).toBe(1);

		await expect(page.getByText('Who would win in a fight between')).not.toBeVisible();

		expect(await messagesCount.count()).toBe(2);
	});

	test('can cancel editing a message sent from user', async ({ page }) => {
		const editButton = page.getByTitle('Edit');
		const cancelButton = page.getByText('Cancel');
		const userMessage = page.locator('article', { hasText: 'You' });

		await page.goto('/');
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();

		await expect(userMessage).toBeVisible();
		await expect(userMessage).toContainText(
			'Who would win in a fight between Emma Watson and Jessica Alba?'
		);
		await expect(
			page.getByText(
				'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
			)
		).toBeVisible();

		await editButton.click();
		await expect(promptTextarea).not.toBeVisible();
		await expect(textEditorLocator(page, 'Prompt')).toHaveText(
			'Who would win in a fight between Emma Watson and Jessica Alba?'
		);
		await expect(cancelButton).toBeVisible();

		await textEditorLocator(page, 'Prompt').fill(
			'Who would win in a fight between Scarlett Johansson and Jessica Alba?'
		);
		await cancelButton.click();
		await expect(userMessage).toBeVisible();
		await expect(userMessage).toContainText(
			'Who would win in a fight between Emma Watson and Jessica Alba?'
		);
		await expect(promptTextarea).toBeVisible();
		await expect(promptTextarea).toHaveValue('');
	});

	test('handles errors when generating completion response and retries', async ({ page }) => {
		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await expect(promptTextarea).not.toHaveValue(
			'Who would win in a fight between Emma Watson and Jessica Alba?'
		);
		await expect(
			page.getByText("Couldn't connect to Ollama. Is the server running?")
		).not.toBeVisible();
		await expect(page.getByText('Sorry, something went wrong.')).not.toBeVisible();
		await expect(page.locator('code', { hasText: 'Ollama says: Not so fast!' })).not.toBeVisible();

		// Mock a net::ERR_CONNECTION_REFUSED
		await page.route('**/chat', async (route) => {
			await route.abort('failed');
		});
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.locator('button', { hasText: 'Run' }).click();
		await expect(page.getByText("Can't connect to Ollama server")).toBeVisible();
		await expect(page.getByText('Ollama says: Not so fast!')).not.toBeVisible();
		await expect(promptTextarea).toHaveValue(
			'Who would win in a fight between Emma Watson and Jessica Alba?'
		);

		// Mock an incomplete JSON response
		await page.route('**/chat', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: '{ incomplete'
			});
		});
		await page.locator('button', { hasText: 'Run' }).click();
		await expect(
			page.getByText(
				"SyntaxError: Expected property name or '}' in JSON at position 2 (line 1 column 3)"
			)
		).toBeVisible();
		await expect(promptTextarea).toHaveValue(
			'Who would win in a fight between Emma Watson and Jessica Alba?'
		);

		// Mock a 500 error response
		await page.route('**/chat', async (route) => {
			await route.fulfill({
				status: 500,
				contentType: 'application/json',
				body: JSON.stringify({ error: 'Ollama says: Not so fast!' })
			});
		});
		await page.locator('button', { hasText: 'Run' }).click();
		await expect(page.getByText('Ollama says: Not so fast!')).toBeVisible();
		await expect(promptTextarea).toHaveValue(
			'Who would win in a fight between Emma Watson and Jessica Alba?'
		);
	});

	test('ai completion can be retried', async ({ page }) => {
		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		expect(await page.getByTitle('Retry').count()).toBe(0);

		await page.getByText('Run').click();
		await expect(
			page.getByText(
				'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
			)
		).toBeVisible();
		expect(await page.getByTitle('Retry').count()).toBe(1);

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_2);
		await page.getByTitle('Retry').click();
		await expect(
			page.getByText(
				'No problem! If you have any other questions or would like to discuss something else, feel free to ask.'
			)
		).toBeVisible();
		await expect(
			page.getByText(
				'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
			)
		).not.toBeVisible();
	});

	test('auto scrolls to the bottom when a new message is received', async ({ page }) => {
		const newSessionButton = page.getByTestId('new-session');
		const articleLocator = page.locator('article');
		const sessionHistory = page.locator('.session__history');

		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await newSessionButton.click();
		await expect(articleLocator).toHaveCount(0);

		const initialScrollHeight = await sessionHistory.evaluate((el) => el.scrollHeight);
		const initialClientHeight = await sessionHistory.evaluate((el) => el.clientHeight);
		const initialScrollTop = await sessionHistory.evaluate((el) => el.scrollTop);

		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_3);
		await page.getByText('Run').click();

		const finalScrollTop = await sessionHistory.evaluate((el) => el.scrollTop);
		const finalScrollHeight = await sessionHistory.evaluate((el) => el.scrollHeight);
		const finalClientHeight = await sessionHistory.evaluate((el) => el.clientHeight);

		expect(finalScrollHeight).toBeGreaterThan(initialScrollHeight);
		expect(finalClientHeight).toBe(initialClientHeight);
		expect(finalScrollTop).toBeGreaterThan(initialScrollTop);

		// TODO: Add assertions for the `userScrolledUp` behavior
	});

	test('handles errors when fetching models', async ({ page }) => {
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await expect(page.getByText('Run')).toBeEnabled();
		await expect(
			page.locator('ol[data-sonner-toaster] li', { hasText: "Can't connect to Ollama server" })
		).not.toBeVisible();

		// Mock a net::ERR_CONNECTION_REFUSED
		await page.route('**/chat', async (route) => {
			await route.abort('failed');
		});
		await page.getByText('Run').click();
		await expect(
			page.locator('ol[data-sonner-toaster] li', { hasText: "Can't connect to Ollama server" })
		).toBeVisible();
	});

	test('can navigate out of session during completion', async ({ page }) => {
		const runButton = page.getByText('Run');

		let dialogHandler: (dialog: Dialog) => Promise<void>;
		page.on('dialog', async (dialog) => await dialogHandler(dialog));

		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);

		// Start a streamed completion
		await page.route('**/chat', () => {});
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await runButton.click();

		// Wait for the completion to start
		await expect(page.getByText('...')).toBeVisible();

		// Set up dialog handler to cancel
		dialogHandler = async (dialog) => {
			expect(dialog.message()).toContain(
				'Are you sure you want to leave?\nThe completion in progress will stop'
			);
			await dialog.dismiss();
		};

		// Attempt to navigate away
		await page.getByText('Settings', { exact: true }).click();
		// Check that we're still on the session page
		await expect(page.getByTestId('session-id')).toBeVisible();
		// Wait for the completion to start
		await expect(page.getByText('...')).toBeVisible();

		// Set up dialog handler to confirm
		dialogHandler = async (dialog) => {
			expect(dialog.message()).toContain(
				'Are you sure you want to leave?\nThe completion in progress will stop'
			);
			await dialog.accept();
		};

		// Attempt to navigate away again
		await page.getByText('Settings', { exact: true }).click();

		// Check that we've navigated to the settings page
		await expect(page.getByText('Automatically check for updates')).toBeVisible();
		expect(page.url()).toContain('/settings');

		// Check that the completion has stopped
		await page.goto('/sessions');
		const sessionsCount = await page.locator('.session__history').count();
		expect(sessionsCount).toBe(0);
	});
});
