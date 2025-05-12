import { promises as fs } from 'fs';
import { expect, test } from '@playwright/test';
import { chooseFromCombobox } from './utils';

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

	// Verify toast is not visible before deletion
	await expect(page.getByText('Deleted successfully')).not.toBeVisible();

	// Click the delete button for preferences
	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all preferences?'));
	await expect(page.getByTestId('data-management-hollama-settings')).toContainText('Preferences');
	await page.getByTestId('data-management-hollama-settings').getByText('Delete').click();

	// Verify toast is visible after deletion
	await expect(page.getByText('Deleted successfully')).toBeVisible();

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

	// Verify toast is not visible before deletion
	await expect(page.getByText('Deleted successfully')).not.toBeVisible();

	// Click the delete button for servers
	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all servers?'));
	await page.getByTestId('data-management-hollama-servers').getByText('Delete').click();

	// Verify toast is visible after deletion
	await expect(page.getByText('Deleted successfully')).toBeVisible();

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

	// Verify toast is not visible before deletion
	await expect(page.getByText('Deleted successfully')).not.toBeVisible();

	// Click the delete button
	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all sessions?'));
	await expect(page.getByTestId('data-management-hollama-sessions')).toContainText('Sessions');

	await page.getByTestId('data-management-hollama-sessions').getByText('Delete').click();

	// Verify toast is visible after deletion
	await expect(page.getByText('Deleted successfully')).toBeVisible();

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

	// Verify toast is not visible before deletion
	await expect(page.getByText('Deleted successfully')).not.toBeVisible();

	// Click the delete button
	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete all knowledge?'));
	await expect(page.getByTestId('data-management-hollama-knowledge')).toContainText('Knowledge');

	await page.getByTestId('data-management-hollama-knowledge').getByText('Delete').click();

	// Verify toast is visible after deletion
	await expect(page.getByText('Deleted successfully')).toBeVisible();

	await page.getByTestId('sidebar').getByText('Knowledge').click();
	await expect(page.getByText('No knowledge')).toBeVisible();
	await expect(page.getByTestId('knowledge-item')).toHaveCount(0);
	expect(await page.evaluate(() => window.localStorage.getItem('hollama-knowledge'))).toBe('[]');
});

test('exports server data to a JSON file', async ({ page }, testInfo) => {
	await mockOllamaModelsResponse(page);
	await page.goto('/settings');
	await expect(page.getByLabel('Base URL')).toHaveValue('http://localhost:11434');

	// Check if we have server data to export
	const localStorageServers = await page.evaluate(() =>
		window.localStorage.getItem('hollama-servers')
	);
	expect(localStorageServers).toContain('"baseUrl":"http://localhost:11434"');

	// Setup download listener
	const downloadPromise = page.waitForEvent('download');

	// Click export button for servers
	await page.getByTestId('data-management-hollama-servers').getByText('Export').click();

	// Wait for download to start
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe('hollama-servers.json');

	// Save to the test-results directory
	const filePath = testInfo.outputPath('downloaded-servers.json');
	await download.saveAs(filePath);

	// Verify content of the file
	const fileContent = await fs.readFile(filePath, 'utf8');
	expect(fileContent).toContain('"baseUrl":"http://localhost:11434"');
});

test('exports preferences data to a JSON file', async ({ page }, testInfo) => {
	await mockOllamaModelsResponse(page);
	await page.goto('/settings');

	// Change theme to dark mode to have some preference to export
	await page.getByText('Dark').click();
	await expect(page.getByText('Light')).toBeVisible();

	// Verify we have preference data
	const localStorageSettings = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(localStorageSettings).toContain('"userTheme":"dark"');

	// Setup download listener
	const downloadPromise = page.waitForEvent('download');

	// Click export button for preferences
	await page.getByTestId('data-management-hollama-settings').getByText('Export').click();

	// Wait for download to start
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe('hollama-preferences.json');

	// Save to the test-results directory
	const filePath = testInfo.outputPath('downloaded-preferences.json');
	await download.saveAs(filePath);

	// Verify content of the file
	const fileContent = await fs.readFile(filePath, 'utf8');
	expect(fileContent).toContain('"userTheme":"dark"');
});

test('imports server configuration from JSON file', async ({ page }, testInfo) => {
	await page.goto('/settings');

	// Create a file with custom server configuration
	const customServerConfig = [
		{
			id: 'test-server-1',
			name: 'Test Server',
			baseUrl: 'http://test-server:11434'
		}
	];

	const filePath = testInfo.outputPath('test-servers.json');
	await fs.writeFile(filePath, JSON.stringify(customServerConfig));

	// Verify toast is not visible before import
	await expect(page.getByText('Import successful')).not.toBeVisible();

	// Setup dialog handler to accept the confirmation
	page.on('dialog', (dialog) => dialog.accept());

	// Get the file input element
	const fileInputSelector = 'input#import-hollama-servers-input';

	// Click the import button to get the file input
	await page.getByTestId('data-management-hollama-servers').getByText('Import').click();

	// Upload the file
	await page.setInputFiles(fileInputSelector, filePath);

	// Verify toast is visible after import
	await expect(page.getByText('Import successful')).toBeVisible();

	// Handle the page reload
	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-servers') !== null;
	});

	// Verify the data was imported
	const serversConfigRaw = await page.evaluate(() => window.localStorage.getItem('hollama-servers'));
	const serversConfig = JSON.parse(serversConfigRaw || '[]');

	expect(serversConfig).toHaveLength(1);
	expect(serversConfig[0].name).toBe('Test Server');
	expect(serversConfig[0].baseUrl).toBe('http://test-server:11434');
});

test('imports session data from JSON file', async ({ page }, testInfo) => {
	await page.goto('/settings');

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

	// Verify toast is not visible before import
	await expect(page.getByText('Import successful')).not.toBeVisible();

	// Setup dialog handler to accept the confirmation
	page.on('dialog', (dialog) => dialog.accept());

	// Get the file input element
	const fileInputSelector = 'input#import-hollama-sessions-input';

	// Click the import button to get the file input
	await page.getByTestId('data-management-hollama-sessions').getByText('Import').click();

	// Upload the file
	await page.setInputFiles(fileInputSelector, filePath);

	// Verify toast is visible after import
	await expect(page.getByText('Import successful')).toBeVisible();

	// Handle the page reload
	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-sessions') !== null;
	});

	// Navigate to sessions to verify import
	await page.getByTestId('sidebar').getByText('Sessions').click();

	// Verify sessions are visible
	await expect(page.getByText('No sessions')).not.toBeVisible();
	await expect(page.getByTestId('session-item')).toHaveCount(1);
});
