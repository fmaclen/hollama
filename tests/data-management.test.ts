import { expect, test } from '@playwright/test';

import { MOCK_API_TAGS_RESPONSE, MOCK_KNOWLEDGE, mockOllamaModelsResponse } from './utils';

test('deletes all preferences and resets to default values', async ({ page }) => {
	await mockOllamaModelsResponse(page);

	// Change theme to dark mode
	await page.getByText('Dark').click();
	await expect(page.getByText('Light')).toBeVisible();
	await expect(page.getByText('Dark')).not.toBeVisible();

	// Check the preferences have been saved to localStorage
	let localStorageSettings = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(localStorageSettings).toContain('"userTheme":"dark"');

	// Click the delete button for preferences
	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all preferences?'));
	await expect(page.getByTestId('data-management-hollama-settings')).toContainText('Preferences');
	await page.getByTestId('data-management-hollama-settings').getByText('Delete').click();

	// Wait for page reload
	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-settings') !== null;
	});

	// Check the preferences have been reset to defaults
	localStorageSettings = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageSettings).not.toContain('"userTheme":"dark"');
	await expect(page.getByText('Dark')).toBeVisible();
	await expect(page.getByText('Light')).not.toBeVisible();
});

test('deletes all servers and resets to default values', async ({ page }) => {
	await mockOllamaModelsResponse(page);
	await expect(page.getByLabel('Base URL')).toHaveValue('http://localhost:11434');

	// Check if the settings store is updated with the selected server
	let localStorageServers = await page.evaluate(() =>
		window.localStorage.getItem('hollama-servers')
	);
	expect(localStorageServers).toContain('"baseUrl":"http://localhost:11434"');

	// Click the delete button for servers
	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all servers?'));
	await page.getByTestId('data-management-hollama-servers').getByText('Delete').click();

	// Wait for page reload
	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-servers') !== null;
	});

	// Check the servers have been removed completely
	localStorageServers = await page.evaluate(() => window.localStorage.getItem('hollama-servers'));
	expect(localStorageServers).not.toContain('"baseUrl":"http://localhost:11434"');
	await expect(page.getByText('Base URL')).not.toBeVisible();
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
	await expect(page.getByTestId('data-management-hollama-sessions')).toContainText('Sessions');

	await page.getByTestId('data-management-hollama-sessions').getByText('Delete').click();
	await page.getByTestId('sidebar').getByText('Sessions').click();
	await expect(page.getByText('No sessions')).toBeVisible();
	await expect(page.getByTestId('session-item')).toHaveCount(0);
	expect(await page.evaluate(() => window.localStorage.getItem('hollama-sessions'))).toBe('[]');
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
	await expect(page.getByTestId('data-management-hollama-knowledge')).toContainText('Knowledge');

	await page.getByTestId('data-management-hollama-knowledge').getByText('Delete').click();
	await page.getByTestId('sidebar').getByText('Knowledge').click();
	await expect(page.getByText('No knowledge')).toBeVisible();
	await expect(page.getByTestId('knowledge-item')).toHaveCount(0);
	expect(await page.evaluate(() => window.localStorage.getItem('hollama-knowledge'))).toBe('[]');
});
