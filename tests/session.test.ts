import { expect, test } from '@playwright/test';
import { MOCK_API_TAGS_RESPONSE, MOCK_COMPLETION_RESPONSE_1, MOCK_COMPLETION_RESPONSE_2 } from './utils';
import type { OllamaCompletionResponse } from '$lib/ollama';

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

test('creates new session and chats', async ({ page }) => {
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
  await expect(page.locator('article', {
    hasText: 'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
  })).not.toBeVisible();

  await page.route('**/generate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_COMPLETION_RESPONSE_1)
    });
  });

  await page.getByText('Send').click();
  await expect(page.locator('article', {
    hasText: 'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
  })).toBeVisible();

  await page.getByPlaceholder('Prompt').fill("I understand, it's okay");
  await expect(page.locator('article', {
    hasText: 'No problem! If you have any other questions or would like to discuss something else, feel free to ask'
  })).not.toBeVisible();
  await expect(page.locator('article', { hasText: "I understand, it's okay" })).not.toBeVisible();

  await page.route('**/generate', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(MOCK_COMPLETION_RESPONSE_2)
    });
  });

  await page.keyboard.press('Enter');
  await expect(page.locator('article', { hasText: "I understand, it's okay" })).toBeVisible();
  await expect(page.locator('article', {
    hasText: 'No problem! If you have any other questions or would like to discuss something else, feel free to ask'
  })).toBeVisible();
  await expect(page.getByText('AI')).toHaveCount(2);
  expect(await page.getByText('You').count()).toBeGreaterThan(1);

  // Check the session is saved to localStorage
  await page.getByText('New session').click();
  await expect(page.locator('article')).toHaveCount(0);

  await page.goBack();
  await expect(page.locator('article')).toHaveCount(4);
});

test('generates a random session id', async ({ page }) => {
  await page.goto('/');

  const sessionIds = [];
  const newSessionButton = page.getByText('New session');

  // Check it generates a new session id 3 times in a row
  for (let i = 0; i < 3; i++) {
    const sessionId = await newSessionButton.getAttribute('href');
    expect(sessionId).toMatch(/[a-z0-9]{2,8}/);
    sessionIds.push(sessionId);
    await newSessionButton.click();
  }

  expect(new Set(sessionIds).size).toBe(3);
});

test.skip('handles API error when generating AI response', async ({ page }) => {
  // TODO: Implement the test
});

test.skip('displays system message when an error occurs', async ({ page }) => {
  // TODO: Implement the test
});

test.skip('auto-scrolls to the bottom when new messages are added', async ({ page }) => {
  // TODO: Implement the test
});
