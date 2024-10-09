import type { ChatRequest, ModelResponse } from 'ollama/browser';
import { get } from 'svelte/store';

import { sessionsStore, settingsStore } from '$lib/localStorage';

import { OllamaStrategy } from './ollama';
import { OpenAIStrategy } from './openai';

export interface Model extends ModelResponse {
	// TODO new interface
	api: 'ollama' | 'openai';
}

export interface ChatStrategy {
	chat(payload: any, abortSignal: AbortSignal, onChunk: (content: string) => void): Promise<void>;

	getModels(): Promise<any>;

	pull?(payload: any, onChunk: (progress: any) => void): Promise<void>;
}

function getChatStrategy(model: Model): ChatStrategy {
	if (model.api === 'ollama') return new OllamaStrategy();
	else if (model.api === 'openai') return new OpenAIStrategy();

	throw new Error('Invalid model specified');
}

interface ChatParams {
	model: Model;
	payload: ChatRequest;
	abortSignal: AbortSignal;
	onChunk: (content: string) => void;
}

export async function chat({ model, payload, abortSignal, onChunk }: ChatParams): Promise<void> {
	const strategy = getChatStrategy(model);
	return strategy.chat(payload, abortSignal, onChunk);
}

export async function listModels(): Promise<Model[]> {
	const ollamaModels = await new OllamaStrategy()
		.getModels()
		.then((models) => models.models)
		.catch(() => []);
	const openaiModels = await new OpenAIStrategy().getModels().catch(() => []);

	return [...ollamaModels, ...openaiModels].sort((a, b) => {
		const nameA = a.name;
		const nameB = b.name;
		// Compare ignoring case and accents
		return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
	});
}

export function getLastUsedModels(): Model[] {
	const currentSessions = get(sessionsStore);
	const models = get(settingsStore)?.models;
	if (!models) return [];

	const lastUsedModels: Model[] = [];

	for (const session of currentSessions) {
		if (lastUsedModels.find((m) => m.name === session.model)) continue;

		const model = models.find((model) => model.name === session.model);
		if (!model) continue;
		lastUsedModels.push(model);

		if (lastUsedModels.length >= 5) break;
	}

	return lastUsedModels;
}
