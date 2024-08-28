import { expect, test } from '@playwright/test';
import { mockTagsResponse } from './utils';

const currentVersion = process.env.npm_package_version;
const MOCK_NEWER_VERSION = '999.0.0';

test.beforeEach(async ({ page }) => {
	await mockTagsResponse(page);
	await page.route('**/api/metadata', (route) =>
		route.fulfill({
			json: {
				currentVersion: currentVersion,
				isDesktop: false,
				isDocker: false
			}
		})
	);

	await page.route('https://api.github.com/repos/fmaclen/hollama/releases', (route) =>
		route.fulfill({
			json: [{ tag_name: MOCK_NEWER_VERSION }]
		})
	);
});

test('auto-update preference is saved to store', async ({ page }) => {
	await page.goto('/settings');
	const autoUpdateCheckbox = page.getByLabel('Automatically check for updates');
	await autoUpdateCheckbox.click();
	const localStorageValue = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(localStorageValue).toContain('"autoCheckForUpdates":false');

	await autoUpdateCheckbox.click();
	const updatedLocalStorageValue = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(updatedLocalStorageValue).toContain('"autoCheckForUpdates":true');
});

test('manual update check works regardless of auto-update setting', async ({ page }) => {
	await page.goto('/settings');
	const autoUpdateCheckbox = page.getByLabel('Automatically check for updates');
	const checkNowButton = page.getByRole('button', { name: 'Check now' });
	await autoUpdateCheckbox.uncheck();
	await checkNowButton.click();
	await expect(page.getByText(`A newer version is available ${MOCK_NEWER_VERSION}`)).toBeVisible();

	await autoUpdateCheckbox.check();
	await page.reload();
	await checkNowButton.click();
	await expect(page.getByText(`A newer version is available ${MOCK_NEWER_VERSION}`)).toBeVisible();
});

test('no update check on navigation when auto-update is disabled', async ({ page }) => {
	await page.goto('/settings');
	const autoUpdateCheckbox = page.getByLabel('Automatically check for updates');
	await autoUpdateCheckbox.uncheck();
	await page.goto('/sessions');
	await expect(page.getByText(`A newer version is available ${MOCK_NEWER_VERSION}`)).not.toBeVisible();
});

test('displays appropriate message when on latest version', async ({ page }) => {
	await page.route('https://api.github.com/repos/fmaclen/hollama/releases', (route) =>
		route.fulfill({ json: [{ tag_name: currentVersion }] })
	);
	await page.goto('/settings');
	const checkNowButton = page.getByRole('button', { name: 'Check now' });
	await checkNowButton.click();
	await expect(page.getByText('You are on the latest version.')).toBeVisible();
});

test('handles Docker environment correctly', async ({ page }) => {
	await page.route('**/api/metadata', (route) =>
		route.fulfill({
			json: {
				currentVersion: currentVersion,
				isDesktop: false,
				isDocker: true
			}
		})
	);
	await page.goto('/settings');
	const checkNowButton = page.getByRole('button', { name: 'Check now' });
	await checkNowButton.click();
	await expect(page.getByText('How to update Docker container?')).toBeVisible();
});

test('handles Desktop environment correctly', async ({ page }) => {
	await page.route('**/api/metadata', (route) =>
		route.fulfill({
			json: {
				currentVersion: currentVersion,
				isDesktop: true,
				isDocker: false
			}
		})
	);
	await page.goto('/settings');
	const checkNowButton = page.getByRole('button', { name: 'Check now' });
	await checkNowButton.click();
	await expect(page.getByText('Go to downloads')).toBeVisible();
});

test.skip('update check on navigation when auto-update is enabled', async ({ page }) => {
	await page.goto('/settings');
	const autoUpdateCheckbox = page.getByLabel('Automatically check for updates');
	await autoUpdateCheckbox.check();
	await page.goto('/sessions');
	// TODO: should see a notification baged next to the Settings link signaling that an update is available
});
