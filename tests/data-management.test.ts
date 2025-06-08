import { promises as fs } from 'fs';
import { expect, test } from '@playwright/test';

import { MOCK_API_TAGS_RESPONSE, MOCK_KNOWLEDGE, mockOllamaModelsResponse } from './utils';

test('deletes all preferences and resets to default values', async ({ page }) => {
	await mockOllamaModelsResponse(page);
	await page.getByText('Dark').click();
	await expect(page.getByText('Light')).toBeVisible();
	await expect(page.getByText('Dark')).not.toBeVisible();

	let localStorageSettings = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(localStorageSettings).toContain('"userTheme":"dark"');
	await expect(page.getByText('Deleted successfully')).not.toBeVisible();

	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all preferences?'));
	await expect(page.getByTestId('data-management-hollama-settings')).toContainText('Preferences');
	await page.getByTestId('data-management-hollama-settings').getByText('Delete').click();
	await expect(page.getByText('Deleted successfully')).toBeVisible();

	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-settings') !== null;
	});
	localStorageSettings = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageSettings).not.toContain('"userTheme":"dark"');
	await expect(page.getByText('Dark')).toBeVisible();
	await expect(page.getByText('Light')).not.toBeVisible();
});

test('deletes all servers and resets to default values', async ({ page }) => {
	await mockOllamaModelsResponse(page);
	await expect(page.getByLabel('Base URL')).toHaveValue('http://localhost:11434');

	let localStorageServers = await page.evaluate(() =>
		window.localStorage.getItem('hollama-servers')
	);
	expect(localStorageServers).toContain('"baseUrl":"http://localhost:11434"');
	await expect(page.getByText('Deleted successfully')).not.toBeVisible();

	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all servers?'));
	await page.getByTestId('data-management-hollama-servers').getByText('Delete').click();
	await expect(page.getByText('Deleted successfully')).toBeVisible();

	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-servers') !== null;
	});
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

	// Verify toast is not visible before deletion
	await expect(page.getByText('Deleted successfully')).not.toBeVisible();

	// Click the delete button
	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all sessions?'));
	await expect(page.getByTestId('data-management-hollama-sessions')).toContainText('Sessions');

	await page.getByTestId('data-management-hollama-sessions').getByText('Delete').click();

	// Verify toast is visible after deletion
	await expect(page.getByText('Deleted successfully')).toBeVisible();

	await page.getByRole('tab', { name: 'Sessions' }).click();
	await expect(page.getByText('No sessions')).toBeVisible();
	await expect(page.getByTestId('session-item')).toHaveCount(0);
	expect(await page.evaluate(() => window.localStorage.getItem('hollama-sessions'))).toBe('[]');
});

test('all knowledge can be deleted', async ({ page }) => {
	await page.goto('/knowledge');
	await expect(page.getByText('No knowledge')).toBeVisible();
	await expect(page.getByTestId('knowledge-item')).toHaveCount(0);

	await page.evaluate(
		({ mockKnowledge }) =>
			window.localStorage.setItem('hollama-knowledge', JSON.stringify(mockKnowledge)),
		{ mockKnowledge: MOCK_KNOWLEDGE }
	);

	await page.reload();
	await expect(page.getByText('No knowledge')).not.toBeVisible();
	await expect(page.getByTestId('knowledge-item')).toHaveCount(2);

	await page.getByText('Settings').click();
	await expect(page.getByText('Deleted successfully')).not.toBeVisible();

	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all knowledge?'));
	await expect(page.getByTestId('data-management-hollama-knowledge')).toContainText('Knowledge');

	await page.getByTestId('data-management-hollama-knowledge').getByText('Delete').click();
	await expect(page.getByText('Deleted successfully')).toBeVisible();

	await page.getByRole('tab', { name: 'Knowledge' }).click();
	await expect(page.getByText('No knowledge')).toBeVisible();
	await expect(page.getByTestId('knowledge-item')).toHaveCount(0);
	expect(await page.evaluate(() => window.localStorage.getItem('hollama-knowledge'))).toBe('[]');
});

test('exports server data to a JSON file', async ({ page }, testInfo) => {
	await mockOllamaModelsResponse(page);
	await page.goto('/settings');
	await expect(page.getByLabel('Base URL')).toHaveValue('http://localhost:11434');

	const localStorageServers = await page.evaluate(() =>
		window.localStorage.getItem('hollama-servers')
	);
	expect(localStorageServers).toContain('"baseUrl":"http://localhost:11434"');

	const downloadPromise = page.waitForEvent('download');
	await page.getByTestId('data-management-hollama-servers').getByText('Export').click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe('hollama-servers.json');

	const filePath = testInfo.outputPath('downloaded-servers.json');
	await download.saveAs(filePath);
	const fileContent = await fs.readFile(filePath, 'utf8');
	expect(fileContent).toContain('"baseUrl":"http://localhost:11434"');
});

