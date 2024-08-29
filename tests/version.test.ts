import { expect, test } from '@playwright/test';
import { GITHUB_RELEASES_API } from '$lib/github';

const currentVersion = process.env.npm_package_version;
const MOCK_NEWER_VERSION = '999.0.0';

test.beforeEach(async ({ page }) => {
	// NOTE:
	// Every test should mock the Github releases API response
	// to ensure we don't hit the real API in the tests.
	await page.route(GITHUB_RELEASES_API, (route) =>
		route.fulfill({
			json: [{ tag_name: MOCK_NEWER_VERSION }]
		})
	);
});

test('manual update check works regardless of auto-update setting', async ({ page }) => {
	await page.route(GITHUB_RELEASES_API, (route) =>
		route.fulfill({
			json: [{ tag_name: MOCK_NEWER_VERSION }]
		})
	);

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

test('displays appropriate message when on latest version', async ({ page }) => {
	await page.route(GITHUB_RELEASES_API, (route) =>
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

test('displays error message when unable to check for updates', async ({ page }) => {
	await page.route(GITHUB_RELEASES_API, (route) => route.abort('failed'));
	await page.goto('/settings');
	const checkNowButton = page.getByRole('button', { name: 'Check now' });
	await checkNowButton.click();
	await expect(page.getByText("Couldn't check for updates automatically.")).toBeVisible();
	await expect(page.getByRole('link', { name: 'Go to releases' })).toBeVisible();
});

test.skip('update check on navigation when auto-update is enabled', async ({ page }) => {
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
	const autoUpdateCheckbox = page.getByLabel('Automatically check for updates');
	let localStorageValue = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(autoUpdateCheckbox).not.toBeChecked();
	expect(localStorageValue).toContain('"autoCheckForUpdates":false');
	
	// Check it toggles the local storage setting
	await autoUpdateCheckbox.click();
	localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(autoUpdateCheckbox).toBeChecked();
	expect(localStorageValue).toContain('"autoCheckForUpdates":true');
	
	const settingsLink = page.locator('.layout__a', { hasText: 'Settings' });
	await expect(settingsLink).not.toHaveClass(/ layout__a--badge/);

	await page.route('**/api/metadata', (route) =>
		route.fulfill({
			json: {
				currentVersion: MOCK_NEWER_VERSION,
				isDesktop: true,
				isDocker: false
			}
		})
	);

	await page.locator('.layout__a', { hasText: 'Sessions' }).click();
	await expect(settingsLink).toHaveClass(/ layout__a--badge/);

	await settingsLink.click();
	await expect(settingsLink).not.toHaveClass(/ layout__a--badge/);
});

test.skip('no update check on navigation when auto-update is disabled', async ({ page }) => {
	await page.goto('/settings');
	const localStorageValue = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(localStorageValue).toContain('"autoCheckForUpdates":false');
	await expect(page.getByLabel('Automatically check for updates')).not.toBeChecked();

	await page.goto('/sessions');
	// TODO: should NOT see a notification baged next to the Settings link signaling that an update is available
});
