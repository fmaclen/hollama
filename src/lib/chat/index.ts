import type { ErrorResponse, ProgressResponse, PullRequest, StatusResponse } from 'ollama/browser';
import { get } from 'svelte/store';

import { sessionsStore, settingsStore } from '$lib/localStorage';

import { OllamaStrategy, type OllamaOptions } from './ollama';
import { OpenAIStrategy } from './openai';

export interface Model {
	serverId: string;
	name: string;
	size?: number;
	parameterSize?: string;
	modifiedAt?: Date;
}

export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

export interface ChatRequest {
	model: string;
	messages: Message[];
	stream?: boolean;
	options?: Partial<OllamaOptions>;
}

export interface ChatStrategy {
	chat(
		payload: ChatRequest,
		abortSignal: AbortSignal,
		onChunk: (content: string) => void
	): Promise<void>;

	getModels(): Promise<Model[]>;

	pull?(
		payload: PullRequest,
		onChunk: (progress: ProgressResponse | StatusResponse | ErrorResponse) => void
	): Promise<void>;
}

// function getChatStrategy(model: Model): ChatStrategy {
// 	if (model.api === 'ollama') return new OllamaStrategy();
// 	else if (model.api === 'openai') {
// 		const credentials = getOpenAICredentials();
// 		if (!credentials) throw new Error('OpenAI credentials not found');
// 		return new OpenAIStrategy(credentials);
// 	}

// 	throw new Error('Invalid model specified');
// }

interface ChatParams {
	model: Model;
	payload: ChatRequest;
	abortSignal: AbortSignal;
	onChunk: (content: string) => void;
}

// export async function chat({ model, payload, abortSignal, onChunk }: ChatParams): Promise<void> {
// 	const strategy = getChatStrategy(model);
// 	return strategy.chat(payload, abortSignal, onChunk);
// }

export function getLastUsedModels(): Model[] {
	const currentSessions = get(sessionsStore);
	const models = get(settingsStore)?.models;
	if (!models) return [];

	const lastUsedModels: Model[] = [];

	for (const session of currentSessions) {
		if (lastUsedModels.find((m) => m.name === session.model?.name)) continue;

		const model = models.find((model) => model.name === session.model?.name);
		if (!model) continue;
		lastUsedModels.push(model);

		if (lastUsedModels.length >= 5) break;
	}

	return lastUsedModels;
}
