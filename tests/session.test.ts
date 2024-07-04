import { expect, test, type Locator } from '@playwright/test';
import { MOCK_SESSION_1_RESPONSE_1, MOCK_SESSION_1_RESPONSE_2, MOCK_SESSION_1_RESPONSE_3, MOCK_SESSION_2_RESPONSE_1, chooseModelFromSettings, mockCompletionResponse, mockTagsResponse } from './mocks';


test.describe('Session', () => {
	let promptTextarea: Locator;

	test.beforeEach(async ({ page }) => {
		await mockTagsResponse(page);
		promptTextarea = page.locator('.field').filter({ hasText: "Prompt" }).getByRole('textbox');
	});

	test('creates new session and chats', async ({ page }) => {
		const sessionIdLocator = page.getByTestId('session-id');
		const modelNameLocator = page.getByTestId('model-name');
		const newSessionButton = page.getByTestId('new-session');
		const sendButton = page.getByText('Send');
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
		await expect(sendButton).toBeVisible();
		await expect(sendButton).toBeDisabled();
		await expect(newPromptHelp).toBeVisible();
	
		await page.getByLabel('Model').selectOption('gemma:7b');
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await expect(sendButton).toBeEnabled();
		await expect(page.locator('article', { hasText: 'I am unable to provide subjective or speculative information, including fight outcomes between individuals.' })).not.toBeVisible();
	
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await sendButton.click();
		await expect(page.locator('article', { hasText: 'I am unable to provide subjective or speculative information, including fight outcomes between individuals.' })).toBeVisible();
		await expect(newPromptHelp).not.toBeVisible();
	
		await promptTextarea.fill("I understand, it's okay");
		await expect(page.locator('article', { hasText: 'No problem! If you have any other questions or would like to discuss something else, feel free to ask' })).not.toBeVisible();
		await expect(page.locator('article', { hasText: "I understand, it's okay" })).not.toBeVisible();
	
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_2);
		await sendButton.click();
		await expect(page.locator('article', { hasText: "I understand, it's okay" })).toBeVisible();
		await expect(page.locator('article', { hasText: 'No problem! If you have any other questions or would like to discuss something else, feel free to ask' })).toBeVisible();
		await expect(page.locator('article nav', { hasText: 'AI' })).toHaveCount(2);
		await expect(page.locator('article nav', { hasText: 'You' })).toHaveCount(2);
	
		// Check the session is saved to localStorage
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
		await page.goto('/');
		await chooseModelFromSettings(page, 'gemma:7b');
		await page.getByText('Sessions', { exact: true }).click();
		await expect(page.getByText('No sessions')).toBeVisible();
		await expect(page.locator('aside', { hasText: 'Who would win in a fight between Emma Watson and Jessica Alba?' })).not.toBeVisible();
	
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Send').click();
		await page.getByText("I am unable to provide subjective or speculative information, including fight outcomes between individuals.").isVisible();
		await expect(page.getByText('No sessions')).not.toBeVisible();
		expect(await page.getByTestId('session-item').textContent()).toContain("Who would win in a fight between Emma Watson and Jessica Alba?");
		expect(await page.getByTestId('session-item').textContent()).toContain("gemma:7b");
		expect(await page.getByTestId('session-item').count()).toBe(1);
	
		// Leave the conversation by visiting the sessions index
		await page.getByText('Sessions').click();
		await expect(page.getByText('Who would win in a fight between Emma Watson and Jessica Alba?')).toBeVisible();
		await expect(page.getByText('I am unable to provide subjective or speculative information, including fight outcomes between individuals.')).not.toBeVisible();
	
		// Navigate back to the conversation
		await page.getByTestId('session-item').click();
		await expect(page.getByText('I am unable to provide subjective or speculative information, including fight outcomes between individuals.')).toBeVisible();
	
		// Create a new session
		await mockCompletionResponse(page, MOCK_SESSION_2_RESPONSE_1);
		await chooseModelFromSettings(page, 'openhermes2.5-mistral:latest');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await promptTextarea.fill('What does the fox say?');
		await page.getByText('Send').click();
		await expect(page.getByText('The fox says various things, such as "ring-a-ding-ding," "bada bing-bing" and "higglety-pigglety pop')).toBeVisible();
		expect(await page.getByTestId('session-item').count()).toBe(2);
	
		// Check the sessions are listed in the correct order
		expect(await page.getByTestId('session-item').first().textContent()).toContain("What does the fox say?");
		expect(await page.getByTestId('session-item').first().textContent()).toContain("openhermes2.5-mistral:latest");
		expect(await page.getByTestId('session-item').last().textContent()).toContain("Who would win in a fight between Emma Watson and Jessica Alba?");
		expect(await page.getByTestId('session-item').last().textContent()).toContain("gemma:7b");
	
		// Check the current session is highlighted in the sidebar
		await expect(page.getByTestId('session-item').first()).not.toHaveClass(/hover:bg-accent/);
		await expect(page.getByTestId('session-item').first()).toHaveClass(/ bg-accent/);
		await expect(page.getByTestId('session-item').last()).not.toHaveClass(/ bg-accent/);
		await expect(page.getByTestId('session-item').last()).toHaveClass(/hover:bg-accent/);
	});
	
	test('deletes a session from the sidebar', async ({ page }) => {
		await page.goto('/');
		await chooseModelFromSettings(page, 'gemma:7b');
		await page.getByText('Sessions', { exact: true }).click();
		await expect(page.getByText('No sessions')).toBeVisible();
	
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Send').click();
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
		await page.evaluate(() => window.localStorage.setItem(
			'hollama-sessions',
			JSON.stringify(
				[
					{
						id: "qbhc0q",
						model: "gemma:7b",
						messages: [
							{ role: "user", content: "Hello world!" },
							{ role: "ai", content: "Hello world! 👋 🌎\n\nIt's great to hear from you. What would you like to do today?" }
						],
						context: [],
					},
					{
						id: "m2jjac",
						model: "openhermes2.5-mistral:latest",
						messages: [
							{ role: "user", content: "Hello world, again!" },
							{ role: "ai", content: "Hello! It's always a pleasure to see you back. How can I assist you today?" }
						],
						context: [],
					}
				]
			)
		));
	
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
		await chooseModelFromSettings(page, 'gemma:7b');
		await page.getByText('Sessions', { exact: true }).click();
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page.getByTestId('new-session').click();
		await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await page.getByText('Send').click();
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
		await page.getByText('Send').click();
		await expect(page.locator("pre")).toBeVisible();
		await expect(page.locator("code")).toBeVisible();
		await expect(page.getByTitle('Copy')).toHaveCount(5);
	
		await page.locator("pre").hover();
		await page.getByTitle('Copy').last().click();
		expect(await page.evaluate(() => navigator.clipboard.readText())).toEqual("def calculate_odds(emma_age, emma_height, emma_weight, emma_experience, jessica_age, jessica_height, jessica_weight, jessica_experience):\n    emma_stats = {'age': emma_age, 'height': emma_height, 'weight': emma_weight, 'experience': emma_experience}\n    jessica_stats = {'age': jessica_age, 'height': jessica_height, 'weight': jessica_weight, 'experience': jessica_experience}\n    \n    # Calculate the differences between their stats\n    age_difference = abs(emma_stats['age'] - jessica_stats['age'])\n    height_difference = abs(emma_stats['height'] - jessica_stats['height'])\n    weight_difference = abs(emma_stats['weight'] - jessica_stats['weight'])\n    \n    # Return the differences as a tuple\n    return (age_difference, height_difference, weight_difference)\n");
	});
	
	test('can start a new session, choose a model and stop a completion in progress', async ({ page }) => {
		const sendButton = page.getByText('Send');
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
		await page.getByLabel('Model').selectOption('gemma:7b');
		await page.route('**/generate', () => { });
		await promptTextarea.fill('Hello world!');
		await sendButton.click();
		await expect(userMessage).toBeVisible();
		await expect(userMessage).toContainText('Hello world!')
		await expect(aiMessage).toBeVisible();
		await expect(aiMessage).toContainText('...');
		await expect(promptTextarea).toHaveText('');
		await expect(sendButton).toBeDisabled();
		await expect(stopButton).toBeVisible();
		await expect(page.getByText("Write a prompt to start a new session")).not.toBeVisible();
		await expect(modelName).toHaveText('gemma:7b');
	
		await stopButton.click();
		await expect(page.getByText("Write a prompt to start a new session")).toBeVisible();
		await expect(promptTextarea).toHaveText('Hello world!');
		await expect(userMessage).not.toBeVisible();
		await expect(aiMessage).not.toBeVisible();
		await expect(stopButton).not.toBeVisible();
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

