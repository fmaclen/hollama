import type { Locator, Page, Route } from '@playwright/test';
import type { ChatResponse, ListResponse } from 'ollama/browser';

import type { Knowledge } from '$lib/knowledge';

export const MOCK_API_TAGS_RESPONSE: ListResponse = {
	models: [
		{
			name: 'TheBloke/CodeLlama-70B-Python-AWQ',
			modified_at: new Date('2023-12-01T10:06:18.679361519-05:00'),
			size: 4108928240,
			digest: 'ca4cd4e8a562465d7cf0512fc4d4dff3407f07800b01c9a6ee9dd107001704b9',
			details: {
				parent_model: '',
				format: 'gguf',
				family: 'llama',
				families: [],
				parameter_size: '70B',
				quantization_level: 'Q4_0'
			},
			expires_at: new Date(),
			size_vram: 4108928240
		},
		{
			name: 'gemma:7b',
			modified_at: new Date('2024-04-08T21:41:35.217983842-04:00'),
			size: 5011853225,
			digest: 'a72c7f4d0a15522df81486d13ce432c79e191bda2558d024fbad4362c4f7cbf8',
			details: {
				parent_model: '',
				format: 'gguf',
				family: 'gemma',
				families: ['gemma'],
				parameter_size: '9B',
				quantization_level: 'Q4_0'
			},
			expires_at: new Date(),
			size_vram: 5011853225
		},
		{
			name: 'openhermes2.5-mistral:latest',
			modified_at: new Date('2023-12-01T10:06:18.679361519-05:00'),
			size: 4108928240,
			digest: 'ca4cd4e8a562465d7cf0512fc4d4dff3407f07800b01c9a6ee9dd107001704b9',
			details: {
				parent_model: '',
				format: 'gguf',
				family: 'llama',
				families: [],
				parameter_size: '7B',
				quantization_level: 'Q4_0'
			},
			expires_at: new Date(),
			size_vram: 4108928240
		}
	]
};

export const MOCK_SESSION_1_RESPONSE_1: ChatResponse = {
	model: 'gemma:7b',
	created_at: new Date('2024-04-10T22:54:40.310905Z'),
	message: {
		role: 'assistant',
		content:
			'I am unable to provide subjective or speculative information, including fight outcomes between individuals.'
	},
	done: true,
	done_reason: 'stop',
	total_duration: 564546083,
	load_duration: 419166,
	prompt_eval_count: 18,
	prompt_eval_duration: 267210000,
	eval_count: 17,
	eval_duration: 296374000
};

export const MOCK_SESSION_1_RESPONSE_2: ChatResponse = {
	model: 'gemma:7b',
	created_at: new Date('2024-04-10T23:08:33.419483Z'),
	message: {
		role: 'assistant',
		content:
			'No problem! If you have any other questions or would like to discuss something else, feel free to ask.'
	},
	done: true,
	done_reason: 'stop',
	total_duration: 1574338000,
	load_duration: 1044484792,
	prompt_eval_count: 55,
	prompt_eval_duration: 130165000,
	eval_count: 23,
	eval_duration: 399362000
};

export const MOCK_SESSION_1_RESPONSE_3: ChatResponse = {
	model: 'gemma:7b',
	created_at: new Date('2024-04-10T23:08:33.419483Z'),
	message: {
		role: 'assistant',
		content:
			"Here's a basic function that takes the age, height, weight, and fighting experience of both individuals as input and returns the difference between their ages, heights, and weights.\n\n```python\ndef calculate_odds(emma_age, emma_height, emma_weight, emma_experience, jessica_age, jessica_height, jessica_weight, jessica_experience):\n    emma_stats = {'age': emma_age,\n                 'height': emma_height,\n                 'weight': emma_weight,\n                 'experience': emma_experience}\n    jessica_stats = {'age': jessica_age,\n                     'height': jessica_height,\n                     'weight': jessica_weight,\n                     'experience': jessica_experience}\n\n    # Calculate the differences between their stats\n    age_difference = abs(emma_stats['age'] - jessica_stats['age'])\n    height_difference = abs(emma_stats['height'] - jessica_stats['height'])\n    weight_difference = abs(emma_stats['weight'] - jessica_stats['weight'])\n\n    # Return the differences as a tuple\n    return (age_difference, height_difference, weight_difference)\n```\nYou can use this function to compare Emma Watson and Jessica Alba by providing their respective statistics as inputs."
	},
	done: true,
	done_reason: 'stop',
	total_duration: 1574338000,
	load_duration: 1044484792,
	prompt_eval_count: 55,
	prompt_eval_duration: 130165000,
	eval_count: 23,
	eval_duration: 399362000
};

