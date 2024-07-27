import { expect, test } from '@playwright/test';
import {
	MOCK_API_TAGS_RESPONSE,
	MOCK_KNOWLEDGE,
	MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1,
	chooseModelFromSettings,
	mockCompletionResponse,
	mockTagsResponse,
	seedKnowledgeAndReload,
	submitWithKeyboardShortcut,
	textEditorLocator
} from './utils';

test('creates and edits knowledge', async ({ page }) => {
	const timestamp = page.getByTestId('knowledge-metadata');
	const fieldName = page.getByLabel('Name');
	const fieldContent = textEditorLocator(page, 'Content');
	const buttonSave = page.getByText('Save');
	const noKnowledgeMessage = page.getByText('No knowledge');
	const mockedKnowledgeInSidebar = page.locator('.section-list', {
		hasText: MOCK_KNOWLEDGE[0].name
	});

	await page.goto('/');
	await page.getByText('Knowledge', { exact: true }).click();
	await expect(noKnowledgeMessage).toBeVisible();
	await expect(page.getByText('Create new knowlege or choose one from the list')).toBeVisible();
	await expect(fieldName).not.toBeVisible();
	await expect(fieldContent).not.toBeVisible();
	await expect(buttonSave).not.toBeVisible();
	await expect(timestamp).not.toBeVisible();

	// Create knowledge
	await page.getByText('New knowledge').click();
	await expect(page.getByText('Create new knowlege or choose one from the list')).not.toBeVisible();
	await expect(timestamp).toHaveText('New knowledge');
	await expect(fieldName).toBeVisible();
	await expect(fieldContent).toBeVisible();
	await expect(buttonSave).toBeDisabled();

	// Check the form can't be submitted without a name
	// `Mod+Enter` is the shortcut to submit the form and is bounded to the `fieldContent`
	await fieldContent.focus();
	await submitWithKeyboardShortcut(page);
	await expect(mockedKnowledgeInSidebar).not.toBeVisible();

	await fieldName.fill(MOCK_KNOWLEDGE[0].name);
	await expect(buttonSave).toBeDisabled();

	// Check the form can't be submitted without content
	await submitWithKeyboardShortcut(page);
	await expect(mockedKnowledgeInSidebar).not.toBeVisible();

	await fieldContent.fill(MOCK_KNOWLEDGE[0].content);
	await expect(buttonSave).not.toBeDisabled();
	await expect(noKnowledgeMessage).toBeVisible();
	await expect(mockedKnowledgeInSidebar).not.toBeVisible();

	await fieldContent.focus();
	await submitWithKeyboardShortcut(page);
	await expect(mockedKnowledgeInSidebar).toBeVisible();
	await expect(noKnowledgeMessage).not.toBeVisible();

	// Edit knowledge
	await fieldName.fill("Wally's chabot");
	await buttonSave.click();
	await expect(mockedKnowledgeInSidebar).not.toBeVisible();
	await expect(page.locator('.section-list', { hasText: "Wally's chabot" })).toBeVisible();
});

test('can delete knowledge from the header and sidebar', async ({ page }) => {
	await page.goto('/');
	await page.getByText('Knowledge', { exact: true }).click();
	expect(await page.getByTestId('knowledge-item').count()).toBe(0);

	await seedKnowledgeAndReload(page);
	await expect(page.locator('header').getByTitle('Delete knowledge')).not.toBeVisible();
	expect(await page.getByTestId('knowledge-item').count()).toBe(2);

	// Delete the knowledge from the header
	await page.locator('.section-list-item__a').first().click();
	await page.locator('header').getByTitle('Delete knowledge').click();
	await page.getByTitle('Confirm deletion').click();
	expect(await page.getByTestId('knowledge-item').count()).toBe(1);
	await expect(page.locator('header').getByTitle('Delete knowledge')).not.toBeVisible();

	// Delete the knowledge from the sidebar
	await page.locator('.section-list-item').first().getByTitle('Delete knowledge').click();
	await page.getByTitle('Confirm deletion').click();
	await expect(page.getByText('No knowledge')).toBeVisible();
	expect(await page.getByTestId('knowledge-item').count()).toBe(0);
});

