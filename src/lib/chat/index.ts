import type { ChatRequest, ListResponse } from 'ollama/browser';
import { get } from 'svelte/store';

import { settingsStore } from '../localStorage';
import type { ChatStrategy } from './chatStrategy';
import { OllamaStrategy } from './ollamaStrategy';
import { OpenAIStrategy } from './openaiStrategy';

function getChatStrategy(): ChatStrategy {
	const settings = get(settingsStore);
	if (!settings) throw new Error('No settings specified');

	if (settings.apiType === 'ollama') {
		return new OllamaStrategy();
	} else if (settings.apiType === 'openai') {
		return new OpenAIStrategy();
	}

	throw new Error('Invalid API type specified');
}

export async function chat(
	payload: ChatRequest,
	abortSignal: AbortSignal,
	onChunk: (content: string) => void
): Promise<void> {
	const strategy = getChatStrategy();
	return strategy.chat(payload, abortSignal, onChunk);
}

export async function listModels(): Promise<ListResponse> {
	const strategy = getChatStrategy();
	return await strategy.getTags();
}
