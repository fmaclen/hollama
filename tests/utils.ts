import { expect, type Locator, type Page, type Route } from '@playwright/test';
import type { ChatResponse, ListResponse } from 'ollama/browser';
import type OpenAI from 'openai';

import { ConnectionType, getDefaultServer } from '$lib/connections';
import type { Knowledge } from '$lib/knowledge';

export const MOCK_API_TAGS_RESPONSE: ListResponse = {
	models: [
		{
			model: 'TheBloke/CodeLlama-70B-Python-AWQ',
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
			model: 'gemma:7b',
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
			model: 'openhermes2.5-mistral:latest',
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

export const MOCK_RESPONSE_WITH_REASONING: ChatResponse = {
	...MOCK_SESSION_1_RESPONSE_1,
	message: {
		role: 'assistant',
		content:
			'<think>Let me analyze this request carefully. The user is asking about code testing, which requires a structured response.</think>Here is how you can test your code effectively:\n\n1. Write unit tests\n2. Use integration tests\n3. Implement end-to-end testing'
	}
};

// For testing streaming tag parsing
export const MOCK_STREAMED_THINK_TAGS = [
	'<',
	't',
	'h',
	'i',
	'n',
	'k',
	'>',
	'This is in a thinking tag',
	'<',
	'/',
	't',
	'h',
	'i',
	'n',
	'k',
	'>',
	'This is outside a tag'
];

export const MOCK_STREAMED_THOUGHT_TAGS = [
	'<',
	't',
	'h',
	'o',
	'u',
	'g',
	'h',
	't',
	'>',
	'This is in a thought tag',
	'<',
	'/',
	't',
	'h',
	'o',
	'u',
	'g',
	'h',
	't',
	'>',
	'This is outside a tag'
];

export const MOCK_OPENAI_COMPLETION_RESPONSE_1: OpenAI.Chat.Completions.ChatCompletionChunk = {
	model: 'gpt-3.5-turbo',
	created: 1677610602,
	id: 'chatcmpl-78901234567890123456789012345678',
	object: 'chat.completion.chunk',
	choices: [
		{
			index: 0,
			delta: { role: 'assistant', content: MOCK_SESSION_1_RESPONSE_1.message.content },
			finish_reason: null
		}
	]
};

export const MOCK_OPENAI_MODELS: OpenAI.Models.Model[] = [
	{ id: 'gpt-3.5-turbo', object: 'model', created: 1677610602, owned_by: 'openai' },
	{ id: 'gpt-4', object: 'model', created: 1687882411, owned_by: 'openai' },
	{ id: 'text-davinci-003', object: 'model', created: 1669599635, owned_by: 'openai-internal' }
];

export async function chooseFromCombobox(
	page: Page,
	label: string | RegExp,
	option: string | RegExp,
	// If true, use the placeholder instead of the label
	usePlaceholder: boolean = false
) {
	const locator = usePlaceholder
		? page.getByPlaceholder(label, { exact: true })
		: page.getByLabel(label, { exact: true });
	await locator.click();
	await page.getByText(option, { exact: true }).click();
}

export async function chooseModel(page: Page, modelName: string) {
	await chooseFromCombobox(page, 'Available models', modelName);
}

export async function mockOllamaModelsResponse(page: Page) {
	await page.goto('/');

	// Add the default server to the servers list
	await page.evaluate(
		(data) => window.localStorage.setItem('hollama-servers', JSON.stringify(data)),
		[{ ...getDefaultServer(ConnectionType.Ollama) }]
	);

	// Mock the tags response
	await page.route('**/api/tags', async (route: Route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(MOCK_API_TAGS_RESPONSE)
		});
	});

	// Reload the page to load the servers list
	await page.reload();

	// Fetch list of models
	await expect(page.getByText('Verify')).toBeVisible();
	await expect(
		page.getByText('Connection has been verified and is ready to use')
	).not.toBeVisible();
	const useModelsFromThisServerCheckbox = page.getByLabel('Use models from this server');
	await expect(useModelsFromThisServerCheckbox).not.toBeChecked();

	await page.getByText('Verify').click();
	await expect(page.getByText('Connection has been verified and is ready to use')).toBeVisible();
	await expect(useModelsFromThisServerCheckbox).toBeChecked();
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

/**
 * Mocks a streamed completion response by sending chunks one at a time
 * @param page The Playwright page
 * @param chunks Array of string chunks to stream one by one
 * @param delayMs Delay between chunks in milliseconds
 */
export async function mockStreamedCompletionResponse(
	page: Page,
	chunks: string[],
	delayMs: number = 100
) {
	// Import Node's http module
	const http = await import('http');

	// Start a local mock server that streams responses slowly
	const server = http.createServer((req, res) => {
		// Set CORS headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': '3600'
		};

		// Handle preflight OPTIONS request
		if (req.method === 'OPTIONS') {
			res.writeHead(204, corsHeaders);
			res.end();
			return;
		}

		// Set headers for streaming
		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'Transfer-Encoding': 'chunked',
			...corsHeaders
		});

		// First, send an initial empty response
		const initialResponse = {
			...MOCK_SESSION_1_RESPONSE_1,
			message: {
				role: 'assistant',
				content: ''
			},
			done: false
		};
		res.write(JSON.stringify(initialResponse) + '\n');

		let index = 0;

		// Stream each chunk with a delay
		const interval = setInterval(() => {
			if (index < chunks.length) {
				// Create a response object with just the current chunk
				const response = {
					...MOCK_SESSION_1_RESPONSE_1,
					message: {
						role: 'assistant',
						content: chunks[index]
					},
					done: index === chunks.length - 1
				};

				// Send this chunk
				res.write(JSON.stringify(response) + '\n');

				// Move to next chunk
				index++;

				// If this was the last chunk, end the interval and response
				if (index === chunks.length) {
					clearInterval(interval);
					res.end();
				}
			} else {
				// Should not get here, but cleanup just in case
				clearInterval(interval);
				res.end();
			}
		}, delayMs);

		// Clean up the interval if the client disconnects
		req.on('close', () => clearInterval(interval));
	});

	// Start the server on a random port
	const serverStartPromise = new Promise<number>((resolve) => {
		server.listen(0, () => {
			const address = server.address() as { port: number };
			resolve(address.port);
		});
	});

	const port = await serverStartPromise;
	const mockStreamUrl = `http://localhost:${port}`;

	// Intercept the API route and redirect to our local streaming server
	await page.route('**/api/chat', (route) => {
		// Forward the request to our mock streaming server
		route.continue({ url: mockStreamUrl });
	});

	// Ensure the server is closed when the test is done
	page.once('close', () => {
		server.close();
	});
}

