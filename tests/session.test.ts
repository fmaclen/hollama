import { expect, test, type Locator } from '@playwright/test';
import { MOCK_API_TAGS_RESPONSE, MOCK_SESSION_1_RESPONSE_1, MOCK_SESSION_1_RESPONSE_2, MOCK_SESSION_1_RESPONSE_3, MOCK_SESSION_2_RESPONSE_1, chooseModelFromSettings, mockCompletionResponse, mockTagsResponse, textEditorLocator, submitWithKeyboardShortcut } from './utils';


test.describe('Session', () => {
	let promptTextarea: Locator;

	test.beforeEach(async ({ page }) => {
		await mockTagsResponse(page);
		promptTextarea = page.locator('.prompt-editor__textarea');
	});

	test('creates new session and chats', async ({ page }) => {
		const sessionIdLocator = page.getByTestId('session-id');
		const modelNameLocator = page.getByTestId('model-name');
		const newSessionButton = page.getByTestId('new-session');
		const runButton = page.getByText('Run');
		const articleLocator = page.locator('article');
		const newPromptHelp = page.getByText('Write a prompt to start a new session');

		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await expect(sessionIdLocator).not.toBeVisible();
		await expect(modelNameLocator).not.toBeVisible();
		await expect(newPromptHelp).not.toBeVisible();

		await newSessionButton.click();
		await expect(sessionIdLocator).toBeVisible();
		await expect(sessionIdLocator).toHaveText(/Session #[a-z0-9]{2,8}/);
		await expect(modelNameLocator).toHaveText('New session');
		await expect(promptTextarea).toHaveText('');
		await expect(runButton).toBeVisible();
		await expect(runButton).toBeDisabled();
		await expect(newPromptHelp).toBeVisible();

		await page.getByLabel('Model').selectOption(MOCK_API_TAGS_RESPONSE.models[0].name);
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await expect(runButton).toBeEnabled();
		await expect(page.locator('article', { hasText: 'I am unable to provide subjective or speculative information, including fight outcomes between individuals.' })).not.toBeVisible();

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.keyboard.press('Enter');
		await expect(page.locator('article', { hasText: 'I am unable to provide subjective or speculative information, including fight outcomes between individuals.' })).toBeVisible();
		await expect(newPromptHelp).not.toBeVisible();

		await expect(page.locator('article', { hasText: 'No problem! If you have any other questions or would like to discuss something else, feel free to ask' })).not.toBeVisible();
		await expect(page.locator('article', { hasText: "I understand, it's okay" })).not.toBeVisible();

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_2);
		await expect(textEditorLocator(page, 'Prompt')).not.toBeVisible();

		await page.locator('.prompt-editor__toggle').click();
		await expect(promptTextarea).not.toBeVisible();
		await expect(textEditorLocator(page, 'Prompt')).toBeVisible();
		
		// Submit the form in fullscreen prompt editor with keyboard shortcut (Cmd/Ctrl + Enter)
		await textEditorLocator(page, 'Prompt').fill("I understand, it's okay");
		await submitWithKeyboardShortcut(page);
		await expect(page.locator('article', { hasText: "I understand, it's okay" })).toBeVisible();
		await expect(page.locator('article', { hasText: 'No problem! If you have any other questions or would like to discuss something else, feel free to ask' })).toBeVisible();
		await expect(page.locator('article nav', { hasText: 'AI' })).toHaveCount(2);
		await expect(page.locator('article nav', { hasText: 'You' })).toHaveCount(2);

		// Check the session is saved to localStorage
		await expect(page.getByText('No sessions')).not.toBeVisible();

		await newSessionButton.click();
		await expect(articleLocator).toHaveCount(0);

		await page.goBack();
		await expect(articleLocator).toHaveCount(4);
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

	test('can navigate older sessions from sidebar', async ({ page }) => {
		const sessionLink = page.locator('.layout__a', { hasText: 'Sessions' });
		const settingsLink = page.locator('.layout__a', { hasText: 'Settings' });

		await page.goto('/');
		await expect(settingsLink).toHaveClass(/ layout__a--active/);
		await expect(sessionLink).not.toHaveClass(/ layout__a--active/);

		await chooseModelFromSettings(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await sessionLink.click(); await expect(page.getByText('No sessions')).toBeVisible();
		await expect(settingsLink).not.toHaveClass(/ layout__a--active/);
		await expect(sessionLink).toHaveClass(/ layout__a--active/);
		await expect(page.locator('aside', { hasText: 'Who would win in a fight between Emma Watson and Jessica Alba?' })).not.toBeVisible();

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();
		await page.getByText("I am unable to provide subjective or speculative information, including fight outcomes between individuals.").isVisible();
		await expect(page.getByText('No sessions')).not.toBeVisible();
		expect(await page.getByTestId('session-item').textContent()).toContain("Who would win in a fight between Emma Watson and Jessica Alba?");
		expect(await page.getByTestId('session-item').textContent()).toContain(MOCK_API_TAGS_RESPONSE.models[0].name);
		expect(await page.getByTestId('session-item').count()).toBe(1);

		// Leave the conversation by visiting the sessions index
		await sessionLink.click();
		await expect(page.getByText('Who would win in a fight between Emma Watson and Jessica Alba?')).toBeVisible();
		await expect(page.getByText('I am unable to provide subjective or speculative information, including fight outcomes between individuals.')).not.toBeVisible();

		// Navigate back to the conversation
		await page.getByTestId('session-item').click();
		await expect(page.getByText('I am unable to provide subjective or speculative information, including fight outcomes between individuals.')).toBeVisible();

		// Create a new session
		await mockCompletionResponse(page, MOCK_SESSION_2_RESPONSE_1);
		await chooseModelFromSettings(page, MOCK_API_TAGS_RESPONSE.models[1].name);
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await promptTextarea.fill('What does the fox say?');
		await page.getByText('Run').click();
		await expect(page.getByText('The fox says various things, such as "ring-a-ding-ding," "bada bing-bing" and "higglety-pigglety pop')).toBeVisible();
		expect(await page.getByTestId('session-item').count()).toBe(2);

		// Check the sessions are listed in the correct order
		expect(await page.getByTestId('session-item').first().textContent()).toContain("What does the fox say?");
		expect(await page.getByTestId('session-item').first().textContent()).toContain("openhermes2.5-mistral:latest");
		expect(await page.getByTestId('session-item').last().textContent()).toContain("Who would win in a fight between Emma Watson and Jessica Alba?");
		expect(await page.getByTestId('session-item').last().textContent()).toContain(MOCK_API_TAGS_RESPONSE.models[0].name);

		// Check the current session is highlighted in the sidebar
		await expect(page.getByTestId('session-item').first()).toHaveClass(/ section-list-item--active/);
		await expect(page.getByTestId('session-item').last()).not.toHaveClass(/ section-list-item--active/);
	});

	test('deletes a session from the sidebar', async ({ page }) => {
		await page.goto('/');
		await chooseModelFromSettings(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await page.getByText('Sessions', { exact: true }).click();
		await expect(page.getByText('No sessions')).toBeVisible();

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();
		await expect(page.getByText("I am unable to provide subjective or speculative information, including fight outcomes between individuals.")).toBeVisible();
		await expect(page.getByText('No sessions')).not.toBeVisible();
		expect(await page.getByTestId('session-item').count()).toBe(1);

		page.on('dialog', dialog => dialog.accept("Are you sure you want to delete this session?"));
		await page.getByTitle('Delete session').click();
		await expect(page.getByText('No sessions')).toBeVisible();
		expect(await page.getByTestId('session-item').count()).toBe(0);
	});

	test('all sessions can be deleted', async ({ page }) => {
		await page.goto('/sessions');
		await expect(page.getByText('No sessions')).toBeVisible();
		await expect(page.getByTestId('session-item')).toHaveCount(0);

		// Stage 2 sessions
		await page.evaluate(({ modelA, modelB }) => window.localStorage.setItem(
			'hollama-sessions',
			JSON.stringify(
				[
					{
						id: "qbhc0q",
						model: modelA,
						messages: [
							{ role: "user", content: "Hello world!" },
							{ role: "ai", content: "Hello world! 👋 🌎\n\nIt's great to hear from you. What would you like to do today?" }
						],
						context: [],
					},
					{
						id: "m2jjac",
						model: modelB,
						messages: [
							{ role: "user", content: "Hello world, again!" },
							{ role: "ai", content: "Hello! It's always a pleasure to see you back. How can I assist you today?" }
						],
						context: [],
					}
				]
			)
		), { modelA: MOCK_API_TAGS_RESPONSE.models[0].name, modelB: MOCK_API_TAGS_RESPONSE.models[1].name });

		await page.reload();
		await expect(page.getByText('No sessions')).not.toBeVisible();
		await expect(page.getByTestId('session-item')).toHaveCount(2);

		await page.getByText('Settings').click();
		// Click the delete button
		page.on('dialog', dialog => dialog.accept("Are you sure you want to delete all sessions?"));
		await page.getByText('Delete all sessions').click();
		await page.getByText('Sessions', { exact: true }).click();
		await expect(page.getByText('No sessions')).toBeVisible();
		await expect(page.getByTestId('session-item')).toHaveCount(0);
		expect(await page.evaluate(() => window.localStorage.getItem('hollama-sessions'))).toBe('null');
	});

	test('can copy the raw text of a message or code snippets to clipboard', async ({ page }) => {
		await page.goto('/');
		await chooseModelFromSettings(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await page.getByText('Sessions', { exact: true }).click();
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Run').click();
		await expect(page.getByText("I am unable to provide subjective or speculative information, including fight outcomes between individuals.")).toBeVisible();
		await expect(page.getByTitle('Copy')).toHaveCount(2);
		expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual("");

		await page.getByTitle('Copy').first().click();
		expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual("Who would win in a fight between Emma Watson and Jessica Alba?");

		await page.getByTitle('Copy').last().click();
		expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual("I am unable to provide subjective or speculative information, including fight outcomes between individuals.");
		await expect(page.locator("pre")).not.toBeVisible();
		await expect(page.locator("code")).not.toBeVisible();

		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_3);
		await promptTextarea.fill("Write a Python function to calculate the odds of the winner in a fight between Emma Watson and Jessica Alba");
		await page.getByText('Run').click();
		await expect(page.locator("pre")).toBeVisible();
		await expect(page.locator("code")).toBeVisible();
		await expect(page.getByTitle('Copy')).toHaveCount(5);

		await page.locator("pre").hover();
		await page.getByTitle('Copy').last().click();
		expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual("def calculate_odds(emma_age, emma_height, emma_weight, emma_experience, jessica_age, jessica_height, jessica_weight, jessica_experience):\n    emma_stats = {'age': emma_age, 'height': emma_height, 'weight': emma_weight, 'experience': emma_experience}\n    jessica_stats = {'age': jessica_age, 'height': jessica_height, 'weight': jessica_weight, 'experience': jessica_experience}\n    \n    # Calculate the differences between their stats\n    age_difference = abs(emma_stats['age'] - jessica_stats['age'])\n    height_difference = abs(emma_stats['height'] - jessica_stats['height'])\n    weight_difference = abs(emma_stats['weight'] - jessica_stats['weight'])\n    \n    # Return the differences as a tuple\n    return (age_difference, height_difference, weight_difference)\n");
	});

	test('can start a new session, choose a model and stop a completion in progress', async ({ page }) => {
		const sendButton = page.getByText('Run');
		const stopButton = page.getByTitle('Stop response');
		const userMessage = page.locator('article', { hasText: "You" })
		const aiMessage = page.locator('article', { hasText: "AI" })
		const modelName = page.getByTestId('model-name');

		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByText("New session", { exact: true }).click();
		await expect(userMessage).not.toBeVisible();
		await expect(aiMessage).not.toBeVisible();
		await expect(modelName).toHaveText('New session');

		// Mock a response that takes a while to generate
		await page.getByLabel('Model').selectOption(MOCK_API_TAGS_RESPONSE.models[0].name);
		await page.route('**/generate', () => { });
		await promptTextarea.fill('Hello world!');
		await sendButton.click();
		await expect(userMessage).toBeVisible();
		await expect(userMessage).toContainText('Hello world!')
		await expect(aiMessage).toBeVisible();
		await expect(aiMessage).toContainText('...');
		await expect(promptTextarea).toHaveValue('');
		await expect(sendButton).toBeDisabled();
		await expect(stopButton).toBeVisible();
		await expect(page.getByText("Write a prompt to start a new session")).not.toBeVisible();
		await expect(modelName).toHaveText(MOCK_API_TAGS_RESPONSE.models[0].name);

		await stopButton.click();
		await expect(page.getByText("Write a prompt to start a new session")).toBeVisible();
		await expect(userMessage).not.toBeVisible();
		await expect(aiMessage).not.toBeVisible();
		await expect(stopButton).not.toBeVisible();
		await expect(promptTextarea).toHaveValue('Hello world!');
	});

	test('can toggle the prompt editor fullscreen', async ({ page }) => {
		const promptEditor = page.locator('.prompt-editor');
		const promptEditorToggle = page.locator('.prompt-editor__toggle');

		await page.goto('/');
		await chooseModelFromSettings(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await page.getByText('Sessions', { exact: true }).click();
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
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
		await expect(textEditorLocator(page, 'Prompt')).toHaveText('Who would win in a fight between Emma Watson and Jessica Alba?');
		await textEditorLocator(page, 'Prompt').fill('Nevermind...');

		// Switch back to normal
		await promptEditorToggle.click();
		await expect(textEditorLocator(page, 'Prompt')).not.toBeVisible();
		await expect(promptEditor).not.toHaveClass(/ prompt-editor--fullscreen/);
		await expect(promptTextarea).toBeVisible();
		await expect(promptTextarea).toHaveValue('Nevermind...');
	});

	test.skip('handles API error when generating AI response', async ({ page }) => {
		// TODO: Implement the test
	});

	test.skip('displays system message when an error occurs', async ({ page }) => {
		// TODO: Implement the test
	});

	test.skip('auto-scrolls to the bottom when new messages are added', async ({ page }) => {
		// TODO: Implement the test
	});
});

