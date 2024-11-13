import { expect, test, type Locator } from '@playwright/test';

import {
	chooseFromCombobox,
	chooseModel,
	MOCK_API_TAGS_RESPONSE,
	MOCK_KNOWLEDGE,
	mockCompletionResponse,
	mockTagsResponse,
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

test.describe('Knowledge Attachments', () => {
	let knowledgeAttachmentButton: Locator;
	let knowledgeAttachments: Locator;

	test.beforeEach(async ({ page }) => {
		await mockTagsResponse(page);
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
		await knowledgeAttachments.first().getByTestId('knowledge-attachment-delete').click();
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
CONTEXT
---
${MOCK_KNOWLEDGE[0].name}
---
${MOCK_KNOWLEDGE[0].content}
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
});
