import { expect, test } from '@playwright/test';
import type { ErrorResponse, ProgressResponse, StatusResponse } from 'ollama/browser';

import { chooseFromCombobox } from './utils';

test.describe('Servers', () => {
	test('it migrates old server settings to new format', async ({ page }) => {
		const toastMessage = page.getByText('Server configuration was updated and needs to be re-verified in "Settings"');
		await page.goto('/');
		await expect(page).toHaveURL('/settings');
		await expect(toastMessage).not.toBeVisible();

		await page.evaluate(() =>
			window.localStorage.removeItem('hollama-servers')
		);
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
		localStorageServers = await page.evaluate(() =>
			window.localStorage.getItem('hollama-servers')
		);
		expect(localStorageServers).toContain('http://localhost:42069');
		expect(localStorageServers).toContain('https://api.openai.com/v1');
		expect(localStorageServers).toContain('sk-validapikey');

		const ollamaConnection = page.locator('.connection').first();
		await expect(toastMessage).toBeVisible();
		await expect(ollamaConnection).toBeVisible();
		await expect(ollamaConnection.getByText(/Ollama/)).toBeVisible();
		await expect(ollamaConnection.getByLabel('Base URL')).toHaveValue('http://localhost:42069');

		const openaiConnection = page.locator('.connection').last();
		await expect(openaiConnection).toBeVisible();
		await expect(openaiConnection.getByText(/OpenAI/)).toBeVisible();
		await expect(openaiConnection.getByLabel('Base URL')).toHaveValue('https://api.openai.com/v1');
		await expect(openaiConnection.getByLabel('API Key')).toHaveValue('sk-validapikey');
	});

	test.skip('it redirects to sessions if at least one server is verified', async ({ page }) => {});

	test.skip('can add and remove multiple server connections', async ({ page }) => {
		await page.goto('/settings');
		await expect(page.getByText('Servers')).toBeVisible();

		// An Ollama server is already added by default
		const connections = page.locator('.connection');
		await expect(connections.getByText('Ollama')).toBeVisible();
		await expect(connections).toHaveCount(1);

		// Add an OpenAI official API server
		await chooseFromCombobox(page, 'Connection type', 'OpenAI: Official API');
		await page.getByText('Add connection').click();
		await expect(connections).toHaveCount(2);
		await expect(connections.getByText('OpenAI')).toBeVisible();

		// Add an OpenAI compatible API server
		await chooseFromCombobox(
			page,
			'Connection type',
			'OpenAI: Compatible servers (i.e. llama.cpp)'
		);
		await page.getByText('Add connection').click();
		await expect(connections).toHaveCount(3);
		await expect(connections.getByText('OpenAI-Compatible')).toBeVisible();
	});

	test.skip('models available on each server can be toggled on and off', async ({ page }) => {});

	test.skip('can name connections to identify models', async ({ page }) => {});

	test('a model can be pulled from the ollama library', async ({ page }) => {
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
});
