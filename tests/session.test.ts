import { expect, test } from '@playwright/test';
import { MOCK_SESSION_1_RESPONSE_1, MOCK_SESSION_1_RESPONSE_2, MOCK_SESSION_2_RESPONSE_1, chooseModelFromSettings, mockCompletionResponse, mockTagsResponse } from './utils';

test.beforeEach(async ({ page }) => {
  await mockTagsResponse(page);
});

test('creates new session and chats', async ({ page }) => {
  const sessionIdLocator = page.getByTestId('session-id');
  const modelNameLocator = page.getByTestId('model-name');
  const newSessionButton = page.getByText('New session');
  const promptTextarea = page.getByPlaceholder('Prompt');
  const sendButton = page.getByText('Send');
  const articleLocator = page.locator('article');

  await page.goto('/');
  await chooseModelFromSettings(page, 'gemma:7b');
  await expect(sessionIdLocator).not.toBeVisible();
  await expect(modelNameLocator).not.toBeVisible();

  await newSessionButton.click();
  await expect(sessionIdLocator).toBeVisible();
  await expect(sessionIdLocator).toHaveText(/Session #[a-z0-9]{2,8}/);
  await expect(modelNameLocator).toBeVisible();
  await expect(modelNameLocator).toHaveText('gemma:7b');
  await expect(promptTextarea).toBeVisible();
  await expect(promptTextarea).toHaveValue('');
  await expect(sendButton).toBeVisible();
  await expect(sendButton).toBeDisabled();

  await promptTextarea.fill('Who would win in a fight between Emma Watson and Jessica Alba?');
  await expect(sendButton).toBeEnabled();
  await expect(page.locator('article', { hasText: 'I am unable to provide subjective or speculative information, including fight outcomes between individuals.' })).not.toBeVisible();

  await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_1);
  await sendButton.click();
  await expect(page.locator('article', { hasText: 'I am unable to provide subjective or speculative information, including fight outcomes between individuals.' })).toBeVisible();

  await promptTextarea.fill("I understand, it's okay");
  await expect(page.locator('article', { hasText: 'No problem! If you have any other questions or would like to discuss something else, feel free to ask' })).not.toBeVisible();
  await expect(page.locator('article', { hasText: "I understand, it's okay" })).not.toBeVisible();

  await mockCompletionResponse(page, MOCK_SESSION_1_RESPONSE_2);
  await page.keyboard.press('Enter');
  await expect(page.locator('article', { hasText: "I understand, it's okay" })).toBeVisible();
  await expect(page.locator('article', { hasText: 'No problem! If you have any other questions or would like to discuss something else, feel free to ask' })).toBeVisible();
  await expect(page.getByText('AI')).toHaveCount(2);
  expect(await page.getByText('You').count()).toBeGreaterThan(1);

  // Check the session is saved to localStorage
  await newSessionButton.click();
  await expect(articleLocator).toHaveCount(0);

  await page.goBack();
  await expect(articleLocator).toHaveCount(4);
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
