import { get } from 'svelte/store';
import { settingsStore } from '$lib/store';
import type { ChatRequest, ListResponse } from 'ollama/browser';

export async function ollamaChat(payload: ChatRequest, abortSignal: AbortSignal) {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');

	return await fetch(`${settings.ollamaServer}/api/chat`, {
		method: 'POST',
		headers: { 'Content-Type': 'text/event-stream' },
		body: JSON.stringify(payload),
		signal: abortSignal
	});
}

export async function ollamaTags() {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No Ollama server specified');

	const response = await fetch(`${settings.ollamaServer}/api/tags`);
	if (!response.ok) throw new Error('Failed to fetch Ollama tags');

	return response.json() as Promise<ListResponse>;
}
