import { expect, test } from '@playwright/test';

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
			await expect(page.getByText('服务器', { exact: true })).toBeVisible();
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

	test.describe('French', () => {
		test.use({ locale: 'fr-FR' });
		test('default language is French', async ({ page }) => {
			await page.goto('/settings');
			expect(await page.evaluate(() => navigator.language)).toBe('fr-FR');

			await page.evaluate(() => window.localStorage.clear());
			await page.reload();
			await expect(page.getByText('Servers')).not.toBeVisible();
			await expect(page.getByText('Serveurs')).toBeVisible();
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
			await expect(page.getByText('Serveurs')).toBeVisible();
			expect(await page.evaluate(() => window.localStorage.getItem('hollama-settings'))).toContain(
				'"userLanguage":"ka"'
			);
		});
	});
});
