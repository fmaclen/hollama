import { expect, test, type Locator } from '@playwright/test';

import {
	chooseModel,
	MOCK_API_TAGS_RESPONSE,
	MOCK_RESPONSE_WITH_REASONING,
	MOCK_STREAMED_THINK_TAGS,
	MOCK_STREAMED_THOUGHT_TAGS,
	mockCompletionResponse,
	mockOllamaModelsResponse,
	mockStreamedCompletionResponse,
	createManualStreamedCompletionMock
} from './utils';

test.describe('Session reasoning tag handling', () => {
	let promptTextarea: Locator;

	test.beforeEach(async ({ page }) => {
		await mockOllamaModelsResponse(page);
		promptTextarea = page.locator('.prompt-editor__textarea');
	});

	test('handles standard <think> tags in responses', async ({ page }) => {
		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();

		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
		await mockCompletionResponse(page, MOCK_RESPONSE_WITH_REASONING);
		await promptTextarea.fill('How should I test my code?');
		await page.getByText('Run').click();

		// Check that the main content is displayed without the think tags
		await expect(page.locator('article').last()).toContainText(
			'Here is how you can test your code effectively:'
		);

		// Verify tags aren't visible
		await expect(page.getByText('<think>')).not.toBeVisible();
		await expect(page.getByText('</think>')).not.toBeVisible();

		// Check that reasoning indicator exists but reasoning is not initially visible
		await expect(page.locator('.reasoning')).toBeVisible();
		await expect(page.locator('.article--reasoning')).not.toBeVisible();

		// Check reasoning content and toggle
		await expect(page.getByRole('button', { name: 'Reasoning' })).toBeVisible();
		await page.getByRole('button', { name: 'Reasoning' }).click();
		await expect(page.locator('.article--reasoning')).toBeVisible();
		await expect(page.locator('.article--reasoning')).toHaveText(
			'Let me analyze this request carefully. The user is asking about code testing, which requires a structured response.'
		);

		// Toggle off the reasoning
		await page.getByRole('button', { name: 'Reasoning' }).click();
		await expect(page.locator('.article--reasoning')).not.toBeVisible();

		// Verify the response structure when copying - should not include tags or reasoning
		await page.locator('.session__history').getByTitle('Copy').last().click();
		const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
		expect(clipboardText).toBe(
			'Here is how you can test your code effectively:\n\n1. Write unit tests\n2. Use integration tests\n3. Implement end-to-end testing'
		);
	});

	test('handles streamed <think> tags (character by character)', async ({ page }) => {
		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();

		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);

		// Set up fake streaming for the tests
		// First test - <think> tags
		await mockStreamedCompletionResponse(page, MOCK_STREAMED_THINK_TAGS);

		// Now fill and submit the prompt
		await promptTextarea.fill('How should I test my code?');
		await page.getByText('Run').click();

		// Wait for the reasoning button to appear, indicating the reasoning tag was processed
		await expect(page.getByRole('button', { name: 'Reasoning' })).toBeVisible();

		// At this point, the reasoning content should be streaming in, but the final part should not yet be visible
		await expect(page.locator('.article--assistant')).not.toContainText('This is outside a tag');

		// Wait for the completion to finish - it will show "This is outside a tag" at the end
		await expect(page.locator('.article--assistant')).toBeVisible();

		// Need to wait for all streaming chunks to complete
		await page.waitForFunction(() => {
			// Find the assistant's message container
			const assistantEl = document.querySelector('.article--assistant');
			// Check if it contains our final text
			return (
				assistantEl &&
				assistantEl.textContent &&
				assistantEl.textContent.includes('This is outside a tag')
			);
		});

		// Now test that tags are stripped
		await expect(page.getByText('<think>')).not.toBeVisible();
		await expect(page.getByText('</think>')).not.toBeVisible();

		// Check reasoning button and content
		await expect(page.getByRole('button', { name: 'Reasoning' })).toBeVisible();
		await page.getByRole('button', { name: 'Reasoning' }).click();
		await expect(page.locator('.article--reasoning')).toBeVisible();
		await expect(page.locator('.article--reasoning')).toHaveText('This is in a thinking tag');
	});

	test('reasoning block is open by default while reasoning is streaming, then auto-hides when main content starts', async ({ page }) => {
		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();

		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);

		// Use the manual streaming mock
		const stream = await createManualStreamedCompletionMock(page);

		await promptTextarea.fill('How should I test my code?');
		await page.getByText('Run').click();

		// Stream the reasoning content (simulate streaming <think>...</think>)
		const reasoningContent = '<think>This is in a thinking tag</think>';
		stream.sendChunk(reasoningContent, false);

		// Wait for the reasoning button and content to be visible
		await expect(page.getByRole('button', { name: 'Reasoning' })).toBeVisible();
		await expect(page.locator('.article--reasoning')).toBeVisible();
		await expect(page.locator('.article--reasoning')).toHaveText('This is in a thinking tag');

		// Now stream the rest of the completion (simulate streaming main content)
		const completionContent = 'This is outside a tag';
		stream.sendChunk(completionContent, true);

		// Wait for the main content to appear
		await page.waitForFunction(() => {
			const el = document.querySelector('.article--assistant');
			return el && el.textContent && el.textContent.includes('This is outside a tag');
		});

		// Assert the reasoning block is now hidden
		await expect(page.locator('.article--reasoning')).not.toBeVisible();
	});

	test('handles streamed <thought> tags (character by character)', async ({ page }) => {
		await page.goto('/');
		await page.getByText('Sessions', { exact: true }).click();
		await page.getByTestId('new-session').click();

		await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);

		// Set up fake streaming for the tests
		// Second test - <thought> tags
		await mockStreamedCompletionResponse(page, MOCK_STREAMED_THOUGHT_TAGS);

		// Now fill and submit the prompt
		await promptTextarea.fill('How should I test my code?');
		await page.getByText('Run').click();

		// Wait for the reasoning button to appear, indicating the reasoning tag was processed
		await expect(page.getByRole('button', { name: 'Reasoning' })).toBeVisible();

		// At this point, the reasoning content should be streaming in, but the final part should not yet be visible
		await expect(page.locator('.article--assistant')).not.toContainText('This is outside a tag');

		// Wait for the completion to finish - it will show "This is outside a tag" at the end
		await expect(page.locator('.article--assistant')).toBeVisible();

		// Need to wait for all streaming chunks to complete
		await page.waitForFunction(() => {
			// Find the assistant's message container
			const assistantEl = document.querySelector('.article--assistant');
			// Check if it contains our final text
			return (
				assistantEl &&
				assistantEl.textContent &&
				assistantEl.textContent.includes('This is outside a tag')
			);
		});

		// Now test that tags are stripped
		await expect(page.getByText('<thought>')).not.toBeVisible();
		await expect(page.getByText('</thought>')).not.toBeVisible();

		// Check reasoning button and content
		await expect(page.getByRole('button', { name: 'Reasoning' })).toBeVisible();
		await page.getByRole('button', { name: 'Reasoning' }).click();
		await expect(page.locator('.article--reasoning')).toBeVisible();
		await expect(page.locator('.article--reasoning')).toHaveText('This is in a thought tag');
	});
});
