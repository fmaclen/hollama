import { expect, test } from '@playwright/test';
import { mockTagsResponse } from './utils';

test.beforeEach(async ({ page }) => {
	await mockTagsResponse(page);
});

test('seed data and take screenshots for README.md', async ({ page }) => {
	await page.goto('/');
	await page.getByLabel('Model').selectOption('openhermes2.5-mistral:latest');
	await page.screenshot({ path: 'docs/settings.png', fullPage: true });

	await page.goto('/sessions/ulxz6l'); // Visiting a fake session id so it doesn't change from test to test
	await expect(page.getByText('No sessions')).toBeVisible();
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
	await expect(page.getByText('No sessions')).not.toBeVisible();
	await expect(page.getByTestId('session-item')).toHaveCount(2);

	await page.getByText('Write a Python function').click();
	await expect(page.getByText("Here's a basic function")).toBeVisible();
	await expect(page.getByLabel("Model")).not.toBeVisible();
	await expect(page.getByText('No knowledge')).not.toBeVisible();
	await page.screenshot({ path: 'docs/session.png', fullPage: true });

	await page.getByText("Knowledge").click();
	await expect(page.getByText('No knowledge')).toBeVisible();
	await expect(page.getByText('Create new knowlege or choose one from the list')).toBeVisible();

	// State 2 knowledge
	await page.evaluate(() => window.localStorage.setItem(
		'hollama-knowledge',
		JSON.stringify([
			{
				id: "f9y6cb",
				name: "Alba & Watson combat sheet",
				content: "Watson:\n- Phase Punches, Electric Fist Charge\n- High-altitude cardio, electric resistance training\n- Stormfront Strike: Electrified punch/kick combo.\n- Shockwave Palm Slap: Ripple strike to disorient.\n\nAlba:\n- Defeated Lightning Line in Electric Arena using shockwaves.\n- Meditation during thunderstroms for mental focus on electric energies.\n- Omega-3 diet, lightning-charged seafood.\n- Gloves: Electrical impact microcapsules; boots with insulating footpads.",
				updatedAt: "2024-07-01T17:14:11.832Z"
			},
			{
				id: "uv96i4",
				name: "fmaclen/hollama: Directory tree",
				content: "```\n.\n├── Dockerfile\n├── LICENSE\n├── README.md\n├── build\n├── docs\n├── node_modules\n├── package-lock.json\n├── package.json\n├── playwright.config.ts\n├── postcss.config.cjs\n├── src\n├── static\n├── svelte.config.js\n├── tailwind.config.js\n├── test-results\n├── tests\n├── tsconfig.json\n└── vite.config.ts\n```",
				updatedAt: "2024-07-01T17:17:40.789Z"
			}
		])
	));

	await page.reload();
	await expect(page.getByText('No knowledge')).not.toBeVisible();

	await page.getByText('Directory tree').click();
	await page.screenshot({ path: 'docs/knowledge.png', fullPage: true });
});
