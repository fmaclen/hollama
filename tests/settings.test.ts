import { expect, test } from '@playwright/test';

import { mockOllamaModelsResponse } from './utils';

test.describe('Settings', () => {
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
		page.on('dialog', (dialog) =>
			dialog.accept('Are you sure you want to delete server settings?')
		);
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
		localStorageSettings = await page.evaluate(() =>
			window.localStorage.getItem('hollama-settings')
		);
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

	test.describe('German', () => {
		test.use({ locale: 'de-DE' });
		test('default language is german', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('de-DE');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			await expect(page.getByText('Current version')).not.toBeVisible();
			await expect(page.getByText('Aktuelle Version')).toBeVisible();
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"de"'
			);
		});
	});
});