test('exports preferences data to a JSON file', async ({ page }, testInfo) => {
	await mockOllamaModelsResponse(page);
	await page.goto('/settings');
	await page.getByText('Dark').click();
	await expect(page.getByText('Light')).toBeVisible();

	// Verify we have preference data
	const localStorageSettings = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(localStorageSettings).toContain('"userTheme":"dark"');

	const downloadPromise = page.waitForEvent('download');
	await page.getByTestId('data-management-hollama-settings').getByText('Export').click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe('hollama-preferences.json');

	const filePath = testInfo.outputPath('downloaded-preferences.json');
	await download.saveAs(filePath);
	const fileContent = await fs.readFile(filePath, 'utf8');
	expect(fileContent).toContain('"userTheme":"dark"');
});

test('imports server configuration from JSON file', async ({ page }, testInfo) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Settings' }).click();
	const beforeServers = await page.evaluate(() => window.localStorage.getItem('hollama-servers'));
	expect(beforeServers === null || beforeServers === '[]').toBeTruthy();
	await expect(page.getByTestId('server')).toHaveCount(0);

	// Create a file with custom server configuration
	const customServerConfig = [
		{
			id: 'test-server-1',
			name: 'Test Server',
			baseUrl: 'http://test-server:11434',
			connectionType: 'ollama',
			isVerified: null,
			isEnabled: true
		},
		{
			id: 'test-server-2',
			name: 'OpenAI Server',
			baseUrl: 'https://api.openai.com/v1',
			connectionType: 'openai',
			apiKey: 'my-secret-api-key',
			isVerified: null,
			isEnabled: true
		}
	];

	const filePath = testInfo.outputPath('test-servers.json');
	await fs.writeFile(filePath, JSON.stringify(customServerConfig));
	await expect(page.getByText('Import successful')).not.toBeVisible();

	page.on('dialog', (dialog) => dialog.accept());
	const fileInputSelector = 'input#import-hollama-servers-input';
	await page.getByTestId('data-management-hollama-servers').getByText('Import').click();
	await page.setInputFiles(fileInputSelector, filePath);
	await expect(page.getByText('Import successful')).toBeVisible();

	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-servers') !== null;
	});
	const serversConfigRaw = await page.evaluate(() =>
		window.localStorage.getItem('hollama-servers')
	);
	const serversConfig = JSON.parse(serversConfigRaw || '[]');
	expect(serversConfig).toHaveLength(2);
	expect(serversConfig[0].name).toBe('Test Server');
	expect(serversConfig[1].baseUrl).toBe('https://api.openai.com/v1');
	await expect(page.getByTestId('server')).toHaveCount(2);
	await expect(page.getByLabel('Base URL').nth(0)).toHaveValue('http://test-server:11434');
	await expect(page.getByLabel('Base URL').nth(1)).toHaveValue('https://api.openai.com/v1');
	await expect(page.getByLabel('API Key').nth(0)).toHaveValue('my-secret-api-key');
});

test('imports session data from JSON file', async ({ page }, testInfo) => {
	await page.goto('/');
	await page.getByRole('tab', { name: 'Sessions' }).click();
	await expect(page.getByText('No sessions')).toBeVisible();
	await expect(page.getByTestId('session-item')).toHaveCount(0);

	const beforeSessions = await page.evaluate(() => window.localStorage.getItem('hollama-sessions'));
	expect(beforeSessions === null || beforeSessions === '[]').toBeTruthy();

	await page.getByRole('link', { name: 'Settings' }).click();

	// Create a file with test session data
	const testSessions = [
		{
			id: 'test-session-1',
			model: MOCK_API_TAGS_RESPONSE.models[0].name,
			messages: [
				{ role: 'user', content: 'Test message' },
				{ role: 'assistant', content: 'Test response' }
			],
			context: [],
			updatedAt: new Date().toISOString()
		}
	];

	const filePath = testInfo.outputPath('test-sessions.json');
	await fs.writeFile(filePath, JSON.stringify(testSessions));
	await expect(page.getByText('Import successful')).not.toBeVisible();

	page.on('dialog', (dialog) => dialog.accept());
	const fileInputSelector = 'input#import-hollama-sessions-input';
	await page.getByTestId('data-management-hollama-sessions').getByText('Import').click();
	await page.setInputFiles(fileInputSelector, filePath);
	await expect(page.getByText('Import successful')).toBeVisible();

	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-sessions') !== null;
	});
	await page.getByRole('tab', { name: 'Sessions' }).click();

	// Positive assertions: UI and localStorage
	await expect(page.getByText('No sessions')).not.toBeVisible();
	await expect(page.getByTestId('session-item')).toHaveCount(1);
	// UI: Check session message is visible
	await page.getByTestId('session-item').first().click();
	await expect(page.getByText('Test message')).toBeVisible();
	await expect(page.getByText('Test response')).toBeVisible();
	const afterSessions = await page.evaluate(() => window.localStorage.getItem('hollama-sessions'));
	expect(afterSessions).toContain('Test message');
});

