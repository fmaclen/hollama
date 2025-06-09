import { expect, test } from '@playwright/test';

import { mockOllamaModelsResponse } from './utils';

test.describe('Locales', () => {
	test('can switch language to spanish and back to english', async ({ page }) => {
		await mockOllamaModelsResponse(page);
		const languageCombobox = page.getByLabel('Language');
		const idiomaCombobox = page.getByLabel('Idioma');

		await page.goto('/settings');
		await expect(idiomaCombobox).not.toBeVisible();
		await expect(languageCombobox).toBeVisible();
		await expect(languageCombobox).toHaveValue('English');
		await expect(page.getByTestId('data-management-hollama-servers')).toContainText('Servers');
		await expect(page.getByTestId('data-management-hollama-servers')).not.toContainText(
			'Servidores'
		);

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

		await expect(page.getByTestId('data-management-hollama-servers')).toContainText('Servidores');
		await expect(page.getByTestId('data-management-hollama-servers')).not.toContainText('Servers');

		await idiomaCombobox.click();
		await page.getByRole('option', { name: 'English' }).click();

		localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
		expect(localStorageValue).toContain('"userLanguage":"en"');
		await expect(page.getByTestId('data-management-hollama-servers')).toContainText('Servers');
		await expect(page.getByTestId('data-management-hollama-servers')).not.toContainText(
			'Servidores'
		);
	});

	test.describe('Spanish', () => {
		test.use({ locale: 'es-ES' });
		test('default language is spanish', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('es-ES');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			await expect(page.getByText('Servers')).not.toBeVisible();
			await expect(page.getByTestId('data-management-hollama-servers')).toContainText('Servidores');
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
			await expect(page.getByTestId('data-management-hollama-servers')).toContainText('サーバー');
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
			await expect(page.getByTestId('data-management-hollama-servers')).toContainText('Sunucular');
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
			await expect(page.getByTestId('data-management-hollama-servers')).toContainText('Servidores');
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
			await expect(page.getByTestId('data-management-hollama-servers')).toContainText('服务器');
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
			await expect(page.getByTestId('data-management-hollama-servers')).toContainText('Máy chủ');
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"vi"'
			);
		});
	});

	test.describe('German', () => {
		test.use({ locale: 'de-DE' });
		test('default language is german', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('de-DE');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			// We asert "current version" because "Servers" is the same in German and English
			await expect(page.getByText('Current version')).not.toBeVisible();
			await expect(page.getByText('Aktuelle Version')).toBeVisible();
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"de"'
			);
		});
	});

	test.describe('French', () => {
		test.use({ locale: 'fr-FR' });
		test('default language is French', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('fr-FR');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			await expect(page.getByText('Servers')).not.toBeVisible();
			await expect(page.getByTestId('data-management-hollama-servers')).toContainText('Serveurs');
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"fr"'
			);
		});
	});
	test.describe('Georgian', () => {
		test.use({ locale: 'ka-GE' });
		test('default language is Georgian', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('ka-GE');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			await expect(page.getByText('Servers')).not.toBeVisible();
			await expect(page.getByText('სერვერები')).toBeVisible();
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"ka"'
			);
		});
	});
});
