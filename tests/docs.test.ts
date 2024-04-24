import { expect, test } from '@playwright/test';
import { mockTagsResponse } from './utils';

test.beforeEach(async ({ page }) => {
	await mockTagsResponse(page);
});

test('seed data and take screenshots for README.md', async ({ page }) => {
	await page.goto('/');
	await page.getByLabel('Model').selectOption('openhermes2.5-mistral:latest');
	await page.screenshot({ path: 'docs/settings.png', fullPage: true });
	
	await page.getByText('New session').click();
	await expect(page.getByText('Write a prompt to start a new session')).toBeVisible();
	await page.screenshot({ path: 'docs/session-new.png', fullPage: true });

	// Stage 2 sessions
	await page.evaluate(() => window.localStorage.setItem(
		'hollama-sessions',
		JSON.stringify([
			{
				id: 'u4pozr',
				model: 'openhermes2.5-mistral:latest',
				messages: [
					{
						role: 'user',
						content: 'Write a Python function to calculate the odds of the winner in a fight between Emma Watson and Jessica Alba'
					},
					{
						role: 'ai',
						content: "Here's a basic function that takes the age, height, weight, and fighting experience of both individuals as input and returns the difference between their ages, heights, and weights.\n```python\ndef calculate_odds(emma_age, emma_height, emma_weight, emma_experience, jessica_age, jessica_height, jessica_weight, jessica_experience):\n    emma_stats = {'age': emma_age, 'height': emma_height, 'weight': emma_weight, 'experience': emma_experience}\n    jessica_stats = {'age': jessica_age, 'height': jessica_height, 'weight': jessica_weight, 'experience': jessica_experience}\n    \n    # Calculate the differences between their stats\n    age_difference = abs(emma_stats['age'] - jessica_stats['age'])\n    height_difference = abs(emma_stats['height'] - jessica_stats['height'])\n    weight_difference = abs(emma_stats['weight'] - jessica_stats['weight'])\n    \n    # Return the differences as a tuple\n    return (age_difference, height_difference, weight_difference)\n```\nYou can use this function to compare Emma Watson and Jessica Alba by providing their respective statistics as inputs."
					}
				],
				context: []
			},
			{
				id: 'bbpz8o',
				model: 'gemma:7b',
				messages: [
					{
						role: 'user',
						content: 'What is the meaning of life?'
					},
					{
						role: 'ai',
						content: '**The meaning of life is a complex and multifaceted question that has been pondered by philosophers, theologians, and individuals throughout history.** Good luck with that.'
					}
				],
				context: []
			}
		])
	));

	await page.reload();
	await expect(page.getByText('No sessions in history')).not.toBeVisible();
	await expect(page.getByTestId('session-item')).toHaveCount(2);

	await page.getByText('Write a Python function').click();
	await expect(page.getByText("Here's a basic function")).toBeVisible();

	await page.screenshot({ path: 'docs/session.png', fullPage: true });
});
