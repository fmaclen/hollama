import { expect, test } from '@playwright/test';

import {
	chooseFromCombobox,
	chooseModel,
	MOCK_API_TAGS_RESPONSE,
	MOCK_KNOWLEDGE,
	MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1,
	mockCompletionResponse,
	mockOllamaModelsResponse,
	seedKnowledgeAndReload,
	submitWithKeyboardShortcut,
	textEditorLocator
} from './utils';

test('creates and edits knowledge', async ({ page }) => {
	const timestamp = page.getByTestId('knowledge-metadata');
	const fieldName = page.getByLabel('Name');
	const fieldContent = textEditorLocator(page, 'Content');
	const buttonSave = page.locator('button', { hasText: 'Save' });
	const noKnowledgeMessage = page.getByText('No knowledge');
	const mockedKnowledgeInSidebar = page.locator('.section-list', {
		hasText: MOCK_KNOWLEDGE[0].name
	});

	await page.goto('/');
	await page.getByTestId('sidebar').getByText('Knowledge').click();

	await expect(noKnowledgeMessage).toBeVisible();
	await expect(page.getByText('Create new knowledge or choose one from the list')).toBeVisible();
	await expect(fieldName).not.toBeVisible();
	await expect(fieldContent).not.toBeVisible();
	await expect(buttonSave).not.toBeVisible();
	await expect(timestamp).not.toBeVisible();

	// Create knowledge
	await page.getByText('New knowledge', { exact: true }).click();
	await expect(
		page.getByText('Create new knowledge or choose one from the list')
	).not.toBeVisible();
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
	await expect(
		page.locator('ol[data-sonner-toaster] li', { hasText: 'Knowledge saved' })
	).not.toBeVisible();

	await fieldContent.focus();
	await submitWithKeyboardShortcut(page);
	await expect(mockedKnowledgeInSidebar).toBeVisible();
	await expect(noKnowledgeMessage).not.toBeVisible();
	await expect(
		page.locator('ol[data-sonner-toaster] li', { hasText: 'Knowledge saved' })
	).toBeVisible();

	// Edit knowledge
	await fieldName.fill("Wally's chabot");
	await buttonSave.click();
	await expect(mockedKnowledgeInSidebar).not.toBeVisible();
	await expect(page.locator('.section-list', { hasText: "Wally's chabot" })).toBeVisible();
});

test('can delete knowledge from the header and sidebar', async ({ page }) => {
	await page.goto('/');
	await page.getByTestId('sidebar').getByText('Knowledge').click();

	await expect(page.getByText('Create new knowledge or choose one from the list')).toBeVisible();
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
	await page.locator('.section-list-item').first().hover();
	await expect(page.getByTitle('Delete knowledge')).toBeVisible();
	await expect(page.getByTitle('Edit title')).not.toBeVisible(); // Only sessions have an edit title button

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
		'Create new knowledge or choose one from the list'
	);
	const knowledgeItems = page.getByTestId('knowledge-item');

	await mockOllamaModelsResponse(page);

	await page.goto('/');
	await page.getByTestId('sidebar').getByText('Knowledge').click();

	await expect(noKnowledgeMessage).toBeVisible();
	await expect(noKnowledgeSelectedMessage).toBeVisible();
	await expect(timestamp).not.toBeVisible();

	await seedKnowledgeAndReload(page);
	await expect(noKnowledgeMessage).not.toBeVisible();
	await expect(timestamp).not.toBeVisible();
	await expect(knowledgeItems).toHaveCount(MOCK_KNOWLEDGE.length);

	// Check the knowledge is available in the session
	await page.getByText('Sessions').click();
	await page.getByTestId('new-session').click();
	await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
	await page.getByLabel('Controls').click();
	await page
		.locator('fieldset:has-text("System prompt") input[aria-labelledby="knowledge-label"]')
		.click();
	await expect(page.getByRole('option', { name: MOCK_KNOWLEDGE[0].name })).toBeVisible();
	await expect(page.getByRole('option', { name: MOCK_KNOWLEDGE[1].name })).toBeVisible();

	await page.locator('a', { hasText: 'Knowledge' }).click();
	await page.getByText(MOCK_KNOWLEDGE[0].name).click();
	await expect(noKnowledgeSelectedMessage).not.toBeVisible();
	await expect(timestamp).toBeVisible();

	// Delete the knowledge
	await page.locator('header').getByTitle('Delete knowledge').click();
	await page.getByTitle('Confirm deletion').click();
	await expect(knowledgeItems).toHaveCount(MOCK_KNOWLEDGE.length - 1);
	await expect(noKnowledgeSelectedMessage).toBeVisible();

	// Check is no longer in the session
	await page.getByText('Sessions').click();
	await page.getByTestId('new-session').click();
	await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
	await page.getByLabel('Controls').click();
	await page.getByLabel('Knowledge', { exact: true }).click();
	await expect(page.getByRole('option', { name: MOCK_KNOWLEDGE[0].name })).not.toBeVisible();
	await expect(page.getByRole('option', { name: MOCK_KNOWLEDGE[1].name })).toBeVisible();
});


