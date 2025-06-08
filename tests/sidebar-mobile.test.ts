import { expect, test } from '@playwright/test';

import { mockOllamaModelsResponse } from './utils';

test.describe('Sidebar on mobile', () => {
	test.beforeEach(async ({ page }) => {
		await mockOllamaModelsResponse(page);
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });
	});

	test('auto-collapses when navigating to settings', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('tab', { name: 'Sessions' }).click();

		const sidebar = page.getByRole('navigation', { name: 'Main navigation' });

		// Check if sidebar is visible, if not expand it
		const isVisible = await sidebar.isVisible();
		if (!isVisible) {
			const expandButton = page.getByRole('button', { name: 'Expand sidebar' });
			await expandButton.click();
		}
		await expect(sidebar).toBeVisible();

		// Navigate to settings
		await page
			.getByRole('navigation', { name: 'Main navigation' })
			.getByRole('link', { name: 'Settings' })
			.click();
		await expect(page).toHaveURL('/settings');

		// Sidebar should auto-collapse on mobile
		await expect(sidebar).not.toBeVisible();
	});

	test('auto-collapses when navigating to MOTD', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('tab', { name: 'Sessions' }).click();

		const sidebar = page.getByRole('navigation', { name: 'Main navigation' });

		// Check if sidebar is visible, if not expand it
		const isVisible = await sidebar.isVisible();
		if (!isVisible) {
			const expandButton = page.getByRole('button', { name: 'Expand sidebar' });
			await expandButton.click();
		}
		await expect(sidebar).toBeVisible();

		// Navigate to MOTD
		await page
			.getByRole('navigation', { name: 'Main navigation' })
			.getByRole('link', { name: 'Motd' })
			.click();
		await expect(page).toHaveURL('/motd');

		// Sidebar should auto-collapse on mobile
		await expect(sidebar).not.toBeVisible();
	});

	test('stays open when switching between sessions and knowledge', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('tab', { name: 'Sessions' }).click();

		const sidebar = page.getByRole('navigation', { name: 'Main navigation' });

		// Check if sidebar is visible, if not expand it
		const isVisible = await sidebar.isVisible();
		if (!isVisible) {
			const expandButton = page.getByRole('button', { name: 'Expand sidebar' });
			await expandButton.click();
		}
		await expect(sidebar).toBeVisible();

		// Switch to knowledge
		await page.getByRole('tab', { name: 'Knowledge' }).click();
		await expect(page).toHaveURL('/knowledge');

		// Sidebar should remain open (segmented navigation)
		await expect(sidebar).toBeVisible();

		// Switch back to sessions
		await page.getByRole('tab', { name: 'Sessions' }).click();
		await expect(page).toHaveURL('/sessions');

		// Sidebar should still remain open
		await expect(sidebar).toBeVisible();
	});

	test('auto-collapses when navigating to specific session', async ({ page }) => {
		// Seed a session
		const MOCK_SESSION = [
			{
				id: '16pk4l',
				model: 'gemma2:27b',
				updatedAt: '2024-09-24T14:24:30.725Z',
				messages: [
					{ role: 'user', content: "What's the NATO phonetic alphabet?" },
					{ role: 'assistant', content: 'Alpha, Bravo, Charlie...' }
				]
			}
		];
		await page.evaluate(
			(data) => window.localStorage.setItem('hollama-sessions', JSON.stringify(data)),
			MOCK_SESSION
		);

		await page.goto('/');
		await page.getByRole('tab', { name: 'Sessions' }).click();

		const sidebar = page.getByRole('navigation', { name: 'Main navigation' });

		// Check if sidebar is visible, if not expand it
		const isVisible = await sidebar.isVisible();
		if (!isVisible) {
			const expandButton = page.getByRole('button', { name: 'Expand sidebar' });
			await expandButton.click();
		}
		await expect(sidebar).toBeVisible();

		// Click on a specific session
		await page.getByText("What's the NATO phonetic alphabet?").click();
		await expect(page).toHaveURL('/sessions/16pk4l');

		// Sidebar should auto-collapse when navigating to specific session
		await expect(sidebar).not.toBeVisible();
	});
});