test('knowledge cannot be used as a system prompt in a session after deletion', async ({
	page
}) => {
	const timestamp = page.getByTestId('knowledge-metadata');
	const noKnowledgeMessage = page.getByText('No knowledge');
	const noKnowledgeSelectedMessage = page.getByText(
		'Create new knowlege or choose one from the list'
	);
	const knowledgeItems = page.getByTestId('knowledge-item');
	const systemPromptSelect = page.getByLabel('System prompt');

	await page.goto('/');
	await page.getByText('Knowledge', { exact: true }).click();
	await expect(noKnowledgeMessage).toBeVisible();
	await expect(noKnowledgeSelectedMessage).toBeVisible();
	await expect(timestamp).not.toBeVisible();

	await seedKnowledgeAndReload(page);
	await expect(noKnowledgeMessage).not.toBeVisible();
	await expect(timestamp).not.toBeVisible();
	await expect(knowledgeItems).toHaveCount(MOCK_KNOWLEDGE.length);

	// Check the knowlege is available in the session
	await page.getByText('Sessions').click();
	await page.getByTestId('new-session').click();
	await expect(systemPromptSelect).toContainText(MOCK_KNOWLEDGE[0].name);
	await expect(systemPromptSelect).toContainText(MOCK_KNOWLEDGE[1].name);

	await page.locator('a', { hasText: 'Knowledge' }).click();
	await page.getByText(MOCK_KNOWLEDGE[0].name).click();
	await expect(noKnowledgeSelectedMessage).not.toBeVisible();
	await expect(timestamp).toBeVisible();

	// Delete the knowlege
	await page.locator('header').getByTitle('Delete knowledge').click();
	await page.getByTitle('Confirm deletion').click();
	await expect(knowledgeItems).toHaveCount(MOCK_KNOWLEDGE.length - 1);
	await expect(noKnowledgeSelectedMessage).toBeVisible();

	// Check is no longer in the session
	await page.getByText('Sessions').click();
	await page.getByTestId('new-session').click();
	await expect(systemPromptSelect).not.toContainText(MOCK_KNOWLEDGE[0].name);
	await expect(systemPromptSelect).toContainText(MOCK_KNOWLEDGE[1].name);
});

test('all knowledge can be deleted', async ({ page }) => {
	await page.goto('/knowledge');
	await expect(page.getByText('No knowledge')).toBeVisible();
	await expect(page.getByTestId('knowledge-item')).toHaveCount(0);

	// Stage 2 knowledge
	await page.evaluate(
		({ mockKnowledge }) =>
			window.localStorage.setItem('hollama-knowledge', JSON.stringify(mockKnowledge)),
		{ mockKnowledge: MOCK_KNOWLEDGE }
	);

	await page.reload();
	await expect(page.getByText('No knowledge')).not.toBeVisible();
	await expect(page.getByTestId('knowledge-item')).toHaveCount(2);

	await page.getByText('Settings').click();
	// Click the delete button
	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all knowledge?'));
	await page.getByText('Delete all knowledge').click();
	await page.getByText('Knowledge', { exact: true }).click();
	await expect(page.getByText('No knowledge')).toBeVisible();
	await expect(page.getByTestId('knowledge-item')).toHaveCount(0);
	expect(await page.evaluate(() => window.localStorage.getItem('hollama-knowledge'))).toBe('null');
});

