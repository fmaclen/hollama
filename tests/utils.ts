import type { OllamaCompletionResponse, OllamaTagResponse } from "$lib/ollama";
import type { Page, Route } from "@playwright/test";

export const MOCK_API_TAGS_RESPONSE: OllamaTagResponse = {
	models: [
		{
			name: 'gemma:7b',
			model: 'gemma:7b',
			modified_at: '2024-04-08T21:41:35.217983842-04:00"',
			size: 5011853225,
			digest: 'a72c7f4d0a15522df81486d13ce432c79e191bda2558d024fbad4362c4f7cbf8',
			details: {
				parent_model: '',
				format: 'gguf',
				family: 'gemma',
				families: ["gemma"],
				parameter_size: '9B',
				quantization_level: 'Q4_0'
			}
		},
		{
			name: "openhermes2.5-mistral:latest",
			model: "openhermes2.5-mistral:latest",
			modified_at: "2023-12-01T10:06:18.679361519-05:00",
			size: 4108928240,
			digest: "ca4cd4e8a562465d7cf0512fc4d4dff3407f07800b01c9a6ee9dd107001704b9",
			details: {
				parent_model: "",
				format: "gguf",
				family: "llama",
				families: null,
				parameter_size: "7B",
				quantization_level: "Q4_0"
			}
		}
	]
};

export const MOCK_SESSION_1_RESPONSE_1: OllamaCompletionResponse = {
	model: "gemma:7b",
	created_at: "2024-04-10T22:54:40.310905Z",
	response: "I am unable to provide subjective or speculative information, including fight outcomes between individuals.",
	done: true,
	context: [
		106,
		1645,
		108,
		6571,
		1134,
		3709,
		575,
		476,
		5900,
		1865,
		29349,
		29678,
		578,
		36171,
		68187,
		235336,
		107,
		108,
		106,
		2516,
		108,
		235285,
		1144,
		14321,
		577,
		3658,
		45927,
		689,
		85979,
		2113,
		235269,
		3359,
		5900,
		18701,
		1865,
		9278,
		235265,
		107,
		108
	],
	total_duration: 564546083,
	load_duration: 419166,
	prompt_eval_count: 18,
	prompt_eval_duration: 267210000,
	eval_count: 17,
	eval_duration: 296374000,
};

export const MOCK_SESSION_1_RESPONSE_2: OllamaCompletionResponse = {
	model: "gemma:7b",
	created_at: "2024-04-10T23:08:33.419483Z",
	response: "No problem! If you have any other questions or would like to discuss something else, feel free to ask.",
	done: true,
	context: [
		106,
		1645,
		108,
		6571,
		1134,
		3709,
		575,
		476,
		5900,
		1865,
		29349,
		29678,
		578,
		36171,
		68187,
		235336,
		107,
		108,
		106,
		2516,
		108,
		235285,
		1144,
		14321,
		577,
		3658,
		45927,
		689,
		85979,
		2113,
		235269,
		3359,
		5900,
		18701,
		1865,
		9278,
		235265,
		107,
		108,
		106,
		1645,
		108,
		235285,
		3508,
		235269,
		665,
		235303,
		235256,
		12763,
		107,
		108,
		106,
		2516,
		108,
		1294,
		3210,
		235341,
		1927,
		692,
		791,
		1089,
		1156,
		3920,
		689,
		1134,
		1154,
		577,
		9742,
		2775,
		1354,
		235269,
		2375,
		2223,
		577,
		5291,
		235265,
		107,
		108
	],
	total_duration: 1574338000,
	load_duration: 1044484792,
	prompt_eval_count: 55,
	prompt_eval_duration: 130165000,
	eval_count: 23,
	eval_duration: 399362000,
};

export const MOCK_SESSION_2_RESPONSE_1: OllamaCompletionResponse = {
	model: "openhermes2.5-mistral:latest",
	created_at: "2024-04-11T12:50:18.826017Z",
	response: 'The fox says various things, such as "ring-a-ding-ding," "bada bing-bing" and "higglety-pigglety pop.',
	done: true,
	context: [123,4567,890],
	total_duration: 8048965583,
	load_duration: 5793693500,
	prompt_eval_count: 22,
	prompt_eval_duration: 73410000,
	eval_count: 142,
	eval_duration: 2181595000
}

export async function chooseModelFromSettings(page: Page, modelName: string) {
	await page.getByTitle('Settings').click();
	await page.locator('button[data-melt-select-trigger]').click();
	await page.click(`div[role="option"]:has-text('${modelName}')`);
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

export async function mockCompletionResponse(page: Page, response: OllamaCompletionResponse) {
	await page.route('**/generate', async (route: Route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(response)
		});
	});
}
