import { expect, test } from '@playwright/test';

import { mockOllamaModelsResponse } from './utils';

test.describe('Sidebar on desktop', () => {
	test.beforeEach(async ({ page }) => {
		await mockOllamaModelsResponse(page);
	});

	test('toggle button is visible on all pages', async ({ page }) => {
		// Start on main page
		await page.goto('/');
		await expect(page.getByRole('button', { name: 'Collapse sidebar' })).toBeVisible();

		// Navigate to sessions page via tab
		await page.getByRole('tab', { name: 'Sessions' }).click();
		await expect(page).toHaveURL('/sessions');
		await expect(page.getByRole('button', { name: 'Collapse sidebar' })).toBeVisible();

		// Navigate to knowledge page via tab
		await page.getByRole('tab', { name: 'Knowledge' }).click();
		await expect(page).toHaveURL('/knowledge');
		await expect(page.getByRole('button', { name: 'Collapse sidebar' })).toBeVisible();

		// Navigate to settings page via sidebar link
		await page
			.getByRole('navigation', { name: 'Main navigation' })
			.getByRole('link', { name: 'Settings' })
			.click();
		await expect(page).toHaveURL('/settings');
		await expect(page.getByRole('button', { name: 'Collapse sidebar' })).toBeVisible();

		// Navigate to MOTD page via sidebar link
		await page
			.getByRole('navigation', { name: 'Main navigation' })
			.getByRole('link', { name: 'Motd' })
			.click();
		await expect(page).toHaveURL('/motd');
		await expect(page.getByRole('button', { name: 'Collapse sidebar' })).toBeVisible();
	});

	test('can be toggled open and closed', async ({ page }) => {
		await page.goto('/');

		// Get the sidebar and toggle button using semantic locators
		const sidebar = page.getByRole('navigation', { name: 'Main navigation' });
		const toggleButton = page.getByRole('button', { name: 'Collapse sidebar' });

		// Check initial state - sidebar should be visible on desktop
		await expect(sidebar).toBeVisible();
		await expect(toggleButton).toBeVisible();

		// Click toggle to close sidebar
		await toggleButton.click();

		// Check sidebar is hidden
		await expect(sidebar).not.toBeVisible();

		// Button should now show "Expand sidebar"
		const expandButton = page.getByRole('button', { name: 'Expand sidebar' });
		await expect(expandButton).toBeVisible();

		// Click toggle to open sidebar again
		await expandButton.click();

		// Check sidebar is visible
		await expect(sidebar).toBeVisible();
	});

	test('state persists across page navigation', async ({ page }) => {
		await page.goto('/');

		const sidebar = page.getByRole('navigation', { name: 'Main navigation' });
		const collapseButton = page.getByRole('button', { name: 'Collapse sidebar' });

		// Close sidebar
		await collapseButton.click();
		await expect(sidebar).not.toBeVisible();

		// Navigate to settings directly (since sidebar is collapsed and link not visible)
		await page.goto('/settings');

		// Sidebar should remain closed
		await expect(sidebar).not.toBeVisible();

		// Open sidebar
		const expandButton = page.getByRole('button', { name: 'Expand sidebar' });
		await expandButton.click();
		await expect(sidebar).toBeVisible();

		// Navigate to knowledge via tab
		await page.getByRole('tab', { name: 'Knowledge' }).click();
		await expect(page).toHaveURL('/knowledge');

		// Sidebar should remain open
		await expect(sidebar).toBeVisible();
	});

	test('navigation tabs work correctly', async ({ page }) => {
		await page.goto('/');

		const sessionsTab = page.getByRole('tab', { name: 'Sessions' });
		const knowledgeTab = page.getByRole('tab', { name: 'Knowledge' });

		// Check initial state - should be on sessions
		await expect(sessionsTab).toHaveAttribute('aria-selected', 'true');
		await expect(knowledgeTab).toHaveAttribute('aria-selected', 'false');

		// Click knowledge tab
		await knowledgeTab.click();

		// Should navigate to knowledge page and update tab state
		await expect(page).toHaveURL('/knowledge');
		await expect(knowledgeTab).toHaveAttribute('aria-selected', 'true');
		await expect(sessionsTab).toHaveAttribute('aria-selected', 'false');

		// Click sessions tab
		await sessionsTab.click();

		// Should navigate to sessions page and update tab state
		await expect(page).toHaveURL('/sessions');
		await expect(sessionsTab).toHaveAttribute('aria-selected', 'true');
		await expect(knowledgeTab).toHaveAttribute('aria-selected', 'false');
	});

	test('shows correct content sections', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('tab', { name: 'Sessions' }).click();

		// Check sessions panel is visible
		const sessionsPanel = page.locator('#sessions-panel');
		await expect(sessionsPanel).toBeVisible();
		await expect(sessionsPanel).not.toHaveAttribute('hidden');

		// Check knowledge panel is hidden
		const knowledgePanel = page.locator('#knowledge-panel');
		await expect(knowledgePanel).toHaveAttribute('hidden');

		// Switch to knowledge
		await page.getByRole('tab', { name: 'Knowledge' }).click();

		// Check knowledge panel is visible
		await expect(knowledgePanel).toBeVisible();
		await expect(knowledgePanel).not.toHaveAttribute('hidden');

		// Check sessions panel is hidden
		await expect(sessionsPanel).toHaveAttribute('hidden');
	});

	test('navigation links work correctly', async ({ page }) => {
		await page.goto('/');

		// Test MOTD link in sidebar
		await page
			.getByRole('navigation', { name: 'Main navigation' })
			.getByRole('link', { name: 'Motd' })
			.click();
		await expect(page).toHaveURL('/motd');

		// Test Settings link in sidebar
		await page
			.getByRole('navigation', { name: 'Main navigation' })
			.getByRole('link', { name: 'Settings' })
			.click();
		await expect(page).toHaveURL('/settings');

		// Test GitHub link (should open in new tab)
		const githubLink = page.getByRole('link', { name: 'GitHub' });
		await expect(githubLink).toHaveAttribute('target', '_blank');
		await expect(githubLink).toHaveAttribute('href', 'https://github.com/fmaclen/hollama');
	});

	test('theme toggle button works correctly', async ({ page }) => {
		await page.goto('/');

		// Find theme toggle button by looking for Dark or Light text
		const darkButton = page.getByRole('button', { name: 'Dark' });
		const lightButton = page.getByRole('button', { name: 'Light' });

		// Check which theme button is visible
		const isDarkVisible = await darkButton.isVisible().catch(() => false);
		const isLightVisible = await lightButton.isVisible().catch(() => false);

		if (isDarkVisible) {
			// Currently in light mode, click to go to dark
			await darkButton.click();
			await expect(lightButton).toBeVisible();

			// Click again to go back to light
			await lightButton.click();
			await expect(darkButton).toBeVisible();
		} else if (isLightVisible) {
			// Currently in dark mode, click to go to light
			await lightButton.click();
			await expect(darkButton).toBeVisible();

			// Click again to go back to dark
			await darkButton.click();
			await expect(lightButton).toBeVisible();
		}
	});

	test('new buttons are present', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('tab', { name: 'Sessions' }).click();

		// Should have a "New" button for sessions
		await expect(page.getByRole('link', { name: 'New session' })).toBeVisible();

		// Switch to knowledge
		await page.getByRole('tab', { name: 'Knowledge' }).click();

		// Should have a "New" button for knowledge
		await expect(page.getByRole('link', { name: 'New knowledge' })).toBeVisible();
	});

	test('does not auto-collapse on navigation', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('tab', { name: 'Sessions' }).click();

		const sidebar = page.getByRole('navigation', { name: 'Main navigation' });

		// Sidebar should be visible by default on desktop
		await expect(sidebar).toBeVisible();

		// Navigate to settings
		await page
			.getByRole('navigation', { name: 'Main navigation' })
			.getByRole('link', { name: 'Settings' })
			.click();
		await expect(page).toHaveURL('/settings');

		// Sidebar should remain open on desktop
		await expect(sidebar).toBeVisible();

		// Navigate to MOTD
		await page
			.getByRole('navigation', { name: 'Main navigation' })
			.getByRole('link', { name: 'Motd' })
			.click();
		await expect(page).toHaveURL('/motd');

		// Sidebar should still remain open on desktop
		await expect(sidebar).toBeVisible();
	});
});
