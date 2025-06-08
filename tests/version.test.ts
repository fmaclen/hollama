import { expect, test } from '@playwright/test';

import { GITHUB_RELEASES_API } from '$lib/github';

import { mockOllamaModelsResponse } from './utils';

const currentVersion = process.env.npm_package_version;
const MOCK_NEWER_VERSION = '999.0.0';

test.beforeEach(async ({ page }) => {
	await mockOllamaModelsResponse(page);

	// NOTE: This is an intentionally broken response from the Github releases API
	// to ensure we don't hit the real API.
	// Every test should mock it's own response based on the test's needs.
	await page.route(GITHUB_RELEASES_API, (route) => route.fulfill());
});

test('performs manual update check regardless of auto-update preference', async ({ page }) => {
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

test('shows "up-to-date" message when on latest version', async ({ page }) => {
	await page.route(GITHUB_RELEASES_API, (route) =>
		route.fulfill({ json: [{ tag_name: currentVersion }] })
	);

	await page.goto('/settings');
	await expect(page.getByText('You are on the latest version')).not.toBeVisible();

	await page.getByRole('button', { name: 'Check now' }).click();
	await expect(page.getByText('You are on the latest version')).toBeVisible();
});

test('displays Docker-specific update instructions in Docker environment', async ({ page }) => {
	await page.route('**/api/metadata', (route) =>
		route.fulfill({
			json: {
				currentVersion: currentVersion,
				isDesktop: false,
				isDocker: true
			}
		})
	);

	await page.route(GITHUB_RELEASES_API, (route) =>
		route.fulfill({ json: [{ tag_name: MOCK_NEWER_VERSION }] })
	);

	await page.goto('/settings');
	const checkNowButton = page.getByRole('button', { name: 'Check now' });
	await checkNowButton.click();
	await expect(page.getByText('How to update Docker container?')).toBeVisible();
});

test('shows download link for updates in Desktop environment', async ({ page }) => {
	await page.route('**/api/metadata', (route) =>
		route.fulfill({
			json: {
				currentVersion: currentVersion,
				isDesktop: true,
				isDocker: false
			}
		})
	);

	await page.route(GITHUB_RELEASES_API, (route) =>
		route.fulfill({ json: [{ tag_name: MOCK_NEWER_VERSION }] })
	);

	await page.goto('/settings');
	const checkNowButton = page.getByRole('button', { name: 'Check now' });
	await checkNowButton.click();
	await expect(page.getByText('Go to downloads')).toBeVisible();
});

test('shows error message when update check fails', async ({ page }) => {
	await page.route(GITHUB_RELEASES_API, (route) => route.abort('failed'));
	await page.goto('/settings');
	const checkNowButton = page.getByRole('button', { name: 'Check now' });
	await checkNowButton.click();
	await expect(page.getByText("Couldn't check for updates automatically")).toBeVisible();
	await expect(page.getByRole('link', { name: 'Go to releases' })).toBeVisible();
});

test('performs automatic update check on navigation when enabled', async ({ page }) => {
	await page.route('**/api/metadata', (route) =>
		route.fulfill({
			json: {
				currentVersion: currentVersion,
				isDesktop: true,
				isDocker: false
			}
		})
	);

	await page.route(GITHUB_RELEASES_API, (route) =>
		route.fulfill({ json: [{ tag_name: currentVersion }] })
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
	await expect(autoUpdateCheckbox).toBeChecked();
	expect(localStorageValue).toContain('"autoCheckForUpdates":true');

	await page.route('**/api/metadata', (route) =>
		route.fulfill({
			json: {
				currentVersion: MOCK_NEWER_VERSION,
				isDesktop: true,
				isDocker: false
			}
		})
	);

	// HACK: Due to weird Playwright behavior (likely a race condition), we can't
	// we can't use a click event to navigate to the knowledge page, so we have to
	// use a page.goto() which refreshes the page. Then we can click on another section.
	await page.goto('/knowledge');
	localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageValue).toContain('"autoCheckForUpdates":true');
	expect(localStorageValue).toContain('"lastUpdateCheck":null');
	await expect(autoUpdateCheckbox).not.toBeVisible();

	const settingsLink = page.getByLabel('Main navigation').getByRole('link', { name: 'Settings' });
	await expect(settingsLink).not.toHaveClass(/before:bg-warning/);

	await page.getByRole('link', { name: 'Motd' }).click();
	await expect(autoUpdateCheckbox).not.toBeVisible();
	await expect(settingsLink).toHaveClass(/before:bg-warning/);
	await expect(page.getByText('A newer version is available')).not.toBeVisible();

	localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageValue).not.toContain('"lastUpdateCheck":null');

	await settingsLink.click();
	await expect(page.getByText('A newer version is available')).toBeVisible();
	await expect(settingsLink).not.toHaveClass(/before:bg-warning/);
	await expect(autoUpdateCheckbox).toBeVisible();
	localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
});

test('skips automatic update check on navigation when disabled', async ({ page }) => {
	await page.route('**/api/metadata', (route) =>
		route.fulfill({
			json: {
				currentVersion: currentVersion,
				isDesktop: true,
				isDocker: false
			}
		})
	);

	await page.route(GITHUB_RELEASES_API, (route) =>
		route.fulfill({ json: [{ tag_name: MOCK_NEWER_VERSION }] })
	);

	await page.goto('/sessions');
	let localStorageValue = await page.evaluate(() =>
		window.localStorage.getItem('hollama-settings')
	);
	expect(localStorageValue).toContain('"autoCheckForUpdates":false');
	expect(localStorageValue).toContain('"lastUpdateCheck":null');

	const settingsLink = page.getByLabel('Main navigation').getByRole('link', { name: 'Settings' });
	await expect(settingsLink).not.toHaveClass(/before:bg-warning/);

	await page.getByRole('tab', { name: 'Knowledge' }).click();
	await expect(settingsLink).not.toHaveClass(/before:bg-warning/);

	await settingsLink.click();
	await expect(page.getByLabel('Automatically check for updates')).not.toBeChecked();
	await expect(page.getByText('A newer version is available')).not.toBeVisible();

	// Confirmm that there was an update available
	await page.getByText('Check now').click();
	await expect(page.getByText('A newer version is available')).toBeVisible();

	localStorageValue = await page.evaluate(() => window.localStorage.getItem('hollama-settings'));
	expect(localStorageValue).toContain('"autoCheckForUpdates":false');
	expect(localStorageValue).not.toContain('"lastUpdateCheck":null');
});
