import { expect, test } from '@playwright/test';

import type { Model } from '$lib/settings';

import {
	MOCK_API_TAGS_RESPONSE,
	MOCK_DEFAULT_SERVER_ID,
	MOCK_KNOWLEDGE,
	mockOllamaModelsResponse,
	seedKnowledgeAndReload
} from './utils';

test.beforeEach(async ({ page }) => {
	await mockOllamaModelsResponse(page);
});

test('seed data and take screenshots for README.md', async ({ page }) => {
	await page.goto('/');

	// Wait for fonts to load
	expect(await page.evaluate(() => document.fonts.size)).toBe(19);
	expect(await page.evaluate(() => document.fonts.ready)).toBeTruthy();

	expect(await page.screenshot()).toMatchSnapshot({ name: 'settings.png' });

	await page.goto('/sessions/ulxz6l'); // Visiting a fake session id so it doesn't change from test to test
	await expect(page.getByText('No sessions')).toBeVisible();
	await expect(page.locator('.prompt-editor__textarea')).toBeVisible();
	await expect(page.locator('.text-editor')).not.toBeVisible();

	await page.locator('.prompt-editor__toggle').click();
	await expect(page.locator('.text-editor')).toBeVisible();
	await expect(page.locator('.prompt-editor__textarea')).not.toBeVisible();
	expect(await page.screenshot()).toMatchSnapshot({ name: 'session-new.png' });

	// Stage 2 sessions
	const models: Model[] = MOCK_API_TAGS_RESPONSE.models.map((model) => ({
		name: model.name,
		serverId: MOCK_DEFAULT_SERVER_ID
	}));
	await page.evaluate(
		({ modelA, modelB }) =>
			window.localStorage.setItem(
				'hollama-sessions',
				// FIXME: we use set a type here to make sure these are `Session[]`
				JSON.stringify([
					{
						id: 'u4pozr',
						model: modelA,
						messages: [
							{
								role: 'user',
								content:
									'Write a Python function to calculate the odds of the winner in a fight between Emma Watson and Jessica Alba'
							},
							{
								role: 'assistant',
								content:
									"Here's a basic function that takes the age, height, weight, and fighting experience of both individuals as input and returns the difference between their ages, heights, and weights.\n```python\ndef calculate_odds(emma_age, emma_height, emma_weight, emma_experience, jessica_age, jessica_height, jessica_weight, jessica_experience):\n    emma_stats = {'age': emma_age, 'height': emma_height, 'weight': emma_weight, 'experience': emma_experience}\n    jessica_stats = {'age': jessica_age, 'height': jessica_height, 'weight': jessica_weight, 'experience': jessica_experience}\n    \n    # Calculate the differences between their stats\n    age_difference = abs(emma_stats['age'] - jessica_stats['age'])\n    height_difference = abs(emma_stats['height'] - jessica_stats['height'])\n    weight_difference = abs(emma_stats['weight'] - jessica_stats['weight'])\n    \n    # Return the differences as a tuple\n    return (age_difference, height_difference, weight_difference)\n```\nYou can use this function to compare Emma Watson and Jessica Alba by providing their respective statistics as inputs."
							}
						],
						updatedAt: new Date().toISOString()
					},
					{
						id: 'bbpz8o',
						model: modelB,
						messages: [
							{
								role: 'user',
								content: 'What is the meaning of life?'
							},
							{
								role: 'assistant',
								content:
									'**The meaning of life is a complex and multifaceted question that has been pondered by philosophers, theologians, and individuals throughout history.** Good luck with that.'
							}
						],
						updatedAt: new Date().toISOString()
					}
				])
			),
		{
			modelA: models[0],
			modelB: models[1]
		}
	);

	await page.reload();
	await expect(page.getByText('No sessions')).not.toBeVisible();
	await expect(page.getByTestId('session-item')).toHaveCount(2);

	await page.getByText('Write a Python function').click();
	await expect(page.getByText("Here's a basic function")).toBeVisible();
	await expect(page.getByText('No knowledge', { exact: true })).not.toBeVisible();
	await page.locator('article', { hasText: "Here's a basic function" }).hover();
	expect(await page.screenshot()).toMatchSnapshot({ name: 'session.png' });

	await page.getByLabel('Controls').click();
	await expect(page.getByText('System prompt')).toBeVisible();
	expect(await page.screenshot()).toMatchSnapshot({ name: 'session-controls.png' });

	await page.locator('.layout__a', { hasText: 'Knowledge' }).click();
	await expect(page.getByText('No knowledge')).toBeVisible();

	await seedKnowledgeAndReload(page);
	await expect(page.getByText('No knowledge')).not.toBeVisible();
	await expect(page.getByTestId('knowledge-metadata')).not.toBeVisible();

	await page.getByText(MOCK_KNOWLEDGE[0].name).click();
	await expect(page.getByTestId('knowledge-metadata')).toBeVisible();
	expect(await page.screenshot()).toMatchSnapshot({ name: 'knowledge.png' });

	await page.getByText('Motd').click();
	await expect(page.locator('h3', { hasText: 'Message of the day' })).toBeVisible();
	expect(await page.screenshot()).toMatchSnapshot({ name: 'motd.png' });
});