test('can use knowledge as system prompt in the session', async ({ page }) => {
	const sessionArticle = page.locator('.session__articles .article');
	const knowledgeId = page.getByTestId('knowledge-id');

	await mockTagsResponse(page);
	await page.goto('/');
	await chooseModelFromSettings(page, MOCK_API_TAGS_RESPONSE.models[0].name);
	await seedKnowledgeAndReload(page);
	await page.getByText('Knowledge', { exact: true }).click();
	await expect(page.getByTestId('knowledge-item')).toHaveCount(MOCK_KNOWLEDGE.length);

	await mockCompletionResponse(page, MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1);
	await page.getByText('Sessions').click();
	await page.getByTestId('new-session').click();
	await expect(sessionArticle).not.toBeVisible();

	// Create a new session with knowledge
	await page.getByLabel('System prompt').selectOption(MOCK_KNOWLEDGE[0].name);
	await page.locator('.prompt-editor__textarea').fill('What is this about?');

	// Check the request includes the knowledge as a system prompt when submitting the form
	let requestPostData: string | null = null;
	page.on('request', (request) => {
		if (request.url().includes('/api/generate')) requestPostData = request.postData();
	});

	await page.getByText('Run').click();
	expect(requestPostData).toContain(
		JSON.stringify({
			model: MOCK_API_TAGS_RESPONSE.models[0].name,
			prompt: 'What is this about?',
			system: MOCK_KNOWLEDGE[0].content
		})
	);
	expect(await sessionArticle.count()).toBe(3);
	expect(await sessionArticle.first().textContent()).toContain(MOCK_KNOWLEDGE[0].name);
	expect(await sessionArticle.nth(1).textContent()).toContain('What is this about?');
	expect(await sessionArticle.last().textContent()).toContain(
		MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1.response
	);
	await expect(knowledgeId).not.toBeVisible();

	// Retrying the ai completion should include the system prompt
	await mockCompletionResponse(page, MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1);
	await page.getByTitle('Retry').click();
	expect(requestPostData).toContain(
		JSON.stringify({
			model: MOCK_API_TAGS_RESPONSE.models[0].name,
			prompt: 'What is this about?',
			system: MOCK_KNOWLEDGE[0].content
		})
	);
	expect(await sessionArticle.count()).toBe(3);
	expect(await sessionArticle.first().textContent()).toContain(MOCK_KNOWLEDGE[0].name);
	expect(await sessionArticle.nth(1).textContent()).toContain('What is this about?');
	expect(await sessionArticle.last().textContent()).toContain(
		MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1.response
	);

	// Check subsequent requests don't include the knowledge as a system prompt
	page.on('request', (request) => {
		if (request.url().includes('/api/generate')) requestPostData = request.postData();
	});

	await page.locator('.prompt-editor__textarea').fill('Gotcha, thanks for the clarification');
	await page.getByText('Run').click();
	expect(requestPostData).toContain(
		JSON.stringify({
			model: MOCK_API_TAGS_RESPONSE.models[0].name,
			context: [123, 4567, 890],
			prompt: 'Gotcha, thanks for the clarification'
		})
	);
	expect(await sessionArticle.count()).toBe(5);

	// Can click on the knowledge to see it in the knowledge view
	await page.getByLabel('Go to knowledge').click();
	await expect(knowledgeId).toBeVisible();
	await expect(page.getByLabel('Name')).toHaveValue(MOCK_KNOWLEDGE[0].name);
	await expect(page.getByText('What is this about?')).not.toBeVisible();
});

test('can use shortcut to create knowlege from session', async ({ page }) => {
	const sessionId = page.getByTestId('session-id');
	const knowledgeId = page.getByTestId('knowledge-id');

	await page.goto('/sessions');
	await page.getByTestId('new-session').click();
	await expect(page.getByLabel('System prompt')).toBeDisabled(); // Disabled when there is no knowledge
	await expect(sessionId).toBeVisible();
	await expect(knowledgeId).not.toBeVisible();

	await page.getByLabel('New knowledge').click();
	await expect(sessionId).not.toBeVisible();
	await expect(knowledgeId).toBeVisible();
});