test('imports knowledge data from JSON file', async ({ page }, testInfo) => {
	await page.goto('/');
	await page.getByRole('tab', { name: 'Knowledge' }).click();
	await expect(page.getByText('No knowledge')).toBeVisible();
	await expect(page.getByTestId('knowledge-item')).toHaveCount(0);

	const beforeKnowledge = await page.evaluate(() =>
		window.localStorage.getItem('hollama-knowledge')
	);
	expect(beforeKnowledge === null || beforeKnowledge === '[]').toBeTruthy();

	// Create a file with test knowledge data
	const testKnowledge = [
		{
			id: 'r3vpuu',
			name: 'Susan',
			content: 'Tu nombre es Susan',
			updatedAt: '2025-05-13T20:47:41.780Z'
		}
	];

	const filePath = testInfo.outputPath('test-knowledge.json');
	await fs.writeFile(filePath, JSON.stringify(testKnowledge));
	await page.getByRole('link', { name: 'Settings' }).click();
	await expect(page.getByText('Import successful')).not.toBeVisible();

	// Setup dialog handler to accept the confirmation
	page.on('dialog', (dialog) => dialog.accept());
	const fileInputSelector = 'input#import-hollama-knowledge-input';
	await page.getByTestId('data-management-hollama-knowledge').getByText('Import').click();
	await page.setInputFiles(fileInputSelector, filePath);
	await expect(page.getByText('Import successful')).toBeVisible();

	// Handle the page reload
	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-knowledge') !== null;
	});

	// Go back to Knowledge section to see imported data
	await page.getByRole('tab', { name: 'Knowledge' }).click();
	await expect(page.getByTestId('knowledge-item')).toHaveCount(1);
	await expect(page.getByText('Susan')).toBeVisible();

	await page.getByText('Susan').click();
	await expect(page.getByText('Tu nombre es Susan')).toBeVisible();

	const afterKnowledge = await page.evaluate(() =>
		window.localStorage.getItem('hollama-knowledge')
	);
	expect(afterKnowledge).toContain('Susan');
});

test('imports preferences data from JSON file', async ({ page }, testInfo) => {
	await page.goto('/');
	await page.getByRole('link', { name: 'Settings' }).click();

	// Negative assertions: Language is not Spanish in UI or localStorage
	await expect(page.getByLabel('Language')).toHaveValue('English');
	await expect(page.getByText('Dark')).toBeVisible();
	await expect(page.getByText('Claro')).not.toBeVisible();
	const beforeSettings = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(beforeSettings === null || !beforeSettings.includes('"userLanguage":"es"')).toBeTruthy();

	// Create a file with test preferences data
	const testPreferences = {
		userLanguage: 'es',
		userTheme: 'dark',
		sidebarExpanded: true
	};

	const filePath = testInfo.outputPath('test-preferences.json');
	await fs.writeFile(filePath, JSON.stringify(testPreferences));
	await expect(page.getByText('Import successful')).not.toBeVisible();

	page.on('dialog', (dialog) => dialog.accept());
	const fileInputSelector = 'input#import-hollama-settings-input';
	await page.getByTestId('data-management-hollama-settings').getByText('Import').click();
	await page.setInputFiles(fileInputSelector, filePath);
	await expect(page.getByText('Import successful')).toBeVisible();

	// Handle the page reload
	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-settings') !== null;
	});
	await expect(page.getByLabel('Idioma')).toHaveValue('Español');

	const afterSettings = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(afterSettings).toContain('"userLanguage":"es"');

	await expect(page.getByText('Dark')).not.toBeVisible();
	await expect(page.getByText('Claro')).toBeVisible();
});