test('can use knowledge as system prompt in the session', async ({ page }) => {
	const sessionArticle = page.locator('.session__history .article');
	const knowledgeId = page.getByTestId('knowledge-id');

	await mockOllamaModelsResponse(page);
	await page.goto('/');
	await seedKnowledgeAndReload(page);
	await page.getByTestId('sidebar').getByText('Knowledge').click();

	await expect(page.getByTestId('knowledge-item')).toHaveCount(MOCK_KNOWLEDGE.length);

	await mockCompletionResponse(page, MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1);
	await page.getByText('Sessions').click();
	await page.getByTestId('new-session').click();
	await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
	await expect(sessionArticle).not.toBeVisible();

	// Create a new session with knowledge
	await page.getByLabel('Controls').click();
	await chooseFromCombobox(page, 'Knowledge', MOCK_KNOWLEDGE[0].name);
	await page.locator('.prompt-editor__textarea').fill('What is this about?');

	// Check the request includes the knowledge as a system prompt when submitting the form
	let requestPostData: string | null = null;
	page.on('request', (request) => {
		if (request.url().includes('/api/chat')) requestPostData = request.postData();
	});

	await page.locator('button', { hasText: 'Run' }).click();
	const DEFAULT_OLLAMA_OPTIONS = {
		penalize_newline: false,
		numa: false,
		low_vram: false,
		f16_kv: false,
		vocab_only: false,
		use_mmap: false,
		use_mlock: false
	};
	expect(requestPostData).toContain(
		JSON.stringify({
			model: MOCK_API_TAGS_RESPONSE.models[0].name,
			options: DEFAULT_OLLAMA_OPTIONS,
			messages: [
				{ role: 'system', content: MOCK_KNOWLEDGE[0].content, knowledge: MOCK_KNOWLEDGE[0] },
				{ role: 'user', content: 'What is this about?' }
			]
		})
	);
	expect(await sessionArticle.count()).toBe(2);
	expect(await sessionArticle.first().textContent()).toContain('What is this about?');
	expect(await sessionArticle.last().textContent()).toContain(
		MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1.message.content
	);
	await expect(knowledgeId).not.toBeVisible();

	// Retrying the ai completion should include the system prompt
	await mockCompletionResponse(page, MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1);
	await page.getByTitle('Retry').click();
	expect(requestPostData).toContain(
		JSON.stringify({
			model: MOCK_API_TAGS_RESPONSE.models[0].name,
			options: DEFAULT_OLLAMA_OPTIONS,
			messages: [
				{ role: 'system', content: MOCK_KNOWLEDGE[0].content, knowledge: MOCK_KNOWLEDGE[0] },
				{ role: 'user', content: 'What is this about?' }
			]
		})
	);
	expect(await sessionArticle.count()).toBe(2);
	expect(await sessionArticle.first().textContent()).toContain('What is this about?');
	expect(await sessionArticle.last().textContent()).toContain(
		MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1.message.content
	);

	// Check subsequent requests don't include the knowledge as a system prompt
	page.on('request', (request) => {
		if (request.url().includes('/api/chat')) requestPostData = request.postData();
	});

	await page.locator('.prompt-editor__textarea').fill('Gotcha, thanks for the clarification');
	await page.getByText('Run').click();
	expect(requestPostData).toContain(
		JSON.stringify({
			model: MOCK_API_TAGS_RESPONSE.models[0].name,
			options: DEFAULT_OLLAMA_OPTIONS,
			messages: [
				{ role: 'system', content: MOCK_KNOWLEDGE[0].content, knowledge: MOCK_KNOWLEDGE[0] },
				{ role: 'user', content: 'What is this about?' },
				{
					role: 'assistant',
					content: MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1.message.content,
					reasoning: ''
				},
				{ role: 'user', content: 'Gotcha, thanks for the clarification' }
			]
		})
	);
	expect(await sessionArticle.count()).toBe(4);
});

test('can use shortcut to create knowledge from session', async ({ page }) => {
	const sessionId = page.getByTestId('session-id');
	const knowledgeId = page.getByTestId('knowledge-id');

	await mockOllamaModelsResponse(page);

	await page.goto('/sessions');
	await page.getByTestId('new-session').click();
	await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
	await page.getByLabel('Controls').click();
	const knowledgeCombobox = page.locator(
		'fieldset:has-text("System prompt") input[aria-labelledby="knowledge-label"]'
	);
	await expect(knowledgeCombobox).toBeDisabled();
	await expect(knowledgeCombobox).toHaveAttribute('placeholder', 'No knowledge');
	await expect(sessionId).toBeVisible();
	await expect(knowledgeId).not.toBeVisible();

	await page.getByLabel('New knowledge', { exact: true }).click();
	await expect(sessionId).not.toBeVisible();
	await expect(knowledgeId).toBeVisible();
});
