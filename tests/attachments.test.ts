import path from 'path';
import { fileURLToPath } from 'url';
import { expect, test, type Locator } from '@playwright/test';

import {
	chooseFromCombobox,
	chooseModel,
	MOCK_API_TAGS_RESPONSE,
	MOCK_KNOWLEDGE,
	mockCompletionResponse,
	mockOllamaModelsResponse,
	seedKnowledgeAndReload
} from './utils';

const MOCK_ATTACHMENTS_RESPONSE = {
	model: MOCK_API_TAGS_RESPONSE.models[0].name,
	created_at: new Date('2024-04-11T12:50:18.826017Z'),
	message: {
		role: 'assistant',
		content:
			'I understand you provided context about both the Slack transcript and the directory structure.'
	},
	done: true,
	done_reason: 'stop',
	total_duration: 564546083,
	load_duration: 419166,
	prompt_eval_count: 18,
	prompt_eval_duration: 267210000,
	eval_count: 17,
	eval_duration: 296374000
};

test.describe('Attachments', () => {
	let knowledgeAttachmentButton: Locator;
	let knowledgeAttachments: Locator;

	test.beforeEach(async ({ page }) => {
		await mockOllamaModelsResponse(page);
		await page.goto('/');
		await seedKnowledgeAndReload(page);
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		knowledgeAttachmentButton = page.getByTestId('knowledge-attachment');
		await expect(knowledgeAttachmentButton).toBeVisible();
		knowledgeAttachments = page
			.locator('.attachment')
			.filter({ has: page.locator('.field-combobox-input') });
	});

	test('can add and remove knowledge attachments', async ({ page }) => {
		// Add first knowledge attachment
		await knowledgeAttachmentButton.click();
		await chooseFromCombobox(page, 'Knowledge', MOCK_KNOWLEDGE[0].name, true);

		// Add second knowledge attachment
		await knowledgeAttachmentButton.click();
		await chooseFromCombobox(page, 'Knowledge', MOCK_KNOWLEDGE[1].name, true);

		// Verify attachments are visible and contain correct names
		await expect(knowledgeAttachments).toHaveCount(2);
		await expect(knowledgeAttachments.first().locator('.field-combobox-input')).toHaveValue(
			MOCK_KNOWLEDGE[0].name
		);
		await expect(knowledgeAttachments.last().locator('.field-combobox-input')).toHaveValue(
			MOCK_KNOWLEDGE[1].name
		);

		// Remove first attachment using Trash button
		await knowledgeAttachments.first().getByTestId('attachment-delete').click();
		await expect(knowledgeAttachments).toHaveCount(1);
		await expect(knowledgeAttachments.first().locator('.field-combobox-input')).toHaveValue(
			MOCK_KNOWLEDGE[1].name
		);
	});

	test('attachments are sent as context and cleared after submission', async ({ page }) => {
		// Add knowledge attachment
		await knowledgeAttachmentButton.click();
		await chooseFromCombobox(page, 'Knowledge', MOCK_KNOWLEDGE[0].name, true);
		await expect(knowledgeAttachments).toHaveCount(1);

		// Setup completion response mock
		await mockCompletionResponse(page, MOCK_ATTACHMENTS_RESPONSE);

		// Define a type for the request data
		type RequestData = {
			messages: Array<{
				role: string;
				knowledge: (typeof MOCK_KNOWLEDGE)[0];
				content: string;
			}>;
		};

		// Capture request data
		let requestData: RequestData | undefined;
		await page.route('**/api/chat', async (route) => {
			requestData = JSON.parse(route.request().postData() || '{}');
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(MOCK_ATTACHMENTS_RESPONSE)
			});
		});

		// Submit message with attachment
		await page.locator('.prompt-editor__textarea').fill('Use the context please');
		await page.getByText('Run').click();

		// Verify request includes knowledge context
		expect(requestData?.messages[0]).toMatchObject({
			role: 'user',
			knowledge: MOCK_KNOWLEDGE[0],
			content: `
<CONTEXT>
	<CONTEXT_NAME>${MOCK_KNOWLEDGE[0].name}</CONTEXT_NAME>
	<CONTEXT_CONTENT>${MOCK_KNOWLEDGE[0].content}</CONTEXT_CONTENT>
</CONTEXT>
`
		});

		// Verify attachments are cleared after submission
		await expect(knowledgeAttachments).toHaveCount(0);
	});

	test('knowledge options exclude already selected attachments', async ({ page }) => {
		// Add first knowledge attachment
		await knowledgeAttachmentButton.click();
		await chooseFromCombobox(page, 'Knowledge', MOCK_KNOWLEDGE[0].name, true);

		// Try to add second attachment and verify options
		await knowledgeAttachmentButton.click();
		await page.getByPlaceholder('Knowledge').last().click();

		// Should only show unselected knowledge options
		const options = page.locator('.field-combobox-item');
		await expect(options).toHaveCount(MOCK_KNOWLEDGE.length - 1);
		await expect(options).not.toContainText(MOCK_KNOWLEDGE[0].name);
		await expect(options).toContainText(MOCK_KNOWLEDGE[1].name);
	});

	test('attachments persist when toggling code editor', async ({ page }) => {
		// Add knowledge attachment
		await knowledgeAttachmentButton.click();
		await chooseFromCombobox(page, 'Knowledge', MOCK_KNOWLEDGE[0].name, true);

		// Toggle code editor
		await page.getByLabel('Controls').click();

		// Verify attachment still exists
		await expect(knowledgeAttachments).toHaveCount(1);
		await expect(knowledgeAttachments.first().locator('.field-combobox-input')).toHaveValue(
			MOCK_KNOWLEDGE[0].name
		);

		// Toggle back and verify again
		await page.getByLabel('Messages').click();
		await expect(knowledgeAttachments).toHaveCount(1);
		await expect(knowledgeAttachments.first().locator('.field-combobox-input')).toHaveValue(
			MOCK_KNOWLEDGE[0].name
		);
	});

	test('displays and deletes knowledge attachments in message history', async ({ page }) => {
		// Add knowledge attachment
		await knowledgeAttachmentButton.click();
		await chooseFromCombobox(page, 'Knowledge', MOCK_KNOWLEDGE[0].name, true);

		// Setup completion response mock
		await mockCompletionResponse(page, MOCK_ATTACHMENTS_RESPONSE);

		// Submit message with attachment
		await page.locator('.prompt-editor__textarea').fill('Use the context please');
		await page.getByText('Run').click();

		// Verify knowledge attachment appears in message history
		const attachmentInHistory = page.locator('article.attachment');
		await expect(attachmentInHistory).toBeVisible();
		await expect(attachmentInHistory.locator('.attachment__name')).toContainText(
			MOCK_KNOWLEDGE[0].name
		);

		// Delete the attachment from history
		await attachmentInHistory.getByRole('button').click();

		// Verify attachment is removed from history
		await expect(attachmentInHistory).not.toBeVisible();

		// Verify it can be selected again for a new message
		await knowledgeAttachmentButton.click();
		await chooseFromCombobox(page, 'Knowledge', MOCK_KNOWLEDGE[0].name, true);
		await expect(knowledgeAttachments).toHaveCount(1);
		await expect(knowledgeAttachments.first().locator('.field-combobox-input')).toHaveValue(
			MOCK_KNOWLEDGE[0].name
		);

		// Submit a new message with the attachment
		await page.locator('.prompt-editor__textarea').fill('Use the context please');
		await page.getByText('Run').click();

		// Verify that attachment is positioned third in the message history
		const messageHistory = page.locator('article');
		await expect(messageHistory.nth(2).locator('.attachment__name')).toContainText(
			MOCK_KNOWLEDGE[0].name
		);
	});

	test('can attach, preview, delete, and send an image (Ollama)', async ({ page }) => {
		// ESM-compatible path resolution for test image
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);
		const testImagePath = path.resolve(__dirname, 'docs.test.ts-snapshots', 'motd.png');

		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();
		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		const promptTextarea = page.locator('.prompt-editor__textarea');

		// Check Attach image button exists
		const attachImageButton = page.getByTestId('image-attachment');
		await expect(attachImageButton).toBeVisible();

		// Simulate image upload
		const [fileChooser] = await Promise.all([
			page.waitForEvent('filechooser'),
			attachImageButton.click()
		]);
		await fileChooser.setFiles(testImagePath);

		// Check preview and filename
		await expect(page.locator('.attachment__image-preview')).toBeVisible();
		await expect(page.locator('.attachment__image-name')).toHaveText('motd.png');

		// Delete the image
		await page.getByTestId('attachment-delete').click();
		await expect(page.locator('.attachment__image-preview')).not.toBeVisible();

		// Re-attach for payload test
		const [fileChooser2] = await Promise.all([
			page.waitForEvent('filechooser'),
			attachImageButton.click()
		]);
		await fileChooser2.setFiles(testImagePath);

		// Intercept outgoing request
		let requestPayload:
			| { messages: { role: string; content: string; images?: string[] }[] }
			| undefined = undefined;
		await page.route('**/chat', async (route, request) => {
			const postData = request.postData();
			if (postData) requestPayload = JSON.parse(postData);
			// Simulate a streamed response as Ollama would send
			const responseBody = [
				JSON.stringify({
					message: { role: 'assistant', content: 'This is a description of MOTD.png' }
				}),
				''
			].join('\n');
			await route.fulfill({
				status: 200,
				contentType: 'text/event-stream',
				body: responseBody
			});
		});

		await promptTextarea.fill('Describe this image');
		await page.getByText('Run').click();

		// Assert payload contains images array and prompt
		if (!requestPayload) throw new Error('No request payload captured');
		const lastUserMsg = (
			requestPayload as { messages: { role: string; content: string; images?: string[] }[] }
		).messages
			.filter((m) => m.role === 'user')
			.at(-1);
		expect(lastUserMsg).toBeTruthy();
		expect(Array.isArray(lastUserMsg?.images)).toBe(true);
		expect(lastUserMsg?.images?.length).toBe(1);
		expect(typeof lastUserMsg?.images?.[0]).toBe('string');
		expect(lastUserMsg?.content).toContain('Describe this image');

		// Assert attachments UI is cleared
		expect(await page.locator('.prompt-editor .attachment__image-preview').count()).toBe(0);

		// Assert session history contains the image thumbnail and filename
		const articleImages = page.locator('.article__image-thumbnail');
		await expect(articleImages).toHaveCount(1);
		await expect(articleImages.first()).toBeVisible();
		const articleFilenames = page.locator('.article__image-filename');
		await expect(articleFilenames).toHaveCount(1);
		await expect(articleFilenames.first()).toHaveText('motd.png');

		// --- Edit the message and add another image ---
		let userMessageArticle = page.locator('article', { hasText: 'Describe this image' });
		await userMessageArticle.hover();
		await userMessageArticle.getByTitle('Edit').click();

		// Assert original image is in attachments
		const promptAttachments = page.locator('.prompt-editor .attachment');
		await expect(promptAttachments).toHaveCount(1);
		await expect(promptAttachments.locator('.attachment__image-name')).toHaveText('motd.png');

		// Upload second image
		const secondTestImagePath = path.resolve(__dirname, 'docs.test.ts-snapshots', 'session.png');
		const [fileChooser3] = await Promise.all([
			page.waitForEvent('filechooser'),
			attachImageButton.click()
		]);
		await fileChooser3.setFiles(secondTestImagePath);

		// Assert both images are in attachments
		await expect(promptAttachments).toHaveCount(2);
		await expect(promptAttachments.locator('.attachment__image-name').nth(0)).toHaveText(
			'motd.png'
		);
		await expect(promptAttachments.locator('.attachment__image-name').nth(1)).toHaveText(
			'session.png'
		);

		// Update prompt text
		const textEditor = page.locator('.text-editor .cm-content');
		await textEditor.clear();
		await textEditor.fill('Describe these two images');

		// Intercept the EDIT request
		let editRequestPayload1:
			| { messages: { role: string; content: string; images?: string[] }[] }
			| undefined = undefined;
		await page.route('**/chat', async (route, request) => {
			const postData = request.postData();
			if (postData) editRequestPayload1 = JSON.parse(postData);
			const responseBody = [
				JSON.stringify({ message: { role: 'assistant', content: 'Description of two images' } }),
				''
			].join('\n');
			await route.fulfill({
				status: 200,
				contentType: 'text/event-stream',
				body: responseBody
			});
		});

		// Submit edit
		await page.getByText('Run').click();

		// Re-find the article after edit
		userMessageArticle = page.locator('article', { hasText: 'Describe these two images' });

		// Assert EDIT payload contains updated text and both images
		if (!editRequestPayload1) throw new Error('No edit request payload captured');
		const editedUserMsg1 = (
			editRequestPayload1 as { messages: { role: string; content: string; images?: string[] }[] }
		).messages
			.filter((m) => m.role === 'user')
			.at(-1);
		expect(editedUserMsg1).toBeTruthy();
		expect(editedUserMsg1?.content).toBe('Describe these two images');
		expect(Array.isArray(editedUserMsg1?.images)).toBe(true);
		expect(editedUserMsg1?.images?.length).toBe(2); // Both images sent

		// Assert attachments UI is cleared
		expect(await page.locator('.prompt-editor .attachment__image-preview').count()).toBe(0);

		// Assert session history shows edited message with both images
		await expect(userMessageArticle.locator('.article__image-thumbnail')).toHaveCount(2);
		await expect(userMessageArticle.locator('.article__image-filename').nth(0)).toHaveText(
			'motd.png'
		);
		await expect(userMessageArticle.locator('.article__image-filename').nth(1)).toHaveText(
			'session.png'
		);
		await expect(page.getByText('Description of two images')).toBeVisible(); // Check assistant response

		// --- Edit the message again and remove the first image ---
		await userMessageArticle.hover();
		await userMessageArticle.getByTitle('Edit').click();

		// Assert both images are back in attachments
		await expect(promptAttachments).toHaveCount(2);

		// Delete the first image (motd.png)
		await promptAttachments
			.filter({ hasText: 'motd.png' })
			.getByTestId('attachment-delete')
			.click();

		// Assert only the second image remains
		await expect(promptAttachments).toHaveCount(1);
		await expect(promptAttachments.locator('.attachment__image-name')).toHaveText('session.png');

		// Update prompt text
		await textEditor.clear();
		await textEditor.fill('Describe just this one image now');

		// Intercept the SECOND EDIT request
		let editRequestPayload2:
			| { messages: { role: string; content: string; images?: string[] }[] }
			| undefined = undefined;
		await page.route('**/chat', async (route, request) => {
			const postData = request.postData();
			if (postData) editRequestPayload2 = JSON.parse(postData);
			const responseBody = [
				JSON.stringify({ message: { role: 'assistant', content: 'Description of one image' } }),
				''
			].join('\n');
			await route.fulfill({
				status: 200,
				contentType: 'text/event-stream',
				body: responseBody
			});
		});

		// Submit second edit
		await page.getByText('Run').click();

		// Re-find the article after second edit
		userMessageArticle = page.locator('article', { hasText: 'Describe just this one image now' });

		// Assert SECOND EDIT payload contains updated text and only one image
		if (!editRequestPayload2) throw new Error('No second edit request payload captured');
		const editedUserMsg2 = (
			editRequestPayload2 as { messages: { role: string; content: string; images?: string[] }[] }
		).messages
			.filter((m) => m.role === 'user')
			.at(-1);
		expect(editedUserMsg2).toBeTruthy();
		expect(editedUserMsg2?.content).toBe('Describe just this one image now');
		expect(Array.isArray(editedUserMsg2?.images)).toBe(true);
		expect(editedUserMsg2?.images?.length).toBe(1); // Only one image sent

		// Assert attachments UI is cleared
		expect(await page.locator('.prompt-editor .attachment__image-preview').count()).toBe(0);

		// Assert session history shows re-edited message with only the second image
		await expect(userMessageArticle.locator('.article__image-thumbnail')).toHaveCount(1);
		await expect(userMessageArticle.locator('.article__image-filename')).toHaveText('session.png');
		await expect(page.getByText('Description of one image')).toBeVisible(); // Check assistant response
	});
});
