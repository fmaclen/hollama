import { expect, test, type Locator } from '@playwright/test';

import {
    chooseModel,
    MOCK_API_TAGS_RESPONSE,
    MOCK_RESPONSE_WITH_REASONING,
    MOCK_STREAMED_THINK_TAGS,
    MOCK_STREAMED_THOUGHT_TAGS,
    MOCK_STREAMED_MIXED_TAGS,
    MOCK_COMPLEX_NESTED_TAGS,
    mockCompletionResponse,
    mockStreamedCompletionResponse,
    mockOllamaModelsResponse
} from './utils';

// Increase the test timeout and add slowMo option
const slowMoValue = 300; // milliseconds to slow down each step

// Use slowMo for all tests in this file
test.use({ 
    launchOptions: { slowMo: slowMoValue } 
});

test.describe('Session response tag parsing', () => {
    let promptTextarea: Locator;

    // Set longer timeouts for slower streaming demos
    test.setTimeout(30000);
    
    test.beforeEach(async ({ page }) => {
        await mockOllamaModelsResponse(page);
        promptTextarea = page.locator('.prompt-editor__textarea');
    });

    test('handles standard <think> tags in responses', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Sessions', { exact: true }).click();
        await page.getByTestId('new-session').click();

        await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
        await mockCompletionResponse(page, MOCK_RESPONSE_WITH_REASONING);
        await promptTextarea.fill('How should I test my code?');
        await page.getByText('Run').click();

        // Check that the main content is displayed without the think tags
        await expect(page.locator('article').last()).toContainText(
            'Here is how you can test your code effectively:'
        );
        
        // Verify tags aren't visible
        await expect(page.getByText('<think>')).not.toBeVisible();
        await expect(page.getByText('</think>')).not.toBeVisible();

        // Check reasoning content and toggle
        await expect(page.getByRole('button', { name: 'Reasoning' })).toBeVisible();
        await page.getByRole('button', { name: 'Reasoning' }).click();
        await expect(page.locator('.article--reasoning')).toBeVisible();
        await expect(page.locator('.article--reasoning')).toHaveText(
            'Let me analyze this request carefully. The user is asking about code testing, which requires a structured response.'
        );
    });

    test('handles streamed <think> tags (character by character)', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Sessions', { exact: true }).click();
        await page.getByTestId('new-session').click();

        await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
        
        // Set up fake streaming before filling the prompt
        await mockStreamedCompletionResponse(page, MOCK_STREAMED_THINK_TAGS, 30);
        
        // Now fill and submit the prompt
        await promptTextarea.fill('How should I test my code?');
        await page.getByText('Run').click();

        // Wait for the completion to finish - it will show "This is outside a tag" at the end
        await expect(page.locator('.article--assistant')).toBeVisible();
        
        // Need to wait for all streaming chunks to complete
        await page.waitForFunction(() => {
            // Find the assistant's message container
            const assistantEl = document.querySelector('.article--assistant');
            // Check if it contains our final text
            return assistantEl && assistantEl.textContent && 
                   assistantEl.textContent.includes('This is outside a tag');
        });

        // Now test that tags are stripped
        await expect(page.getByText('<think>')).not.toBeVisible();
        await expect(page.getByText('</think>')).not.toBeVisible();
        
        // Check reasoning button and content
        await expect(page.getByRole('button', { name: 'Reasoning' })).toBeVisible();
        await page.getByRole('button', { name: 'Reasoning' }).click();
        await expect(page.locator('.article--reasoning')).toBeVisible();
        await expect(page.locator('.article--reasoning')).toHaveText('This is in a thinking tag');
    });

    test('handles streamed <thought> tags (character by character)', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Sessions', { exact: true }).click();
        await page.getByTestId('new-session').click();

        await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
        
        // Set up fake streaming before filling the prompt
        await mockStreamedCompletionResponse(page, MOCK_STREAMED_THOUGHT_TAGS, 30);
        
        // Now fill and submit the prompt
        await promptTextarea.fill('How should I test my code?');
        await page.getByText('Run').click();

        // Wait for the completion to finish - it will show "This is outside a tag" at the end
        await expect(page.locator('.article--assistant')).toBeVisible();
        
        // Need to wait for all streaming chunks to complete
        await page.waitForFunction(() => {
            // Find the assistant's message container
            const assistantEl = document.querySelector('.article--assistant');
            // Check if it contains our final text
            return assistantEl && assistantEl.textContent && 
                   assistantEl.textContent.includes('This is outside a tag');
        });

        // Now test that tags are stripped
        await expect(page.getByText('<thought>')).not.toBeVisible();
        await expect(page.getByText('</thought>')).not.toBeVisible();
        
        // Check reasoning button and content
        await expect(page.getByRole('button', { name: 'Reasoning' })).toBeVisible();
        await page.getByRole('button', { name: 'Reasoning' }).click();
        await expect(page.locator('.article--reasoning')).toBeVisible();
        await expect(page.locator('.article--reasoning')).toHaveText('This is in a thought tag');
    });

    test('handles multiple alternating tag types in a single response', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Sessions', { exact: true }).click();
        await page.getByTestId('new-session').click();

        await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
        
        // Set up fake streaming before filling the prompt
        await mockStreamedCompletionResponse(page, MOCK_STREAMED_MIXED_TAGS, 50);
        
        // Now fill and submit the prompt
        await promptTextarea.fill('Give me reasoning from different tag types');
        await page.getByText('Run').click();

        // Wait for the completion to finish - wait for final content text
        await expect(page.locator('.article--assistant')).toBeVisible();
        
        // Need to wait for all streaming chunks to complete
        await page.waitForFunction(() => {
            // Find the assistant's message container
            const assistantEl = document.querySelector('.article--assistant');
            // Check if it contains our final text
            return assistantEl && assistantEl.textContent && 
                   assistantEl.textContent.includes('Final content');
        });

        // Check final content - should contain content outside tags
        await expect(page.locator('.article--assistant')).toContainText('Some content between tags');
        
        // Should not contain any visible tags
        await expect(page.getByText('<think>')).not.toBeVisible();
        await expect(page.getByText('</think>')).not.toBeVisible();
        await expect(page.getByText('<thought>')).not.toBeVisible();
        await expect(page.getByText('</thought>')).not.toBeVisible();
        
        // Toggle on reasoning
        await expect(page.getByRole('button', { name: 'Reasoning' })).toBeVisible();
        await page.getByRole('button', { name: 'Reasoning' }).click();
        await expect(page.locator('.article--reasoning')).toBeVisible();
        
        // Should contain both types of reasoning content
        await expect(page.locator('.article--reasoning')).toContainText('First think block');
        await expect(page.locator('.article--reasoning')).toContainText('Second thought block');
    });

    test('correctly handles nested or partial tag patterns', async ({ page }) => {
        await page.goto('/');
        await page.getByText('Sessions', { exact: true }).click();
        await page.getByTestId('new-session').click();

        await chooseModel(page, MOCK_API_TAGS_RESPONSE.models[0].name);
        
        // Set up fake streaming before filling the prompt
        await mockStreamedCompletionResponse(page, MOCK_COMPLEX_NESTED_TAGS, 50);
        
        // Now fill and submit the prompt
        await promptTextarea.fill('Show me complex nested tags');
        await page.getByText('Run').click();

        // Wait for the completion to finish - wait for final content text
        await expect(page.locator('.article--assistant')).toBeVisible();
        
        // Need to wait for all streaming chunks to complete
        await page.waitForFunction(() => {
            // Find the assistant's message container
            const assistantEl = document.querySelector('.article--assistant');
            // Check if it contains our final text
            return assistantEl && assistantEl.textContent && 
                   assistantEl.textContent.includes('Final content here');
        });

        // Check content outside tags is visible
        await expect(page.locator('.article--assistant')).toContainText('Some regular content here');
        
        // Toggle on reasoning
        await expect(page.getByRole('button', { name: 'Reasoning' })).toBeVisible();
        await page.getByRole('button', { name: 'Reasoning' }).click();
        await expect(page.locator('.article--reasoning')).toBeVisible();
        
        // Verify reasoning content has all tag contents correctly extracted
        await expect(page.locator('.article--reasoning')).toContainText(
            'I need to give this some thought about the question'
        );
        await expect(page.locator('.article--reasoning')).toContainText(
            'I think the answer is 42'
        );
    });
}); 
