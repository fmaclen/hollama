import { expect, test } from '@playwright/test';

import { mockOllamaModelsResponse } from './utils';

test.beforeEach(async ({ page }) => {
	await mockOllamaModelsResponse(page);
});

test('deletes all settings and resets to default values', async ({ page }) => {
	await expect(page.getByLabel('Base URL')).toHaveValue('http://localhost:11434');

	// Check if the settings store is updated with the selected server
	let localStorageServers = await page.evaluate(() =>
		window.localStorage.getItem('hollama-servers')
	);
	expect(localStorageServers).toContain('"baseUrl":"http://localhost:11434"');

	// Change theme to dark mode
	await page.getByText('Dark').click();
	await expect(page.getByText('Light')).toBeVisible();
	await expect(page.getByText('Dark')).not.toBeVisible();

	// Check the settings have been saved to localStorage
	let localStorageSettings = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(localStorageSettings).toContain('"userTheme":"dark"');

	// Click the delete button
	page.on('dialog', (dialog) => dialog.accept('Are you sure you want to delete server settings?'));
	await page.getByText('Delete all settings').click();

	// Wait for page reload
	await page.waitForFunction(() => {
		return window.localStorage.getItem('hollama-servers') !== null;
	});

	// Check the servers have been removed completely
	localStorageServers = await page.evaluate(() => window.localStorage.getItem('hollama-servers'));
	expect(localStorageServers).not.toContain('"baseUrl":"http://localhost:11434"');
	await expect(page.getByText('Base URL')).not.toBeVisible();

	// Check the settings have been reset to defaults
	localStorageSettings = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageSettings).not.toContain('"userTheme":"dark"');
	await expect(page.getByText('Dark')).toBeVisible();
	await expect(page.getByText('Light')).not.toBeVisible();
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
