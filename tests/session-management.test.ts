import { expect, test, type Locator } from '@playwright/test';

import {
	chooseModel,
	MOCK_API_TAGS_RESPONSE,
	MOCK_SESSION_1_RESPONSE_1,
	MOCK_SESSION_2_RESPONSE_1,
	mockCompletionResponse,
	mockOllamaModelsResponse
} from './utils';

test.describe('Session management', () => {
	let promptTextarea: Locator;

	test.beforeEach(async ({ page }) => {
		await mockOllamaModelsResponse(page);
		promptTextarea = page.locator('.prompt-editor__textarea');
	});

	test('initializes new session correctly', async ({ page }) => {
		const sessionIdLocator = page.getByTestId('session-id');
		const sessionMetadata = page.getByTestId('session-metadata');
		const runButton = page.getByText('Run');
		const newPromptHelp = page.getByText('Write a prompt to start a new session');

		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await expect(sessionIdLocator).not.toBeVisible();
		await expect(sessionMetadata).not.toBeVisible();
		await expect(newPromptHelp).not.toBeVisible();

		await page.getByTestId('new-session').click();
		await expect(sessionIdLocator).toBeVisible();
		await expect(sessionIdLocator).toHaveText(/Session #[a-z0-9]{2,8}/);
		await expect(sessionMetadata).toHaveText('New session');
		await expect(promptTextarea).toHaveText('');
		await expect(runButton).toBeVisible();
		await expect(runButton).toBeDisabled();
		await expect(newPromptHelp).toBeVisible();
	});

	test('generates a random session id', async ({ page }) => {
		await page.goto('/sessions');

		const sessionIds = [];
		const newSessionButton = page.getByTestId('new-session');

		// Check it generates a new session id 3 times in a row
		for (let i = 0; i < 3; i++) {
			const sessionId = await newSessionButton.getAttribute('href');
			expect(sessionId).toMatch(/[a-z0-9]{2,8}/);
			sessionIds.push(sessionId);
			await newSessionButton.click();
		}

		expect(new Set(sessionIds).size).toBe(3);
	});

	test('preserves session state after navigation', async ({ page }) => {
		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();

		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();

		await page.getByTestId('new-session').click();
		await expect(page.locator('article')).toHaveCount(0);

		await page.goBack();
		await expect(page.locator('article')).toHaveCount(2);
	});

	test('can navigate older sessions from sidebar', async ({ page }) => {
		const sessionLink = page.locator('.layout__a', { hasText: 'Sessions' });
		const settingsLink = page.locator('.layout__a', { hasText: 'Settings' });

		await page.goto('/');
		await expect(sessionLink).toHaveClass(/ layout__a--active/);
		await expect(settingsLink).not.toHaveClass(/ layout__a--active/);
		await expect(page.getByText('No sessions')).toBeVisible();
		await expect(
			page.locator('aside', {
				hasText: 'Who would win in a fight between Emma Watson and Jessica Alba?'
			})
		).not.toBeVisible();

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();
		await page
			.getByText(
				'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
			)
			.isVisible();
		await expect(page.getByText('No sessions')).not.toBeVisible();

		// Check the session title and model name are displayed correctly
		const sessionTitle = 'Who would win in a fight between Emma Watson and Jessica Alba?';
		const sessionItem = page.getByTestId('session-item');
		expect(await sessionItem.textContent()).toContain(sessionTitle.slice(0, 56));
		expect(await sessionItem.textContent()).not.toContain(sessionTitle);
		expect(await sessionItem.textContent()).toContain(MOCK_API_TAGS_RESPONSE.models[0].name);
		expect(await page.getByTestId('session-item').count()).toBe(1);

		// Leave the conversation by visiting the sessions index
		await sessionLink.click();
		await expect(
			page.getByText(
				'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
			)
		).not.toBeVisible();
		await expect(page.getByText('Who would win in a fight')).toBeVisible();

		// Navigate back to the conversation
		await page.getByTestId('session-item').click();
		await expect(
			page.getByText(
				'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
			)
		).toBeVisible();

		// Create a new session
		await mockCompletionResponse(page, MOCK_SESSION_2_RESPONSE_1);
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[1].name);
		await promptTextarea.fill('What does the fox say?');
		await page.getByText('Run').click();
		await expect(
			page.getByText(
				'The fox says various things, such as "ring-a-ding-ding," "bada bing-bing" and "higglety-pigglety pop'
			)
		).toBeVisible();
		expect(await page.getByTestId('session-item').count()).toBe(2);

		// Check the sessions are listed in the correct order
		expect(await page.getByTestId('session-item').first().textContent()).toContain(
			'What does the fox say?'
		);
		expect(await page.getByTestId('session-item').first().textContent()).toContain(
			MOCK_API_TAGS_RESPONSE.models[1].name
		);
		expect(await page.getByTestId('session-item').last().textContent()).toContain(
			'Who would win in a fight'
		);
		expect(await page.getByTestId('session-item').last().textContent()).toContain(
			MOCK_API_TAGS_RESPONSE.models[0].name
		);

		// Check the current session is highlighted in the sidebar
		await expect(page.locator('.section-list-item').first()).toHaveClass(
			/ section-list-item--active/
		);
		await expect(page.locator('.section-list-item').last()).not.toHaveClass(
			/ section-list-item--active/
		);

		// Navigate to Settings and back
		await page.getByText('Settings').click();
		await expect(page.getByText('Automatically check for updates')).toBeVisible();

		await page.getByText('Sessions', { exact: true }).click();
		await expect(page.getByRole('link', { name: 'New session' })).toBeVisible();
		await expect(
			page.getByText('Create a new session or choose an existing one from the list')
		).toBeVisible();
		await expect(page.getByTestId('session-item')).toHaveCount(2);

		// Click first session and verify its state
		await page.getByTestId('session-item').first().click();
		await expect(page.getByRole('combobox')).toHaveValue(MOCK_API_TAGS_RESPONSE.models[1].name);
		await expect(page.getByText('The fox says various things')).toBeVisible();
		await expect(
			page.getByText('Create a new session or choose an existing one from the list')
		).not.toBeVisible();
	});

	test('deletes a session from the header and sidebar', async ({ page }) => {
		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await expect(page.getByText('No sessions')).toBeVisible();

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();
		await expect(page.getByText(MOCK_SESSION_1_RESPONSE_1.message.content)).toBeVisible();
		await expect(page.getByText('No sessions')).not.toBeVisible();
		expect(await page.getByTestId('session-item').count()).toBe(1);
		await expect(page.locator('header').getByTitle('Copy')).toBeVisible();
		await expect(page.getByTitle('Dismiss')).not.toBeVisible();

		// Check the navigation changes when session deletion needs confirmation
		await page.locator('header').getByTitle('Delete session').click();
		await expect(page.locator('header').getByTitle('Copy')).not.toBeVisible();
		await expect(page.getByTitle('Confirm deletion')).toBeVisible();

		await page.getByTitle('Dismiss').click();
		await expect(page.locator('header').getByTitle('Copy')).toBeVisible();
		await expect(page.getByTitle('Confirm deletion')).not.toBeVisible();
		await expect(page.getByTitle('Dismiss')).not.toBeVisible();

		// Delete the session from the header
		await page.locator('header').getByTitle('Delete session').click();
		await page.getByTitle('Confirm deletion').click();
		await expect(page.getByText('No sessions')).toBeVisible();
		expect(await page.getByTestId('session-item').count()).toBe(0);

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();
		await expect(page.getByText(MOCK_SESSION_1_RESPONSE_1.message.content)).toBeVisible();
		await expect(page.getByText('No sessions')).not.toBeVisible();
		expect(await page.getByTestId('session-item').count()).toBe(1);

		// Delete the session from the sidebar
		await page.locator('.section-list-item').first().hover();
		await page.locator('.section-list-item').getByTitle('Delete session').click();
		await page.getByTitle('Confirm deletion').click();
		await expect(page.getByText('No sessions')).toBeVisible();
		expect(await page.getByTestId('session-item').count()).toBe(0);
	});

	test('all sessions can be deleted', async ({ page }) => {
		await page.goto('/sessions');
		await expect(page.getByText('No sessions')).toBeVisible();
		await expect(page.getByTestId('session-item')).toHaveCount(0);

		// Stage 2 sessions
		await page.evaluate(
			({ modelA, modelB }) =>
				window.localStorage.setItem(
					'hollama-sessions',
					JSON.stringify([
						{
							id: 'qbhc0q',
							model: modelA,
							messages: [
								{ role: 'user', content: 'Hello world!' },
								{
									role: 'assistant',
									content:
										"Hello world! 👋 🌎\n\nIt's great to hear from you. What would you like to do today?"
								}
							],
							context: [],
							updatedAt: new Date().toISOString()
						},
						{
							id: 'm2jjac',
							model: modelB,
							messages: [
								{ role: 'user', content: 'Hello world, again!' },
								{
									role: 'assistant',
									content:
										"Hello! It's always a pleasure to see you back. How can I assist you today?"
								}
							],
							context: [],
							updatedAt: new Date().toISOString()
						}
					])
				),
			{
				modelA: MOCK_API_TAGS_RESPONSE.models[0].name,
				modelB: MOCK_API_TAGS_RESPONSE.models[1].name
			}
		);

		await page.reload();
		await expect(page.getByText('No sessions')).not.toBeVisible();
		await expect(page.getByTestId('session-item')).toHaveCount(2);

		await page.getByText('Settings').click();
		// Click the delete button
		page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all sessions?'));
		await page.getByText('Delete all sessions').click();
		await page.getByText('Sessions', { exact: true }).click();
		await expect(page.getByText('No sessions')).toBeVisible();
		await expect(page.getByTestId('session-item')).toHaveCount(0);
		expect(await page.evaluate(() => window.localStorage.getItem('hollama-sessions'))).toBe('[]');
	});

	test('truncates session titles correctly', async ({ page }) => {
		const longPrompt =
			'This is a very long prompt that should be truncated in both the page title and the sidebar list item.\nIt contains more than 56 characters to ensure truncation works correctly.';
		const truncatedPrompt = longPrompt.slice(0, 56);

		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);

		// Check initial title
		await expect(page).toHaveTitle('New session • Sessions • Hollama');
		await expect(page.getByTestId('session-item')).not.toBeVisible();

		// Submit prompt and verify truncation
		await promptTextarea.fill(longPrompt);
		await page.getByText('Run').click();

		// Verify page title is truncated
		await expect(page).toHaveTitle(`${truncatedPrompt} • Sessions • Hollama`);

		// Verify sidebar list item is truncated
		await expect(page.getByTestId('session-item')).toBeVisible();
		await expect(page.getByTestId('session-item')).toContainText(truncatedPrompt);
		await expect(page.getByTestId('session-item')).not.toContainText(longPrompt);
	});
});
