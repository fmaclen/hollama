import { expect, test } from '@playwright/test';

import { mockTagsResponse } from './utils';

test.beforeEach(async ({ page }) => {
	await mockTagsResponse(page);
});

test('can navigate between session messages and controls', async ({ page }) => {
	await page.goto('/');

	// Seed session
	const MOCK_SESSION = [
		{
			id: '16pk4l',
			model: 'gemma2:27b',
			updatedAt: '2024-09-24T14:24:30.725Z',
			messages: [
				{ role: 'user', content: "What's the NATO phonetic alphabet?" },
				{
					role: 'assistant',
					content:
						'Alpha\n\nBravo\n\nCharlie\n\nDelta\n\nEcho\n\nFoxtrot\n\nGolf\n\nHotel\n\nIndia\n\nJuliet\n\nKilo\n\nLima\n\nMike\n\nNovember\n\nOscar\n\nPapa\n\nQuebec\n\nRomeo\n\nSierra\n\nTango\n\nUniform\n\nVictor\n\nWhiskey\n\nX-ray\n\nYankee\n\nZulu'
				}
			]
		}
	];
	await page.evaluate(
		(data) => window.localStorage.setItem('hollama-sessions', JSON.stringify(data)),
		MOCK_SESSION
	);

	await page.reload();
	await page.getByText('Sessions', { exact: true }).click();
	await page.getByText("What's the NATO phonetic alphabet?").click();
	await expect(page.getByText('Zulu')).toBeVisible();
	await expect(page.getByText('System prompt')).not.toBeVisible();

	// Check it scrolls to the bottom when the page loads
	const sessionHistory = page.locator('.session__history');
	const initialScrollTop = await sessionHistory.evaluate((el) => el.scrollTop);
	await sessionHistory.evaluate((el) => el.scrollTop);

	// Switch to Controls
	await page.getByLabel('Controls').click();
	await expect(page.getByText('Zulu')).not.toBeVisible();
	await expect(page.getByText('System prompt')).toBeVisible();

	await page.getByLabel('Messages').click();
	await expect(page.getByText('Zulu')).toBeVisible();
	await expect(page.getByText('System prompt')).not.toBeVisible();
	// Check it scrolls to the bottom after switching back to Messages
	const currentScrollTop = await sessionHistory.evaluate((el) => el.scrollTop);
	expect(currentScrollTop).toBe(initialScrollTop);
});
