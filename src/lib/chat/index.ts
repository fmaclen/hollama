import type { ErrorResponse, ProgressResponse, PullRequest, StatusResponse } from 'ollama/browser';
import { get } from 'svelte/store';

import { sessionsStore, settingsStore } from '$lib/localStorage';
import type { Model } from '$lib/settings';

import { type OllamaOptions } from './ollama';

export interface Message {
	role: 'user' | 'assistant' | 'system';
	content: string;
	images?: string[]; // Optional array of base64 image strings
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
