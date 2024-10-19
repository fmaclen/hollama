import type { ErrorResponse, ProgressResponse, PullRequest, StatusResponse } from 'ollama/browser';
import { get } from 'svelte/store';

import { sessionsStore, settingsStore } from '$lib/localStorage';

import { OllamaStrategy, type OllamaOptions } from './ollama';
import { OpenAIStrategy } from './openai';

export interface Model {
	api: 'ollama' | 'openai';
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
	const ollamaModels = await new OllamaStrategy().getModels().catch(() => []);
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
