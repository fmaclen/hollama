import { get } from 'svelte/store';
import { settingsStore } from '$lib/store';
import type { ChatRequest, ChatResponse, ListResponse } from 'ollama/browser';

export async function ollamaChat(
	payload: ChatRequest,
	abortSignal: AbortSignal,
	onChunk: (content: string) => void
) {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');

	const response = await fetch(`${settings.ollamaServer}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'text/event-stream' },
		body: JSON.stringify(payload),
		signal: abortSignal
	});

	if (!response.body) throw new Error('Ollama response is missing body');

	const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
	let isCompletionDone = false;

	while (!isCompletionDone) {
		const { value, done } = await reader.read();

		if (done) {
			isCompletionDone = true;
			break;
		}

		if (!response.ok && value) throw new Error(JSON.parse(value).error);
		if (!value) continue;

		const chatResponses = value.split('\n').filter((line) => line);

		for (const chatResponse of chatResponses) {
			const { message } = JSON.parse(chatResponse) as ChatResponse;
			onChunk(message.content);
		}
	}
}

export async function ollamaTags() {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');

	const response = await fetch(`${settings.ollamaServer}/api/tags`);
	if (!response.ok) throw new Error('Failed to fetch Ollama tags');

	return response.json() as Promise<ListResponse>;
}