// OpenAI mock functions

export async function mockOpenAIModelsResponse(page: Page, models: OpenAI.Models.Model[]) {
	await page.goto('/settings');
	await chooseFromCombobox(page, 'Connection type', 'OpenAI: Official API');
	await page.getByText('Add connection').click();
	await page.getByLabel('API Key').fill('sk-validapikey');
	await page.route('https://api.openai.com/v1/models', async (route: Route) => {
		await route.fulfill({ json: { data: models } });
	});
	await page.getByRole('button', { name: 'Verify', exact: true }).click();
	await expect(page.getByText('Connection has been verified and is ready to use')).toBeVisible();
}

export async function mockOpenAICompletionResponse(
	page: Page,
	responseChunks: OpenAI.Chat.Completions.ChatCompletionChunk
) {
	await page.route('**/v1/chat/completions', async (route: Route) => {
		const encoder = new TextEncoder();
		const chunks = encoder.encode(`data: ${JSON.stringify(responseChunks)}\n\n`);
		const buffer = Buffer.from(chunks);

		await route.fulfill({
			status: 200,
			contentType: 'text/event-stream;charset=UTF-8',
			body: buffer
		});
	});
}

// Knowledge mock functions

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

/**
 * Creates a manual streaming mock server for LLM completion responses, allowing fine-grained control over when and how chunks are sent to the client during Playwright tests.
 *
 * This utility was implemented to enable tests to simulate streaming LLM responses in multiple phases, such as sending only the reasoning portion first, running assertions, and then sending the rest of the completion. This is not possible with the standard mockStreamedCompletionResponse, which streams all chunks in sequence automatically.
 *
 * By using this function, tests can:
 *   - Stream reasoning content, assert UI state (e.g., reasoning block is open)
 *   - Then stream main completion content, assert UI state again (e.g., reasoning block auto-hides)
 *
 * This is especially useful for testing UI logic that depends on the timing and order of streamed content, such as dynamic reasoning blocks that open and close as the LLM responds.
 *
 * Usage:
 *   const stream = await createManualStreamedCompletionMock(page);
 *   await stream.sendChunk('<think>Reasoning</think>', false);
 *   // ...assertions...
 *   await stream.sendChunk('Main content', true);
 *   // ...assertions...
 *   stream.close();
 */
export async function createManualStreamedCompletionMock(page: Page) {
	const http = await import('http');

	let resRef: any = null;
	let isClosed = false;

	const server = http.createServer((req, res) => {
		// Set CORS headers
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': '3600'
		};

		if (req.method === 'OPTIONS') {
			res.writeHead(204, corsHeaders);
			res.end();
			return;
		}

		res.writeHead(200, {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive',
			'Transfer-Encoding': 'chunked',
			...corsHeaders
		});

		// Initial empty response
		const initialResponse = {
			...MOCK_SESSION_1_RESPONSE_1,
			message: { role: 'assistant', content: '' },
			done: false
		};
		res.write(JSON.stringify(initialResponse) + '\n');

		resRef = res;

		req.on('close', () => {
			isClosed = true;
		});
	});

	const serverStartPromise = new Promise<number>((resolve) => {
		server.listen(0, () => {
			const address = server.address() as { port: number };
			resolve(address.port);
		});
	});

	const port = await serverStartPromise;
	const mockStreamUrl = `http://localhost:${port}`;

	await page.route('**/api/chat', (route) => {
		route.continue({ url: mockStreamUrl });
	});

	page.once('close', () => {
		server.close();
	});

	return {
		sendChunk: (content: string, done = false) => {
			if (resRef && !isClosed) {
				const response = {
					...MOCK_SESSION_1_RESPONSE_1,
					message: { role: 'assistant', content },
					done
				};
				resRef.write(JSON.stringify(response) + '\n');
				if (done) {
					resRef.end();
					isClosed = true;
				}
			}
		},
		close: () => {
			if (resRef && !isClosed) {
				resRef.end();
				isClosed = true;
			}
		}
	};
}
