import { expect, test, type Route } from '@playwright/test';
import type { ErrorResponse, ProgressResponse, StatusResponse } from 'ollama/browser';
import type OpenAI from 'openai';

import {
	chooseFromCombobox,
	MOCK_API_TAGS_RESPONSE,
	MOCK_OPENAI_MODELS,
	mockOllamaModelsResponse,
	mockOpenAIModelsResponse
} from './utils';

test.describe('Servers', () => {
	test('can add and remove multiple server connections', async ({ page }) => {
		await page.goto('/settings');
		await expect(page.getByText('Servers')).toBeVisible();

		const emptyMessage = page.getByText('No server connections, add one to start');
		await expect(emptyMessage).toBeVisible();

		const connections = page.getByTestId('server');
		await expect(connections).toHaveCount(0);
		await expect(page.getByLabel('Connection type')).toHaveValue('');

		// Add an Ollama server
		await chooseFromCombobox(page, 'Connection type', 'Ollama');
		const connectionType = page.getByLabel('Connection type');
		await expect(connectionType).toHaveValue('Ollama');

		await page.getByText('Add connection').click();
		await expect(connections.locator('.badge', { hasText: 'Ollama' })).toBeVisible();
		await expect(connections).toHaveCount(1);
		await expect(emptyMessage).not.toBeVisible();
		await expect(connectionType).toHaveValue('');

		// Add an OpenAI official API server
		await chooseFromCombobox(page, 'Connection type', 'OpenAI: Official API');
		await expect(connectionType).toHaveValue('OpenAI: Official API');
		await page.getByText('Add connection').click();
		await expect(connections).toHaveCount(2);
		await expect(connections.locator('.badge', { hasText: 'OpenAI' })).toBeVisible();
		await expect(connectionType).toHaveValue('');

		// Add an OpenAI compatible API server
		await chooseFromCombobox(
			page,
			'Connection type',
			'OpenAI: Compatible servers (i.e. llama.cpp)'
		);
		await expect(connectionType).toHaveValue('OpenAI: Compatible servers (i.e. llama.cpp)');
		await page.getByText('Add connection').click();
		await expect(connections).toHaveCount(3);
		await expect(connections.locator('.badge', { hasText: 'OpenAI-Compatible' })).toBeVisible();
		await expect(connectionType).toHaveValue('');

		// Delete the servers
		await connections.first().getByLabel('Delete server').click();
		await expect(connections).toHaveCount(2);
		await expect(emptyMessage).not.toBeVisible();

		await connections.first().getByLabel('Delete server').click();
		await expect(connections).toHaveCount(1);
		await expect(emptyMessage).not.toBeVisible();

		await connections.first().getByLabel('Delete server').click();
		await expect(connections).toHaveCount(0);
		await expect(emptyMessage).toBeVisible();
	});

	test('it migrates old server settings to new format', async ({ page }) => {
		const toastMessage = page.getByText(
			'Server configuration was updated and needs to be re-verified in "Settings"'
		);
		await page.goto('/');
		await expect(page).toHaveURL('/settings');
		await expect(toastMessage).not.toBeVisible();

		await page.evaluate(() => window.localStorage.removeItem('hollama-servers'));
		let localStorageServers = await page.evaluate(() =>
			window.localStorage.getItem('hollama-servers')
		);
		expect(localStorageServers).toBeNull();

		let localStorageSettings = await page.evaluate(() =>
			window.localStorage.getItem('hollama-settings')
		);
		await page.evaluate(
			(data) => window.localStorage.setItem('hollama-settings', JSON.stringify(data)),
			{
				// Keep the existing settings
				...JSON.parse(localStorageSettings ?? '{}'),

				// Add the keys that are being migrated
				ollamaServer: 'http://localhost:42069',
				ollamaModel: 'llama3.1',
				ollamaServerStatus: 'connected',
				ollamaModels: [],
				openaiServer: 'https://api.openai.com/v1',
				openaiApiKey: 'sk-validapikey'
			}
		);

		// Need to reload for the migrations in `<root>/+layout.svelte` to run
		await page.reload();
		localStorageSettings = await page.evaluate(() =>
			window.localStorage.getItem('hollama-settings')
		);
		localStorageServers = await page.evaluate(() => window.localStorage.getItem('hollama-servers'));
		expect(localStorageServers).toContain('http://localhost:42069');
		expect(localStorageServers).toContain('https://api.openai.com/v1');
		expect(localStorageServers).toContain('sk-validapikey');

		const ollamaConnection = page.getByTestId('server').first();
		await expect(toastMessage).toBeVisible();
		await expect(ollamaConnection).toBeVisible();
		await expect(ollamaConnection.locator('.badge', { hasText: 'Ollama' })).toBeVisible();
		await expect(ollamaConnection.getByLabel('Base URL')).toHaveValue('http://localhost:42069');

		const openaiConnection = page.getByTestId('server').last();
		await expect(openaiConnection).toBeVisible();
		await expect(openaiConnection.locator('.badge', { hasText: 'OpenAI' })).toBeVisible();
		await expect(openaiConnection.getByLabel('Base URL')).toHaveValue('https://api.openai.com/v1');
		await expect(openaiConnection.getByLabel('API Key')).toHaveValue('sk-validapikey');
	});

	test('it redirects to sessions if at least one server is verified', async ({ page }) => {
		await page.goto('/');
		let localStorageServers = await page.evaluate(() =>
			window.localStorage.getItem('hollama-servers')
		);
		expect(localStorageServers).toContain('[]');
		await expect(page).toHaveURL('/settings');

		// Seed and verify an Ollama server
		await mockOllamaModelsResponse(page);
		await page.goto('/');
		await expect(page).toHaveURL('/sessions');

		localStorageServers = await page.evaluate(() => window.localStorage.getItem('hollama-servers'));
		expect(localStorageServers).toContain('isVerified');
		expect(localStorageServers).not.toContain('"isVerified":null');
	});

	test('models available on each server can be toggled on and off', async ({ page }) => {
		await mockOllamaModelsResponse(page);
		await expect(page).toHaveURL('/settings');
		const useModelsFromThisServerCheckbox = page.getByLabel('Use models from this server');
		await expect(useModelsFromThisServerCheckbox).toBeChecked();

		await page.getByTestId('sidebar').getByText('Sessions').click();

		await page.getByTestId('new-session').click();

		const modelCombobox = page.getByLabel('Available models');
		expect(modelCombobox).not.toBeDisabled();

		await modelCombobox.click();
		await expect(page.getByRole('option')).toHaveCount(MOCK_API_TAGS_RESPONSE.models.length);

		await page.getByText('Settings').click();
		await useModelsFromThisServerCheckbox.uncheck();
		await expect(useModelsFromThisServerCheckbox).not.toBeChecked();

		await page.getByTestId('sidebar').getByText('Sessions').click();

		await page.getByTestId('new-session').click();
		await expect(modelCombobox).toBeDisabled();

		await page.getByText('Settings').click();
		await page.getByText('Re-verify').click();
		await expect(useModelsFromThisServerCheckbox).toBeChecked();
	});

	test('a model can be pulled from the ollama library', async ({ page }) => {
		await mockOllamaModelsResponse(page);
		const downloadButton = page.getByRole('button', { name: 'Download model' });
		const modelTagInput = page.getByLabel('Pull model');

		await page.goto('/settings');
		await expect(downloadButton).toBeDisabled();
		await expect(downloadButton).not.toHaveClass(/button--is-loading/);

		await modelTagInput.fill('llama3.1');
		await expect(downloadButton).toBeEnabled();
		await expect(downloadButton).not.toHaveClass(/button--is-loading/);

		await page.route('**/api/pull', (route) => {
			setTimeout(() => route.fulfill({ json: { status: 'pulling model' } }), 1000);
		});
		await downloadButton.click();
		await expect(downloadButton).toBeDisabled();
		await expect(downloadButton).toHaveClass(/button--is-loading/);
		await expect(modelTagInput).toBeDisabled();
		await expect(page.getByText('Pulling model', { exact: false })).toBeVisible();
		await expect(downloadButton).not.toBeDisabled();

		const progressResponse: ProgressResponse = {
			status: 'pulling 5fd4e1793450',
			completed: 25,
			total: 50,
			digest: 'sha256:5fd4e179345020dd97359b0b4fd6ae20c3f918d6b8ed8cda7d855f92561c7ea7'
		};
		await page.route('**/api/pull', (route) => route.fulfill({ json: progressResponse }));
		await downloadButton.click();
		await expect(page.getByText('pulling 5fd4e1793450', { exact: false })).toBeVisible();
		await expect(page.getByText('50%', { exact: false })).toBeVisible();

		const errorResponse: ErrorResponse = { error: 'pull model manifest: file does not exist' };
		await page.route('**/api/pull', (route) => route.fulfill({ json: errorResponse }));
		await downloadButton.click();
		await expect(page.getByText('Sorry, something went wrong', { exact: false })).toBeVisible();
		await expect(
			page.getByText('pull model manifest: file does not exist', { exact: false })
		).toBeVisible();

		const successResponse: StatusResponse = { status: 'success' };
		await page.route('**/api/pull', (route) => route.fulfill({ json: successResponse }));
		await downloadButton.click();
		await expect(page.getByText('Success', { exact: false })).toBeVisible();
		await expect(page.getByText('llama3.1 was downloaded', { exact: false })).toBeVisible();
		await expect(modelTagInput).toHaveValue('');
		await expect(downloadButton).toBeDisabled();
		await expect(modelTagInput).not.toBeDisabled();
	});

	test('can name connections to identify models', async ({ page }) => {
		await mockOpenAIModelsResponse(page, MOCK_OPENAI_MODELS);
		await expect(page).toHaveURL('/settings');

		// Add an OpenAI official API server
		const connections = page.getByTestId('server');
		await expect(connections).toHaveCount(1);
		await expect(connections.first().getByLabel('Label')).toHaveValue('');
		await expect(connections.first().locator('.badge', { hasText: 'OpenAI' })).toBeVisible();

		const connectionVerifiedMessage = page.getByText(
			'Connection has been verified and is ready to use'
		);
		await expect(connectionVerifiedMessage).toHaveCount(1);

		// Add a `llama.cpp` (OpenAI compatible) server
		await chooseFromCombobox(
			page,
			'Connection type',
			'OpenAI: Compatible servers (i.e. llama.cpp)'
		);
		await page.getByText('Add connection').click();
		await expect(page.locator('.badge', { hasText: 'OpenAI-Compatible' })).toBeVisible();
		await expect(connections.last().getByLabel('Label')).toHaveValue('');
		await expect(connections.last().getByLabel('Base URL')).toHaveValue('http://localhost:8080/v1');

		await connections.last().getByLabel('Label').fill('llama.cpp');
		await expect(connections.last().locator('.badge', { hasText: 'llama.cpp' })).toBeVisible();
		await expect(page.locator('.badge', { hasText: 'OpenAI-Compatible' })).not.toBeVisible();

		// Mock a model list for the `llama.cpp` server
		const MOCK_LLAMA_CPP_MODELS: OpenAI.Models.Model[] = [
			{
				id: 'Qwen2.5-32B-Instruct-Q4_K_S.gguf',
				object: 'model',
				created: 1732284764,
				owned_by: 'llamacpp'
			}
		];
		await page.route('http://localhost:8080/v1/models', async (route: Route) => {
			await route.fulfill({ json: { data: MOCK_LLAMA_CPP_MODELS } });
		});
		await connections.last().getByRole('button', { name: 'Verify' }).click();
		await expect(connectionVerifiedMessage).toHaveCount(2);

		await page.getByTestId('sidebar').getByText('Sessions').click();

		await page.getByTestId('new-session').click();
		const modelCombobox = page.getByLabel('Available models');
		expect(modelCombobox).not.toBeDisabled();

		await modelCombobox.click();
		const modelOption = page.locator('.field-combobox-item-label');
		await expect(modelOption).toHaveCount(3);
		await expect(modelOption.last()).toContainText(MOCK_LLAMA_CPP_MODELS[0].id);
		await expect(modelOption.last()).toContainText('llama.cpp');
		await expect(modelOption.last()).not.toContainText('openai-compatible');
	});

	test('new connections are saved with correct serverIds', async ({ page }) => {
		await mockOllamaModelsResponse(page);

		// Check localStorage for correct format
		const serversLocalStorage = await page.evaluate(() =>
			window.localStorage.getItem('hollama-servers')
		);
		const servers = JSON.parse(serversLocalStorage || '[]');
		expect(servers).toHaveLength(1);
		expect(servers[0].id).toMatch(/^[a-z0-9]{6}$/); // Should match format from generateRandomId()

		// Models aren't saved to localStorage until we load a new or existing session
		await page.getByRole('link', { name: 'Sessions' }).click();
		await page.getByTestId('new-session').click();
		await expect(page.getByText('Write a prompt to start a new session')).toBeVisible();

		// Verify the settings has the correct serverId reference
		const settingsLocalStorage = await page.evaluate(() =>
			window.localStorage.getItem('hollama-settings')
		);
		const settings = JSON.parse(settingsLocalStorage || '{}');
		expect(settings.models).toBeDefined();
		expect(settings.models.length).toBeGreaterThan(0);
		expect(settings.models[0].serverId).toBe(servers[0].id);
	});
});
