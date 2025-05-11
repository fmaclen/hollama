import { expect, test } from '@playwright/test';

import { mockOllamaModelsResponse } from './utils';

test.describe('Settings', () => {
	test.beforeEach(async ({ page }) => {
		await mockOllamaModelsResponse(page);
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
});
