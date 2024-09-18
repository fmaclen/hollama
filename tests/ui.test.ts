import { expect, test } from '@playwright/test';

import {
	chooseFromCombobox,
	MOCK_API_TAGS_RESPONSE,
	MOCK_SESSION_1_RESPONSE_1,
	mockCompletionResponse,
	mockTagsResponse
} from './utils';

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

		// Check that the groups are visible
		await expect(page.getByText('Recently used models', { exact: true })).toBeVisible();
		await expect(page.getByText('Other models', { exact: true })).toBeVisible();

		// Check that all options are visible
		await expect(page.getByRole('option')).toHaveCount(MOCK_API_TAGS_RESPONSE.models.length);

		// Filter options
		await modelCombobox.fill('nonexistentmodel');
		await expect(page.getByText('No results')).toBeVisible();

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

	test('models are correctly grouped and sorted', async ({ page }) => {
		const newSessionButton = page.getByTestId('new-session');
		await mockTagsResponse(page);
		await page.goto('/settings');

		await page.getByText('Sessions', { exact: true }).click();
		await newSessionButton.click();

		// Mock a session with a specific model
		await expect(page.getByText('Run')).toBeDisabled();
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page
			.locator('.prompt-editor__textarea')
			.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await chooseFromCombobox(page, 'Available models', MOCK_API_TAGS_RESPONSE.models[1].name);
		await expect(page.getByText('Run')).toBeEnabled();
		await page.getByText('Run').click();

		// Create another session with a different model
		await newSessionButton.click();
		await expect(page.getByText('Run')).toBeDisabled();
		await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
		await page
			.locator('.prompt-editor__textarea')
			.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
		await chooseFromCombobox(page, 'Available models', MOCK_API_TAGS_RESPONSE.models[0].name);
		await expect(page.getByText('Run')).toBeEnabled();
		await page.getByText('Run').click();

		await newSessionButton.click();
		const modelCombobox = page.getByLabel('Available models');
		await modelCombobox.click();

		// Check for "Recently used models" group
		const recentlyUsedModelsGroup = page.locator('.field-combobox-group', {
			hasText: 'Recently used models'
		});
		const recentlyUsedModels = recentlyUsedModelsGroup.locator('.field-combobox-item-label-option');
		await expect(recentlyUsedModels).toHaveCount(2);
		await expect(recentlyUsedModels.nth(0)).toHaveText(MOCK_API_TAGS_RESPONSE.models[0].name);
		await expect(recentlyUsedModels.nth(1)).toHaveText(MOCK_API_TAGS_RESPONSE.models[1].name);

		// Check for "Other models" group
		const otherModelsGroup = page.locator('.field-combobox-group', {
			hasText: 'Other models'
		});
		await expect(otherModelsGroup).toHaveCount(1);
		await expect(otherModelsGroup).toContainText(MOCK_API_TAGS_RESPONSE.models[2].name);
	});
});
