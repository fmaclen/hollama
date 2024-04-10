import { expect, test } from '@playwright/test';
import { MOCK_API_TAGS_RESPONSE } from './utils';

test.beforeEach(async ({ page }) => {
  // Enable request interception and mock the API response
  await page.route('**/api/tags', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_API_TAGS_RESPONSE)
    });
  });
});

test('creates new session', async ({ page }) => {
  await page.goto('/');
  await page.click('button[data-melt-select-trigger]'); // Open model list
  await page.click('div[role="option"]:has-text("gemma:7b")'); // Select model
  await expect(page.getByTestId('session-id')).not.toBeVisible();
  await expect(page.getByTestId('model-name')).not.toBeVisible();
  
  await page.getByText('New session').click();
  await expect(page.getByTestId('session-id')).toBeVisible();
  await expect(page.getByTestId('session-id')).toHaveText(/Session #[a-z0-9]{2,8}/);
  await expect(page.getByTestId('model-name')).toBeVisible();
  await expect(page.getByTestId('model-name')).toHaveText('gemma:7b');
  await expect(page.getByPlaceholder('Prompt')).toBeVisible();
  await expect(page.getByPlaceholder('Prompt')).toHaveText('');
  await expect(page.getByText('Send')).toBeVisible();
  await expect(page.getByText('Send')).toBeDisabled();
  
  await page.getByPlaceholder('Prompt').fill('Who would win in a fight between Emma Watson and Jessica Alba?');
  await expect(page.getByText('Send')).not.toBeDisabled();
});

// test('sends user prompt and receives AI response', async ({ page }) => {
//   // TODO: Implement the test
// });

// test('handles API error when generating AI response', async ({ page }) => {
//   // TODO: Implement the test
// });

// test('auto-scrolls to the bottom when new messages are added', async ({ page }) => {
//   // TODO: Implement the test
// });

// test('resizes the prompt and chat panes', async ({ page }) => {
//   // TODO: Implement the test
// });

// test('disables the "Send" button when the prompt is empty', async ({ page }) => {
//   // TODO: Implement the test
// });

// test('submits the prompt when pressing Enter key', async ({ page }) => {
//   // TODO: Implement the test
// });

// test('displays system message when an error occurs', async ({ page }) => {
//   // TODO: Implement the test
// });