export const MOCK_SESSION_2_RESPONSE_1: ChatResponse = {
	model: 'openhermes2.5-mistral:latest',
	created_at: new Date('2024-04-11T12:50:18.826017Z'),
	message: {
		role: 'assistant',
		content:
			'The fox says various things, such as "ring-a-ding-ding," "bada bing-bing" and "higglety-pigglety pop.'
	},
	done: true,
	done_reason: 'stop',
	total_duration: 8048965583,
	load_duration: 5793693500,
	prompt_eval_count: 22,
	prompt_eval_duration: 73410000,
	eval_count: 142,
	eval_duration: 2181595000
};

export const MOCK_OPENAI_MODELS = [
	{ id: 'gpt-3.5-turbo', object: 'model', created: 1677610602, owned_by: 'openai' },
	{ id: 'gpt-4', object: 'model', created: 1687882411, owned_by: 'openai' },
	{ id: 'text-davinci-003', object: 'model', created: 1669599635, owned_by: 'openai-internal' }
];

export async function chooseFromCombobox(
	page: Page,
	label: string | RegExp,
	option: string | RegExp
) {
	await page.getByLabel(label, { exact: true }).click();
	await page.getByText(option).click();
}

export async function chooseModel(page: Page, modelName: string) {
	await chooseFromCombobox(page, 'Available models', modelName);
}

export async function mockTagsResponse(page: Page) {
	await page.route('**/api/tags', async (route: Route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(MOCK_API_TAGS_RESPONSE)
		});
	});
}

export async function mockOpenAITagsResponse(page: Page) {
	await page.route('**/v1/models', async (route: Route) => {
		await route.fulfill({ json: { data: MOCK_OPENAI_MODELS } });
	});

	await page.getByLabel('Base URL').fill('https://api.openai.com/v1');
	await page.getByLabel('API Key').fill('sk-validapikey');
	await page.getByRole('button', { name: 'Connect' }).click();
}

export async function mockCompletionResponse(page: Page, response: ChatResponse) {
	await page.route('**/api/chat', async (route: Route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(response)
		});
	});
}

export const MOCK_SESSION_WITH_KNOWLEDGE_RESPONSE_1: ChatResponse = {
	model: 'gemma:7b',
	created_at: new Date('2024-04-11T12:50:18.826017Z'),
	message: {
		role: 'assistant',
		content:
			'Wally has been approved to work from home and plans to have a chatbot answer his emails and text messages. However, Dilbert expresses concern that the automated responses may not sound like him, rendering them useless.'
	},
	done: true,
	done_reason: 'stop',
	total_duration: 8048965583,
	load_duration: 5793693500,
	prompt_eval_count: 22,
	prompt_eval_duration: 73410000,
	eval_count: 142,
	eval_duration: 2181595000
};

export const MOCK_KNOWLEDGE: Knowledge[] = [
	{
		id: 'aaz70i',
		name: 'Slack transcript',
		content:
			"9:31am - wally: I got approval to work from home\n9:32am - wally: my chatbot will answer all of my emails and text messages\n9:32am - dilbert: chatbot answers would be useless\n9:33am - wally: I hope so, otherwise it won't sound like me",
		updatedAt: '2024-07-01T17:19:40.789Z'
	},
	{
		id: 'uv96i4',
		name: 'Hollama: Directory tree',
		content:
			'```\n.\n├── Dockerfile\n├── LICENSE\n├── README.md\n├── build\n├── docs\n├── node_modules\n├── package-lock.json\n├── package.json\n├── playwright.config.ts\n├── postcss.config.cjs\n├── src\n├── static\n├── svelte.config.js\n├── tailwind.config.js\n├── test-results\n├── tests\n├── tsconfig.json\n└── vite.config.ts\n```',
		updatedAt: '2024-07-01T17:17:40.789Z'
	}
];

export async function seedKnowledgeAndReload(page: Page) {
	// To generate the knowledge we need to pass the mocked data to the browser context
	await page.evaluate(
		(data) => window.localStorage.setItem('hollama-knowledge', JSON.stringify(data)),
		MOCK_KNOWLEDGE
	);

	// Reload the page for changes to take effect
	await page.reload();
}

export function textEditorLocator(page: Page, label: string | RegExp | undefined): Locator {
	return page
		.locator('.field')
		.filter({ hasText: label })
		.locator('.text-editor')
		.getByRole('textbox');
}

export async function submitWithKeyboardShortcut(page: Page) {
	const modKey = process.platform === 'darwin' ? 'Meta' : 'Control';
	await page.keyboard.press(`${modKey}+Enter`);
}
