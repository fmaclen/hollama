import { expect, test } from '@playwright/test';

import { MOCK_API_TAGS_RESPONSE, mockTagsResponse } from './utils';

test.describe('FieldSelect', () => {
	test('filters options, shows selected value, and allows clearing', async ({ page }) => {
		await mockTagsResponse(page);
		await page.goto('/sessions/qbhc0q');

		const modelCombobox = page.getByLabel('Available models');

		// Check initial state
		await expect(modelCombobox).toBeVisible();
		await expect(modelCombobox).toHaveAttribute('placeholder', 'Search');

		// Open the dropdown
		await modelCombobox.click();

		// Check that all options are visible
		await expect(page.getByRole('option')).toHaveCount(MOCK_API_TAGS_RESPONSE.models.length);

		// Filter options
		await modelCombobox.fill('llama');
		await expect(page.getByRole('option')).toHaveCount(1);
		await expect(page.getByTitle('Clear')).not.toBeVisible();

		// Select an option
		await page.getByRole('option', { name: MOCK_API_TAGS_RESPONSE.models[0].name }).click();
		await expect(modelCombobox).toHaveValue(MOCK_API_TAGS_RESPONSE.models[0].name);
		await expect(page.getByTitle('Clear')).toBeVisible();
		await expect(page.getByRole('option')).toHaveCount(0);

		// Was the option marked as selected?
		await modelCombobox.click();
		await expect(page.getByRole('option')).toHaveCount(3);
		await expect(
			page.locator('[aria-selected=true]', { hasText: MOCK_API_TAGS_RESPONSE.models[0].name })
		).toBeVisible();
		await expect(
			page.locator('[aria-selected=true]', { hasText: MOCK_API_TAGS_RESPONSE.models[1].name })
		).not.toBeVisible();

		// Clear selection using X button
		await page.getByTitle('Clear').click();
		await expect(modelCombobox).toHaveValue('');

		// Select an option again
		await page.getByRole('option', { name: MOCK_API_TAGS_RESPONSE.models[1].name }).click();
		await expect(modelCombobox).toHaveValue(MOCK_API_TAGS_RESPONSE.models[1].name);

		// Clear selection by deleting input content
		await modelCombobox.fill('');
		await expect(modelCombobox).toHaveValue('');
		// The value is still selected
		await expect(page.getByTitle('Clear')).toBeVisible();
		// The placeholder is set to the previous selected value
		await expect(modelCombobox).toHaveAttribute(
			'placeholder',
			MOCK_API_TAGS_RESPONSE.models[1].name
		);

		// Click outside the comboboxto apply the cleared value
		await page.keyboard.press('Escape');
		await expect(modelCombobox).toHaveValue('');
		await expect(modelCombobox).toHaveAttribute('placeholder', 'Search');
		await expect(page.getByRole('option')).toHaveCount(0);
		await expect(page.getByTitle('Clear')).not.toBeVisible();
	});
});
