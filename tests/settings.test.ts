import { expect, test } from '@playwright/test';
import type { ErrorResponse, ProgressResponse, StatusResponse } from 'ollama/browser';

import { mockTagsResponse } from './utils';

test.beforeEach(async ({ page }) => {
	await mockTagsResponse(page);
});

test('handles server status updates correctly', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByLabel('Server')).toHaveValue('http://localhost:11434');

	// The starting status is "connected"
	await expect(page.getByText('Disconnected')).not.toBeVisible();
	await expect(page.getByText('Connected', { exact: true })).toBeVisible();
	await expect(page.getByText('Connected', { exact: true })).toHaveClass(/badge--positive/);

	// Mock the API to return an error response
	await page.route('**/api/tags', async (route) => {
		await route.abort();
	});

	// Trigger a new API request by typing in the input field
	await page.getByLabel('Server').clear();

	// Wait for the server status to be updated to "disconnected"
	await expect(page.getByText('Connected', { exact: true })).not.toBeVisible();
	await expect(page.getByText('Disconnected')).toBeVisible();
	await expect(page.getByText('Disconnected')).toHaveClass(/badge--warning/);
});

test('deletes all settings and resets to default values', async ({ page }) => {
	await page.goto('/');

	await page.getByLabel('Server').fill('http://localhost:3000');
	await page.reload();
	await expect(page.getByLabel('Server')).toHaveValue('http://localhost:3000');

	// Check if the settings store is updated with the selected server
	let localStorageValue = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(localStorageValue).toContain('"ollamaServer":"http://localhost:3000"');

	// Click the delete button
	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete server settings?'));
	await page.getByText('Delete all settings').click();

	// Wait for page reload
	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-settings') !== null;
	});

	// Check if the settings has been reset to defaults
	localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageValue).toContain('"ollamaServer":"http://localhost:11434"');
});

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

test('can switch language to spanish and back to english', async ({ page }) => {
	const languageCombobox = page.getByLabel('Language');
	const idiomaCombobox = page.getByLabel('Idioma');

	await page.goto('/settings');
	await expect(idiomaCombobox).not.toBeVisible();
	await expect(languageCombobox).toBeVisible();
	await expect(languageCombobox).toHaveValue('English');
	await expect(page.getByText('Servers')).toBeVisible();
	await expect(page.getByText('Servidores')).not.toBeVisible();

	await languageCombobox.click();

	await expect(page.getByRole('option', { name: 'English' })).toBeVisible();
	await expect(page.getByRole('option', { name: 'Español' })).toBeVisible();
	await page.getByRole('option', { name: 'Español' }).click();

	await expect(languageCombobox).not.toBeVisible();
	await expect(idiomaCombobox).toHaveValue('Español');
	let localStorageValue = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(localStorageValue).toContain('"userLanguage":"es"');

	await expect(page.getByText('Servidores')).toBeVisible();
	await expect(page.getByText('Servers')).not.toBeVisible();

	await idiomaCombobox.click();
	await page.getByRole('option', { name: 'English' }).click();

	localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageValue).toContain('"userLanguage":"en"');
	await expect(page.getByText('Servers')).toBeVisible();
	await expect(page.getByText('Servidores')).not.toBeVisible();
});

test.describe('Locales', () => {
	test.describe('Spanish', () => {
		test.use({ locale: 'es-ES' });
		test('default language is spanish', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('es-ES');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			await expect(page.getByText('Servers')).not.toBeVisible();
			await expect(page.getByText('Servidores')).toBeVisible();
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"es"'
			);
		});
	});

	test.describe('Japanese', () => {
		test.use({ locale: 'ja-JP' });
		test('default language is japanese', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('ja-JP');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			await expect(page.getByText('Servers')).not.toBeVisible();
			await expect(page.getByText('サーバー')).toBeVisible();
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"ja"'
			);
		});
	});

	test.describe('Turkish', () => {
		test.use({ locale: 'tr-TR' });
		test('default language is turkish', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('tr-TR');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			await expect(page.getByText('Servers')).not.toBeVisible();
			await expect(page.getByText('Sunucular')).toBeVisible();
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"tr"'
			);
		});
	});

	test.describe('Portuguese', () => {
		test.use({ locale: 'pt-BR' });
		test('default language is portuguese', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('pt-BR');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			await expect(page.getByText('Servers')).not.toBeVisible();
			await expect(page.getByText('Servidores')).toBeVisible();
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"pt-br"'
			);
		});
	});

	test.describe('Simplified Chinese', () => {
		test.use({ locale: 'zh-CN' });
		test('default language is simplified chinese', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('zh-CN');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			await expect(page.getByText('Servers')).not.toBeVisible();
			await expect(page.getByText('服务器')).toBeVisible();
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"zh-cn"'
			);
		});
	});

	test.describe('Vietnamese', () => {
		test.use({ locale: 'vi' });
		test('default language is vietnamese', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('vi');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			await expect(page.getByText('Servers')).not.toBeVisible();
			await expect(page.getByText('Máy chủ')).toBeVisible();
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"vi"'
			);
		});
	});
});
